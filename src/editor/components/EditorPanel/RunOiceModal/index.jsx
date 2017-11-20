import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import Checkbox from 'ui-elements/Checkbox';
import Progress from 'ui-elements/Progress';

import * as OiceAction from 'editor/actions/oice';
import OiceErrorList from '../OiceErrorList';

import {
  LOADING,
  FAILED,
  SUCCESS,
  FAILED_ERRORS,
} from 'editor/constants/stageType';

import './styles.scss';

import Actions from './actions';
import Reducer from './reducer';


const STR_WINDOW_NAME = 'oiceSingleView';

function getLocalizedOiceLink(link, language) {
  if (language) {
    return `${link}?lang=${language}`;
  }
  return link;
}

@translate(['editor'])
@connect((store) => {
  const {
    index,
    runOiceModal,
  } = store.editorPanel;

  return {
    buildState: index.buildState,
    language: _get(store, 'blocks.selectedLanguage'),
    ...runOiceModal,
  };
})
export default class RunOiceModal extends React.Component {
  static Action = Actions;
  static Reducer = Reducer;
  static propTypes = {
    buildState: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
    open: PropTypes.bool,
    preview: PropTypes.bool,
    onClose: PropTypes.func,
  }

  componentDidUpdate(prevProps) {
    const { buildState, preview } = this.props;
    const { data, stage } = buildState;
    const prevStage = prevProps.buildState.stage;
    if (prevStage !== stage && stage === SUCCESS && preview) {
      const popup = this.handleOnClickPlayButton();
      if (popup) this._handleCloseRequest(); // Close modal when popup opens
    }
  }

  handleOnClickPlayButton = () => {
    const { buildState, language } = this.props;
    const { data, stage } = buildState;
    if (stage === SUCCESS) {
      return window.open(getLocalizedOiceLink(data, language), STR_WINDOW_NAME);
    }
    return null;
  }

  _handleCloseRequest = () => {
    if (this.props.onClose) this.props.onClose();
  }

  renderErrorMessages(errorsObj) {
    const { t } = this.props;
    const render = Object.keys(errorsObj).map((key, index) => {
      const errorMessage = errorsObj[key];
      return (
        <li key={index} className="error-attribute-item">
          <div><span >{t('oiceError.attributeName')}</span> {key}</div>
          <div><span>{t('oiceError.messageLabel')}</span> {errorMessage}</div>
        </li>);
    });
    return render;
  }

  renderError(errorList) {
    const { t } = this.props;
    const render = errorList.map((error, i) => {
      const errorBlockId = error.blockId;
      const errorsObj = error.errors;
      return (
        <li key={i} className="error-block-item">
          {t('oiceError.errorBlockId')}: #{errorBlockId}
          <ul>
            {this.renderErrorMessages(errorsObj)}
          </ul>
        </li>
      );
    });
    return <ul>{render}</ul>;
  }

  renderBody(t) {
    const { buildState, language, preview } = this.props;
    const stage = buildState.stage;
    const data = buildState.data;
    const message = t(`buildOiceState.${buildState.message}`);
    switch (stage) {
      case FAILED:
        return (
          <div>
            <p>{message}</p>
          </div>
        );
      case FAILED_ERRORS:
      // when FAILED_ERRORS data is ERRORLIST
        return (
          <div>
            <p>{message}</p>
            <OiceErrorList
              t={t}
              errors={data}
              onFocusBlock={this._handleCloseRequest}
            />
          </div>
        );
      case SUCCESS:
      // when SUCCESS data is view_url
        return (
          <div>
            <p>
              {t(`runOice.description.${preview ? 'preview' : 'publish'}`)}
            </p>
            {!preview &&
              <h5>
                <a
                  ref={e => this.playLink = e}
                  className="oice-link"
                  onClick={this.handleOnClickPlayButton}
                >
                  {getLocalizedOiceLink(data, language)}
                </a>
              </h5>
            }
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
    const { t, buildState, preview } = this.props;
    const stage = buildState.stage;

    const playOiceButton = (
      <RaisedButton
        label={t('runOice.playButton')}
        onClick={this.handleOnClickPlayButton}
        primary
        disabled={stage !== SUCCESS}
      />
    );

    return (
      <div>
        <Modal
          id="run-oice-modal"
          open={this.props.open}
          onClickOutside={this._handleCloseRequest}
        >
          <Modal.Header onClickCloseButton={this._handleCloseRequest}>
            {t(`runOice.title.${preview ? 'preview' : 'publish'}`)}
          </Modal.Header>
          <Modal.Body>
            {this.renderBody(t)}
          </Modal.Body>
          <Modal.Footer
            leftItems={[]}
            rightItems={[playOiceButton]}
          />
        </Modal>
      </div>
    );
  }
}
