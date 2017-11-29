/* global firebase: true */

import React from 'react';
import PropTypes from 'prop-types';
import { spring, TransitionMotion } from 'react-motion';

import _find from 'lodash/find';
import classNames from 'classnames';

import { getLocalizedValue } from 'common/utils/i18n';

import './NewsHeader.styles.scss';


function NewsMessage({ avatar, text, style }) {
  return (
    <li className="message" style={style}>
      <img src={avatar} />
      <span>{text}</span>
    </li>
  );
}

NewsMessage.propTypes = {
  avatar: PropTypes.string,
  text: PropTypes.string,
  style: PropTypes.object,
};


class NewsConversation extends React.Component {
  static interval = 3000;

  static propTypes = {
    conversation: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      currentMessageIndex: 0,
    };
  }

  componentDidMount() {
    this._timer = setInterval(this._nextMessage, NewsConversation.interval);
  }

  componentWillUnmount() {
    if (this._timer) clearInterval(this._timer);
  }

  _nextMessage = () => {
    const { messages } = this.props.conversation;
    const { currentMessageIndex } = this.state;
    if (messages) {
      this.setState({
        currentMessageIndex: (currentMessageIndex + 1) % messages.length,
      });
    }
  }

  render() {
    const { messages, users } = this.props.conversation;
    if (!messages || !users) return null;

    const { currentMessageIndex } = this.state;

    const message = messages[currentMessageIndex];
    const styles = [{
      key: `${currentMessageIndex}`,
      data: {
        message,
      },
      style: {
        x: spring(0),
        y: spring(0),
        scale: spring(1),
        opacity: spring(1),
      },
    }];

    return (
      <TransitionMotion
        willEnter={() => ({ x: -50, y: 200, scale: 0.5, opacity: 0 })}
        willLeave={() => ({ x: 0, y: spring(-200), scale: 1, opacity: 1 })}
        styles={styles}
      >
        {interpolatedStyles =>
          <ul className="conversation">
            {interpolatedStyles.map(({ key, data, style }) => {
              const { user, text } = data.message;

              const avatar = users[user].avatar;

              const messageStyle = {
                transform: (
                  `translate(${style.x}%, ${style.y}%) scale(${style.scale})`
                ),
                opacity: style.opacity,
              };

              return (
                <NewsMessage
                  key={key}
                  avatar={avatar}
                  text={getLocalizedValue(text)}
                  style={messageStyle}
                />
              );
            })}
          </ul>
        }
      </TransitionMotion>
    );
  }
}


export default class NewsHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cta: undefined,
      conversation: undefined,
      style: undefined,
    };
  }

  componentDidMount() {
    this._fetchContent();
  }

  async _fetchContent() {
    /*
    Example of content:
    {
     "conversation": {
       "users": {
         "a": {
           "avatar": "<URL>"
         },
       },
       "messages": [
         {
           "user": "a",
           "text": {
             "en": "Hello world"
         }
       ]
     },
     "cta": {
       "title": {
         "en": ""
       },
       "link": ""
     }
     "style": {
      // CSS
     }
   }
    }
    */
    const content = await firebase.database()
                                  .ref('news-header')
                                  .once('value')
                                  .then(snapshot => snapshot.val());

    this.setState(content);
  }

  render() {
    const { cta, conversation, style } = this.state;
    return (
      <header className="news-header">
        <div style={style}>
          <div className="news-header_content">
            {!!conversation &&
              <NewsConversation conversation={conversation} />
            }

            {!!cta &&
              <a className="cta" href={cta.link}>
                {getLocalizedValue(cta.title)}
              </a>
            }
          </div>
        </div>
      </header>
    );
  }
}
