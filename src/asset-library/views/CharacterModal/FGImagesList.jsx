import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import uuid from 'uuid';

import AlertDialog from 'ui-elements/AlertDialog';
import ExpansionPanel from 'ui-elements/ExpansionPanel';
import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

import AddIcon from 'common/icons/add';

import FGImageRow from './FGImageRow';

import * as Actions from './CharacterModal.actions';

import { getFilename } from 'common/utils';


@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const { fgimages,
    character,
    fgImages,
    selectedFgIndex,
  } = store.CharacterModal;
  const { user } = store;
  return {
    fgImages,
    character,
    selectedFgIndex,
    user,
  };
})
export default class FGImagesList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    fgImages: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    character: PropTypes.object,
    limitedMode: PropTypes.bool,
    selectedFgIndex: PropTypes.number,
    user: PropTypes.object,
  }

  // componentWillReceiveProps(nextProps) {
  //   const { fgimages, selectedFgIndex } = nextProps;
  //
  //   if (selectedFgIndex === fgimages.length - 1) {
  //     const node = findDOMNode(this.imageSelectionRows);
  //     setTimeout(() => {
  //       if (node) node.scrollTop = node.scrollHeight + 100;
  //     }, 500);
  //   }
  // }

  handleRowSelect = (index) => {
    const { dispatch } = this.props;
    const payload = { selectedFgIndex: index };
    dispatch(Actions.updateSelectedFgIndex(payload));
  }

  handleImageUploadOnChange = ({ target }) => {
    const {
      dispatch,
      character,
      fgImages,
      user,
    } = this.props;
    const {
      width,
      height,
    } = character;

    const promises = [...target.files]
    .map((file, index) => new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const src = event.target.result;
        const image = new Image();
        image.src = src;
        image.onload = () => {
          if (index === 0 && fgImages.length === 0) {
            // Use the first FG image size as character size
            dispatch(Actions.updateCharacterSize({
              width: image.width,
              height: image.height,
            }));
          }
          resolve({
            meta: {
              key: uuid.v4(),
              nameEn: getFilename(file.name),
              users: [user],
              creditsUrl: '',
            },
            src: image.src,
            file,
            sync: false,
          });
        };
      };
      fileReader.readAsDataURL(file);
    }));

    Promise.all(promises).then(results => dispatch(Actions.addFGImages(results)));
  }

  handleOnClickAddImageSelection = () => {
    this.imageUpload.click();
  }

  handleFGImageNameChange = (index, value) => {
    this.props.dispatch(Actions.updateSelectedFGImage({ nameEn: value }));
  }

  handleFGImageChange = (index, file) => {
    // TODO: combine handleImageUploadOnChange
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const src = event.target.result;
      const image = new Image();
      image.src = src;
      image.onload = () => this.props.dispatch(Actions.replaceFGImage({
        src: image.src,
        file,
        sync: false,
      }));
    };
    fileReader.readAsDataURL(file);
  }

  handleDeleteFGImageRequest = (index) => {
    const {
      dispatch,
      fgImages,
      t,
    } = this.props;
    const fgImage = fgImages[index];

    dispatch(AlertDialog.toggle({
      open: true,
      body: t('characterModal.label.confirmDeleteFgImage', {
        name: fgImage.meta.nameEn,
      }),
      confirmCallback: () => dispatch(Actions.deleteFGImage(index)),
    }));
  }

  handleCreditsChange = (users) => {
    this.props.dispatch(Actions.updateSelectedFGImage({ users }));
  }

  handleCreditsUrlChange = (value) => {
    this.props.dispatch(Actions.updateSelectedFGImage({ creditsUrl: value }));
  }

  renderFgImageRows() {
    const {
      fgImages,
      selectedFgIndex,
      limitedMode,
      character,
    } = this.props;
    return fgImages.map((fgImage, index) => (
      <FGImageRow
        key={fgImage.meta.id || fgImage.meta.key}
        fgImage={fgImage}
        index={index}
        limitedMode={limitedMode}
        selected={selectedFgIndex === index}
        onCreditsChange={this.handleCreditsChange}
        onCreditsUrlChange={this.handleCreditsUrlChange}
        onImageChange={this.handleFGImageChange}
        onNameChange={this.handleFGImageNameChange}
        onRequestDelete={this.handleDeleteFGImageRequest}
        onSelect={this.handleRowSelect}
      />
    ));
  }

  render() {
    const { t, limitedMode } = this.props;
    return (
      <div className="character-modal-body-image-selection">

        <div className="character-modal-add-image-selection">
          <input
            accept="image/png"
            ref={e => { this.imageUpload = e; }}
            style={{ display: 'none' }}
            type="file"
            multiple
            onChange={this.handleImageUploadOnChange}
            onClick={() => { this.imageUpload.value = ''; }} // Clear selected files
          />
          {!limitedMode &&
            <FlatButton
              icon={<AddIcon />}
              label={t('characterModal.button.addFgImage')}
              onClick={this.handleOnClickAddImageSelection}
            />
          }
        </div>
        <div className="character-modal-add-row" ref={(e) => { this.imageSelectionRows = e; }}>
          {this.renderFgImageRows()}
        </div>
      </div>
    );
  }
}
