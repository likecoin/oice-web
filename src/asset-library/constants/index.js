export const LIBRARY_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  FORSALE: 'forSale',
  SELECTED: 'selected',
  UNSELECTED: 'unselected',
};

export const LIBRARY_TYPES = [
  LIBRARY_TYPE.PUBLIC,
  LIBRARY_TYPE.PRIVATE,
  LIBRARY_TYPE.FORSALE,
  LIBRARY_TYPE.SELECTED,
  LIBRARY_TYPE.UNSELECTED,
];

export const LIBRARY_ACTION = {
  ADD_PRIVATE_LIBRARY: 'add-private-library',
  ADD_SALE_LIBRARY: 'add-sale-library',
  START_TUTORIAL: 'tutorial',
};

export const TAB_BAR_ITEM = {
  MY_LIBRARIES: {
    key: 'myLibraries',
    path: '/asset',
  },
  PURCHASED_LIBRARIES: {
    key: 'purchasedLibraries',
    path: '/asset',
  },
  ASSET_STORE: {
    key: 'assetStore',
    path: '/store',
  },
};

export const TAB_BAR_ITEM_LIST = [
  TAB_BAR_ITEM.MY_LIBRARIES,
  TAB_BAR_ITEM.PURCHASED_LIBRARIES,
  TAB_BAR_ITEM.ASSET_STORE,
];


export const STORE_TYPE = {
  MYLIBRARIES: 'myLibraries',
  PURCHASEDLIBRARIES: 'purchasedLibraries',
  ASSETSTORE: 'assetStore',
};

export const STORE_LIBRARY_LIST_TYPE = {
  FEATURED: 'featured',
  LATEST: 'latest',
  FREE: 'free',
  ALL: 'all',
};

export const STORE_LIBRARY_LIST = [
  STORE_LIBRARY_LIST_TYPE.LATEST,
  STORE_LIBRARY_LIST_TYPE.FREE,
];
