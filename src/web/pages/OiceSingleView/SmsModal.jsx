import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import {
  PhoneNumberUtil,
  PhoneNumberType as PHONE_NUMBER_TYPE,
} from 'google-libphonenumber';

import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import Modal from 'ui-elements/ModalTwo';
import OutlineButton from 'ui-elements/OutlineButton';
import Progress from 'ui-elements/Progress';
import TextField from 'ui-elements/TextField';

import AppStoreIcon from 'common/icons/app-store-download';
import BackIcon from 'common/icons/arrow/thin-left-arrow';

import { BRANCH_URL } from 'common/constants/branch';
import { PLAY_STORE_URL } from 'common/constants';

import DownloadAppBadges from 'web/components/DownloadAppBadges';
import AppIcon from './AppIcon';

import * as Actions from './OiceSingleView.actions';
import * as LogActions from 'common/actions/log';
import * as OiceSingleViewUtils from './utils';

import './SmsModal.style.scss';

const PhoneUtils = PhoneNumberUtil.getInstance();

const ERR_NOT_POSSIBLE_PHONE_NUMBER = 'ERR_NOT_POSSIBLE_PHONE_NUMBER';
const ERR_NOT_MOBILE_PHONE_NUMBER = 'ERR_NOT_MOBILE_PHONE_NUMBER';
const ERR_STRING_NOT_SEEM_TO_BE_PHONE_NUMBER = 'The string supplied did not seem to be a phone number';

@translate(['SmsModal', 'error'])
@connect(store => ({
  ...store.oiceSingleView.sms,
}))
export default class SmsModal extends React.Component {
  static propTypes = {
    // HoC
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,

    // Redux
    countries: PropTypes.array,
    sendingSMS: PropTypes.bool,
    sentSMS: PropTypes.bool,
    userCountryCode: PropTypes.string,

    // Props
    oice: PropTypes.object.isRequired,
    showCloseButton: PropTypes.bool,
    isEndedPlaying: PropTypes.bool,
    isPreview: PropTypes.bool,
    open: PropTypes.bool,
    onToggle: PropTypes.func,
  }

