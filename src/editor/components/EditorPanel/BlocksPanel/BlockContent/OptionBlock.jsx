import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

@translate(['macro'])
export default class OptionBlock extends React.Component {
  static defaultProps = {
  }
  static propTypes = {
    attributes: PropTypes.any,
    t: PropTypes.func,
  }

  render() {
    const { t, attributes } = this.props;
    let answers = [];
    const question = attributes.question ? attributes.question.value : '';
    const answersValue = attributes.answers ? attributes.answers.value : JSON.stringify([{ target: '', content: '' }, { target: '', content: '' }]);
    answers = JSON.parse(answersValue);
    return (
      <div className="option-block">
        <h5>{question}</h5>
        <div className="answers">
          {
            answers.map((answer, i) => (
              <div className="answer" key={i}>
                <div className="target">
                  {`${t('optionanswer.target')}(${answer.target})`}
                </div>
                <div className="content">
                  {answer.content}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
