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
          <RaisedButton primary label="運行oice" />
          <br />
          primary with label only
        </span>
        <span>
          <RaisedButton primary icon={<PlayIcon />} />
          <br />
          primary with icon only
        </span>
        <span>
          <RaisedButton
            primary
            label="運行oice"
            icon={<PlayIcon />}
          />
          <br />
          primary with label and icon
        </span>
        <span>
          <RaisedButton
            reverse
            label={
              <span className="font-color1">
                公園 <span className="font-color3">（黑貓故事）</span>
              </span>
            }
            icon={<PlayIcon />}
          />
          <br />
          label and icon select button
        </span>
        <span>
          <RaisedButton
            destructive
            label="運行oice"
            icon={<PlayIcon />}
          />
          <br />
          destructive with label and icon
        </span>
        <span>
          <RaisedButton
            disabled
            label="運行oice"
            icon={<PlayIcon />}
          />
          <br />
          disabled with label and icon
        </span>
      </div>
    );
  }
}
