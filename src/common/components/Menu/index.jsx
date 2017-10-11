import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover';

import MenuItem from './Item';

import './styles.scss';


export default class Menu extends React.Component {
  static Item = MenuItem;
  static propTypes = {
    /**
     * anchorEl is the trigger element for the menu
     */
    anchorEl: PropTypes.element.isRequired,
    /**
     * This is the point on the anchor where the popover's
     * `targetOrigin` will attach to.
     * Options:
     * vertical: [top, center, bottom]
     * horizontal: [left, middle, right].
     */
    anchorOrigin: PropTypes.object,
    children: PropTypes.any,
    hasBadge: PropTypes.bool,
    /**
     * set the maxHeight for menu panel
     * when the height above the maxHeight, the scrollbar show up
     */
    maxHeight: PropTypes.number,
    /**
     * This is the point on the popover which will attach to
     * the anchor's origin.
     * Options:
     * vertical: [top, center, bottom]
     * horizontal: [left, middle, right].
     */
    targetOrigin: PropTypes.object,
  }

  static defaultProps ={
    anchorEl: <span>Click Me</span>,
    anchorOrigin: {
      horizontal: 'right',
      vertical: 'bottom',
    },
    hasBadge: false,
    targetOrigin: {
      horizontal: 'right',
      vertical: 'top',
    },
  }

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleClick = (event) => {
    event.preventDefault();
    // This prevents ghost click.
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleCloseRequest = () => {
    this.setState({
      open: false,
    });
  };

  createMenuItem(element, index) {
    return React.cloneElement(element, {
      onRequestClose: this.handleCloseRequest,
      key: index,
    });
  }

  render() {
    const {
      anchorEl,
      anchorOrigin,
      children,
      hasBadge,
      maxHeight,
      targetOrigin,
    } = this.props;

    const newAnchorEl = React.cloneElement(anchorEl, {
      // override anchorEl previous onClick action
      onClick: this.handleClick,
    });

    const menuItemList = [];
    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const { displayName } = child.type;
      if (displayName === 'MenuItem') {
        menuItemList.push(this.createMenuItem(child, index));
      } else if (displayName === 'Divider') {
        menuItemList.push(React.cloneElement(child, { key: index }));
      } else {
        return;
      }
    });

    let style = null;
    if (maxHeight) {
      style = { maxHeight: `${maxHeight}px` };
    }

    return (
      <div className="menu-container">
        {newAnchorEl}
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={anchorOrigin}
          className="menu-popover"
          open={this.state.open}
          style={{ borderRadius: '4px', overflow: 'hidden' }}
          targetOrigin={targetOrigin}
          onRequestClose={this.handleCloseRequest}
        >
          <div className="menu-item-list" style={style}>
            {menuItemList}
          </div>
        </Popover>
        {hasBadge && <div className="menu-badge" />}
      </div>
    );
  }
}
