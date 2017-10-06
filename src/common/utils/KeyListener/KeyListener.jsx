import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

function keyListenerWrapper(WrappedComponent, keys = null) {
  class KeyListenerWrapper extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        key: undefined,
      };
    }

    componentDidMount() {
      document.addEventListener('keydown', this.handleKeydown);
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeydown);
    }

    handleKeydown = ({ key }) => {
      // Check whether the key should be tracked, default track all
      if (keys.includes(key) || !keys) {
        this.setState({ key }, () => {
          // reset the keydown value immediately
          this.setState({ key: undefined });
        });
      }
    }

    render() {
      return <WrappedComponent {...this.props} keydown={this.state.key} />;
    }
  }
  // handle statics from WrappedComponent
  return hoistStatics(KeyListenerWrapper, WrappedComponent);
}

export default function keyListener(...keys) {
  return target => keyListenerWrapper(target, keys);
}
