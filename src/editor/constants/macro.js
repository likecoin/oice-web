// blue icons in sequence

import BackgroundIcon from 'common/icons/macros/background';
import DialogueIcon from 'common/icons/macros/dialogue';
import QuoteIcon from 'common/icons/macros/quote';
import QuitLeftIcon from 'common/icons/macros/quit-left';
import QuitMiddleIcon from 'common/icons/macros/quit-middle';
import QuitRightIcon from 'common/icons/macros/quit-right';
import ItemIcon from 'common/icons/macros/item';
import ItemQuitIcon from 'common/icons/macros/item-quit';
import QuakeIcon from 'common/icons/macros/quake';
import ThunderIcon from 'common/icons/macros/thunder';
import ClearDialogueIcon from 'common/icons/macros/clear-dialoguebox';
import FocusIcon from 'common/icons/macros/focus';
import FocusQuitIcon from 'common/icons/macros/focus-quit';
import AddTalkIcon from 'common/icons/macros/add-talk';

// green icons in sequence
import MusicIcon from 'common/icons/macros/music';
import MusicQuitIcon from 'common/icons/macros/music-quit';
import AudioIcon from 'common/icons/macros/audio';
import AudioStopIcon from 'common/icons/macros/audio-stop';
import AudioWaitIcon from 'common/icons/macros/audio-wait';
import AudioQuitIcon from 'common/icons/macros/audio-quit';

// red icons in sequence
import AutoStopIcon from 'common/icons/macros/auto-stop';
import PauseIcon from 'common/icons/macros/pause';
import AutoReautoIcon from 'common/icons/macros/auto-reauto';
import ChoiceIcon from 'common/icons/macros/choice';
import TabIcon from 'common/icons/macros/tab';
import SkipIcon from 'common/icons/macros/skip';
import WaitEnterIcon from 'common/icons/macros/wait-enter';
import WaitPageIcon from 'common/icons/macros/wait-page';
import WaitIcon from 'common/icons/macros/wait';

export default [
  {
    blue: [
      {
        name: 'bg',
        icon: BackgroundIcon,
      },
      {
        name: 'characterdialog',
        icon: DialogueIcon,
      },
      {
        name: 'aside',
        icon: QuoteIcon,
      },
      {
        name: 'addTalk',
        icon: AddTalkIcon,
      },
      {
        name: 'item',
        icon: ItemIcon,
      },
      {
        name: 'clearitem',
        icon: ItemQuitIcon,
      },
      {
        name: 'fgExitLeft',
        icon: QuitLeftIcon,
      },
      {
        name: 'fgExitMiddle',
        icon: QuitMiddleIcon,
      },
      {
        name: 'fgExitRight',
        icon: QuitRightIcon,
      },
      {
        name: 'clearmessage',
        icon: ClearDialogueIcon,
      },
    ],
  },
  {
    green: [
      {
        name: 'bgm',
        icon: MusicIcon,
      },
      {
        name: 'stopbgm',
        icon: MusicQuitIcon,
      },
      {
        name: 'playse',
        icon: AudioIcon,
      },
      {
        name: 'stopse',
        icon: AudioStopIcon,
      },
      {
        name: 'ws',
        icon: AudioWaitIcon,
      },
      {
        name: 'fadeoutse',
        icon: AudioWaitIcon,
      },
      {
        name: 'fadese',
        icon: AudioQuitIcon,
      },
    ],
  },
  {
    red: [
      {
        name: 'autoplay',
        icon: AutoReautoIcon,
      },
      {
        name: 'Cancelautomode',
        icon: PauseIcon,
      },
      {
        name: 'option',
        icon: ChoiceIcon,
      },
      {
        name: 'label',
        icon: TabIcon,
      },
      {
        name: 'jump',
        icon: SkipIcon,
      },
      {
        name: 'optionstart',
        icon: WaitPageIcon,
      },
      {
        name: 'optionanswer',
        icon: WaitEnterIcon,
      },
      {
        name: 'optionend',
        icon: AutoStopIcon,
      },
      {
        name: 'quake',
        icon: QuakeIcon,
      },
      {
        name: 'flash',
        icon: ThunderIcon,
      },
      {
        name: 'focusline',
        icon: FocusIcon,
      },
      {
        name: 'clearfocusline',
        icon: FocusQuitIcon,
      },
      {
        name: 'l',
        icon: WaitPageIcon,
      },
      {
        name: 's',
        icon: AutoStopIcon,
      },
      {
        name: 'p',
        icon: WaitEnterIcon,
      },
      {
        name: 'wait',
        icon: WaitIcon,
      },
    ],
  },
];

export const macroColors = {
  blue: '#0097E8',
  green: '#00AD27',
  red: '#FF3A4E',
  default: '#D8D8D8',
};
