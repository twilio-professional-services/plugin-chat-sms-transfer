import { FlexPlugin } from 'flex-plugin';
import fetch from 'node-fetch'
import React from 'react';
import * as Flex from '@twilio/flex-ui'
import ChatTransferButton from './ChatTransferButton';

const PLUGIN_NAME = 'ChatTransferPlugin';

export const setUpComponents = () => {
  Flex.TaskCanvasHeader.Content.add(
    <ChatTransferButton key="chat-transfer-button" />, {
      if: props => props.channelDefinition.capabilities.has("Chat") && props.task.taskStatus === 'assigned'
    }
  );
}

export const setUpActions = () => {
  Flex.Actions.replaceAction("TransferTask", (payload, original) => transferOverride(payload, original))
}

export const removeDefaultChatChannelOrchestrations = () => {
  Flex.ChatOrchestrator.setOrchestrations("wrapup", []);
  Flex.ChatOrchestrator.setOrchestrations("completed", ["LeaveChatChannel"]);
}

export const restoreDefaultChatChannelOrchestrations = () => {
  Flex.ChatOrchestrator.setOrchestrations("wrapup", ["DeactivateChatChannel"]);
  Flex.ChatOrchestrator.setOrchestrations("completed", ["DeactivateChatChannel", "LeaveChatChannel"]);
}

export const transferOverride = (payload, original) => {
  if (!Flex.TaskHelper.isChatBasedTask(payload.task)) {
    return original(payload);
  }

  return new Promise((resolve, reject) => {
    removeDefaultChatChannelOrchestrations();

    const manager = Flex.Manager.getInstance();

    fetch(`https://${manager.serviceConfiguration.runtime_domain}/transfer-chat`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: `Token=${manager.user.token}&taskSid=${payload.task.taskSid}&destinationQueue=${payload.targetSid}&workerName=${manager.user.identity}`
    })
    .then(response => {
      setTimeout(() => {
        restoreDefaultChatChannelOrchestrations();
      }, 2000)
      resolve();
    })
    .catch(error => {
      setTimeout(() => {
        restoreDefaultChatChannelOrchestrations();
      }, 2000)
      reject();
    });
  })
}

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
    setUpActions();   
  }
}