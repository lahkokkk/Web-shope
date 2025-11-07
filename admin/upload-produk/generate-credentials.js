document.addEventListener('DOMContentLoaded', () => {

    async function sha256Hex(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function generateRandomString(length = 32) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const form = document.getElementById('credential-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailSaltInput = document.getElementById('email-salt');
    const passwordSaltInput = document.getElementById('password-salt');
    const outputEl = document.getElementById('output');
    
    const generateEmailSaltBtn = document.getElementById('generate-email-salt');
    const generatePasswordSaltBtn = document.getElementById('generate-password-salt');

    // Auto-generate salts on page load
    emailSaltInput.value = generateRandomString();
    passwordSaltInput.value = generateRandomString();
    
    generateEmailSaltBtn.addEventListener('click', () => {
         emailSaltInput.value = generateRandomString();
    });

    generatePasswordSaltBtn.addEventListener('click', () => {
         passwordSaltInput.value = generateRandomString();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        const emailSalt = emailSaltInput.value.trim();
        const passwordSalt = passwordSaltInput.value.trim();

        if (!email || !password || !emailSalt || !passwordSalt) {
            outputEl.textContent = 'Semua field harus diisi.';
            return;
        }

        outputEl.textContent = 'Generating...';

        try {
            const emailHash = await sha256Hex(emailSalt + email);
            const passwordHash = await sha256Hex(passwordSalt + password);

            const resultObject = {
                email: emailHash,
                password: passwordHash,
                email_salt: emailSalt,
                password_salt: passwordSalt
            };

            outputEl.textContent = JSON.stringify(resultObject, null, 2);

        } catch (error) {
            console.error('Error generating hash:', error);
            outputEl.textContent = 'Terjadi kesalahan saat membuat hash. Lihat konsol untuk detail.';
        }
    });

});