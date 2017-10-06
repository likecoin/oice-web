import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import FlatButton from 'ui-elements/FlatButton';
import ExpansionPanel from 'ui-elements/ExpansionPanel';

import FGImagesList from './FGImagesList';
import CharacterPositionPreview from './CharacterPositionPreview';
import EditCharacterNamesPanel from './EditCharacterNamesPanel';
import CoordinateConfigPanel from './CoordinateConfigPanel';

import * as constants from 'common/constants';
import Footer from './ModalFooter';
import Header from './ModalHeader';

import {
  closeCharacterModal,
  toggleExpansionCharacterModal,
  postCharacter,
  deleteCharacter,
} from './actions';

import AlertDialog from 'ui-elements/AlertDialog';

import './styles.scss';


const isInteger = (value) => Number.isInteger(value) || value === '';

@translate(['assetsManagement', 'editor'])
@connect((store) => {
  const {
    selectedLibrary,
    characterModal,
  } = store.libraryPanel;
  const libraryId = (selectedLibrary || {}).id;
  const {
    open,
    expanded,
    character,
    deletedFGImageIds,
    fgImages,
  } = characterModal;
  return {
    open,
    character,
    deletedFGImageIds,
    expanded,
    fgImages,
    libraryId,
  };
})
export default class CharacterModal extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    deletedFGImageIds: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    fgImages: PropTypes.array.isRequired,
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    libraryId: PropTypes.number,
    limitedMode: PropTypes.bool,
  }

  static defaultProps = {
    loading: false,
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
    this.props.dispatch(toggleExpansionCharacterModal());
  }

  renderExpansionPanel() {
    const { character, expanded, limitedMode, t } = this.props;
    return (
      !limitedMode &&
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
    const { character, limitedMode, open, t } = this.props;
    return (
      <Modal
        id="character-modal"
        open={open}
        width={912}
      >
        <Header limitedMode={limitedMode} />
        <Modal.Body>
          <div className="fg-image-preview">
            <FGImagesList limitedMode={limitedMode} />
            <CharacterPositionPreview limitedMode={limitedMode} />
          </div>
          {this.renderExpansionPanel()}
        </Modal.Body>
        {!limitedMode && <Footer />}
      </Modal>
    );
  }
}
