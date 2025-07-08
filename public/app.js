// Global variables
let currentUser = null;
let authToken = null;
let habits = [];
let currentEditingHabit = null;

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM elements
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const loading = document.getElementById('loading');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
function initializeApp() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainApp();
        loadHabits();
    } else {
        showAuthSection();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth form switching
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Auth form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Main app event listeners
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('toggle-add-form').addEventListener('click', toggleAddHabitForm);
    document.getElementById('cancel-add').addEventListener('click', hideAddHabitForm);
    document.getElementById('habitForm').addEventListener('submit', handleAddHabit);
    
    // Filter controls
    document.getElementById('filter-category').addEventListener('change', filterHabits);
    document.getElementById('filter-frequency').addEventListener('change', filterHabits);
    
    // Edit modal
    document.getElementById('close-edit-modal').addEventListener('click', hideEditModal);
    document.getElementById('cancel-edit').addEventListener('click', hideEditModal);
    document.getElementById('editHabitForm').addEventListener('submit', handleEditHabit);
}

// Authentication functions
function showAuthSection() {
    authSection.classList.remove('hidden');
    mainApp.classList.add('hidden');
    loading.classList.add('hidden');
}

function showMainApp() {
    authSection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    loading.classList.add('hidden');
    
    if (currentUser) {
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name || currentUser.email}!`;
    }
}

function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            // Save to localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showAlert('Login successful!', 'success');
            showMainApp();
            loadHabits();
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed. Please try again.', 'error');
    }
    
    hideLoading();
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registration successful! Please log in.', 'success');
            showLoginForm();
            
            // Clear register form
            document.getElementById('registerForm').reset();
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Registration failed. Please try again.', 'error');
    }
    
    hideLoading();
}

// Handle logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    habits = [];
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    showAlert('Logged out successfully', 'info');
    showAuthSection();
    showLoginForm();
}

// Habit management functions
async function loadHabits() {
    if (!authToken) return;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/habits`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            habits = await response.json();
            renderHabits();
            updateStats();
        } else {
            showAlert('Failed to load habits', 'error');
        }
    } catch (error) {
        console.error('Error loading habits:', error);
        showAlert('Failed to load habits', 'error');
    }
    
    hideLoading();
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    const noHabits = document.getElementById('no-habits');
    
    if (habits.length === 0) {
        container.innerHTML = '';
        noHabits.classList.remove('hidden');
        return;
    }
    
    noHabits.classList.add('hidden');
    
    container.innerHTML = habits.map(habit => `
        <div class="habit-card ${habit.completed ? 'completed' : ''}" data-id="${habit.id}">
            <div class="habit-header">
                <div>
                    <div class="habit-title">${escapeHtml(habit.name)}</div>
                    ${habit.description ? `<div class="habit-description">${escapeHtml(habit.description)}</div>` : ''}
                </div>
            </div>
            <div class="habit-meta">
                <span class="habit-tag frequency">${habit.frequency}</span>
                <span class="habit-tag category">${habit.category || 'other'}</span>
            </div>
            <div class="habit-actions">
                ${habit.completed ? 
                    '<button class="btn btn-completed" disabled><i class="fas fa-check"></i> Completed</button>' :
                    '<button class="btn btn-complete" onclick="markHabitComplete(\'' + habit.id + '\')"><i class="fas fa-check"></i> Complete</button>'
                }
                <button class="btn btn-edit" onclick="editHabit('${habit.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-delete" onclick="deleteHabit('${habit.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => habit.completed).length;
    const successRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    document.getElementById('total-habits').textContent = totalHabits;
    document.getElementById('completed-today').textContent = completedToday;
    document.getElementById('success-rate').textContent = `${successRate}%`;
    
    // For streak calculation, we'd need more data from the backend
    // For now, we'll show a placeholder
    document.getElementById('current-streak').textContent = '0';
}

function toggleAddHabitForm() {
    const form = document.getElementById('add-habit-form');
    form.classList.toggle('hidden');
    
    if (!form.classList.contains('hidden')) {
        document.getElementById('habitName').focus();
    }
}

function hideAddHabitForm() {
    document.getElementById('add-habit-form').classList.add('hidden');
    document.getElementById('habitForm').reset();
}

async function handleAddHabit(e) {
    e.preventDefault();
    
    const name = document.getElementById('habitName').value.trim();
    const description = document.getElementById('habitDescription').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    const category = document.getElementById('habitCategory').value;
    
    if (!name) {
        showAlert('Please enter a habit name', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/habits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                frequency,
                category
            })
        });
        
        if (response.ok) {
            const newHabit = await response.json();
            habits.push(newHabit);
            renderHabits();
            updateStats();
            hideAddHabitForm();
            showAlert('Habit added successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to add habit', 'error');
        }
    } catch (error) {
        console.error('Error adding habit:', error);
        showAlert('Failed to add habit', 'error');
    }
    
    hideLoading();
}

async function markHabitComplete(habitId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const habit = habits.find(h => h.id === habitId);
            if (habit) {
                habit.completed = true;
                renderHabits();
                updateStats();
                showAlert('Habit marked as complete!', 'success');
            }
        } else {
            showAlert('Failed to mark habit as complete', 'error');
        }
    } catch (error) {
        console.error('Error completing habit:', error);
        showAlert('Failed to mark habit as complete', 'error');
    }
    
    hideLoading();
}

function editHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    currentEditingHabit = habit;
    
    document.getElementById('editHabitName').value = habit.name;
    document.getElementById('editHabitDescription').value = habit.description || '';
    document.getElementById('editHabitFrequency').value = habit.frequency;
    document.getElementById('editHabitCategory').value = habit.category || 'other';
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function hideEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    currentEditingHabit = null;
}

async function handleEditHabit(e) {
    e.preventDefault();
    
    if (!currentEditingHabit) return;
    
    const name = document.getElementById('editHabitName').value.trim();
    const description = document.getElementById('editHabitDescription').value.trim();
    const frequency = document.getElementById('editHabitFrequency').value;
    const category = document.getElementById('editHabitCategory').value;
    
    if (!name) {
        showAlert('Please enter a habit name', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/habits/${currentEditingHabit.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                frequency,
                category
            })
        });
        
        if (response.ok) {
            const updatedHabit = await response.json();
            const index = habits.findIndex(h => h.id === currentEditingHabit.id);
            if (index !== -1) {
                habits[index] = updatedHabit;
                renderHabits();
                updateStats();
                hideEditModal();
                showAlert('Habit updated successfully!', 'success');
            }
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to update habit', 'error');
        }
    } catch (error) {
        console.error('Error updating habit:', error);
        showAlert('Failed to update habit', 'error');
    }
    
    hideLoading();
}

async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            habits = habits.filter(h => h.id !== habitId);
            renderHabits();
            updateStats();
            showAlert('Habit deleted successfully!', 'success');
        } else {
            showAlert('Failed to delete habit', 'error');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
        showAlert('Failed to delete habit', 'error');
    }
    
    hideLoading();
}

function filterHabits() {
    const categoryFilter = document.getElementById('filter-category').value;
    const frequencyFilter = document.getElementById('filter-frequency').value;
    
    let filteredHabits = habits;
    
    if (categoryFilter) {
        filteredHabits = filteredHabits.filter(habit => habit.category === categoryFilter);
    }
    
    if (frequencyFilter) {
        filteredHabits = filteredHabits.filter(habit => habit.frequency === frequencyFilter);
    }
    
    const container = document.getElementById('habits-container');
    const noHabits = document.getElementById('no-habits');
    
    if (filteredHabits.length === 0) {
        container.innerHTML = '';
        noHabits.classList.remove('hidden');
        return;
    }
    
    noHabits.classList.add('hidden');
    
    container.innerHTML = filteredHabits.map(habit => `
        <div class="habit-card ${habit.completed ? 'completed' : ''}" data-id="${habit.id}">
            <div class="habit-header">
                <div>
                    <div class="habit-title">${escapeHtml(habit.name)}</div>
                    ${habit.description ? `<div class="habit-description">${escapeHtml(habit.description)}</div>` : ''}
                </div>
            </div>
            <div class="habit-meta">
                <span class="habit-tag frequency">${habit.frequency}</span>
                <span class="habit-tag category">${habit.category || 'other'}</span>
            </div>
            <div class="habit-actions">
                ${habit.completed ? 
                    '<button class="btn btn-completed" disabled><i class="fas fa-check"></i> Completed</button>' :
                    '<button class="btn btn-complete" onclick="markHabitComplete(\'' + habit.id + '\')"><i class="fas fa-check"></i> Complete</button>'
                }
                <button class="btn btn-edit" onclick="editHabit('${habit.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-delete" onclick="deleteHabit('${habit.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `alert alert-${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-triangle' : 
                 'fas fa-info-circle';
    
    alertElement.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        hideEditModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideEditModal();
    }
});
