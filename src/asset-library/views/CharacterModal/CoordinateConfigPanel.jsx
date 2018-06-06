import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import classNames from 'classnames';

import TextField from 'ui-elements/TextField';

import { setDefaultConfigForCharacterFg } from 'editor/utils/app';

import * as Actions from './CharacterModal.actions';

import {
  POSITIONS,
  POSITIONS_LIST,
  COORDINATE,
  COORDINATE_LIST,
} from 'editor/constants/character';


@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    character,
    defaultConfig,
    selectedPosition,
  } = store.CharacterModal;
  return {
    character,
    defaultConfig,
    selectedPosition,
  };
})
export default class CoordinateConfigPanel extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    defaultConfig: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    selectedPosition: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      axis: COORDINATE.x,
    };
  }

  handleOnFocusCoordinateTextfield = (position, axis) => {
    const { dispatch, selectedPosition } = this.props;
    this.setState({ axis });
    if (selectedPosition !== position) {
      dispatch(Actions.updateSelectedPosition(position));
    }
  }

  handleChangeCoordinate = (value) => {
    const { dispatch, selectedPosition } = this.props;
    const { axis } = this.state;
    const key = COORDINATE_LIST[axis] + POSITIONS_LIST[selectedPosition];
    dispatch(Actions.updateCharacterConfig({ [key]: value }));
  }

  renderCoordinateInputs() {
    const {
      character, defaultConfig, selectedPosition, t,
    } = this.props;
    const { config } = character;

    return (
      <div className="character-modal-panel-config-coordinate">
        {POSITIONS_LIST.map((key, position) => {
          const xKey = `x${key}`;
          const yKey = `y${key}`;
          const x = config[xKey];
          const y = config[yKey];
          const className = classNames(
          'character-modal-panel-config-coordinate-modal', {
            selected: (selectedPosition === position),
          });
          return (
            <div key={position} className={className}>
              <div className="character-modal-panel-config-coordinate-title">
                {t(`characterModal.label.coordinate.${position}`)}
              </div>
              <div className="character-modal-panel-config-coordinate-detail">
                <div className="character-modal-panel-config-coordinate-detail-title">
                  X
                </div>
                <div className="character-modal-panel-config-coordinate-input">
                  <TextField
                    placeholder={defaultConfig[xKey]}
                    value={x}
                    border
                    fullWidth
                    isNumber
                    onChange={this.handleChangeCoordinate}
                    onFocus={() => this.handleOnFocusCoordinateTextfield(position, COORDINATE.x)}
                  />
                </div>
              </div>
              <div className="character-modal-panel-config-coordinate-detail">
                <div className="character-modal-panel-config-coordinate-detail-title">
                  Y
                </div>
                <div className="character-modal-panel-config-coordinate-input">
                  <TextField
                    placeholder={defaultConfig[yKey]}
                    value={y}
                    border
                    fullWidth
                    isNumber
                    onChange={this.handleChangeCoordinate}
                    onFocus={() => this.handleOnFocusCoordinateTextfield(position, COORDINATE.y)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { character, t } = this.props;
    const { width, height } = character;

    return (
      <div className="character-modal-panel-config">
        <div className="character-modal-panel-config-height-width">
          <div className="character-modal-panel-config-block">
            <div className="character-modal-panel-config-title">
              {t('characterModal.label.fgImage.width')}
            </div>
            <div className="character-modal-panel-config-value">
              {width}
            </div>
          </div>
          <div className="character-modal-panel-config-block">
            <div className="character-modal-panel-config-title">
              {t('characterModal.label.fgImage.height')}
            </div>
            <div className="character-modal-panel-config-value">
              {height}
            </div>
          </div>
        </div>
        {this.renderCoordinateInputs()}
      </div>
    );
  }
}
