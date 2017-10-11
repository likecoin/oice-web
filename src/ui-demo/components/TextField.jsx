import React, { Component } from 'react';

import TextField from 'ui-elements/TextField';

export default class TextFieldDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>TextField</h3>
        <div>
          <TextField placeholder="請輸入" />
          <br />
          default with placeholder
        </div>
        <div>
          <TextField placeholder="請輸入" fullWidth />
          100% width
        </div>
        <div>
          <TextField
            placeholder="請輸入"
            multiLine
            showCharactersCount
            maxLength={120}
          />
          <br />
          multi-line with characters count display
        </div>
        <div>
          <TextField
            placeholder="請輸入"
            border={false}
          />
          <br />
          no border
        </div>
      </div>
    );
  }
}
