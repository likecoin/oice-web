import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import AudioPlayerList from 'ui-elements/AudioPlayerList';
import AudioPlayer from 'ui-elements/AudioPlayer';
import FlatButton from 'ui-elements/FlatButton';
import LazyLoad, { forceCheck } from 'react-lazyload';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

import CloseIcon from 'common/icons/close';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { closeAudioSelectionModal } from 'editor/actions/modal';

import { getWindowHeight } from 'common/utils';
import { getAudioMp4Url } from 'editor/utils/app';

import EmptyPlaceholder from '../../EmptyPlaceholder';

import { updateSelectedItem } from './redux';

import './styles.scss';

const getFilterAudio = (props) => {
  const {
    audios,
    assetLibraryIds,
    libraries,
    selectedIndex, // dropdownList index
  } = props;

  let filteredDatas = [...audios];
  if (assetLibraryIds && selectedIndex === assetLibraryIds.length) {
    window.location.href = '/store';
    filteredDatas = null;
  } else if (selectedIndex >= 0) {
    const selectedCategory = libraries[assetLibraryIds[selectedIndex]];
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
  const { assetLibraryIds } = store.audioSelectModal;
  const libraries = store.libraries.dict;
  // prevent library is selected but neither purchased nor owned by user
  const filteredAssetLibraryIds = (
    assetLibraryIds ?
      assetLibraryIds.filter(id => !!libraries[id]) :
      assetLibraryIds
  );

  return {
    ...store.audioSelectModal,
    libraries,
    assetLibraryIds: filteredAssetLibraryIds,
  };
})
export default class SelectAudioModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    assetLibraryIds: PropTypes.array,
    audios: PropTypes.array,
    libraries: PropTypes.object,
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
    this.setState({ filteredAudios }, this.handleAssetModalUpdate);
    if (nextProps.open === false && !this.props.open) {
      const { playIndex } = this.state;
      if (this[`audioPlayer_${playIndex}`]) this[`audioPlayer_${playIndex}`].pauseAudio();
    }
  }

  handleAssetModalUpdate = () => {
    if (this.props.open) {
      forceCheck();
    }
  }

  handleOnPlayChange = (playIndex) => {
    this.setState({ playIndex });
  }

  handleOnChangeAudioList = (selectedIndex) => {
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
    if (!filteredAudios || filteredAudios.length === 0) {
      return <EmptyPlaceholder />;
    }
    return (
      <AudioPlayerList
        selectedIndex={selectedAudioIndex}
        onChange={this.handleOnChangeAudioList}
        onDoubleClick={this.handleOnDoubleClick}
        onPlay={this.handleOnPlayChange}
      >
        {filteredAudios.map((audio, index) => {
          if (!audio.url) return null;
          return (
            <LazyLoad
              key={audio.id}
              height={78}
              offset={0}
              throttle={250}
              once
              overflow
              scroll
            >
              <AudioPlayer
                ref={ref => this[`audioPlayer_${index}`] = ref}
                mode="readonly"
                title={`${audio.nameEn}`}
                url={getAudioMp4Url(audio)}
              />
            </LazyLoad>
          );
        })}
      </AudioPlayerList>
    );
  }
}
