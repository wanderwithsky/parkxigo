import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';

// Process a new payment
export const processPayment = async (req, res) => {
  try {
    const { 
      bookingId,
      method,
      cardDetails,
      billingDetails
    } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user permissions
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this booking' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already processed for this booking' });
    }

    // Generate a mock transaction ID
    // In a real app, this would come from a payment processor like Stripe
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the payment
    const payment = new Payment({
      bookingId,
      userId: req.user._id,
      amount: booking.totalCost,
      method,
      transactionId,
      status: 'completed', // Auto-complete the payment for demo purposes
      cardDetails,
      billingDetails
    });

    await payment.save();

    // Update booking status if needed
    booking.status = 'confirmed';
    await booking.save();

    res.status(201).json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify user permissions
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this payment' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Failed to fetch payment details', error: error.message });
  }
};

// Get all payments for a user
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

// Mock refund process
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify user permissions
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this payment' });
    }

    // Check if payment is already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    // Only completed payments can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    // Update payment status
    payment.status = 'refunded';
    await payment.save();

    // Update associated booking
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = 'cancelled';
      await booking.save();

      // Return available spot to parking inventory
      const spot = await ParkingSpot.findById(booking.parkingSpotId);
      if (spot) {
        spot.availableSpots += 1;
        await spot.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Failed to process refund', error: error.message });
  }
}; 