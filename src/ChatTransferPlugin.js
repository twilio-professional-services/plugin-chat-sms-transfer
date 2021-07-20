import { FlexPlugin } from 'flex-plugin';

import { setUpActions, setUpComponents, setUpNotifications } from './helpers';

const PLUGIN_NAME = 'ChatTransferPlugin';

export default class ChatTransferPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    setUpComponents();
    setUpNotifications();
    setUpActions();
  }
}
