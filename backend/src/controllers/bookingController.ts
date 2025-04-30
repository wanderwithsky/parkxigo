import { Request, Response } from 'express';
import { Booking, IBooking } from '../models/Booking';
import { IUser } from '../models/User';

export const getBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const bookings = await Booking.find({ userId: user._id })
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: (error as Error).message });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: (error as Error).message });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { parkingSpotId, startTime, endTime, totalPrice } = req.body;

    const booking = new Booking({
      parkingSpotId,
      userId: user._id,
      startTime,
      endTime,
      totalPrice,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: (error as Error).message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      req.body,
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: (error as Error).message });
  }
}; 