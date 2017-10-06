import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const FormSectionSide = (props) => (
  <div className="form-section-side">
    {props.children}
  </div>
);

FormSectionSide.displayName = 'FormSectionSide';
FormSectionSide.propTypes = {
  children: PropTypes.node,
};


const FormSectionMain = (props) => (
  <div className="form-section-main">
    {props.children}
  </div>
);

FormSectionMain.displayName = 'FormSectionMain';
FormSectionMain.propTypes = {
  children: PropTypes.node,
};

const FormSection = (props) => (
  <div className="form-section">
    {props.children}
  </div>
);

FormSection.displayName = 'FormSection';
FormSection.propTypes = {
  children: PropTypes.node,
};
FormSection.Side = FormSectionSide;
FormSection.Main = FormSectionMain;

const Form = (props) => (
  <div className="form">
    {props.children}
  </div>
);

Form.displayName = 'Form';
Form.propTypes = {
  children: PropTypes.node,
};
Form.Section = FormSection;

export default Form;
