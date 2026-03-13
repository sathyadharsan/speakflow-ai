import API_BASE_URL from './api.js';

// API Configuration
const API_BASE = `${API_BASE_URL}/api`;

// State Management
const state = {
  activePage: 'landing', // 'landing', 'auth', 'dashboard', 'practice_selection', 'speaking_practice', 'chat_practice'
  authTab: 'login', // 'login', 'signup'
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')),
  dashboardData: null,
  practiceResult: null,
  chatMessages: [],
  isTyping: false,
  translationResult: null
};

// Helpers
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.map(cb => cb(newToken));
  refreshSubscribers = [];
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  // Always fetch current token from storage
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // Keep local state in sync
    if (!state.token) state.token = token;
  }

  const options = { 
    method, 
    headers,
    credentials: 'include' // Required to send/receive cookies cross-domain
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // 401 Unauthorized: Access token expired, attempt refresh
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, { 
            method: 'POST', 
            credentials: 'include' 
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data.accessToken;
            localStorage.setItem('token', newToken);
            state.token = newToken;
            isRefreshing = false;
            onTokenRefreshed(newToken);
          } else {
            throw new Error('Refresh failed');
          }
        } catch (e) {
          isRefreshing = false;
          handleLogout();
          showToast('Session expired. Please login again.', 'error');
          throw new Error('Unauthorized');
        }
      }

      // Return a promise that resolves when the token is refreshed
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          options.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(fetch(`${API_BASE}${endpoint}`, options).then(r => {
            if (!r.ok) throw new Error('Retry failed');
            return r.json();
          }));
        });
      });
    }

    // 403 Forbidden: Session restricted or invalid
    if (response.status === 403) {
      handleLogout();
      const err = await response.json().catch(() => ({ message: 'Access denied' }));
      showToast(err.message || 'Action restricted or permission denied.', 'error');
      throw new Error('Forbidden');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'API Error' }));
      const errorMessage = err.message || 'API request failed';
      showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (err) {
    if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
      console.error('API Request Error:', err);
      if (!err.message.includes('API request failed') && !err.message.includes('Retry failed')) {
        showToast('Network error or server unreachable', 'error');
      }
    }
    throw err;
  }
}



function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation'}"></i>
    </div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}


