import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';

@translate('general')
export default class ModalFooter extends React.Component {
  static displayName = 'ModalFooter';
  static defaultProps = {
    leftButtonDisabled: false,
    rightButtonDisable: false,
  }

  static propTypes = {
    t: PropTypes.func.isRequired,

    leftButtonDisabled: PropTypes.bool,
    leftButtonTitle: PropTypes.string,
    leftItems: PropTypes.arrayOf(PropTypes.node),

    rightButtonDisable: PropTypes.bool,
    rightButtonTitle: PropTypes.string,
    rightItems: PropTypes.arrayOf(PropTypes.node),

    onClickLeftButton: PropTypes.func,
    onClickRightButton: PropTypes.func,
  }

  handleOnClickLeftButton = () => {
    if (this.props.onClickLeftButton) this.props.onClickLeftButton();
  }

  handleClickRightButton = () => {
    if (this.props.onClickRightButton) this.props.onClickRightButton();
  }

  renderLeftItems() {
    const { t, leftItems, leftButtonTitle, leftButtonDisabled } = this.props;
    if (!leftItems) {
      return (
        <FlatButton
          disabled={leftButtonDisabled}
          label={leftButtonTitle || t('cancel')}
          onClick={this.handleOnClickLeftButton}
        />
      );
    }
    return Children.toArray(leftItems);
  }

  renderRightItems() {
    const { t, rightItems } = this.props;
    if (!rightItems) {
      return (
        <RaisedButton
          disabled={this.props.rightButtonDisable}
          label={this.props.rightButtonTitle || t('confirm')}
          primary
          onClick={this.handleClickRightButton}
        />
      );
    }
    return Children.toArray(rightItems);
  }

  render() {
    return (
      <div className="modal-footer">
        <span className="modal-footer-left-items">
          {this.renderLeftItems()}
        </span>
        <span className="modal-footer-right-items">
          {this.renderRightItems()}
        </span>
      </div>
    );
  }
}
