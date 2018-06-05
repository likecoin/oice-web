import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import update from 'immutability-helper';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import Modal from 'ui-elements/ModalTwo';
import OutlineButton from 'ui-elements/OutlineButton';
import Progress from 'ui-elements/Progress';
import TabBar from 'ui-elements/TabBar';
import { keyListener, KEY } from 'common/utils/KeyListener';

import DeleteIcon from 'common/icons/rubbish-bin';

import StorySettingTab from './StorySettingTab';
import OiceSettingTab from './OiceSettingTab';
import LanguageSettingTab from './LanguageSettingTab';

import * as Actions from './StorySettingModal.actions';
import {
  TAB_LIST_ITEM,
  TAB_LIST,
} from './StorySettingModal.constants';

import './StorySettingModal.style.scss';

function isSettingUpdated({
  deleted, updated, hasUpdatedOiceOrder, newLanguages,
}) {
  return Object.keys(updated).some(language => (
    updated[language] && (updated[language].story || updated[language].oices.length > 0)
  )) || hasUpdatedOiceOrder || newLanguages.length > 0 || deleted.oices.length > 0 || deleted.languages.length > 0;
}


@translate(['general', 'StorySettingModal'])
@connect(store => ({ ...store.editorPanel.StorySettingModal }))
export default class StorySettingModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,

    // status
    tabBarIndex: PropTypes.number.isRequired,
    open: PropTypes.bool,
    saving: PropTypes.bool,

    // data
    content: PropTypes.object,
    mainLanguage: PropTypes.string,

    // updated status
    deleted: PropTypes.object,
    hasUpdatedOiceOrder: PropTypes.bool,
    newLanguages: PropTypes.array,
    updated: PropTypes.object,
  }

  static defaultProps = {
    open: false,
  }

  componentWillReceiveProps(nextProps) {
    const {
      dispatch, content, mainLanguage, open,
    } = nextProps;
    if (open && !this.props.open) {
      // prefetch languages supported by the story
      dispatch(Actions.fetchLanguage(content[mainLanguage].story));
    }
  }

  handleCloseStorySettingModal = () => {
    const { dispatch, t } = this.props;
    if (!isSettingUpdated(this.props)) {
      dispatch(Actions.toggle({ open: false }));
    } else {
      dispatch(AlertDialog.toggle({
        body: t('label.closeConfirm'),
        confirmCallback: () => {
          dispatch(Actions.toggle({ open: false }));
        },
      }));
    }
  }

  handleClickOutside = () => {
    // only trigger when modal has no update
    if (!isSettingUpdated(this.props)) {
      this.handleCloseStorySettingModal();
    }
  }

  handleClickTabBarItem = (tabBarIndex) => {
    this.props.dispatch(Actions.updateTabBarIndex({ tabBarIndex }));
  }

  handleClickSaveButton = () => {
    this.props.dispatch(Actions.saveStorySettingModal());
  }

  handleClickDeleteStoryButton = () => {
    const { t, dispatch } = this.props;
    dispatch(AlertDialog.toggle({
      body: t('label.deleteStoryConfirm'),
      confirmCallback: () => {
        dispatch(Actions.deleteStory());
      },
    }));
  }

  renderTabChild = (story) => {
    const { mainLanguage, tabBarIndex } = this.props;
    const settingType = TAB_LIST[tabBarIndex];
    switch (settingType) {
      case TAB_LIST_ITEM.STORY:
        return (
          <StorySettingTab language={mainLanguage} story={story} />
        );
      case TAB_LIST_ITEM.OICE:
        return <OiceSettingTab />;
      case TAB_LIST_ITEM.LANGUAGE:
        return <LanguageSettingTab />;
      default:
        return null;
    }
  }

  render() {
    const {
      t, open, mainLanguage, content, saving, tabBarIndex,
    } = this.props;

    const story = _get(this.props, `content[${mainLanguage}].story`);

    if (!story) return null;

    const headerTitle = _get(story, 'name');

    // check if any names field is not filled
    const languageKeys = Object.keys(content);
    const hasNamesNotFilled = languageKeys && languageKeys.some((language) => {
      const hasStoryNameNotFilled = !_get(content[language], 'story.name');
      const hasOiceNameNotFilled = !!content[language].oices && (
        content[language].oices.some(oice => !oice.name)
      );
      return hasStoryNameNotFilled || hasOiceNameNotFilled;
    });

    const rightButtonProps = {
      rightButtonDisable: hasNamesNotFilled || saving,
      rightButtonTitle: t('save'),
      onClickRightButton: this.handleClickSaveButton,
      rightButtonColor: 'green',
    };
    const leftButtonProps = TAB_LIST[tabBarIndex] === TAB_LIST_ITEM.STORY ? {
      leftButtonIcon: <DeleteIcon />,
      onClickLeftButton: this.handleClickDeleteStoryButton,
    } : {};

    return (
      <Modal
        className="story-setting-modal"
        open={open}
        width={712}
        onClickOutside={this.handleClickOutside}
      >
        <Modal.Header onClickCloseButton={this.handleCloseStorySettingModal}>
          {headerTitle}
        </Modal.Header>
        <Modal.Body padding={false}>
          {saving && <Progress />}
          <div>
            <TabBar
              className="asset-library-dashboard-tabbar"
              items={TAB_LIST.map(type => ({
                text: t(`tabBar.${type}`),
              }))}
              selectedIndex={tabBarIndex}
              onChange={this.handleClickTabBarItem}
            />
            {this.renderTabChild(story)}
          </div>
        </Modal.Body>
        <Modal.Footer
          {...leftButtonProps}
          {...rightButtonProps}
        />
      </Modal>
    );
  }
}
