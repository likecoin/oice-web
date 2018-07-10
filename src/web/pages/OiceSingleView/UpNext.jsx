import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';


const UPDATE_INTERVAL = 100;
const INITIAL_OFFSET = 293;

@translate(['oiceSingleView'])
export default class UpNext extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    labelSize: PropTypes.number,
    subtitle: PropTypes.string,
    subtitleSize: PropTypes.number,
    time: PropTypes.number,
    title: PropTypes.string,
    titleSize: PropTypes.number,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    time: 5,
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  handleClick = (e) => {
    if (this.props.onClick) this.props.onClick(e);
  }

  startTimer() {
    const { time } = this.props;
    const offset = (UPDATE_INTERVAL / (time * 1000)) * INITIAL_OFFSET;
    this.timer = setInterval(() => {
      const prevOffset = this.ring.getAttribute('stroke-dashoffset');
      if (prevOffset <= 0) {
        this.handleClick();
        this.stopTimer();
      } else {
        this.ring.setAttribute('stroke-dashoffset', Math.max(prevOffset - offset, 0));
      }
    }, UPDATE_INTERVAL);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  render() {
    const {
      labelSize,
      subtitle,
      subtitleSize,
      t,
      title,
      titleSize,
    } = this.props;
    return (
      <div className="oice-upnext">
        <div className="oice-upnext-info">
          <div
            className="oice-upnext-label"
            style={{ fontSize: labelSize }}
          >
            {t('label.upNext')}
          </div>
          <div
            className="oice-upnext-subtitle"
            style={{ fontSize: subtitleSize }}
          >
            {subtitle}
          </div>
          <div
            className="oice-upnext-title"
            style={{ fontSize: titleSize }}
          >
            {title}
          </div>
          <a
            className="oice-upnext-autoplay-button"
            onClick={this.handleClick}
          >
            <svg
              height={titleSize * 3}
              version="1.1"
              viewBox="0 0 98 98"
              width={titleSize * 3}
            >
              <circle
                className="oice-upnext-autoplay-ring-trail"
                cx="-49"
                cy="49"
                fillOpacity="0"
                r="46.5"
                stroke="#000"
                strokeOpacity="0.4"
                strokeWidth="3"
                transform="rotate(-90)"
              />
              <circle
                ref={ref => this.ring = ref}
                className="oice-upnext-autoplay-ring-progress"
                cx="-49"
                cy="49"
                fillOpacity="0"
                r="46.5"
                stroke="#FFF"
                strokeDasharray={INITIAL_OFFSET}
                strokeDashoffset={INITIAL_OFFSET}
                strokeWidth="3"
                style={{ transition: 'all .1s linear' }}
                transform="rotate(-90)"
              />
              <path
                d="M32,31.00181 C32,28.7916714 33.5680474,27.8624261 35.4972017,28.9234609 L68.5027983,47.0765391 C70.4342495,48.1388372 70.4319526,49.8624261 68.5027983,50.9234609 L35.4972017,69.0765391 C33.5657505,70.1388372 32,69.2069088 32,66.99819 L32,31.00181 Z"
                fill="#FFF"
              />
            </svg>
          </a>
        </div>
      </div>
    );
  }
}
