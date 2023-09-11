import React, { Component } from 'react';

import AddIcon from 'common/icons/add';
import CloseIcon from 'common/icons/close';

import Dropdown from 'ui-elements/Dropdown';

export default class DropdownDemo extends React.Component {
  render() {
    const testValues = [
      {
        icon: 'https://img.fireden.net/vg/image/1447/93/1447931419285.png',
        text: 'Pepe',
      },
      {
        icon: 'https://pbs.twimg.com/profile_images/378800000822867536/3f5a00acf72df93528b6bb7cd0a4fd0c.jpeg',
        text: 'Doge',
      },
      {
        icon: 'http://dailynewsdig.com/wp-content/uploads/2013/06/20-Funny-Shocked-Cat-Memes-3.jpg',
        text: 'Cat Meme',
      },
      {
        icon: 'https://s-media-cache-ak0.pinimg.com/originals/32/de/35/32de350b0fa3b58c43cfa3a17297ce55.jpg',
        text: 'Smile with Joys',
      },
    ];
    return (
      <div>
        <h3>SelectField</h3>
        <div>
          <Dropdown
            placeholder="請選擇"
            values={testValues}
          />
          default
        </div>
        <div>
          <Dropdown
            placeholder="請選擇"
            values={['繁體中文', '简体中文', 'English', '日本語', '언문'].map(item => (
              { icon: null, text: item }
            ))}
            fullWidth
          />
          full width
        </div>
        <div>
          <Dropdown
            limit={4}
            searchNotFoundText="找不到人物"
            searchPlaceholder="人物"
            selectedIndexes={[0, 3]}
            values={testValues}
            multiple
            search
            showCount
          />
          multiple with icon
        </div>
        <div>
          <Dropdown
            limit={4}
            searchNotFoundText="找不到語言"
            searchPlaceholder="語言"
            selectedIndexes={[0, 3]}
            values={['繁體中文', '简体中文', 'English', '日本語', '언문'].map(item => (
              { icon: null, text: item }
            ))}
            multiple
            search
            showCount
          />
          multiple without icon
        </div>
        <div>
          <Dropdown staticLabel="黑貓故事" />
          static
        </div>
      </div>
    );
  }
}
