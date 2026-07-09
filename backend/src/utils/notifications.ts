import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const expo = new Expo();
const prisma = new PrismaClient();

export const sendPushNotification = async (pushToken: string, title: string, body: string, data?: any) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return false;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticketChunk);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

export const notifyUserOrderUpdate = async (userId: string, orderId: string, status: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.pushToken) {
    const title = 'Order Update';
    const body = `Your order #${orderId.substring(0, 8)} is now ${status}.`;
    await sendPushNotification(user.pushToken, title, body, { orderId, status });
  }
};

export const notifyAllRetailersNewProduct = async (productName: string) => {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER', status: 'APPROVED', pushToken: { not: null } }
  });

  const messages: ExpoPushMessage[] = [];
  
  for (const user of users) {
    if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      messages.push({
        to: user.pushToken,
        sound: 'default',
        title: 'New Product Available!',
        body: `${productName} is now available in our catalog. Check it out!`,
      });
    }
  }

  const chunks = expo.chunkPushNotifications(messages);
  
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Error sending batch push notifications:', error);
    }
  }
};
