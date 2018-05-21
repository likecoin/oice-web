import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import classNames from 'classnames';
import update from 'immutability-helper';

import _get from 'lodash/get';

import AddIcon from 'common/icons/add-thin';
import BackIcon from 'common/icons/arrow/thin-left-arrow';
import DeleteIcon from 'common/icons/rubbish-bin';
import ForSaleIcon from 'common/icons/forsale-library';
import PrivateIcon from 'common/icons/private-library';
import PublicIcon from 'common/icons/public-library';

import AlertDialog from 'ui-elements/AlertDialog';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import GreyButton from 'ui-elements/GreyButton';
import ImageUpload from 'ui-elements/ImageUpload';
import Modal from 'ui-elements/ModalTwo';
import OutlineButton from 'ui-elements/OutlineButton';
import TextField from 'ui-elements/TextField';
import ToggleButton from 'ui-elements/ToggleButton';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import Throttle from 'common/utils/Throttle';

import { LIBRARY_TYPE } from 'asset-library/constants';

import { isNormalUser } from 'common/utils/user';
import { showPaymentInProfile } from 'common/utils/auth';

import ConnectStripeModal from '../ConnectStripeModal';

import * as Actions from './CreateLibraryModal.actions';

import './CreateLibraryModal.scss';

const LIBRARY_TYPES = [
  {
    type: LIBRARY_TYPE.PUBLIC,
    enabled: true,
    color: 'green',
    icon: <PublicIcon />,
    description: [
      'label.shareUploadedAssetForFree',
      'label.shouldConfirmPropertyRight',
      'label.canOnlyUseInOice',
    ],
  },
  {
    type: LIBRARY_TYPE.FORSALE,
    enabled: true,
    color: 'blue',
    icon: <ForSaleIcon />,
    description: [
      'label.willBeSoldAtAssetStore',
      'label.shouldConfirmPropertySellingRight',
      'label.canOnlyUseInOice',
      'label.stripeAccountIsRequired',
      'label.3070Share',
    ],
  },
  {
    type: LIBRARY_TYPE.PRIVATE,
    enabled: true,
    color: 'red',
    icon: <PrivateIcon />,
    description: [
      'label.othersCannotAccess',
      'label.shouldConfirmPropertyRight',
      'label.oiceProUserOnly',
    ],
  },
];

const defaultLibraryState = {
  name: '',
  description: '',
  license: 0,
  coverStorage: '',
  isPublic: false,
  price: undefined,
};

