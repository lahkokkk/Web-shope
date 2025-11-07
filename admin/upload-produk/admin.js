document.addEventListener('DOMContentLoaded', () => {

    /**
     * Menghasilkan hash SHA-256 dari sebuah string.
     * @param {string} str String yang akan di-hash.
     * @returns {Promise<string>} Hash dalam format heksadesimal.
     */
    async function sha256Hex(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // PERBAIKAN: Menghapus .join('') yang berlebihan.
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }


    // --- KONSTANTA ---
    const ADMIN_API_URL = 'https://jsonbin-clone.bisay510.workers.dev/01cb6930-6d66-4c5e-8bf0-dc46f078f34d';
    const PRODUCT_API_URL = 'https://my-worker.lahkok204.workers.dev/';
    const IMGBB_API_KEY = '9403588ce6030b29b5e1c76c171049dc';


    // --- ELEMEN DOM (LOGIN & KONTEN ADMIN) ---
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const adminContent = document.getElementById('admin-content');


    // --- ELEMEN DOM (PANEL ADMIN) ---
    const logoutBtn = document.getElementById('logout-btn');
    const productForm = document.getElementById('product-form');
    const productListContainer = document.getElementById('product-list');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productCategoryInput = document.getElementById('category');
    const categorySuggestions = document.getElementById('category-suggestions');


    // --- ELEMEN DOM (KATEGORI) ---
    const categoryForm = document.getElementById('category-form');
    const categoryNameInput = document.getElementById('category-name');
    const categoryListContainer = document.getElementById('category-list');


    // --- ELEMEN DOM (UPLOAD GAMBAR) ---
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imageHiddenInput = document.getElementById('image');
    const uploadStatus = document.getElementById('upload-status');

    let allProducts = [];
    let allCategories = [];


    // --- FUNGSI OTENTIKASI ---
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
        loadData();
    }

    function showLoginModal() {
        if (loginOverlay) loginOverlay.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // PERBAIKAN: Menambahkan .toLowerCase() pada email dan .trim() pada password
            const email = e.target.email.value.trim().toLowerCase();
            const password = e.target.password.value.trim();
            const submitButton = loginForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'Sedang masuk...';
            if (errorMessage) errorMessage.textContent = '';

            try {
                const response = await fetch(ADMIN_API_URL);
                if (!response.ok) throw new Error('Gagal terhubung ke layanan otentikasi.');

                const data = await response.json();
                const adminData = (Array.isArray(data) ? data[0] : data) || {};

                if (!adminData || !adminData.email || !adminData.password || !adminData.email_salt || !adminData.password_salt) {
                    throw new Error('Kredensial admin atau struktur data di database tidak lengkap.');
                }

                const storedEmailHash = adminData.email;
                const storedPasswordHash = adminData.password;

                const enteredEmailHash = await sha256Hex(email + adminData.email_salt);
                const enteredPasswordHash = await sha256Hex(password + adminData.password_salt);

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


    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = '../../index.html';
        });
    }


    // --- FUNGSI MANAJEMEN DATA (CRUD) ---
    async function fetchData() {
        try {
            const response = await fetch(PRODUCT_API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            if (productListContainer) productListContainer.innerHTML = '<tr><td colspan="4" class="text-center">Gagal memuat data.</td></tr>';
            return [{}];
        }
    }

    async function updateData(dataToUpdate) {
        try {
            const currentDataResponse = await fetch(PRODUCT_API_URL);
            if (!currentDataResponse.ok) throw new Error('Failed to fetch current state before update.');
            const fetchedData = await currentDataResponse.json();
            const currentData = (Array.isArray(fetchedData) ? fetchedData[0] : fetchedData) || {};

            const newData = {
                ...currentData,
                ...dataToUpdate,
            };

            const response = await fetch(PRODUCT_API_URL, {
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


    // --- FUNGSI RENDER TAMPILAN ---
    function renderProducts(products) {
        if (!productListContainer) return;
        productListContainer.innerHTML = '';
        if (!products || products.length === 0) {
            productListContainer.innerHTML = '<tr><td colspan="4" class="text-center">Tidak ada produk. Tambahkan satu menggunakan formulir di atas.</td></tr>';
            return;
        }

        products.forEach((product, index) => {
            const productEl = document.createElement('tr');
            productEl.innerHTML = `
                <td><img src="${product.image || 'https://picsum.photos/100/100'}" alt="${product.name}"></td>
                <td>
                    <p class="font-bold">${product.name}</p>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${product.category || 'Uncategorized'}</p>
                </td>
                <td>Rp${parseFloat(product.price).toLocaleString('id-ID')}</td>
                <td>
                    <div class="admin-actions">
                        <button data-index="${index}" class="edit-btn btn btn-info">Edit</button>
                        <button data-index="${index}" class="delete-btn btn btn-danger">Hapus</button>
                    </div>
                </td>
            `;
            productListContainer.appendChild(productEl);
        });
    }

    function renderCategories(categories) {
        if (!categoryListContainer) return;
        if (!categories || categories.length === 0) {
            categoryListContainer.innerHTML = '<p>Tidak ada kategori. Tambahkan satu menggunakan formulir di atas.</p>';
            return;
        }
        categoryListContainer.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${categories.sort((a, b) => a.name.localeCompare(b.name)).map(cat => `
                    <div style="background-color: var(--bg-primary); padding: 0.25rem 0.75rem; border-radius: 999px; display: flex; align-items: center; gap: 0.5rem;">
                        <span>${cat.name}</span>
                        <button class="delete-category-btn" data-category="${cat.name}" style="background: none; border: none; cursor: pointer; color: var(--accent-secondary); font-weight: bold;">&times;</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function populateCategoryDatalist(categories) {
        if (!categorySuggestions) return;
        categorySuggestions.innerHTML = '';
        categories.sort((a, b) => a.name.localeCompare(b.name)).forEach(cat => {
            if (cat.name === 'Uncategorized') return;
            const option = document.createElement('option');
            option.value = cat.name;
            categorySuggestions.appendChild(option);
        });
    }


    // --- EVENT LISTENER (UPLOAD GAMBAR) ---
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (uploadStatus) uploadStatus.textContent = 'Mengunggah gambar...';
            const submitButton = productForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
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
                if (imageUploadInput) imageUploadInput.value = '';
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }


    // --- EVENT LISTENER (FORM PRODUK & KATEGORI) ---
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const imageUrl = document.getElementById('image').value;
            if (!imageUrl) {
                alert('Harap unggah gambar produk terlebih dahulu atau tunggu unggahan selesai.');
                return;
            }

            const existingId = document.getElementById('product-id').value;
            const categoryValue = document.getElementById('category').value.trim();
            const finalCategory = categoryValue === '' ? 'Uncategorized' : categoryValue;

            const productFromForm = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                image: imageUrl,
                description: document.getElementById('description').value,
                category: finalCategory,
            };

            let updatedProducts;
            if (existingId) {
                updatedProducts = allProducts.map(p => (p.id.toString() === existingId) ? { ...p, ...productFromForm } : p);
            } else {
                const newProduct = {
                    ...productFromForm,
                    id: Date.now(), sold: "0", rating: 0, reviews: 0, stock: 0, brand: "N/A", material: "N/A",
                    images: [productFromForm.image || 'https://picsum.photos/600/600'], options: {},
                };
                updatedProducts = [...allProducts, newProduct];
            }

            let updatedCategories = [...allCategories];

            const isNewCategory = finalCategory !== 'Uncategorized' && !updatedCategories.some(cat => cat.name.toLowerCase() === finalCategory.toLowerCase());

            if (isNewCategory) {
                updatedCategories.push({ id: Date.now(), name: finalCategory, image: '' });
            }


            const dataToUpdate = { products: updatedProducts, categories: updatedCategories };

            const result = await updateData(dataToUpdate);
            if (result) {
                allProducts = updatedProducts;
                allCategories = updatedCategories;

                renderProducts(allProducts);
                renderCategories(allCategories);
                populateCategoryDatalist(allCategories);

                resetForm();
            }
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newCategoryName = categoryNameInput.value.trim();
            if (!newCategoryName) {
                alert('Nama kategori tidak boleh kosong.');
                return;
            }
            if (allCategories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
                alert('Kategori tersebut sudah ada.');
                return;
            }
            const newCategory = { id: Date.now(), name: newCategoryName, image: '' };
            const updatedCategories = [...allCategories, newCategory];

            const result = await updateData({ categories: updatedCategories });

            if (result) {
                allCategories = updatedCategories;

                renderCategories(allCategories);
                populateCategoryDatalist(allCategories);
                categoryNameInput.value = '';
            } else {
                alert('Gagal menyimpan kategori baru.');
            }
        });
    }

    function resetForm() {
        if (!productForm) return;
        productForm.reset();
        document.getElementById('product-id').value = '';
        if (imageHiddenInput) imageHiddenInput.value = '';
        if (imageUploadInput) imageUploadInput.value = null;
        if (imagePreview) {
            imagePreview.src = '';
            imagePreview.classList.add('hidden');
        }
        if (uploadStatus) uploadStatus.textContent = '';
        if (productCategoryInput) productCategoryInput.value = '';
        if (formTitle) formTitle.textContent = 'Tambah Produk Baru';
        if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetForm);
    }


    // --- EVENT LISTENER (AKSI PADA LIST) ---
    if (productListContainer) {
        productListContainer.addEventListener('click', async (e) => {
            const target = e.target;
            const index = target.dataset.index;
            if (target.classList.contains('delete-btn')) {
                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                    const updatedProducts = allProducts.filter((_, i) => i != index);
                    const result = await updateData({ products: updatedProducts });
                    if (result) await loadData();
                }
            }
            if (target.classList.contains('edit-btn')) {
                const product = allProducts[index];
                document.getElementById('product-id').value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('image').value = product.image;
                document.getElementById('description').value = product.description;
                document.getElementById('category').value = product.category === 'Uncategorized' ? '' : product.category;

                if (imagePreview && product.image) {
                    imagePreview.src = product.image;
                    imagePreview.classList.remove('hidden');
                } else if (imagePreview) {
                    imagePreview.classList.add('hidden');
                }
                if (uploadStatus) uploadStatus.textContent = 'Anda bisa mengunggah gambar baru untuk menggantinya.';
                if (formTitle) formTitle.textContent = 'Edit Produk';
                if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        });
    }

    if (categoryListContainer) {
        categoryListContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-category-btn')) {
                const categoryToDelete = e.target.dataset.category;
                const productsUsingCategory = allProducts.filter(p => p.category === categoryToDelete).length;
                let confirmMessage = `Apakah Anda yakin ingin menghapus kategori "${categoryToDelete}"?`;
                if (productsUsingCategory > 0) {
                    confirmMessage += `\n\n${productsUsingCategory} produk yang menggunakan kategori ini akan diubah menjadi "Tidak Berkategori".`;
                }
                if (confirm(confirmMessage)) {

                    const updatedProducts = allProducts.map(p => {
                        if (p.category === categoryToDelete) {
                            return { ...p, category: 'Uncategorized' };
                        }
                        return p;
                    });

                    const updatedCategories = allCategories.filter(cat => cat.name !== categoryToDelete);

                    const result = await updateData({ products: updatedProducts, categories: updatedCategories });

                    if (result) {
                        allProducts = updatedProducts;
                        allCategories = updatedCategories;

                        renderProducts(allProducts);
                        renderCategories(allCategories);
                        populateCategoryDatalist(allCategories);
                    }
                }
            }
        });
    }


    // --- INISIALISASI ---
    async function loadData() {
        const data = await fetchData();
        const rootData = (Array.isArray(data) ? data[0] : data) || {};
        allProducts = rootData.products || [];
        allCategories = rootData.categories || [];
        renderProducts(allProducts);
        renderCategories(allCategories);
        populateCategoryDatalist(allCategories);
    }

    // Memulai pengecekan otentikasi saat halaman dimuat
    checkAuth();
});