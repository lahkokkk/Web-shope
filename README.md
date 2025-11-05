# E-commerce Project

This project is a Aika Shop with an admin panel, built using HTML, Tailwind CSS, and JavaScript. It uses a JSONbin-like API for product data management.

## Pages
- `index.html`: The main customer-facing storefront.
- `admin.html`: The dashboard for managing products (CRUD operations). A login modal will appear on this page if not authenticated.

## Admin Credentials
- **Email (plaintext):** aikacungwen30@gmail.com
- **Password (plaintext):** Dragon123

**Important:** The email and password stored in the API data are now hashed using SHA-256 for security.

The SHA-256 hash for "aikacungwen30@gmail.com" is:
`0dd62283944d18779b5b2931a027964b733796d11f71a08620251786193796b4`

The SHA-256 hash for "Dragon123" is:
`a01a858137b3554e288e441be84e6f21c251d8b6715b74127025816396f6259e`

Your API data at the endpoint should have the admin email and password set to these hashes.

Example `admin` object in your API data:
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
