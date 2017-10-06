import React, { Component } from 'react';

import ExpansionPanel from 'ui-elements/ExpansionPanel';

const expansionPanels = [];
for (let i = 1; i <= 5; i++) {
  expansionPanels.push(
    <ExpansionPanel key={i}>
      <ExpansionPanel.Header>
        This is header {i}
      </ExpansionPanel.Header>
      <ExpansionPanel.Content>
        This is content {i}
      </ExpansionPanel.Content>
    </ExpansionPanel>
  );
}

export default () => (
  <div>
    <h3>ExpansionPanel</h3>
    <ExpansionPanel>
      <ExpansionPanel.Header>
        Hello
      </ExpansionPanel.Header>
      <ExpansionPanel.Content>
        World!
      </ExpansionPanel.Content>
    </ExpansionPanel>
    <h4>Center Header</h4>
    <ExpansionPanel>
      <ExpansionPanel.Header center>
        Center Header
      </ExpansionPanel.Header>
      <ExpansionPanel.Content>
        This a content
      </ExpansionPanel.Content>
    </ExpansionPanel>
    <h4>Grouped</h4>
    <ExpansionPanel.Group>
      {expansionPanels}
    </ExpansionPanel.Group>
    <h4>Grouped (Combined)</h4>
    <ExpansionPanel.Group combined>
      {expansionPanels}
    </ExpansionPanel.Group>
  </div>
);
