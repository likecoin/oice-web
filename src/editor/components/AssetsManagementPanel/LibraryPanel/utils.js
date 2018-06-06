import * as ASSET_TYPE from 'common/constants/assetTypes';
import { getLocalUserItem } from 'common/utils/auth';
import USER_ROLE from 'common/constants/userRoles';

import {
  fetchTypedAssetsByLibraryId,
  fetchCharactersByLibraryId,
} from './actions';

const getArrayIndexById = (array, id) => array.findIndex(a => a.id === id);

export const getUpdatedAssetsList = (list = [], value) => {
  const isDelete = !Number.isNaN(value);
  const index = getArrayIndexById(list, isDelete ? value : value.id);
  if (index === -1) return list;

  const newList = [...list];
  if (isDelete) {
    newList.splice(index, 1);
  } else {
    newList[index] = value;
  }
  return newList;
};

export const isCharacterType = type => (type === ASSET_TYPE.CHARACTER);

export const fetchAssetsIfNeeded = (props) => {
  const {
    dispatch,
    libraryId,
    sync,
    type,
  } = props;

  // FIXME: User callback to dispatch ??
  if (!sync) {
    if (isCharacterType(type)) {
      dispatch(fetchCharactersByLibraryId(libraryId));
    } else {
      dispatch(fetchTypedAssetsByLibraryId(libraryId, type));
    }
  }
};

export const ownEditPermission = (library) => {
  let libraryAuthorId = 0;
  if (library && library.author) {
    libraryAuthorId = library.author.id;
  }
  const { role, id } = getLocalUserItem();
  const isMyLibrary = (id === libraryAuthorId);

  switch (role) {
    case USER_ROLE.ADMIN:
      return true;
    case USER_ROLE.PRO:
      if (isMyLibrary) return true;
      break;
    default:
      break;
  }
  return false;
};

export const getFilename = name => name.split('.')[0];
