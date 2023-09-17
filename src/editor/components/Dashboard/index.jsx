import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { replace } from 'react-router-redux';

import classNames from 'classnames';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import Container from 'ui-elements/Container';
import Footer from 'ui-elements/Footer';
import NavBar from 'ui-elements/NavBar';
import SubNavBar from 'ui-elements/SubNavBar';

import Gallery from 'web/pages/User/Gallery';
import InteractiveTutorial from 'editor/components/InteractiveTutorial';
import StorySettingModal, { actions as StorySettingModalActions } from 'editor/components/EditorPanel/StorySettingModal';
import * as StoryAction from 'editor/actions/story';
import * as OiceAction from 'editor/actions/oice';

import * as SubNavBarConstants from 'ui-elements/SubNavBar/constants';
import Throttle from 'ui-elements/Throttle';

import StoryDetails from './StoryDetails';

import Actions from './actions';
import Reducer from './reducer';

import './styles.scss';


function getScreenWidth() {
  return window.innerWidth;
}

function getColumnWidth(totalWidth, interWidth, columns) {
  let columnWidth = 220;
  while (((columns * (columnWidth + interWidth)) - interWidth) > totalWidth) {
    columnWidth--;
  }
  return columnWidth;
}

@translate(['StoryDashboard'])
@connect((store) => {
  const {
    storyOiceBrowser,
    dashboard,
  } = store.editorPanel;
  return {
    storiesList: store.stories.list,
    user: store.user,
    ...dashboard,
  };
})
export default class Dashboard extends React.Component {
  static Actions = Actions;
  static Reducer = Reducer;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    oices: PropTypes.array,
    storiesList: PropTypes.array,
    user: PropTypes.object,
  }

  static defaultProps = {
    oices: [],
    storiesList: [],
  }

  static childContextTypes = {
    module: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      columnWidth: 220,
      isMobile: false,
      columns: 5,
      selectedItem: undefined,
      isSubNavBarNarrow: false,
    };
  }

  getChildContext() {
    return { module: 'editor' };
  }

  componentDidMount() {
    this.resizeDebounce = _debounce(this.handleResize, 50);
    this.scrollThrottle = _throttle(this.handleScroll, 20);
    window.addEventListener('resize', this.resizeDebounce, false);
    window.addEventListener('scroll', this.scrollThrottle, true);
    this.handleResize();
  }

  componentWillReceiveProps(nextProps) {
    const { selectedItem } = this.state;
    const { storiesList } = nextProps;
    if (storiesList && selectedItem) {
      const selectedStory = storiesList.find(story => story.id === selectedItem.id);
      if (!selectedStory) {
        // story is probably deleted
        this.setState({ selectedItem: undefined });
        this.props.dispatch(Actions.updateSelectedStoryId(undefined));
      } else if (!_isEqual(selectedStory, selectedItem)) {
        this.setState({ selectedItem: selectedStory });
        this.props.dispatch(Actions.updateSelectedStoryId(selectedStory.id));
      }
    }
  }

  componentWillUnmount() {
    if (this.resizeDebounce) this.resizeDebounce.cancel();
    if (this.scrollThrottle) this.scrollThrottle.cancel();
    window.removeEventListener('resize', this.resizeDebounce, false);
    window.removeEventListener('scroll', this.scrollThrottle, false);
  }

  handleResize = () => {
    const screenWidth = getScreenWidth();
    const newState = {};
    const isMobile = screenWidth <= 658;

    if (isMobile !== this.state.isMobile) {
      newState.isMobile = isMobile;
    }

    if (this.contentContainer) {
      /* XXX: Hardcode from CSS value */
      const padding = isMobile ? 10 : 24;
      const interWidth = isMobile ? 12 : 20;

      let space = _get(this.contentContainer, 'parentNode.clientWidth', 0);
      space -= padding * 2;

      let columns = 5;
      if (screenWidth <= 658) {
        columns = 2;
      } else if (screenWidth <= 868) {
        columns = 3;
      } else if (screenWidth <= 1024) {
        columns = 4;
      }

      const prevColumns = this.state.columns;
      const prevColumnWidth = this.state.columnWidth;
      const columnWidth = getColumnWidth(space, interWidth, columns);
      if (columns !== prevColumns) {
        newState.columns = columns;
      }
      if (columnWidth !== prevColumnWidth) {
        newState.columnWidth = columnWidth;
      }
    }

    if (!_isEmpty(newState)) {
      this.setState(newState);
    }
  }

  handleScroll = () => {
    if (this.contentContainer) {
      const { top } = this.contentContainer.getBoundingClientRect();
      const { isMobile, isSubNavBarNarrow } = this.state;
      const {
        NAV_BAR_MOBILE_HEIGHT,
        NAV_BAR_HEIGHT,
        SUB_NAV_BAR_NARROW_HEIGHT,
      } = SubNavBarConstants;
      const navBarHeight = isMobile ? NAV_BAR_MOBILE_HEIGHT : NAV_BAR_HEIGHT;
      if (top <= navBarHeight + SUB_NAV_BAR_NARROW_HEIGHT && !isSubNavBarNarrow) {
        this.setState({ isSubNavBarNarrow: true });
      } else if (top + navBarHeight + SUB_NAV_BAR_NARROW_HEIGHT >= 70 && isSubNavBarNarrow) {
        this.setState({ isSubNavBarNarrow: false });
      }
    }
  }

  handleItemSelect = (type, item) => {
    switch (type) {
      case 'story': {
        const { dispatch, user } = this.props;
        const { selectedItem } = this.state;
        if (_get(selectedItem, 'id') !== item.id) {
          dispatch(Actions.fetchOices(item.id, item.language));
          dispatch(InteractiveTutorial.Action.achieve(['9b00e93']));
          this.setState({ selectedItem: item });
        } else {
          this.handleStoryDetailsCloseRequest();
        }
        break;
      }
      default:
        break;
    }
  }

  handleSelectionCheck = (type, item) => {
    const selectedItemId = _get(this, 'state.selectedItem.id');
    switch (type) {
      case 'story':
        return item.id === selectedItemId;
      default:
        return false;
    }
  };

  handleOnSelectAddItem = () => {
    const { dispatch } = this.props;
    dispatch(Actions.addStory());
  }

  handleOnAddOiceRequest = () => {
    const { dispatch } = this.props;
    dispatch(Actions.addOice(this.state.selectedItem.id));
  }

  handleOnCopyOiceRequest = async ({ storyId, id }) => {
    const story = this.state.selectedItem;
    const { dispatch } = this.props;
    await dispatch(OiceAction.copyOice(id));
    dispatch(Actions.fetchOices(story.id, story.language));
  }

  handleOnCopyStoryRequest = async () => {
    const story = this.state.selectedItem;
    const { dispatch } = this.props;
    await dispatch(StoryAction.forkStory(story.id));
    await dispatch(StoryAction.fetchStories());
  }

  handleStoryDetailsCloseRequest = () => {
    this.setState({ selectedItem: undefined });
  }

  handleOnOpenStorySettingModal = () => {
    this.props.dispatch(StorySettingModalActions.toggle({
      open: true,
      story: this.state.selectedItem,
    }));
  }

  render() {
    const {
      t, oices, storiesList, user,
    } = this.props;
    const {
      columns,
      columnWidth,
      isMobile,
      selectedItem,
      isSubNavBarNarrow,
    } = this.state;

    const gallaryProps = {
      columns,
      columnWidth,
      expandedChild: !isMobile && (
        <StoryDetails
          oices={oices}
          story={selectedItem}
          onAddOice={this.handleOnAddOiceRequest}
          onCopyOice={this.handleOnCopyOiceRequest}
          onCopyStory={this.handleOnCopyStoryRequest}
          onOpenStorySettingModal={this.handleOnOpenStorySettingModal}
          onRequestClose={this.handleStoryDetailsCloseRequest}
        />
      ),
      onSelect: this.handleItemSelect,
      onSelectionCheck: this.handleSelectionCheck,
    };

    // XXX hardcoded height
    let galleryExpansionPanelHeight = 400;
    if (oices.length > 0) {
      const height = 62 + (40 * (oices.length + 2)) + 28;
      if (height > galleryExpansionPanelHeight) {
        galleryExpansionPanelHeight = height;
      }
    }

    return (
      <div id="dashboard-container">
        <NavBar user={user} fixed fluid />
        <SubNavBar narrow={isSubNavBarNarrow} text={t('label.story')} fluid />
        <div
          ref={ref => this.contentContainer = ref}
          id="story-dashboard"
        >
          <div id="story-gallery">
            <Throttle>
              {throttle => (
                <Gallery
                  {...gallaryProps}
                  galleryExpansionPanelHeight={galleryExpansionPanelHeight}
                  items={storiesList}
                  newItemTitleString={t('label.button.createStory')}
                  type="story"
                  onSelectAddItem={throttle(this.handleOnSelectAddItem)}
                />
              )}
            </Throttle>
          </div>
        </div>
        <Footer />
        {selectedItem && <StorySettingModal />}
      </div>
    );
  }
}
