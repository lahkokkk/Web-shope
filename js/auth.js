/**
 * =================================================================
 * KODE AUTH.JS LENGKAP - (SOLUSI CEPAT)
 * Ganti seluruh isi file Anda dengan ini.
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ GANTI URL INI DENGAN URL WORKER ANDA ▼▼▼
    const API_BASE_URL = 'https://user-shope.lahkok204.workers.dev'; 
    // ▲▲▲ PASTIKAN TIDAK ADA TANDA / DI AKHIR ▲▲▲

    // --- UI Elements ---
    const userAuthLinkContainer = document.getElementById('user-auth-link-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMessageElement = document.getElementById('error-message');
    
    // Account page elements
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // --- Auth Logic (Frontend yang Aman) ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value.trim();
            const password = e.target.password.value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'Memeriksa...';
            if (errorMessageElement) errorMessageElement.textContent = '';

            try {
                // Menggunakan URL lengkap untuk fetch
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Terjadi kesalahan.');
                }
                
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                window.location.href = 'akun.html';

            } catch (error) {
                if (errorMessageElement) errorMessageElement.textContent = error.message;
            } finally {
                 submitButton.disabled = false;
                 submitButton.textContent = 'Masuk';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = e.target.name.value.trim();
            const email = e.target.email.value.trim();
            const password = e.target.password.value;
            const submitButton = registerForm.querySelector('button[type="submit"]');

            if (password.length < 6) {
                 if (errorMessageElement) errorMessageElement.textContent = 'Kata sandi minimal 6 karakter.';
                 return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Mendaftar...';
            if (errorMessageElement) errorMessageElement.textContent = '';
            
            try {
                // Menggunakan URL lengkap untuk fetch
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Gagal mendaftar.');
                }
                
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                window.location.href = 'akun.html';

            } catch (error) {
                if (errorMessageElement) errorMessageElement.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Daftar';
            }
        });
    }

    // --- UI & Page Logic (Tidak Perlu Diubah) ---

    function updateAuthUI() {
        if (!userAuthLinkContainer) return;
        if (currentUser) {
            userAuthLinkContainer.innerHTML = `<a href="akun.html">Akun Saya</a>`;
        } else {
            userAuthLinkContainer.innerHTML = `<a href="login.html">Login</a>`;
        }
    }

    function updateCartCountHeader() {
        const cartCountElement = document.getElementById('cart-count');
        if (!cartCountElement) return;
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCountElement.textContent = currentCart.length > 0 ? currentCart.length : '';
        cartCountElement.classList.toggle('hidden', currentCart.length === 0);
    }
    
    function handleAccountPage() {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // New elements for the profile panel
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');

        if (welcomeMessage) {
            welcomeMessage.textContent = `Selamat Datang, ${currentUser.name}!`;
        }
        if (profileName) {
            profileName.textContent = currentUser.name;
        }
        if (profileEmail) {
            profileEmail.textContent = currentUser.email;
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'akun.html') {
        handleAccountPage();
    }
    
    updateAuthUI();
    updateCartCountHeader();
});