// Templates
const Templates = {
  landing: () => `
    <nav class="container">
      <a href="#" class="logo poppins" onclick="navigate('landing')">SpeakFlow AI</a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        ${state.token ?
      `<a href="#" class="btn-primary" onclick="navigate('dashboard')">Dashboard</a>` :
      `<a href="#" class="btn-secondary" onclick="navigate('auth')">Login</a>`}
      </div>
    </nav>
    
    <main class="container">
      <section class="hero slide-up">
        <div class="hero-content">
          <h1 class="poppins">Improve Your English Speaking with AI</h1>
          <p>Practice speaking, get instant corrections, and build confidence with AI.</p>
          <div class="hero-actions">
            <button class="btn-primary" onclick="navigate('auth')">Start Speaking</button>
            <button class="btn-secondary" onclick="window.location.hash='#demo'">Watch Demo</button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/ai-chatbot-illustration-download-in-svg-png-gif-file-formats--chat-bot-artificial-intelligence-robot-pack-network-communication-illustrations-8153406.png" alt="SpeakFlow AI Illustration">
        </div>
      </section>

      <section id="features">
        <h2 class="poppins section-title">Why Choose SpeakFlow AI?</h2>
        <p class="section-subtitle">Everything you need to master English speaking in one place.</p>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-microphone"></i></div>
            <h3 class="poppins">Speaking Practice</h3>
            <p>Practice speaking English with AI and get personalized feedback on every sentence.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-magic"></i></div>
            <h3 class="poppins">AI Grammar Correction</h3>
            <p>AI corrects your sentences instantly, explaining every mistake in simple terms.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
            <h3 class="poppins">Progress Tracking</h3>
            <p>Track your daily improvement and watch your confidence score reach new heights.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <h2 class="poppins section-title">How It Works</h2>
        <p class="section-subtitle">Start your journey to fluency in three simple steps.</p>
        <div class="steps-container">
          <div class="step-card">
            <div class="step-icon">1</div>
            <h3 class="poppins">Speak</h3>
            <p>Tap the microphone and start speaking naturally.</p>
          </div>
          <div class="step-card">
            <div class="step-icon">2</div>
            <h3 class="poppins">AI Analysis</h3>
            <p>AI analyzes your speech, grammar, and pronunciation.</p>
          </div>
          <div class="step-card">
            <div class="step-icon">3</div>
            <h3 class="poppins">Improve</h3>
            <p>Get corrections and improve your fluency instantly.</p>
          </div>
        </div>
      </section>

      <section id="demo">
        <h2 class="poppins section-title">Experience the Magic</h2>
        <p class="section-subtitle">See how our AI helps you speak like a native.</p>
        <div class="demo-preview">
           <div style="text-align: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 40px; margin-bottom: 40px;">
             <p style="color: var(--text-muted); font-weight: 500; margin-bottom: 24px;">Practice prompt: Introduce yourself</p>
             <div class="mic-container" style="width: 80px; height: 80px; margin: 0 auto; animation: none; cursor: default;">
                <i class="fas fa-microphone" style="font-size: 1.5rem;"></i>
             </div>
           </div>
           
           <div style="display: grid; gap: 24px;">
             <div style="padding: 20px; border-radius: 12px; background: #F8FAFC;">
               <p style="font-weight: 600; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">You said:</p>
               <p style="font-size: 1.1rem; margin-top: 8px;">"I am work in a bank and I like play soccer."</p>
             </div>
             
             <div style="padding: 20px; border-radius: 12px; background: #F3F4FF; border-left: 4px solid var(--primary-purple);">
               <p style="font-weight: 600; font-size: 0.8rem; color: var(--primary-purple); text-transform: uppercase;">AI Correction:</p>
               <p style="font-size: 1.1rem; margin-top: 8px; font-weight: 600;">"I work in a bank, and I like playing soccer."</p>
               <div style="display: flex; gap: 12px; margin-top: 16px;">
                  <span class="score-badge score-grammar">Grammar: 85%</span>
                  <span class="score-badge score-fluency">Fluency: 92%</span>
               </div>
             </div>
           </div>
        </div>
      </section>

      <section class="cta-section">
        <h2 class="poppins">Start improving your English speaking today.</h2>
        <p>Join thousands of learners building confidence with SpeakFlow AI.</p>
        <button class="btn-secondary" style="border: none; padding: 16px 40px; font-size: 1.1rem;" onclick="navigate('auth')">Start Speaking Now</button>
      </section>
    </main>

    <footer class="container" style="padding: 80px 0; border-top: 1px solid #E2E8F0; text-align: center;">
      <div class="footer-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
      <p class="logo poppins" style="font-size: 1.25rem; margin-bottom: 12px;">SpeakFlow AI</p>
      <p style="color: var(--text-muted); font-size: 0.9rem;">© 2026 SpeakFlow AI. All rights reserved.</p>
    </footer>
  `,

  progress: () => {
    const data = state.dashboardData || { confidenceScore: 65, fluencyScore: 70, todayPracticeMinutes: 0, totalWordsLearned: 0 };
    return `
    <div class="dashboard-layout">
      ${Sidebar('progress')}
      <main class="main-content">
        <h1 class="poppins">Learning Progress</h1>
        <p style="color: var(--text-muted); margin-bottom: 40px;">Deep dive into your speaking analytics and trends.</p>

        <div class="dashboard-grid-enhanced">
           <div class="stat-card">
              <span class="stat-label">Pronunciation Accuracy</span>
              <span class="stat-value" style="color: var(--primary-green);">82%</span>
              <div class="xp-bar-container"><div class="xp-bar-fill" style="width: 82%; background: var(--gradient-success);"></div></div>
           </div>
           <div class="stat-card">
              <span class="stat-label">Grammar Accuracy</span>
              <span class="stat-value" style="color: var(--primary-blue);">${data.confidenceScore}%</span>
              <div class="xp-bar-container"><div class="xp-bar-fill" style="width: ${data.confidenceScore}%;"></div></div>
           </div>
           <div class="stat-card">
              <span class="stat-label">Total Practice Sessions</span>
              <span class="stat-value">${data.totalSessions}</span>
              <span class="stat-desc">Consistency is key!</span>
           </div>
        </div>

        <div class="dashboard-sections">
           <div class="left-section">
              <div class="chart-wrapper">
                 <h3 class="poppins" style="margin-bottom: 24px;">Weekly Fluency Trend</h3>
                 <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Calculation: 50% Pronunciation + 30% Grammar + 20% Speed</div>
                 <canvas id="fluencyChart" height="200"></canvas>
              </div>
           </div>
           <div class="right-section">
              <div class="history-card">
                 <h3 class="poppins" style="margin-bottom: 12px;">Improvement Tips</h3>
                 <ul style="list-style: none; padding: 0;">
                    <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                       <i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Practice more <strong>multi-syllable</strong> words.
                    </li>
                    <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                       <i class="fas fa-info-circle" style="color: var(--primary-blue);"></i> ${data.progressInsight}
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </main>
    </div>
    `
  },

  profile: () => `
    <div class="dashboard-layout">
      ${Sidebar('profile')}
      <main class="main-content">
        <div class="welcome-section">
          <h1 class="poppins">My Profile</h1>
          <p>Manage your learning preferences and view your achievements.</p>
        </div>

        <div class="dashboard-sections">
           <div class="left-section">
              <div class="history-card">
                 <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-main); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                       ${state.user?.name?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                       <h2 class="poppins">${state.user?.name || 'User Name'} <span class="level-badge">Lv ${state.dashboardData?.userLevel || 1} Pro</span></h2>
                       <p style="color: var(--text-muted);">${state.user?.email || 'email@example.com'}</p>
                    </div>
                 </div>
                 
                 <form onsubmit="handleProfileUpdate(event)">
                    <div class="form-group">
                       <label>Full Name</label>
                       <input type="text" name="name" value="${state.user?.name || ''}" class="form-group" style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; outline: none;">
                    </div>

                    <div class="form-group">
                       <label>Learning Goal</label>
                       <select name="learningGoal" class="form-group" style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; outline: none;">
                          <option value="Job Interview" ${state.dashboardData?.learningGoal === 'Job Interview' ? 'selected' : ''}>Job Interview</option>
                          <option value="Public Speaking" ${state.dashboardData?.learningGoal === 'Public Speaking' ? 'selected' : ''}>Public Speaking</option>
                          <option value="Daily Conversation" ${state.dashboardData?.learningGoal === 'Daily Conversation' ? 'selected' : ''}>Daily Conversation</option>
                          <option value="Academic English" ${state.dashboardData?.learningGoal === 'Academic English' ? 'selected' : ''}>Academic English</option>
                       </select>
                    </div>

                    <div class="form-group">
                       <label>Native Language</label>
                       <select name="preferredLanguage" class="form-group" style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; outline: none;">
                          <option value="Tamil" ${state.dashboardData?.preferredLanguage === 'Tamil' ? 'selected' : ''}>Tamil</option>
                          <option value="Telugu" ${state.dashboardData?.preferredLanguage === 'Telugu' ? 'selected' : ''}>Telugu</option>
                          <option value="Hindi" ${state.dashboardData?.preferredLanguage === 'Hindi' ? 'selected' : ''}>Hindi</option>
                          <option value="English" ${state.dashboardData?.preferredLanguage === 'English' ? 'selected' : ''}>English</option>
                       </select>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="margin-top: 20px;">Save Changes</button>
                 </form>
              </div>
           </div>
           
           <div class="right-section">
              <div class="history-card">
                 <h3 class="poppins" style="margin-bottom: 20px;">Achievements</h3>
                 <div style="display: grid; gap: 16px;">
                    <div class="achievement-badge unlocked">
                       <div class="badge-icon"><i class="fas fa-rocket"></i></div>
                       <div>
                          <div style="font-weight: 600; font-size: 0.9rem;">Fast Learner</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">Completed first 5 sessions</div>
                       </div>
                    </div>
                    <div class="achievement-badge unlocked">
                       <div class="badge-icon"><i class="fas fa-fire"></i></div>
                       <div>
                          <div style="font-weight: 600; font-size: 0.9rem;">On Fire!</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">Reached 5 day streak</div>
                       </div>
                    </div>
                    <div class="achievement-badge">
                       <div class="badge-icon"><i class="fas fa-trophy"></i></div>
                       <div>
                          <div style="font-weight: 600; font-size: 0.9rem;">Vocabulary Master</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">Learn 500 words</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  `,

  auth: () => `
    <div class="auth-container">
      <div class="auth-card-split slide-up">
        <div class="auth-sidebar">
          <a href="#" class="logo poppins" style="color: white; font-size: 2rem;" onclick="navigate('landing')">SpeakFlow AI</a>
          <h2 class="poppins">Practice English with AI and build speaking confidence.</h2>
        </div>
        
        <div class="auth-main">
          <div class="auth-tabs">
            <div class="auth-tab ${state.authTab === 'login' ? 'active' : ''}" onclick="setAuthTab('login')">Login</div>
            <div class="auth-tab ${state.authTab === 'signup' ? 'active' : ''}" onclick="setAuthTab('signup')">Sign Up</div>
          </div>

          <div id="auth-form-container" class="form-fade-in">
            ${state.authTab === 'login' ? `
              <form onsubmit="handleAuthSubmit(event)">
                <div class="form-group"><label>Email Address</label><input type="email" id="auth-email" placeholder="name@example.com" required></div>
                <div class="form-group"><label>Password</label><input type="password" id="auth-password" placeholder="••••••••" required></div>
                <button type="submit" class="btn-primary" style="width: 100%;">Login</button>
              </form>
            ` : `
              <form onsubmit="handleAuthSubmit(event)">
                <div class="form-group"><label>Full Name</label><input type="text" id="auth-name" placeholder="John Doe" required></div>
                <div class="form-group"><label>Email Address</label><input type="email" id="auth-email" placeholder="name@example.com" required></div>
                <div class="form-group"><label>Password</label><input type="password" id="auth-password" placeholder="••••••••" required></div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 12px;">Create Account</button>
              </form>
            `}
          </div>
          <p class="auth-footer-text">By continuing you agree to our <a href="#" style="color: var(--primary-purple);">Terms</a> and <a href="#" style="color: var(--primary-purple);">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  `,

  dashboard: () => {
    const data = state.dashboardData || { userName: '...', practiceSessions: 0, streak: 0, confidenceScore: 0, progressInsight: '', recentSessions: [] };
    return `
    <div class="dashboard-layout">
      ${Sidebar('dashboard')}
      <main class="main-content">
        <div class="welcome-section">
          <h1 class="poppins">Hi ${data.userName} 👋</h1>
          <p>Ready to improve your English today? Practice speaking with AI and track your progress.</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-fire"></i></div>
            <span class="stat-label">Practice Streak</span>
            <span class="stat-value">${data.streak} Days</span>
            <span class="stat-desc">Consecutive practice days</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-history"></i></div>
            <span class="stat-label">Total Sessions</span>
            <span class="stat-value">${data.practiceSessions}</span>
            <span class="stat-desc">Speaking practices completed</span>
          </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-chart-pie"></i></div>
              <span class="stat-label">Fluency Score</span>
              <span class="stat-value">${data.fluencyScore}%</span>
              <span class="stat-desc">Better than 72% of users</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="color: var(--primary-orange);"><i class="fas fa-fire"></i></div>
              <span class="stat-label">Daily Streak</span>
              <span class="stat-value">${data.practiceStreak} 🔥</span>
              <span class="stat-desc">Next bonus in 2 days</span>
            </div>
          </div>

          <div class="dashboard-grid-enhanced">
             <div class="stat-card">
                <span class="stat-label">Words Learned</span>
                <span class="stat-value">${data.wordsLearned}</span>
                <span class="stat-desc">VOCABULARY COUNTER</span>
             </div>
             <div class="stat-card">
                <span class="stat-label">Total Sessions</span>
                <span class="stat-value">${data.totalSessions}</span>
                <span class="stat-desc">ACROSS ALL TOOLS</span>
             </div>
             <div class="stat-card">
                <span class="stat-label">Today's Practice</span>
                <span class="stat-value">${data.todayPracticeMinutes} Min</span>
                <div class="xp-bar-container"><div class="xp-bar-fill" style="width: ${Math.min(100, (data.todayPracticeMinutes/20)*100)}%;"></div></div>
             </div>
             <div class="stat-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                   <div>
                      <span class="stat-label">Level ${data.userLevel}</span>
                      <div class="stat-value" style="font-size: 1.25rem;">${data.userXp} XP</div>
                   </div>
                   <div class="level-badge" style="margin-bottom: 8px;">${data.userXp > 10000 ? 'Pro Speaker' : data.userXp > 2500 ? 'Advanced' : 'Learner'}</div>
                </div>
                <div class="xp-bar-container"><div class="xp-bar-fill" style="width: ${(data.userXp % 1000) / 10}%;"></div></div>
             </div>
          </div>

          <div class="dashboard-sections">
          <div class="left-section">
            <div class="history-card">
              <h3 class="poppins" style="margin-bottom: 24px;">Recent Practice History</h3>
              ${data.recentSessions.length > 0 ? data.recentSessions.map(s => `
                <div class="history-item">
                  <div class="history-original">"${s.originalSentence}"</div>
                  <div class="history-corrected">"${s.correctedSentence}"</div>
                  <div class="history-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${s.createdAt}</span>
                    <span class="score-badge score-grammar">G: ${s.grammarScore}%</span>
                    <span class="score-badge score-fluency">F: ${s.fluencyScore}%</span>
                    <span class="score-badge score-confidence">C: ${s.confidenceScore}%</span>
                  </div>
                </div>
              `).join('') : '<p style="color: var(--text-muted);">No sessions yet. Start practicing!</p>'}
            </div>
          </div>
          
          <div class="right-section">
            <div class="prompt-card">
              <h3 class="poppins" style="margin-bottom: 12px;">Daily Challenge</h3>
              <p style="font-weight: 500; font-size: 1.1rem; margin-bottom: 20px;">"Tell me about your favorite hobby."</p>
              <button class="btn-primary" style="width: 100%;" onclick="navigate('speaking_practice')">Practice Now</button>
            </div>
            
            <div class="insight-card">
              <h4 class="poppins" style="margin-bottom: 8px;"><i class="fas fa-lightbulb"></i> Daily Insight</h4>
              <p style="font-size: 0.9rem; color: var(--text-dark);">${data.aiImprovementTip || data.progressInsight}</p>
            </div>

            <div class="quick-practice-card" style="margin-top: 32px;">
               <h4 class="poppins"><i class="fas fa-bolt"></i> 30s Challenge</h4>
               <p style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 16px;">"Describe your surroundings in 3 sentences."</p>
               <button class="btn-secondary" onclick="navigate('speaking_practice')">Start Quick Blitz</button>
            </div>

            <div class="practice-card" style="margin-top: 32px; background: var(--gradient-main); color: white; padding: 24px; border-radius: 16px;">
               <h3 class="poppins">Start Practice</h3>
               <p style="opacity: 0.9; margin: 8px 0 20px; font-size: 0.9rem;">Click to get instant AI feedback.</p>
               <button class="btn-secondary" style="border: none; width: 100%; color: var(--primary-purple); background: white;" onclick="navigate('practice_selection')">Explore Modes</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `},

  practice_selection: () => `
    <div class="dashboard-layout">
      ${Sidebar('practice')}
      <main class="main-content">
        <h1 class="poppins">Choose Your Practice Mode</h1>
        <p style="color: var(--text-muted); margin-bottom: 40px;">Select how you want to improve your English today.</p>
        
        <div class="mode-selection">
          <div class="mode-card" onclick="navigate('speaking_practice')">
            <span class="mode-icon">🎤</span>
            <h3 class="poppins">Speaking Practice</h3>
            <p style="color: var(--text-muted); margin-top: 12px;">Practice English by speaking into the microphone. Get real-time fluency analysis.</p>
          </div>
          <div class="mode-card" onclick="navigate('chat_practice')">
            <span class="mode-icon">💬</span>
            <h3 class="poppins">Chat Practice</h3>
            <p style="color: var(--text-muted); margin-top: 12px;">Practice English by chatting with the AI tutor. Improve your grammar via text.</p>
          </div>
        </div>
      </main>
    </div>
  `,

  speaking_practice: () => `
    <div class="dashboard-layout">
      ${Sidebar('practice')}
      <main class="main-content">
        <div class="practice-container" style="max-width: 800px; margin: 0 auto; text-align: center;">
           <h2 class="poppins">Speaking Practice Prompt</h2>
           <p style="font-size: 1.25rem; font-weight: 500; margin-top: 12px; color: var(--text-muted);">"Introduce yourself (e.g. 'Yesterday I go office')"</p>
           
           <div id="mic-container" class="mic-container" onclick="handleSpeakClick()">
              <i class="fas fa-microphone" id="mic-icon"></i>
           </div>
           <p id="practice-status" style="color: var(--text-muted); font-weight: 500;">Tap to start speaking</p>

           <div id="practice-result" style="display: none; text-align: left; margin-top: 40px;">
              ${state.practiceResult ? `
              <div class="history-card" style="padding: 40px;">
                 <h3 class="poppins" style="margin-bottom: 24px;">AI Evaluation</h3>
                 <div style="margin-bottom: 32px; display: flex; gap: 16px;">
                    <span class="score-badge score-grammar">Grammar: ${state.practiceResult.grammarScore}%</span>
                    <span class="score-badge score-fluency">Fluency: ${state.practiceResult.fluencyScore}%</span>
                    <span class="score-badge score-confidence">Confidence: ${state.practiceResult.confidenceScore}%</span>
                 </div>
                 <p style="font-weight: 600; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">You said:</p>
                 <p style="font-size: 1.2rem; margin: 8px 0 24px;">"${state.practiceResult.originalSentence}"</p>
                 <div style="background: #F3F4FF; padding: 24px; border-radius: 12px; border-left: 4px solid var(--primary-purple);">
                    <p style="font-size: 1.2rem; font-weight: 600; color: var(--primary-purple);">"${state.practiceResult.correctedSentence}"</p>
                    <p style="margin-top: 12px; font-size: 0.95rem; color: var(--text-dark);">${state.practiceResult.explanation}</p>
                 </div>
                 <div style="margin-top: 24px; padding: 20px; background: #EBF8FF; border-radius: 12px; border-left: 4px solid var(--primary-blue);">
                    <p style="font-weight: 600; color: var(--primary-blue); font-size: 0.8rem; text-transform: uppercase;">Natural Alternative:</p>
                    <p style="font-size: 1.1rem; margin-top: 8px; font-weight: 500;">"${state.practiceResult.betterSentence}"</p>
                 </div>
                 <div style="display: flex; gap: 16px; margin-top: 40px;">
                    <button class="btn-primary" onclick="resetPractice()">Try Again</button>
                    <button class="btn-secondary" onclick="navigate('dashboard')">Back to Dashboard</button>
                 </div>
              </div>` : ''}
           </div>
        </div>
      </main>
    </div>
  `,

  chat_practice: () => `
    <div class="dashboard-layout">
      ${Sidebar('practice')}
      <main class="main-content">
        <div class="chat-container">
          <div class="welcome-section">
            <h1 class="poppins">AI English Chat Practice</h1>
            <p>Chat with the AI tutor to improve your English. Type naturally!</p>
          </div>
          
          <div id="chat-window" class="chat-window">
            <div class="message ai">Hello! Let's practice English. Tell me about your day.</div>
            ${state.chatMessages.map(m => `
              <div class="message user">${m.userMessage}</div>
              <div class="message ai">
                <div>${m.correctedSentence}</div>
                <div class="ai-feedback-box">
                  <strong>Explanation:</strong> ${m.explanation}<br>
                  <strong style="display:block; margin-top:4px;">Suggestion:</strong> ${m.suggestion}
                </div>
              </div>
            `).join('')}
            ${state.isTyping ? '<div class="typing-indicator">AI is typing...</div>' : ''}
          </div>

          <form class="chat-input-area" onsubmit="handleChatSubmit(event)">
            <input type="text" id="chat-input" placeholder="Type your message here... (e.g. 'Today I work on project')" autocomplete="off">
            <button type="submit" class="btn-primary" style="padding: 12px 24px;">Send</button>
          </form>
        </div>
      </main>
    </div>
  `,

  translate: () => `
    <div class="dashboard-layout">
      ${Sidebar('translate')}
      <main class="main-content">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 class="poppins">Tamil / Tanglish to English Translator</h1>
          <p style="color: var(--text-muted); margin-bottom: 32px;">Type in Tamil or Tanglish to get an instant English translation.</p>
          
          <div class="history-card" style="padding: 32px; margin-bottom: 32px;">
            <div class="form-group">
              <label>Enter Tamil / Tanglish Text</label>
              <textarea id="translate-input" placeholder="Type here... (e.g. 'naethu na school ku pona pa')" 
                style="width: 100%; height: 120px; padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 1rem; resize: none; outline: none;"></textarea>
            </div>
            <button class="btn-primary" onclick="handleTranslateSubmit()" style="width: 100%;">Translate</button>
          </div>

          <div id="translation-output-container" style="${state.translationResult ? 'display: block;' : 'display: none;'}">
            <h3 class="poppins" style="margin-bottom: 12px;">English Translation:</h3>
            <div style="padding: 24px; background: #F3F4FF; border-radius: 12px; border-left: 4px solid var(--primary-purple); font-size: 1.25rem; font-weight: 600; color: var(--primary-purple);">
              "${state.translationResult || ''}"
            </div>
          </div>
        </div>
      </main>
    </div>
  `
};

