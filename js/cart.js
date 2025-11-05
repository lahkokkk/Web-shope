document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler (same as main.js, but with the new logic) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden'); // Show SUN in dark mode
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');   // Hide MOON in dark mode
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden'); // Show MOON in light mode
            if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');   // Hide SUN in light mode
            localStorage.setItem('theme', 'light');
        }
    };

    const initialTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(isDark ? 'light' : 'dark');
        });
    }

    // --- Cart Page Logic ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">Keranjang Anda kosong.</p>';
            updateSummary(0);
            return;
        }

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        // In a real cart, items would be grouped by ID with a quantity.
        // For this simple version, we'll list every item added.
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700';
            itemElement.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="${item.image || 'https://picsum.photos/100/100'}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md">
                    <div>
                        <h3 class="font-semibold text-gray-800 dark:text-gray-200">${item.name}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Harga: Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                     <p class="font-semibold text-gray-800 dark:text-gray-200">Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
                    <button data-index="${index}" class="remove-item-btn text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += parseFloat(item.price);
        });

        updateSummary(subtotal);
    }
    
    function updateSummary(subtotal) {
        const formattedSubtotal = `Rp${subtotal.toLocaleString('id-ID')}`;
        if (cartSubtotalElement) cartSubtotalElement.textContent = formattedSubtotal;
        if (cartTotalElement) cartTotalElement.textContent = formattedSubtotal; // Assuming no other costs for now
    }
    
    function removeFromCart(indexToRemove) {
        cart = cart.filter((_, index) => index !== indexToRemove);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const itemIndex = parseInt(e.target.dataset.index, 10);
                removeFromCart(itemIndex);
            }
        });
    }

    // --- Initial Load ---
    renderCart();
});