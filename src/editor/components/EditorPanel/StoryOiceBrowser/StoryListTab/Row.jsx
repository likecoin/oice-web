import React from 'react';
import PropTypes from 'prop-types';
import { getDisplayTime } from 'editor/utils/datetime.js';


export default class StoryListRow extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    story: PropTypes.object.isRequired,
    onClick: PropTypes.func,
  }

  handleClick = (index) => {
    if (this.props.onClick) this.props.onClick(index);
  }

  render() {
    const { story, index } = this.props;
    return (
      <div
        className="list-row clickable"
        id={`story-${story.id}`}
        key={story.id}
        onClick={() => this.handleClick(index)}
      >
        <div className="story-name">
          {story.name}
        </div>
        <div className="author">
          {story.author.displayName}
        </div>
        <div className="last-modified-time">
          {getDisplayTime(story.updatedAt)}
        </div>
      </div>
    );
  }
}
