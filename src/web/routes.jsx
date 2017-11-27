import React from 'react';
import { Route } from 'react-router';
import Redirect from 'react-router/lib/Redirect';

import App from 'web/App';
import Login from 'web/pages/Login';
import Home from 'web/pages/Home';
import OiceSingleView from 'web/pages/OiceSingleView';
import Tutorial from 'web/pages/Tutorial';
import TermsOfService from 'web/pages/TermsOfService';
import Profile from 'web/pages/Profile';
import UserPage from 'web/pages/User';
import Footer from 'common/components/Footer';
import Stripe from 'web/pages/Stripe';
import IOSInvitation from 'web/pages/IOSInvitation';
import Competition1718 from 'web/pages/Competition1718';

const goToEdit = () => {
  window.location.pathname = '/edit';
};

const routes = (
  <Route>
    <Route component={Login} path="/login" />
    <Route component={App} path="/">
      <Route
        components={{ children: Home, Footer }}
        path="about"
      />
      <Route
        component={OiceSingleView}
        path="story/:uuid"
      >
        <Route path="preview" />
      </Route>
      <Route
        components={{ children: Tutorial, Footer }}
        path="tutorial"
      >
        <Route path=":tutorialType(/:id)" />
      </Route>
      <Route
        components={{ children: Profile, Footer }}
        path="profile"
      />
      <Route
        components={{ children: TermsOfService, Footer }}
        path="terms"
      />
      <Route path="edit" onEnter={goToEdit} />
      <Route components={Stripe} path="stripe" />
      <Route components={IOSInvitation} path="ios" />
      <Route
        components={{ children: UserPage, Footer }}
        path="user(/:id)"
      />
      <Route
        components={{ children: UserPage, Footer }}
        path="@:username"
      />
      <Route
        components={{ children: Competition1718, Footer }}
        path="competition1718"
      />
      <Redirect from="*" to="about" />
    </Route>
  </Route>
);

export default routes;
