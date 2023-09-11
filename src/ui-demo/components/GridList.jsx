import React, { Component } from 'react';

import GridList from 'ui-elements/GridList';
import Card from 'ui-elements/Card';
import TriangleLabel from 'ui-elements/TriangleLabel';
import CheckCircleIcon from 'common/icons/check-circle';

const pepeData = [{
  selected: true,
  image: 'https://goo.gl/EsrbCo',
  title: '青蛙與他的神奇密友合集 -- 愛與能量的結合',
  creator: 'Pepe',
}, {
  selected: true,
  image: 'http://i1.kym-cdn.com/photos/images/newsfeed/000/937/854/a62.png',
  title: '青蛙吃辣椒合集',
  creator: 'Pepe',
}, {
  selected: false,
  image: 'http://www.kappit.com/img/pics/201603_1131_bfdcb_sm.png',
  title: '樂觀的小青蛙合集',
  creator: 'Pepe',
}, {
  selected: false,
  image: 'https://pbs.twimg.com/profile_images/516426269064318976/iCim4eXE_400x400.jpeg',
  title: 'Pepe的微笑',
  creator: 'Pepe',
}, {
  selected: false,
  image: 'http://i1.kym-cdn.com/photos/images/facebook/000/913/355/b37.png',
  title: '收到紅色炸彈的皮皮',
  creator: 'Pepe',
}, {
  selected: true,
  image: 'http://www.kappit.com/img/pics/201603_1136_defei_sm.jpg',
  title: '神秘的洋蔥 -- 皮皮不哭',
  creator: 'Pepe',
},
];


export default class GridListDemo extends React.Component {
  render() {
    const triangleLabel = selected => (
      <TriangleLabel
        icon={<CheckCircleIcon />}
        selected={selected}
        selectedColor={selected ? '#FF3A4E' : '#D8D8D8'}
      />
    );
    return (
      <div>
        <h3>GridList</h3>
        <GridList elementWidth={232}>
          {pepeData.map(data => (
            <Card>
              <Card.Image src={data.image} />
              <Card.Content>
                <Card.Header>
                  {data.title}
                </Card.Header>
                <Card.Meta>
                  創建者：{data.creator}
                </Card.Meta>
              </Card.Content>
              {triangleLabel(data.selected)}
            </Card>
          ))}
        </GridList>
      </div>
    );
  }
}
