import React, { Component } from 'react';
import Tabs from 'ui-elements/Tabs';
import Tab from 'ui-elements/Tab';
import FlatButton from 'ui-elements/FlatButton';

export default class TabsDemo extends React.Component {
  render() {
    return (
      <div>
        <h3>Tabs</h3>
        <Tabs rightBarItem={<FlatButton label="rightBarItem" />}>
          <Tab title="Tab 1">
            Tab1
          </Tab>
          <Tab title="Tab 2">
            Tab2
          </Tab>
          <Tab title="Tab 3">
            Tab3
          </Tab>
          <Tab title="Tab 4">
            Tab4
          </Tab>
        </Tabs>
      </div>
    );
  }
}
