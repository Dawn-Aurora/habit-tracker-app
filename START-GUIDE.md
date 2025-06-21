# 🚀 Habit Tracker App - Startup Guide

## ⚠️ IMPORTANT: PowerShell vs Bash Differences

**PowerShell does NOT support `&&` operator like bash!**

❌ **This won't work in PowerShell:**
```bash
npm install && npm start
```

✅ **Use this instead in PowerShell:**
```powershell
npm install
if ($LASTEXITCODE -eq 0) { npm start }
```

## 🔥 Quick Start (2 Terminals Required)

### Terminal 1: Backend Server
```powershell
cd "C:\Users\SkydioFlyer\OneDrive - Le Quy Don Studio\Desktop\habit-tracker-app"
.\start-server.ps1
```

### Terminal 2: Frontend Development Server
```powershell
cd "C:\Users\SkydioFlyer\OneDrive - Le Quy Don Studio\Desktop\habit-tracker-app\habit-tracker-frontend"
npm start
```

## 📋 Step-by-Step Instructions

### 1. Start Backend First (Terminal 1)
1. Open PowerShell or Command Prompt
2. Navigate to the main project directory:
   ```powershell
   cd "C:\Users\SkydioFlyer\OneDrive - Le Quy Don Studio\Desktop\habit-tracker-app"
   ```
3. Run the backend startup script:
   ```powershell
   .\start-server.ps1
   ```
4. **Wait for this message:** `Server running on port 5000`
5. **Keep this terminal open!** The backend server must stay running.

### 2. Start Frontend (New Terminal 2)
1. Open a **NEW** PowerShell/Command Prompt window
2. Navigate to the frontend directory:
   ```powershell
   cd "C:\Users\SkydioFlyer\OneDrive - Le Quy Don Studio\Desktop\habit-tracker-app\habit-tracker-frontend"
   ```
3. Install dependencies (if first time):
   ```powershell
   npm install
   ```
4. Start the development server:
   ```powershell
   npm start
   ```
5. **Wait for the browser to automatically open** or go to: http://localhost:3000

## 🌐 Access URLs

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Test Page**: Opens automatically when backend starts

## 🔧 Testing the Frontend UI

### Basic Functionality Test:
1. ✅ **Add a New Habit**: Click "Add Habit" and fill in the form
2. ✅ **View Habits**: See your habits displayed in cards
3. ✅ **Mark Complete**: Click "Mark Complete" on any habit
4. ✅ **Edit Habit**: Click "Edit" button to modify a habit
5. ✅ **Add Notes**: Click "Add Note" to add comments
6. ✅ **View Metrics**: Click "View Metrics" to see statistics
7. ✅ **Delete Habit**: Click "Delete" to remove a habit

### Advanced Features:
- **Tags System**: Add tags to organize habits (comma-separated)
- **Expected Frequency**: Set how often you want to do the habit
- **Start Date**: Set when you started the habit
- **Completion History**: See recent completions and total count
- **Notes System**: Add context and progress notes

## 🐛 Troubleshooting

### Backend Won't Start:
1. Check if port 5000 is in use:
   ```powershell
   netstat -ano | findstr ":5000"
   ```
2. If something is using port 5000, the script should kill it automatically
3. Try manually stopping and restarting:
   ```powershell
   # Stop any running processes
   taskkill /F /IM node.exe
   # Then restart
   .\start-server.ps1
   ```

### Frontend Won't Start:
1. Make sure backend is running first
2. Check if port 3000 is free:
   ```powershell
   netstat -ano | findstr ":3000"
   ```
3. Clear npm cache and reinstall:
   ```powershell
   npm cache clean --force
   npm install
   npm start
   ```

### API Connection Issues:
1. Verify backend is running: http://localhost:5000/habits
2. Check browser console for CORS errors
3. Ensure both servers are running simultaneously

## 📱 Frontend Features Available

### Main Components:
- **HabitList**: Displays all habits with modern card layout
- **AddHabitForm**: Create new habits with tags, frequency, etc.
- **EditHabitForm**: Modify existing habits in modal overlay
- **AddNoteForm**: Add notes to habits for context
- **MetricsView**: View statistics and completion rates

### UI Features:
- ✨ Modern, responsive design
- 🏷️ Color-coded tags for organization
- 📊 Completion statistics and streaks
- 📝 Notes system for tracking progress
- 📅 Date tracking for habits and completions
- 🎯 Expected frequency tracking

## 🚀 Build for Production

### Frontend Build:
```powershell
cd habit-tracker-frontend
npm run build
```

### Backend Build:
```powershell
npm run build
```

## 💡 Pro Tips

1. **Always start backend first** - Frontend needs API connection
2. **Keep both terminals open** - Both servers need to run simultaneously
3. **Use Chrome DevTools** - F12 for debugging and network inspection
4. **Check browser console** - Look for API errors or warnings
5. **Test with mock data** - Backend falls back to mock data if SharePoint fails

## 🔄 PowerShell Command Alternatives

Since PowerShell doesn't support `&&`, use these patterns:

```powershell
# Instead of: command1 && command2
command1
if ($LASTEXITCODE -eq 0) { command2 }

# Or use separate lines:
command1
command2

# For multiple commands:
$commands = @("npm install", "npm test", "npm start")
foreach ($cmd in $commands) {
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) { break }
}
```

---

## 📞 Need Help?

If you encounter issues:
1. Check both terminals are running
2. Verify URLs are accessible
3. Look at browser console for errors
4. Check the troubleshooting section above

**Happy habit tracking! 🎯**
