import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import classNames from 'classnames';
import _keyBy from 'lodash/keyBy';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import orderBy from 'lodash/fp/orderBy';
import sortBy from 'lodash/fp/sortBy';

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
    this.state = {
      selectedMacroGroupIndex: 0,
      macroList: null,
    };
  }

  componentWillReceiveProps({ macros }) {
    if (!this.state.macroList && macros.length > 0) {
      const MacrosKeyObject = _keyBy(macros, 'name');
      const macroList = flow(
        filter(macro => !macro.isHidden),
        orderBy(['groupOrder', 'order', 'id'], ['asc', 'asc', 'asc']), // for list as defined order
        groupBy('groupOrder'),
        sortBy('')
      )(MacrosKeyObject);

      this.setState({ macroList });
    }
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
    const { macroList, selectedMacroGroupIndex } = this.state;
    if (!macroList) return null;

    const selectedMacroGroup = macroList[selectedMacroGroupIndex];
    return (
      <div ref={ref => this.macrosList = ref} className="macros-list">
        {selectedMacroGroup.map(macro => (
          <Macro key={macro.id} macro={macro} />
        ))}
      </div>
    );
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
