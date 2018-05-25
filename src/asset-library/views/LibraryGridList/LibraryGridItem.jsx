import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import classNames from 'classnames';

import _get from 'lodash/get';

import EditIcon from 'common/icons/edit';

import ToggleButton from 'ui-elements/ToggleButton';
import Progress from 'ui-elements/Progress';

import { STORE_TYPE } from 'asset-library/constants';

import { getThumbnail } from 'common/utils';

const colors = {
  public: '#1b941a',
  private: '#fc404d',
  pendingForSale: '#1082e2',
};

@translate(['LibraryDashboard', 'MyLibraryDashboard', 'AssetStore'])
export default class LibraryGridItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    togglingLibraryId: PropTypes.number,
    onClick: PropTypes.func,
    onToggle: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      toggled: props.library.isSelected,
    };
  }

  componentWillReceiveProps(nextProps) {
    const toggled = _get(nextProps, 'library.isSelected');
    if (toggled !== this.state.toggled) {
      this.setState({ toggled });
    }
  }

  handleToggle = (toggled) => {
    const { library, onToggle } = this.props;
    if (onToggle) onToggle(library.id, toggled);
    this.setState({ toggled });
  }

  handleClick = (event) => {
    if (this.toggleButton && this.toggleButton.contains(event.target)) return;

    const { library, onClick } = this.props;
    if (onClick) onClick(library);
  }

  getLibraryStatusString(libraryStatus) {
    const { t, library, type } = this.props;
    const { price, launchedAt, isPurchased } = library;
    let str = '';
    if (type === STORE_TYPE.MYLIBRARIES) {
      if (price > 0 && launchedAt) {
        str = t('label.price', { price: price.toFixed(2) });
      } else {
        str = t(`label.${libraryStatus}`);
      }
    }
    if (type === STORE_TYPE.ASSETSTORE) {
      if (isPurchased) {
        str = t('label.purchased');
      } else if (price > 0) {
        str = t('label.price', { price: price.toFixed(2) });
      } else {
        str = t('label.free');
      }
    }
    return str;
  }

  renderLibraryPriceInfo(libraryStatus) {
    const { type, library } = this.props;
    let color = colors[libraryStatus];
    if (type === STORE_TYPE.ASSETSTORE && library.isPurchased) {
      color = null;
    }
    return (
      <p style={{ color }}>
        {this.getLibraryStatusString(libraryStatus)}
      </p>
    );
  }

  renderLibraryTopLabel(type) {
    const { library } = this.props;
    let string = '';
    if (type === STORE_TYPE.PURCHASEDLIBRARIES) {
      if (library.isRecentUpdated) {
        string = '• update';
      }
    } else if (library.isNew) {
      string = '• new';
    }
    return (
      <div className="library-label">{string}</div>
    );
  }

  renderMyLibraryStatusFlag(libraryStatus) {
    const { library } = this.props;
    return (
      <div>
        {libraryStatus === 'pendingForSale' && library.launchedAt &&
          <div className="for-sale sale">$</div>
        }
        {libraryStatus === 'pendingForSale' && !library.launchedAt &&
          <div className="for-sale edit"><EditIcon /></div>
        }
      </div>
    );
  }

  renderPurchasedLibraryToggle() {
    const { toggled } = this.state;
    return (
      <div ref={(ref => this.toggleButton = ref)} className="library-toggle">
        <ToggleButton
          toggled={toggled}
          onToggle={this.handleToggle}
        />
      </div>
    );
  }

  render() {
    const { t, library, type, togglingLibraryId, onClick, onToggle } = this.props;
    const cover = getThumbnail(
      library.coverStorage || '/static/img/oice-default-cover2.jpg',
      300
    );

    let libraryStatus = '';
    const { price } = library;
    if (price === 0) {
      libraryStatus = 'public';
    } else if (price === -1) {
      libraryStatus = 'private';
    } else if (price > 0) {
      libraryStatus = 'pendingForSale';
    }

    const unselected = type === STORE_TYPE.PURCHASEDLIBRARIES && !library.isSelected;
    const styles = {
      cover: {
        backgroundImage: `url("${cover}")`,
      },
    };
    const disabled = togglingLibraryId === library.id;
    const className = classNames('library-grid-item', {
      disabled,
      unselected,
    });
    return (
      <li {... { className }} onClick={this.handleClick}>
        <div>
          <div className="library-cover" style={styles.cover} />
          {disabled &&
            <div className="loading"><Progress.LoadingIndicator /></div>
          }
        </div>
        <h3>{library.name}</h3>
        <p>{t('label.numberOfAssets', { count: library.assetCount })}</p>
        {type !== STORE_TYPE.PURCHASEDLIBRARIES && this.renderLibraryPriceInfo(libraryStatus)}
        {type !== STORE_TYPE.MYLIBRARIES && this.renderLibraryTopLabel(type)}
        {type === STORE_TYPE.MYLIBRARIES && this.renderMyLibraryStatusFlag(libraryStatus)}
        {type === STORE_TYPE.PURCHASEDLIBRARIES && this.renderPurchasedLibraryToggle()}
        {/* owned */}
      </li>
    );
  }
}
