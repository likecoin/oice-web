import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import StripeCheckout from 'react-stripe-checkout';

import Avatar from 'ui-elements/Avatar';
import OutlineButton from 'ui-elements/OutlineButton';
import Progress from 'ui-elements/Progress';
import ToggleButton from 'ui-elements/ToggleButton';

import { getThumbnail } from 'common/utils';

import { STRIPE_KEY } from 'common/constants/stripe';


function CreditSection(props) {
  const { title, users } = props;
  return (
    <div className="credit-section">
      <h3>{title}</h3>
      {users &&
        <div className="credit-users">
          {users.map((user) =>
            user && (
              <Avatar
                key={user.id}
                label={user.displayName}
                size={32}
                src={getThumbnail(user.avatar, 200)}
                onClick={() => window.location.href = `/user/${user.id}`}
              />
            )
          )}
        </div>
      }
    </div>
  );
}

CreditSection.propTypes = {
  title: PropTypes.string,
  users: PropTypes.array,
};

CreditSection.defaultProps = {
  title: '',
  users: [],
};


function LibraryInfo(props) {
  const {
    isStore,
    mode,
    purchasing,
    t,
    togglingLibraryId,
    user,
    onToggle,
  } = props;

  const library = {
    name: '',
    description: '',
    price: 0,
    assetCount: 0,
    ...props.library,
  };

  const libraryThumbnail = getThumbnail(library.coverStorage, 200);

  const buttonProps = {
    color: undefined,
    disabled: false,
    label: '',
    className: classNames({
      disabled: purchasing,
    }),
  };

  switch (mode) {
    case 'free':
      buttonProps.color = 'green';
      buttonProps.label = t('free');
      break;
    case 'paid':
      buttonProps.color = 'blue';
      buttonProps.label = `US$ ${library.price}`;
      break;
    case 'purchased':
      buttonProps.label = t('purchased');
      buttonProps.disabled = true;
      break;
    case 'owned':
      if (library.price === 0) {
        buttonProps.color = 'green';
        buttonProps.label = t('free');
      } else if (library.price > 0) {
        buttonProps.color = 'blue';
        buttonProps.label = `US$ ${library.price}`;
      } else {
        buttonProps.disabled = true;
        buttonProps.label = t('label.usedByOiceProOnly');
      }
      break;
    default:
      break;
  }

  const isToggled = (
    togglingLibraryId === library.id ? !library.isSelected : library.isSelected
  );
  const toggleButtonDisabled = !isNaN(togglingLibraryId);
  const toggleButtonClassName = classNames({
    disabled: toggleButtonDisabled,
  });

  function handleOnToggle(toggled) {
    if (onToggle) onToggle(library.id, toggled);
  }

  function handlePurchaseLibrary() {
    if (mode !== 'owned') {
      props.onPurchase(library);
    } else {
      props.onClickOwnedLibrary();
    }
  }

  function handleReceiveStripeToken(token) {
    props.onPurchase(library, token);
  }

  function renderPurchaseButton() {
    return (
      <StripeCheckout
        ComponentClass="div"
        allowRememberMe={false}
        amount={library ? library.price * 100 : 0}
        className="fluid"
        currency="USD"
        email={user.email}
        image={libraryThumbnail}
        name={t('label.purchaseLibraryName', { name: library.name })}
        panelLabel={t('button.payForPrice', { currency: 'US' })}
        stripeKey={STRIPE_KEY}
        token={handleReceiveStripeToken}
      >
        <OutlineButton {...buttonProps} fluid />
      </StripeCheckout>
    );
  }

  return (
    <div className="library-info">
      <div className="library-column-thumbnail">
        <img
          alt={library.name}
          src={libraryThumbnail}
        />
      </div>
      <div className="library-column-info">
        <h1>{library.name}</h1>
        {library.description && <h2>{t('label.description')}</h2>}
        {library.description && <p>{library.description}</p>}
        <div className="library-credits">
          {library.author &&
            <CreditSection
              title={t('author')}
              users={[library.author]}
            />
          }
          {library.credits && library.credits.length > 0 &&
            <CreditSection
              title={t('credits')}
              users={library.credits}
            />
          }
        </div>
      </div>
      <div className="library-column-stats">
        <span>{t('label.assetCount', { count: library.assetCount })}</span>
      </div>
      <div className="library-column-action">
        {(mode === 'purchased' && !isStore) ? (
          <div className="library-action">
            <h2>{t('label.setting')}</h2>
            <ToggleButton
              className={toggleButtonClassName}
              leftLabel={t('hide')}
              rightLabel={t('show')}
              toggled={isToggled}
              onToggle={handleOnToggle}
            />
          </div>
        ) : (
          <div className="library-action">
            {mode === 'paid' && user && !user.hasPaymentInfo ? (
              renderPurchaseButton()
            ) : (
              <OutlineButton
                {...buttonProps}
                fluid
                onClick={handlePurchaseLibrary}
              />
            )}
          </div>
        )}
        {((mode === 'purchased' && toggleButtonDisabled) || purchasing) &&
          <div className="loading">
            <Progress.LoadingIndicator />
          </div>
        }
      </div>
    </div>
  );
}

LibraryInfo.propTypes = {
  t: PropTypes.func.isRequired,
  library: PropTypes.object,
  isStore: PropTypes.bool,
  mode: PropTypes.oneOf(['free', 'paid', 'purchased', 'owned']),
  purchasing: PropTypes.bool,
  togglingLibraryId: PropTypes.number,
  user: PropTypes.object,
  onClickOwnedLibrary: PropTypes.func,
  onPurchase: PropTypes.func,
  onToggle: PropTypes.func,
};

LibraryInfo.defaultProps = {
  mode: 'free',
};

export default LibraryInfo;
