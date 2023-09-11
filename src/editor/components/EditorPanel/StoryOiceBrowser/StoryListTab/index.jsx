import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import FlatButton from 'ui-elements/FlatButton';
import AddIcon from 'common/icons/add';

import * as StoryAction from 'editor/actions/story';

import StoryListRow from './Row';
import AdditionRow from '../AdditionRow';

import Actions from '../actions';

import './styles.scss';


@translate(['editor'])
export default class StoryListTab extends React.Component {
  static propTypes = {
    stories: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    focused: PropTypes.bool,
    onAdd: PropTypes.func,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    focused: false,
  }

  constructor(props) {
    super(props);
    this.state = { isAdding: false };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.focused && !nextProps.focused) {
      this.toggleAddButton(false);
    }
    if (nextProps.isAdding) {
      this.setState({ isAdding: nextProps.isAdding });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const storiesCount = this.props.stories.length;
    const prevStoriesCount = prevProps.stories.length;
    if (storiesCount - prevStoriesCount === 1) {
      this.handleStoryClick(storiesCount - 1);
    }
  }

  handleAddedButtonClick = () => this.toggleAddButton(true);

  handleCancelAddStoryRequest = () => this.toggleAddButton(false);

  handleStoryClick = (index) => {
    const { onSelect, stories } = this.props;
    const story = stories[index];
    if (onSelect) onSelect(story);
    this.setState({ isAdding: false });
  }

  handleConfirmAddStoryRequest = (newStoryTitle) => {
    if (this.props.onAdd) this.props.onAdd(newStoryTitle);
    this.setState({ isAdding: false });
  }

  toggleAddButton = (isShow) => {
    if (isShow !== this.state.isAdding) {
      this.setState({ isAdding: isShow });
    }
  }

  render() {
    const { t, stories } = this.props;
    const { isAdding } = this.state;

    return (
      <div id="stories-list-tab">
        {!isAdding &&
          <div className="add-section">
            <FlatButton
              icon={<AddIcon />}
              label={t('storiesList.addButton')}
              onClick={this.handleAddedButtonClick}
            />
          </div>
        }
        <div id="stories-list">
          {isAdding &&
            <AdditionRow
              placeholder={t('storiesList.addPlaceholder')}
              onCancel={this.handleCancelAddStoryRequest}
              onConfirm={this.handleConfirmAddStoryRequest}
            />
          }
          {stories.map((story, index) => (
            <StoryListRow
              key={story.id}
              index={index}
              story={story}
              onClick={this.handleStoryClick}
            />
          ))}
        </div>
      </div>
    );
  }
}
