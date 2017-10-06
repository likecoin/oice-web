import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SelectionModal from 'ui-elements/SelectionModal';
import Body from './Body';
// import './style.scss';

import { closeAudioSelectionModal } from 'editor/actions/modal';

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
export default class CharacterSelectionModal extends React.Component {
  static propTypes = {
    onSelected: PropTypes.func,
    dispatch: PropTypes.func,
    open: PropTypes.bool.isRequired,
    libraries: PropTypes.array,
    title: PropTypes.string,
    className: PropTypes.string,
    width: PropTypes.number,
    audios: PropTypes.array,
    selectedAudio: PropTypes.any,
  }
  static defaultProps = {
    open: false,
    width: 590,
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.open && nextProps.open && this.props.selectedAudio) {
      return false;
    }
    return true;
  }

  handleOnClose = () => {
    this.props.dispatch(closeAudioSelectionModal());
  }

  handleOnConfirmButton = () => {
    const { selectedAudio } = this.props;
    if (this.props.onSelected) this.props.onSelected(selectedAudio);
    this.props.dispatch(closeAudioSelectionModal());
  }

  render() {
    const {
      open,
      libraries,
      title,
      width,
      className,
      audios,
      selectedAudio,
    } = this.props;

    return (
      <SelectionModal
        open={open}
        libraries={libraries}
        className={className}
        width={width}
        title={title}
        handleOnClose={this.handleOnClose}
        handleOnConfirmButton={this.handleOnConfirmButton}
        onSelectDropdownList={this.handleOnSelectDropdownList}
        disableConformButton={!selectedAudio}
      >
        <Body />
      </SelectionModal>
    );
  }
}
