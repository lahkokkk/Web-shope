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

    // Constants and variables
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';

    // Auth elements
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const adminContent = document.getElementById('admin-content');

    // Admin panel elements
    const logoutBtn = document.getElementById('logout-btn');
    const productForm = document.getElementById('product-form');
    const productListContainer = document.getElementById('product-list');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let allProducts = [];

    // --- Authentication ---
    function checkAuth() {
        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
            showAdminPanel();
        } else {
            showLoginModal();
        }
    }

    function showAdminPanel() {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        loadProducts(); // Load products only after authentication
    }

    function showLoginModal() {
        if (loginOverlay) loginOverlay.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = e.target.email.value.trim();
            const password = e.target.password.value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
            if (errorMessage) errorMessage.textContent = '';

            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to connect to authentication service.');
                
                const data = await response.json();
                const adminData = Array.isArray(data) ? data[0] : data;
                
                if (!adminData || !adminData.admin || !adminData.admin.email || !adminData.admin.password) {
                    throw new Error('Admin credentials not found in the database.');
                }

                const adminEmail = adminData.admin.email;
                const adminPassword = adminData.admin.password;

                if (email === adminEmail && password === adminPassword) {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    showAdminPanel();
                } else {
                    if (errorMessage) errorMessage.textContent = 'Invalid email or password.';
                }

            } catch (error) {
                console.error('Login error:', error);
                if (errorMessage) errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Log In';
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // --- API Functions ---
    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            if(productListContainer) productListContainer.innerHTML = '<p class="text-red-500">Error loading data.</p>';
            return [{ products: [] }]; // Return object with empty products on error
        }
    }

    async function updateData(products) {
        try {
            const currentDataResponse = await fetch(API_URL);
            if (!currentDataResponse.ok) throw new Error('Failed to fetch current state before update.');
            const fetchedData = await currentDataResponse.json();
            const currentData = (Array.isArray(fetchedData) ? fetchedData[0] : fetchedData) || {};

            const newData = {
                ...currentData,
                products: products,
            };

            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([newData]),
            });
            if (!response.ok) throw new Error('Failed to update data');
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            alert('Error saving data.');
            return null;
        }
    }

    // --- Product Rendering ---
    function renderProducts(products) {
        allProducts = products;
        if (!productListContainer) return;
        productListContainer.innerHTML = '';
        if (!products || products.length === 0) {
            productListContainer.innerHTML = '<p class="dark:text-gray-300">No products found. Add one using the form above.</p>';
            return;
        }

        products.forEach((product, index) => {
            const productEl = document.createElement('div');
            productEl.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md';
            productEl.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${product.image || 'https://picsum.photos/100/100'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <p class="font-bold dark:text-gray-200">${product.name}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">$${product.price}</p>
                    </div>
                </div>
                <div class="space-x-2">
                    <button data-index="${index}" class="edit-btn bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Edit</button>
                    <button data-index="${index}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded-md text-sm">Delete</button>
                </div>
            `;
            productListContainer.appendChild(productEl);
        });
    }

    // --- Form Handling ---
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const existingId = document.getElementById('product-id').value;

            const productFromForm = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                image: document.getElementById('image').value,
                description: document.getElementById('description').value,
            };

            let updatedProducts;

            if (existingId) { // Update existing
                updatedProducts = allProducts.map(p => {
                    if (p.id.toString() === existingId) {
                        return { ...p, ...productFromForm };
                    }
                    return p;
                });
            } else { // Add new
                const newProduct = {
                    ...productFromForm,
                    id: Date.now(),
                    sold: "0",
                    rating: 0,
                    reviews: 0,
                    stock: 0,
                    category: "Uncategorized",
                    brand: "N/A",
                    material: "N/A",
                    images: [productFromForm.image || 'https://picsum.photos/600/600'],
                    options: {},
                };
                updatedProducts = [...allProducts, newProduct];
            }
            
            const result = await updateData(updatedProducts);
            if (result) {
                await loadProducts();
                resetForm();
            }
        });
    }

    function resetForm() {
        if (!productForm) return;
        productForm.reset();
        document.getElementById('product-id').value = '';
        if (formTitle) formTitle.textContent = 'Add New Product';
        if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetForm);
    }

    // --- Event Delegation for Edit/Delete ---
    if (productListContainer) {
        productListContainer.addEventListener('click', async (e) => {
            const target = e.target;
            const index = target.dataset.index;

            if (target.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this product?')) {
                    const updatedProducts = allProducts.filter((_, i) => i != index);
                    const result = await updateData(updatedProducts);
                    if (result) await loadProducts();
                }
            }

            if (target.classList.contains('edit-btn')) {
                const product = allProducts[index];
                document.getElementById('product-id').value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('image').value = product.image;
                document.getElementById('description').value = product.description;
                if (formTitle) formTitle.textContent = 'Edit Product';
                if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        });
    }

    // --- Initial Load Function ---
    async function loadProducts() {
        const data = await fetchData();
        const rootData = Array.isArray(data) ? data[0] : data;
        renderProducts(rootData.products || []);
    }

    // --- Start Application ---
    checkAuth();
});