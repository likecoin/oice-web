import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _keyBy from 'lodash/keyBy';
import _ from 'lodash';

import * as MacroAction from 'editor/actions/macro';
import Macro from './Macro';

import './style.scss';

@translate(['editor'])
export default class MacrosPanel extends React.Component {
  static propTypes = {
    macros: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { selectedMacroGroupIndex: 0 };
  }

  handleTabSwitch = (index) => {
    this.setState({ selectedMacroGroupIndex: index });
    if (this.macrosList) this.macrosList.scrollTop = 0;
  }

  renderMacrosTabBar() {
    const { t } = this.props;

    const TabBarButton = (props) => {
      const className = classNames({
        selected: this.state.selectedMacroGroupIndex === props.index,
      });
      return (
        <button {...{ className }} onClick={() => this.handleTabSwitch(props.index)}>
          {props.title}
        </button>
      );
    };

    return (
      <div className="macros-tab-bar">
        {[t('basic-macros'), t('sound-macros'), t('commmand-macros')].map((title, index) => (
          <TabBarButton key={title} {...{ title, index }} />
        ))}
      </div>
    );
  }

  renderMacrosTab() {
    const { macros, t } = this.props;
    const MacrosKeyObject = _keyBy(macros, 'name');
    const list = _.chain(MacrosKeyObject)
                  .filter({ isHidden: false }) // filter all isHidden true macro
                  .orderBy(['groupOrder', 'order', 'id']) // for list as defined order
                  .groupBy('groupOrder')
                  .sortBy('')
                  .value();

    const { selectedMacroGroupIndex } = this.state;
    const selectedMacroGroup = list[selectedMacroGroupIndex];
    if (macros.length > 0) {
      return (
        <div className="macros-list" ref={ref => this.macrosList = ref}>
          {selectedMacroGroup.map((macro) => (
            <Macro key={macro.id} macro={macro} />
          ))}
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <div id="macros-panel">
        {this.renderMacrosTabBar()}
        {this.renderMacrosTab()}
      </div>
    );
  }
}
