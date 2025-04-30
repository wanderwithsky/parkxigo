import { Request, Response } from 'express';
import { ParkingSpot } from '../models/ParkingSpot';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../models/User';
import cloudinary from '../config/cloudinary';
import fs from 'fs';
import { promisify } from 'util';

// Define the MulterRequest interface that makes files non-optional
export interface MulterRequest extends Request {
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = uuidv4();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Export the upload middleware
export const upload = multer({ storage });

// Promisify fs.unlink for async file deletion
const unlinkAsync = promisify(fs.unlink);

// Helper function to upload a file to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Upload stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'parkingspots' },
        (error, result) => {
          // Clean up the temporary file
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error deleting temporary file:', err);
            });
          }

          if (error) {
            console.error('Cloudinary upload error:', error);
            // Fallback to local file path if Cloudinary fails
            resolve(`/uploads/${file.filename}`);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            // Fallback to local file path if Cloudinary returns no result
            resolve(`/uploads/${file.filename}`);
          }
        }
      );

      // Create read stream from the file and pipe to uploadStream
      const readStream = fs.createReadStream(file.path);
      readStream.pipe(uploadStream);
    } catch (err) {
      console.error('Error in uploadToCloudinary function:', err);
      // If anything fails, at least return the local file path
      resolve(`/uploads/${file.filename}`);
    }
  });
};

// Get all parking spots
export const getParkingSpots = async (req: Request, res: Response) => {
  try {
    const spots = await ParkingSpot.find();
    res.json(spots);
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({ message: 'Error fetching parking spots', error: (error as Error).message });
  }
};

// Get a single parking spot by ID
export const getParkingSpot = async (req: Request, res: Response) => {
  try {
    const spot = await ParkingSpot.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }
    res.json(spot);
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    res.status(500).json({ message: 'Error fetching parking spot', error: (error as Error).message });
  }
};

// Create a new parking spot
export const createParkingSpot = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', (req as MulterRequest).files);

    // Generate a unique ID for the parking spot
    const uniqueId = uuidv4();
    console.log('Generated unique ID:', uniqueId);

    // Extract uploaded files
    const files = (req as MulterRequest).files;
    let imageUrls: string[] = [];
    
    try {
      // Handle both files formats and upload to Cloudinary
      if (Array.isArray(files)) {
        // Process each file with Cloudinary
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        imageUrls = await Promise.all(uploadPromises);
      } else if (files) {
        // Handle object of arrays format
        const allFiles = Object.values(files).flat();
        const uploadPromises = allFiles.map(file => uploadToCloudinary(file));
        imageUrls = await Promise.all(uploadPromises);
      } else {
        console.log('No files were uploaded');
      }
      
      console.log('Uploaded image URLs:', imageUrls);
    } catch (uploadError) {
      console.error('Error uploading images:', uploadError);
      // Continue with creation, just without images
      imageUrls = [];
    }

    let location = { type: 'Point', coordinates: [0, 0] };
    let features = [];
    let totalSpots = 0;
    let availability = { from: new Date(), to: new Date() };

    try {
      // Parse JSON fields
      location = JSON.parse(req.body.location);
      features = JSON.parse(req.body.features);
      totalSpots = parseInt(req.body.totalSpots);
      availability = JSON.parse(req.body.availability);
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      return res.status(400).json({ 
        message: 'Error parsing request data', 
        error: (parseError as Error).message 
      });
    }

    console.log('Parsed data:', {
      id: uniqueId,
      title: req.body.title,
      location,
      features,
      totalSpots,
      availability
    });

    // Validate required fields
    if (!req.body.title || !availability.to) {
      console.log('Validation failed:', {
        title: req.body.title,
        availabilityTo: availability.to
      });
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: 'Title and availability.to are required fields' 
      });
    }

    // Create a complete parking spot object with all required fields
    const parkingSpotData = {
      id: uniqueId,
      title: req.body.title,
      description: req.body.description || '',
      address: req.body.address || '',
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      price: parseFloat(req.body.price) || 0,
      totalSpots: totalSpots || 0,
      availableSpots: totalSpots || 0,
      ownerId: req.body.ownerId,
      ownerEmail: req.body.ownerEmail || '',
      images: imageUrls,
      features,
      availability: {
        from: new Date(availability.from),
        to: new Date(availability.to)
      }
    };

    console.log('Creating parking spot with data:', parkingSpotData);

    const newParkingSpot = await ParkingSpot.create(parkingSpotData);
    console.log('Created parking spot:', newParkingSpot);
    res.status(201).json(newParkingSpot);
  } catch (error) {
    console.error('Error creating parking spot:', error);
    res.status(500).json({ message: 'Error creating parking spot', error: (error as Error).message });
  }
};

// Update a parking spot
export const updateParkingSpot = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const spot = await ParkingSpot.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }
    if (spot.ownerId !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this parking spot' });
    }

    // Create a copy of req.body without the id field to prevent id modification
    const updateData = { ...req.body };
    delete updateData.id; // Prevent updating the id field

    const updatedSpot = await ParkingSpot.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { id: req.params.id }] },
      { $set: updateData },
      { new: true }
    );
    res.json(updatedSpot);
  } catch (error) {
    console.error('Error updating parking spot:', error);
    res.status(500).json({ message: 'Error updating parking spot', error: (error as Error).message });
  }
};

// Delete a parking spot
export const deleteParkingSpot = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const spot = await ParkingSpot.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }
    if (spot.ownerId !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this parking spot' });
    }
    await ParkingSpot.deleteOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
    res.json({ message: 'Parking spot deleted successfully' });
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    res.status(500).json({ message: 'Error deleting parking spot', error: (error as Error).message });
  }
}; 