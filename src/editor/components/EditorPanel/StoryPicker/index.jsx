import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Dropdown from 'ui-elements/Dropdown';
import Form from 'ui-elements/Form';
import Modal from 'ui-elements/Modal';

import Action from './actions';
import Reducer from './reducer';

import './styles.scss';


const getStateFromProps = (props) => {
  const state = {
    storyIds: [],
    storyNames: [],
    selectedIndex: 0,
  };
  props.stories.forEach(({ id, name }, index) => {
    state.storyIds.push(id);
    state.storyNames.push(name);
    if (props.selectedId === id) state.selectedIndex = index;
  });
  return state;
};

@translate(['editor'])
@connect(store => ({
  ...store.editorPanel.storyPicker,
}))
export default class StoryPicker extends React.Component {
  static Action = Action;
  static Reducer = Reducer;
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    description: PropTypes.string,
    open: PropTypes.bool,
    selectedId: PropTypes.number,
    stories: PropTypes.array,
    title: PropTypes.string,
    onSelect: PropTypes.func,
  }

  static defaultProps = {
    description: '',
    open: false,
    stories: [],
  }

  constructor(props) {
    super(props);
    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStateFromProps(nextProps));
  }

  handleConfirm = () => {
    const { onSelect } = this.props;
    const { selectedIndex, storyIds } = this.state;
    if (onSelect) onSelect(storyIds[selectedIndex]);
    this.handleCloseRequest();
  }

  handleChange = (selectedIndexes) => {
    this.setState({ selectedIndex: selectedIndexes[0] });
  }

  handleCloseRequest = () => {
    this.props.dispatch(Action.close());
  }

  render() {
    const {
      description,
      open,
      t,
      title,
    } = this.props;
    const {
      storyNames,
      selectedIndex,
    } = this.state;

    return (
      <div>
        <Modal
          id="story-picker"
          open={open}
          onClickOutside={this.handleCloseRequest}
        >
          <Modal.Header onClickCloseButton={this.handleCloseRequest}>
            {title || t('storyPicker.title')}
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Section>
                <Form.Section.Main>
                  {description && <p>{description}</p>}
                  <Dropdown
                    placeholder={t('storyPicker.placeholder')}
                    selectedIndexes={[selectedIndex]}
                    values={storyNames.map(item => (
                      { icon: null, text: item }
                    ))}
                    fullWidth
                    onChange={this.handleChange}
                  />
                </Form.Section.Main>
              </Form.Section>
            </Form>
          </Modal.Body>
          <Modal.Footer
            rightButtonTitle={t('storyPicker.button.confirm')}
            onClickRightButton={this.handleConfirm}
          />
        </Modal>
      </div>
    );
  }
}
