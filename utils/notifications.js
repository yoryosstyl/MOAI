import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Create a notification for a user
 * @param {string} userId - The user ID to send notification to
 * @param {string} type - Type of notification (toolkit_submitted, toolkit_approved, toolkit_rejected)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link to navigate to
 */
export async function createNotification({ userId, type, title, message, link = null }) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get admin user IDs by looking up their emails in the users collection
 */
async function getAdminUserIds() {
  const adminEmails = ['gstylianopoulos@gmail.com', 'factanonverba2002@gmail.com'];
  const adminIds = [];

  try {
    const usersRef = collection(db, 'users');

    for (const email of adminEmails) {
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        adminIds.push(doc.id);
      });
    }
  } catch (error) {
    console.error('Error fetching admin IDs:', error);
  }

  return adminIds;
}

/**
 * Notify admins about a new toolkit submission
 */
export async function notifyAdminsNewToolkit(toolkitId, toolkitName, submitterName) {
  const title = 'New Toolkit Submission';
  const message = `${submitterName} has submitted "${toolkitName}" for review.`;
  const link = `/toolkits/admin/review`;

  // Get admin user IDs
  const adminIds = await getAdminUserIds();

  // Create notification for each admin
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: 'toolkit_submitted',
      title,
      message,
      link,
    });
  }
}

/**
 * Notify user about toolkit approval
 */
export async function notifyUserToolkitApproved(userId, toolkitId, toolkitName) {
  await createNotification({
    userId,
    type: 'toolkit_approved',
    title: 'Toolkit Approved! 🎉',
    message: `Your toolkit "${toolkitName}" has been approved and is now live.`,
    link: `/toolkits/${toolkitId}`,
  });
}

/**
 * Notify user about toolkit rejection
 */
export async function notifyUserToolkitRejected(userId, toolkitName, reason) {
  await createNotification({
    userId,
    type: 'toolkit_rejected',
    title: 'Toolkit Submission Update',
    message: `Your toolkit "${toolkitName}" was not approved. Reason: ${reason}`,
    link: '/toolkits',
  });
}

/**
 * Notify admins about a new news submission
 */
export async function notifyAdminsNewNews(newsId, newsTitle, submitterName) {
  const title = 'New News Submission';
  const message = `${submitterName} has submitted "${newsTitle}" for review.`;
  const link = `/news/admin/review`;

  // Get admin user IDs
  const adminIds = await getAdminUserIds();

  // Create notification for each admin
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: 'news_submitted',
      title,
      message,
      link,
    });
  }
}

/**
 * Notify user about news approval
 */
export async function notifyUserNewsApproved(userId, newsId, newsTitle) {
  await createNotification({
    userId,
    type: 'news_approved',
    title: 'News Approved! 🎉',
    message: `Your news article "${newsTitle}" has been approved and is now live.`,
    link: `/news/${newsId}`,
  });
}

/**
 * Notify user about news rejection
 */
export async function notifyUserNewsRejected(userId, newsTitle, reason) {
  await createNotification({
    userId,
    type: 'news_rejected',
    title: 'News Submission Update',
    message: `Your news article "${newsTitle}" was not approved. Reason: ${reason}`,
    link: '/news',
  });
}
