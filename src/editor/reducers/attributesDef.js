import { handleAction, handleActions } from 'redux-actions';


const initialState = {
  attrDefObj: {},
};

export default handleActions({
  FETCHED_MACRO_ATTR_DEFINITIONS: (state, { payload }) => {
    const copyAttrDefObj = { ...state.attrDefObj };
    const { macroId, attrDefList } = payload;
    copyAttrDefObj[macroId] = attrDefList;
    return ({
      ...state,
      attrDefObj: copyAttrDefObj,
    });
  },

}, initialState);
