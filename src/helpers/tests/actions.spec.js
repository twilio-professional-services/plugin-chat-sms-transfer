import fetch from 'node-fetch';
import { Actions, TaskHelper, Manager, Notifications, StateHelper } from '@twilio/flex-ui';
import { setUpActions, transferOverride } from '../actions';

const { Response } = jest.requireActual('node-fetch');

jest.mock('node-fetch', () => jest.fn());
jest.mock('@twilio/flex-ui', () => {
	return {
		Actions: {
			replaceAction: jest.fn(),
		},
		TaskHelper: {
			isChatBasedTask: jest.fn(),
		},
		StateHelper: {
			getChatChannelStateForTask: jest.fn(() => {
				return {
					source: {
						join: jest.fn(),
						leave: jest.fn(),
					},
				};
			}),
		},
		Manager: {
			getInstance: jest.fn(() => {
				return {
					user: {
						token: 'token',
						identity: 'identity',
					},
				};
			}),
		},
		Notifications: {
			showNotification: jest.fn(),
		},
	};
});

describe('actions', () => {
	describe('setUpActions', () => {
		beforeEach(() => {
			setUpActions();
		});
		it('calls replace action on TransferTask', () => {
			expect(Actions.replaceAction).toBeCalledWith('TransferTask', expect.any(Function));
		});
	});

	describe('transferOverride', () => {
		let payload;
		let original;

		beforeEach(() => {
			payload = {
				task: {},
			};

			original = jest.fn();
		});
		it('calls original for non chat tasks', () => {
			jest.spyOn(TaskHelper, 'isChatBasedTask').mockImplementation(() => {
				return false;
			});
			transferOverride(payload, original);
			expect(original).toBeCalledWith(payload);
		});
	});
});
