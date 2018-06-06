import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import _get from 'lodash/get';

import FlatButton from 'ui-elements/FlatButton';
import RaisedButton from 'ui-elements/RaisedButton';
import QuestionIcon from 'common/icons/question';
import { macroColors } from 'editor/constants/macro';

import * as BlockAction from 'editor/actions/block';
import * as MacroAction from 'editor/actions/macro';

import AssetSelectionModal from './AssetSelectionModal';
import AudioForm from './AttributesForm/Audio';
import CharacterDialogForm from './AttributesForm/CharacterDialog';
import GenericForm from './AttributesForm/Generic';
import ImageForm from './AttributesForm/Image';

import './style.scss';


@translate(['macro', 'attributesPanel'])
@connect(store => ({
  attrDefObj: store.attributesDef.attrDefObj,
  macrosDict: store.macros.dict,
  selectedBlock: store.blocks.selectedBlock,
}))
export default class AttributesPanel extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    attrDefObj: PropTypes.object,
    macrosDict: PropTypes.object,
    selectedBlock: PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedBlockInState: props.selectedBlock,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectedBlock, attrDefObj } = nextProps;
    const { selectedBlockInState } = this.state;
    if (selectedBlock && attrDefObj) {
      const { macroId } = selectedBlock;
      if (!(macroId in attrDefObj)) {
        this.props.dispatch(MacroAction.fetchMacroAttributesDef(macroId));
      }
    }
    // attributesForm scrollToTop when change block
    if (this.attributesForm && selectedBlock && selectedBlockInState) {
      if (selectedBlock.id !== selectedBlockInState.id) {
        this.attributesForm.scrollTop = 0;
      }
    }

    if (selectedBlock) {
      this.setState({ selectedBlockInState: selectedBlock });
    }
  }

  handleSaveBtn = () => {
    const { selectedBlock } = this.props;
    const blockId = selectedBlock.id;
    const { attributes } = selectedBlock;

    this.props.dispatch(BlockAction.updateBlock(blockId, attributes));
  }

  renderAttributesForm(block, attributesDefList) {
    switch (block.macroName) {
      case 'bg':
      case 'item':
        return (
          <ImageForm
            attributesDefinitions={attributesDefList}
            block={block}
          />
        );
      case 'bgm':
      case 'playse':
        return (
          <AudioForm
            attributesDefList={attributesDefList}
            block={block}
          />
        );
      case 'characterdialog':
        return (
          <CharacterDialogForm
            attributesDefList={attributesDefList}
            block={block}
          />
        );
      default:
        return (
          <GenericForm
            attributesDefList={attributesDefList}
            block={block}
          />
        );
    }
  }

  renderContent(block) {
    const { attrDefObj, t } = this.props;
    if (block) {
      const { macroId } = block;
      const attributesDefList = attrDefObj[macroId];
      if (attributesDefList) {
        if (attributesDefList.length > 0) {
          return (
            <div ref={ref => this.attributesForm = ref} className="attributes-form">
              {this.renderAttributesForm(block, attributesDefList)}
            </div>
          );
        }
        return (
          <div className="attributes-form-empty">
            {t('noAttributeRow')}
          </div>
        );
      }
      return (
        <div className="attributes-form-empty">
          {t('noAttributeRow')}
        </div>
      );
    }
    return (
      <div className="attributes-form-empty">
        {t('clickToShow')}
      </div>
    );
  }

  renderHeader(block, macroColor) {
    if (block) {
      const { t } = this.props;
      return (
        <div
          className="attribute-panel-row"
          id="attribute-header"
          style={{ color: macroColors[macroColor] }}
        >
          <span className="macro-name">{t(`${block.macroName}._title`)}</span>
          <a
            href={`/tutorial/functions#${block.macroName}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FlatButton icon={<QuestionIcon />} />
          </a>
        </div>
      );
    }
    return null;
  }

  render() {
    const { selectedBlock, macrosDict } = this.props;
    let macroColor = 'default';
    if (selectedBlock) {
      const { macroId } = selectedBlock;

      const groupColor = _get(macrosDict, `${macroId}.groupColor`);
      if (groupColor) {
        macroColor = groupColor;
      }
    }

    return (
      <div id="attributes-panel">
        {this.renderHeader(selectedBlock, macroColor)}
        <hr />
        {this.renderContent(selectedBlock)}
        <AssetSelectionModal />
      </div>
    );
  }
}
