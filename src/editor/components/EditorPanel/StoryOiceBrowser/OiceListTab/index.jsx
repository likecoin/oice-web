import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import update from 'immutability-helper';

import FlatButton from 'ui-elements/FlatButton';
import AddIcon from 'common/icons/add';

import OiceBlock from './OiceBlock';
import AdditionRow from '../AdditionRow';

import './styles.scss';


@translate(['editor'], { withRef: true })
export default class OiceListTab extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    focused: PropTypes.bool,
    oices: PropTypes.array,
    onAdd: PropTypes.func,
    onReorder: PropTypes.func,
    onRequestCopy: PropTypes.func,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    focused: false,
    oices: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      oices: props.oices,
      isAdding: false,
      isRequestAddOice: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isAdding, oices } = nextProps;
    const newState = { oices };
    if (nextProps.isAdding) {
      newState.isAdding = nextProps.isAdding;
    }
    this.setState(newState);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      focused,
      oices,
    } = this.props;

    if (focused) {
      const { isRequestAddOice } = this.state;
      if (isRequestAddOice) {
        this.toggleAddButton(true);
      }

      if (isRequestAddOice) {
        // Automatically select the oice
        const oicesCount = this.state.oices.length;
        const prevOicesCount = prevState.oices.length;
        if (prevOicesCount === oicesCount - 1) {
          this.handleOiceSelect(oicesCount - 1);
          this.setState({ isRequestAddOice: false });
        }
      }
    } else {
      this.toggleAddButton(false);
    }
  }

  handleAddButtonClick = () => {
    this.toggleAddButton(true);
  }

  handleAddOiceCancel = () => {
    this.toggleAddButton(false);
    if (this.state.isRequestAddOice) {
      this.setState({ isRequestAddOice: false });
    }
  }

  handleAddOiceConfirm = (newOiceTitle) => {
    if (this.props.onAdd) this.props.onAdd(newOiceTitle);
    this.setState({
      isAdding: false,
      isRequestAddOice: true,
    });
  }

  handleOiceSelect = (index) => {
    if (this.props.onSelect) this.props.onSelect(this.state.oices, index);
  }

  handleOiceMove = (dragIndex, hoverIndex) => {
    const { oices } = this.state;
    const dragOice = oices[dragIndex];
    const reorderedOices = update(oices, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragOice],
      ],
    });
    this.handleOiceReorder(reorderedOices);
  }

  handleOiceReorder = (reorderedOices) => {
    if (this.props.onReorder) this.props.onReorder(reorderedOices);
  }

  handleOiceCopyRequest = (oice, index) => {
    if (this.props.onRequestCopy) this.props.onRequestCopy(oice, index);
  }

  requestAddOice = () => {
    this.setState({ isRequestAddOice: true });
  }

  toggleAddButton = (isShow) => {
    if (isShow !== this.state.isAdding) {
      this.setState({ isAdding: isShow });
    }
  }

  render() {
    const { t } = this.props;
    const { oices, isAdding } = this.state;
    return (
      <div id="oices-list-tab">
        {!isAdding &&
          <div className="add-section">
            <FlatButton
              icon={<AddIcon />}
              label={this.props.t('oicesList.addButton')}
              onClick={this.handleAddButtonClick}
            />
          </div>
        }
        <div id="oices-list">
          {isAdding &&
            <AdditionRow
              placeholder={t('oicesList.addPlaceholder')}
              onCancel={this.handleAddOiceCancel}
              onConfirm={this.handleAddOiceConfirm}
            />
          }
          {oices.map((oice, index) => (
            <OiceBlock
              key={oice.id}
              index={index}
              oice={oice}
              t={t}
              onDrag={this.handleOiceMove}
              onRequestCopy={this.handleOiceCopyRequest}
              onSelect={this.handleOiceSelect}
            />
          ))}
        </div>
      </div>
    );
  }
}
