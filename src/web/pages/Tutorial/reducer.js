import { combineReducers } from 'redux';

import visualReducer from './pages/Visual/reducer';


export default combineReducers({
  visual: visualReducer,
});
