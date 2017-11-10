/* global branch: true */

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';

import classNames from 'classnames';
import _get from 'lodash/get';
import queryString from 'query-string';

import QRCode from 'qrcode.react';
import AlertDialog from 'ui-elements/AlertDialog';
import Avatar from 'ui-elements/Avatar';
import Container from 'ui-elements/Container';
import ExpansionPanel from 'ui-elements/ExpansionPanel';
import LoadingScreen from 'ui-elements/LoadingScreen';
import OutlineButton from 'ui-elements/OutlineButton';
import RaisedButton from 'ui-elements/RaisedButton';

import CameraIcon from 'common/icons/photo-camera';

import {
  API_URL,
  SRV_ENV,
} from 'common/constants';
import {
  BRANCH_KEY,
  BRANCH_URL,
} from 'common/constants/branch';
import {
  getHTMLTitle,
  getIntegerFromPropertyValue,
  getThumbnail,
  handleOgMetaChanges,
  convertDataURLtoFile,
  isMobileAgent,
} from 'common/utils';

import AppIcon from './AppIcon';
import DeepView from './DeepView';
import SmsModal from './SmsModal';

import * as Actions from './OiceSingleView.actions';
import * as LogActions from 'common/actions/log';

import * as OiceSingleViewUtils from './utils';

import './OiceSingleView.style.scss';

export const CREDITS_KEY = [
  'director',
  'fgimage',
  'bgimage',
  'image',
  'bgm',
  'se',
];

