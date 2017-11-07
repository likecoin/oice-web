import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import AudioPlayerList from 'ui-elements/AudioPlayerList';
import AudioPlayer from 'ui-elements/AudioPlayer';
import FlatButton from 'ui-elements/FlatButton';
import Lazyload from 'react-lazy-load';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { closeAudioSelectionModal } from 'editor/actions/modal';

import { getWindowHeight } from 'common/utils';
import { getAudioMp4Url } from 'editor/utils/app';

import {
  updateSelectedItem,
} from './redux';

import './styles.scss';

const getFilterAudio = (props) => {
  const {
    libraries,
    audios,
    selectedIndex, // dropdownList index
  } = props;

  let filteredDatas = [...audios];
  if (audios && selectedIndex === libraries.length) {
    window.location.href = '/store';
    filteredDatas = null;
  } else if (selectedIndex >= 0) {
    const selectedCategory = libraries[selectedIndex];
    filteredDatas = audios.filter(item => item.libraryId === selectedCategory.id);
  }
  return filteredDatas;
};
const getSelectedAudioIndex = (selectedAudio, audios) => {
  let selectedAudioIndex = -1;
  if (selectedAudio && audios) {
    audios.forEach((audio, index) => {
      if (audio.id === selectedAudio.id) {
        selectedAudioIndex = index;
      }
    });
  }
  return selectedAudioIndex;
};

@connect((store) => {
  const {
    open,
    libraries,
    title,
    width,
    className,

    selectedAudio,
    audios,
    onSelected,
  } = store.audioSelectModal;
  return {
    open,
    libraries,
    title,
    width,
    className,
    // audio
    selectedAudio,
    audios,
    onSelected,
  };
})
export default class SelectAudioModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    audios: PropTypes.array,
    libraries: PropTypes.array,
    open: PropTypes.bool,
    selectedAudio: PropTypes.any,
    selectedIndex: PropTypes.number, // dropdownList index From SelectionModal
    onSelected: PropTypes.func,
  }
  constructor(props) {
    super(props);
    const filteredAudios = getFilterAudio(props);
    this.state = {
      filteredAudios,
      playIndex: -1,
    };
  }

  componentWillReceiveProps(nextProps) {
    const filteredAudios = getFilterAudio(nextProps);
    this.setState({ filteredAudios });
    if (nextProps.open === false && nextProps.open !== this.props.open) {
      const { playIndex } = this.state;
      if (this[`audioPlayer_${playIndex}`]) this[`audioPlayer_${playIndex}`].pauseAudio();
    }
  }

  handleOnPlayChange = (playIndex) => {
    this.setState({ playIndex });
  }

  handleOnchangeAudioList = (selectedIndex) => {
    const { filteredAudios } = this.state;
    const selectedAudio = filteredAudios[selectedIndex];
    this.props.dispatch(updateSelectedItem(selectedAudio));
  }

  handleOnDoubleClick = (selectedIndex) => {
    const { filteredAudios } = this.state;
    const selectedAudio = filteredAudios[selectedIndex];

    if (this.props.onSelected) this.props.onSelected(selectedAudio);
    this.props.dispatch(closeAudioSelectionModal());
  }

  render() {
    const {
      selectedAudio,
    } = this.props;
    const { filteredAudios } = this.state;
    const selectedAudioIndex = getSelectedAudioIndex(selectedAudio, filteredAudios);
    return (
      filteredAudios && filteredAudios.length > 0 &&
        <AudioPlayerList
          selectedIndex={selectedAudioIndex}
          onChange={this.handleOnchangeAudioList}
          onDoubleClick={this.handleOnDoubleClick}
          onPlay={this.handleOnPlayChange}
        >
          {filteredAudios.map((audio, index) => {
            if (!audio.url) return null;
            return (
              <Lazyload key={audio.id} height={78} offsetVertical={getWindowHeight()}>
                <AudioPlayer
                  ref={ref => this[`audioPlayer_${index}`] = ref}
                  mode="readonly"
                  title={`${audio.nameEn}`}
                  url={getAudioMp4Url(audio)}
                />
              </Lazyload>
            );
          })}
        </AudioPlayerList>
    );
  }
}
