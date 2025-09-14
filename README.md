#Habit Tracker App

A **production-ready** full-stack habit tracking application with enterprise-grade SharePoint integration and professional user experience.

## Live Demo

**Frontend**: [Live on Azure](https://your-app-url.azurestaticapps.net) 
**Backend API**: Deployed with Azure trust proxy configuration

## Features

### **Core Functionality**
- **Habit Management**: Create, edit, and delete habits with customizable frequencies
- **Progress Tracking**: Mark habits as complete and track your streaks  
- **Analytics Dashboard**: Visualize your progress with completion rates and statistics
- **Note Taking**: Add personal notes to your habits for reflection
- **Calendar View**: Visual calendar interface for tracking completions

### **Enterprise-Ready Security**
- **User Authentication**: Secure JWT-based registration and login system
- **SharePoint Integration**: Professional cloud data storage with Microsoft SharePoint
- **Trust Proxy Configuration**: Azure-optimized rate limiting and security
- **Environment Validation**: Centralized configuration with credential verification

### **Professional User Experience** 
- **Enhanced Error Handling**: User-friendly error messages with intelligent categorization
- **Toast Notifications**: Professional notification system with auto-dismiss functionality
- **Loading States**: Smooth loading components for better perceived performance
- **Duplicate Prevention**: Proactive duplicate habit detection with user guidance
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

### **Production-Ready Architecture**
- **RESTful API**: Well-documented backend API with comprehensive testing
- **TypeScript**: Full type safety with modern development practices  
- **Centralized Logging**: Environment-aware debug output for production monitoring
- **Error Recovery**: Automatic retry logic for transient failures

## Project Structure (Monorepo)

```
habit-tracker-app/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── __tests__/      # Backend tests
│   └── dist/               # Compiled JavaScript
├── habit-tracker-frontend/ # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.js          # API client
│   │   └── App.js          # Main app component
│   ├── public/             # Static assets
│   └── build/              # Production build
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
└── README.md               # This file
```

## Technology Stack

### Backend
- **Node.js** with **TypeScript** for type safety
- **Express.js** with trust proxy configuration for Azure
- **Centralized Configuration** system with environment validation
- **Enhanced SharePoint Integration** with duplicate detection
- **Production Logging** with environment-aware output
- **JWT Authentication** with secure token management
- **Jest** for comprehensive testing

### Frontend  
- **React** with modern hooks and best practices
- **Enhanced Error Handling** with user-friendly messages
- **Professional Notifications** system with toast alerts
- **Loading Components** for better user experience
- **Responsive CSS** design for all devices
- **Axios** for robust API communication
- **Jest** for component and integration testing

### Production Features
- **Security**: Azure trust proxy, environment validation, secure JWT
- **UX/UI**: Toast notifications, loading states, error recovery
- **Performance**: Optimized builds, efficient API calls, smart caching  
- **Reliability**: Duplicate prevention, retry logic, graceful fallbacks
- **Monitoring**: Centralized logging, error tracking, debug modes

## Quick Start

### Start the Application (2 Steps):

#### 1. Start Backend (Terminal 1):
```powershell
.\start-server.ps1
```

#### 2. Start Frontend (NEW Terminal 2):
```powershell
.\start-frontend.ps1
```
**OR**
```powershell
cd habit-tracker-frontend
npm start
```

#### Access URLs:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

**For detailed startup instructions, see `START-GUIDE.md`**

## Recent Production Enhancements (Latest Release)

### **Infrastructure & Security**
- **Azure Trust Proxy**: Fixed Express rate limiting warnings with proper Azure configuration
- **Centralized Configuration**: Environment validation, credential checking, and secure config management
- **Enhanced SharePoint Integration**: Proactive duplicate detection and user-friendly error handling

### **Professional User Experience**
- **Enhanced Error Utilities**: Intelligent error categorization with retry logic and user guidance
- **Toast Notification System**: Professional notifications with auto-dismiss and error handling
- **Loading Components**: Smooth loading states for better perceived performance
- **Duplicate Prevention**: Smart habit duplicate detection with helpful user prompts

### **Code Quality & Monitoring**
- **Production Logging**: Environment-aware debug output with security-conscious production builds
- **TypeScript Enhancements**: Improved type safety and modern development practices
- **React Best Practices**: Fixed ESLint warnings and optimized component dependencies
- **Clean Architecture**: Removed debug console statements and implemented proper error boundaries

## Core Features

- **Smart Habit Management**: Create, edit, and delete habits with intelligent duplicate prevention
- **Progress Tracking**: Mark habits complete with visual feedback and streak tracking
- **Advanced Analytics**: Comprehensive dashboard with completion rates and progress visualization
- **Personal Notes**: Add reflective notes with enhanced editing experience
- **Calendar Integration**: Visual calendar interface with improved loading states
- **Enterprise Authentication**: Secure JWT-based user system with professional error handling
- **Reliable Data Storage**: SharePoint integration with automatic fallback and retry logic
- **Cross-Platform Design**: Responsive interface optimized for all devices and screen sizes

## Technologies Used
- **Backend**: TypeScript, Express.js, Node.js
- **Frontend**: React, Modern CSS, Axios
- **Testing**: Jest for both backend and frontend
- **Integration**: Microsoft Graph API (SharePoint)
- **Architecture**: Full-stack monorepo structure

## Enhanced Project Structure

The project is organized as a monorepo with production-ready architecture:

```text
habit-tracker-app/
├── backend/                 # Production-Ready Backend
│   ├── src/
│   │   ├── app.ts          # Express app with trust proxy & centralized config
│   │   ├── server.ts       # Main entry point with production logging
│   │   ├── config/         # Centralized Configuration System
│   │   │   └── index.ts    # Environment validation & credential management
│   │   ├── utils/          # Enhanced Utilities
│   │   │   └── logger.ts   # Environment-aware production logging
│   │   ├── components/
│   │   │   └── HabitList.ts # Habit display with enhanced error handling
│   │   ├── models/
│   │   │   ├── Habit.ts    # Habit data model with validation
│   │   │   └── User.ts     # User authentication model
│   │   ├── routes/
│   │   │   ├── habitRoutes.ts # Habit CRUD operations
│   │   │   └── authRoutes.ts  # JWT authentication routes
│   │   ├── controllers/
│   │   │   ├── habitController.ts # Enhanced with error handling
│   │   │   └── userController.ts  # User management logic
│   │   ├── middleware/
│   │   │   └── auth.ts     # JWT authentication middleware  
│   │   ├── mockDataClient.ts # Development/testing data client
│   │   ├── sharepointClient.ts # Enhanced SharePoint with duplicates
│   │   ├── types/
│   │   │   └── index.ts    # TypeScript interfaces & types
│   │   └── __tests__/      # Comprehensive test suite
│   └── dist/               # Compiled production JavaScript
├── habit-tracker-frontend/ # Enhanced React Frontend  
│   ├── src/
│   │   ├── components/     # Professional React Components
│   │   │   ├── NotificationCenter.js # Toast notification system
│   │   │   ├── LoadingComponents.js  # Professional loading states
│   │   │   ├── EnhancedAddHabitForm.js # Smart form with validation
│   │   │   ├── EnhancedHabitList.js    # Optimized habit display
│   │   │   ├── AnalyticsDashboard.js   # Progress visualization
│   │   │   └── ... (30+ components)
│   │   ├── utils/          # Enhanced Utilities
│   │   │   └── errorUtils.js # User-friendly error handling & retry logic
│   │   ├── api.js          # Robust API client with error handling
│   │   └── App.js          # Main app with notifications & error boundaries
│   ├── public/             # Static assets & PWA configuration
│   └── build/              # Optimized production build
├── archive/                # Session documentation & task tracking
├── package.json            # Root dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── staticwebapp.config.json # Azure Static Web Apps configuration  
└── README.md               # This comprehensive documentation
```

### **New Production Files Added**
- `backend/src/config/index.ts` - Centralized environment & credential management
- `backend/src/utils/logger.ts` - Production-ready logging system  
- `frontend/src/components/NotificationCenter.js` - Professional toast notifications
- `frontend/src/components/LoadingComponents.js` - Enhanced loading UX
- `frontend/src/utils/errorUtils.js` - Intelligent error handling utilities

## Environment Variables & Configuration
Create a `.env` file in the project root with the following variables:
```
PORT=5000
DATA_CLIENT=sharepoint   # Use 'mock' for local development or testing
# SharePoint credentials (required if using SharePoint)
SHAREPOINT_TENANT_ID=your-tenant-id
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
SHAREPOINT_SITE_ID=your-site-id
SHAREPOINT_LIST_ID=your-list-id
SHAREPOINT_USERS_LIST_ID=your-users-list-id
JWT_SECRET=strong-random-secret
JWT_EXPIRES_IN=7d
```

- If `DATA_CLIENT=mock`, the app uses in-memory mock data.
- If `DATA_CLIENT=sharepoint`, the app connects to SharePoint via Microsoft Graph API.

> **Never commit your `.env` file or any credentials to your repository.**
> All environment variables should be set in your deployment platform or local `.env` file (which is gitignored).

### Users List Provisioning (Migration Note)
Create a separate SharePoint list named `Users` (or similar). Capture its list ID and set `SHAREPOINT_USERS_LIST_ID`.

Recommended columns (internal names shown):
- Title (default) – store email if `Email` column absent
- Email (Single line of text) – optional, improves filtering
- FirstName (Single line of text) – optional
- LastName (Single line of text) – optional
- HashedPassword (Multiple lines of text or Single line) – optional
- CreatedDate (Date/Time) – optional (system Created is already available)

The backend auto-detects which columns exist and gracefully falls back to only using `Title` if the others are missing.

## API Endpoints
- `POST   /api/auth/register`  - Register user
- `POST   /api/auth/login`     - Login user
- `GET    /api/auth/self`      - Validate token & return decoded payload
- `GET    /api/auth/profile`   - (In-memory profile retrieval; enhanced persistence WIP)
- `PUT    /api/auth/profile`   - Update profile (mock mode currently)
- `GET    /habits`             - List all habits
- `POST   /habits`             - Create a new habit
- `GET    /habits/:id`         - Get a habit by ID
- `PUT    /habits/:id`         - Update a habit
- `DELETE /habits/:id`         - Delete a habit

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd habit-tracker-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Build the project:
   ```
   npm run build
   ```
5. Start the application:
   ```
   npm start
   ```

## SharePoint Integration
- The backend integrates with SharePoint using Microsoft Graph API.
- Ensure your Azure AD app is configured and the credentials are set in `.env`.
- If SharePoint is unavailable or for local development, set `DATA_CLIENT=mock` to use in-memory data.

## Deployment (Production-Ready)

### **Currently Deployed on Azure** 
This application is **production-ready** and deployed on **Azure Static Web Apps** with:
- **Trust Proxy Configuration**: Proper Azure rate limiting and security
- **Centralized Environment Management**: Secure credential validation
- **Enhanced Error Handling**: Professional user experience with notifications
- **Production Logging**: Environment-aware debug output for monitoring

### **Alternative Deployment Options**

#### Backend (Node.js Hosting)
- **Render.com, Railway, or Heroku**
- Push your code to GitHub  
- Set build command: `npm install && npm run build`
- Set start command: `npm start`
- **Required Environment Variables**: See configuration section above
- **Trust Proxy**: Already configured for cloud environments

#### Frontend (Static Site Hosting)  
- **Vercel, Netlify, or Azure Static Web Apps**
- Build from `habit-tracker-frontend/` directory
- Set build command: `npm run build` 
- Set output directory: `build`
- Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`

### **Production Configuration**
The app includes production-ready features:
- **Azure Trust Proxy**: `app.set('trust proxy', true)` for proper rate limiting
- **Environment Validation**: Automatic credential checking on startup  
- **Error Recovery**: Automatic retry logic for transient failures
- **Security Headers**: CORS and JWT token validation
- **Performance**: Optimized builds and efficient API calls

## Usage
Once the application is running, you can access the API via your browser or API client. Use the provided endpoints to interact with your habits.

## Local Development Scripts

- **start-server.ps1**: PowerShell script to automate backend development. It:
  - Kills any process using port 5000 (to avoid port conflicts)
  - Starts the backend server using `npm start` (now correctly runs `src/server.ts`)
  - Opens the API test page in your browser
  - Provides user-friendly output and instructions

- **start-frontend.ps1**: PowerShell script to start the frontend development server. It:
  - Navigates to the frontend directory
  - Starts the React development server
  - Opens the app in your browser
  - Clean output without PowerShell warnings

- **test-endpoints.ps1**: PowerShell script to automatically test all backend API endpoints (GET, POST, PUT, DELETE for /habits). It:
  - Sends requests to your local backend server
  - Checks for correct responses and validation errors
  - Verifies basic CRUD functionality

These scripts are optimized for Windows PowerShell and provide reliable startup for both backend and frontend servers.

## Contribution Guidelines
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License
This project is licensed under the MIT License.

## Credits
This project is partially built with help from GitHub Copilot.