  static defaultProps = {
    showCloseButton: true,
    isEndedPlaying: false,
    isPreview: false,
    onToggle: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      isShowSMS: true,
      selectedCountryCodeIndex: undefined,
    };
  }

  componentDidMount() {
    this.props.dispatch(Actions.fetchCountriesJson());
    this.props.dispatch(Actions.fetchUserCountryCodeByIP());
  }

  componentWillReceiveProps(nextProps) {
    const { countries, userCountryCode, open } = nextProps;
    if (
      (userCountryCode !== this.props.userCountryCode) ||
      (userCountryCode && this.props.countries.length !== countries.length)
    ) {
      const index = countries.findIndex(country =>
        country.regionCode === userCountryCode,
      );
      if (index >= 0 && !this.state.selectedCountryCodeIndex) {
        this.setState({ selectedCountryCodeIndex: index });
      }
    }

    if (nextProps.oice && this.props.oice && nextProps.oice.id !== this.props.oice.id) {
      this.props.dispatch(Actions.resetSMS());
    }
  }

  handlePhoneChange = (phoneNumber) => {
    this.setState({ phoneNumber });
  }

  handleOnClickSendSMS = () => {
    const { dispatch, t, countries, oice } = this.props;
    const { phoneNumber, selectedCountryCodeIndex } = this.state;
    const { regionCode, dialCode } = countries[selectedCountryCodeIndex];

    dispatch(LogActions.logClickWeb('sendText', {
      oiceUuid: oice.uuid,
    }));

    // phone validation
    try {
      const number = PhoneUtils.parseAndKeepRawInput(phoneNumber, regionCode);
      const phoneNumberType = PhoneUtils.getNumberType(number);
      if (phoneNumberType === -1) {
        throw Error(ERR_NOT_POSSIBLE_PHONE_NUMBER);
      } else if (phoneNumberType !== PHONE_NUMBER_TYPE.MOBILE) {
        throw Error(ERR_NOT_MOBILE_PHONE_NUMBER);
      }
      const phone = `${dialCode}${phoneNumber}`;
      this.sendSMS(phone);
    } catch (e) {
      const errorList = [ERR_NOT_POSSIBLE_PHONE_NUMBER, ERR_NOT_MOBILE_PHONE_NUMBER];
      const message = (errorList.indexOf(e.message) !== -1) ? e.message : undefined;
      this.alert(message);
    }
  }

  handleOnClickOtherDownloadMethod = () => {
    const { dispatch, oice } = this.props;
    dispatch(LogActions.logClickWeb('otherWayToDownloadTheApp', {
      oiceUuid: oice.uuid,
    }));
    this.setState({ isShowSMS: false });
  }

  handleOnClickBackButton = () => {
    this.setState({ isShowSMS: true });
  }

  handleSelectCallingCode = (selectedIndexes) => {
    this.setState({ selectedCountryCodeIndex: selectedIndexes[0] });
  }

  handleUnselectCallingCode = (deletedIndex) => {
    this.setState({ selectedCountryCodeIndex: undefined });
  }

  handleOnClickGooglePlayIcon = () => {
    const { dispatch, oice } = this.props;
    dispatch(LogActions.logClickWeb('getAppButtonGooglePlay', {
      oiceUuid: oice.uuid,
    }));
  }

  handleOnClickAppStoreIcon = () => {
    const { dispatch, oice } = this.props;
    dispatch(LogActions.logClickWeb('getAppButtonAppStore', {
      oiceUuid: oice.uuid,
    }));
  }

  alert = (message = ERR_NOT_POSSIBLE_PHONE_NUMBER) => {
    const { dispatch, t } = this.props;
    dispatch(AlertDialog.toggle({
      body: t(message),
      type: 'alert',
    }));
  }

  sendSMS = (phone) => {
    const { dispatch, t, oice, isEndedPlaying, isPreview } = this.props;
    const deepLinkOice = isEndedPlaying ? OiceSingleViewUtils.getNextEpisodeOice(oice) : oice;
    const linkData = OiceSingleViewUtils.getDeepLinkObject({
      channel: 'SMS',
      data: {
        $custom_sms_text: `${t('smsMessage')} {{ link }}`,
        isPreview,
      },
      oice: deepLinkOice,
      t,
    });
    dispatch(Actions.sendSMS(phone, linkData));
  }

  renderWriteMobileNumbers = () => {
    const { t, countries, sendingSMS, sentSMS } = this.props;
    const { phoneNumber, selectedCountryCodeIndex } = this.state;
    const className = classNames('send-sms', { sentSMS });
    const selectedIndexes = isNaN(selectedCountryCodeIndex) ? [] : [selectedCountryCodeIndex];
    const dropdownValues = countries.map(country => ({
      text: t('countries.nameWithCountryCode', { ...country }),
      icon: null,
    }));
    return (
      <div className={className}>
        <div className="mobile-number-row">
          <Dropdown
            limit={1}
            placeholder={t('countries.title')}
            selectedIndexes={selectedIndexes}
            values={dropdownValues}
            multiple
            fullWidth
            search
            onChange={this.handleSelectCallingCode}
            onDelete={this.handleUnselectCallingCode}
          />
          <TextField value={phoneNumber} onChange={this.handlePhoneChange} />
          <div className="send-button">
            {sendingSMS && <Progress.LoadingIndicator />}
            <OutlineButton
              color="green"
              disabled={sendingSMS}
              label={sentSMS ? t('button.resend') : t('button.send')}
              onClick={this.handleOnClickSendSMS}
            />
          </div>
        </div>
        <span>{sentSMS ? t('label.smsSent') : ''}</span>
      </div>
    );
  }

  renderSmsSteps = () => {
    const { t } = this.props;
    const steps = [
      t('label.fillInMobileNumber'),
      t('label.receiveAndClickLink'),
      t('label.downloadForBetterExperience'),
    ];
    const details = [this.renderWriteMobileNumbers(), null, null];
    return (
      <div className="sms-steps">
        {steps.map((step, i) =>
          <div key={`sms-step-${i}`} className="sms-step">
            <div className="step-number">{i + 1}</div>
            <div className="step-details">
              <h3>{step}</h3>
              {details[i]}
            </div>
          </div>
        )}
        <FlatButton
          label={t('button.useOtherWays')}
          onClick={this.handleOnClickOtherDownloadMethod}
        />
      </div>
    );
  }

  renderStoreDownload = () => {
    const { t, oice } = this.props;
    const deepLink = `${BRANCH_URL}?uuid=${oice.uuid}&$desktop_url=${encodeURIComponent(PLAY_STORE_URL)}`;
    return (
      <div className="store-download">
        <p>{t('label.appStoreMayNotContinueOice')}</p>
        <DownloadAppBadges
          googleLink={deepLink}
          onClickGooglePlayIcon={this.handleOnClickGooglePlayIcon}
          onClickAppStoreIcon={this.handleOnClickAppStoreIcon}
        />
      </div>
    );
  }

  render() {
    const { t, isEndedPlaying, showCloseButton, open, onToggle } = this.props;
    const { isShowSMS } = this.state;
    const backButton = (
      <FlatButton
        icon={<BackIcon />}
        onClick={this.handleOnClickBackButton}
      />
    );
    return (
      <Modal
        id="sms-modal"
        open={open}
        width={592}
        onClickOutside={showCloseButton ? onToggle : null}
      >
        <Modal.Header onClickCloseButton={showCloseButton ? onToggle : null}>
          {isEndedPlaying ? t('label.downloadToContinue') : t('label.downloadForBetterExperience') }
        </Modal.Header>
        <Modal.Body padding={false}>
          <AppIcon />
          <hr />
          {isShowSMS ? (
            this.renderSmsSteps()
          ) : (
            this.renderStoreDownload()
          )}
        </Modal.Body>
        {!isShowSMS &&
          <Modal.Footer
            leftItems={[backButton]}
            rightItems={[]}
          />
        }
      </Modal>
    );
  }
}
