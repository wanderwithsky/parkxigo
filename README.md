# ParkXiGo

A modern parking application that helps users find, book, and pay for parking spots easily.

## Features

- **User Authentication**: Secure login and registration system
- **Parking Spot Search**: Find available parking spots based on location
- **Interactive Maps**: View parking spots on an interactive map (using Leaflet)
- **Booking System**: Reserve parking spots in advance
- **Payment Processing**: Secure payment options
- **User Profiles**: Manage your bookings and preferences
- **Admin Dashboard**: For parking spot owners and administrators

## Tech Stack

### Frontend
- React 18
- TypeScript
- React Router
- Tailwind CSS
- Leaflet (for maps)
- Vite (build tool)

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (with Mongoose)
- JWT Authentication
- Multer (file uploads)
- Cloudinary (image storage)
- Nodemailer (email services)

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
```bash
git clone https://github.com/wanderwithsky/parkxigo.git
cd parkxigo
```

2. Set up the backend
```bash
cd backend
npm install
# Create a .env file based on .env.example
npm run dev
```

3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

## Project Structure

```
├── backend/             # Backend Node.js application
│   ├── src/             # TypeScript source files
│   ├── dist/            # Compiled JavaScript files
│   └── ...
├── frontend/            # React frontend application
│   ├── public/          # Static files
│   ├── src/             # React source files
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   └── ...
│   └── ...
└── ...
```

## API Endpoints

- **Auth**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login a user
  - `GET /api/auth/profile` - Get user profile

- **Parking Spots**
  - `GET /api/parkingspot` - Get all parking spots
  - `GET /api/parkingspot/:id` - Get a specific parking spot
  - `POST /api/parkingspot` - Create a new parking spot
  - `PUT /api/parkingspot/:id` - Update a parking spot
  - `DELETE /api/parkingspot/:id` - Delete a parking spot

- **Bookings**
  - `GET /api/booking` - Get user's bookings
  - `POST /api/booking` - Create a new booking
  - `PUT /api/booking/:id` - Update a booking
  - `DELETE /api/booking/:id` - Cancel a booking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

WanderWithSky - https://github.com/wanderwithsky 