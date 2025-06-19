# Habit Tracker App

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
- TypeScript
- Express.js
- Node.js
- Microsoft Graph API (SharePoint integration)

## Project Structure
```
habit-tracker-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── components
│   │   └── HabitList.ts      # Manages the display and interaction of habits
│   ├── models
│   │   └── Habit.ts          # Represents a habit
│   ├── routes
│   │   └── habitRoutes.ts    # Defines routes related to habits
│   ├── controllers
│   │   └── habitController.ts # Manages the logic for handling habits
│   ├── mockDataClient.ts     # In-memory mock data for development/testing
│   ├── sharepointClient.ts   # Handles SharePoint integration
│   └── types
│       └── index.ts          # Defines interfaces for habit objects
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Environment Variables & Configuration
Create a `.env` file in the project root with the following variables:
```
PORT=5000
DATA_CLIENT=sharepoint   # Use 'mock' for local development or testing
# SharePoint credentials (required if using SharePoint)
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
SITE_ID=your-site-id
LIST_ID=your-list-id
```

- If `DATA_CLIENT=mock`, the app uses in-memory mock data.
- If `DATA_CLIENT=sharepoint`, the app connects to SharePoint via Microsoft Graph API.

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

- **start-server.ps1**: PowerShell script to automate local development. It:
  - Kills any process using port 5000 (to avoid port conflicts)
  - Opens the API test page in your browser
  - Starts the backend server
  - Provides user-friendly output and instructions

- **test-endpoints.ps1**: PowerShell script to automatically test all backend API endpoints (GET, POST, PUT, DELETE for /habits). It:
  - Sends requests to your local backend server
  - Checks for correct responses and validation errors
  - Verifies basic CRUD functionality

These scripts are recommended for starting, testing, and verifying the backend locally on Windows.

## Contribution Guidelines
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License
This project is licensed under the MIT License.