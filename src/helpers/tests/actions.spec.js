import fetch from 'node-fetch';
import { Actions, TaskHelper, Notifications, StateHelper } from '@twilio/flex-ui';

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
    let body;
    let joinFn;
    let leaveFn;

    beforeEach(() => {
      body = {
        Token: 'token',
        taskSid: 'taskSid',
        targetSid: 'targetSid',
        workerName: 'identity',
      };

      payload = {
        task: {
          taskSid: 'taskSid',
        },
        targetSid: 'targetSid',
      };

      original = jest.fn();
      joinFn = jest.fn();
      leaveFn = jest.fn();

      StateHelper.getChatChannelStateForTask = jest.fn(() => {
        return {
          source: {
            join: joinFn,
            leave: leaveFn,
          },
        };
      });
    });

    it('calls original for non chat tasks', async () => {
      // force task helper to return false
      TaskHelper.isChatBasedTask = jest.fn(() => false);

      await transferOverride(payload, original);
      expect(original).toHaveBeenCalled();

      TaskHelper.isChatBasedTask.mockClear();
    });

    it('makes a request using fetch for chat tasks', async () => {
      // force task helper to return true
      TaskHelper.isChatBasedTask = jest.fn(() => true);

      // mock fetch to return a valid value
      fetch.mockImplementation(() => Promise.resolve(new Response()));

      process.env.SERVERLESS_FUNCTION_DOMAIN = '';
      await transferOverride(payload, original);
      expect(leaveFn).toHaveBeenCalled();
      expect(joinFn).not.toHaveBeenCalled();
      expect(original).not.toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/transfer-chat', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      });
    });

    it('calls showNotification if there is a fetch error', async () => {
      // force task helper to return true
      TaskHelper.isChatBasedTask = jest.fn(() => true);

      // mock fetch to return a valid value
      const err = new Error('the error message');
      fetch.mockImplementation(() => Promise.reject(err));

      await transferOverride(payload, original);
      expect(leaveFn).toHaveBeenCalled();
      expect(joinFn).toHaveBeenCalled();
      expect(original).not.toHaveBeenCalled();
      expect(Notifications.showNotification).toBeCalledWith('chatTransferFetchError', {
        message: err.message,
      });
    });
  });
});
