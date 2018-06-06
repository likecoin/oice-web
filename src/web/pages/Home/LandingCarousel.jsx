import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { spring, TransitionMotion } from 'react-motion';
import { withContentRect } from 'react-measure';

import _get from 'lodash/get';
import classNames from 'classnames';

import firebase from 'common/utils/firebase';

import './LandingCarousel.styles.scss';


function animated(WrappedComponent) {
  return class extends React.Component {
    static propTypes = {
      layouts: PropTypes.array.isRequired,
      enteringStyle: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
      ]),
      leavingStyle: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
      ]),
    }

    render() {
      const {
        layouts,
        enteringStyle,
        leavingStyle,
        ...childrenProps
      } = this.props;

      const transitionStyles = layouts.map((layout, i) => {
        const libraryId = layout[childrenProps.position];
        const isActive = i === 0;
        return {
          key: `${libraryId}`,
          data: {
            libraryId,
          },
          style: isActive ? enteringStyle : leavingStyle,
        };
      }).reverse();

      return (
        <WrappedComponent
          {...childrenProps}
          transitionStyles={transitionStyles}
        />
      );
    }
  };
}


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
  leaving: () => ({ x: spring(150, { stiffness: 100, damping: 35 }) }),
};


const SlideWrapper = animated((props) => {
  const {
    libraries, transitionStyles, position, top,
  } = props;

  // Determine slide left or right
  const xMultiplier = (position === 'left' ? -1 : 1);

  return (
    <div className={classNames('slides', position)} style={{ top }}>

      <TransitionMotion
        willLeave={Slide.getStyle.leaving}
        styles={transitionStyles}
      >
        {interpolatedStyles =>
          <div>
            {interpolatedStyles.map(({ key, data, style }) => (
              <Slide
                key={key}
                library={libraries[data.libraryId]}
                style={{ transform: `translateX(${style.x * xMultiplier}%)` }}
              />
            ))}
          </div>
        }
      </TransitionMotion>

    </div>
  );
});

SlideWrapper.propTypes = {
  libraries: PropTypes.object.isRequired,
  position: PropTypes.oneOf(['left', 'right']).isRequired,
  top: PropTypes.number,
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


const CreditsWrapper = animated((props) => {
  const {
    authors, libraries, transitionStyles, position,
  } = props;

  return (
    <div className={classNames('library-carousel_credits-wrapper', position)}>

      <TransitionMotion
        willLeave={Credits.getStyle.leaving}
        styles={transitionStyles}
      >
        {interpolatedStyles => (
          <div>
            {interpolatedStyles.map(({ key, data, style }) => (
              <Credits
                key={key}
                authors={authors}
                library={libraries[data.libraryId]}
                style={style}
              />
            ))}
          </div>
        )}
      </TransitionMotion>

    </div>
  );
});

CreditsWrapper.propTypes = {
  authors: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  position: PropTypes.oneOf(['left', 'right']).isRequired,
};

@withContentRect('bounds')
export default class LandingCarousel extends React.Component {
  static interval = 5000;

  static propTypes = {
    // Injected by withContentRect HoC
    measureRef: PropTypes.func,
    contentRect: PropTypes.object,
  }

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
    const { measureRef, contentRect } = this.props;
    const { currentSlideIndex, content } = this.state;

    if (!content || !content.layouts) return null;

    const layouts = [
      content.layouts[currentSlideIndex],
      content.layouts[(currentSlideIndex + 1) % content.layouts.length],
    ];

    const { authors, libraries } = content;

    const props = {
      layouts,
      authors,
      libraries,
    };

    const slideProps = {
      ...props,
      top: Math.max(0, _get(contentRect, 'bounds.top', 0)),
      enteringStyle: Slide.getStyle.entering(),
      leavingStyle: Slide.getStyle.leaving(),
    };

    const creditProps = {
      ...props,
      enteringStyle: Credits.getStyle.entering(),
      leavingStyle: Credits.getStyle.leaving(),
    };

    return (
      <div ref={measureRef} className="library-carousel" >

        <SlideWrapper {...slideProps} position="left" />
        <SlideWrapper {...slideProps} position="right" />

        {/* Gradient for authors */}
        <div className="gradient-overlay" />

        <div className="library-carousel_credits-layer">
          <CreditsWrapper {...creditProps} position="left" />
          <CreditsWrapper {...creditProps} position="right" />
        </div>
      </div>
    );
  }
}
