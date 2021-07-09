import { Manager, Notifications, NotificationType } from '@twilio/flex-ui';

/**
 * Sets up a custom notification that can be invoked if the request to transfer the
 * chat task, fails for some reason. Notice we define this as a template on the Manager instance,
 * this means that we can pass in context when we invoke the notification (such as the http error message)
 * and it will replace the {{message}} token.
 *
 * see actions.js (transferOverride function) for an example of how the notification is invoked
 */
export const setUpNotifications = () => {
  const manager = Manager.getInstance();
  manager.strings.chatTransferFetchErrorTemplate = 'Failed: {{message}}';

  Notifications.registerNotification({
    id: 'chatTransferFetchError',
    content: 'chatTransferFetchErrorTemplate',
    type: NotificationType.error,
  });
};
