import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import _head from 'lodash/head';

import ExpansionPanel from 'common/components/ExpansionPanel';

import { setInnerHTML } from 'common/utils';

const requireAll = requireContext => requireContext.keys().map(requireContext);
const FAQContentList = requireAll(
  require.context('../doc/zh-HK/faq/', true, /^\.\/.*\/index\.md$/)
);

export default class FAQList extends React.Component {
  static propTypes = {
    openedIndex: PropTypes.number,
  }

  static defaultProps = {
    openedIndex: -1,
  }

  constructor(props) {
    super(props);

    this.state = { openedIndex: props.openedIndex };
    this.faqListElements = [];
  }

  componentDidMount() {
    const openedFaqListElement = this.faqListElements[this.state.openedIndex];
    if (openedFaqListElement) {
      const element = findDOMNode(openedFaqListElement);
      document.body.scrollTop = element.offsetTop - 100;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ openedIndex: nextProps.openedIndex });
  }

  handleOnClickFAQ = (index) => {
    const { openedIndex } = this.state;
    this.setState({ openedIndex: openedIndex !== index ? index : -1 });
  }

  render() {
    const { openedIndex } = this.state;

    return (
      <article className="faq-list">
        {FAQContentList.map((content, index) => {
          const h1 = _head(content.match(/<h1.*<\/h1>/));
          const title = h1.replace(/(<h1.*>)(.*)(<\/h1>)/, '$2'); // Extract the H1 title
          const htmlString = content.replace(h1, '');
          return (
            <ExpansionPanel
              id={`q${index + 1}`}
              key={index}
              open={openedIndex === index}
              ref={(e) => { this.faqListElements[index] = e; }}
              onClick={() => { this.handleOnClickFAQ(index); }}
            >
              <ExpansionPanel.Header>
                {title}
              </ExpansionPanel.Header>
              <ExpansionPanel.Content>
                <div {...setInnerHTML(htmlString)} />
              </ExpansionPanel.Content>
            </ExpansionPanel>
          );
        })}
      </article>
    );
  }
}
