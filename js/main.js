document.addEventListener('DOMContentLoaded', () => {
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
            const rootData = Array.isArray(data) ? data[0] : data;
            const products = rootData.products || [];
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load products.</p>`;
        }
    }

    function displayProducts(products) {
        loadingIndicator.style.display = 'none';
        productGrid.innerHTML = ''; // Clear loading indicator
        if (!products || products.length === 0) {
            productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
            return;
        }
        products.forEach(product => {
            const productCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden product-card">
                    <img src="${product.image || 'https://picsum.photos/400/300'}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-800 truncate">${product.name}</h3>
                        <p class="text-gray-600 mt-1">${product.description.substring(0, 50)}...</p>
                        <div class="mt-4 flex items-center justify-between">
                            <span class="text-xl font-bold text-orange-500">$${parseFloat(product.price).toFixed(2)}</span>
                            <button class="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });
    }

    fetchProducts();
});