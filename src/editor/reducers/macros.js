import { handleAction, handleActions } from 'redux-actions';
import _keyBy from 'lodash/keyBy';
import _values from 'lodash/values';
import _forEach from 'lodash/forEach';

import {
  FETCHED_MACROS,
} from 'editor/constants/actionTypes';

import MacroDefines from 'editor/constants/macro';


const initialState = {
  list: [],
  dict: null,
};
export default handleActions({
  FETCHED_MACROS: (state, { payload }) => {
    // 1. change macros array to object keyed by `name`
    const MacrosKeyObject = _keyBy(payload, 'name');
    // 2. get defined macros group and update macros with color
    MacroDefines.forEach((macroGroup, groupOrder) => {
      // macroOrder: value [a,b,c] groupColor: key blue
      _forEach(macroGroup, (macroKeys, groupColor) => {
        macroKeys.forEach((macroDefine, order) => {
          // 3. update the MacrosKeyObject
          const macro = MacrosKeyObject[macroDefine.name];
          if (macro) {
            macro.groupColor = groupColor;
            macro.groupOrder = groupOrder;
            macro.order = order;
            macro.icon = macroDefine.icon;
          }
          return true;
        });
      });
      return true;
    });
    // 4. transform the MacrosKeyObject back to array for store
    const newMacros = _values(MacrosKeyObject);
    const macroDictById = _keyBy(newMacros, 'id');
    return {
      ...state,
      dict: macroDictById,
      list: payload,
    };
  },
}, initialState);
