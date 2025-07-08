# Habit Tracker - HTML Interface

A modern, responsive HTML/CSS/JavaScript interface for the Habit Tracker application.

## 🚀 Features

- **Clean, Modern Design**: Beautiful gradient backgrounds and smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **User Authentication**: Secure login and registration system
- **Habit Management**: Create, edit, delete, and track habits
- **Real-time Stats**: View your habit completion statistics
- **Category Filtering**: Filter habits by category and frequency
- **Interactive UI**: Smooth transitions and user-friendly interface

## 📁 Project Structure

```
public/
├── index.html      # Main HTML file
├── styles.css      # CSS styling
└── app.js          # JavaScript functionality
```

## 🛠️ Setup Instructions

### Method 1: Using the Backend Server (Recommended)

1. **Start the backend server:**
   ```bash
   cd habit-tracker-app
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

### Method 2: Using a Development Server

1. **Install http-proxy-middleware (if not already installed):**
   ```bash
   npm install http-proxy-middleware --save-dev
   ```

2. **Start the backend server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, start the frontend server:**
   ```bash
   node dev-server.js
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### Method 3: Using Live Server (VS Code Extension)

1. **Install the Live Server extension in VS Code**

2. **Right-click on `public/index.html` and select "Open with Live Server"**

3. **Make sure your backend server is running on port 5000**

## 🎨 Design Features

### Color Scheme
- Primary: Gradient from `#667eea` to `#764ba2`
- Success: `#28a745`
- Error: `#dc3545`
- Info: `#17a2b8`
- Background: Light gray `#f8f9fa`

### Typography
- Font Family: Inter (Google Fonts)
- Modern, clean typography with proper hierarchy

### Layout
- Card-based design with subtle shadows
- Grid layouts for responsive design
- Smooth hover effects and transitions

### Icons
- Font Awesome 6.0 for consistent iconography
- Semantic icons for better user experience

## 🔧 API Integration

The interface connects to the backend API at `http://localhost:5000/api` with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Habits
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update an existing habit
- `DELETE /api/habits/:id` - Delete a habit
- `POST /api/habits/:id/complete` - Mark habit as complete

## 📱 Responsive Design

The interface is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: 480px to 767px
- **Small Mobile**: Below 480px

## 🎯 User Experience Features

### Authentication
- Form validation with real-time feedback
- Secure token-based authentication
- Remember user login state
- Smooth form transitions

### Habit Management
- Intuitive habit creation with categories
- Visual completion tracking
- Edit habits with modal interface
- Confirmation dialogs for destructive actions

### Dashboard
- Real-time statistics display
- Visual progress indicators
- Filter and search functionality
- Empty state handling

## 🔒 Security Features

- Input validation and sanitization
- XSS protection through HTML escaping
- CSRF protection via token authentication
- Rate limiting through backend

## 🚀 Performance Optimizations

- Minimal HTTP requests
- Efficient DOM manipulation
- Lazy loading of non-critical resources
- Optimized CSS and JavaScript

## 📦 Dependencies

### External Libraries
- **Font Awesome 6.0**: Icons
- **Google Fonts (Inter)**: Typography

### No Build Process Required
- Pure HTML, CSS, and JavaScript
- No bundling or compilation needed
- Easy to customize and extend

## 🎨 Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-color: #28a745;
  --error-color: #dc3545;
  --info-color: #17a2b8;
}
```

### Typography
Change the font family in `styles.css`:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Layout
Modify the grid layouts and spacing:
```css
.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend server is running on port 5000
   - Check CORS configuration in backend
   - Verify API base URL in `app.js`

2. **Login Issues**
   - Check email format validation
   - Verify password requirements
   - Check browser console for errors

3. **Responsive Issues**
   - Clear browser cache
   - Test on different devices
   - Check CSS media queries

### Debug Mode
Enable debug mode by adding to `app.js`:
```javascript
const DEBUG = true;
// Add console.log statements throughout the code
```

## 🔄 Future Enhancements

- [ ] Dark mode toggle
- [ ] Habit streaks visualization
- [ ] Export data functionality
- [ ] Habit templates
- [ ] Social sharing features
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify backend server is running
3. Check network tab in developer tools
4. Review API responses for error messages

## 🎉 Enjoy Your Habit Tracking Journey!

This HTML interface provides a clean, modern way to track your habits and build better routines. The responsive design ensures a great experience on any device, while the intuitive interface makes habit tracking enjoyable and effortless.
