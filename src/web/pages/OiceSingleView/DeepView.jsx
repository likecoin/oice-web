/* global branch: true */

import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import Avatar from 'ui-elements/Avatar';

import { getThumbnail } from 'common/utils';
import { BRANCH_KEY } from 'common/constants/branch';
import * as OiceSingleViewUtils from './utils';


import './DeepView.style.scss';

function handleDeepViewCallToAction({ oice, t, data }) {
  // Turn page to a deep view
  branch.deepview(
    // get deep link data
    OiceSingleViewUtils.getDeepLinkObject({
      channel: 'deepviewButton',
      data: {
        referrer2: document.referrer,
        ...data,
      },
      oice,
      t,
    }),
    // options: open_app is true by default (try to open app automatically if installed and deeplink to the content)
    undefined,
    // callback after deepview is initialized
    (error) => {
      if (!error) {
        // call to action if no error in deepview method
        branch.deepviewCta();
      }
    }
  );
}

@translate('oiceSingleView')
export default class DeepView extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    oice: PropTypes.object.isRequired,
  };

  handleCallToAction(abtest) {
    const { t, oice } = this.props;
    // a/b test for the clicking habit in deep view (cover VS button)
    handleDeepViewCallToAction({
      data: { abtest },
      oice,
      t,
    });
  }

  render() {
    const { t, oice } = this.props;
    const { author } = oice;

    const coverImage = oice.storyCover || '/static/img/oice-default-cover2.jpg';
    const description = oice.storyDescription || oice.description || oice.ogDescription;

    return (
      <div className="deep-view-wrapper">
        <div className="deep-view-cover" onClick={() => this.handleCallToAction('a')}>
          <img alt="oice cover" src={coverImage} />
          <div className="oice-details">
            <small>
              {`${oice.storyName} ${t('label.episode', { episode: (oice.order + 1) })}`}
            </small>
            <p>{oice.name}</p>
          </div>
        </div>
        <div className="deep-view-snippet">
          <div className="get-app">
            <img alt="get oice app" src="/static/img/oice-default-cover.jpg" />
            <span role="button" onClick={() => this.handleCallToAction('b')}>
              {t('label.getApp')}
            </span>
          </div>
          <div className="story-description">
            <p>{description || t('label.noStoryDescription')}</p>
            <Avatar
              label={author.displayName}
              size={52}
              src={getThumbnail(author.avatar, 200)}
              vertical
            />
          </div>
        </div>
      </div>
    );
  }
}
