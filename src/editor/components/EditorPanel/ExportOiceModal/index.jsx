import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import Checkbox from 'ui-elements/Checkbox';
import Progress from 'ui-elements/Progress';

import { API_URL } from 'common/constants';

import * as OiceAction from 'editor/actions/oice';
import OiceErrorList from '../OiceErrorList';

import './style.scss';

import {
  LOADING,
  FAILED,
  SUCCESS,
  FAILED_ERRORS,
  VALIDATE_SUCCESS,
  EXPORTING,
} from 'editor/constants/stageType';

import Actions from './actions';
import Reducer from './reducer';


@translate(['editor'])
@connect((store) => {
  const {
    index,
    exportOiceModal,
  } = store.editorPanel;
  return {
    ...exportOiceModal,
    buildState: index.buildState,
  };
})
export default class ExportOiceModal extends React.Component {
  static Action = Actions;
  static Reducer = Reducer;
  static propTypes = {
    buildState: PropTypes.object,
    oiceId: PropTypes.number.isRequired,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    storyId: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
  }

  handleOnClose = () => {
    if (this.props.onClose) this.props.onClose();
  }

  handleOnClickDownloadButton = () => {
    const { buildState, oiceId } = this.props;
    const { data } = buildState;
    if (buildState.stage === SUCCESS) {
      window.open(`${API_URL}oice/${oiceId}/export/${data}`, '_blank');
    }
  }

  renderBody(t) {
    const { buildState, oiceId, storyId } = this.props;
    const { stage, data } = buildState;
    const message = t(`buildOiceState.${buildState.message}`);
    switch (stage) {
      case FAILED_ERRORS:
        return (
          <div>
            <p>{message}</p>
            <OiceErrorList t={t} errors={data} />
          </div>
        );
      case FAILED:
      case SUCCESS:
        // when SUCCESS data is exportJobID
        return (
          <div>
            <p>{message}</p>
          </div>
        );
      default:
        return (
          <div>
            <p>{message}</p>
            <Progress />
          </div>
        );
    }
  }

  render() {
    const {
      t, buildState, oiceId, storyId,
    } = this.props;
    const { stage } = buildState;

    const downloadOiceButton = (
      <RaisedButton
        label={t('exportOice.downloadButton')}
        disabled={stage !== SUCCESS}
        primary
        onClick={this.handleOnClickDownloadButton}
      />
    );

    return (
      <div>
        <Modal
          id="run-oice-modal"
          open={this.props.open}
        >
          <Modal.Header onClickCloseButton={this.handleOnClose}>
            {t('exportOice.title')}
          </Modal.Header>
          <Modal.Body>
            {this.renderBody(t)}
          </Modal.Body>
          <Modal.Footer
            leftItems={[]}
            rightItems={[downloadOiceButton]}
          />
        </Modal>
      </div>
    );
  }
}
