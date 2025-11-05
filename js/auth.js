document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';

    // If already logged in, redirect to admin panel, replacing the current page in history
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        window.location.replace('../admin.html');
        return; // Stop further execution
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Trim user email input to remove accidental whitespace
        const email = e.target.email.value.trim();
        const password = e.target.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        errorMessage.textContent = '';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to connect to authentication service.');
            
            const data = await response.json();
            const adminData = Array.isArray(data) ? data[0] : data; // Handle both structures
            
            if (!adminData || !adminData.admin || !adminData.admin.email || !adminData.admin.password) {
                throw new Error('Admin credentials not found in the database.');
            }

            const adminEmail = adminData.admin.email;
            const adminPassword = adminData.admin.password;

            // --- Debugging Logs (can be removed in production) ---
            console.log("------ LOGIN ATTEMPT ------");
            console.log("Input Email:", `"${email}"`);
            console.log("API Email:", `"${adminEmail}"`);
            console.log("Email Match:", email === adminEmail);
            console.log("Input Password:", `"${password}"`);
            console.log("API Password:", `"${adminPassword}"`);
            console.log("Password Match:", password === adminPassword);
            console.log("--------------------------");

            if (email === adminEmail && password === adminPassword) {
                console.log("Login successful. Redirecting to admin.html...");
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.replace('admin.html');
            } else {
                console.log("Login failed: Invalid credentials.");
                errorMessage.textContent = 'Invalid email or password.';
            }

        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Log In';
        }
    });
});
