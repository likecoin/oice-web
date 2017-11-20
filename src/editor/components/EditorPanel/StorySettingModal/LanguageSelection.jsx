import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import classNames from 'classnames';

import FlatButton from 'ui-elements/FlatButton';

import RemoveIcon from 'common/icons/close-2';

import * as ASSET_TYPES from 'common/constants/assetTypes';
import { getThumbnail } from 'common/utils';
import { getAudioMp4Url } from 'editor/utils/app';


class LanguageSelection extends React.Component {
  handleClick = ({ target }) => {
    // ignore if clicking the remove button
    if (this.removeButton && findDOMNode(this.removeButton).contains(target)) return;
    const { onClick } = this.props;
    if (onClick) onClick();
  }

  handleDelete = ({ target }) => {
    const { onDelete } = this.props;
    if (onDelete) onDelete();
  }

  render() {
    const { onClick, onDelete, label, selected } = this.props;
    const className = classNames('language-selection', {
      selected,
    });

    return (
      <div {...{ className }} onClick={this.handleClick}>
        {label}
        <FlatButton
          ref={ref => this.removeButton = ref}
          icon={<RemoveIcon />}
          onClick={this.handleDelete}
        />
      </div>
    );
  }
}

LanguageSelection.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
};

LanguageSelection.defaultProps = {
  selected: false,
};

export default LanguageSelection;
