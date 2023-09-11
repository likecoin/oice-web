import React, { Component } from 'react';

import PlayIcon from 'common/icons/play';

import RaisedButton from 'ui-elements/RaisedButton';

export default class RaisedButtonDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>RaisedButton</h3>
        <span>
          <RaisedButton label="運行oice" />
          <br />
          label only
        </span>
        <span>
          <RaisedButton label="運行oice" primary />
          <br />
          primary with label only
        </span>
        <span>
          <RaisedButton icon={<PlayIcon />} primary />
          <br />
          primary with icon only
        </span>
        <span>
          <RaisedButton
            label="運行oice"
            icon={<PlayIcon />}
            primary
          />
          <br />
          primary with label and icon
        </span>
        <span>
          <RaisedButton
            label={
              <span className="font-color1">
                公園 <span className="font-color3">（黑貓故事）</span>
              </span>
            }
            icon={<PlayIcon />}
            reverse
          />
          <br />
          label and icon select button
        </span>
        <span>
          <RaisedButton
            label="運行oice"
            icon={<PlayIcon />}
            destructive
          />
          <br />
          destructive with label and icon
        </span>
        <span>
          <RaisedButton
            label="運行oice"
            icon={<PlayIcon />}
            disabled
          />
          <br />
          disabled with label and icon
        </span>
      </div>
    );
  }
}
