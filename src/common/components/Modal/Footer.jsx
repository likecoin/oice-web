import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';

@translate('general')
export default class ModalFooter extends React.Component {
  static displayName = 'ModalFooter';
  static defaultProps = {
    rightButtonDisable: false,
  }
  static propTypes = {
    t: PropTypes.func.isRequired,
    leftButtonTitle: PropTypes.string,
    rightButtonTitle: PropTypes.string,
    leftItems: PropTypes.arrayOf(PropTypes.node),
    rightItems: PropTypes.arrayOf(PropTypes.node),
    onClickLeftButton: PropTypes.func,
    onClickRightButton: PropTypes.func,
    rightButtonDisable: PropTypes.bool,
  }

  handleOnClickLeftButton = () => {
    if (this.props.onClickLeftButton) this.props.onClickLeftButton();
  }

  handleClickRightButton = () => {
    if (this.props.onClickRightButton) this.props.onClickRightButton();
  }

  renderLeftItems() {
    const { t, leftItems } = this.props;
    if (!leftItems) {
      return (
        <FlatButton
          label={this.props.leftButtonTitle || t('cancel')}
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
          primary
          disabled={this.props.rightButtonDisable}
          label={this.props.rightButtonTitle || t('confirm')}
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
