import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';

import FlatButton from 'ui-elements/FlatButton';
import OutlineButton from 'ui-elements/OutlineButton';

@translate('general')
export default class ModalFooter extends React.Component {
  static displayName = 'ModalFooter';
  static defaultProps = {
    rightButtonColor: 'red',
    rightButtonDisable: false,
  }
  static propTypes = {
    t: PropTypes.func.isRequired,
    className: PropTypes.string,
    leftButtonIcon: PropTypes.element,
    leftItems: PropTypes.arrayOf(PropTypes.node),
    rightButtonColor: PropTypes.oneOf(['red', 'green', 'blue']),
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
    const { leftItems, leftButtonIcon } = this.props;
    if (!leftItems) {
      if (leftButtonIcon) {
        return (
          <FlatButton
            icon={leftButtonIcon}
            onClick={this.handleOnClickLeftButton}
          />
        );
      }
      return null;
    }
    return Children.toArray(leftItems);
  }

  renderRightItems() {
    const { rightItems } = this.props;
    if (!rightItems) {
      const { t, rightButtonColor, rightButtonDisable, rightButtonTitle } = this.props;
      return (
        <OutlineButton
          color={rightButtonColor}
          disabled={rightButtonDisable}
          label={rightButtonTitle || t('confirm')}
          fluid
          onClick={this.handleClickRightButton}
        />
      );
    }
    return Children.toArray(rightItems);
  }

  render() {
    const className = classNames('modal-two-footer', this.props.className);
    return (
      <div className={className}>
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
