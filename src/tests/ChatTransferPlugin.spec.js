import fetch from 'node-fetch';
import * as Flex from '@twilio/flex-ui';
import {
	setUpComponents,
	removeDefaultChatChannelOrchestrations,
	restoreDefaultChatChannelOrchestrations,
	transferOverride,
} from '../ChatTransferPlugin';

const { Response } = jest.requireActual('node-fetch');

jest.mock('@twilio/flex-ui');
jest.mock('node-fetch', () => jest.fn());

describe('setUpComponents', () => {
	it('it appends to TaskCanvasHeader', () => {
		setUpComponents();
		expect(Flex.TaskCanvasHeader.Content.add).toHaveBeenCalled();
	});
});

describe('handles transfers for chat tasks', () => {
	let task = {
		taskSid: 'taskSid',
	};
	let payload = {
		task,
		targetSid: 'targetSid',
		options: {
			mode: 'COLD',
		},
	};
	let original = jest.fn();

	it('calls original for non-chat tasks', async () => {
		// force task helper to return false
		Flex.TaskHelper.isChatBasedTask = jest.fn(() => false);

		await transferOverride(payload, original);
		expect(original).toHaveBeenCalled();

		Flex.TaskHelper.isChatBasedTask.mockClear();
	});

	it('calls fetch if the task is a chat task', async () => {
		// force task helper to return true
		Flex.TaskHelper.isChatBasedTask = jest.fn(() => true);

		// mock fetch to return a valid value
		fetch.mockImplementation(() => Promise.resolve(new Response()));

		await transferOverride(payload, original);
		expect(fetch).toHaveBeenCalledTimes(1);
	});
});
