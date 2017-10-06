import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import ImageUpload from 'ui-elements/ImageUpload';
import Modal from 'ui-elements/ModalTwo';
import { keyListener, KEY } from 'common/utils/KeyListener';

import { getImageUrlFromFile } from 'common/utils';

@translate(['general', 'FacebookSettingModal'])
export default class FacebookSettingModal extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
    ogImage: PropTypes.object,
    open: PropTypes.bool,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    ogCover: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {
      ogImage: undefined,
      ogImageFile: undefined,
    };
  }

  handleClickClose = () => {
    const { onClose } = this.props;
    if (onClose) onClose();
  }

  handleImageUploadChange = async (ogImageFile) => {
    const ogImage = await getImageUrlFromFile(ogImageFile);
    this.setState({ ogImage, ogImageFile });
  }

  handleClickSaveButton = () => {
    const { onSave } = this.props;
    if (onSave) onSave(this.state.ogImageFile);
  }

  render() {
    const { t, open, language, ogImage } = this.props;
    const rightButtonProps = {
      rightButtonDisable: !this.state.ogImage,
      rightButtonTitle: t('save'),
      onClickRightButton: this.handleClickSaveButton,
    };
    return (
      <div id="facebook-setting-modal">
        <Modal
          open={open}
          width={560}
          onClickOutside={this.handleClickClose}
        >
          <Modal.Header onClickCloseButton={this.handleClickClose}>
            {t('title', { language })}
          </Modal.Header>
          <Modal.Body padding={false}>
            <div className="facebook-tab">
              <ImageUpload
                height={260}
                src={this.state.ogImage || _get(this.props, 'ogImage[600*315]')}
                width={260 * (120 / 63)}
                onChangeImage={this.handleImageUploadChange}
              />
              {t('label.uploadFacebookOgCover')}
              <br />
              {t('label.suggestedImageSize')}
            </div>
          </Modal.Body>
          <Modal.Footer
            className="facebook-setting"
            {...rightButtonProps}
          />
        </Modal>
      </div>
    );
  }
}
