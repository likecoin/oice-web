import { handleActions } from 'redux-actions';
import { LOCATION_CHANGE } from 'react-router-redux';

import { TAB_BAR_ITEM } from 'asset-library/constants';

import * as Actions from './AssetLibraryTabBar.actions';


const initialState = {
  value: TAB_BAR_ITEM.MY_LIBRARIES,
};

export default handleActions({
  [Actions.didChangeValue]: (state, action) => {
    const value = action.payload;
    return {
      ...state,
      value,
    };
  },
  [LOCATION_CHANGE]: (state, action) => {
    const { pathname } = action.payload;

    let value = state.value;
    if (!new RegExp(value.path, 'i').test(pathname)) {
      if (new RegExp(TAB_BAR_ITEM.MY_LIBRARIES.path, 'i').test(pathname)) {
        value = TAB_BAR_ITEM.MY_LIBRARIES;
      } else if (new RegExp(TAB_BAR_ITEM.ASSET_STORE.path, 'i').test(pathname)) {
        value = TAB_BAR_ITEM.ASSET_STORE;
      }
    }

    return {
      ...state,
      value,
    };
  },
}, initialState);
