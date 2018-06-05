import React, { Component } from 'react';
import CharacterPreview from 'ui-elements/CharacterPreview';

import { DOMAIN_URL } from 'common/constants';


export default class CharacterPreviewDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characterTop: 0,
      characterLeft: 0,
      isStatic: false,
      isFlipRight: false,
    };
  }

  handleChangeFlipRight = (isFlipRight) => {
    this.setState({ isFlipRight });
  }

  handleChangeCoordinate = (left, top) => {
    console.log('handleChangeCoordinate', left, top);
    this.setState({ characterTop: top, characterLeft: left });
  }

  handleLeftOnChange = () => {
    console.log('handleLeftOnChange', this.leftTextField);
    const { value } = this.leftTextField;
    if (value) {
      this.setState({ characterLeft: parseInt(value, 10) });
    }
  }

  handleTopOnChange = () => {
    console.log('handleTopOnChange', this.topTextField);
    const { value } = this.topTextField;
    if (value) {
      this.setState({ characterTop: parseInt(value, 10) });
    }
  }

  handleWrongInput = (isTop, nowValue) => {
    console.log('handleWrongInput', isTop, nowValue);
    if (isTop) {
      this.setState({ characterTop: parseInt(nowValue, 10) });
    } else {
      this.setState({ characterLeft: parseInt(nowValue, 10) });
    }
  }

  handleStaticChange = () => {
    console.log('handleStaticChange');
    if (this.state.isStatic) {
      this.setState({ isStatic: false });
    } else {
      this.setState({ isStatic: true });
    }
  }

  handleFlipRightChange = () => {
    console.log('handleFlipRightChange');
    if (this.state.isFlipRight) {
      this.setState({ isFlipRight: false });
    } else {
      this.setState({ isFlipRight: true });
    }
  }

  renderFlipRightCheckbox() {
    return (
      <div style={{ margin: '10px 10%' }} >
        <input
          checked={this.state.isFlipRight}
          type="checkbox"
          value=""
          onChange={this.handleFlipRightChange}
        /> 左右反轉
      </div>
    );
  }


  render() {
    return (
      <div>
        <CharacterPreview
          image={`${DOMAIN_URL}/upload/4552c420a92545f6ac07575ad1491910/chriswong-01.png`}
          x={this.state.characterLeft}
          y={this.state.characterTop}
          flipped={this.state.isFlipRight}
          readonly={this.state.isStatic}
          // size={360}
          onChange={this.handleChangeCoordinate}
        />
        <div>
          <div style={{ margin: '10px 10%' }}>
            <input
              checked={this.state.isStatic}
              type="checkbox"
              value=""
              onChange={this.handleStaticChange}
            />
            is static preview
          </div>
          <div style={{ margin: '10px 10%' }}>
            <input
              ref={(e) => { this.leftTextField = e; }}
              disabled={this.state.isStatic}
              name="fname"
              placeholder="Left"
              type="number"
              value={this.state.characterLeft}
              onChange={this.handleLeftOnChange}
            />
            <input
              ref={(e) => { this.topTextField = e; }}
              disabled={this.state.isStatic}
              name="fname"
              placeholder="Top"
              type="number"
              value={this.state.characterTop}
              onChange={this.handleTopOnChange}
            />
          </div>
          {this.renderFlipRightCheckbox()}
        </div>
      </div>
    );
  }
}
