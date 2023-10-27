import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import ButtonGroup from 'ui-elements/ButtonGroup';
import FlatButton from 'ui-elements/FlatButton';
import NavBar from 'ui-elements/NavBar';
import RaisedButton from 'ui-elements/RaisedButton';

import AssetIcon from 'common/icons/asset';
import PlayIcon from 'common/icons/play';
import PublishIcon from 'common/icons/publish';
import SettingIcon from 'common/icons/setting';

import { getLocalUserItem } from 'common/utils/auth';
import { isNormalUser } from 'common/utils/user';

import USER_ROLE from 'common/constants/userRoles';

import './styles.scss';


@translate(['editor'])
export default class EditorToolbar extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    menu: PropTypes.node,
    oiceName: PropTypes.string,
    storyName: PropTypes.string,
    user: PropTypes.object,
    onClickAssetManagement: PropTypes.func,
    onClickExportOice: PropTypes.func,
    onClickImportButton: PropTypes.func,
    onClickOiceSetting: PropTypes.func,
    onClickRunOice: PropTypes.func,
    onClickStorySetting: PropTypes.func,
    onPreviewOiceButtonClick: PropTypes.func,
  };

  handleStorySettingButtonClick = () => {
    if (this.props.onClickStorySetting) this.props.onClickStorySetting();
  }

  handleOiceSettingButtonClick = () => {
    if (this.props.onClickOiceSetting) this.props.onClickOiceSetting();
  }

  handleClickImportButton = () => {
    if (this.props.onClickImportButton) this.props.onClickImportButton();
  }

  handlePreviewOiceButtonClick = () => {
    if (this.props.onPreviewOiceButtonClick) this.props.onPreviewOiceButtonClick();
  }

  handlePublishOiceButtonClick = () => {
    if (this.props.onClickRunOice) this.props.onClickRunOice();
  }

  handleExportOiceClick = () => {
    if (this.props.onClickExportOice) this.props.onClickExportOice();
  }

  handleAssetsMangementButtonClick = () => {
    if (this.props.onClickAssetManagement) this.props.onClickAssetManagement();
  }

  renderStoryAndOiceSelectionButton() {
    const { t, storyName, oiceName } = this.props;
    if (!storyName || !oiceName) return null;
    return (
      <div
        className="story-oice-selection"
      >
        <hr className="setting-menu-hr" />
        <span onClick={this.handleStorySettingButtonClick}>
          {storyName}
        </span>
        —
        <span onClick={this.handleOiceSettingButtonClick}>
          {oiceName}
        </span>
        <FlatButton
          icon={<SettingIcon />}
          onClick={this.handleStorySettingButtonClick}
        />
      </div>
    );
  }

  renderEditorButtons() {
    const {
      menu,
      oiceName,
      storyName,
      t,
      user,
    } = this.props;
    return (
      <div className="editor-buttons">
        <RaisedButton
          className="assets-management-button toolbar-button"
          icon={<AssetIcon />}
          label={t('toolbar.button.assetsManagement')}
          destructive
          mini
          onClick={this.handleAssetsMangementButtonClick}
        />
        <hr className="setting-menu-hr" />
        <RaisedButton
          className="import-script-button toolbar-button"
          label={t('toolbar.button.importScript')}
          mini
          onClick={this.handleClickImportButton}
        />
        <hr className="setting-menu-hr" />
        <ButtonGroup>
          <RaisedButton
            className="oice-preview-button toolbar-button"
            disabled={!oiceName}
            icon={<PlayIcon />}
            label={t('toolbar.button.preview')}
            mini
            primary
            onClick={this.handlePreviewOiceButtonClick}
          />
          <RaisedButton
            className="oice-publish-button toolbar-button"
            disabled={!oiceName}
            icon={<PublishIcon />}
            label={t('toolbar.button.publish')}
            mini
            primary
            onClick={this.handlePublishOiceButtonClick}
          />
          <RaisedButton
            className="oice-export-button toolbar-button"
            disabled={!oiceName || isNormalUser(user.role)}
            icon={<PlayIcon />}
            label={t('toolbar.button.export')}
            mini
            primary
            onClick={this.handleExportOiceClick}
          />
        </ButtonGroup>
      </div>
    );
  }

  render() {
    const { menu, user } = this.props;
    return (
      <NavBar
        iconMenu={menu}
        id="editor-toolbar"
        rightChildren={this.renderEditorButtons()}
        user={user}
        fluid
        openLinkInBlank
        showProfileIcon
      >
        {this.renderStoryAndOiceSelectionButton()}
      </NavBar>
    );
  }
}
