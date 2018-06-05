import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import ButtonGroup from 'ui-elements/ButtonGroup';
import CharacterPreview from 'ui-elements/CharacterPreview';
import RaisedButton from 'ui-elements/RaisedButton';

import * as itemKey from 'ui-elements/CharacterPreview/ItemKey';

import {
  POSITIONS,
  POSITIONS_LIST,
  COORDINATE_LIST,
} from 'editor/constants/character';

import * as Actions from './CharacterModal.actions';


export const getXYFromCharacterImage = (config, defaultConfig, positionIndex) => {
  const positionKey = `${POSITIONS_LIST[positionIndex]}`;
  const xKey = `x${positionKey}`;
  const yKey = `y${positionKey}`;

  return {
    x: config[xKey] || defaultConfig[xKey] || 0,
    y: config[yKey] || defaultConfig[yKey] || 0,
  };
};

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    character,
    fgImages,
    selectedFgIndex,
    selectedPosition,
    defaultConfig,
  } = store.CharacterModal;

  const {
    width,
    height,
    config,
  } = character;

  const fgImage = fgImages[selectedFgIndex];

  return {
    width,
    height,
    fgImage,
    config,
    defaultConfig,
    selectedPosition,
  };
})
export default class CharacterPositionPreview extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    defaultConfig: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    selectedPosition: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
    fgImage: PropTypes.object,
    height: PropTypes.number,
    limitedMode: PropTypes.bool,
    width: PropTypes.number,
  }

  handleSelectedPositionChange = (position) => {
    this.props.dispatch(Actions.updateSelectedPosition(position));
  }

  handleCoordinateChange = (x, y) => {
    const {
      selectedPosition,
      dispatch,
    } = this.props;

    const positionKey = POSITIONS_LIST[selectedPosition];

    dispatch(Actions.updateCharacterConfig({
      [`x${positionKey}`]: x,
      [`y${positionKey}`]: y,
    }));
  }

  render() {
    const {
      config,
      defaultConfig,
      fgImage,
      height,
      limitedMode,
      selectedPosition,
      t,
      width,
    } = this.props;

    const coordinate = getXYFromCharacterImage(
      config, defaultConfig, selectedPosition
    );

    return (
      <div className="character-modal-body-character-preview">
        <CharacterPreview
          image={fgImage && fgImage.src}
          x={coordinate.x}
          y={coordinate.y}
          flipped={selectedPosition === POSITIONS.r}
          readonly={limitedMode}
          size={360}
          onChange={this.handleCoordinateChange}
        />
        <div className="character-modal-body-button-group">
          <ButtonGroup
            selectedIndex={selectedPosition}
            fullWidth
            selectable
            onChange={this.handleSelectedPositionChange}
          >
            <RaisedButton label={t('character:coordinate.left')} mini />
            <RaisedButton label={t('character:coordinate.middle')} mini />
            <RaisedButton label={t('character:coordinate.right')} mini />
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
