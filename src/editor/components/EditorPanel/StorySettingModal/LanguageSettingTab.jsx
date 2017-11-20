import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';
import _throttle from 'lodash/throttle';

import AlertDialog from 'ui-elements/AlertDialog';
import Dropdown from 'ui-elements/Dropdown';
import FlatButton from 'ui-elements/FlatButton';
import Progress from 'ui-elements/Progress';
import TextField from 'ui-elements/TextField';
import ToggleButton from 'ui-elements/ToggleButton';

import { SUPPORTED_STORY_LANGUAGES } from 'common/constants/i18n';

import StorySettingTab from './StorySettingTab';
import LanguageSelection from './LanguageSelection';
import LanguageOiceList from './LanguageOiceList';

import * as Actions from './StorySettingModal.actions';
import {
  TAB_LIST_ITEM,
  WORD_COUNT_WAIT_TIME_MS,
} from './StorySettingModal.constants';

import './StorySettingModal.style.scss';

@translate(['LanguageSettingTab', 'Language'])
@connect(store => ({
  content: store.editorPanel.StorySettingModal.content,
  loading: store.editorPanel.StorySettingModal.loading[TAB_LIST_ITEM.LANGUAGE],
  mainLanguage: store.editorPanel.StorySettingModal.mainLanguage,
  newLanguages: store.editorPanel.StorySettingModal.newLanguages,
  supportedLanguages: store.editorPanel.StorySettingModal.supportedLanguages,
}))
export default class LanguageSettingTab extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    content: PropTypes.object,
    loading: PropTypes.bool,
    mainLanguage: PropTypes.string,
    newLanguages: PropTypes.array,
    supportedLanguages: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {
      language: undefined,
    };
  }

  componentDidMount() {
    this._fetchWordCountThrottle = _throttle(
      this.handleMouseEnterOice,
      WORD_COUNT_WAIT_TIME_MS,
      {
        leading: false, // do not invoke on the leading edge of the timeout
      },
    );

    const { dispatch, supportedLanguages, newLanguages } = this.props;
    // default select the first supported language
    if (supportedLanguages.length > 0) {
      this.handleClickLanguage(supportedLanguages[0]);
    } else if (newLanguages.length > 0) {
      this.handleClickLanguage(newLanguages[0]);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { supportedLanguages } = nextProps;
    if (!this.props.supportedLanguages.length && this.props.supportedLanguages !== supportedLanguages) {
      this.handleClickLanguage(supportedLanguages[0]);
    }
  }

  handleAddLanguage = (language) => {
    this.props.dispatch(Actions.updateStoryLanguage({ language }));
    this.setState({ language });
  }

  handleClickLanguage = (language) => {
    this.setState({ language });
    if (!_get(this.props, `content[${language}].story`)) {
      this.props.dispatch(Actions.fetchStoryOiceWithLanguage(language));
    }
  }

  handleDeleteLanguage = (deletedLanguage) => {
    function languageIsNotDeleted(language) {
      return language !== deletedLanguage;
    }
    this.props.dispatch(Actions.removeStoryLanguage({ language: deletedLanguage }));
    if (this.state.language === deletedLanguage) {
      const { supportedLanguages, newLanguages } = this.props;
      // select the next available language option
      this.handleClickLanguage(supportedLanguages.find(languageIsNotDeleted) || newLanguages.find(languageIsNotDeleted));
    }
  }

  handleOiceNameChange = (payload) => {
    this.props.dispatch(Actions.updateOiceName({
      language: this.state.language,
      ...payload,
    }));
  }

  handleMouseEnterOice = (oice, index) => {
    this.props.dispatch(Actions.fetchOiceWordCount(oice, index));
  }

  handleOnMouseLeaveOice = () => {
    this._fetchWordCountThrottle.cancel();
  }

  renderLanguageSelection = (language, index) => (
    <LanguageSelection
      key={index}
      label={this.props.t(language)}
      selected={this.state.language === language}
      onClick={() => this.handleClickLanguage(language)}
      onDelete={() => this.props.dispatch(AlertDialog.toggle({
        open: true,
        body: this.props.t('label.confirmToDeleteLanguage'),
        confirmCallback: () => this.handleDeleteLanguage(language),
      }))}
    />
  );

  renderLanguageChoices(supportedLanguages) {
    const { t, mainLanguage } = this.props;
    const unsupportedLanguages = ['label.addLanguage', ...SUPPORTED_STORY_LANGUAGES.filter(language => (
      !supportedLanguages.includes(language) && language !== mainLanguage
    ))];

    return (
      <div className="language-selections">
        <h5>{t('label.otherLanguage')}</h5>
        {supportedLanguages && (
          <div className="sub-languages">
            {supportedLanguages.map(this.renderLanguageSelection)}
          </div>
        )}
        {unsupportedLanguages.length > 1 && (
          <Dropdown
            selectedIndexes={[0]}    // always show "addLanguage" label
            values={unsupportedLanguages.map(language => ({ text: t(language) }))}
            fullWidth
            onChange={indexes => this.handleAddLanguage(unsupportedLanguages[indexes[0]])}
          />
        )}
      </div>
    );
  }

  renderLanguageDetails() {
    const { content } = this.props;
    const { language } = this.state;
    const story = _get(this.props, `content[${language}].story`);
    const oices = _get(this.props, `content[${language}].oices`);
    if (!story || !oices) {
      return (
        <div className="language-details-loading">
          <Progress.LoadingIndicator />
        </div>
      );
    }
    return (
      <div>
        <StorySettingTab language={language} story={story} />
        <LanguageOiceList
          oices={oices}
          onChangeName={this.handleOiceNameChange}
          onMouseEnterOice={this._fetchWordCountThrottle}
          onMouseLeaveOice={this.handleOnMouseLeaveOice}
        />
      </div>
    );
  }

  render() {
    const { t, content, newLanguages, loading } = this.props;

    const supportedLanguages = [...this.props.supportedLanguages, ...newLanguages];

    return (
      <div className="language-tab">
        {this.renderLanguageChoices(supportedLanguages)}
        <div className="language-settings">
          {(supportedLanguages.length === 0 && !loading) ? (
            <div className="no-languages-description">
              <span>{t('placeholder.addLanguageGuideTitle')}</span>
              <p>{t('placeholder.addLanguageGuideDescription')}</p>
            </div>
          ) : this.renderLanguageDetails()}
        </div>
      </div>
    );
  }
}
