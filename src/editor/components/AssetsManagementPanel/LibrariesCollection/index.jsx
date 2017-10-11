import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Container from 'ui-elements/Container';
import GridList from 'ui-elements/GridList';
import Card from 'ui-elements/Card';
import LibraryCard from './LibraryCard';

import { getLocalUserItem } from 'common/utils/auth';
import USER_ROLE from 'common/constants/userRoles';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import {
  fetchLibrariesByStory,
  fetchLibraries,
  addLibraryToStory,
  removeLibraryFromStory,
} from 'editor/actions/library';

import {
  toggleLibraryModal,
} from '../LibraryModal/redux.js';

import {
  selectLibrary,
} from '../LibraryPanel/actions.js';

import './styles.scss';

@translate('library')
@connect((store) => ({
  ...store.librariesCollection,
  userId: store.user.id,
}))
export default class LibrariesCollection extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    mine: PropTypes.array.isRequired,
    public: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    params: PropTypes.object,
    userId: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedAssets: [],
    };
  }

  componentDidMount() {
    const storyId = this.props.params.storyId;
    console.log('componentDidMount %s', storyId);
    this.props.dispatch(
      storyId ? fetchLibrariesByStory(storyId) : fetchLibraries()
    );
  }

  onClickUseAsset = obj => {
    const { selectedAssets } = this.state;
    if (!selectedAssets.contains(obj)) {
      selectedAssets.push(obj);
    }
  };

  getStoryId() {
    return this.props.params.storyId;
  }

  handleAddLibraryClick = () => {
    this.props.dispatch(toggleLibraryModal({ open: true }));
    this.props.dispatch(InteractiveTutorial.Action.achieve(['e1626fe']));
  }

  handleLibraryClick = (library) => {
    this.props.dispatch(selectLibrary(library));
  }

  handleLibrarySelect = (libraryId, selected) => {
    const storyId = this.getStoryId();
    if (storyId) {
      this.props.dispatch(
        !selected ?
        addLibraryToStory(storyId, libraryId) :
        removeLibraryFromStory(storyId, libraryId)
      );
    }
  }

  renderLibraries(libraries, selected = false) {
    const showSelected = this.getStoryId() !== undefined;
    const { t, userId } = this.props;
    return libraries.map((library, index) => (
      <LibraryCard
        key={library.id}
        library={library}
        mine={library.author && library.author.id === userId}
        selected={selected}
        t={t}
        onClick={this.handleLibraryClick}
        onSelect={showSelected ?
        () => this.handleLibrarySelect(library.id, selected) : null}
      />
    ));
  }

  render() {
    const { role } = getLocalUserItem();
    return (
      <Container id="libraries-collection">
        <GridList elementHeight={300} elementWidth={230}>
          {
            role !== USER_ROLE.NORMAL && <Card add onClick={this.handleAddLibraryClick} />
          }
          {this.renderLibraries(this.props.selected, true)}
          {this.renderLibraries(this.props.mine)}
          {this.renderLibraries(this.props.public)}
        </GridList>
      </Container>
    );
  }
}
