import React, { Component } from 'react';
import Switcher from 'editor/components/EditorPanel/BlocksPanel/Switcher';

export default class SwitcherDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>Switcher</h3>
        <Switcher
          actionTitle={'其他水果'}
          label={'食緊：'}
          selectedIndex={0}
          values={['提子', '菠蘿', '芭樂']}
          onClickAction={() => alert('你就想')} // eslint-disable-line
        />
      </div>
    );
  }
}
