import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import classNames from 'classnames';
import moment from 'moment';

import Halogen from 'halogen';

import PlayIcon from 'common/icons/audio/play';
import PauseIcon from 'common/icons/audio/pause';
import EditIcon from 'common/icons/edit';
import InfoIcon from 'common/icons/info';
import UploadIcon from 'common/icons/upload';
import Volume0Icon from 'common/icons/volume/0';
import Volume1Icon from 'common/icons/volume/1';
import Volume2Icon from 'common/icons/volume/2';
import Volume3Icon from 'common/icons/volume/3';
import ProgressBar from './ProgressBar';
import FlatButton from '../FlatButton';

import './styles.scss';


const getRightButtonIcon = (mode) => {
  switch (mode) {
    case 'edit':
      return <EditIcon />;
    case 'info':
      return <InfoIcon />;
    case 'upload':
      return <UploadIcon />;
    default:
      return null;
  }
};

const formatTimeWithSeconds = (seconds) => {
  const format = seconds >= 3600 ? 'h:mm:ss' : 'm:ss';
  return moment.utc(seconds * 1000).format(format);
};


export default class AudioPlayer extends React.Component {
  static displayName = 'AudioPlayer';

  static propTypes = {
    audioListIndex: PropTypes.number,
    disabled: PropTypes.bool,
    initialVal: PropTypes.number,
    isPlay: PropTypes.bool,
    mode: PropTypes.oneOf([
      'edit',
      'hiddenVolume',
      'info',
      'readonly',
      'upload',
    ]),
    selected: PropTypes.bool,
    title: PropTypes.string,
    url: PropTypes.string,
    onClickContainer: PropTypes.func,
    onClickEditButton: PropTypes.func,
    onClickInfoButton: PropTypes.func,
    onClickUploadButton: PropTypes.func,
    onDoubleClickContainer: PropTypes.func,
    onError: PropTypes.func,
    onPlayButtonClick: PropTypes.func,
  }

  static defaultProps = {
    disabled: false,
    selected: false,
    mode: 'readonly',
    title: '',
  }

  constructor(props) {
    super(props);
    this.audioObj = null;
    this.updateTime = null;
    this.state = {
      seek: 0,
      duration: -1,
      volume: 1,
      isMuted: false,
      isPlaying: false,
    };
  }

  componentWillMount() {
    const { initialVal } = this.props;
    this.setState({ value: initialVal });
  }

