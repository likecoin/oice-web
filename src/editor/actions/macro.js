import { createAction } from 'redux-actions';

import * as MacroApi from 'common/api/macro';
import { APIHandler } from 'common/utils/api';


export const updateMacros = createAction('FETCHED_MACROS');
export const fetchedMacroAttrDefinitions = createAction('FETCHED_MACRO_ATTR_DEFINITIONS');

export const fetchMacros = storyId => dispatch => APIHandler(dispatch,
  MacroApi.fetchMacros(storyId)
    .then(macros => dispatch(updateMacros(macros)))
);

export const fetchMacroAttributesDef = macroId => dispatch => APIHandler(dispatch,
  MacroApi.fetchMacroAttributesDef(macroId)
    .then(attributesDef => dispatch(
      fetchedMacroAttrDefinitions({
        attrDefList: attributesDef,
        macroId,
      })
    ))
);
