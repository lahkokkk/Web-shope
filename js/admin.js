document.addEventListener('DOMContentLoaded', () => {
    // === SHA-256 Hash Function ===
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // === THEME TOGGLER ===
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        themeToggleLightIcon?.classList.toggle('hidden', !isDark);
        themeToggleDarkIcon?.classList.toggle('hidden', isDark);
        localStorage.setItem('theme', theme);
    };

    const initialTheme =
        localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    themeToggleBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });

    // === CONSTANTS ===
    const API_URL = 'https://my-worker.lahkok204.workers.dev'; // Worker kamu

    // === AUTH ELEMENTS ===
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const adminContent = document.getElementById('admin-content');
    const logoutBtn = document.getElementById('logout-btn');

    // === PRODUCT ELEMENTS ===
    const productForm = document.getElementById('product-form');
    const productListContainer = document.getElementById('product-list');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let allProducts = [];

    // === AUTH HANDLING ===
    function checkAuth() {
        if (localStorage.getItem('isAdminLoggedIn') === 'true') showAdminPanel();
        else showLoginModal();
    }

    function showAdminPanel() {
        loginOverlay?.classList.add('hidden');
        adminContent?.classList.remove('hidden');
        loadProducts();
    }

    function showLoginModal() {
        loginOverlay?.classList.remove('hidden');
        adminContent?.classList.add('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                const adminData = Array.isArray(data) ? data[0] : data;
                if (!adminData?.admin) throw new Error('Admin credentials not found.');

                const enteredEmailHash = await sha256(email);
                const enteredPasswordHash = await sha256(password);

                if (
                    enteredEmailHash === adminData.admin.email &&
                    enteredPasswordHash === adminData.admin.password
                ) {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    showAdminPanel();
                } else {
                    errorMessage.textContent = 'Invalid email or password.';
                }
            } catch (err) {
                errorMessage.textContent = err.message || 'An error occurred.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Log In';
            }
        });
    }

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'index.html';
    });

    // === API FUNCTIONS ===
    async function fetchData() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network error');
            return await res.json();
        } catch (err) {
            console.error('Fetch error:', err);
            productListContainer.innerHTML =
                '<p class="text-red-500">Error loading data.</p>';
            return [{ products: [] }];
        }
    }

    async function updateData(products) {
        try {
            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products })
            });
            if (!res.ok) throw new Error('Failed to update');
            return await res.json();
        } catch (err) {
            console.error('Update error:', err);
            alert('Error saving data.');
        }
    }

    // === RENDER PRODUCTS ===
    function renderProducts(products) {
        allProducts = products;
        if (!productListContainer) return;
        productListContainer.innerHTML = '';

        if (!products?.length) {
            productListContainer.innerHTML =
                '<p class="dark:text-gray-300">No products found.</p>';
            return;
        }

        products.forEach((product, i) => {
            const el = document.createElement('div');
            el.className =
                'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md';
            el.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${product.image || 'https://picsum.photos/100/100'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <p class="font-bold dark:text-gray-200">${product.name}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">$${product.price}</p>
                    </div>
                </div>
                <div class="space-x-2">
                    <button data-index="${i}" class="edit-btn bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Edit</button>
                    <button data-index="${i}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded-md text-sm">Delete</button>
                </div>
            `;
            productListContainer.appendChild(el);
        });
    }

    // === FORM HANDLING ===
    productForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;

        const formProduct = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value,
            description: document.getElementById('description').value
        };

        let updatedProducts;
        if (id) {
            updatedProducts = allProducts.map((p) =>
                p.id.toString() === id ? { ...p, ...formProduct } : p
            );
        } else {
            const newProduct = {
                ...formProduct,
                id: Date.now(),
                sold: '0',
                rating: 0,
                reviews: 0,
                stock: 0,
                category: 'Uncategorized',
                brand: 'N/A',
                material: 'N/A',
                images: [formProduct.image || 'https://picsum.photos/600/600'],
                options: {}
            };
            updatedProducts = [...allProducts, newProduct];
        }

        const result = await updateData(updatedProducts);
        if (result) {
            await loadProducts();
            resetForm();
        }
    });

    function resetForm() {
        productForm.reset();
        document.getElementById('product-id').value = '';
        formTitle.textContent = 'Add New Product';
        cancelEditBtn.classList.add('hidden');
    }

    cancelEditBtn?.addEventListener('click', resetForm);

    // === EDIT & DELETE ===
    productListContainer?.addEventListener('click', async (e) => {
        const target = e.target;
        const i = target.dataset.index;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Delete this product?')) {
                const updated = allProducts.filter((_, idx) => idx != i);
                const res = await updateData(updated);
                if (res) await loadProducts();
            }
        }

        if (target.classList.contains('edit-btn')) {
            const p = allProducts[i];
            document.getElementById('product-id').value = p.id;
            document.getElementById('name').value = p.name;
            document.getElementById('price').value = p.price;
            document.getElementById('image').value = p.image;
            document.getElementById('description').value = p.description;
            formTitle.textContent = 'Edit Product';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    });

    // === LOAD INITIAL PRODUCTS ===
    async function loadProducts() {
        const data = await fetchData();
        const root = Array.isArray(data) ? data[0] : data;
        renderProducts(root.products || []);
    }

    // === START APP ===
    checkAuth();
});
