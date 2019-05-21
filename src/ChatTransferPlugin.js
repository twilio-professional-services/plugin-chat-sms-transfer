import { FlexPlugin } from 'flex-plugin';
import React from 'react';
import ChatTransferTab from './ChatTransferTab';

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
    flex.TaskCanvasTabs.Content.add(
      <ChatTransferTab key="chat-transfer-tab" manager={manager} label="Transfer" />,
      {
        sortOrder: 3,
        if: props => props.task.source.taskChannelUniqueName === "chat" && props.task.source.status === 'assigned'
      }
    );
  }
}
