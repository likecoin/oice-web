import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _debounce from 'lodash/debounce';

import CloseIcon from 'common/icons/close-bold';
import LeftArrowIcon from 'common/icons/arrow/fat-left-arrow';
import RightArrowIcon from 'common/icons/arrow/fat-right-arrow';

import OiceItem from './OiceItem';

import './style.scss';


const STORY_DESCRIPTION_BOX_WIDTH = 296;
const OICE_PREVIEW_WIDTH = 172;
const STORY_DETAIL_MARGIN = 48;

@translate(['StoryDetails'])
export default class StoryDetails extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    oices: PropTypes.array,
    story: PropTypes.object,
    onRequestClose: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentStartIndex: 0,
      numberOfItemsShown: 0,
      page: 0,
    };
  }

  componentDidMount() {
    this.resizeDebounce = _debounce(this.updateLayout, 40);
    window.addEventListener('resize', this.resizeDebounce, false);
    this.initializeList();
  }

  componentWillReceiveProps(nextProps) {
    this.initializeList();
  }

  componentWillUnmount() {
    if (this.resizeDebounce) this.resizeDebounce.cancel();
    window.removeEventListener('resize', this.resizeDebounce, false);
  }

  getNumberOfItemsInRowOfPage = () => {
    const containerWidth = this.getContainerWidth();
    return {
      firstPage: Math.floor((containerWidth - STORY_DESCRIPTION_BOX_WIDTH) / OICE_PREVIEW_WIDTH),
      otherPages: Math.floor(containerWidth / OICE_PREVIEW_WIDTH),
    };
  }

  getContainerWidth = () => {
    const galleryWrapper = document.querySelector('#user-profile-info');
    if (galleryWrapper) {
      const galleryWidth = parseInt(galleryWrapper.style.maxWidth, 10);
      if (!Number.isNaN(Number(galleryWidth))) return galleryWidth - STORY_DETAIL_MARGIN;
    }
    return 0;
  }

  handleCloseButtonClick = () => {
    const { onRequestClose } = this.props;
    if (onRequestClose) onRequestClose();
  }

  handleNextButtonClick = () => this.handleScrollClick(false);

  handlePrevButtonClick = () => this.handleScrollClick(true);

  handleScrollClick = (isLeft) => {
    const { currentStartIndex, page } = this.state;
    const directionIndex = isLeft ? -1 : 1;
    const newPage = page + directionIndex;
    this.repositionOices(newPage);

    const { firstPage, otherPages } = this.getNumberOfItemsInRowOfPage();
    let itemsNumThisPage = firstPage;
    let newNumberOfItemsShown = otherPages;

    if (page !== 0) {
      itemsNumThisPage = otherPages;
    }
    if (newPage === 0) {
      itemsNumThisPage = otherPages;
      newNumberOfItemsShown = firstPage;
    }

    const newStartIndex = (newPage === 0) ? 0 : currentStartIndex + (directionIndex * itemsNumThisPage);

    this.setState({
      currentStartIndex: newStartIndex,
      page: newPage,
      numberOfItemsShown: newNumberOfItemsShown,
    });
  }

  initializeList = () => {
    this.storyDetails.children[0].style.transform = '';
    const { firstPage } = this.getNumberOfItemsInRowOfPage();
    this.setState({
      page: 0,
      currentStartIndex: 0,
      numberOfItemsShown: firstPage,
    });
  }

  isLeftScrollable = () => {
    const { page } = this.state;
    return page !== 0;
  }

  isRightScrollable = () => {
    const { oices } = this.props;
    const { currentStartIndex, numberOfItemsShown } = this.state;
    return ((currentStartIndex + numberOfItemsShown) < oices.length);
  }

  updateLayout = () => {
    // calculate if number of items shown is still the same
    const { page } = this.state;
    const { firstPage, otherPages } = this.getNumberOfItemsInRowOfPage();
    // find out whether page should change according to width size changes
    const numberOfOices = this.props.oices.length;
    const numberOfPages = Math.ceil((numberOfOices - firstPage) / otherPages) + 1;
    const newPage = (page >= numberOfPages) ? page - 1 : page;
    let numberOfItemsShown = firstPage;
    let currentStartIndex = 0;
    if (newPage !== 0) {
      numberOfItemsShown = otherPages;
      currentStartIndex = firstPage + ((newPage - 1) * otherPages);
    }
    this.setState({
      currentStartIndex,
      numberOfItemsShown,
      page: newPage,
    });
  }

  repositionOices(page) {
    if (this.storyDetails) {
      const containerWidth = this.getContainerWidth();
      const offsetWidth = -1 * page * containerWidth;

      const transform = `translateX(${offsetWidth}px)`;

      // move the divs to the left
      const divs = this.storyDetails.children;
      for (let i = 0; i < divs.length; i++) {
        divs[i].style.transform = transform;
      }
    }
  }

  renderOiceList = () => {
    const { oices } = this.props;
    const { page } = this.state;
    const numberOfOices = oices.length;
    if (numberOfOices <= 0) return null;

    const containerWidth = this.getContainerWidth();
    const numberOfItemsInPage1 = Math.floor((containerWidth - STORY_DESCRIPTION_BOX_WIDTH) / OICE_PREVIEW_WIDTH);
    const numberOfItemsInOtherPages = Math.floor(containerWidth / OICE_PREVIEW_WIDTH);
    const isOnePage = numberOfOices <= numberOfItemsInPage1;
    const oiceGroups = [];
    const groupOneSpace = Math.ceil((containerWidth - STORY_DESCRIPTION_BOX_WIDTH - (numberOfItemsInPage1 * OICE_PREVIEW_WIDTH)) / 2);
    const groupPadding = (containerWidth - (numberOfItemsInOtherPages * OICE_PREVIEW_WIDTH)) / 2;

    this.repositionOices(page);

    const groupOne = (
      <div
        key={`oice-group-${oiceGroups.length + 1}`}
        className="oice-group"
        style={{
          justifyContent: isOnePage ? 'initial' : 'center',
          paddingLeft: groupOneSpace,
          paddingRight: groupOneSpace,
        }}
      >
        {oices.map((oice, index) => (
          index < numberOfItemsInPage1
        ) && (
          <OiceItem
            key={oice.id}
            index={index + 1}
            oice={oice}
          />
        ))}
      </div>
    );
    oiceGroups.push(groupOne);

    for (
      let i = numberOfItemsInPage1;
      i < numberOfOices;
      i += numberOfItemsInOtherPages
    ) {
      const indexOfLastItem = i + numberOfItemsInOtherPages;
      const oiceGroupStyle = {
        paddingLeft: `${groupPadding}px`,
        paddingRight: `${groupPadding}px`,
      };
      oiceGroups.push(
        <div
          key={`oice-group-${oiceGroups.length + 1}`}
          className="oice-group"
          style={oiceGroupStyle}
        >
          {oices.map((oice, index) => (
            index >= i && index < indexOfLastItem
          ) && (
            <OiceItem
              key={oice.id}
              index={index + 1}
              oice={oice}
            />
          ))}
        </div>
      );
    }

    return oiceGroups;
  }

  render() {
    const { story, t } = this.props;
    return (
      <div className="story-details-wrapper">
        <div
          ref={ref => this.storyDetails = ref}
          className="story-details"
          style={{ width: this.getContainerWidth() }}
        >
          <div className="story-info">
            <h1>{story && story.name}</h1>
            <h2>{t('label.introduction')}</h2>
            <p>
              {(story && story.description) || t('label.noIntroduction')}
            </p>
          </div>
          {this.renderOiceList()}
        </div>
        {this.isLeftScrollable() &&
          <div
            className="left-icon"
            onClick={this.handlePrevButtonClick}
          >
            <LeftArrowIcon />
          </div>
        }
        {this.isRightScrollable() &&
          <div
            className="right-icon"
            onClick={this.handleNextButtonClick}
          >
            <RightArrowIcon />
          </div>
        }
        <div
          className="close-icon"
          onClick={this.handleCloseButtonClick}
        >
          <CloseIcon />
        </div>
      </div>
    );
  }
}
