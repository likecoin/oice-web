import { STRIPE_CLIENT_ID } from '../constants/stripe';

export function getStripeAuthorizeURL(redirectURL) {
  let url = `https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=${STRIPE_CLIENT_ID}`;
  if (redirectURL) {
    url += `&redirect_uri=${redirectURL}`;
  }
  return url;
}


export default {
  getAuthorizeURL: getStripeAuthorizeURL,
};
