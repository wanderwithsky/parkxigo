import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Review {
  _id: string;
  userId: string;
  parkingSpotId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reactions: {
    userId: string;
    action: 'like' | 'dislike';
  }[];
}

interface ReviewListProps {
  parkingSpotId: string;
}

// Add API URL constant with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export default function ReviewList({ parkingSpotId }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [parkingSpotId]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('parkxigo-token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
      }

      const res = await fetch(`${API_URL}/reviews/parking-spot/${parkingSpotId}`, { headers });
      
      if (res.status === 401) {
        console.log('Authentication required for reviews. Using mock data.');
        // If unauthorized, use mock data
        setReviews(getMockReviews());
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to fetch reviews');
        // Fall back to mock data
        setReviews(getMockReviews());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews. Please try again later.');
      // Fall back to mock data
      setReviews(getMockReviews());
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock reviews when the API is unavailable
  const getMockReviews = () => {
    return [
      {
        _id: '1',
        userId: 'user1',
        parkingSpotId: parkingSpotId,
        rating: 5,
        comment: 'Great parking spot! Very convenient location and easy to find.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        reactions: []
      },
      {
        _id: '2',
        userId: 'user2',
        parkingSpotId: parkingSpotId,
        rating: 4,
        comment: 'Good spot, but a bit tight for larger vehicles.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        reactions: []
      }
    ];
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    try {
      const token = localStorage.getItem('parkxigo-token');
      if (!token) {
        setError('You must be logged in to submit a review');
        return;
      }

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spotId: parkingSpotId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (res.ok) {
        const review = await res.json();
        setReviews([review, ...reviews]);
        setNewReview({ rating: 5, comment: '' });
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again later.');
    }
  };

  const handleReaction = async (reviewId: string, action: 'like' | 'dislike') => {
    if (!user) return;

    try {
      const token = localStorage.getItem('parkxigo-token');
      if (!token) {
        setError('You must be logged in to react to reviews');
        return;
      }

      const res = await fetch(`${API_URL}/reviews/${reviewId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchReviews(); // Refresh reviews to get updated reactions
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to react to review');
      }
    } catch (error) {
      console.error('Error reacting to review:', error);
      setError('Failed to react to review. Please try again later.');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg">
          {error}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Share your experience..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="mb-3">{review.comment}</p>
              
              {user && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleReaction(review._id, 'like')}
                    className={`flex items-center gap-1 text-sm ${
                      review.reactions.some(r => r.userId === user.id && r.action === 'like')
                        ? 'text-primary'
                        : 'text-muted'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>
                      {review.reactions.filter(r => r.action === 'like').length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleReaction(review._id, 'dislike')}
                    className={`flex items-center gap-1 text-sm ${
                      review.reactions.some(r => r.userId === user.id && r.action === 'dislike')
                        ? 'text-primary'
                        : 'text-muted'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>
                      {review.reactions.filter(r => r.action === 'dislike').length}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 