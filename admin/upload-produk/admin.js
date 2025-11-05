document.addEventListener('DOMContentLoaded', () => {
    // --- SHA-256 Hashing function ---
    async function sha256Hex(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Constants and variables
    const API_URL = 'https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076';
    const IMGBB_API_KEY = '9403588ce6030b29b5e1c76c171049dc';

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

    // Image Upload Elements
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imageHiddenInput = document.getElementById('image');
    const uploadStatus = document.getElementById('upload-status');

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
            submitButton.textContent = 'Sedang masuk...';
            if (errorMessage) errorMessage.textContent = '';

            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Gagal terhubung ke layanan otentikasi.');
                
                const data = await response.json();
                const adminData = (Array.isArray(data) ? data[0] : data) || {};
                
                if (!adminData || !adminData.admin || !adminData.admin.email || !adminData.admin.password || !adminData.admin.email_salt || !adminData.admin.password_salt) {
                    throw new Error('Kredensial admin atau struktur data di database tidak lengkap.');
                }

                const storedEmailHash = adminData.admin.email;
                const storedPasswordHash = adminData.admin.password;
                const emailSalt = adminData.admin.email_salt;
                const passwordSalt = adminData.admin.password_salt;


                // Hash the entered credentials with the specific salts from the API
                const enteredEmailHash = await sha256Hex(emailSalt + email);
                const enteredPasswordHash = await sha256Hex(passwordSalt + password);

                if (enteredEmailHash === storedEmailHash && enteredPasswordHash === storedPasswordHash) {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    showAdminPanel();
                } else {
                    if (errorMessage) errorMessage.textContent = 'Email atau kata sandi salah.';
                }

            } catch (error) {
                console.error('Login error:', error);
                if (errorMessage) errorMessage.textContent = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Masuk';
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
            if(productListContainer) productListContainer.innerHTML = '<tr><td colspan="4" class="px-4 py-4 text-sm text-center text-red-500">Gagal memuat data.</td></tr>';
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
            alert('Gagal menyimpan data.');
            return null;
        }
    }

    // --- Product Rendering ---
    function renderProducts(products) {
        allProducts = products;
        if (!productListContainer) return;
        productListContainer.innerHTML = '';
        if (!products || products.length === 0) {
            productListContainer.innerHTML = '<tr><td colspan="4" class="px-4 py-4 text-sm text-center text-gray-500">Tidak ada produk. Tambahkan satu menggunakan formulir di atas.</td></tr>';
            return;
        }

        products.forEach((product, index) => {
            const productEl = document.createElement('tr');
            productEl.className = 'align-middle';
            productEl.innerHTML = `
                <td class="p-4 whitespace-nowrap">
                    <img src="${product.image || 'https://picsum.photos/100/100'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-md">
                </td>
                <td class="p-4 whitespace-nowrap">
                    <p class="font-bold">${product.name}</p>
                </td>
                <td class="p-4 whitespace-nowrap text-sm text-gray-600">
                    Rp${parseFloat(product.price).toLocaleString('id-ID')}
                </td>
                <td class="p-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <button data-index="${index}" class="edit-btn bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm">Edit</button>
                        <button data-index="${index}" class="delete-btn bg-red-500 text-white px-3 py-1.5 rounded-md text-sm">Hapus</button>
                    </div>
                </td>
            `;
            productListContainer.appendChild(productEl);
        });
    }

    // --- Image Upload Handling ---
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (uploadStatus) uploadStatus.textContent = 'Mengunggah gambar...';
            const submitButton = productForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;
            
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || 'Gagal mengunggah gambar.');
                }

                const result = await response.json();
                const imageUrl = result.data.url;

                if (imageHiddenInput) imageHiddenInput.value = imageUrl;
                if (imagePreview) {
                    imagePreview.src = imageUrl;
                    imagePreview.classList.remove('hidden');
                }
                if (uploadStatus) uploadStatus.textContent = 'Unggah berhasil!';

            } catch (error) {
                console.error('Image upload error:', error);
                if (uploadStatus) uploadStatus.textContent = `Error: ${error.message}`;
                if (imageUploadInput) imageUploadInput.value = ''; // Reset file input on error
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }


    // --- Form Handling ---
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const imageUrl = document.getElementById('image').value;
            if (!imageUrl) {
                alert('Harap unggah gambar produk terlebih dahulu atau tunggu unggahan selesai.');
                return; // Stop form submission
            }

            const existingId = document.getElementById('product-id').value;

            const productFromForm = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                image: imageUrl,
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
        if(imageHiddenInput) imageHiddenInput.value = '';
        if(imageUploadInput) imageUploadInput.value = null;
        if(imagePreview) {
            imagePreview.src = '';
            imagePreview.classList.add('hidden');
        }
        if(uploadStatus) uploadStatus.textContent = '';

        if (formTitle) formTitle.textContent = 'Tambah Produk Baru';
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
                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
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

                if(imagePreview && product.image) {
                    imagePreview.src = product.image;
                    imagePreview.classList.remove('hidden');
                } else if (imagePreview) {
                    imagePreview.classList.add('hidden');
                }
                if(uploadStatus) uploadStatus.textContent = 'Anda bisa mengunggah gambar baru untuk menggantinya.';

                if (formTitle) formTitle.textContent = 'Edit Produk';
                if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        });
    }

    // --- Initial Load Function ---
    async function loadProducts() {
        const data = await fetchData();
        const rootData = (Array.isArray(data) ? data[0] : data) || {};
        renderProducts(rootData.products || []);
    }

    // --- Start Application ---
    checkAuth();
});
