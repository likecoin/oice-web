import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import update from 'immutability-helper';

import _get from 'lodash/get';

import FlatButton from 'ui-elements/FlatButton';
import Form from 'ui-elements/Form';
import ImageUpload from 'ui-elements/ImageUpload';
import TextField from 'ui-elements/TextField';

import { getImageUrlFromFile } from 'common/utils';

import FacebookSettingModal from './FacebookSettingModal';
import WordCount from './WordCount';

import * as Actions from './StorySettingModal.actions';

import './StorySettingModal.style.scss';

function isNewlyTranslatedStory(story) {
  // there is no author for story with newly translated language
  return !_get(story, 'author');
}

@translate(['StorySettingTab', 'Language', 'editor'])
@connect(store => ({ ...store.editorPanel.StorySettingModal }))
export default class StorySettingModal extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    language: PropTypes.string,
    mainLanguage: PropTypes.string,
    story: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      isFacebookSettingOpen: false,
    };
  }

  componentDidMount() {
    const { dispatch, story } = this.props;
    if (!isNewlyTranslatedStory(story)) {
      // only fetch word count for existing locales
      dispatch(Actions.fetchStoryWordCount(story.id, story.language));
    }
  }

  handleToggleFacebookSetting = () => {
    const isFacebookSettingOpen = !this.state.isFacebookSettingOpen;
    this.setState({ isFacebookSettingOpen });
  }

  handleSaveFacebookOgCover = async (ogImageFile) => {
    const { dispatch, story, language } = this.props;
    const ogImage = await getImageUrlFromFile(ogImageFile);
    dispatch(Actions.saveStoryOgImage({
      ogImageFile,
      ogImage,
      story,
      language,
    }));
    this.setState({ isFacebookSettingOpen: false });
  }

  handleStoryNameChange = (payload) => {
    this.props.dispatch(Actions.updateStoryName(payload));
  }

  handleStoryDescriptionChange = (payload) => {
    this.props.dispatch(Actions.updateStoryDescription(payload));
  }

  handleCoverImageChange = async (coverImage) => {
    const { dispatch, story, language } = this.props;
    const cover = await getImageUrlFromFile(coverImage);
    dispatch(Actions.updateStoryCover({
      coverImage,
      cover,
      language,
    }));
  }

  render() {
    const { t, language, mainLanguage } = this.props;
    const { isFacebookSettingOpen } = this.state;
    const story = this.props.story || {};
    return (
      <Form>
        <Form.Section>
          <Form.Section.Side>
            <ImageUpload
              height={144}
              src={story.cover}
              width={144}
              onChangeImage={this.handleCoverImageChange}
            />
            <div className="cover-description">
              <p>{t('label.uploadStoryCover')}</p>
              {(mainLanguage !== language) && (
                <p>({t(language)})</p>
              )}
            </div>
            <FlatButton
              label={t('label.facebookSetting')}
              onClick={this.handleToggleFacebookSetting}
            />
          </Form.Section.Side>
          <Form.Section.Main>
            <TextField
              ref={(e) => { this.titleTextfield = e; }}
              placeholder={t('placeholder.name')}
              showWarning={story.name === ''}
              value={story.name}
              fullWidth
              onChange={storyName => this.handleStoryNameChange({
                language,
                storyName,
              })}
            />
            <TextField
              placeholder={t('placeholder.description')}
              value={story.description}
              fullWidth
              multiLine
              onChange={storyDescription => this.handleStoryDescriptionChange({
                language,
                storyDescription,
              })}
            />
            {!isNewlyTranslatedStory(story) && <WordCount count={story.wordCount} />}
          </Form.Section.Main>
        </Form.Section>
        <FacebookSettingModal
          language={language}
          ogImage={story.ogImage}
          open={isFacebookSettingOpen}
          onClose={this.handleToggleFacebookSetting}
          onSave={this.handleSaveFacebookOgCover}
          onOgImageUpload={this.handleOgImageUpload}
        />
      </Form>
    );
  }
}
