document.addEventListener('DOMContentLoaded', () => {
    
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center">Keranjang Anda kosong.</p>';
            updateSummary(0);
            return;
        }

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <img src="${item.image || 'https://picsum.photos/100/100'}" alt="${item.name}">
                    <div>
                        <h3 class="font-bold">${item.name}</h3>
                        <p>Harga: Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p class="font-bold">Rp${parseFloat(item.price).toLocaleString('id-ID')}</p>
                    <button data-index="${index}" class="remove-item-btn">&times;</button>
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
        if (cartTotalElement) cartTotalElement.textContent = formattedSubtotal; 
    }
    
    function removeFromCart(indexToRemove) {
        cart = cart.filter((_, index) => index !== indexToRemove);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        
        updateCartCountHeader(); 
    }

    
    function updateCartCountHeader() {
        const cartCountElement = document.getElementById('cart-count');
        if (!cartCountElement) return;
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (currentCart.length > 0) {
            cartCountElement.textContent = currentCart.length;
            cartCountElement.classList.remove('hidden');
        } else {
            cartCountElement.classList.add('hidden');
        }
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const itemIndex = parseInt(e.target.dataset.index, 10);
                removeFromCart(itemIndex);
            }
        });
    }

    
    renderCart();
});