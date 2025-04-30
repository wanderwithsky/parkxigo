import ParkingSpot from '../models/ParkingSpot.js';
import cloudinary from '../config/cloudinary.js';

export const getAll = async (req, res) => {
  const spots = await ParkingSpot.find();
  res.json(spots);
};

export const getOne = async (req, res) => {
  const spot = await ParkingSpot.findById(req.params.id);
  if (!spot) return res.status(404).json({ message: 'Not found' });
  res.json(spot);
};

export const create = async (req, res) => {
  let imageUrl = '';
  if (req.file) {
    const upload = await cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'parkxigo' },
      (error, result) => {
        if (error) throw error;
        imageUrl = result.secure_url;
      }
    );
    upload.end(req.file.buffer);
  }
  const spot = await ParkingSpot.create({ ...req.body, image: imageUrl });
  res.status(201).json(spot);
};

export const update = async (req, res) => {
  const spot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!spot) return res.status(404).json({ message: 'Not found' });
  res.json(spot);
};

export const remove = async (req, res) => {
  await ParkingSpot.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}; 