# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js/Express backend API for a video platform (similar to YouTube) with user authentication, file upload capabilities, and MongoDB integration. The project uses ES6 modules and follows a clean architecture pattern with separate layers for routes, controllers, models, middlewares, and utilities.

## Development Commands

### Start Development Server
```bash
npm run dev
```
This starts the server with nodemon, enabling hot reload and loading environment variables from `.env`.

### Install Dependencies
```bash
npm install
```

### Code Formatting
```bash
npx prettier --write .
```
The project uses Prettier for code formatting with configuration in `.prettierrc`.

## Architecture Overview

### Core Structure
- **Entry Point**: `src/index.js` - Loads environment variables and starts the server
- **App Configuration**: `src/app.js` - Express app setup with middleware configuration
- **Database**: `src/db/index.js` - MongoDB connection using Mongoose
- **Constants**: `src/constants.js` - Application constants (DB_NAME)

### Layer Architecture
1. **Routes** (`src/routes/`) - API endpoint definitions
2. **Controllers** (`src/controllers/`) - Business logic and request handling  
3. **Models** (`src/models/`) - MongoDB schemas and model definitions
4. **Middlewares** (`src/middlewares/`) - Authentication, file upload, and request processing
5. **Utils** (`src/utils/`) - Utility functions for error handling, responses, and external services

### Key Features
- **JWT Authentication**: Dual token system (access + refresh tokens) with HTTP-only cookies
- **File Upload**: Multer + Cloudinary integration for image/video uploads
- **Error Handling**: Centralized error handling with custom ApiError class
- **Data Validation**: Mongoose schema validation with pre-save hooks for password hashing

### Models Schema
- **User**: Authentication, profile management, and watch history tracking
- **Video**: Video metadata, ownership, and publication status  
- **Subscription**: Many-to-many relationship for user subscriptions

### Security Implementation
- Passwords hashed using bcrypt with salt rounds of 10
- JWT tokens for stateless authentication
- Secure cookie configuration for production
- CORS configured for cross-origin requests
- File upload restrictions and validation

## Environment Variables Required

Create a `.env` file in the root directory with:
```
PORT=8000
MONGO_DB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret  
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_API_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## API Endpoints

### Authentication Routes (`/api/v1/users`)
- `POST /register` - User registration with file uploads (avatar + coverImage required)
- `POST /login` - User login with cookie-based authentication
- `POST /logout` - User logout (requires authentication)
- `POST /refresh-token` - Refresh access token

### Development Notes

#### Testing Individual Endpoints
```bash
# Test health check
curl http://localhost:8000/health

# Test user registration (requires multipart form data)
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=password123" \
  -F "fullName=Test User" \
  -F "avatar=@path/to/avatar.jpg" \
  -F "coverImage=@path/to/cover.jpg"
```

#### Known Issues to Address
- `video.model.js` line 2: Import has typo `mongoose-aagregate-paginate-v2` (should be `mongoose-aggregate-paginate-v2`)
- `video.model.js` line 41: Exports `UserSchema` instead of `VideoSchema` 
- `user.controller.js` line 327, 355: Missing `User.` prefix for `findByIdAndUpdate` calls
- `user.controller.js` line 294: Logic error in validation condition (should use `!email` not `email`)

#### File Upload Flow
1. Multer saves files temporarily to local storage
2. Cloudinary service uploads files and returns URLs
3. Local files are cleaned up after successful upload
4. Database stores only the Cloudinary URLs

#### Authentication Flow
1. Login generates both access and refresh tokens
2. Access token stored in HTTP-only cookie for security
3. Refresh token used to generate new access tokens when expired
4. Logout clears both tokens and cookies

## Database Schema Design

The application uses a relational approach within MongoDB:
- Users can own multiple videos (one-to-many)
- Users can subscribe to other users (many-to-many via Subscription model)
- Users maintain watch history (array of video references)
- Videos track ownership and metadata for the platform