@translate(['assetsManagement', 'library', 'CreateLibraryModal'])
@connect(store => ({
  ...store.CreateLibraryModal,
  user: store.user,
}))
export default class CreateLibraryModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    edit: PropTypes.bool,
    library: PropTypes.object,
    libraryType: PropTypes.oneOf([
      LIBRARY_TYPE.PUBLIC,
      LIBRARY_TYPE.PRIVATE,
      LIBRARY_TYPE.FORSALE,
    ]),
    priceTiers: PropTypes.array,
    user: PropTypes.object,
    onClickCloseButton: PropTypes.func,
    onClickOutside: PropTypes.func,
  };

  static defaultProps = {
    edit: false,
    library: defaultLibraryState,
    libraryType: undefined,
    open: false,
  }

  constructor(props) {
    super(props);
    const { edit, library } = props;
    this.state = {
      imageFileSrc: undefined,
      library: library || defaultLibraryState,
      libraryType: props.libraryType || undefined,
      connectStripeModalOpen: false,
    };
  }

  componentDidMount() {
    if (!this.props.priceTiers) {
      this.props.dispatch(Actions.fetchPriceTiers());
    }
  }

  componentWillReceiveProps(nextProps) {
    const { edit, library, libraryType, user } = nextProps;
    const imageFileSrc = _get(library, 'cover') || _get(user, 'avatar');
    this.setState({
      library: edit ? library : defaultLibraryState,
      imageFileSrc,
      libraryType,
    });
  }

  handleOnClickCreateLibrary = (libraryType) => {
    const isStripeConnected = _get(this.props, 'user.isStripeConnected');
    if (libraryType === LIBRARY_TYPE.PRIVATE && isNormalUser(_get(this.props, 'user.role'))) {
      showPaymentInProfile.set();
      window.location.href = '/profile?action=membership';
    } else if (libraryType === LIBRARY_TYPE.FORSALE && !isStripeConnected) {
      this.setState({ connectStripeModalOpen: true });
    } else {
      this.props.dispatch(InteractiveTutorial.Action.achieve(['a3157cb']));
      this.setState({ libraryType });
    }
  }

  handleImageUploadOnChange = (coverImage) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(coverImage);
    fileReader.onload = (event) => {
      const imageFileSrc = event.target.result;
      const library = { ...this.state.library };
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

  handleNameChange = (name) => {
    let library = this.state.library;
    library = update(library, {
      name: { $set: name },
    });
    this.setState({ library });
  }

  handleDescriptionChange = (description) => {
    let library = this.state.library;
    library = update(library, {
      description: { $set: description },
    });
    this.setState({ library });
  }

  handleConfirmButtonClick = () => {
    const { library, libraryType, selectedPriceIndex } = this.state;
    const { dispatch, edit, priceTiers } = this.props;
    if (edit) {
      dispatch(Actions.updateLibrary(library));
    } else {
      dispatch(Actions.addLibrary({
        ...library,
        type: libraryType,
      }));
      dispatch(InteractiveTutorial.Action.achieve(['374b9f2']));
    }
  }

  handleOnClickBackButton = () => {
    this.resetLibraryModalState();
  }

  handleOnClickDeleteLibraryButton = () => {
    const { dispatch, t } = this.props;
    const { library } = this.state;
    dispatch(AlertDialog.toggle({
      open: true,
      body: t('label.confirmDelete', {
        name: library.name,
      }),
      confirmCallback: () => {
        if (library) dispatch(Actions.deleteLibrary(library));
      },
    }));
  }

  handleOnClickOutside = () => {
    const { onClickOutside } = this.props;
    if (onClickOutside) onClickOutside();
    this.resetLibraryModalState();
  }

  handleOnClickCloseButton = () => {
    const { onClickCloseButton } = this.props;
    if (onClickCloseButton) onClickCloseButton();
    this.resetLibraryModalState();
  }

  handleOnCloseConnectStripeModal = () => {
    this.setState({ connectStripeModalOpen: false });
  }

  handlePriceChange = (selectedPriceIndex) => {
    const library = {
      ...this.state.library,
      price: this.props.priceTiers[selectedPriceIndex].tier,
      isPriceUpdated: true,
    };
    this.setState({
      library,
      selectedPriceIndex,
    });
  }

  handleOnToggleForSaleLibraryPublicButton = (isToggled) => {
    const { t, dispatch, user } = this.props;
    if (this.state.library.assetCount <= 0) {
      dispatch(AlertDialog.toggle({
        open: true,
        type: 'alert',
        body: t('label.addAssetsFirst'),
      }));
    } else if (!user.isStripeConnected) {
      dispatch(AlertDialog.toggle({
        open: true,
        type: 'alert',
        body: t('label.reconnectStripeToSellLibrary'),
      }));
    } else {
      const library = {
        ...this.state.library,
        isLaunched: isToggled,
      };
      this.setState({ library });
    }
  }

  resetLibraryModalState = () => {
    const { edit } = this.props;
    const newState = { imageFileSrc: undefined };
    if (!edit) {
      newState.library = defaultLibraryState;
      newState.libraryType = undefined;
    }
    this.setState(newState);
  }

  renderLibraryTypeChoicesPage() {
    const { t } = this.props;
    return (
      <div className="create-library-modal-content">
        <div className="library-type-icons">
          {
            LIBRARY_TYPES.map(libraryType => (
            libraryType.enabled &&
              <div key={`icon-${libraryType.type}`}>
                {libraryType.icon}
              </div>
            ))
          }
        </div>
        <div className="library-type-details">
          {
            LIBRARY_TYPES.map((libraryType) => {
              const { type, color, enabled, icon, description } = libraryType;
              const key = `library-type-${type}`;
              if (enabled) {
                return (
                  <div key={key}>
                    <div>
                      <h3>{t(type)}</h3>
                      <ul>
                        {
                          description.map((translateKey, index) => (
                            <li key={`description-${index}`}>{t(translateKey)}</li>
                          ))
                        }
                      </ul>
                    </div>
                    <OutlineButton
                      color={color}
                      label={t(`libraryModal.button.create.${type}`)}
                      fluid
                      onClick={() => this.handleOnClickCreateLibrary(type)}
                    />
                  </div>
                );
              }
              return null;
            })
          }
        </div>
      </div>
    );
  }

  renderLibrarySettingsCreatePage = () => {
    const { t, priceTiers, edit } = this.props;
    const { imageFileSrc, library, libraryType, selectedPriceIndex } = this.state;
    const libraryIndex = LIBRARY_TYPES.findIndex(type => type.type === libraryType);
    let prices = [];
    let selectedIndexes = [];
    if (priceTiers) {
      prices = priceTiers.map(tier => tier.price);
      selectedIndexes = selectedPriceIndex || [prices.findIndex(price => price === library.price)];
    }
    const libraryToggled = (
      (typeof library.isLaunched !== 'undefined') ?
      library.isLaunched :
      library.launchedAt !== null
    );
    return (
      <div className="create-library-modal-form">
        <Form>
          <Form.Section>
            <Form.Section.Side>
              <ImageUpload
                height={144}
                src={imageFileSrc}
                width={144}
                onChangeImage={this.handleImageUploadOnChange}
              />
              <span>{t('libraryModal.label.uploadCover')}</span>
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
            </Form.Section.Main>
          </Form.Section>
        </Form>
        <div className="type">
          {LIBRARY_TYPES[libraryIndex].icon}
          <span>{t(libraryType)}</span>
          {
            libraryType === LIBRARY_TYPE.FORSALE &&
              <div>
                {t('libraryModal.label.modifyPrice')}
                <Dropdown
                  placeholder={t('label.price')}
                  selectedIndexes={selectedIndexes}
                  values={prices.map(price => (
                    { icon: null, text: `US$ ${price}` }
                  ))}
                  fullWidth
                  onChange={this.handlePriceChange}
                />
                {edit &&
                  <ToggleButton
                    leftLabel={t('label.notOnStore')}
                    rightLabel={t('label.onStore')}
                    toggled={libraryToggled}
                    onToggle={this.handleOnToggleForSaleLibraryPublicButton}
                  />
                }
              </div>
          }
        </div>
      </div>
    );
  }

  render() {
    const { t, edit, open, onClickCloseButton } = this.props;
    const { library, libraryType, connectStripeModalOpen } = this.state;
    const modalHeader = edit ? 'edit' : 'add';
    const leftButton = (!edit ?
      (
        <FlatButton
          icon={<BackIcon />}
          onClick={this.handleOnClickBackButton}
        />
      ) : (
        <FlatButton
          icon={<DeleteIcon />}
          onClick={this.handleOnClickDeleteLibraryButton}
        />
      )
    );
    const disabledConfirm = (
      !library.name ||
      (libraryType === LIBRARY_TYPE.FORSALE && !library.price)
    );
    const confirmButton = (
      <Throttle>
        {throttle => (
          <OutlineButton
            color={'red'}
            disabled={disabledConfirm}
            label={t('libraryModal.button.save')}
            fluid
            onClick={throttle(this.handleConfirmButtonClick)}
          />
        )}
      </Throttle>
    );
    return (
      <div id="create-library-modal">
        <Modal
          open={open}
          width={libraryType ? 712 : 640}
          onClickOutside={this.handleOnClickOutside}
        >
          <Modal.Header onClickCloseButton={this.handleOnClickCloseButton}>
            {t(`libraryModal.header.${modalHeader}`)}
          </Modal.Header>
          <Modal.Body>
            {libraryType ?
              this.renderLibrarySettingsCreatePage()
              : this.renderLibraryTypeChoicesPage()
            }
          </Modal.Body>
          {libraryType &&
            <Modal.Footer
              leftItems={[leftButton]}
              rightItems={[confirmButton]}
            />
          }
        </Modal>
        {!edit &&
          <ConnectStripeModal
            open={connectStripeModalOpen}
            onClickCloseButton={this.handleOnCloseConnectStripeModal}
          />
        }
      </div>
    );
  }
}
