import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import Dropdown from 'ui-elements/Dropdown';
import UsersDropdown from 'ui-elements/UsersDropdown';
import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';
import ImageUpload from 'ui-elements/ImageUpload';

import CloseIcon from 'common/icons/close';

@translate(['assetsManagement', 'editor', 'assetCharacterModal'])
export default class FGImageRow extends React.Component {
  static propTypes = {
    fgImage: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
    limitedMode: PropTypes.bool,
    selected: PropTypes.bool,
    onCreditsChange: PropTypes.func,
    onImageChange: PropTypes.func,
    onNameChange: PropTypes.func,
    onRequestDelete: PropTypes.func,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    selected: false,
  }

  componentDidMount() {
    this.row.addEventListener('click', this.handleOutsideClick);
  }

  componentWillUnmount() {
    this.row.removeEventListener('click', this.handleOutsideClick);
  }

  handleOnSelect = () => {
    const { onSelect, index } = this.props;
    if (onSelect) onSelect(index);
  }

  handleOutsideClick = ({ target }) => {
    if (this.closeButton && !findDOMNode(this.closeButton).contains(target)) this.handleOnSelect();
  }

  handleDeleteButtonClick = () => {
    const {
      index,
      onRequestDelete,
    } = this.props;
    if (onRequestDelete) onRequestDelete(index);
  }

  handleImageUploadChange = (imageFile) => {
    const { index, onImageChange } = this.props;
    if (onImageChange) onImageChange(index, imageFile);
  }

  handleNameChange = (value) => {
    const { index, onNameChange } = this.props;
    if (onNameChange) onNameChange(index, value);
  }

  handleCreditsChange = (users) => {
    const { onCreditsChange } = this.props;
    if (onCreditsChange) onCreditsChange(users);
  }

  render() {
    const {
      t,
      fgImage,
      selected,
      limitedMode,
    } = this.props;
    const className = classNames('image-selection-row', { selected });

    return (
      <div
        ref={e => this.row = e}
        className={className}
        onClick={this.handleOnSelect}
      >
        <ImageUpload
          accept="image/png"
          disabled={limitedMode}
          height={68}
          src={fgImage.src}
          width={68}
          onChangeImage={this.handleImageUploadChange}
        />
        <div className="fg-image-row-details">
          <TextField
            placeholder={t('characterModal.placeholder.fgImage')}
            readonly={limitedMode}
            value={fgImage.meta.name}
            onChange={this.handleNameChange}
          />
          <UsersDropdown
            readonly={limitedMode}
            users={fgImage.meta.users}
            fullWidth
            onChange={this.handleCreditsChange}
          />
          {/* <Dropdown
            limit={4}
            ref={e => this.dropdown = e}
            searchNotFoundText=""
            searchPlaceholder=""
            selectedIndexes={[0, 1]}
            values={['繁體中文', '简体中文', 'English', '日本語', '언문'].map((item) => (
            { icon: null, text: item }
            ))}
            fullWidth
            multiple
            search
            showCount
          /> */}
        </div>
        {
          !limitedMode &&
            <div className="fg-row-cross-button">
              <FlatButton
                ref={e => this.closeButton = e}
                icon={<CloseIcon />}
                onClick={this.handleDeleteButtonClick}
              />
            </div>
        }
      </div>
    );
  }
}
