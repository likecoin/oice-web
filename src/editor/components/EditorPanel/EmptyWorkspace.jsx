import React from 'react';
import PropTypes from 'prop-types';
import OiceIcon from 'common/icons/oice-logo';


export default class EmptyWorkspace extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    onLoad: PropTypes.func,
  };

  componentDidMount() {
    if (this.props.onLoad) this.props.onLoad();
  }

  render() {
    const { t } = this.props;
    return (
      <div className="empty" id="editor-workspace">
        <OiceIcon />
        <span>{t('emptyPleaseSelect')}</span>
      </div>
    );
  }
}
