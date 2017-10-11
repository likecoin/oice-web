import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from 'ui-elements/Modal';

import * as TutorialActions from './actions';


const OICE_LIST = [
  {
    youtubeId: 'dGwtsfb1Xg8',
    imagePath: '/static/img/tutorials/thumbnails/options-tutorial.jpg',
    title: '小貼士九：oice 選項功能教學',
    type: 'youtube',
  },
];

@connect((store) => store.tutorial.visual)
export default class ViusalList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    oices: PropTypes.array,
  }

  static defaultProps = {
    loading: false,
    oices: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      isOiceTutorialModalOpen: false,
      oiceTitle: '',
      playingUrl: '',
    };
  }

  componentDidMount() {
    this.props.dispatch(TutorialActions.fetchTutorialOices());
  }

  onClickOiceListItem(oiceTitle, youtubeId) {
    this.setState({
      isOiceTutorialModalOpen: true,
      oiceTitle,
      playingUrl: `https://www.youtube.com/embed/${youtubeId}`,
    });
  }

  handleOnCloseModal = () => {
    this.setState({
      isOiceTutorialModalOpen: false,
      playingUrl: '',
    });
  }

  renderOices() {
    return this.props.oices.map((oice, index) => (
      <li className="visual-item" key={index}>
        <a alt={oice.name} href={`/story/${oice.uuid}`}>
          <img
            alt={oice.name}
            src={oice.ogImage.button}
          />
        </a>
      </li>
    ));
  }

  renderYouTubeThumbnail() {
    return OICE_LIST.map((oice, index) => (
      <li className="visual-item" key={index}>
        <div
          className="tutorial-youtube"
          onClick={() => this.onClickOiceListItem(oice.title, oice.youtubeId)}
        >
          <img alt={oice.title} src={oice.imagePath} />
          <div className="tutorial-intro">{oice.title}</div>
        </div>
      </li>
    ));
  }

  render() {
    const { isOiceTutorialModalOpen, oiceTitle, playingUrl } = this.state;
    return (
      <div>
        <ul className="visual-list">
          {this.renderOices()}
          {this.renderYouTubeThumbnail()}
        </ul>
        <Modal
          open={isOiceTutorialModalOpen}
          onClickOutside={this.handleOnCloseModal}
        >
          <Modal.Header onClickCloseButton={this.handleOnCloseModal}>
            {oiceTitle}
          </Modal.Header>
          <Modal.Body>
            <div className="video-container">
              <iframe
                className="video"
                frameBorder="0"
                src={playingUrl}
                allowFullScreen
              />
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
