# Proyek E-commerce

Proyek ini adalah Toko Aika dengan panel admin, dibuat menggunakan HTML, Tailwind CSS, dan JavaScript. Proyek ini menggunakan API seperti JSONbin untuk manajemen data produk.

## Halaman
- `index.html`: Halaman utama toko yang dilihat pelanggan.
- `admin.html`: Dasbor untuk mengelola produk (operasi CRUD). Sebuah modal login akan muncul di halaman ini jika belum terotentikasi.

## Kredensial Admin
- **Email (plaintext):** aikacungwen30@gmail.com
- **Password (plaintext):** Dragon123

**Penting:** Email dan kata sandi yang disimpan di data API sekarang di-hash menggunakan SHA-256 untuk keamanan.

Hash SHA-256 untuk "aikacungwen30@gmail.com" adalah:
`0dd62283944d18779b5b2931a027964b733796d11f71a08620251786193796b4`

Hash SHA-256 untuk "Dragon123" adalah:
`a01a858137b3554e288e441be84e6f21c251d8b6715b74127025816396f6259e`

Data API Anda di endpoint harus memiliki email dan kata sandi admin yang diatur ke hash ini.

Contoh objek `admin` di data API Anda:
```json
{
  "admin": {
    "email": "0dd62283944d18779b5b2931a027964b733796d11f71a08620251786193796b4",
    "password": "a01a858137b3554e288e441be84e6f21c251d8b6715b74127025816396f6259e"
  },
  "products": [
    ...
  ]
}
```

## API
- **Endpoint:** `https://jsonbin-clone.bisay510.workers.dev/5c18c69e-4267-439c-8b5c-ab787fcfa076`
