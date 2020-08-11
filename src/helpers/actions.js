import { Actions, ChatOrchestrator, TaskHelper, Manager, Notifications } from '@twilio/flex-ui';
import fetch from 'node-fetch';

const DEFAULT_TRANSFER_MODE = 'COLD';
// Once you publish the chat transfer function, place the returned domain in your version of the plugin.
const SERVERLESS_FUNCTION_DOMAIN = '';

/**
 * This replaces Flex's default TransferTask action with our own implementation.
 * The great thing about replacing Flex actions is that you get access to the original action,
 * so you can still call it in certain scenarios. In this case, we only want to run our `transferOverride`
 * function if the task is a chat-like task.
 *
 * If its a voice task, we want to run the original function. (see transferOverride for details)
 */
export const setUpActions = () => {
	Actions.replaceAction('TransferTask', (payload, original) => transferOverride(payload, original));
	// Modify default Flex Orchestrations for Chat Channels
	ChatOrchestrator.setOrchestrations('wrapup', orchestrationCallback);
	ChatOrchestrator.setOrchestrations('completed', orchestrationCallback);
};

/**
 * Every task that enters wrapup, or completed states runs through this callback. (see setUpActions)
 *
 * By default, when you push a chat task into wrapping, flex deactivates the chat channel and removes the
 * agent from the chat. In the case of a transfer and completion of the original task, we don't want to do this.
 *
 * The callback inspects the task for a specific attribute `wasTransferred` - this attribute
 * is added during the request to initiate the transfer. If we see it, we modify which orchestrations run.
 *
 * In this case, if we see the task is a transferred task, we only want to run the LeaveChatChannel orchestration.
 * Returning 'LeaveChatChannel' only - allows the agent to leave the conversation without closing the chat session
 * Returning 'DeactivateChatChannel' and 'LeaveChatChannel' closes the channel when the agent leaves.
 */
export const orchestrationCallback = (task) => {
	if (task.attributes.wasTransferred) {
		return ['LeaveChatChannel'];
	}
	return ['DeactivateChatChannel', 'LeaveChatChannel'];
};

/**
 * This is the function we replaced Flex's default TransferTask action with.
 *
 * First, it inspects the task passing through it, if the task is not chat-based it calls the original
 * Flex TransferTask action. This allows voice transfers to complete as normal.
 *
 * Assuming its a chat task, we initiate a request to our serverless function to iniate the transfer.
 */
export const transferOverride = async (payload, original) => {
	if (!TaskHelper.isChatBasedTask(payload.task)) {
		return original(payload);
	}

	// set a flag on the task attributes to let us know its a transfer task
	// this is what tells the ChatOrchestrator to do when this task is put into
	// wrapping or completed - see orchestrationCallback
	const { attributes } = payload.task;
	attributes.wasTransferred = true;
	await payload.task.setAttributes(attributes);

	// We can support both warm and cold transfer options
	const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

	// instantiate the manager to get useful info like user identity and token
	// build the request to initiate the transfer
	const manager = Manager.getInstance();
	const body = {
		Token: manager.user.token,
		mode: mode,
		taskSid: payload.task.taskSid,
		targetSid: payload.targetSid,
		workerName: manager.user.identity,
	};

	// initiate the transfer
	return fetch(`http://${SERVERLESS_FUNCTION_DOMAIN}/transfer-chat`, {
		headers: {
			'Content-Type': 'application/json',
		},
		method: 'POST',
		body: JSON.stringify(body),
	}).catch((e) => {
		// see src/helpers/notifications.js for how this custom notification is registered.
		// if for some reason the request to transfer fails, show it to the agent
		Notifications.showNotification('chatTransferFetchError', { message: e.message });
	});
};
