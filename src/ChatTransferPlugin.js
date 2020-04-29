import { FlexPlugin } from 'flex-plugin';
import fetch from 'node-fetch';
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import TransferButton from './components/TransferButton';

const PLUGIN_NAME = 'ChatTransferPlugin';
const DEFAULT_TRANSFER_MODE = 'COLD';
const SERVERLESS_FUNCTION_DOMAIN = '';

export const setUpComponents = () => {
	Flex.TaskCanvasHeader.Content.add(<TransferButton key="chat-transfer-button" />, {
		sortOrder: 1,
		if: (props) =>
			props.channelDefinition.capabilities.has('Chat') && props.task.taskStatus === 'assigned',
	});
};

export const setUpActions = () => {
	Flex.Actions.replaceAction('TransferTask', (payload, original) =>
		transferOverride(payload, original)
	);
};

export const transferOverride = (payload, original) => {
	if (!Flex.TaskHelper.isChatBasedTask(payload.task)) {
		return original(payload);
	}

	const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

	return new Promise((resolve, reject) => {
		const manager = Flex.Manager.getInstance();
		const body = {
			Token: manager.user.token,
			mode: mode,
			taskSid: payload.task.taskSid,
			targetSid: payload.targetSid,
			workerName: manager.user.identity,
		};

		fetch(`https://${SERVERLESS_FUNCTION_DOMAIN}/transfer-chat`, {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(body),
		})
			.then((response) => {
				resolve();
			})
			.catch((error) => {
				reject();
			});
	});
};

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
