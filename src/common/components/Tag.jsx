import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseIcon from 'common/icons/close';

export default class Tag extends React.Component {
  static defaultProps = {
    canDelete: false,
    icon: '',
    value: '',
  }

  static propTypes = {
    canDelete: PropTypes.bool,
    icon: PropTypes.string,
    value: PropTypes.string,
    onClick: PropTypes.func,
  }

  handleRemoveTag = () => {
    const { onClick } = this.props;
    if (onClick) {
      onClick();
    }
  }

  render() {
    const { canDelete, value, icon } = this.props;
    const iconCN = classNames({
      canDelete,
      'tag-icon-cross': true,
      // hidden: indexOnSelectArray.length > 0,
    });
    return (
      <div className="tag">
        <div className="tag-detail">
          {icon && <div className="tag-icon" style={{ backgroundImage: `url(${icon})` }} />}
          <span>{value}</span>
          {canDelete &&
            <span
              className={iconCN}
              onClick={this.handleRemoveTag}
            >
              <CloseIcon />
            </span>
          }
        </div>
      </div>
    );
  }
}
