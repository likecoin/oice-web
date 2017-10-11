import { createAction } from 'redux-actions';
import * as CharacterAPI from 'common/api/character';
import { APIHandler } from 'common/utils/api';

export const fetchCharacterBegin = createAction('FETCH_CHARACTER_BEGIN');
export const fetchedCharacter = createAction('FETCH_CHARACTER');
export const fetchCharacter = storyId => (dispatch) => {
  dispatch(fetchCharacterBegin());
  APIHandler(dispatch,
    CharacterAPI.fetchCharacter(storyId)
    .then(characters => dispatch(fetchedCharacter(characters)))
  );
};

export const fetchedCharacterByLibrary = createAction('FETCH_LIBRARY_CHARACTERS');
export const fetchCharacterByLibrary = libraryId => dispatch => APIHandler(dispatch,
  CharacterAPI.fetchCharacterByLibrary(libraryId)
  .then(characters => dispatch(fetchedCharacterByLibrary(characters)))
);
