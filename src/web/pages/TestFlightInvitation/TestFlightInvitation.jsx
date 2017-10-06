import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/ModalTwo';
import OutlineButton from 'ui-elements/OutlineButton';
import TextField from 'ui-elements/TextField';

import * as LogActions from 'common/actions/log';
import * as TestFlightInvitationActions from './TestFlightInvitation.redux';

import './TestFlightInvitation.styles.scss';


@translate('TestFlightInvitation')
@connect(store => ({
  ...store.TestFlightInvitation,
  user: store.user,
}))
export default class TestFlightInvitation extends React.Component {
  static propTypes = {
    // HoC
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,

    // redux
    isSending: PropTypes.bool,
    isSent: PropTypes.bool,
    errorMessage: PropTypes.string,
    user: PropTypes.object,

    // Props
    open: PropTypes.bool,
    onToggle: PropTypes.func,
  }

  static defaultProps = {
    isCloseButtonShowed: true,
    onToggle: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      email: (props.user && props.user.email) || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.open && nextProps.open) {
      this.props.dispatch(TestFlightInvitationActions.reset());
      this.setState({ email: (nextProps.user && nextProps.user.email) || '' });
    }
  }

  handleChangeEmail = (email) => {
    this.setState({ email });
  }

  handleClickSubmitButton = () => {
    this.props.dispatch(LogActions.logClickWeb('submitTestFlightInvitation'));
    this.props.dispatch(TestFlightInvitationActions.sendInvitation(this.state.email));
  }

  render() {
    const { t, open, isSending, isSent, errorMessage, onToggle } = this.props;
    const { email } = this.state;

    return (
      <Modal
        id="testflight-invitation"
        open={open}
        width={480}
        onClickOutside={onToggle}
      >
        <Modal.Header onClickCloseButton={onToggle}>
          {t('title')}
        </Modal.Header>
        <Modal.Body>
          <h3>{t('label.description')}</h3>
          <div>
            <TextField
              value={email}
              placeholder={t('placeholder.email')}
              showWarning={!!errorMessage}
              fullWidth
              onChange={this.handleChangeEmail}
            />
            {!!errorMessage && <div className="error-message">{t(`error:${errorMessage}`)}</div>}
            {isSent && <div>{t('label.alreadySent')}</div>}
          </div>
          <OutlineButton
            label={t(isSending ? 'button.submitting' : 'button.submit')}
            color="green"
            disabled={!email || isSending}
            onClick={this.handleClickSubmitButton}
          />
        </Modal.Body>
      </Modal>
    );
  }
}
