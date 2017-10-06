import { handleAction, handleActions } from 'redux-actions';


const initialState = {
  list: [],
};

export default handleActions({
  FETCHED_LIBRARIES: (state, { payload }) => {
    const list = [].concat.apply([], [
      payload.public,
      payload.private,
      payload.forSale,
      payload.selected,
    ]);
    return ({
      ...state,
      list,
    });
  },
  ADDED_LIBRARY: (state, { payload }) => {
    const copyList = [...state.list];
    copyList.push(payload); // push will not change list itself
    return ({
      ...state,
      list: copyList,
    });
  },
  DELETED_LIBRARY: (state, { payload }) => {
    const libraryId = payload;
    const copyList = [...state.list];
    const index = copyList.findIndex(o => o.id === libraryId);
    copyList.splice(index, 1);
    return ({
      ...state,
      list: copyList,
    });
  },
}, initialState);
