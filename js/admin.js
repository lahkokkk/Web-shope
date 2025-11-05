document.addEventListener('DOMContentLoaded', () => {
    // Page Protection
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return; // Stop script execution
    }

    // Constants and variables
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';
    const logoutBtn = document.getElementById('logout-btn');
    const productForm = document.getElementById('product-form');
    const productListContainer = document.getElementById('product-list');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let allProducts = [];

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'index.html';
    });

    // --- API Functions ---
    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            productListContainer.innerHTML = '<p class="text-red-500">Error loading data.</p>';
            return [{ products: [] }]; // Return object with empty products on error
        }
    }

    async function updateData(products) {
        try {
            // First, get the current full data object from the server
            const currentDataResponse = await fetch(API_URL);
            if (!currentDataResponse.ok) throw new Error('Failed to fetch current state before update.');
            const fetchedData = await currentDataResponse.json();
            const currentData = (Array.isArray(fetchedData) ? fetchedData[0] : fetchedData) || {}; // Handle both structures

            // Create the new state object by replacing the products array
            const newData = {
                ...currentData,
                products: products,
            };

            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([newData]), // API expects an array, enforce this on write
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
        productListContainer.innerHTML = '';
        if (!products || products.length === 0) {
            productListContainer.innerHTML = '<p>No products found. Add one using the form above.</p>';
            return;
        }

        products.forEach((product, index) => {
            const productEl = document.createElement('div');
            productEl.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md';
            productEl.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${product.image || 'https://picsum.photos/100/100'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <p class="font-bold">${product.name}</p>
                        <p class="text-sm text-gray-600">$${product.price}</p>
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
                    return { ...p, ...productFromForm }; // Merge form data to preserve other fields
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

    function resetForm() {
        productForm.reset();
        document.getElementById('product-id').value = '';
        formTitle.textContent = 'Add New Product';
        cancelEditBtn.classList.add('hidden');
    }

    cancelEditBtn.addEventListener('click', resetForm);

    // --- Event Delegation for Edit/Delete ---
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
            formTitle.textContent = 'Edit Product';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    });

    // --- Initial Load ---
    async function loadProducts() {
        const data = await fetchData();
        const rootData = Array.isArray(data) ? data[0] : data;
        renderProducts(rootData.products || []);
    }

    loadProducts();
});