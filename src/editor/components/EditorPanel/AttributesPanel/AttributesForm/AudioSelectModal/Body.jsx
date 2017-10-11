import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';

import TextField from 'ui-elements/TextField';
import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';
import AudioUpload from 'ui-elements/AudioUpload';
import AudioPlayerList from 'ui-elements/AudioPlayerList';
import AudioPlayer from 'ui-elements/AudioPlayer';
import Progress from 'ui-elements/Progress';

import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { closeAudioSelectionModal } from 'editor/actions/modal';
import {
  updateSelectedItem,
} from './redux';
import { getAudioMp4Url } from 'editor/utils/app';


const getFilterAudio = (props) => {
  const {
    libraries,
    audios,
    selectedIndex, // dropdownList index
  } = props;

  let filteredDatas = [...audios];
  if (selectedIndex > libraries.length) window.location.href = '/store';
  if (selectedIndex > 0) {
    const selectedCategory = libraries[selectedIndex - 1];
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
@translate(['editor', 'general'])
export default class SelectAudioModal extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    audios: PropTypes.array,
    libraries: PropTypes.array,
    open: PropTypes.bool,
    selectedAudio: PropTypes.any,
    selectedIndex: PropTypes.number, // dropdownList index From SelectionModal
    onClickListItem: PropTypes.func,
    onDoubleClickListItem: PropTypes.func,
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
          {filteredAudios.map((audio, index) => (
            audio.url &&
              <AudioPlayer
                key={index}
                mode="readonly"
                ref={ref => this[`audioPlayer_${index}`] = ref}
                title={`${audio.nameEn}`}
                url={getAudioMp4Url(audio)}
              />
          ))}
        </AudioPlayerList>
    );
  }
}
