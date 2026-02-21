// API Base URL - Dynamic for different environments
const getAPIURL = () => {
    // Check if user has manually set API URL in sessionStorage
    const manualURL = sessionStorage.getItem('CAMPUS_API_URL');
    if (manualURL) {
        console.log('Using manually configured API URL:', manualURL);
        return manualURL;
    }
    
    // Use relative URLs (will be proxied by Vite dev server or work directly in production)
    // This works for both localhost and preview environments
    return '';  // Empty string means use same origin
};

let API_URL = getAPIURL();

console.log('🌐 Frontend URL:', window.location.href);
console.log('🔌 API URL:', API_URL);
console.log('📍 Hostname:', window.location.hostname);

// Function to set custom API URL
function setCustomAPIURL(url) {
    sessionStorage.setItem('CAMPUS_API_URL', url);
    API_URL = url;
    console.log('✅ Custom API URL set:', url);
    window.location.reload();
}

// State Management
let currentUser = null;
let currentPage = 'landing';
let appState = {
    streak: 0,
    totalXP: 0,
    dailyMissions: [],
    lastActiveDate: null,
    notificationsEnabled: false
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Auth Status Check
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
        currentUser = { id: userId, token };
        await loadUserData();
        showPage('dashboard');
    } else {
        showPage('landing');
    }
}

