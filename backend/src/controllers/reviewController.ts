import { Request, Response } from 'express';
import { Review, IReview } from '../models/Review';
import { validateToken } from '../middleware/auth';
import { ParkingSpot } from '../models/ParkingSpot';
import { IUser } from '../models/User';
import { sendReviewNotification } from '../utils/email';

// Get all reviews for a parking spot
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { parkingSpotId } = req.params;
    console.log('Fetching reviews for parking spot:', parkingSpotId);
    
    const reviews = await Review.find({ parkingSpotId })
      .sort({ createdAt: -1 });
    
    console.log('Found reviews:', reviews);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: (error as Error).message });
  }
};

// Create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { spotId, rating, comment } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = req.user as IUser;
    console.log('Creating review for user:', user._id);

    // Validate required fields
    if (!spotId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate parking spot exists
    const parkingSpot = await ParkingSpot.findById(spotId);
    if (!parkingSpot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Create and save the review
    const review = new Review({
      parkingSpotId: spotId,
      userId: user._id,
      userName: user.name,
      rating,
      comment,
    });

    await review.save();
    console.log('Review created successfully:', review);

    // Send email notification if owner email is available
    if (parkingSpot.ownerEmail) {
      await sendReviewNotification(
        parkingSpot.ownerEmail,
        parkingSpot.title,
        user.name,
        rating,
        comment
      );
    }

    res.status(201).json(review);
  } catch (err) {
    const error = err as Error;
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review', error: (error as Error).message });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review', error: (error as Error).message });
  }
};

// Like or dislike a review
export const reactToReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user has already reacted
    const existingReaction = review.reactions.find(
      (reaction) => reaction.userId.toString() === userId.toString()
    );

    if (existingReaction) {
      // If user is trying to do the same action, remove the reaction
      if (existingReaction.action === action) {
        review.reactions = review.reactions.filter(
          (reaction) => reaction.userId.toString() !== userId.toString()
        );
        if (action === 'like') {
          review.likes = Math.max(0, review.likes - 1);
        } else {
          review.dislikes = Math.max(0, review.dislikes - 1);
        }
      } else {
        // If user is changing their reaction, update it
        existingReaction.action = action;
        if (action === 'like') {
          review.likes += 1;
          review.dislikes = Math.max(0, review.dislikes - 1);
        } else {
          review.dislikes += 1;
          review.likes = Math.max(0, review.likes - 1);
        }
      }
    } else {
      // Add new reaction
      review.reactions.push({
        userId: userId.toString(),
        action
      });
      if (action === 'like') {
        review.likes += 1;
      } else {
        review.dislikes += 1;
      }
    }

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Error reacting to review:', error);
    res.status(500).json({ message: 'Error reacting to review' });
  }
}; 