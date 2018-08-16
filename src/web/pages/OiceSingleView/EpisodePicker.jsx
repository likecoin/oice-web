import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Dropdown from 'ui-elements/Dropdown';

import './EpisodePicker.style.scss';

@translate('oiceSingleView')
export default class EpisodePicker extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    episodes: PropTypes.array,
    selectedEpisode: PropTypes.object,
  }

  render() {
    const {
      episodes, onSelect, selectedEpisode, t,
    } = this.props;

    const storyCover = selectedEpisode.storyCover || `${window.location.origin}/static/img/oice-default-cover2.jpg`;

    return (
      <div className="episode-picker">
        <div className="episode-picker__current-episode-wrapper">
          <img alt="story cover" src={selectedEpisode.storyCover} />
          <div className="episode-picker__title-wrapper">
            <p className="episode-picker__story-title">
              {selectedEpisode.storyName} {t('label.episode', { episode: selectedEpisode.order + 1 })}
            </p>
            <p className="episode-picker__oice-title">
              {selectedEpisode.name}
            </p>
          </div>
        </div>

        <hr />

        <div className="episode-picker__select-episode-wrapper">
          <span>{t('label.selectEpisode')}</span>
          <Dropdown
            placeholder={t('label.selectEpisode')}
            values={episodes}
            selectedIndexes={[selectedEpisode.order]}
            fullWidth
            onChange={this.props.onSelect}
          />
        </div>
      </div>
    );
  }
}
