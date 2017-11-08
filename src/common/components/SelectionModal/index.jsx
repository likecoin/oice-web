import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Modal from 'ui-elements/Modal';
import RaisedButton from 'ui-elements/RaisedButton';
import Dropdown from 'ui-elements/Dropdown';


@translate(['editor', 'general', 'AssetSelectionModal'])
export default class SelectionModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    children: PropTypes.any,
    className: PropTypes.string,
    disableConformButton: PropTypes.bool,
    handleOnClose: PropTypes.func,
    handleOnConfirmButton: PropTypes.func,
    libraries: PropTypes.array,
    title: PropTypes.string,
    width: PropTypes.number,
  }

  constructor(props) {
    super(props);
    let dropdownList = [];
    if (props.libraries) {
      dropdownList = props.libraries.map(library => (library.name));
    }
    this.state = {
      selectedIndex: undefined,
      dropdownList,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { libraries } = nextProps;
    const newState = {
      dropdownList: libraries ? libraries.map(library => (library.name)) : [],
      selectedIndex: libraries && libraries.length > 0 ? 0 : undefined,
    };
    // this.setState
    this.setState(newState);
  }

  handleOnClose = () => {
    this.props.handleOnClose();
  }

  handleOnConfirmButton = () => {
    const { handleOnConfirmButton } = this.props;
    if (handleOnConfirmButton) handleOnConfirmButton();
  }

  handleOnDropDownSelect = (selectedIndexes) => {
    if (selectedIndexes.length > 0) {
      this.setState({ selectedIndex: selectedIndexes[0] });
    }
  }

  renderBody() {
    const { selectedIndex } = this.state;
    const {
      children,
    } = this.props;
    // TODO bodyDataStructure data checking for different Modal
    return React.cloneElement(children, {
      selectedIndex,
    });
  }

  render() {
    const { t, open, className, width, disableConformButton, title } = this.props;
    const { dropdownList } = this.state;
    const dropdownItems = [
      ...dropdownList,
      t('button.selectMoreAssets'),
    ];
    const dropdown = (
      <Dropdown
        placeholder={t('placeholder.libraryFilter')}
        selectedIndexes={[this.state.selectedIndex]}
        values={dropdownItems.map(item => ({ icon: null, text: item }))}
        width={250}
        onChange={this.handleOnDropDownSelect}
      />
    );
    const confirmButton = (
      <RaisedButton
        disabled={disableConformButton}
        label={t('characterSelectionModal.confirmButton')}
        primary
        onClick={this.handleOnConfirmButton}
      />
    );

    return (
      <Modal
        className={className}
        open={open}
        width={width || 590}
        onClickOutside={this.handleOnClose}
      >
        <Modal.Header onClickCloseButton={this.handleOnClose}>
          {title}
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
        <Modal.Footer
          leftItems={[dropdown]}
          rightItems={[confirmButton]}
        />
      </Modal>
    );
  }
}