  componentDidMount() {
    this.initAudioObject(this.props.url);
    this.container.addEventListener('click', this.handleContainerClick);
    this.container.addEventListener('dblclick', this.handleContainerDoubleClick);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.initAudioObject(nextProps.url);
    }
    if (this.props.isPlay && nextProps.isPlay === false) {
      if (this.state.isPlaying) {
        this.pauseAudio();
      }
    }
  }

  componentWillUnmount() {
    this.clearAudioObject();
    this.container.removeEventListener('click', this.handleContainerClick);
  }

  handleRightButtonClick = (audioListIndex) => {
    if (this.state.isPlaying) {
      this.pauseAudio();
    }

    const {
      mode,
      onClickEditButton,
      onClickInfoButton,
      onClickUploadButton,
    } = this.props;

    switch (mode) {
      case 'edit':
        if (onClickEditButton) onClickEditButton(audioListIndex);
        break;
      case 'info':
        if (onClickInfoButton) onClickInfoButton(audioListIndex);
        break;
      case 'upload':
        if (onClickUploadButton) onClickUploadButton();
        break;
      default:
        break;
    }
  }

  isClickOnFunctionalArea = (target) => {
    const isClickPlayButton = findDOMNode(this.playButton).contains(target);
    const isClickSeekBar = findDOMNode(this.progressBar).contains(target);
    // here could be edit/upload button, but when readonly it cantains null error
    let isClickVolumeButton = false;
    if (this.volumeButton) isClickVolumeButton = findDOMNode(this.volumeButton).contains(target);

    let isClickVolumeSlider = false;
    if (this.volumeProgressBar) isClickVolumeSlider = findDOMNode(this.volumeProgressBar).contains(target);

    let isClickEditButton = false;
    if (this.editButton) isClickEditButton = findDOMNode(this.editButton).contains(target);

    if (isClickPlayButton ||
      isClickVolumeButton ||
      isClickVolumeSlider ||
        isClickEditButton ||
           isClickSeekBar) return true;
    return false;
  }

  handleContainerDoubleClick = ({ target }) => {
    if (this.isClickOnFunctionalArea(target)) return;
    if (this.props.onDoubleClickContainer) this.props.onDoubleClickContainer(this.props.audioListIndex);
  }

  handleContainerClick = ({ target }) => {
    if (this.isClickOnFunctionalArea(target)) return;
    if (this.props.onClickContainer) this.props.onClickContainer(this.props.audioListIndex);
  }

  handleError = (error) => {
    const { onError } = this.props;
    if (onError) onError(error);
  }

  initAudioObject(url) {
    this.clearAudioObject();
    this.audioObj = document.createElement('audio');
    this.audioObj.src = url;
    this.audioObj.preload = 'auto';
    const { volume, isMuted } = this.state;
    this.audioObj.volume = volume;
    this.audioObj.mute = isMuted;
    this.audioObj.ontimeupdate = () => {
      this.setState({ seek: this.audioObj.currentTime });
    };
    this.audioObj.ondurationchange = () => {
      this.setState({ duration: this.audioObj.duration });
    };
    this.audioObj.onplay = () => {
      this.setState({ isPlaying: true });
    };
    this.audioObj.onpause = () => {
      this.setState({ isPlaying: false });
    };
  }

  clearAudioObject() {
    if (!this.audioObj) return;
    this.audioObj.pause();
    this.audioObj.ondurationchange = null;
    this.audioObj.ontimeupdate = null;
    this.audioObj.onplay = null;
    this.audioObj.onpause = null;
    // set null to avoid unmout setState warn
    this.audioObj = null;
    this.setState({ duration: 0 });
  }

  handleSeek = (percent) => {
    if (!this.audioObj) return;
    this.audioObj.currentTime = percent * this.audioObj.duration;
  }

  handlePlayButtonToggle = (e) => {
    if (this.state.isPlaying) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
    if (this.props.onPlayButtonClick) this.props.onPlayButtonClick(this.props.audioListIndex);
  }

  handleMuteButtonToggle = (e) => {
    if (!this.audioObj) return;
    const isMuted = !this.state.isMuted;
    this.setState({ isMuted });
    this.audioObj.muted = isMuted;
  }

  playAudio = () => {
    if (!this.audioObj) return;
    const playPromise = this.audioObj.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => this.handleError(error));
    }
  }

  pauseAudio() {
    if (!this.audioObj || !this.state.isPlaying) return;
    this.audioObj.pause();
  }

  handleVolumeChange = (volume) => {
    if (!this.audioObj) return;
    this.setState({ volume, isMuted: false });
    this.audioObj.volume = this.state.volume;
    this.audioObj.muted = false;
  }

  isLoading = () => this.state.duration < 0;

  render() {
    const { title, mode, selected, disabled, audioListIndex, url } = this.props;
    const { seek, duration, isPlaying, isMuted, volume } = this.state;
    const audioClassName = classNames('audio-player', {
      disabled,
      selected,
    });
    const playPercent = duration > 0 ? seek / duration : 0;
    const rightButtonIcon = getRightButtonIcon(mode);
    let volumeIcon = <Volume0Icon />;
    if (!isMuted) {
      if (volume > 0.25) volumeIcon = <Volume1Icon />;
      if (volume > 0.55) volumeIcon = <Volume2Icon />;
      if (volume > 0.85) volumeIcon = <Volume3Icon />;
    }
    let buttonsWidth = 50;    // play button width
    if (mode !== 'hiddenVolume') buttonsWidth += 165;  // volume bar
    if (rightButtonIcon) buttonsWidth += 50;  // edit button

    return (
      <div
        ref={e => this.container = e}
        className={audioClassName}
      >
        <span className="audio-container">
          <span className="play-button">
            {this.isLoading() ? (
              <Halogen.ClipLoader
                color={'#16A122'}
                size="48px"
              />
            ) : (
              <FlatButton
                ref={e => this.playButton = e}
                icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                onClick={this.handlePlayButtonToggle}
              />
            )}
          </span>
          <span
            className="audio-info"
            style={{ width: `calc(100% - ${buttonsWidth}px)` }}
          >
            <h4 className="audio-title">{title}</h4>
            <div ref={e => this.progressBar = e}>
              <ProgressBar
                percent={playPercent}
                onChange={this.handleSeek}
              />
            </div>
            <span className="time-labels">
              <h5 className="current-time">{formatTimeWithSeconds(seek)}</h5>
              {duration >= 0 && (
                <h5 className="total-time">{formatTimeWithSeconds(duration)}</h5>
              )}
            </span>
          </span>
          {mode !== 'hiddenVolume' &&
            <span className="audio-volume">
              <span className="mute-button">
                <FlatButton
                  ref={e => this.volumeButton = e}
                  className="mute-button"
                  icon={volumeIcon}
                  onClick={this.handleMuteButtonToggle}
                />
              </span>
              <ProgressBar
                ref={e => this.volumeProgressBar = e}
                className="volume-bar"
                percent={isMuted ? 0 : volume}
                onChange={this.handleVolumeChange}
              />
              <br />
            </span>
          }
          {rightButtonIcon &&
            <span className="edit-button">
              <FlatButton
                ref={e => this.editButton = e}
                className="edit-button"
                icon={rightButtonIcon}
                onClick={() => this.handleRightButtonClick(audioListIndex)}
              />
            </span>
          }
        </span>
      </div>
    );
  }
}
