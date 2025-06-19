# Habit Tracker API Testing Guide

## Overview
This guide shows how to test the Habit Tracker API functionality using either the command line or a browser interface.

## Starting the API Server

1. Open a terminal in the root directory of the project
2. Run the server using:
   ```
   .\start-server.ps1
   ```

## Testing the API

### Using the Browser Interface

1. After starting the server, open `test-api.html` in your browser:
   - From project root: `.\test-api.html`
   - From frontend's public folder: `.\habit-tracker-frontend\public\test-api.html`

2. The browser interface provides buttons to:
   - View API information
   - Get all habits
   - Create a new habit
   - Update an existing habit
   - Delete a habit

### Using the Terminal

Run the test script to test all API endpoints:
```
.\test-endpoints.ps1
```

### Manual API Testing

You can also test the API manually using `curl` commands:

1. Get API information:
   ```
   curl http://localhost:5000
   ```

2. Get all habits:
   ```
   curl http://localhost:5000/habits
   ```

3. Create a new habit:
   ```
   curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"New Habit\"}" http://localhost:5000/habits
   ```

4. Update a habit (replace {id} with the actual habit ID):
   ```
   curl -X PUT -H "Content-Type: application/json" -d "{\"name\":\"Updated Habit\",\"completedDates\":[\"2025-06-15\"]}" http://localhost:5000/habits/{id}
   ```

5. Delete a habit (replace {id} with the actual habit ID):
   ```
   curl -X DELETE http://localhost:5000/habits/{id}
   ```

## API Endpoints

- `GET /` - API information page
- `GET /habits` - List all habits
- `POST /habits` - Create a new habit
- `PUT /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit

## Troubleshooting

If you see only the initial "API is working" message in your browser, make sure you're accessing:
- The correct endpoint: `http://localhost:5000/habits` (not just `http://localhost:5000`)
- Try using the test-api.html interface which provides a better testing experience
