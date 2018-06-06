import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { forceCheck } from 'react-lazyload';

import classNames from 'classnames';
import _isEmpty from 'lodash/isEmpty';

import Dropdown from 'ui-elements/Dropdown';
import Modal from 'ui-elements/Modal';

import AssetList from './AssetList';

import Actions from './actions';

import './styles.scss';


function getStateFromProps(nextProps, prevProps = {}) {
  const {
    assets,
    assetLibraryIds,
    libraries,
    recentUsedAssets,
    selectedAssetId,
  } = nextProps;

  const state = {
    dropdownListItems: assetLibraryIds ? (
      assetLibraryIds.map(id => libraries[id].name)
    ) : [],
  };

  if (nextProps.open && !prevProps.open) {
    const asset = (selectedAssetId ?
      assets.find(a => a.id === selectedAssetId) :
      recentUsedAssets[0]
    );

    if (assetLibraryIds && assetLibraryIds.length > 0 && !_isEmpty(libraries)) {
      // select the first library (index 0) if asset's library is no longer selected / new story
      state.selectedLibraryIndex = Math.max(0, (asset || null) && assetLibraryIds.findIndex(id => id === asset.libraryId));
    }
  }
  return state;
}

@connect((store) => {
  const { assetLibraryIds } = store.editorPanel.AttributesPanel.AssetSelectionModal;
  const libraries = store.libraries.dict;
  // prevent library is selected but neither purchased nor owned by user
  const filteredAssetLibraryIds = assetLibraryIds ? assetLibraryIds.filter(id => !!libraries[id]) : assetLibraryIds;
  return {
    ...store.editorPanel.AttributesPanel.AssetSelectionModal,
    libraries,
    assetLibraryIds: filteredAssetLibraryIds,
  };
})
@translate(['AssetSelectionModal'])
export default class AssetSelectionModal extends React.Component {
  static Actions = Actions;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    assets: PropTypes.array,
    assetLibraryIds: PropTypes.array,
    libraries: PropTypes.object,
    open: PropTypes.bool,
    recentUsedAssets: PropTypes.array,
    selectedAssetId: PropTypes.number,
    title: PropTypes.string,
    onSelected: PropTypes.func,
  }

  static defaultProps = {
    open: false,
    recentUsedAssets: [],
  }

  constructor(props) {
    super(props);

    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps, this.props), this.handleAssetModalUpdate);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.selectedAssetId !== nextProps.selectedAssetId ||
      this.state.selectedLibraryIndex !== nextState.selectedLibraryIndex ||
      this.props.assets.length !== nextProps.assets.length
    ) {
      const {
        assets,
        assetLibraryIds,
        libraries,
      } = nextProps;
      const { selectedLibraryIndex } = nextState;

      let filteredAssets;
      if (assetLibraryIds && libraries && assets.length > 0 && selectedLibraryIndex >= 0) {
        const selectedLibrary = libraries[assetLibraryIds[selectedLibraryIndex]];
        filteredAssets = assets.filter(
          item => item.libraryId === selectedLibrary.id
        );
      }
      this.setState({ filteredAssets: filteredAssets || [...assets] }); // eslint-disable-line
    }
  }

  handleAssetModalUpdate = () => {
    if (this.props.open) {
      forceCheck();
    }
  }

  handleDropdownSelect = (selectedIndexes) => {
    if (selectedIndexes.length > 0) {
      const { assetLibraryIds } = this.props;
      const index = selectedIndexes[0];
      if (assetLibraryIds && index === assetLibraryIds.length) {
        this.handleCloseRequest();
        window.location.href = '/store';
      } else {
        this.setState({ selectedLibraryIndex: index }, this.handleAssetModalUpdate);
      }
    }
  }

  handleAssetSelect = (itemId) => {
    if (this.props.onSelected) this.props.onSelected(itemId);
    this.handleCloseRequest();
  }

  handleCloseRequest = () => {
    this.props.dispatch(Actions.close());
  }

  render() {
    const {
      open,
      recentUsedAssets,
      selectedAssetId,
      t,
      title,
      assetLibraryIds,
    } = this.props;

    const {
      dropdownListItems,
      selectedLibraryIndex,
      filteredAssets,
    } = this.state;

    const isShowRecentUsed = (recentUsedAssets.length > 0);

    return (
      <Modal
        className="asset-selection-modal"
        open={open}
        width={914}
        onClickOutside={this.handleCloseRequest}
      >
        <Modal.Header onClickCloseButton={this.handleCloseRequest}>
          {title}
        </Modal.Header>
        <Modal.Body ref={ref => this.modalBody = ref}>
          {isShowRecentUsed &&
            <h1>{t('label.recentUsed')}</h1>
          }
          {isShowRecentUsed &&
            <AssetList
              assets={recentUsedAssets}
              onSelect={this.handleAssetSelect}
            />
          }
          {!!assetLibraryIds &&
            <div className="library-filter-container">
              <h1>{t('label.filteredLibrary')}</h1>
              <Dropdown
                placeholder={t('placeholder.libraryFilter')}
                selectedIndexes={[selectedLibraryIndex]}
                values={
                  [...dropdownListItems, t('button.selectMoreAssets')]
                  .map(item => ({ text: item }))
                }
                width={250}
                onChange={this.handleDropdownSelect}
              />
            </div>
          }
          <AssetList
            assets={filteredAssets}
            selectedAssetId={selectedAssetId}
            onSelect={this.handleAssetSelect}
          />
        </Modal.Body>
      </Modal>
    );
  }
}
