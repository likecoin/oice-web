/*
XXX:
 _____  ______ _____  _____  ______ _____       _______ ______ _____
|  __ \|  ____|  __ \|  __ \|  ____/ ____|   /\|__   __|  ____|  __ \
| |  | | |__  | |__) | |__) | |__ | |       /  \  | |  | |__  | |  | |
| |  | |  __| |  ___/|  _  /|  __|| |      / /\ \ | |  |  __| | |  | |
| |__| | |____| |    | | \ \| |___| |____ / ____ \| |  | |____| |__| |
|_____/|______|_|    |_|  \_\______\_____/_/    \_\_|  |______|_____/

Please don't add anymore action type here
Please just declare it along with `createAction`
```
export const action = createAction('ACTION_TYPE');
```
And use it in reducer like this:
```
handleActions({
  [action]: (state, { payload }) => ({
    ...
  }),
})
```
*/

export const APP_ERROR = 'APP_ERROR';
export const APP_LOGIN = 'APP_LOGIN';
export const APP_LOGIN_ERROR = 'APP_LOGIN_ERROR';
export const APP_LOGOUT = 'APP_LOGOUT';

export const TOGGLE_PROGRESS_HUD = 'TOGGLE_PROGRESS_HUD';

export const SHOW_DIALOG = 'SHOW_DIALOG';
export const HIDE_DIALOG = 'HIDE_DIALOG';
// user
export const UPDATED_USER = 'UPDATED_USER';

// story
export const FETCH_CHARACTER = 'FETCH_CHARACTER';

// library
export const FETCH_LIBRARY_CHARACTERS = 'FETCH_LIBRARY_CHARACTERS';

export const FETCH_LIBRARIES = 'FETCH_LIBRARIES';
export const FETCH_LIBRARIES_BY_STORY = 'FETCH_LIBRARIES_BY_STORY';
export const ADD_LIBRARY_TO_STORY = 'ADD_LIBRARY_TO_STORY';
export const REMOVE_LIBRARY_FROM_STORY = 'REMOVE_LIBRARY_FROM_STORY';
// oice
export const FETCHED_OICES = 'FETCHED_OICES';
export const ADDED_OICE = 'ADDED_OICE';
export const SELECTED_OICE = 'SELECTED_OICE';
export const FETCH_SELECTED_OICE = 'FETCH_SELECTED_OICE';
export const UPDATED_OICE_ORDER = 'UPDATED_OICE_ORDER';
export const UPDATED_OICE = 'UPDATED_OICE';
export const DELETED_OICE = 'DELETED_OICE';
// export const UPDATED_VIEW_URL = 'UPDATED_VIEW_URL';
export const UPDATED_OICE_STAGE = 'UPDATED_OICE_STAGE';

// blocks
export const UPDATED_BLOCKS = 'UPDATED_BLOCKS'; // view
export const SELECTED_BLOCK = 'SELECTED_BLOCK';
export const ADDED_BLOCK = 'ADDED_BLOCK';
export const DUPLICATED_BLOCK = 'DUPLICATED_BLOCK';
export const DELETED_BLOCK = 'DELETED_BLOCK';
export const UPDATED_BLOCK_VIEW = 'UPDATED_BLOCK_VIEW';
export const ADDED_TOBESAVEDIDS = 'ADDED_TOBESAVEDIDS'; // for update toBeSavedIds
export const DELETED_TOBESAVEDIDS = 'DELETED_TOBESAVEDIDS'; // for update toBeSavedIds

// macros
export const FETCHED_MACROS = 'FETCHED_MACROS';
export const FETCHED_MACRO_ATTR_DEFINITIONS = 'FETCHED_MACRO_ATTR_DEFINITIONS';
