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
        if: props => props.channelDefinition.capabilities.has("Chat") && props.task.taskStatus === 'assigned'
      }
    );


    flex.Actions.replaceAction("TransferTask", (payload, original) => transferOverride(payload, original))

    function transferOverride (payload, original) {
      if (!flex.TaskHelper.isChatBasedTask(payload.task)) {
        return original(payload);
      }

      return new Promise((resolve, reject) => {
        removeDefaultChatChannelOrchestrations();

        fetch(`https://${manager.serviceConfiguration.runtime_domain}/transfer-chat`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          body: `Token=${manager.user.token}&taskSid=${payload.task.taskSid}&destinationQueue=${payload.targetSid}&workerName=${manager.user.identity}`
        })
        .then(response => {
          console.log('Task Successfully Transfered');
          setTimeout(() => {
            restoreDefaultChatChannelOrchestrations();
          }, 2000)
          resolve();
        })
        .catch(error => {
          console.log(error);
          setTimeout(() => {
            restoreDefaultChatChannelOrchestrations();
          }, 2000)
          reject();
        });
      })
    }

    function removeDefaultChatChannelOrchestrations() {
      flex.ChatOrchestrator.setOrchestrations("wrapup", []);
      flex.ChatOrchestrator.setOrchestrations("completed", ["LeaveChatChannel"]);
    }

    function restoreDefaultChatChannelOrchestrations() {
      flex.ChatOrchestrator.setOrchestrations("wrapup", ["DeactivateChatChannel"]);
      flex.ChatOrchestrator.setOrchestrations("completed", ["DeactivateChatChannel", "LeaveChatChannel"]);
    }

  }
}