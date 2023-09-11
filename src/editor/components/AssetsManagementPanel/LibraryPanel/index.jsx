import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Container from 'ui-elements/Container';
import Tabs from 'ui-elements/Tabs';
import Tab from 'ui-elements/Tab';
import FlatButton from 'ui-elements/FlatButton';
import TextField from 'ui-elements/TextField';
import Dropdown from 'ui-elements/Dropdown';
import GridList from 'ui-elements/GridList';
import Card from 'ui-elements/Card';
import AudioPlayer from 'ui-elements/AudioPlayer';

import SettingIcon from 'common/icons/setting';
import AddIcon from 'common/icons/add';

import { checkAssetType } from 'editor/utils/app';

import * as ASSET_TYPE from 'common/constants/assetTypes';
import { DOMAIN_URL } from 'common/constants';

import AssetsGridList from './AssetsGridList';
import AudioList from './AudioList';
import BackgroundModal from './BackgroundModal';
import CharacterModal from './CharacterModal';
import ItemModal from './ItemModal';

import { toggleLibraryModal } from '../LibraryModal/redux.js';
import {
  fetchSelectedLibraryById,
  deselectLibrary,
} from './actions.js';
import { ownEditPermission } from './utils';

import './styles.scss';

@DragDropContext(HTML5Backend)
@translate(['assetsManagement', 'assets'])
@connect((store) => {
  const library = store.libraryPanel.selectedLibrary;
  const haveEditPermission = ownEditPermission(library);
  return {
    library,
    haveEditPermission,
  };
})
export default class LibraryPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    haveEditPermission: PropTypes.bool,
    library: PropTypes.object,
    params: PropTypes.object,
  }

  componentDidMount() {
    const { library, params } = this.props;
    const { libraryId, assetType } = params;
    this.redirectIfNeeded(assetType);
    if (!library) {
      this.props.dispatch(fetchSelectedLibraryById(libraryId));
    }
  }

  componentWillReceiveProps(nextProps) {
    this.redirectIfNeeded(nextProps.params.assetType);
  }

  componentWillUnmount() {
    this.props.dispatch(deselectLibrary());
  }

  handleTabOnChange = (index) => {
    this.goToAssetType(ASSET_TYPE.LIST[index]);
  }

  redirectIfNeeded(assetType) {
    if (!checkAssetType(assetType).isValid) this.goToAssetType(ASSET_TYPE.CHARACTER);
  }

  goToAssetType(type) {
    this.props.dispatch(push(`/library/${this.props.params.libraryId}/${type}`));
  }

  handleLibrarySettingButtonClick = () => {
    const { library } = this.props;
    this.props.dispatch(toggleLibraryModal({ open: true, library }));
  }

  renderTabs() {
    const { t, library } = this.props;
    const props = { libraryId: library.id };
    return ASSET_TYPE.LIST.map((type, index) => {
      let tabContent;
      props.type = type;
      switch (type) {
        case ASSET_TYPE.CHARACTER:
        case ASSET_TYPE.BACKGROUND:
        case ASSET_TYPE.ITEM:
          tabContent = <AssetsGridList {...props} />;
          break;
        case ASSET_TYPE.MUSIC:
        case ASSET_TYPE.SOUND:
          tabContent = <AudioList {...props} />;
          break;
        default:
          break;
      }
      return (
        <Tab key={index} index={index} title={t(`category.${type}`)}>
          {tabContent}
        </Tab>
      );
    });
  }

  render() {
    const { library, t, haveEditPermission } = this.props;
    const { assetType } = this.props.params;

    const checkAssetTypeResult = checkAssetType(assetType);
    const selectedTabIndex = checkAssetTypeResult.index;

    return (
      <Container id="library-panel">
        {(checkAssetTypeResult.isValid && library) &&
          <Tabs
            rightBarItem={
              haveEditPermission &&
                <FlatButton
                  icon={<SettingIcon />}
                  label={t('setting')}
                  onClick={this.handleLibrarySettingButtonClick}
                />
            }
            value={selectedTabIndex}
            onChange={this.handleTabOnChange}
          >
            {this.renderTabs()}
          </Tabs>
        }
        <CharacterModal limitedMode={!haveEditPermission} />
        <BackgroundModal limitedMode={!haveEditPermission} />
        <ItemModal limitedMode={!haveEditPermission} />
      </Container>
    );
  }
}
