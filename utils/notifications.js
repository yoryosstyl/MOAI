import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
 * Notify admins about a new toolkit submission
 */
export async function notifyAdminsNewToolkit(toolkitId, toolkitName, submitterName) {
  const adminEmails = ['yoryos.styl@gmail.com', 'stavros.roussos@gmail.com'];

  // Get admin user IDs from their emails
  // For now, we'll use a simpler approach - notify by email
  // In production, you'd query users collection to get UIDs

  const title = 'New Toolkit Submission';
  const message = `${submitterName} has submitted "${toolkitName}" for review.`;
  const link = `/toolkits/admin/review`;

  // Note: This assumes admins have been authenticated at least once
  // A better approach would be to query the users collection for admin UIDs
  // For now, this serves as a placeholder structure

  // TODO: Implement admin UID lookup when messaging system is complete
  console.log('Admin notification:', { title, message, link });
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
