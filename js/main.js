document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Function to apply the theme and update the icon
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
            localStorage.setItem('theme', 'light');
        }
    };
    
    // Set the initial theme on page load
    const initialTheme = localStorage.getItem('theme') || 
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    // Add click listener for the theme toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle theme based on current state in the classList
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(isDark ? 'light' : 'dark');
        });
    }

    // --- Main App Logic ---
    const productGrid = document.getElementById('product-grid');
    const loadingIndicator = document.getElementById('loading');
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';

    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const rootData = (Array.isArray(data) ? data[0] : data) || {};
            const products = rootData.products || [];
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load products.</p>`;
        }
    }

    function displayProducts(products) {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (!productGrid) return;
        productGrid.innerHTML = ''; // Clear loading indicator or previous content
        if (!products || products.length === 0) {
            productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">No products found.</p>`;
            return;
        }
        products.forEach(product => {
            const productCard = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden product-card flex flex-col">
                    <img src="${product.image || 'https://picsum.photos/400/300'}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">${product.name}</h3>
                        <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm flex-grow">${(product.description || '').substring(0, 50)}...</p>
                        <div class="mt-4 flex flex-wrap gap-2 items-center justify-between">
                            <span class="text-xl font-bold text-red-800 dark:text-red-500">$${parseFloat(product.price).toFixed(2)}</span>
                            <button class="bg-red-800 text-white px-3 py-1.5 rounded-md hover:bg-red-900 text-sm w-full sm:w-auto">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });
    }

    fetchProducts();
});