import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { replace } from 'react-router-redux';

import SwipeableViews from 'react-swipeable-views';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import LoadingScreen from 'ui-elements/LoadingScreen';

import InteractiveTutorial from 'editor/components/InteractiveTutorial';

import StoryListTab from './StoryListTab';
import OiceListTab from './OiceListTab';

import StoryPicker from 'editor/components/EditorPanel/StoryPicker';

import * as OiceAction from 'editor/actions/oice';
import * as StoryAction from 'editor/actions/story';

import Actions from './actions';
import Reducer from './reducer';

import './styles.scss';


@translate(['editor'])
@connect((store) => {
  const {
    storyOiceBrowser,
  } = store.editorPanel;
  return {
    storiesList: store.stories.list,
    ...storyOiceBrowser,
  };
})
export default class StoryOiceBrowser extends React.Component {
  static Action = Actions;
  static Reducer = Reducer;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    storiesList: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    isAddingOice: PropTypes.bool,
    isAddingStory: PropTypes.bool,
    loading: PropTypes.bool,
    oices: PropTypes.array,
    open: PropTypes.bool,
    paramsStoryId: PropTypes.number,
    selectedStory: PropTypes.object,
    tabSelectedIndex: PropTypes.number,
  }

  static defaultProps = {
    isAddingOice: false,
    isAddingStory: false,
    loading: false,
    open: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      animateTransitions: false,
      isTransitionEnd: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tabSelectedIndex !== nextProps.tabSelectedIndex) {
      this.setState({
        isTransitionEnd: true,
        animateTransitions: false,
      });
    }
  }

  handleStoryAddRequest = (storyTitle) => {
    this.props.dispatch(StoryAction.addStory(storyTitle));
  }

  handleStorySelect = (story) => {
    const {
      dispatch,
      paramsStoryId,
      oices,
    } = this.props;

    dispatch(Actions.selectStory(story));
    dispatch(Actions.setSelectedTabIndex(1));
    dispatch(Actions.fetchOices(story.id, this.handleAddOiceRequest));

    this.setState({
      animateTransitions: true,
      isTransitionEnd: false,
    });
  }

  handleAddOiceRequest = () => {
    this.oiceListTab.getWrappedInstance().requestAddOice();
  }

  handleOiceAddRequest = (oiceTitle) => {
    const {
      dispatch,
      selectedStory,
    } = this.props;
    dispatch(Actions.addOice(oiceTitle, selectedStory.id));
  }

  handleCopyOiceRequest = (oice) => {
    const { dispatch, t } = this.props;
    dispatch(StoryPicker.Action.open({
      selectedId: oice.storyId,
      title: t('oicesList.label.pickAStoryForCopyOice'),
      onSelect: (storyId) => {
        console.debug('handleCopyOiceRequest', storyId);
      },
    }));
  }


  handleOiceReorder = (reorderedOices) => {
    const {
      dispatch,
      paramsStoryId,
      selectedStory,
    } = this.props;

    dispatch(Actions.updateOicesOrder(selectedStory.id, reorderedOices));
    // Update the global oices list if the selected story does not change
    if (paramsStoryId === selectedStory.id) {
      dispatch(OiceAction.fetchedOices(reorderedOices));
    }
  }

  handleOiceSelect = (oices, index) => {
    const {
      dispatch,
      paramsStoryId,
      selectedStory,
    } = this.props;
    const oice = oices[index];

    dispatch(OiceAction.selectOice(oice));
    dispatch(StoryAction.selectStory(selectedStory));
    dispatch(OiceAction.fetchedOices(oices)); // Replace global oices
    dispatch(InteractiveTutorial.Action.achieve(['115c8cf']));

    this.handleStoryOiceModalClose(true);
  }

  handleSwipeableViewsTransitionEnd = () => {
    this.setState({
      animateTransitions: false,
      isTransitionEnd: true,
    });
  }

  handleStoryOiceModalClose = (selectedOice = false) => {
    const {
      dispatch,
      isAddingOice,
      isAddingStory,
      paramsStoryId,
    } = this.props;
    this.props.dispatch(Actions.closeStoryListOice());
    if (isAddingOice || isAddingStory) {
      this.props.dispatch(Actions.updateIsAddingStatus());
      if (!selectedOice) {
        // go back if not isAdding and not selected any oices
        if (isAddingStory) dispatch(replace('/dashboard'));
        if (isAddingOice) dispatch(replace('/dashboard'));
      }
    }
  }

  handleOnChangeIsAdding = () => {
  }

  render() {
    const {
      isAddingOice,
      isAddingStory,
      loading,
      oices,
      open,
      paramsStoryId,
      selectedStory,
      storiesList,
      t,
      tabSelectedIndex,
    } = this.props;

    const {
      animateTransitions,
      isTransitionEnd,
    } = this.state;

    let modelTitle;
    if (tabSelectedIndex === 0) {
      modelTitle = t('storiesList.title');
    } else if (selectedStory && selectedStory.id) {
      modelTitle = `${t('oicesList.title')} (${selectedStory.name})`;
    } else {
      modelTitle = t('oicesList.title');
    }

    return (
      <Modal
        height="auto"
        open={open}
        onClickOutside={this.handleStoryOiceModalClose}
      >
        <Modal.Header onClickCloseButton={this.handleStoryOiceModalClose}>
          {modelTitle}
        </Modal.Header>
        <Modal.Body padding={false}>
          <SwipeableViews
            animateTransitions={animateTransitions}
            className="story-oice-browser-swipeable-view"
            index={tabSelectedIndex}
            animateHeight
            disabled
            onTransitionEnd={this.handleSwipeableViewsTransitionEnd}
          >
            <StoryListTab
              focused={open && tabSelectedIndex === 0 && isTransitionEnd}
              isAdding={isAddingStory}
              stories={storiesList}
              onAdd={this.handleStoryAddRequest}
              onSelect={this.handleStorySelect}
            />
            <OiceListTab
              ref={ref => this.oiceListTab = ref}
              focused={open && tabSelectedIndex === 1 && isTransitionEnd}
              isAdding={isAddingOice}
              oices={oices}
              onAdd={this.handleOiceAddRequest}
              onReorder={this.handleOiceReorder}
              onRequestCopy={this.handleCopyOiceRequest}
              onSelect={this.handleOiceSelect}
            />
          </SwipeableViews>
          {loading && <LoadingScreen />}
        </Modal.Body>
      </Modal>
    );
  }
}
