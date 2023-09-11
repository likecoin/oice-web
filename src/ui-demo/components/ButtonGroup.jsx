import React, { Component } from 'react';

import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';
import ButtonGroup from 'ui-elements/ButtonGroup';

import SettingIcon from 'common/icons/setting';
import MenuIcon from 'common/icons/menu';
import PlayIcon from 'common/icons/play';

const codeSnippet =
`<ButtonGroup selectable>
  <FlatButton mini label="左" />
  <FlatButton mini label="中" />
  <FlatButton mini label="右" />
</ButtonGroup>

<ButtonGroup selectable fullWidth>
  <RaisedButton mini label="左" />
  <RaisedButton mini label="中" />
  <RaisedButton mini label="右" />
</ButtonGroup>

<ButtonGroup>
  <RaisedButton
    mini
    label={
      <span className="font-color1">
        黑貓故事 <span className="font-color3">(連載中)</span>
      </span>
    }
    icon={<MenuIcon />}
  />
  <RaisedButton mini icon={<SettingIcon />} />
</ButtonGroup>`;

export default class ButtonGroupDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>GroupButton</h3>
        <p>GroupButton wraps muliple FlatButtons or RaisedButtons together</p>
        <div>
          <ButtonGroup selectable>
            <FlatButton label="左" mini />
            <FlatButton label="中" mini />
            <FlatButton label="右" mini />
          </ButtonGroup>
          <br />
          selectable using {'<FlatButton/>'}
        </div>
        <div>
          <ButtonGroup selectable fullWidth>
            <RaisedButton label="左" mini />
            <RaisedButton label="中" mini />
            <RaisedButton label="右" mini />
          </ButtonGroup>
          selectable in full width using {'<RaisedButton/>'}
        </div>
        <div>
          <ButtonGroup selectable fullWidth disabled>
            <RaisedButton label="左" mini />
            <RaisedButton label="中" mini />
            <RaisedButton label="右" mini />
          </ButtonGroup>
          disabled
        </div>
        <div>
          <ButtonGroup>
            <RaisedButton
              label={
                <span className="font-color1">
                  黑貓故事 <span className="font-color3">(連載中)</span>
                </span>
              }
              icon={<MenuIcon />}
              mini
            />
            <RaisedButton icon={<SettingIcon />} mini />
          </ButtonGroup>
          <br />
          complex example
        </div>
        <pre>
          <code>
            {codeSnippet}
          </code>
        </pre>
      </div>
    );
  }
}
