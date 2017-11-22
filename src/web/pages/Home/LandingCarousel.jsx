/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
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
          "authors": ["example"]
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

      </div>
    );
  }
}
