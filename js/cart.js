document.addEventListener('DOMContentLoaded', () => {
    // --- Cart Page Logic ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center">Keranjang Anda kosong.</p>';
            updateSummary(0);
            return;
        }

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        // In a real cart, items would be grouped by ID with a quantity.
        // For this simple version, we'll list every item added.
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between py-4 border-b border-gray-200';
            itemElement.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="${item.image || 'https://picsum.photos/100/100'}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md">
                    <div>
                        <h3 class="font-semibold text-gray-800">${item.name}</h3>
                        <p class="text-sm text-gray-500">Harga: Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                     <p class="font-semibold text-gray-800">Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
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