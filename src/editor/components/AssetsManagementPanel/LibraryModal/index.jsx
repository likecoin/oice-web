import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';

import AlertDialog from 'ui-elements/AlertDialog';
import Checkbox from 'ui-elements/Checkbox';
import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import ImageUpload from 'ui-elements/ImageUpload';
import Modal from 'ui-elements/Modal';
import RadioButton from 'ui-elements/RadioButton';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import {
  addLibrary,
  deleteLibrary,
  updateLibrary,
  toggleLibraryModal,
} from './redux';

import { updateUserTutorialState } from 'editor/components/InteractiveTutorial/actions';

import './styles.scss';

const defaultLibraryState = {
  name: '',
  description: '',
  license: 0,
  coverStorage: '',
  isPublic: false,
};

@translate(['assetsManagement', 'general'])
@connect((store) => {
  const { open, library } = store.libraryModal;
  const { tutorialState } = store.user;
  return {
    open,
    library,
    tutorialState,
  };
})
export default class LibraryModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    library: PropTypes.object,
    tutorialState: PropTypes.array,
  }

  constructor(props) {
    super(props);
    const { library } = props;
    let imageFileSrc = null;
    if (library && library.coverStorage) {
      imageFileSrc = library.coverStorage;
    }
    this.state = {
      library: library || defaultLibraryState,
      imageFileSrc,
    };
  }

  componentWillReceiveProps(nextProps) {
    let imageFileSrc = null;
    if (nextProps.library && nextProps.library.coverStorage) {
      imageFileSrc = nextProps.library.coverStorage;
    }
    this.setState({
      library: nextProps.library || defaultLibraryState,
      imageFileSrc,
    });
  }

  handleOnClose = () => {
    this.props.dispatch(toggleLibraryModal({ open: false }));
  }

  handleDeleteLibraryButtonClick = () => {
    const { library, t } = this.props;
    this.props.dispatch(AlertDialog.toggle({
      open: true,
      body: t('label.confirmDelete', {
        name: library.name,
      }),
      confirmCallback: () => {
        if (library) this.props.dispatch(deleteLibrary(library));
      },
    }));
  }

  handleConfirmButtonClick = () => {
    const isAdding = !this.props.library;
    const { library } = this.state;
    const { dispatch, tutorialState } = this.props;
    dispatch(isAdding ? addLibrary(library) : updateLibrary(library));
    const tutorialIndex = 1;
    if (!tutorialState[tutorialIndex]) {
      dispatch(InteractiveTutorial.Action.open(2, '5c4da1f'));
      dispatch(updateUserTutorialState(tutorialIndex));
    } else {
      dispatch(InteractiveTutorial.Action.achieve(['374b9f2']));
    }
  }

  handleNameChange = (value) => {
    const library = { ...this.state.library };
    library.name = value;
    this.setState({ library });
  }

  handleDescriptionChange = (value) => {
    const library = { ...this.state.library };
    library.description = value;
    this.setState({ library });
  }

  handleLicenseChange = (index) => {
    const library = { ...this.state.library };
    library.license = index;
    this.setState({ library });
  }

  handlePrivacyChange = (value) => {
    const library = { ...this.state.library };
    library.isPublic = value;
    this.setState({ library });
  }

  handleImageUploadOnChange = (coverImage) => {
    // update ImageUpload
    const library = { ...this.state.library };

    const fileReader = new FileReader();
    fileReader.readAsDataURL(coverImage);
    fileReader.onload = (event) => {
      const imageFileSrc = event.target.result;
      // for call api
      library.coverImage = coverImage;
      // for update oice from view
      library.coverStorage = imageFileSrc;
      this.setState({
        imageFileSrc,
        library,
      });
    };
  }

  render() {
    const {
      t,
      open,
    } = this.props;

    const { library, imageFileSrc } = this.state;
    const isAdding = !this.props.library;

    const deleteButton = (!isAdding &&
      <FlatButton
        label={t('libraryModal.button.delete')}
        onClick={this.handleDeleteLibraryButtonClick}
      />
    );
    const confirmButton = (
      <RaisedButton
        disabled={library.name.trim().length === 0}
        label={t('save')}
        primary
        onClick={this.handleConfirmButtonClick}
      />
    );

    const className = classNames(
      'library-modal',
      `library-modal-${isAdding ? 'add' : 'edit'}`
    );

    return (
      <Modal className={className} open={open}>
        <Modal.Header onClickCloseButton={this.handleOnClose}>
          {t(`libraryModal.header.${isAdding ? 'add' : 'edit'}`)}
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Section>
              <Form.Section.Side>
                <ImageUpload
                  height={230}
                  src={imageFileSrc}
                  width={230}
                  onChangeImage={this.handleImageUploadOnChange}
                />
              </Form.Section.Side>
              <Form.Section.Main>
                <TextField
                  placeholder={t('libraryModal.placeholder.name')}
                  value={library.name}
                  fullWidth
                  onChange={this.handleNameChange}
                />
                <TextField
                  placeholder={t('libraryModal.placeholder.description')}
                  value={library.description}
                  fullWidth
                  multiLine
                  onChange={this.handleDescriptionChange}
                />
                {/* <div className="form-label">{t('libraryModal.label.license')}</div>
                  <RadioButton
                  values={[
                  t('libraryModal.label.creativeCommons'),
                  t('libraryModal.label.referToProfile'),
                  ]}
                  onChange={this.handleLicenseChange}
                  selectedIndex={library.license}
                /> */}
                {/* {!isAdding &&
                  <Checkbox
                  label={t('libraryModal.label.public')}
                  isChecked={library.isPublic}
                  onChange={this.handlePrivacyChange}
                  />
                } */}
              </Form.Section.Main>
            </Form.Section>
          </Form>
        </Modal.Body>
        <Modal.Footer
          leftItems={[deleteButton]}
          rightItems={[confirmButton]}
        />
      </Modal>
    );
  }
}
