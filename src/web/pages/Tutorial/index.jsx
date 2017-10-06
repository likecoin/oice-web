import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { push, goBack } from 'react-router-redux';

import Container from 'common/components/Container';
import Tabs from 'ui-elements/Tabs';
import Tab from 'ui-elements/Tab';
import FlatButton from 'ui-elements/FlatButton';

import * as TUTORIAL_TYPE from './constants/tutorialTypes';

import Manual from './doc/zh-HK/manual/index.md';
import FunctionDoc from './doc/zh-HK/functions.md';

import { setInnerHTML } from 'common/utils';

import FAQList from './pages/FAQ';
import VisualList from './pages/Visual';

import './styles/app.scss';

const checkPathName = tutorialType => {
  const index = TUTORIAL_TYPE.LIST.indexOf(tutorialType);
  return { isValid: index !== -1, index };
};

@translate(['tutorial'])
export default class TutorialApp extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.redirectIfNeeded(this.props.params.tutorialType);
  }

  componentWillReceiveProps(nextProps) {
    this.redirectIfNeeded(nextProps.params.tutorialType);
  }

  getTutorial(tutorialType) {
    switch (tutorialType) {
      case TUTORIAL_TYPE.MANUAL:
        return <article {...setInnerHTML(Manual)} />;
      case TUTORIAL_TYPE.FUNCTIONS:
        return <article {...setInnerHTML(FunctionDoc)} />;
      case TUTORIAL_TYPE.FAQ:
        return <FAQList openedIndex={(this.props.params.id || 0) - 1} />;
      case TUTORIAL_TYPE.VISUAL:
        return <VisualList />;
      default:
        return 'Coming soon...';
    }
  }

  redirectIfNeeded(tutorialType) {
    if (!checkPathName(tutorialType).isValid) this.goToTutorialType(TUTORIAL_TYPE.FAQ);
  }

  goToTutorialType(type) {
    this.context.router.push(`/tutorial/${type}`);
  }

  handleTabOnChange = index => {
    this.goToTutorialType(TUTORIAL_TYPE.LIST[index]);
  }

  renderTabs() {
    const { t } = this.props;
    return TUTORIAL_TYPE.LIST.map((type, index) => (
      <Tab key={index} index={index} title={t(`tab.${type}`)}>
        {this.getTutorial(type)}
      </Tab>
    ));
  }

  render() {
    const { t, params } = this.props;

    const checkTutorialTypeResult = checkPathName(params.tutorialType);

    if (checkTutorialTypeResult.isValid) {
      const selectedTabIndex = checkTutorialTypeResult.index;
      return (
        <Container id="tutorial">
          <Tabs
            value={selectedTabIndex}
            onChange={this.handleTabOnChange}
          >
            {this.renderTabs()}
          </Tabs>
        </Container>
      );
    }
    return null;
  }
}