// Load User Data from Backend
async function loadUserData() {
    try {
        const url = `${API_URL}/api/user/${currentUser.id}`;
        console.log('Loading user data from:', url);
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        
        console.log('User data response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('User data loaded:', data);
            appState = {
                streak: data.streak,
                totalXP: data.total_xp,
                lastActiveDate: data.last_active_date,
                notificationsEnabled: data.notifications_enabled,
                dailyMissions: data.daily_missions || []
            };
            renderPage();
        } else {
            console.error('Failed to load user data:', response.status);
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        console.log('API URL was:', API_URL);
    }
}

// Show Page
function showPage(page) {
    currentPage = page;
    renderPage();
}

// Render Page
function renderPage() {
    const app = document.getElementById('app');
    
    switch (currentPage) {
        case 'landing':
            app.innerHTML = renderLanding();
            break;
        case 'auth':
            app.innerHTML = renderAuth();
            break;
        case 'dashboard':
            app.innerHTML = renderDashboard();
            break;
        case 'settings':
            app.innerHTML = renderSettings();
            break;
        default:
            app.innerHTML = renderLanding();
    }
    
    attachEventListeners();
}

// LANDING PAGE
function renderLanding() {
    return `
        <div class="min-h-screen flex items-center justify-center px-4">
            <div class="text-center max-w-md">
                <div class="mb-8">
                    <div class="text-6xl mb-4">🎓</div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-3">Campus Life</h1>
                    <p class="text-lg text-gray-600 mb-2">Build your daily habit streak</p>
                    <p class="text-sm text-gray-500">Check in every day, level up your campus life</p>
                </div>
                
                <div class="bg-white rounded-lg p-6 shadow-sm mb-6">
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">🔥</div>
                            <p class="text-xs text-gray-600 mt-1">Streaks</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600">✨</div>
                            <p class="text-xs text-gray-600 mt-1">Missions</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-yellow-600">⭐</div>
                            <p class="text-xs text-gray-600 mt-1">XP</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600">Daily check-ins • Missions • Streaks • XP</p>
                </div>
                
                <button onclick="showPage('auth')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-3 hover:bg-blue-700 transition">
                    Start Playing
                </button>
                
                <div class="bg-gray-100 rounded-lg p-3 mt-6 text-left text-xs text-gray-600">
                    <p class="font-semibold mb-2">🔧 System Info:</p>
                    <p>Frontend: ${window.location.href}</p>
                    <p>API: ${API_URL}</p>
                    <p>Status: Check browser console (F12) for details</p>
                </div>
                
                <p class="text-xs text-gray-500 mt-4">MVP v1.0 - Stay consistent, keep the fire burning 🔥</p>
            </div>
        </div>
    `;
}

// AUTH PAGE
function renderAuth() {
    return `
        <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Join Campus Life</h2>
                    <p class="text-gray-600 mt-2">Create account or login</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div id="authForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="student@university.edu">
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input type="text" id="username" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your_username">
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" id="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••">
                        </div>
                        
                        <button onclick="handleAuth('register')" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mb-3">
                            Register
                        </button>
                        
                        <button onclick="handleAuth('login')" class="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition mb-4">
                            Login
                        </button>
                        
                        <button onclick="showPage('landing')" class="w-full text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                            Back
                        </button>
                    </div>
                    <div id="authError" class="text-red-600 text-sm mt-4"></div>
                    
                    <!-- Debug Section -->
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <p class="text-xs text-gray-500 mb-2">🔧 API Configuration</p>
                        <p class="text-xs text-gray-600 mb-2">Current: <span class="font-mono">${API_URL}</span></p>
                        <input type="text" id="customAPIURL" class="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2" placeholder="Custom API URL (optional)" value="">
                        <button onclick="setCustomAPIURL(document.getElementById('customAPIURL').value)" class="w-full bg-gray-500 text-white py-1 rounded text-sm hover:bg-gray-600 transition" style="font-size:11px">
                            Set Custom API URL
                        </button>
                        <a href="/test.html" class="block text-center text-blue-600 text-xs mt-2 hover:underline">Run Diagnostic Test</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// DASHBOARD PAGE
function renderDashboard() {
    const isCheckedInToday = isCheckedInToday();
    const missionProgress = appState.dailyMissions.filter(m => m.completed).length;
    
    return `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-8">
            <!-- Header -->
            <div class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Campus Life</h1>
                    <button onclick="showPage('settings')" class="text-gray-600 hover:text-gray-900 text-2xl">⚙️</button>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
                
                <!-- Streak Card -->
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p class="text-gray-600 text-sm mb-2">Current Streak</p>
                    <div class="flex items-center justify-center mb-4">
                        <span class="text-7xl fire-emoji">🔥</span>
                    </div>
                    <h2 class="text-5xl font-bold text-gray-900 mb-2">${appState.streak}</h2>
                    <p class="text-gray-600">${appState.streak === 1 ? 'day' : 'days'} of consistency</p>
                </div>
                
                <!-- Daily Check-In Button -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-center text-white">
                    <button 
                        onclick="handleDailyCheckIn()" 
                        ${isCheckedInToday ? 'disabled' : ''}
                        class="w-full text-2xl font-bold py-6 rounded-lg transition ${isCheckedInToday ? 'bg-blue-500 opacity-50 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 active:scale-95'}">
                        ${isCheckedInToday ? '✓ Checked In Today' : 'I Survived Today'}
                    </button>
                    <p class="text-blue-100 text-sm mt-4">+10 XP for daily check-in</p>
                </div>
                
                <!-- XP Card -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-gray-900">Total XP</h3>
                        <span class="text-3xl font-bold text-yellow-600">${appState.totalXP}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-yellow-500 h-3 rounded-full" style="width: ${Math.min((appState.totalXP / 200) * 100, 100)}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">${appState.totalXP} / 200 XP milestone</p>
                </div>
                
                <!-- Daily Missions -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-gray-900">Daily Missions</h3>
                        <span class="text-sm text-gray-600">${missionProgress}/3</span>
                    </div>
                    <div class="space-y-3">
                        ${appState.dailyMissions.map((mission, idx) => `
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" onclick="toggleMission(${idx})">
                                <input type="checkbox" ${mission.completed ? 'checked' : ''} class="w-5 h-5 text-blue-600 rounded cursor-pointer">
                                <span class="flex-1 ${mission.completed ? 'line-through text-gray-400' : 'text-gray-900'}">${mission.name}</span>
                                <span class="text-sm text-gray-500">+5 XP</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Logout Button -->
                <button onclick="handleLogout()" class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                    Logout
                </button>
            </div>
        </div>
    `;
}

// SETTINGS PAGE
function renderSettings() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-8">
            <!-- Header -->
            <div class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
                    <button onclick="showPage('dashboard')" class="text-gray-600 hover:text-gray-900 text-2xl">✕</button>
                </div>
            </div>
            
            <!-- Settings Content -->
            <div class="max-w-2xl mx-auto px-4 py-6">
                <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-semibold text-gray-900">Daily Notifications</h3>
                            <p class="text-sm text-gray-600 mt-1">Get reminded to check in daily</p>
                        </div>
                        <button 
                            onclick="toggleNotifications()"
                            class="w-14 h-8 rounded-full transition ${appState.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'} relative">
                            <div class="w-6 h-6 bg-white rounded-full absolute top-1 transition ${appState.notificationsEnabled ? 'right-1' : 'left-1'}"></div>
                        </button>
                    </div>
                    
                    <hr class="my-4">
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-3">About</h3>
                        <p class="text-sm text-gray-600">Campus Life MVP v1.0</p>
                        <p class="text-xs text-gray-500 mt-2">A minimal daily habit game for university students</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper Functions
function isCheckedInToday() {
    if (!appState.lastActiveDate) return false;
    const lastDate = new Date(appState.lastActiveDate).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
}

// Event Handlers
async function handleAuth(type) {
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('authError');
    
    if (!email || !username || !password) {
        errorDiv.textContent = 'All fields are required';
        return;
    }
    
    try {
        const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
        const url = `${API_URL}${endpoint}`;
        console.log('Auth request to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });
        
        console.log('Auth response status:', response.status);
        const data = await response.json();
        console.log('Auth response data:', data);
        
        if (!response.ok) {
            errorDiv.textContent = data.error || `Authentication failed (${response.status})`;
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        currentUser = { id: data.userId, token: data.token };
        
        await loadUserData();
        showPage('dashboard');
    } catch (error) {
        const errorMsg = `Network error: ${error.message}. API URL: ${API_URL}`;
        errorDiv.textContent = errorMsg;
        console.error('Auth error:', error);
        console.log('Tried API URL:', API_URL);
    }
}

async function handleDailyCheckIn() {
    try {
        const response = await fetch(`${API_URL}/api/checkin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            const data = await response.json();
            appState.streak = data.streak;
            appState.totalXP = data.total_xp;
            appState.lastActiveDate = data.last_active_date;
            renderPage();
            
            // Request notification permission if not already given
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    } catch (error) {
        console.error('Check-in error:', error);
    }
}

async function toggleMission(idx) {
    const mission = appState.dailyMissions[idx];
    try {
        const response = await fetch(`${API_URL}/api/mission/${mission.id}/toggle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            const data = await response.json();
            appState.totalXP = data.total_xp;
            appState.dailyMissions[idx].completed = !mission.completed;
            renderPage();
        }
    } catch (error) {
        console.error('Mission toggle error:', error);
    }
}

async function toggleNotifications() {
    try {
        appState.notificationsEnabled = !appState.notificationsEnabled;
        
        await fetch(`${API_URL}/api/user/${currentUser.id}/notifications`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled: appState.notificationsEnabled })
        });
        
        if (appState.notificationsEnabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        renderPage();
    } catch (error) {
        console.error('Notification toggle error:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    currentUser = null;
    showPage('landing');
}

// Attach Event Listeners
function attachEventListeners() {
    // Add any additional event listeners here if needed
}