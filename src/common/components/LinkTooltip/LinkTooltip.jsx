import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import uuid from 'uuid';

import Tooltip from 'react-tooltip';
import AlertDialog from 'ui-elements/AlertDialog';

import LinkIcon from 'common/icons/link';

import './LinkTooltip.style.scss';

@connect()
@translate('LinkTooltip')
export default class LinkTooltip extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    className: PropTypes.string,
    delayHide: PropTypes.number,
    disabled: PropTypes.bool,
    float: PropTypes.bool,
    link: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  }

  static defaultProps = {
    className: undefined,
    delayHide: 300,
    disabled: false,
    float: true,
    place: 'bottom',
  }

  constructor(props) {
    super(props);

    this.uuid = `tooltip-${uuid.v4()}`;
  }

  handleCopyLinkButtonClick = () => {
    const link = document.querySelector(`.${this.uuid} > span:first-child`);
    const range = document.createRange();
    range.selectNode(link);
    // NOTE: Remove the selections to prevent
    // Discontigious Selection is not supported error
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      // Do nothing
    }
    // NOTE: Should use removeRange(range) when it is supported
    window.getSelection().removeAllRanges();

    const { dispatch, t } = this.props;
    dispatch(AlertDialog.toggle({
      body: successful ? t('label.copySuccess') : t('label.copyFailure'),
    }));
  }

  render() {
    const { t, link, delayHide, disabled, float, place } = this.props;
    const className = classNames('link-tooltip', this.props.className, {
      disabled: disabled || !link,
    });

    return (
      <div {...{ className }}>
        <div
          className="link-icon"
          data-for={this.uuid}
          data-tip
        >
          <LinkIcon />
        </div>
        <Tooltip
          id={this.uuid}
          class={`tooltip ${this.uuid}`}
          delayHide={delayHide}
          effect={float ? 'float' : 'solid'}
          place={place}
          type="light"
        >
          <span>{link}</span>
          <span
            className="link-action"
            onClick={this.handleCopyLinkButtonClick}
          >
            {t('button.copy')}
          </span>
        </Tooltip>
      </div>
    );
  }
}
