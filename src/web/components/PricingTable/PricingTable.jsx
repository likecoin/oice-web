import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import classNames from 'classnames';

import OutlineButton from 'common/components/OutlineButton';
import { isNormalUser } from 'common/utils/user';

import './PricingTable.styles.scss';


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
    key: 'exportOice',
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
        {props.actionButton ||
          <OutlineButton
            label={props.actionButtonText}
            color={props.type === 'backer' ? 'blue' : null}
            width={200}
            disabled={props.isActionButtonDisabled}
            onClick={props.onClickActionButton}
          />
        }
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
  actionButton: PropTypes.node,
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

    oiceBackerButton: PropTypes.node,

    onClickRegistrationButton: PropTypes.func,
    onClickBecomeOiceBackerButton: PropTypes.func,
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
            onClickActionButton={this.props.onClickRegistrationButton}
          />
          <PriceCard
            t={t}
            type="backer"
            title={t('label.backer.title')}
            subtitle={t('label.backer.subtitle')}
            actionButtonText={t(`button.backer.${isOiceBacker ? 'already' : 'action'}`)}
            isActionButtonDisabled={isOiceBacker}
            actionButton={this.props.oiceBackerButton}
            onClickActionButton={this.props.onClickBecomeOiceBackerButton}
          />
        </div>
      </div>
    );
  }
}
