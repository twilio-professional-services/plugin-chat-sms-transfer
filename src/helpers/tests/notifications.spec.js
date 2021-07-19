import { Notifications, NotificationType } from '@twilio/flex-ui';

import { setUpNotifications } from '../notifications';

jest.mock('@twilio/flex-ui', () => {
  return {
    Manager: {
      getInstance: jest.fn(() => {
        return {
          strings: {
            chatTransferFetchErrorTemplate: '',
          },
        };
      }),
    },
    Notifications: {
      registerNotification: jest.fn(),
    },
    NotificationType: {
      error: '',
    },
  };
});

describe('setUpNotifications', () => {
  beforeEach(() => {
    setUpNotifications();
  });

  it('registers our notification', () => {
    expect(Notifications.registerNotification).toHaveBeenCalledWith({
      id: 'chatTransferFetchError',
      content: 'chatTransferFetchErrorTemplate',
      type: NotificationType.error,
    });
  });
});
