document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';

    // If already logged in, redirect to admin panel, replacing the current page in history
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        window.location.replace('/admin_panel.html');
        return; // Stop further execution
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.email.value;
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

            const { email: adminEmail, password: adminPassword } = adminData.admin;

            if (email === adminEmail && password === adminPassword) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                // Use replace to prevent user from going back to the login page
                window.location.replace('/admin_panel.html');
            } else {
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