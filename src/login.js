import './style.css'
const ADMIN_PASSWORD = 'admin123';
const USER_STORE_KEY = 'users';
const DEFAULT_USERS = {
  admin: { password: ADMIN_PASSWORD, email: 'admin@example.com', isAdmin: true },
  user: { password: 'user123', email: 'user@example.com', isAdmin: false },
  shopper: { password: 'shopper123', email: 'shopper@example.com', isAdmin: false },
};

const getStoredUsers = () => {
  const stored = localStorage.getItem(USER_STORE_KEY);
  if (!stored) return { ...DEFAULT_USERS };

  try {
   return { ...JSON.parse(stored), ...DEFAULT_USERS };
  } catch {
    return { ...DEFAULT_USERS };
  }
};

const saveStoredUsers = (users) => {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(users));
};

const normalizeInput = (value) => value.trim().toLowerCase();

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const findUserByEmail = (users, email) =>
  Object.entries(users).find(([, user]) => user.email?.toLowerCase() === email.toLowerCase());

const redirectTo = (path) => {
  window.location.href = path;
};

const logoutIfNeeded = () => {
  const currentUser = localStorage.getItem('loggedInUser');
  if (currentUser === 'admin') {
    redirectTo('./admin.html');
    return;
  }

  if (currentUser) {
    redirectTo('./index.html');
  }
};

const handleLoginSubmit = (event, loginForm, errorMessage) => {
  event.preventDefault();

  const usernameInput = loginForm.querySelector('#username');
  const passwordInput = loginForm.querySelector('#password');

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    errorMessage.textContent = 'Please enter both username/email and password.';
    return;
  }

  const normalizedInput = normalizeInput(username);
  const users = getStoredUsers();
  const emailInput = isEmail(normalizedInput) ? normalizedInput : null;
  let resolvedUser = null;

  if (emailInput) {
    const foundUser = findUserByEmail(users, emailInput);
    if (foundUser) {
      resolvedUser = foundUser[0];
    }
  } else if (users[normalizedInput]) {
    resolvedUser = normalizedInput;
  }

  if (resolvedUser) {
    if (users[resolvedUser].password === password) {
      localStorage.setItem('loggedInUser', resolvedUser);
      if (users[resolvedUser].isAdmin) {
        redirectTo('./admin.html');
        return;
      }
      redirectTo('./index.html');
      return;
    }

    errorMessage.textContent = 'Incorrect password for this account.';
    return;
  }

  const newUserKey = emailInput ? emailInput : normalizedInput;
  users[newUserKey] = {
    password,
    email: emailInput || '',
    isAdmin: false,
  };

  saveStoredUsers(users);
  localStorage.setItem('loggedInUser', newUserKey);
  redirectTo('./index.html');
};

window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('loginError');

  logoutIfNeeded();

  if (loginForm && errorMessage) {
    loginForm.addEventListener('submit', (event) => handleLoginSubmit(event, loginForm, errorMessage));
  }
});
