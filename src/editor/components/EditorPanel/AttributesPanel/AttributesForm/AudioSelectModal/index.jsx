import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SelectionModal from 'ui-elements/SelectionModal';
import Body from './Body';

import { closeAudioSelectionModal } from 'editor/actions/modal';


@connect(store => ({
  ...store.audioSelectModal,
  libraries: store.audioSelectModal.assetLibraryIds.map(id => store.libraries.dict[id]),
}))
export default class AudioSelectionModal extends React.Component {
  static propTypes = {
    onSelected: PropTypes.func,
    dispatch: PropTypes.func,
    open: PropTypes.bool.isRequired,
    audios: PropTypes.array,
    className: PropTypes.string,
    libraries: PropTypes.array,
    recentUsedAsset: PropTypes.object,
    selectedAudio: PropTypes.any,
    title: PropTypes.string,
    width: PropTypes.number,
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
      audios,
      className,
      libraries,
      open,
      recentUsedAsset,
      selectedAudio,
      title,
      width,
    } = this.props;
    const selectedIndex = (recentUsedAsset ?
      libraries.findIndex(library => library.id === recentUsedAsset.libraryId) :
      0 // select the first library by default
    );
    return (
      <SelectionModal
        className={className}
        disableConformButton={!selectedAudio}
        libraries={libraries}
        open={open}
        recentUsedAsset={recentUsedAsset}
        selectedAsset={selectedAudio}
        title={title}
        width={width}
        handleOnClose={this.handleOnClose}
        handleOnConfirmButton={this.handleOnConfirmButton}
      >
        <Body />
      </SelectionModal>
    );
  }
}
