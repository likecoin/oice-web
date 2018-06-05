import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import uuid from 'uuid';
import { translate } from 'react-i18next';

import TextField from 'ui-elements/TextField';
import FlatButton from 'ui-elements/FlatButton';
import CloseIcon from 'common/icons/close';
import AddIcon from 'common/icons/add';

import * as BlockAction from 'editor/actions/block';

import { saveAttributeValue } from '../utils';

const minOptionNum = 2;
const maxOptionNum = 4;

@translate(['macro'])
@connect()
export default class OptionAttributePanel extends React.Component {
  static defaultProps = {
    fullWidth: true,
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    t: PropTypes.func,
    answerOptions: PropTypes.string,
    block: PropTypes.object,
    attributeName: PropTypes.string,
  }

  constructor(props) {
    super(props);
    const answerOptionsJSON = props.answerOptions;
    const answerOptions = JSON.parse(answerOptionsJSON);
    this.state = {
      answerOptions,
    };
  }

  componentWillReceiveProps(nextProps) {
    const answerOptionsJSON = nextProps.answerOptions;
    const answerOptions = JSON.parse(answerOptionsJSON);
    this.setState({
      answerOptions,
    });
  }

  onChangeValue = (value, answerInfo) => {
    const { answerIndex } = answerInfo;
    const answerType = answerInfo.type;
    const { answerOptions } = this.state;
    answerOptions[answerIndex][answerType] = value;
    this.updateStore(answerOptions);
  }

  onClickRemoveOption = (index) => {
    const answerOptions = [...this.state.answerOptions];
    answerOptions.splice(index, 1);
    this.updateStore(answerOptions);
    this.setState({ answerOptions });
  }

  onClickAddOption = () => {
    const answerOptions = [...this.state.answerOptions];
    answerOptions.push({ target: '', content: '' });
    this.updateStore(answerOptions);
    this.setState({ answerOptions });
  }

  updateStore = (answerOptions) => {
    const answersJSON = JSON.stringify(answerOptions);
    const { block, attributeName } = this.props;
    const updatedBlock = saveAttributeValue(attributeName, block, answersJSON, 'paragraph');
    this.props.dispatch(BlockAction.updateBlockView(updatedBlock));
  }

  renderOption = (answerOption, i, numOptions) => {
    const { t, fullWidth } = this.props;
    const targetInfo = { answerIndex: i, type: 'target' };
    const contentInfo = { answerIndex: i, type: 'content' };
    return (
      <div
        key={i}
        className="option"
      >
        <div className="option-label">
          <span>{t('composedAnswer.goToTag')}</span>
          <TextField
            value={answerOption.target}
            fullWidth={fullWidth}
            onChange={value => this.onChangeValue(value, targetInfo)}
          />
        </div>
        <div className="option-content">
          <div className="option-desc">
            <span>{t('composedAnswer.option')}</span>
            {
              numOptions > minOptionNum &&
              <div className="option-cross-button">
                <FlatButton
                  icon={<CloseIcon />}
                  onClick={() => this.onClickRemoveOption(i)}
                />
              </div>
            }
          </div>
          <TextField
            value={answerOption.content}
            fullWidth={fullWidth}
            onChange={value => this.onChangeValue(value, contentInfo)}
          />
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { answerOptions } = this.state;
    const numOptions = answerOptions.length;

    return (
      <div className="option-attribute-panel">
        {
          answerOptions.map((answerOption, i) => this.renderOption(answerOption, i, numOptions))
        }
        { numOptions < maxOptionNum &&
          <FlatButton
            label={t('composedAnswer.addOption')}
            icon={<AddIcon />}
            onClick={() => this.onClickAddOption()}
          />
        }
      </div>
    );
  }
}
