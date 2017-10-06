import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import _get from 'lodash/get';
import _pick from 'lodash/pick';

import Progress from 'ui-elements/Progress';

import OiceBlock from './OiceBlock';
import * as Actions from './StorySettingModal.actions';

import './StorySettingModal.style.scss';


@connect((store) => {
  const { content, mainLanguage } = store.editorPanel.StorySettingModal;
  return _pick(content[mainLanguage], ['story', 'oices']);
})
export default class OiceSettingTab extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    oices: PropTypes.array,
    story: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedRowIndex: -1,
    };
  }

  componentDidMount() {
    const { dispatch, oices, story } = this.props;
    if (!oices) {
      this.props.dispatch(Actions.fetchOices(story));
    }
  }

  handleUpdateOiceName = (payload) => {
    const { dispatch, story } = this.props;
    dispatch(Actions.updateOiceName({
      language: story.language,
      ...payload,
    }));
  }

  handleToggleOiceSharingOption = (payload) => {
    const { story } = this.props;
    this.props.dispatch(Actions.updateOiceSharingOption({
      language: story.language,
      ...payload,
    }));
  }

  handleDeleteOice = (oiceId) => {
    this.props.dispatch(Actions.updateOiceDeletion({ oiceId }));
  }

  handleDragOiceBlock = (dragIndex, hoverIndex) => {
    this.props.dispatch(Actions.updateOiceOrder({ dragIndex, hoverIndex }));
  }

  handleSelectOiceRow = (selectedRowIndex) => {
    this.setState({ selectedRowIndex });
  }

  renderOiceRow = (oice, index) => (
    <OiceBlock
      key={oice.id}
      index={index}
      isSelected={index === this.state.selectedRowIndex}
      oice={oice}
      onDrag={this.handleDragOiceBlock}
      onDeleteOice={this.handleDeleteOice}
      onSaveName={this.handleUpdateOiceName}
      onSelectRow={this.handleSelectOiceRow}
      onToggleSharingOption={this.handleToggleOiceSharingOption}
    />
  );

  render() {
    const { oices } = this.props;
    return (
      <div className="oice-tab">
        {!oices ? (
          <Progress.LoadingIndicator />
        ) : (<div className="oice-rows">
          {oices.map(this.renderOiceRow)}
        </div>)}
      </div>
    );
  }
}