function Sidebar(active) {
  return `
    <aside class="sidebar">
      <a href="#" class="logo poppins" onclick="navigate('landing')">SpeakFlow AI</a>
      <ul class="sidebar-menu">
        <li><a href="#" class="${active === 'dashboard' ? 'active' : ''}" onclick="navigate('dashboard')"><i class="fas fa-home"></i> Dashboard</a></li>
        <li><a href="#" class="${active === 'practice' ? 'active' : ''}" onclick="navigate('practice_selection')"><i class="fas fa-microphone"></i> Practice</a></li>
        <li><a href="#" class="${active === 'progress' ? 'active' : ''}" onclick="navigate('progress')"><i class="fas fa-chart-line"></i> Progress</a></li>
        <li><a href="#" class="${active === 'translate' ? 'active' : ''}" onclick="navigate('translate')"><i class="fas fa-language"></i> Translate</a></li>
        <li><a href="#" class="${active === 'profile' ? 'active' : ''}" onclick="navigate('profile')"><i class="fas fa-user"></i> Profile</a></li>
      </ul>
      <div style="margin-top: auto;">
         <a href="#" onclick="handleLogout()" style="text-decoration: none; color: var(--text-muted); display: flex; align-items: center; gap: 8px; padding: 12px 16px;">
           <i class="fas fa-sign-out-alt"></i> Logout
         </a>
      </div>
    </aside>
  `;
}

