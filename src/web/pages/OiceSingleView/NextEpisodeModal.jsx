/* global branch: true */

import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _get from 'lodash/get';
import _debounce from 'lodash/debounce';

import Modal from 'ui-elements/ModalTwo';
import Separator from 'ui-elements/Separator';

import {
  getNextEpisodeOice,
  initializeDeepView,
} from './utils';

import './NextEpisodeModal.style.scss';


function getModalWidth() {
  return window.innerWidth - (24 * 2);
}

@translate(['NextEpisodeModal'])
export default class NextEpisodeModal extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,

    // Props
    isEndedPlaying: PropTypes.bool.isRequired,
    oice: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,

    onToggle: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      modalWidth: getModalWidth(),
    };
  }

  componentDidMount() {
    this.resizeDebounce = _debounce(this.handleResize, 50);
    initializeDeepView({
      oice: getNextEpisodeOice(this.props.oice),
    });
  }

  componentWillUpdate({ open }) {
    if (open !== this.state.open) {
      const body = document.querySelector('body');
      if (open) {
        body.style.overflow = 'hidden';
        window.addEventListener('resize', this.resizeDebounce, false);
      } else {
        body.style.overflow = 'auto';
        window.removeEventListener('resize', this.resizeDebounce, false);
      }
    }
  }

  handleResize = () => this.setState({ modalWidth: getModalWidth() });

  handleCTA = () => branch.deepviewCta();

  render() {
    const { t, isEndedPlaying, oice, open, onToggle } = this.props;
    const { modalWidth } = this.state;
    if (!oice) return null;

    const coverImage = oice.storyCover || '/static/img/oice-default-cover2.jpg';

    return (
      <Modal
        id="next-episode-modal"
        open={open}
        width={modalWidth}
        onClickOutside={isEndedPlaying ? null : onToggle}
      >
        <Modal.Header
          onClickCloseButton={isEndedPlaying ? null : onToggle}
        >
          {t('label.wantToWatchNextEpisode')}
        </Modal.Header>
        <Modal.Body padding={false}>
          <Separator />
          <div
            className="story-cover"
            style={{ width: modalWidth, height: modalWidth }}
            onClick={this.handleCTA}
          >
            <img alt="story cover" src={coverImage} />
          </div>
          <Separator />
          <div className="call-to-action">
            <div className="button" onClick={this.handleCTA}>
              {t('button.watchInApp')}
            </div>
            <p onClick={this.handleCTA}>{t('label.downloadForFree')}</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
