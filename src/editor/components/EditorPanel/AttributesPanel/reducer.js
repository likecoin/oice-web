import { combineReducers } from 'redux';

import AssetSelectionModalReducer from './AssetSelectionModal/reducer';


export default combineReducers({
  AssetSelectionModal: AssetSelectionModalReducer,
});