@translate(['oiceSingleView'])
@connect(store => ({
  ...store.oiceSingleView,
}))
export default class OiceSingleView extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    credits: PropTypes.object,
    oice: PropTypes.object,
    params: PropTypes.object,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      containerWidth: 0,
      /**
       * This is not controlling the expansion of credits,
       * just for force re-render
       * @type {Boolean}
       */
      isCreditExpand: false,
      isStartedPlaying: false,
      isEndedPlaying: false,
      isPreview: /preview\/?$/.test(window.location.pathname),
      language: _get(this.props, 'location.query.lang'),
      mobile: false,
      oicePlayerSize: 0,
      viewUrl: null,
      smsModalOpen: false,
    };
  }

  componentDidMount() {
    branch.init(BRANCH_KEY);
    window.addEventListener('resize', this.updateLayout);
    window.addEventListener('message', this.handleOiceMessage, false);
    this.updateLayout();
    const oiceUuid = this.props.params.uuid;
    this.loadOice(oiceUuid);
    this.props.dispatch(LogActions.logOiceWebAcquisition({ oiceUuid }));
  }

  componentWillReceiveProps(nextProps) {
    const { oice, t } = this.props;
    if (this.props.params.uuid !== nextProps.params.uuid) {
      this.loadOice(nextProps.params.uuid);
    }
    if (oice) {
      const title = getHTMLTitle(t, oice.name);
      document.title = title;
      handleOgMetaChanges(title,
        oice.description || t('site:description'),
        oice.url,
        oice.ogImage.button || oice.image.button || `${window.location.origin}/static/img/oice-default-cover.jpg`,
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateLayout(prevState.containerWidth);
  }

  componentWillUnmount() {
    document.title = getHTMLTitle(this.props.t);
    window.removeEventListener('resize', this.updateLayout);
    window.removeEventListener('message', this.handleOiceMessage, false);
  }

  getOiceViewUrl(isPreview, oice) {
    const url = isPreview ? oice.previewUrl : oice.viewUrl;
    return url;
  }

  loadOice(oiceUuid) {
    this.props.dispatch(Actions.fetchOiceInfo(oiceUuid, this.state.language));
  }

  handleToggleCredit = (isCreditExpand) => {
    this.setState({ isCreditExpand });
  }

  handleOiceStart = () => {
    if (!this.state.isStartedPlaying) {
      if (!this.state.isPreview) {
        this.props.dispatch(Actions.incrementOiceViewCount(this.props.oice.id));
      }
      this.setState({ isStartedPlaying: true });
    }
  }

  handleOiceEnd = () => {
    if (!this.state.isPreview) {
      this.props.dispatch(LogActions.logReadOice(this.props.oice.uuid));
      this.setState({
        isEndedPlaying: true,
        smsModalOpen: true,
      });
    }
  }

  handleOiceMessage = ({ data }) => {
    // FIXME Check sender origin to be trusted
    // if (event.origin !== window.location.origin) return;
    if (typeof data !== 'string') return;
    let action;
    try {
      action = JSON.parse(data);
    } catch (e) {
      // data cannot be parsed
      return;
    }
    const { type, payload } = action;
    switch (type) {
      case 'oice.start':
        this.handleOiceStart();
        break;
      case 'oice.end':
        this.handleOiceEnd();
        break;
      case 'oice.screenCapture':
        this.presentModalToSaveCover(payload);
        break;
      default:
        break;
    }
  }

  handleToggleSmsModal = () => {
    const smsModalOpen = !this.state.smsModalOpen;
    if (!smsModalOpen) {
      const { dispatch, oice } = this.props;
      dispatch(LogActions.logClickWeb('downloadOiceApp', {
        oiceUuid: oice.uuid,
      }));
    }
    this.setState({ smsModalOpen });
  }

  handleScreenCaptureButtonClick = () => {
    this.postOiceAction({ type: 'oice.screenCapture' });
  }

  postOiceAction = (action) => {
    // Validation
    if (!(
      typeof action === 'object' &&
      typeof action.type === 'string'
    )) return false;

    // Post action to oice
    const serializedAction = JSON.stringify(action);
    document
    .getElementsByClassName('oice-player')[0]
    .contentWindow
    .postMessage(serializedAction, '*');

    return true;
  }

  updateLayout = (prevContainerWidth = 0) => {
    const container = findDOMNode(this.container);
    const sidebar = findDOMNode(this.sidebar);
    if (!container || !sidebar) return;

    const paddingTop = getIntegerFromPropertyValue(container, 'padding-top');
    const marginTop = getIntegerFromPropertyValue(container.firstChild, 'margin-top');
    const paddingLeft = getIntegerFromPropertyValue(container.firstChild, 'padding-left');
    const sidebarWidth = sidebar.clientWidth;
    const containerWidth = container.firstChild.clientWidth;
    const mobile = containerWidth <= 550; // Need to update CSS when changing this value

    const maxOicePlayerHeight = window.innerHeight - paddingTop - (marginTop * 2);
    const maxOicePlayerWidth = containerWidth - (mobile ? 0 : sidebarWidth) - (paddingLeft * 2);

    let oicePlayerSize = 0;
    if (mobile) {
      oicePlayerSize = maxOicePlayerWidth;
    } else if (maxOicePlayerWidth < maxOicePlayerHeight) {
      oicePlayerSize = maxOicePlayerWidth;
    } else {
      oicePlayerSize = maxOicePlayerHeight;
    }
    const marginLeft = mobile ? 0 : paddingLeft + ((maxOicePlayerWidth - oicePlayerSize) / 2);

    if (prevContainerWidth !== containerWidth) {
      this.setState({ oicePlayerSize, containerWidth, marginLeft, mobile });
    }

    // XXX: Hard code, IE10+
    if (this.miniCredits && this.miniCredits.classList) {
      this.miniCredits.classList.remove('short');
      const lastAvatarEl = this.miniCredits.lastChild;
      const margin = lastAvatarEl.offsetTop % lastAvatarEl.clientHeight;
      if (lastAvatarEl.offsetTop <= margin) {
        this.miniCredits.classList.add('short');
      }
    }
  }

  presentModalToSaveCover = (imageUrl) => {
    const { dispatch, t, oice } = this.props;
    dispatch(AlertDialog.toggle({
      title: t('preview.saveCover'),
      body: (
        <div className="preview-modal-body">
          <img alt="preview" width={350} height={350} src={imageUrl} />
        </div>
      ),
      width: 398,
      confirmCallback: () => {
        const payload = {
          id: oice.storyId,
          name: oice.storyName,
          coverImage: convertDataURLtoFile(imageUrl),
        };
        dispatch(Actions.updateStoryCover(payload));
      },
    }));
  }

  renderMiniCredits(users) {
    if (!users) return null;
    const { oice } = this.props;
    return (
      <div
        ref={ref => this.miniCredits = ref}
        className="credit-users mini"
      >
        {users.map((user, index) => (
          <Avatar
            key={user.id}
            label={user.displayName}
            size={index === 0 ? 60 : 28}
            src={getThumbnail(user.avatar, 200)}
            mini
          />
        ))}
      </div>
    );
  }

  renderDetailedCredits(credits) {
    if (!credits) return null;
    const { t } = this.props;
    return (
      <div className="credits-detailed">
        {CREDITS_KEY.map((key) => {
          const users = credits[key];
          return users && users.length > 0 && (
            <div key={key} className="credits-group">
              <h2 className="credits-group-tilte">
                {t(`credit.${key}`)}
              </h2>
              <div className="credit-users">
                {users.map(user =>
                  <Avatar
                    key={user.id}
                    label={user.displayName}
                    size={28}
                    src={getThumbnail(user.avatar, 200)}
                    onClick={() => window.location.href = `/user/${user.id}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  renderPreviewPanel() {
    const { t } = this.props;
    return (
      <div className="preview-panel">
        <RaisedButton
          disabled={!this.state.isStartedPlaying}
          icon={<CameraIcon />}
          label={t('preview.screenCapture')}
          mini
          onClick={this.handleScreenCaptureButtonClick}
        />
      </div>
    );
  }

  renderOiceSingleView() {
    const { t, oice, credits } = this.props;
    const {
      isEndedPlaying,
      isPreview,
      marginLeft,
      mobile,
      oicePlayerSize,
      smsModalOpen,
    } = this.state;

    const style = {
      oicePlayerWrapper: {
        position: mobile ? 'relative' : 'fixed',
        width: oicePlayerSize,
        height: oicePlayerSize,
        left: marginLeft,
      },
      sidebar: {
        height: mobile ? null : oicePlayerSize,
        marginLeft: mobile ? null : oicePlayerSize,
      },
    };

    const containerClassName = classNames('oice-single-view', {
      mobile,
    });

    const oiceChapter = t('label.episode', {
      episode: oice.order + 1,
    });

    const deepLinkOiceUuid = isEndedPlaying ? oice.nextEpisode.uuid : oice.uuid;
    const query = queryString.stringify({
      // data for branch or webhook
      $desktop_url: OiceSingleViewUtils.getDesktopURL(deepLinkOiceUuid, oice.language),
      '~channel': 'qrcodeWeb',
      referrer2: document.referrer,

      // data related to oice
      uuid: deepLinkOiceUuid,
      language: oice.language,
      isPreview,
    });
    const deepLink = `${BRANCH_URL}?${query}`;

    return (
      <Container
        ref={ref => this.container = ref}
        className={containerClassName}
        fluid
      >
        <div className="oice-player-wrapper" style={{ ...style.oicePlayerWrapper }}>
          <iframe
            ref={ref => this.iframe = ref}
            className="oice-player"
            scrolling="no" // For responsive behavior in iOS
            src={this.getOiceViewUrl(isPreview, oice)}
          />
        </div>
        <div
          ref={ref => this.sidebar = ref}
          className="oice-single-view-sidebar"
          style={{ ...style.sidebar }}
        >
          <div className="oice-details">
            <div className="oice-header">
              <div className="oice-chapter">
                {`${oice.storyName} ${oiceChapter}`}
              </div>
              <div className="oice-title">
                {oice.name}
              </div>
            </div>
            {oice.description && (
              <div className="oice-description">
                {oice.description}
              </div>
            )}
            <hr />
            {isPreview && this.renderPreviewPanel()}
            {isPreview && <hr />}
            {credits &&
              <ExpansionPanel
                arrowPosition="top"
                border={false}
                either
                onClick={this.handleToggleCredit}
              >
                <ExpansionPanel.Header >
                  {this.renderMiniCredits(credits.mini)}
                </ExpansionPanel.Header>
                <ExpansionPanel.Content>
                  {this.renderDetailedCredits(credits.grouped)}
                </ExpansionPanel.Content>
              </ExpansionPanel>
            }
            {credits && !isPreview && <hr />}
            <div className="get-app">
              <AppIcon />
              <OutlineButton
                color="blue"
                label={t('label.downloadForBetterExperience')}
                onClick={this.handleToggleSmsModal}
              />
              <hr />
              <div className="qr-code">
                <QRCode value={deepLink} />
              </div>
            </div>
          </div>
        </div>
        {oice &&
          <SmsModal
            isCloseButtonShowed={!isEndedPlaying}
            isEndedPlaying={isEndedPlaying}
            isPreview={isPreview}
            oice={oice}
            open={smsModalOpen}
            onToggle={this.handleToggleSmsModal}
          />
        }
      </Container>
    );
  }

  render() {
    const { oice } = this.props;
    if (!oice) return <LoadingScreen />;
    if (!isMobileAgent()) {
      return this.renderOiceSingleView();
    }
    return (
      <DeepView
        oice={oice}
      />
    );
  }
}