// Navigation
async function navigate(page) {
  state.activePage = page;

  if (page === 'dashboard' || page === 'progress' || page === 'profile') {
    if (!state.token) return navigate('auth');
    try {
      state.dashboardData = await apiRequest('/dashboard');
      if (page === 'progress') state.progressData = await apiRequest('/dashboard/progress');
    } catch (e) { handleLogout(); }
  } else if ((page === 'practice_selection' || page === 'translate') && !state.token) {
    return navigate('auth');
  }

  render();
  if (page === 'progress') setTimeout(initCharts, 100);
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    await apiRequest('/profile', 'PUT', data);
    
    // Update local state
    state.user.name = data.name;
    localStorage.setItem('user', JSON.stringify(state.user));
    
    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    showToast('Failed to update profile', 'error');
  } finally {
    navigate('profile');
  }
}

function initCharts() {
  const ctx = document.getElementById('fluencyChart');
  if (!ctx) return;
  
  const weeklyData = state.progressData?.weeklyFluency || [
    { week: 'Week 1', score: 62 },
    { week: 'Week 2', score: 68 },
    { week: 'Week 3', score: 74 },
    { week: 'Week 4', score: 81 }
  ];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeklyData.map(d => d.week),
      datasets: [{
        label: 'Fluency Score',
        data: weeklyData.map(d => d.score),
        borderColor: '#6C63FF',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        pointBackgroundColor: '#6C63FF',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { 
        y: { 
          beginAtZero: false, 
          grid: { color: '#f0f0f0' },
          ticks: { stepSize: 10 }
        }, 
        x: { grid: { display: false } } 
      }
    }
  });
}

