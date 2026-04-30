const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const statusMessage = document.getElementById('status-message');

function setStatus(text, isError) {
  statusMessage.textContent = text;
  statusMessage.style.color = isError ? 'red' : 'green';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Signing in...', false);

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || 'Login failed', true);
      return;
    }

    setStatus(
      data.created
        ? 'Account created. Welcome, ' + data.user.username + '!'
        : 'Welcome back, ' + data.user.username + '!',
      false
    );
  } catch (err) {
    setStatus('Network error: ' + err.message, true);
  }
});
