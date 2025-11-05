# Proyek E-commerce

Proyek ini adalah Toko Aika dengan panel admin, dibuat menggunakan HTML, Tailwind CSS, dan JavaScript. Proyek ini menggunakan API seperti JSONbin untuk manajemen data produk.

## Halaman
- `index.html`: Halaman utama toko yang dilihat pelanggan.
- `admin.html`: Dasbor untuk mengelola produk (operasi CRUD). Sebuah modal login akan muncul di halaman ini jika belum terotentikasi.

## Kredensial Admin
- **Email (plaintext):** aikacungwen30@gmail.com
- **Password (plaintext):** Dragon123

**Penting:** Email dan kata sandi yang disimpan di data API di-hash menggunakan SHA-256 **dengan salt unik per field** untuk keamanan. Skema login yang baru mengharuskan data admin di API memiliki `email_salt` dan `password_salt` selain hash `email` dan `password`.

Proses hashingnya adalah:
- `hashed_email = sha256(plaintext_email + email_salt)`
- `hashed_password = sha256(plaintext_password + password_salt)`

Aplikasi admin (`js/admin.js`) akan mengambil salt ini dari API dan menggunakannya untuk memverifikasi kredensial yang dimasukkan oleh pengguna.

Contoh objek `admin` di data API Anda:
```json
{
  "admin": {
    "email_salt": "salt_unik_untuk_email_anda",
    "email": "hash_dari_email_dan_salt_email",
    "password_salt": "salt_unik_untuk_password_anda",
    "password": "hash_dari_password_dan_salt_password"
  },
  "products": [
    ...
  ]
}
```

## API
- **Endpoint:** `https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076`
