import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _debounce from 'lodash/debounce';
import _get from 'lodash/get';
import _pick from 'lodash/pick';

import CircularLoader from 'ui-elements/CircularLoader';
import LoadingScreen from 'ui-elements/LoadingScreen';
import OutlineButton from 'ui-elements/OutlineButton';
import TextField from 'ui-elements/TextField';

import { DOMAIN_URL } from 'common/constants';

import ProfilePanel from '../ProfilePanel';

import * as Actions from '../Profile.actions';

import {
  BASIC_INFORMATION,
  BASIC_INFORMATION_LEFT_ITEMS,
} from '../Profile.constants';

import '../style.scss';

const DEFERRED_USERNAME_VALIDATION_DURATION = 800; // in ms

@connect(store => ({
  usernameStatus: store.Profile.usernameStatus,
  saving: store.Profile.saving,
  user: store.Profile.userProfile,
}))
@translate(['general', 'Profile', 'error'])
export default class Profile extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    usernameStatus: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    const {
      description,
      displayName,
      email,
      username,
      seekingSubscriptionMessage,
    } = props.user;

    this.state = {
      description,
      displayName,
      email,
      username,
      seekingSubscriptionMessage,
    };
  }

  componentDidMount() {
    this._deferredUsernameValidation = _debounce(this.validateUsernameInput, DEFERRED_USERNAME_VALIDATION_DURATION);
  }

  handleBasicInformationChange = (value, item) => {
    let newValue = value;

    if (item === BASIC_INFORMATION.USERNAME && newValue) {
      // Remove leading and trailing spaces
      newValue = newValue.trim();

      this._deferredUsernameValidation(newValue);

      if (this.props.usernameStatus.error) {
        this.props.dispatch(Actions.updateUsernameStatus({
          error: undefined,
        }));
      }

      if (this.props.usernameStatus.isValidated) {
        this.props.dispatch(Actions.updateUsernameStatus({
          isValidated: false,
        }));
      }
    }

    this.setState({ [item]: newValue });
  }

  handleSaveBasicInformation = () => {
    this.props.dispatch(Actions.updateUser(
      _pick(this.state, BASIC_INFORMATION_LEFT_ITEMS),
    ));
  }

  validateUsernameInput(username) {
    if (this.props.user.username !== username) {
      this.props.dispatch(Actions.validateUsername(username));
    }
  }

  isBasicInformationInputValid() {
    const { user, usernameStatus } = this.props;

    // has filled display name
    if (!_get(this.state, BASIC_INFORMATION.DISPLAY_NAME)) {
      return false;
    }

    const hasUpdated = BASIC_INFORMATION_LEFT_ITEMS.some(
      item => _get(user, item) !== _get(this.state, item)
    );
    if (!hasUpdated) {
      return false;
    }

    // not yet validated or invalid username
    const { isValidating, isValidated, error } = usernameStatus;
    if (isValidating || error || !isValidated) {
      return false;
    }

    return true;
  }

  renderBasicInformationRow = (item) => {
    const { t, usernameStatus } = this.props;
    const { isValidating, error } = usernameStatus;
    const isMultiLine = item === BASIC_INFORMATION.DESCRIPTION;
    const value = this.state[item];

    let showWarning = false;
    if (
      (item === BASIC_INFORMATION.DISPLAY_NAME && !value) ||
      (item === BASIC_INFORMATION.USERNAME && error)
    ) {
      showWarning = true;
    }

    return (
      <div key={item} className="profile-setting-row">
        <h5>{t(`personalInformation.label.${item}`)}</h5>
        <div className="text-field-input">
          {item === BASIC_INFORMATION.USERNAME && (
            <span>{DOMAIN_URL}/@</span>
          )}
          <TextField
            maxLength={isMultiLine ? 1024 : 256}
            multiLine={isMultiLine}
            placeholder={t('enterPlease')}
            showWarning={showWarning}
            value={value}
            fullWidth
            onChange={text => this.handleBasicInformationChange(text, item)}
          />
        </div>
        {item === BASIC_INFORMATION.USERNAME && (
          <CircularLoader
            className="clip-loader"
            color="green"
            loading={isValidating}
            size={24}
          />
        )}
        {item === BASIC_INFORMATION.USERNAME && error && (
          <span className="error">{t(error)}</span>
        )}
      </div>
    );
  }


  render() {
    const { t, saving } = this.props;

    return (
      <ProfilePanel
        disableSaveButton={!this.isBasicInformationInputValid() || saving}
        header={t('personalInformation.header.basicInformation')}
        onClickSave={this.handleSaveBasicInformation}
      >
        <div className="left-column">
          {BASIC_INFORMATION_LEFT_ITEMS.map(this.renderBasicInformationRow)}
        </div>
      </ProfilePanel>
    );
  }
}
