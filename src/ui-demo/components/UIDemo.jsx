import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import AddIcon from 'common/icons/add';
import CloseIcon from 'common/icons/close';
import LinkIcon from 'common/icons/link';

import Container from 'common/components/Container';

import AudioPlayer from 'ui-elements/AudioPlayer';
import ButtonGroup from 'ui-elements/ButtonGroup';
import Checkbox from 'ui-elements/Checkbox';
import ColorPicker from 'ui-elements/ColorPicker';
import ImageCropper from 'ui-elements/ImageCropper';
import LinkTooltip from 'ui-elements/LinkTooltip';
import RadioButton from 'ui-elements/RadioButton';
import RaisedButton from 'ui-elements/RaisedButton';
import SliderBar from 'ui-elements/SliderBar';
import ToggleButton from 'ui-elements/ToggleButton';

import SearchBar from 'ui-elements/SearchBar';
import Tag from 'ui-elements/Tag';

import Menu from 'ui-elements/Menu';
import FlatButtonDemo from './FlatButton';
import RaisedButtonDemo from './RaisedButton';
import ButtonGroupDemo from './ButtonGroup';
import TextFieldDemo from './TextField';
import DropdownDemo from './Dropdown';
import Pagination from './Pagination';
import Switcher from './Switcher';

import ModalDemo from './Modal';
import TabsDemo from './Tabs';
import ExpansionPanelDemo from './ExpansionPanel';
import GridListDemo from './GridList';
import CharacterPreviewDemo from './CharacterPreview';

import SettingIcon from 'common/icons/setting';
// import OiceCheckout from './OiceCheckout';


@DragDropContext(HTML5Backend)
export default class UIDemo extends React.Component {
  handleClickPersonalPage = () => {
    console.log('click handleClickPersonalPage');
  }

  render() {
    // need to call onClick() in RaisedButton onClick funtion to make it works
    const anchorEl = (<RaisedButton
      icon={<SettingIcon />}
      mini
    />);
    return (
      <Container id="ui-demo">
        <h1>UI Components List</h1>
        <section>
          <div>
            <h3>ToggleButton</h3>
            <ToggleButton leftLabel={'隱藏'} rightLabel={'顯示'} />
          </div>

        </section>
        <section>
          <div>
            <h3>ImageCropper</h3>
            <ImageCropper />
          </div>
        </section>
        <section>
          <Switcher />
        </section>
        <section>
          <h2>Link Tooltip</h2>
          <LinkTooltip
            link={'https://oice.com/story/33866cabf01c437a92178f4d1970c88d'}
          />
        </section>
        <section>
          <h2>Button Components</h2>
          <FlatButtonDemo />
          <RaisedButtonDemo />
          <ButtonGroupDemo />
        </section>
        <section>
          <h2>Menu</h2>
          <Menu anchorEl={anchorEl}>
            <Menu.Item
              primaryText="個人主頁"
              onClick={this.handleClickPersonalPage}
            />
            <Menu.Item primaryText="查看教程1" />
            <Menu.Item primaryText="查看教程2" />
            <Menu.Item primaryText="查看教程3" />
            <Menu.Item primaryText="查看教程4" />
            <Menu.Item
              primaryText="功能"
              onClick={this.handleClickFunctionPage}
            />
          </Menu>
        </section>
        <section>
          <h2>Selection Controls</h2>
          <div>
            <h3>Checkbox</h3>
            <Checkbox values={['tranditionalChinese', 'simplifiedChinese', 'English']} />
          </div>
          <div>
            <h3>RadioButton</h3>
            <RadioButton values={['tranditionalChinese', 'simplifiedChinese', 'English']} />
          </div>
          <div>
            <h3>SliderBar</h3>
            <SliderBar header={'淡入淡出時間(秒)'} initialVal={50} max={100} min={0} />
            default width
            <SliderBar header={'很長的淡入淡出時間(秒)'} initialVal={500} min={0} fullWidth />
            100% width
          </div>
          <DropdownDemo />
          <div>
            <h3>Tag</h3>
            <Tag value="可愛" canDelete />
          </div>
        </section>
        <section>
          <h2>Input</h2>
          <TextFieldDemo />
          <div>
            <h3>Search</h3>
            <SearchBar />
          </div>
        </section>
        <section>
          <h2>Views</h2>
          <ModalDemo />
          <TabsDemo />
          <ExpansionPanelDemo />
          <GridListDemo />
        </section>
        <section>
          <h2>Miscellaneous</h2>
          <div>
            <h3>AudioPlayer</h3>
            <AudioPlayer title="work in progress" url="https://hpr.dogphilosophy.net/test/mp3.mp3" />
          </div>
          <div>
            <h3>ColorPicker</h3>
            <ColorPicker color={{ r: 0, g: 174, b: 34, a: 1 }} />
          </div>
          <div>
            <h3>CharacterPreview</h3>
            <CharacterPreviewDemo />
          </div>
          <div>
            <h3>Pagination</h3>
            <Pagination />
          </div>
          {/* <div>
            <h3>OiceCheckout</h3>
            <OiceCheckout apiKey="pk_test_vS3hSpEF11uXUEGeGoCRm3Hh" />
          </div> */}
        </section>
      </Container>
    );
  }
}
