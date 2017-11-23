/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { spring, TransitionMotion } from 'react-motion';

import _get from 'lodash/get';
import classNames from 'classnames';

import './LandingCarousel.styles.scss';


function Slide({ style, library }) {
  return (
    <div className="slide" style={style}>
      <div
        className="bg"
        style={{ backgroundImage: `url("${_get(library, 'bg')}")` }}
      />
      <div
        className="sprite"
        style={{ backgroundImage: `url("${_get(library, 'sprite')}")` }}
      />
    </div>
  );
}

Slide.propTypes = {
  library: PropTypes.object,
  style: PropTypes.object,
};

Slide.getStyle = {
  entering: () => ({ x: 0 }),
  leaving: () => ({ x: spring(120, { stiffness: 100, damping: 35 }) }),
};


function SlideWrapper({ content, position, index }) {
  if (!content || !content.layouts) return null;

  const layouts = [
    content.layouts[index][position],
    content.layouts[(index + 1) % content.layouts.length][position],
  ];

  const slideStyles = layouts.map((libraryId, i) => {
    const isActive = i === 0;
    return {
      key: `${libraryId}`,
      data: {
        libraryId,
      },
      style: Slide.getStyle[isActive ? 'entering' : 'leaving'](),
    };
  });

  // Determine slide left or right
  const xMultiplier = (position === 'left' ? -1 : 1);

  return (
    <div className={classNames('slides', position)}>

      <TransitionMotion
        willEnter={Slide.getStyle.entering}
        willLeave={Slide.getStyle.leaving}
        styles={slideStyles}
      >
        {interpolatedStyles =>
          <div>
            {interpolatedStyles.map(({ key, data, style }) => (
              <Slide
                key={key}
                library={content.libraries[data.libraryId]}
                style={{ transform: `translateX(${style.x * xMultiplier}%)` }}
              />
            ))}
          </div>
        }
      </TransitionMotion>

    </div>
  );
}

SlideWrapper.propTypes = {
  position: PropTypes.oneOf(['left', 'right']).isRequired,
  index: PropTypes.number.isRequired,
  content: PropTypes.object,
};


function Author({ id, name, avatar }) {
  return (
    <a href={`/user/${id}`}>
      <img alt={name} src={avatar} />
      <span>{name}</span>
    </a>
  );
}

Author.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  avatar: PropTypes.string,
};


const CreditsGroup = translate()(({ t, id, authors }) => (
  <div className="library-carousel_credits-group">
    <span className="group-name">{t(`asset:type.${id}`)}</span>
    <ul className="library-carousel_authors">
      {authors.map(author => (
        <li key={author.id}>
          <Author {...author} />
        </li>
      ))}
    </ul>
  </div>
));

CreditsGroup.propTypes = {
  id: PropTypes.string,
  authors: PropTypes.array,
};

CreditsGroup.types = [
  'character',
  'bgimage',
  'image',
  'bgm',
  'se',
];


function Credits({ authors, library, style }) {
  if (!authors || !library) return null;

  return (
    <ul className="library-carousel_credits" style={style}>

      {CreditsGroup.types.map((groupId) => {
        const libraryAuthorIds = library.authors[groupId];
        if (!libraryAuthorIds) return null;

        const libraryAuthors = libraryAuthorIds.map(id => authors[id]);

        return (
          <li key={groupId}>
            <CreditsGroup id={groupId} authors={libraryAuthors} />
          </li>
        );
      })}

    </ul>
  );
}

Credits.propTypes = {
  authors: PropTypes.object,
  library: PropTypes.object,
  style: PropTypes.object,
};

Credits.getStyle = {
  entering: () => ({ opacity: spring(1) }),
  leaving: () => ({ opacity: spring(0) }),
};


function CreditsWrapper({ content, position, index }) {
  if (!content || !content.layouts) return null;

  const layouts = [
    content.layouts[index][position],
    content.layouts[(index + 1) % content.layouts.length][position],
  ];

  const creditsStyles = layouts.map((libraryId, i) => {
    const isActive = i === 0;
    return {
      key: `${libraryId}`,
      data: {
        libraryId,
      },
      style: Credits.getStyle[isActive ? 'entering' : 'leaving'](),
    };
  });

  return (
    <div className={classNames('library-carousel_credits-wrapper', position)}>

      <TransitionMotion
        willEnter={Credits.getStyle.entering}
        willLeave={Credits.getStyle.leaving}
        styles={creditsStyles}
      >
        {interpolatedStyles => (
          <div>
            {interpolatedStyles.map(({ key, data, style }) => (
              <Credits
                key={key}
                authors={content.authors}
                library={content.libraries && content.libraries[data.libraryId]}
                style={style}
              />
            ))}
          </div>
        )}
      </TransitionMotion>

    </div>
  );
}

CreditsWrapper.propTypes = {
  position: PropTypes.oneOf(['left', 'right']).isRequired,
  index: PropTypes.number.isRequired,
  content: PropTypes.object,
};


export default class LandingCarousel extends React.Component {
  static interval = 5000;

  constructor(props) {
    super(props);

    this.state = {
      currentSlideIndex: 0,
    };
  }

  componentDidMount() {
    this._fetchContent();
  }

  componentWillUnmount() {
    if (this._timer) clearInterval(this._timer);
  }

  _fetchContent = async () => {
    /*
    Example of content:
    {
      "layouts": [
        {
          "left": "example",
          "right": "example"
        },
      ],
      "authors": {
        "example": {
          "name": "Example",
          "avatar": "<URL>"
        }
      },
      "libraries": {
        "example": {
          "bg": "<URL>",
          "sprite": "<URL>",
          "authors": {
            "<TYPE>": [
              "example"
            ]
          }
        },
      }
    }
    */
    const content = await firebase.database()
                                  .ref('library-carousel')
                                  .once('value')
                                  .then(snapshot => snapshot.val());

    this.setState({ content }, () => {
      this._timer = setInterval(this._nextSlide, LandingCarousel.interval);
    });
  }

  _nextSlide = () => {
    const { content, currentSlideIndex } = this.state;
    if (content) {
      this.setState({
        currentSlideIndex: (currentSlideIndex + 1) % content.layouts.length,
      });
    }
  }

  render() {
    const { currentSlideIndex, content } = this.state;

    const props = {
      content,
      index: currentSlideIndex,
    };

    return (
      <div className="library-carousel">

        <SlideWrapper {...props} position="left" />
        <SlideWrapper {...props} position="right" />

        {/* Gradient for authors */}
        <div className="gradient-overlay" />

        <div className="library-carousel_credits-panel">
          <CreditsWrapper {...props} position="left" />
          <CreditsWrapper {...props} position="right" />
        </div>

      </div>
    );
  }
}
