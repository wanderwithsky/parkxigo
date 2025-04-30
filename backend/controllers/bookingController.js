import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import { v4 as uuidv4 } from 'uuid';

export const create = async (req, res) => {
  const { parkingSpotId, startTime, endTime } = req.body;
  const spot = await ParkingSpot.findById(parkingSpotId);
  if (!spot || spot.availableSpots <= 0) return res.status(400).json({ message: 'No spots available' });

  const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const totalCost = duration * spot.hourlyRate;
  const qrCode = `PARKXIGO-${spot._id}-${req.user._id}-${Date.now()}`;

  const booking = await Booking.create({
    parkingSpotId,
    userId: req.user._id,
    startTime,
    endTime,
    totalCost,
    qrCode
  });

  spot.availableSpots -= 1;
  await spot.save();

  res.status(201).json(booking);
};

export const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id });
  res.json(bookings);
};

export const getOwnerBookings = async (req, res) => {
  const spots = await ParkingSpot.find({ ownerId: req.user._id });
  const spotIds = spots.map(s => s._id);
  const bookings = await Booking.find({ parkingSpotId: { $in: spotIds } });
  res.json(bookings);
};

export const cancel = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Not found' });
  booking.status = 'cancelled';
  await booking.save();

  const spot = await ParkingSpot.findById(booking.parkingSpotId);
  if (spot) {
    spot.availableSpots += 1;
    await spot.save();
  }

  res.json(booking);
}; 