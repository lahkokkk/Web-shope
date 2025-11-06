document.addEventListener('DOMContentLoaded', () => {
    // --- Main App Logic ---
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/41306972-876d-42bf-8e33-4373603bbf50';

    // Page elements
    const productGrid = document.getElementById('product-grid');
    const loadingIndicator = document.getElementById('loading');
    const cartCountElement = document.getElementById('cart-count');
    const searchInput = document.getElementById('search-input');
    const categoryFiltersContainer = document.getElementById('category-filters');

    // Modal elements
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');

    let allProducts = [];
    let allCategories = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentCategory = 'Semua';
    let currentSearchTerm = '';

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
            allCategories = rootData.categories || [];
            displayCategories(allCategories);
            updateProductDisplay();
        } catch (error) {
            console.error('Error fetching products:', error);
            if (productGrid) productGrid.innerHTML = `<p class="text-center" style="grid-column: 1 / -1;">Gagal memuat produk.</p>`;
        }
    }

    function displayCategories(categoriesData) {
        if (!categoryFiltersContainer) return;
        const categoryNames = categoriesData.map(c => c.name).sort();
        const categories = ['Semua', ...categoryNames];
        
        categoryFiltersContainer.innerHTML = categories.map((category, index) => `
            <button class="category-btn ${index === 0 ? 'active' : ''}" data-category="${category}">
                ${category}
            </button>
        `).join('');
    }

    function updateProductDisplay() {
        let productsToDisplay = allProducts;

        // 1. Filter by category
        if (currentCategory !== 'Semua') {
            productsToDisplay = productsToDisplay.filter(p => p.category === currentCategory);
        }

        // 2. Filter by search term
        if (currentSearchTerm) {
            const searchTerm = currentSearchTerm.toLowerCase();
            productsToDisplay = productsToDisplay.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }
        
        displayProducts(productsToDisplay);
    }
    
    function displayProducts(products) {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (!products || products.length === 0) {
            productGrid.innerHTML = `<p class="text-center" style="grid-column: 1 / -1;">Tidak ada produk yang ditemukan.</p>`;
            return;
        }
        products.forEach(product => {
            const productCard = `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image || 'https://picsum.photos/400/300'}" alt="${product.name}">
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p>${(product.description || '').substring(0, 50)}...</p>
                        <div class="product-card-footer">
                            <span class="product-price">Rp${parseFloat(product.price).toLocaleString('id-ID')}</span>
                            <button class="add-to-cart-btn btn btn-primary" data-id="${product.id}">Tambah</button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });
    }

    // --- Event Listeners ---
    if (categoryFiltersContainer) {
        categoryFiltersContainer.addEventListener('click', e => {
            const targetButton = e.target.closest('.category-btn');
            if (targetButton) {
                currentCategory = targetButton.dataset.category;
                const buttons = categoryFiltersContainer.querySelectorAll('.category-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                targetButton.classList.add('active');
                updateProductDisplay();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            updateProductDisplay();
        });
    }

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