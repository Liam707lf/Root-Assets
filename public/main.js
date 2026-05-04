document.getElementById('login-form').addEventListener('submit', async (event) => {
    // Stop the page from reloading instantly
    event.preventDefault(); 

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const statusMessage = document.getElementById('status-message');

    statusMessage.style.color = "blue";
    statusMessage.textContent = "Connecting to server...";

    try {
        // Send the data to your server.js route
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: usernameInput, 
                password: passwordInput 
            })
        });

        // Parse the response from your server
        const data = await response.json();

        // response.ok means the server sent back a 200 success status
        if (response.ok) {
            statusMessage.style.color = "green";

            // Your server sends back a 'created' boolean if it's a new account
            if (data.created) {
                 statusMessage.textContent = `Welcome! New account created for ${data.user.username}. Loading game...`;
            } else {
                 statusMessage.textContent = `Welcome back, ${data.user.username}! Loading game...`;
            }

            // TODO: Add your code here to hide the login screen and show the game!

        } else {
            // If the server sends a 400 or 401 error, display the error message
            statusMessage.style.color = "red";
            statusMessage.textContent = data.error || "Login failed.";
        }
    } catch (error) {
        statusMessage.style.color = "red";
        statusMessage.textContent = "Error connecting to server.";
        console.error(error);
    }
});