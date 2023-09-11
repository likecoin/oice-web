import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import ExpansionPanel from 'ui-elements/ExpansionPanel';
import TextField from 'ui-elements/TextField';
import FlatButton from 'ui-elements/FlatButton';
import AddIcon from 'common/icons/add';
import RaisedButton from 'ui-elements/RaisedButton';
import AlertDialog from 'ui-elements/AlertDialog';

import FGImageRow from './FGImageRow';

import {
  addFGImages,
  deleteFGImage,
  replaceFGImage,
  updateCharacterSize,
  updateFgImages,
  updateSelectedFGImage,
  updateSelectedFgIndex,
} from './actions';

import { getFilename } from '../utils';


const getFgimageObjectWithURL = url => ({
  name: '',
  url,
});

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    fgimages,
    character,
    fgImages,
    selectedFgIndex,
  } = store.libraryPanel.characterModal;
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
    dispatch(updateSelectedFgIndex(payload));
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
              dispatch(updateCharacterSize({
                width: image.width,
                height: image.height,
              }));
            }
            resolve({
              meta: {
                name: getFilename(file.name),
                users: [user],
              },
              src: image.src,
              file,
              sync: false,
            });
          };
        };
        fileReader.readAsDataURL(file);
      }));

    Promise.all(promises).then(results => dispatch(addFGImages(results)));
    // if (image.width !== width || image.height !== height) {
    //   dispatch(toggleAlertDialog({
    //     open: true,
    //     body: '由於圖片比例與其他角色圖片不符，所以螢幕預覽比例或不一。',
    //   }));
    // }
  }

  handleOnClickAddImageSelection = () => {
    this.imageUpload.click();
  }

  handleFGImageNameChange = (index, value) => {
    this.props.dispatch(updateSelectedFGImage({ name: value }));
  }

  handleFGImageChange = (index, file) => {
    // TODO: combine handleImageUploadOnChange
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const src = event.target.result;
      const image = new Image();
      image.src = src;
      image.onload = () => this.props.dispatch(replaceFGImage({
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
        name: fgImage.meta.name,
      }),
      confirmCallback: () => dispatch(deleteFGImage(index)),
    }));
  }

  handleCreditsChange = (users) => {
    this.props.dispatch(updateSelectedFGImage({ users }));
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
        key={index}
        fgImage={fgImage}
        index={index}
        limitedMode={limitedMode}
        selected={selectedFgIndex === index}
        onCreditsChange={this.handleCreditsChange}
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
            ref={(e) => { this.imageUpload = e; }}
            accept="image/png"
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
        <div ref={(e) => { this.imageSelectionRows = e; }} className="character-modal-add-row">
          {this.renderFgImageRows()}
        </div>
      </div>
    );
  }
}
