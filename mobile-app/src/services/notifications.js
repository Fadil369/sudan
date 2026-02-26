/**
 * Notification Service - Push Notifications
 * SGDUS Mobile App
 * 
 * Handles government alerts, service updates, and reminders
 */

import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

/**
 * Configure push notifications
 */
export const configureNotifications = () => {
  PushNotification.configure({
    // Called when token is generated
    onRegister: function (token) {
      console.log('TOKEN:', token);
      // Send token to server for push notification targeting
      saveTokenToServer(token);
    },

    // Called when notification is received
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      
      // Process the notification
      handleNotification(notification);
      
      // Required for iOS
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },

    // Called when user taps on notification
    onAction: function (notification, action) {
      console.log('ACTION:', action);
      console.log('NOTIFICATION:', notification);
    },

    // Called when registration fails
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },

    // iOS permissions
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    popInitialNotification: true,

    // Request permissions immediately
    requestPermissions: true,
  });

  // Configure for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'sgdus-general', // Channel ID
        channelName: 'General Notifications', // Channel name
        channelDescription: 'General government notifications', // Channel description
        playSound: true,
        soundName: 'default',
        importance: 4, // HIGH
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'sgdus-urgent',
        channelName: 'Urgent Alerts',
        channelDescription: 'Critical government alerts and emergencies',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

/**
 * Local notification - immediate display
 */
export const showLocalNotification = (title, message, options = {}) => {
  const {
    channelId = 'sgdus-general',
    importance = 4,
    playSound = true,
    vibrate = true,
    ...extra
  } = options;

  PushNotification.localNotification({
    id: extra.id || '0',
    title: title,
    message: message,
    playSound: playSound,
    soundName: 'default',
    importance: importance,
    vibrate: vibrate,
    ...extra,
  });
};

/**
 * Scheduled notification
 */
export const scheduleNotification = (title, message, date, options = {}) => {
  PushNotification.localNotificationSchedule({
    id: options.id || '0',
    title: title,
    message: message,
    date: date,
    allowWhileIdle: options.allowWhileIdle || false,
    repeatType: options.repeatType || null, // day, hour, minute, time
    playSound: options.playSound || true,
    soundName: 'default',
    importance: options.importance || 4,
    vibrate: options.vibrate || true,
  });
};

/**
 * Cancel specific notification
 */
export const cancelNotification = (id) => {
  PushNotification.cancelLocalNotification(id);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = () => {
  PushNotification.cancelAllLocalNotifications();
};

/**
 * Get delivered notifications
 */
export const getDeliveredNotifications = (callback) => {
  PushNotification.getDeliveredNotifications(callback);
};

/**
 * Set application badge number (iOS)
 */
export const setBadgeNumber = (number) => {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationBadgeNumber(number);
  }
};

/**
 * Get application badge number (iOS)
 */
export const getBadgeNumber = (callback) => {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.getApplicationBadgeNumber(callback);
  }
};

/**
 * Request permissions
 */
export const requestPermissions = async () => {
  return new Promise((resolve) => {
    PushNotification.requestPermissions().then((result) => {
      resolve(result);
    });
  });
};

/**
 * Handle incoming notification
 */
const handleNotification = (notification) => {
  const { data, foreground, userInteraction } = notification;
  
  // Handle based on notification type
  if (data?.type) {
    switch (data.type) {
      case 'health_reminder':
        // Handle health appointment reminder
        break;
      case 'document_ready':
        // Handle document ready notification
        break;
      case 'government_alert':
        // Handle government emergency alert
        break;
      default:
        break;
    }
  }
};

/**
 * Save token to server
 */
const saveTokenToServer = async (token) => {
  // Implementation would send token to backend
  console.log('Saving token:', token.token);
};

/**
 * Government notification types
 */
export const notificationTypes = {
  HEALTH_APPOINTMENT: 'health_appointment',
  DOCUMENT_READY: 'document_ready',
  GOVERNMENT_ALERT: 'government_alert',
  SERVICE_UPDATE: 'service_update',
  PAYMENT_REMINDER: 'payment_reminder',
  VERIFICATION_REQUIRED: 'verification_required',
};

/**
 * Show government alert
 */
export const showGovernmentAlert = (title, message, urgent = false) => {
  showLocalNotification(title, message, {
    channelId: urgent ? 'sgdus-urgent' : 'sgdus-general',
    importance: urgent ? 4 : 3,
    playSound: urgent,
    vibrate: urgent,
    ongoing: urgent,
    autoCancel: !urgent,
  });
};

/**
 * Schedule health appointment reminder
 */
export const scheduleHealthReminder = (appointmentDate, hospitalName) => {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

  if (reminderDate > new Date()) {
    scheduleNotification(
      'تذكير بموعد الطبيب', // Appointment reminder in Arabic
      `موعدك في ${hospitalName} غداً`,
      reminderDate,
      {
        id: 'health_reminder',
        channelId: 'sgdus-general',
      }
    );
  }
};

export default {
  configureNotifications,
  showLocalNotification,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  getDeliveredNotifications,
  setBadgeNumber,
  getBadgeNumber,
  requestPermissions,
  showGovernmentAlert,
  scheduleHealthReminder,
  notificationTypes,
};
