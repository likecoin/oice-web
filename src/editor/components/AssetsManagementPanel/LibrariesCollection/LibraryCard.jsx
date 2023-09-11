import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Card from 'ui-elements/Card';
import TriangleLabel from 'ui-elements/TriangleLabel';

import CheckCircleIcon from 'common/icons/check-circle';
import PersonalIcon from 'common/icons/personal';

export default class LibraryCard extends React.Component {
  static displayName = 'Card';

  static propTypes = {
    library: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    index: PropTypes.number,
    mine: PropTypes.bool,
    selected: PropTypes.bool,
    style: PropTypes.object,
    onClick: PropTypes.func,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    selected: false,
    mine: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected,
    });
  }

  handleClick = (e) => {
    const { library } = this.props;
    const isClickSelectLabel = this.selectLabel ?
      findDOMNode(this.selectLabel).contains(e.target) : false;
    if (this.props.onClick && !isClickSelectLabel) this.props.onClick(library);
  };

  handleSelect = () => {
    const { library } = this.props;
    const { selected } = this.state;
    if (this.props.onSelect) {
      this.setState({ selected: !selected });
      this.props.onSelect(library.id, selected);
    }
  }

  render() {
    const {
      library,
      onSelect,
      t,
      index,
      style,
      mine,
    } = this.props;

    return (
      <Card
        index={index}
        style={style}
        onClick={this.handleClick}
      >
        <Card.Image src={library.coverStorage || ''} />
        <Card.Content>
          <Card.Header>
            {library.name}
          </Card.Header>
          {mine &&
            <div className="library-personal">
              <PersonalIcon />
            </div>
          }
          <Card.Meta>
            {library.author &&
              <span>
                {t('authorWithName', { author: library.author.displayName })}
              </span>
            }
          </Card.Meta>
        </Card.Content>
        {onSelect &&
          <TriangleLabel
            icon={<CheckCircleIcon />}
            reference={ref => this.selectLabel = ref}
            selected={this.state.selected}
            onClick={this.handleSelect}
          />
        }
      </Card>
    );
  }
}
