import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import ExpansionPanel from 'ui-elements/ExpansionPanel';
import FlatButton from 'ui-elements/FlatButton';
import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';

import FGImagesList from './FGImagesList';
import CharacterPositionPreview from './CharacterPositionPreview';
import EditCharacterNamesPanel from './EditCharacterNamesPanel';
import CoordinateConfigPanel from './CoordinateConfigPanel';

import * as constants from 'common/constants';
import Footer from './ModalFooter';
import Header from './ModalHeader';

import * as Actions from './CharacterModal.actions';

import './CharacterModal.style.scss';


const isInteger = (value) => Number.isInteger(value) || value === '';

@translate(['assetsManagement', 'editor'])
@connect((store) => ({ ...store.CharacterModal }))
export default class CharacterModal extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    libraryId: PropTypes.number,
    readonly: PropTypes.bool,
  }

  shouldComponentUpdate(nextProps) {
    if (
      (nextProps.open === this.props.open) &&
      (this.props.expanded === nextProps.expanded)
    ) {
      return false;
    }
    return true;
  }

  handleExpansionPanelHeaderClick = () => {
    this.props.dispatch(Actions.toggleExpansionCharacterModal());
  }

  handleCloseCharacterModal = () => {
    this.props.dispatch(Actions.closeCharacterModal());
  }

  renderExpansionPanel() {
    const { character, expanded, readonly, t } = this.props;
    return (
      !readonly &&
      <ExpansionPanel
        open={expanded}
        onClick={this.handleExpansionPanelHeaderClick}
      >
        <ExpansionPanel.Header center>
          {t('characterModal.label.fullSetting')}
        </ExpansionPanel.Header>
        <ExpansionPanel.Content>
          <EditCharacterNamesPanel character={character} />
          <CoordinateConfigPanel />
        </ExpansionPanel.Content>
      </ExpansionPanel>
    );
  }

  render() {
    const { character, libraryId, readonly, open, t } = this.props;
    return (
      <Modal
        id="character-modal"
        open={open}
        width={912}
        onClickOutside={this.handleCloseCharacterModal}
      >
        <Header characterId={_get(character, 'id')} limitedMode={readonly} />
        <Modal.Body>
          <div className="fg-image-preview">
            <FGImagesList limitedMode={readonly} />
            <CharacterPositionPreview limitedMode={readonly} />
          </div>
          {this.renderExpansionPanel()}
        </Modal.Body>
        {!readonly && <Footer libraryId={libraryId} />}
      </Modal>
    );
  }
}
