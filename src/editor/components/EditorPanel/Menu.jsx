import React from 'react';
import PropTypes from 'prop-types';

import Divider from 'ui-elements/Divider';
import Menu from 'ui-elements/Menu';
import RaisedButton from 'ui-elements/RaisedButton';

import MoreIcon from 'common/icons/more';

import { VOLUMES } from '../InteractiveTutorial/constants';

const handleTutorialClick = () => window.open('https://v.oice.com/oice-beginner1-ce481e4d32a');

const EditorMenu = (props) => {
  const {
    t, tutorialState, userRole, onRequestOpenTutorial,
  } = props;

  const handleOpenTutorialRequest = (volume, index) => {
    if (onRequestOpenTutorial) {
      onRequestOpenTutorial(volume, index);
    }
  };

  const toggleEditorMenuButton = (
    <RaisedButton
      className="toggle-editor-menu-button"
      icon={<MoreIcon />}
      mini
    />
  );

  const tutorialMenuItems = [];
  let hasBadge = false;
  VOLUMES.forEach((volume, index) => {
    const disabled = !volume.enabled;
    const validUnwatchedTutorial = tutorialState && !tutorialState[index] && !disabled;
    tutorialMenuItems.push(
      <Menu.Item
        key={volume}
        disabled={disabled}
        primaryText={t(`menu.tutorial${volume.number}`)}
        secondaryText={validUnwatchedTutorial ? 'new' : ''}
        onClick={() => handleOpenTutorialRequest(volume.number, index)}
      />
    );
    // determining tutorial states
    if (validUnwatchedTutorial) {
      hasBadge = true;
    }
  });

  return (
    <Menu anchorEl={toggleEditorMenuButton} hasBadge={hasBadge}>
      {tutorialMenuItems}
      <Divider />
      <Menu.Item
        primaryText={t('menu.tutorial')}
        onClick={handleTutorialClick}
      />
    </Menu>
  );
};

EditorMenu.propTypes = {
  t: PropTypes.func.isRequired,
  tutorialState: PropTypes.array,
  userRole: PropTypes.string,
  onRequestOpenTutorial: PropTypes.func,
};

export default EditorMenu;
