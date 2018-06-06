import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import AttributeRow from '../AttributeRow';
import _keyBy from 'lodash/keyBy';

export default class GenericAttributesPanelForm extends React.Component {
  static propTypes = {
    block: PropTypes.object.isRequired,
    attributesDefList: PropTypes.array,
    fullWidth: PropTypes.bool,
  }

  static defaultProps = {
    fullWidth: true,
  }

  renderAttributeRows() {
    const { block, attributesDefList } = this.props;
    const attributeRows = [];
    if (attributesDefList && attributesDefList instanceof Array) {
      const lastIndex = attributesDefList.length - 1;
      if (block.macroName === 'label') {
        const attributesDefForLabel = _keyBy(attributesDefList, attributeDef => (
          attributeDef.name
        ));
        const nameAttributeDef = attributesDefForLabel.name;
        const captionAttributeDef = attributesDefForLabel.caption;
        attributeRows.push(
          <AttributeRow
            key={0}
            attributeDef={nameAttributeDef}
            block={block}
          />
        );
        attributeRows.push(<hr key={`${0}-hr`} />);
        attributeRows.push(
          <AttributeRow
            key={1}
            attributeDef={captionAttributeDef}
            block={block}
          />
        );
      } else {
        attributesDefList.forEach((attributeDef, index) => {
          attributeRows.push(
            <AttributeRow
              key={index}
              attributeDef={attributeDef}
              block={block}
            />
          );
          if (lastIndex !== index) attributeRows.push(<hr key={`${index}-hr`} />);
        });
      }
    }
    return attributeRows;
  }

  render() {
    return (
      <div className="attributes-form-generic">
        {this.renderAttributeRows()}
      </div>
    );
  }
}
