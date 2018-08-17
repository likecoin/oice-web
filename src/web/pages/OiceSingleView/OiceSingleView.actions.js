import { createAction } from 'redux-actions';
import request from 'superagent';
import superagentJSONP from 'superagent-jsonp';

import _get from 'lodash/get';

import * as OiceAPI from 'common/api/oice';
import * as StoryAPI from 'common/api/story';
import { APIHandler } from 'common/utils/api';


export const fetchedOiceCredits = createAction('OICE_CREDITS_FETCHED');
export const fetchOiceCredits = id => (dispatch) => {
  OiceAPI.fetchOiceCredits(id)
    .then(credits => dispatch(fetchedOiceCredits(credits)));
};

export const fetchedRelatedOices = createAction('RELATED_OICES_FETCHED');
export const fetchRelatedOices = oiceId => (dispatch) => {
  OiceAPI.fetchRelatedOices(oiceId)
    .then(oices => dispatch(fetchedRelatedOices(oices)));
};

export const fetchOiceFromStory = (userId, storyId) => (dispatch) => {
  OiceAPI.fetchOicesFromUserStory(userId, storyId)
    .then(oices => dispatch(fetchedRelatedOices(oices)));
};

export const fetchedOiceInfo = createAction('OICE_INFO_FETCHED');
export const fetchOiceInfo = (oiceUuid, language) => (dispatch) => {
  APIHandler(dispatch, OiceAPI.fetchOiceOgByUUID(oiceUuid, language)
    .then((oice) => {
      dispatch(fetchedOiceInfo(oice));
      dispatch(fetchOiceCredits(oice.id));
      dispatch(fetchOiceFromStory(oice.author.id, oice.storyId));
    }));
};

export const incrementedOiceViewCount = createAction('OICE_VIEW_COUNT_INCREMENTED');
export const incrementOiceViewCount = oiceId => (dispatch) => {
  OiceAPI.incrementOiceViewCount(oiceId)
    .then(ok => console.log());
};

export const fetchedCountriesJson = createAction('SMS_COUNTRIES_FETCHED');
export const fetchCountriesJson = () => (dispatch) => {
  const promise = request.get('/static/sms/countries.json')
    .set('Accept', 'application/json')
    .then((response) => {
      dispatch(fetchedCountriesJson(response.body));
    });
  APIHandler(dispatch, promise);
};

export const resetSMS = createAction('SMS_RESET');
export const willSendSMS = createAction('SMS_WILL_SEND');
export const didSendSMS = createAction('SMS_DID_SEND');
export const sendSMS = (phone, linkData, options = {}) => (dispatch) => {
  /* global branch: true */
  dispatch(willSendSMS());
  branch.sendSMS(phone, linkData, options, (err, result) => {
    if (!err) {
      dispatch(didSendSMS());
    }
  });
};

export const updateStoryCover = payload => async (dispatch) => {
  await APIHandler(dispatch, StoryAPI.updateStory(payload));
};

const FETCH_LOCATION_CALLBACK_NAME = 'handleCountryCodeDataFetched';

// callback to handle jsonp from geoip-db
window.callback = (data) => {
  const countryCode = _get(data, 'country_code');
  if (countryCode) {
    // callback to handle superagent-jsonp
    window[FETCH_LOCATION_CALLBACK_NAME](countryCode);
  }
};

export const fetchUserCountryCodeEnd = createAction('USER_COUNTRY_CODE_FETCH_END');
export const fetchUserCountryCodeByIP = () => (dispatch) => {
  request.get('https://geoip-db.com/jsonp')
    .use(superagentJSONP({
      callbackName: FETCH_LOCATION_CALLBACK_NAME,
      timeout: 5000,
    }))
    .end((error, response) => {
      if (!error) {
        dispatch(fetchUserCountryCodeEnd(response.body));
      }
    });
};