function setAuthTab(tab) {
  state.authTab = tab;
  render();
}

// Event Handlers
async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  try {
    if (state.authTab === 'login') {
      const res = await apiRequest('/auth/login', 'POST', { email, password });
      state.token = res.token;
      state.user = res.user;
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showToast('Login Successful');
      navigate('dashboard');
    } else {
      const name = document.getElementById('auth-name').value;
      await apiRequest('/auth/signup', 'POST', { name, email, password });
      showToast('Signup Successful');
      state.authTab = 'login';
      render();
    }
  } catch (err) { }
}


function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('landing');
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  state.isTyping = true;
  state.chatMessages.push({ userMessage: message, correctedSentence: '...', explanation: '...', suggestion: '' });
  render();
  scrollChat();

  try {
    const res = await apiRequest('/chat/send', 'POST', { message });
    state.chatMessages[state.chatMessages.length - 1] = res;
  } catch (err) {
    state.chatMessages.pop();
  } finally {
    state.isTyping = false;
    render();
    scrollChat();
  }
}

async function handleTranslateSubmit() {
  const input = document.getElementById('translate-input');
  const text = input.value.trim();
  if (!text) return;

  const btn = document.querySelector('.main-content .btn-primary');
  const originalText = btn.innerText;
  btn.innerText = 'Translating...';
  btn.disabled = true;

  try {
    const res = await apiRequest('/translate', 'POST', { text });
    state.translationResult = res.english;
    render();
  } catch (err) {
    alert('Translation failed. Please try again.');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

function scrollChat() {
  const win = document.getElementById('chat-window');
  if (win) win.scrollTop = win.scrollHeight;
}

let isSpeaking = false;
async function handleSpeakClick() {
  const micIcon = document.getElementById('mic-icon');
  const status = document.getElementById('practice-status');
  const micContainer = document.getElementById('mic-container');

  if (!isSpeaking) {
    isSpeaking = true;
    micContainer.style.background = '#EF4444';
    micIcon.className = 'fas fa-stop';
    status.innerText = 'Listening (e.g. "I go office")... Tap to stop';
  } else {
    isSpeaking = false;
    micContainer.style.background = 'var(--gradient-main)';
    micIcon.className = 'fas fa-microphone';
    status.innerText = 'AI Analysis...';

    try {
      state.practiceResult = await apiRequest('/speaking/analyze', 'POST', { sentence: "Yesterday I go office" });
      status.style.display = 'none';
      render();
      document.getElementById('practice-result').style.display = 'block';
    } catch (err) { status.innerText = 'Error analyzing.'; }
  }
}

function resetPractice() {
  state.practiceResult = null;
  isSpeaking = false;
  render();
}

// Rendering
function render() {
  const app = document.getElementById('app');
  if (Templates[state.activePage]) {
    app.innerHTML = Templates[state.activePage]();
    if (state.activePage === 'chat_practice') scrollChat();
    window.scrollTo(0, 0);
  }
}

// Global scope exposure
window.navigate = navigate;
window.setAuthTab = setAuthTab;
window.handleAuthSubmit = handleAuthSubmit;
window.handleLogout = handleLogout;
window.handleSpeakClick = handleSpeakClick;
window.resetPractice = resetPractice;
window.handleChatSubmit = handleChatSubmit;
window.handleTranslateSubmit = handleTranslateSubmit;

// Session Check on Load
async function checkSession() {
  if (state.token) {
    try {
      // navigate('dashboard') will verify the token by calling /api/dashboard
      await navigate('dashboard');
    } catch (err) {
      // If verification fails, navigate will trigger handleLogout
      console.log('Session verification failed, staying on landing page.');
      render();
    }
  } else {
    render();
  }
}

// Initial session check instead of just render
checkSession();
