interface ReviewNotificationParams {
  to: string;
  spotTitle: string;
  reviewerName: string;
  rating: number;
  comment: string;
}

export const sendReviewNotification = async ({
  to,
  spotTitle,
  reviewerName,
  rating,
  comment,
}: ReviewNotificationParams): Promise<void> => {
  // TODO: Implement actual email sending logic here
  // For now, just log the notification
  console.log('Review notification:', {
    to,
    spotTitle,
    reviewerName,
    rating,
    comment,
  });
}; 