import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'react-router-redux';
import classNames from 'classnames';

import _get from 'lodash/get';

import FlatButton from 'ui-elements/FlatButton';
import LinkTooltip from 'ui-elements/LinkTooltip';
import OutlineButton from 'ui-elements/OutlineButton';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import Throttle from 'ui-elements/Throttle';

import AddIcon from 'common/icons/add';
import CloseIcon from 'common/icons/close-bold';
import PlayIcon from 'common/icons/play';
import CopyIcon from 'common/icons/duplicate';
import SettingIcon from 'common/icons/setting';

import { DOMAIN_URL } from 'common/constants';

import './styles.scss';

@translate(['StoryDashboard', 'Language'])
@connect()
export default class StoryDetails extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    isDashboard: PropTypes.bool,
    oices: PropTypes.array,
    story: PropTypes.object,
    onAddOice: PropTypes.func,
    onCopyOice: PropTypes.func,
    onCopyStory: PropTypes.func,
    onOpenStorySettingModal: PropTypes.func,
    onRequestClose: PropTypes.func,
  }

  static defaultProps = {
    isDashboard: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedOiceIndex: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.story);
    if (_get(nextProps, 'story.id') !== _get(this.props, 'story.id')) {
      this.setState({ selectedOiceIndex: undefined });
    }
  }

  handleCloseButtonClick = () => {
    const { onRequestClose } = this.props;
    if (onRequestClose) onRequestClose();
  }

  handleOnClickStorySettingButton = () => {
    const { onOpenStorySettingModal } = this.props;
    if (onOpenStorySettingModal) onOpenStorySettingModal();
  }

  handleClickCopyStoryButton = () => {
    const { onCopyStory } = this.props;
    if (onCopyStory) onCopyStory();
  }

  handleOnClickOiceRow = ({ target }, index) => {
    if (target.className.includes('button')) return;
    const { selectedOiceIndex } = this.state;
    if (selectedOiceIndex !== index) {
      this.setState({ selectedOiceIndex: index });
    }
  }

  handleOnClickEditOiceButton = ({ storyId, id }) => {
    this.props.dispatch(InteractiveTutorial.Action.achieve(['115c8cf']));
    this.props.dispatch(push(`story/${storyId}/oice/${id}`));
  }

  handleClickCopyOiceButton = (oice) => {
    const { onCopyOice } = this.props;
    if (onCopyOice) onCopyOice(oice);
  }

  handleClickPlayPublishOiceButton = (url) => {
    window.open(url, '_blank');
  }

  handleClickAddOiceButton = () => {
    const { onAddOice } = this.props;
    if (onAddOice) onAddOice();
  }

  renderOiceRows(props) {
    const { t, oices, isDashboard } = this.props;
    const { selectedOiceIndex } = this.state;
    return (
      <div className="oice-rows">
        {oices.map((oice, index) => {
          const publishDisable = oice.hasPublished ? '' : ' disabled';
          const selected = (index === selectedOiceIndex) ? ' selected' : '';
          const oiceLink = !isDashboard ? `${DOMAIN_URL}/story/${oice.uuid}` : oice.shareUrl;
          return (
            <div
              key={`oice-row-${oice.id}`}
              className={`oice-row${selected}`}
              onClick={e => this.handleOnClickOiceRow(e, index)}
            >
              <div className="left-details">
                <span>{index + 1}</span>
                {isDashboard && <div className={`oice-status${publishDisable}`} />}
                <span>{oice.name}</span>
              </div>
              <div className="right-button-group">
                {isDashboard && (
                  <div
                    className="edit-oice-button"
                    onClick={() => this.handleOnClickEditOiceButton(oice)}
                  >
                    <OutlineButton
                      color="red"
                      label={t('label.button.edit')}
                      width={88}
                    />
                  </div>
                )}
                {isDashboard && (
                  <FlatButton
                    icon={<CopyIcon />}
                    onClick={() => this.handleClickCopyOiceButton(oice)}
                  />
                )}
                <div
                  className={classNames('play-oice-button', {
                    disabled: isDashboard && !oice.hasPublished,
                  })}
                  onClick={() => this.handleClickPlayPublishOiceButton(oiceLink)}
                >
                  <div className="play-oice-icon" />
                </div>
                <LinkTooltip
                  className={classNames({
                    disabled: isDashboard && !oice.hasPublished,
                  })}
                  float={false}
                  link={oiceLink}
                />
              </div>
            </div>
          );
        })}
        {isDashboard &&
          <Throttle>
            {throttle => (
              <div
                className="oice-row add"
                onClick={throttle(this.handleClickAddOiceButton)}
              >
                <AddIcon />
                <span>{t('label.button.addOice')}</span>
              </div>
            )}
          </Throttle>
        }
      </div>
    );
  }

  render() {
    const {
      t, oices, story, isDashboard,
    } = this.props;
    const { hoverOiceIndex, selectedOiceIndex } = this.state;
    // show hovered oice => selected oice => default first oice
    const selectedOice = oices[hoverOiceIndex] || oices[selectedOiceIndex] || oices[0];
    let description = _get(selectedOice, 'description', '');
    if (description.length > 18) {
      description = `${description.substring(0, 18)} ...`;
    }
    const backgroundImage = selectedOice ?
      `url("${_get(selectedOice, 'image.origin', '/static/img/oice-default-cover2.jpg')}")` : '';
    return (
      <div className="story-details-wrapper">
        <div className="story-info">
          <div className="story-name">
            <h1>{_get(story, 'name')}</h1>
            {isDashboard &&
              <FlatButton
                icon={<SettingIcon />}
                onClick={this.handleOnClickStorySettingButton}
              />
            }
            {isDashboard && (
              <FlatButton
                icon={<CopyIcon />}
                onClick={this.handleClickCopyStoryButton}
              />
            )}
          </div>
          {isDashboard &&
            <div className="story-language">
              {t(_get(story, 'language'))}
            </div>
          }
        </div>
        <div className="story-details">
          {this.renderOiceRows()}
        </div>
        <div
          className="close-icon"
          onClick={this.handleCloseButtonClick}
        >
          <CloseIcon />
        </div>
      </div>
    );
  }
}
