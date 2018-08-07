import React from 'react';
import PropTypes from 'prop-types';

import { OICE_VIEW_URL_BASE } from 'common/constants';

import './Embed.styles.scss';

export default class Embed extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { params, location } = this.props;
    const viewUrl = `${OICE_VIEW_URL_BASE}/view/${params.uuid}${location.search}`;
    const iframeHTML = {
      __html: `
        <iframe
          allow="autoplay"
          frameborder="0"
          scrolling="no"
          src="${viewUrl}"
          title="${params.uuid}"
        />
      `,
    };

    return (
      <div className="embed__oice-player-wrapper" dangerouslySetInnerHTML={iframeHTML} />
    );
  }
}
