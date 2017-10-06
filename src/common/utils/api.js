import _get from 'lodash/get';

import AlertDialog from 'ui-elements/AlertDialog';

import { redirectToLoginPage } from './auth';

export function APIHandler(
  dispatch,
  promise,
  errorHandler,
  knownErrorTypes,
  knownErrorHandler = (error, toggleAlert) => {
    toggleAlert({
      body: error.message,
      type: 'alert',
    });
  },
  shouldDisplayErrorDialog = true
) {
  return promise.catch((error) => {
    const code = _get(error, 'status');
    const message = _get(
      error, 'response.body.message', _get(error, 'message', 'CRITICAL_ERROR')
    );
    const isKnownError = knownErrorTypes && knownErrorTypes.find(errorType =>
      errorType === message
    );

    switch (code) {
      case 401:
        redirectToLoginPage();
        break;
      default:
        if (typeof errorHandler === 'function') {
          errorHandler(code, message);
        }
        if (isKnownError && shouldDisplayErrorDialog && typeof knownErrorHandler === 'function') {
          knownErrorHandler(
            {
              code,
              message,
            },
            payload => dispatch(AlertDialog.toggle(payload))
          );
        } else if (dispatch && (isKnownError && shouldDisplayErrorDialog)) {
          dispatch(AlertDialog.toggle({
            title: `[${code}] ${error.message}`,
            body: message,
            type: 'error',
          }));
        } else {
          console.error('%o', error);
        }
        break;
    }

    return undefined;
  });
}
