import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import classNames from 'classnames';

import OutlineButton from 'common/components/OutlineButton';

import './PricingTable.styles.scss';

import { showPaymentInProfile } from 'common/utils/auth';
import { isNormalUser } from 'common/utils/user';

import USER_ROLE from 'common/constants/userRoles';
import { PROFILE_ACTION } from 'web/pages/Profile/Profile.constants';


const FEATURE_LIST = [
  {
    key: 'createAndReadOice',
    isFree: true,
  },
  {
    key: 'uploadPublicAssets',
    isFree: true,
  },
  {
    key: 'uploadPrivateAssets',
    isFree: false,
  },
  {
    key: 'readAllOice',
    isFree: false,
  },
  {
    key: 'noLimitation',
    isFree: false,
  },
  {
    key: 'noAds',
    isFree: false,
  },
  {
    key: 'memberExclusiveEvent',
    isFree: false,
  },
];


function FeatureItem(props) {
  const className = classNames({
    featured: props.isFree || props.type === 'backer',
  });
  return <li className={className}>{props.text}</li>;
}

FeatureItem.propTypes = {
  text: PropTypes.string,
  isFree: PropTypes.bool,
  type: PropTypes.oneOf(['free', 'backer']),
};


function PriceCard(props) {
  const className = classNames('price-card', props.type);
  return (
    <div className={className}>
      <header>
        <h2 dangerouslySetInnerHTML={{ __html: props.title }} />
        <h3 dangerouslySetInnerHTML={{ __html: props.subtitle }} />
      </header>
      <ul>
        {FEATURE_LIST.map(feature =>
          <FeatureItem
            {...{
              ...feature,
              text: props.t(`label.features.${feature.key}`),
              type: props.type,
            }}
          />
        )}
      </ul>
      <footer>
        <OutlineButton
          label={props.actionButtonText}
          color={props.type === 'backer' ? 'blue' : null}
          width={200}
          disabled={props.isActionButtonDisabled}
          onClick={props.onClickActionButton}
        />
      </footer>
    </div>
  );
}

PriceCard.propTypes = {
  t: PropTypes.func.isRequired,

  type: PropTypes.oneOf(['free', 'backer']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  isActionButtonDisabled: PropTypes.bool,
  actionButtonText: PropTypes.string,
  onClickActionButton: PropTypes.func,
};

@connect(store => ({
  membership: store.user.role,
}))
@translate('PricingTable')
export default class PricingTable extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    membership: PropTypes.string,
  }

  _handleClickRegistrationButton = () => {
    window.location.pathname = '/edit';
  }

  _handleClickBecomeOiceBackerButton = () => {
    showPaymentInProfile.set();
    window.location.href = `/profile?action=${PROFILE_ACTION.BECOME_BACKER}`;
  }

  render() {
    const { t, membership } = this.props;

    const isOiceBacker = !isNormalUser(membership);

    return (
      <div className="pricing-table">
        <div>
          <PriceCard
            t={t}
            type="free"
            title={t('label.free.title')}
            subtitle={t('label.free.subtitle')}
            actionButtonText={t(`button.free.${membership ? 'already' : 'action'}`)}
            isActionButtonDisabled={!!membership}
            onClickActionButton={this._handleClickRegistrationButton}
          />
          <PriceCard
            t={t}
            type="backer"
            title={t('label.backer.title')}
            subtitle={t('label.backer.subtitle')}
            actionButtonText={t(`button.backer.${isOiceBacker ? 'already' : 'action'}`)}
            isActionButtonDisabled={isOiceBacker}
            onClickActionButton={this._handleClickBecomeOiceBackerButton}
          />
        </div>
      </div>
    );
  }
}
