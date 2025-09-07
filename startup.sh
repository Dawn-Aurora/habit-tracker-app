echo "Starting Habit Tracker Backend on Linux..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build:backend
fi

echo "Starting application from dist/app.js..."
exec node dist/app.js
