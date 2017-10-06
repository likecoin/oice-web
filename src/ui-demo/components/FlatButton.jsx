import React, { Component } from 'react';

import AddIcon from 'common/icons/add';
import CloseIcon from 'common/icons/close';

import FlatButton from 'ui-elements/FlatButton';

export default class FlatButtonDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>FlatButton</h3>
        <span>
          <FlatButton label="删除素材庫" /><br />
          label only
        </span>
        <span>
          <FlatButton icon={<CloseIcon />} /><br />
          icon only
        </span>
        <span>
          <FlatButton label="新增故事" icon={<AddIcon />} /><br />
          label with icon
        </span>
        <span>
          <FlatButton label="删除素材庫" icon={<AddIcon />} disabled /><br />
          label with icon and disabled
        </span>
      </div>
    );
  }
}
