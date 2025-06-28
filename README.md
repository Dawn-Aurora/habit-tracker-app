# Habit Tracker App

## 🚀 Features

- **Habit Management**: Create, edit, and delete habits with customizable frequencies
- **Progress Tracking**: Mark habits as complete and track your streaks
- **Analytics Dashboard**: Visualize your progress with completion rates and statistics
- **Enhanced UI Components**: Modern, responsive interface with intuitive controls
- **RESTful API**: Well-documented backend API with comprehensive testing
- **Frequency System**: Set habits for daily, weekly, monthly, or yearly goals

## 🏗️ Project Structure (Monorepo)

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

## 🛠️ Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for API server
- **Jest** for testing
- **SharePoint integration** (configured)

### Frontend
- **React** with modern hooks
- **Responsive CSS** design
- **Axios** for API communication
- **Jest** for testing

## 🚀 Quick Start

### ⚠️ IMPORTANT: Windows PowerShell Users
**PowerShell does NOT support `&&` operator!** Use separate commands or see `START-GUIDE.md` for detailed instructions.

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

📖 **For detailed startup instructions, see `START-GUIDE.md`**

## Overview
The Habit Tracker App is a web application designed to help users track their habits effectively. Users can add, remove, and manage their habits, making it easier to stay on top of their goals.

## Features
- Add new habits
- Remove existing habits
- Mark habits as completed
- View a list of all habits
- Persistent storage with SharePoint integration
- Mock data fallback for local development or SharePoint outages

## Technologies Used
- **Backend**: TypeScript, Express.js, Node.js
- **Frontend**: React, Modern CSS, Axios
- **Testing**: Jest for both backend and frontend
- **Integration**: Microsoft Graph API (SharePoint)
- **Architecture**: Full-stack monorepo structure

## Project Structure (Updated)
The project is organized as a monorepo with clear separation between backend and frontend:

```
habit-tracker-app/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── app.ts          # Express app configuration and middleware
│   │   ├── server.ts       # Main entry point - starts the HTTP server
│   │   ├── components/
│   │   │   └── HabitList.ts # Manages the display and interaction of habits
│   │   ├── models/
│   │   │   └── Habit.ts    # Represents a habit
│   │   ├── routes/
│   │   │   └── habitRoutes.ts # Defines routes related to habits
│   │   ├── controllers/
│   │   │   └── habitController.ts # Manages the logic for handling habits
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── mockDataClient.ts # In-memory mock data for development/testing
│   │   ├── sharepointClient.ts # Handles SharePoint integration
│   │   ├── types/
│   │   │   └── index.ts    # Defines interfaces for habit objects
│   │   └── __tests__/      # Backend test files
│   └── dist/               # Compiled JavaScript output
├── habit-tracker-frontend/ # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── EnhancedAddHabitForm.js
│   │   │   ├── EnhancedHabitList.js
│   │   │   ├── AnalyticsDashboard.js
│   │   │   └── ... (other components)
│   │   ├── api.js          # API client for backend communication
│   │   └── App.js          # Main app component
│   ├── public/             # Static assets
│   └── build/              # Production build output
├── package.json            # Root package.json
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

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
```

- If `DATA_CLIENT=mock`, the app uses in-memory mock data.
- If `DATA_CLIENT=sharepoint`, the app connects to SharePoint via Microsoft Graph API.

> **Never commit your `.env` file or any credentials to your repository.**
> All environment variables should be set in your deployment platform or local `.env` file (which is gitignored).

## API Endpoints
- `GET    /habits`         - List all habits
- `POST   /habits`         - Create a new habit
- `GET    /habits/:id`     - Get a habit by ID
- `PUT    /habits/:id`     - Update a habit
- `DELETE /habits/:id`     - Delete a habit

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

## Deployment
### Backend (Render.com)
- Push your code to GitHub.
- Create a new Web Service on [Render.com](https://render.com) and connect your repo.
- Set build command: `npm install && npm run build`
- Set start command: `npm start`
- Add environment variables in the Render dashboard as above.

### Frontend (Vercel)
- Push your frontend code (in `habit-tracker-frontend/`) to GitHub.
- Import the repo into [Vercel](https://vercel.com).
- Set build command: `npm run build`
- Set output directory: `build`
- Add environment variable: `REACT_APP_API_URL=https://<your-backend-on-render>.onrender.com`

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