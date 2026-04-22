const button = document.getElementById('ping');
const output = document.getElementById('output');

button.addEventListener('click', async () => {
  output.textContent = 'Loading...';
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = 'Error: ' + err.message;
  }
});
