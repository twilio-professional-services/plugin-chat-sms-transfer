import * as Flex from '@twilio/flex-ui';
import React from 'react';

import TransferButton from '../components/TransferButton';

/**
 * This appends new content to the Chat Canvas (adds transfer button near end chat button)
 *
 * The if: property here is important, this says only add the transfer button if this is chat-like task
 * and the task has been assigned.
 */
export const setUpComponents = () => {
  Flex.TaskCanvasHeader.Content.add(<TransferButton key="chat-transfer-button" />, {
    sortOrder: 1,
    if: (props) => props.channelDefinition.capabilities.has('Chat') && props.task.taskStatus === 'assigned',
  });
};
