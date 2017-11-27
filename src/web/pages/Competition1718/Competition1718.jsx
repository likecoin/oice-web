/* global firebase: true */

import React from 'react';
import { I18n } from 'react-i18next';
import Sticky from 'react-stickynode';
import PropTypes from 'prop-types';

import _times from 'lodash/times';
import classNames from 'classnames';

import Avatar from 'ui-elements/Avatar';
import Card from 'ui-elements/Card';
import GridList from 'ui-elements/GridList';
import Separator from 'ui-elements/Separator';

import './Competition1718.styles.scss';


export default class Competition1718 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      banner: '',
      header: {
        subtitle: '',
        title: '',
        moreInfoButton: {
          link: '',
          title: '',
        },
      },
      body: {
        header: '',
        entries: [],
      },
    };
  }

  componentDidMount() {
    this._fetchContent();
  }

  _fetchContent= async () => {
    const content = await firebase.database()
                                  .ref('competition1718')
                                  .once('value')
                                  .then(snapshot => snapshot.val());

    if (content) this.setState(content);
  }

  _renderBanner() {
    const { banner, header } = this.state;

    if (!banner) return null;

    return (
      <div className="page-banner">
        <div>
          <img src={banner} alt={header.title} />
        </div>
      </div>
    );
  }

  _renderHeader() {
    const { header } = this.state;

    if (!header) return null;

    const { moreInfoButton, subtitle, title } = header;

    return (
      <header className="page-header">

        <Sticky top="#web-navbar" bottomBoundary=".competition1718">
          <div className="headline">
            <div className="title">
              <h1>{title}</h1>
              <h2>{subtitle}</h2>
            </div>

            <a className="more-info" href={moreInfoButton.link}>
              {moreInfoButton.title}
            </a>

          </div>
        </Sticky>

      </header>
    );
  }

  _renderBody() {
    const { body } = this.state;

    if (!body) return null;

    const randomizedStories = body.entries.sort(() => 0.5 - Math.random());

    return (
      <div className="page-content">
        <div>

          <header
            className="content"
            dangerouslySetInnerHTML={{ __html: body.header }}
          />

          <section className="grid-gallery">
            <GridList elementWidth={220} interSpace={24}>
              {body.entries.map(this._renderStory)}
            </GridList>
          </section>

        </div>
      </div>
    );
  }

  _renderStory = story => (
    <Card key={story.id} onClick={() => window.location.href = story.link}>
      <Card.Image src={story.thumbnail} />
      <Card.Content>
        <Card.Header>
          {story.name}
        </Card.Header>
        <Card.Meta>
          <div className="credits">
            <I18n>{(t => <span>{t('oiceSingleView:credit.director')}</span>)}</I18n>
            <Avatar
              label={story.author.name}
              src={story.author.avatar}
              size={34}
            />
          </div>
        </Card.Meta>
      </Card.Content>
    </Card>
  )

  render() {
    return (
      <article className="competition1718">
        <Separator />
        <section className="page-container">

          {this._renderBanner()}
          {this._renderHeader()}
          {this._renderBody()}

        </section>
      </article>
    );
  }
}
