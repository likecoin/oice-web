import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import Progress from 'ui-elements/Progress';

import './styles.scss';

@translate()
export default class AudioPlayerList extends React.Component {
  static defaultProps = {
    disabled: false,
    fullWidth: false,
    loading: false,
    selectable: false,
  }

  static propTypes = {
    children: PropTypes.any,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    isInBackGround: PropTypes.bool,
    loading: PropTypes.bool,
    onChange: PropTypes.func,
    onPlay: PropTypes.func,
    onDoubleClick: PropTypes.func,
    selectable: PropTypes.bool,
    selectedIndex: PropTypes.number,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: props.selectedIndex,
      playIndex: -1,
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log('AudioPlayerList componentWillReceiveProps', this.props.isInBackGround, nextProps.isInBackGround);
    this.setState({ selectedIndex: nextProps.selectedIndex });
  }

  handlePlayButtonClick = playIndex => {
    console.debug('Handle handlePlayButtonClick ', playIndex);
    if (this.props.onPlay) this.props.onPlay(playIndex);
    this.setState({ playIndex });
  }
  // means on select the audio player but not click 'functional area'
  handleonClickContainer = (selectedIndex) => {
    if (this.props.onChange) this.props.onChange(selectedIndex);
  }
  handleonDoubleClickContainer = (selectedIndex) => {
    if (this.props.onDoubleClick) this.props.onDoubleClick(selectedIndex);
  }

  createAudio(element, index) {
    const { disabled } = this.props;
    const { selectedIndex, playIndex } = this.state;
    return React.cloneElement(element, {
      key: index,
      audioListIndex: index,
      selected: selectedIndex === index,
      onClickContainer: this.handleonClickContainer,
      onDoubleClickContainer: this.handleonDoubleClickContainer,
      isPlay: index === playIndex,
      disabled: element.props.disabled || disabled,
      onPlayButtonClick: this.handlePlayButtonClick,
    });
  }

  render() {
    const {
      children,
      fullWidth,
      loading,
      t,
    } = this.props;
    const playerList = [];

    // Inject props into children
    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const { displayName } = child.type;
      // console.log('AudioPlayerList ', displayName);
      if (displayName === 'AudioPlayer') {
        playerList.push(this.createAudio(child, index));
      } else {
        return;
      }
    });

    const className = classNames('audio-list', {
      block: fullWidth,
    });

    return (
      <div {...{ className }}>
        {loading &&
          <div className="audio-list-loading-block">
            <span>{t('loadingScreen:label.loading')}</span>
            <Progress />
          </div>
        }
        {playerList}
      </div>
    );
  }
}
