import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Motion, spring } from 'react-motion';

import classNames from 'classnames';

import ButtonGroup from 'ui-elements/ButtonGroup';
import RaisedButton from 'ui-elements/RaisedButton';

import i18next, { mapLanguageCode } from 'common/utils/i18n';

import Overlay from './Overlay';

import Actions from './actions';
import Reducer from './reducer';

import './styles.scss';


@translate(['interactiveTutorial'])
@connect(store => ({
  ...store.interactiveTutorial,
}))
export default class InteractiveTutorial extends React.Component {
  static Action = Actions;
  static Reducer = Reducer;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    currentStep: PropTypes.number,
    open: PropTypes.bool,
    steps: PropTypes.array,
    variables: PropTypes.object,
    onClose: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      left: 0,
      right: 0,
      top: 0,
      opened: false,
      step: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('click', this.handleOnClick);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      step: nextProps.steps[nextProps.currentStep],
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.positionDialog();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.positionDialog();
  }

  handleOnClick = () => {
    const { step } = this.state;
    if (step && step.override) {
      this.handleNextButtonClick();
    }
  }

  handleFGImageLoad = () => {
    this.positionDialog();
  }

  handleToggleAnimationRest = () => {
    const { open } = this.props;
    if (!open) {
      this.setState({ step: null });
    }
  }

  handlePreviousButtonClick = () => {
    this.props.dispatch(Actions.back());
  }

  handleNextButtonClick = () => {
    this.props.dispatch(Actions.next());
  }

  handleSkipButtonClick = () => {
    this.props.dispatch(Actions.skip());
  }

  handleFinishTutorialButtonClick = () => {
    this.props.dispatch(Actions.close());
  }

  handleOnClose = () => {
    if (this.props.onClose) this.props.onClose();
  }

  positionDialog() {
    if (this.tutor) {
      const {
        offsetLeft, offsetRight, offsetTop, offsetWidth,
      } = this.tutor;
      let top = offsetTop;
      if (this.dialog) {
        const { offsetHeight } = this.dialog;
        top = offsetTop - (offsetHeight / 2);
      }
      const image = document.querySelector('.tutor-dialog-content img');
      if (image) {
        // position once image load
        image.onload = () => {
          this.positionDialog();
        };
      }
      this.setState({
        left: (offsetLeft + offsetWidth) - 50,
        right: window.innerWidth - offsetLeft - 50,
        top,
      });
    }
  }

  renderControl(isFirst, isLast) {
    const { t } = this.props;
    return (
      <ButtonGroup className="tutorial-control">
        <RaisedButton
          disabled={isLast}
          label={t('button.control.skip')}
          destructive
          mini
          onClick={this.handleSkipButtonClick}
        />
        {/* <RaisedButton
          disabled={isFirst}
          label={t('button.control.previous')}
          mini
          primary
          onClick={this.handlePreviousButtonClick}
          />
          <RaisedButton
          disabled={isLast}
          label={t('button.control.next')}
          mini
          primary
          onClick={this.handleNextButtonClick}
        /> */}
      </ButtonGroup>
    );
  }

  render() {
    const {
      currentStep,
      open,
      steps,
      t,
      variables,
    } = this.props;
    const {
      left,
      right,
      top,
      opened,
      step,
    } = this.state;

    if (!step) return null;

    const isFirst = (currentStep === 0);
    const isLast = (currentStep === steps.length - 1);

    const className = classNames(
      'interactive-tutorial',
      {
        flip: step.flip,
      }
    );

    const tutorDialogStyle = {
      top,
      ...(step.flip ? { right } : { left }),
    };
    const dialogHTML = {
      __html: step.dialog[mapLanguageCode(i18next.language)] || step.dialog.en,
    };
    // reduce font size when there's image
    const dialogClass = dialogHTML.__html.includes('<img') ? 'mini' : '';

    return (
      <Motion
        defaultStyle={{ opacity: 0 }}
        style={{ opacity: spring(open ? 1 : 0) }}
        onRest={this.handleToggleAnimationRest}
      >
        {containerStyle => (
          <div
            className={className}
            style={{ opacity: containerStyle.opacity }}
          >
            <Overlay
              fullOverlay={step.hasFullOverlay}
              override={step.override}
              selectors={step.selectors}
              variables={variables}
            />
            <img
              ref={ref => this.tutor = ref}
              key={step.id}
              alt="presentation"
              className="tutor"
              src={`/static/interactive-tutorial/fg-images/${step.fgImage}.png`}
              onLoad={this.handleFGImageLoad}
            />
            {(left && right && top) &&
              <div
                ref={ref => this.dialog = ref}
                className="tutor-dialog"
                style={tutorDialogStyle}
              >
                <div className="tutor-dialog-content">
                  <div className={dialogClass} dangerouslySetInnerHTML={dialogHTML} />
                  {isLast &&
                    <RaisedButton
                      className="finish-tutorial-button"
                      label={t('button.finish')}
                      mini
                      primary
                      onClick={this.handleFinishTutorialButtonClick}
                    />
                  }
                </div>
              </div>
            }
            {this.renderControl(isFirst, isLast)}
          </div>
        )}
      </Motion>
    );
  }
}
