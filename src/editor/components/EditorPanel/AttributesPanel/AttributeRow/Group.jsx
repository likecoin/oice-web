import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const AttributeRowGroup = (props) => {
  const className = classNames(
    'attribute-panel-row-group',
    props.className
  );
  return (
    <div {...{ id: props.id, className }}>
      {props.children}
    </div>
  );
};

AttributeRowGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default AttributeRowGroup;
