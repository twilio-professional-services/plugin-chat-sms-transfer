import { FlexPlugin } from 'flex-plugin';
import React from 'react';
import ChatTransferButton from './ChatTransferButton';

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
    flex.TaskCanvasHeader.Content.add(
      <ChatTransferButton key="chat-transfer-button" />, {
        if: props => props.task.source.taskChannelUniqueName === "chat" && props.task.source.status === 'assigned'
      }
    );

    function transferOverride (payload, original, task) {
      console.log(payload);
      // payload.task is always empty!
      return new Promise((resolve, reject) => {
        reject();
      })
    }

    flex.Actions.replaceAction("TransferTask", (payload, original) => transferOverride(payload, original, props => props.task))

  }
}