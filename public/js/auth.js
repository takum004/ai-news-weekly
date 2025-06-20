// 認証管理システム
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.token ? JSON.parse(localStorage.getItem('userData') || '{}') : null;
    this.init();
  }

  init() {
    this.updateUI();
    this.bindEvents();
  }

  // イベントリスナーの設定
  bindEvents() {
    // ログインボタン
    document.getElementById('loginBtn')?.addEventListener('click', () => {
      this.showLoginModal();
    });

    // 新規登録ボタン
    document.getElementById('registerBtn')?.addEventListener('click', () => {
      this.showRegisterModal();
    });

    // ログアウトボタン
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.logout();
    });

    // マイページボタン
    document.getElementById('mypageBtn')?.addEventListener('click', () => {
      this.showMyPage();
    });

    // モーダル閉じる
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });
  }

  // UIの更新
  updateUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile');

    if (this.isAuthenticated()) {
      // ログイン済み
      authButtons.innerHTML = `
        <button id="mypageBtn" class="btn btn-secondary">
          <span>マイページ</span>
        </button>
        <button id="logoutBtn" class="btn btn-outline">
          <span>ログアウト</span>
        </button>
      `;
      
      if (userProfile) {
        userProfile.innerHTML = `
          <div class="user-avatar">${this.user.username.charAt(0).toUpperCase()}</div>
          <span>${this.user.username}</span>
        `;
      }
    } else {
      // 未ログイン
      authButtons.innerHTML = `
        <button id="loginBtn" class="btn btn-outline">
          <span>ログイン</span>
        </button>
        <button id="registerBtn" class="btn btn-primary">
          <span>新規登録</span>
        </button>
      `;
    }
    
    this.bindEvents();
  }

  // 認証状態チェック
  isAuthenticated() {
    return this.token && this.user;
  }

  // ログインモーダル表示
  showLoginModal() {
    const modal = this.createModal('ログイン', this.getLoginForm());
    document.body.appendChild(modal);
    this.showModal(modal);
  }

  // 新規登録モーダル表示
  showRegisterModal() {
    const modal = this.createModal('新規登録', this.getRegisterForm());
    document.body.appendChild(modal);
    this.showModal(modal);
  }

  // マイページ表示
  showMyPage() {
    const modal = this.createModal('マイページ', this.getMyPageContent());
    document.body.appendChild(modal);
    this.showModal(modal);
  }

  // モーダル作成
  createModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    return overlay;
  }

  // ログインフォーム
  getLoginForm() {
    return `
      <form id="loginForm">
        <div class="form-group">
          <label class="form-label">ユーザー名またはメール</label>
          <input type="text" id="loginIdentifier" class="form-input" required>
          <div class="form-error" id="loginIdentifierError"></div>
        </div>
        <div class="form-group">
          <label class="form-label">パスワード</label>
          <input type="password" id="loginPassword" class="form-input" required>
          <div class="form-error" id="loginPasswordError"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="authManager.closeModal()">キャンセル</button>
          <button type="submit" class="btn btn-primary">ログイン</button>
        </div>
      </form>
    `;
  }

  // 新規登録フォーム
  getRegisterForm() {
    return `
      <form id="registerForm">
        <div class="form-group">
          <label class="form-label">ユーザー名</label>
          <input type="text" id="registerUsername" class="form-input" required>
          <div class="form-error" id="registerUsernameError"></div>
        </div>
        <div class="form-group">
          <label class="form-label">メールアドレス</label>
          <input type="email" id="registerEmail" class="form-input" required>
          <div class="form-error" id="registerEmailError"></div>
        </div>
        <div class="form-group">
          <label class="form-label">パスワード（8文字以上）</label>
          <input type="password" id="registerPassword" class="form-input" required>
          <div class="form-error" id="registerPasswordError"></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="authManager.closeModal()">キャンセル</button>
          <button type="submit" class="btn btn-primary">登録</button>
        </div>
      </form>
    `;
  }

  // マイページコンテンツ
  getMyPageContent() {
    return `
      <div class="mypage-content">
        <div class="profile-section">
          <div class="user-avatar large">${this.user.username.charAt(0).toUpperCase()}</div>
          <h3>${this.user.username}</h3>
          <p>${this.user.email}</p>
        </div>
        <div class="favorites-section">
          <h4>お気に入り記事</h4>
          <div id="favoritesList" class="favorites-list">
            <p>読み込み中...</p>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="authManager.closeModal()">閉じる</button>
        </div>
      </div>
    `;
  }

  // モーダル表示
  showModal(modal) {
    setTimeout(() => modal.classList.add('active'), 10);
    
    // フォームイベント設定
    const loginForm = modal.querySelector('#loginForm');
    const registerForm = modal.querySelector('#registerForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // マイページの場合はお気に入り読み込み
    if (modal.querySelector('#favoritesList')) {
      this.loadFavorites();
    }
  }

  // モーダル閉じる
  closeModal() {
    const modal = document.querySelector('.modal-overlay.active');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // ログイン処理
  async handleLogin(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    
    this.clearErrors('login');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));
        
        this.updateUI();
        this.closeModal();
        this.showSuccess('ログインしました');
      } else {
        this.showFieldErrors(data.details || { general: data.error }, 'login');
      }
    } catch (error) {
      this.showError('ネットワークエラーが発生しました');
    }
  }

  // 新規登録処理
  async handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    this.clearErrors('register');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));
        
        this.updateUI();
        this.closeModal();
        this.showSuccess('アカウントを作成しました');
      } else {
        this.showFieldErrors(data.details || { general: data.error }, 'register');
      }
    } catch (error) {
      this.showError('ネットワークエラーが発生しました');
    }
  }

  // ログアウト
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.updateUI();
    this.showSuccess('ログアウトしました');
  }

  // お気に入り読み込み
  async loadFavorites() {
    if (!this.isAuthenticated()) return;
    
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      
      const data = await response.json();
      const favoritesList = document.getElementById('favoritesList');
      
      if (response.ok && data.favorites.length > 0) {
        favoritesList.innerHTML = data.favorites.map(fav => `
          <div class="favorite-item">
            <h5>${fav.article_title}</h5>
            <p>${fav.article_summary || ''}</p>
            <small>${new Date(fav.created_at).toLocaleDateString('ja-JP')}</small>
          </div>
        `).join('');
      } else {
        favoritesList.innerHTML = '<p>まだお気に入りはありません</p>';
      }
    } catch (error) {
      document.getElementById('favoritesList').innerHTML = '<p>お気に入りの読み込みに失敗しました</p>';
    }
  }

  // エラー表示関連
  clearErrors(form) {
    document.querySelectorAll(`#${form}Form .form-error`).forEach(el => el.textContent = '');
  }

  showFieldErrors(errors, form) {
    for (const [field, message] of Object.entries(errors)) {
      const errorEl = document.getElementById(`${form}${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
      if (errorEl) {
        errorEl.textContent = message;
      }
    }
  }

  showSuccess(message) {
    // 簡単な成功メッセージ表示
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  showError(message) {
    // 簡単なエラーメッセージ表示
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // APIリクエストヘルパー
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }
}

// グローバルインスタンス
const authManager = new AuthManager();