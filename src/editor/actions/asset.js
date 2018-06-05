import { createAction } from 'redux-actions';
import * as AssetAPI from 'common/api/asset';
import { APIHandler } from 'common/utils/api';


export const fetchStoryAssetsBegin = createAction('FETCH_STORY_ASSETS_BEGIN');
export const fetchStoryAssetsEnd = createAction('FETCH_STORY_ASSETS_END');
export const fetchStoryAssetList = storyId => (dispatch) => {
  dispatch(fetchStoryAssetsBegin());
  APIHandler(dispatch,
    AssetAPI.fetchStoryAssetList(storyId)
      .then(assetList => dispatch(
        fetchStoryAssetsEnd({ assetList })
      ))
  );
};
