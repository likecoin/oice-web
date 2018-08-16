import { createAction } from 'redux-actions';
import request from 'superagent';

import * as UserAPI from 'common/api/user';
import * as UserLinkAPI from 'common/api/userLink';
import { APIHandler } from 'common/utils/api';
import { fetchOicesFromUserStory } from 'common/api/oice';

export const fetchLikeCoinUsdPriceEnd = createAction('FETCH_LIKECOIN_USD_PRICE_END');
export const fetchLikeCoinUsdPrice = () => async (dispatch) => {
  try {
    const res = await request.get('https://api.coingecko.com/api/v3/coins/likecoin?localization=false');
    dispatch(fetchLikeCoinUsdPriceEnd(res.body.market_data.current_price.usd));
  } catch (err) {
    console.error(err);
  }
};

export const fetchUserProfileBegin = createAction('FETCH_USER_CREDITS_BEGIN');
export const fetchUserProfileEnd = createAction('FETCH_USER_PROFILE_INFO_END');
export const fetchUserProfileDetailsEnd = createAction('FETCH_USER_CREDITS_END');
export const fetchUserLinksEnd = createAction('USER_LINKS_FETCH_END');
export const fetchUserProfile = userId => (dispatch) => {
  dispatch(fetchUserProfileBegin());
  APIHandler(dispatch,
    UserAPI.fetchUserProfile(userId)
      .then((user) => {
        dispatch(fetchUserProfileEnd({ user }));
        if (user.likeCoinId) {
          dispatch(fetchLikeCoinUsdPrice());
        }
      })
  );
  APIHandler(dispatch,
    UserAPI.fetchUserProfileDetails(userId)
      .then(profile => dispatch(fetchUserProfileDetailsEnd(profile)))
  );
  APIHandler(dispatch,
    UserLinkAPI.fetchUserLinks(userId)
      .then(links => dispatch(fetchUserLinksEnd({ links })))
  );
};

export const fetchOicesFromStoryBegin = createAction('FETCH_OICES_FROM_STORY_BEGIN');
export const fetchOicesFromStoryEnd = createAction('FETCH_OICES_FROM_STORY_END');
export const fetchOicesFromStory = (userId, storyId) => (dispatch) => {
  dispatch(fetchOicesFromStoryBegin());
  APIHandler(dispatch,
    fetchOicesFromUserStory(userId, storyId)
      .then(oices => dispatch(fetchOicesFromStoryEnd(oices)))
  );
};
export const closeOiceList = createAction('CLOSE_OICE_LIST');
