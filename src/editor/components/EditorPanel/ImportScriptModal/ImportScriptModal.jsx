import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _unescape from 'lodash/unescape';

import AlertDialog from 'ui-elements/AlertDialog';
import Modal from 'ui-elements/Modal';
import Progress from 'ui-elements/Progress';
import RaisedButton from 'ui-elements/RaisedButton';
import TextField from 'ui-elements/TextField';

import * as Actions from './ImportScriptModal.actions';
import { STAGE } from './ImportScriptModal.constants';

import './ImportScriptModal.style.scss';


@translate(['ImportScriptModal', 'error'])
@connect(store => ({ ...store.editorPanel.ImportScriptModal }))
export default class ImportScriptModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    oice: PropTypes.object.isRequired,
    open: PropTypes.bool,
    stage: PropTypes.string,
    loading: PropTypes.bool,
    progress: PropTypes.number,
    error: PropTypes.object,
  }

  static defaultProps = {
    open: false,
    stage: null,
    loading: false,
    progress: 0,
    error: undefined,
  }

  constructor(props) {
    super(props);

    this.state = {
      file: null,
    };
  }

  componentDidMount() {
    this.fileUpload = document.createElement('input');
    this.fileUpload.type = 'file';
    this.fileUpload.accept = 'text/plain';
    this.fileUpload.multiple = false;
    this.fileUpload.addEventListener('change', this.handleChangeFileUpload);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      this.fileUpload.value = '';
      this.setState({ file: null });
    }

    if (nextProps.stage === STAGE.FINISHED && this.props.stage !== STAGE.FINISHED) {
      const { t, dispatch } = this.props;
      dispatch(AlertDialog.toggle({
        type: 'alert',
        body: t(`label.stage.${STAGE.FINISHED}`),
      }));
    }
  }

  handleChangeFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file });
    }
  }

  handleClickChooseFileButton = () => {
    this.fileUpload.click();
  }

  handleClickUploadButton = () => {
    const { oice } = this.props;
    const { file } = this.state;
    this.props.dispatch(Actions.importScript(oice, file));
  }

  handleRequestClose = (loading) => {
    if (!loading) {
      this.props.dispatch(Actions.close());
    }
  }

  render() {
    const {
      t, stage, loading, progress, error,
    } = this.props;
    const { file } = this.state;

    const uploadButton = (
      <RaisedButton
        label={t('button.uploadScript')}
        onClick={this.handleClickUploadButton}
        disabled={loading || file === null}
        primary
      />
    );

    return (
      <Modal
        id="import-script-modal"
        open={this.props.open}
        onClickOutside={() => this.handleRequestClose(loading)}
      >
        <Modal.Header onClickCloseButton={() => this.handleRequestClose(loading)}>
          {t('title')}
        </Modal.Header>
        <Modal.Body>
          {!loading &&
            <div id="import-script-upload">
              <TextField value={file && file.name} fluid readonly />
              <RaisedButton
                label={t('button.chooseFile')}
                onClick={this.handleClickChooseFileButton}
                disabled={loading}
                mini
              />
            </div>
          }
          {stage && t(`label.stage.${stage}`)}
          {loading && (stage === STAGE.UPLOADING || stage === STAGE.INSERTING) &&
            <Progress value={progress} determinate />
          }
          {error &&
            <div id="import-script-error">
              <h2>{t('label.parseError')}</h2>
              <p>{_unescape(t(error.key, error.interpolation))}</p>
              {error.interpolation && error.interpolation.line &&
                <p>{_unescape(t('label.errorLineAndContent', error.interpolation))}</p>
              }
            </div>
          }
        </Modal.Body>
        <Modal.Footer
          leftItems={[]}
          rightItems={[uploadButton]}
        />
      </Modal>
    );
  }
}
