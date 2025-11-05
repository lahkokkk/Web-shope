document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden'); // Show SUN in dark mode
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');   // Hide MOON in dark mode
            localStorage.setItem('theme', 'dark');
        } else { // light
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

    // --- Main App Logic ---
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';

    // Page elements
    const productGrid = document.getElementById('product-grid');
    const loadingIndicator = document.getElementById('loading');
    const cartCountElement = document.getElementById('cart-count');

    // Modal elements
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Cart Functions ---
    function updateCartCount() {
        if (!cartCountElement) return;
        if (cart.length > 0) {
            cartCountElement.textContent = cart.length;
            cartCountElement.classList.remove('hidden');
        } else {
            cartCountElement.classList.add('hidden');
        }
    }

    function addToCart(productId) {
        const productToAdd = allProducts.find(p => p.id.toString() === productId.toString());
        if (productToAdd) {
            // In a real app, you'd check if the item is already in the cart and increase quantity.
            // For this version, we'll just add it.
            cart.push(productToAdd);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            alert(`${productToAdd.name} telah ditambahkan ke keranjang!`);
        }
    }

    // --- Modal Functions ---
    function openModal(productId) {
        const product = allProducts.find(p => p.id.toString() === productId.toString());
        if (!product || !productModal) return;

        modalImg.src = product.image || 'https://picsum.photos/400/400';
        modalName.textContent = product.name;
        modalPrice.textContent = `Rp${parseFloat(product.price).toLocaleString('id-ID')}`;
        modalDescription.textContent = product.description;
        modalAddToCartBtn.dataset.id = product.id;

        productModal.classList.remove('hidden');
    }

    function closeModal() {
        if (productModal) {
            productModal.classList.add('hidden');
        }
    }

    // --- Data Fetching and Display ---
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const rootData = (Array.isArray(data) ? data[0] : data) || {};
            allProducts = rootData.products || [];
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            if (productGrid) productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Gagal memuat produk.</p>`;
        }
    }

    function displayProducts(products) {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (!products || products.length === 0) {
            productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">Tidak ada produk yang ditemukan.</p>`;
            return;
        }
        products.forEach(product => {
            const productCard = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden product-card flex flex-col cursor-pointer" data-id="${product.id}">
                    <img src="${product.image || 'https://picsum.photos/400/300'}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">${product.name}</h3>
                        <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm flex-grow">${(product.description || '').substring(0, 50)}...</p>
                        <div class="mt-4 flex flex-wrap gap-2 items-center justify-between">
                            <span class="text-xl font-bold text-red-800 dark:text-red-500">Rp${parseFloat(product.price).toLocaleString('id-ID')}</span>
                            <button class="add-to-cart-btn bg-red-800 text-white px-3 py-1.5 rounded-md hover:bg-red-900 text-sm w-full sm:w-auto" data-id="${product.id}">Tambah ke Keranjang</button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });
    }

    // --- Event Listeners ---
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            // Check for Add to Cart button click
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            if (addToCartBtn) {
                const productId = addToCartBtn.dataset.id;
                addToCart(productId);
                return; // Exit after handling button click
            }

            // If not a button click, check for card click
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.id;
                openModal(productId);
            }
        });
    }

    if (productModal) {
        modalCloseBtn.addEventListener('click', closeModal);
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeModal();
            }
        });
        modalAddToCartBtn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            addToCart(productId);
            closeModal(); 
        });
    }

    // --- Initial Load ---
    updateCartCount();
    fetchProducts();
});