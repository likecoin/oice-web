import React from 'react';

import Route from 'react-router/lib/Route';
import Redirect from 'react-router/lib/Redirect';
import IndexRoute from 'react-router/lib/IndexRoute';
import IndexRedirect from 'react-router/lib/IndexRedirect';

import App from './views/App';
import LibraryDashboard from './views/LibraryDashboard';
import LibraryDetails from './views/LibraryDetails';


export default (
  <Route component={App} path="/">
    <Route component={LibraryDashboard} path="asset">
      <Redirect from="library" to="/asset" />
      <Route component={LibraryDetails} path="library/:libraryId" />
    </Route>
    <Route component={LibraryDetails} path="asset/library/:libraryId/edit" isEdit />
    <Route component={LibraryDashboard} path="store" isStore>
      <Redirect from="collection" to="/store" />
      <Redirect from="library" to="/store" />
      <Route component={LibraryDetails} path="library/:libraryId" isStore />
    </Route>
    <Route component={LibraryDashboard} path="store/collection/:collectionId" isStore>
      <Route path=":alias" isStore />
    </Route>
  </Route>
);
