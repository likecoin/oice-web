import { createAction } from 'redux-actions';
import { push } from 'react-router-redux';

import { TAB_BAR_ITEM } from 'asset-library/constants';

export const didChangeValue = createAction('ASSET_LIBARY_TABBAR_DID_CHANGE_VALUE');
export const changeValue = (value) => (dispatch, getState) => {
  const { key } = getState().AssetLibraryTabBar.value;
  if (value.key !== key) {
    dispatch(didChangeValue(value));
    dispatch(push(value.path));
  }
};
