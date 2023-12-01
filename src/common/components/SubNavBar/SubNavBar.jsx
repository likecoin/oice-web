import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Container from 'ui-elements/Container';
import FlatButton from 'ui-elements/FlatButton';

import './SubNavBar.style.scss';


function SubNavBar(props) {
  const {
    fluid, icon, narrow, secondaryText, text, textHref,
  } = props;
  const className = classNames(props.className, { narrow });
  const titleClassName = classNames('title', {
    canClick: secondaryText !== null && secondaryText !== undefined,
  });
  const id = 'sub-navbar';
  return (
    <Container {...{ id, className, fluid }}>
      <a
        href={textHref}
        className={titleClassName}
        onClick={(e) => { e.preventDefault(); if (props.onClickText) props.onClickText(e); }}
      >
        {text}
      </a>
      {secondaryText && <span className="secondaryText">{`> ${secondaryText}`}</span>}
      {icon && <FlatButton icon={icon} onClick={props.onClickIconButton} />}
    </Container>
  );
}

SubNavBar.propTypes = {
  className: PropTypes.string,
  fluid: PropTypes.bool,
  icon: PropTypes.node,
  narrow: PropTypes.bool,
  secondaryText: PropTypes.string,
  text: PropTypes.string,
  textHref: PropTypes.string,
  onClickIconButton: PropTypes.func,
  onClickText: PropTypes.func,
};

SubNavBar.defaultProps = {
  className: undefined,
  fluid: false,
  icon: undefined,
  narrow: false,
  text: '',
  textHref: '#',
};

export default SubNavBar;
