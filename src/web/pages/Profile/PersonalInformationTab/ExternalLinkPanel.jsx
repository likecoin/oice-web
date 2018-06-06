import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import FlatButton from 'ui-elements/FlatButton';
import Progress from 'ui-elements/Progress';

import AddIcon from 'common/icons/add';

import ExternalLink from './ExternalLink';
import ProfilePanel from '../ProfilePanel';

import * as Actions from '../Profile.actions';

@connect(store => ({
  user: store.Profile.userProfile,
  ...store.Profile.externalLink,
}))
@translate('Profile')
export default class ExternalLinkList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    loaded: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    onChangeName: PropTypes.func.isRequired,
    links: PropTypes.array,
    types: PropTypes.array,
    savingIds: PropTypes.array,
    deletingIds: PropTypes.array,
  };

  componentDidMount() {
    const { dispatch, user, loaded } = this.props;
    if (!loaded) {
      dispatch(Actions.fetchExternalLinks(user.id));
    }
  }

  handleAddLink = () => {
    this.props.dispatch(Actions.addTemporaryLink());
  }

  handleSaveLink = (payload, link) => {
    this.props.dispatch(Actions.saveLink(payload, link));
  }

  handleDeleteLink = (linkId) => {
    this.props.dispatch(Actions.deleteLink(linkId));
  }

  handleDragLink = (payload, isSave = false) => {
    this.props.dispatch(Actions.updateLinkOrder(payload, isSave));
  }

  renderExternalLink = (link, index) => {
    const {
      t, types, savingIds, deletingIds,
    } = this.props;
    const statusProps = {
      isSaving: savingIds.includes(link.id),
      isDeleting: deletingIds.includes(link.id),
    };
    return (
      <ExternalLink
        key={link.id}
        index={index}
        link={link}
        linkTypes={types}
        {...{ ...statusProps }}
        onDeleteLink={this.handleDeleteLink}
        onDrag={(...payload) => this.handleDragLink(payload, true)}
        onHoverDrag={(...payload) => this.handleDragLink(payload)}
        onSaveLink={payload => this.handleSaveLink(payload, link)}
      />
    );
  }

  renderExternalLinks(links) {
    const { t } = this.props;
    return (
      <div>
        {links.map(this.renderExternalLink)}
        <div className="external-link add">
          <FlatButton
            icon={<AddIcon />}
            label={t('personalInformation.button.addLink')}
            onClick={this.handleAddLink}
          />
        </div>
      </div>
    );
  }

  render() {
    const {
      t, loading, links, onChangeName,
    } = this.props;

    return (
      <ProfilePanel
        header={t('personalInformation.header.externalLinks')}
      >
        <div className="external-link-list">
          {loading ? (
            <Progress.LoadingIndicator />
          ) : this.renderExternalLinks(links)}
        </div>
      </ProfilePanel>
    );
  }
}
