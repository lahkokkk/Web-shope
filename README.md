# Aika Shop Project

This is a simple e-commerce storefront project with a customer-facing shop and an admin panel for product management.

## Project Structure

- `index.html`: The main storefront page.
- `cart.html`: The shopping cart page.
- `login.html` / `register.html` / `akun.html`: User authentication pages.
- `admin/`: Contains the admin panel for managing products and categories.
- `js/`: Contains the JavaScript files for frontend logic.
  - `main.js`: Logic for the main shop page (fetching products, modals, filtering).
  - `cart.js`: Logic for the shopping cart page.
  - `auth.js`: Logic for user login, registration, and session management.
  - `theme.js`: Dark/light theme toggler.
- `styles/`: Contains the CSS for the project.
- `workers/`: Contains backend serverless functions (Cloudflare Workers).
  - `auth-worker.js`: Handles user data (login/registration).

## Backend Setup (Cloudflare Workers)

This project uses Cloudflare Workers for its backend logic instead of a static JSON file host. This provides a more secure and scalable solution.

### 1. `auth-worker.js` (User Authentication)

This worker manages user data (registration and login).

**How to Deploy:**

1.  **Install Wrangler:** Make sure you have the Cloudflare CLI `wrangler` installed. `npm install -g wrangler`.
2.  **Login:** Authenticate wrangler with your Cloudflare account: `wrangler login`.
3.  **Create a KV Namespace:** You need a place to store user data. Create a KV namespace via the Cloudflare dashboard or using wrangler:
    ```bash
    wrangler kv:namespace create "USER_DATA_KV"
    ```
    This command will give you a namespace ID.
4.  **Create `wrangler.toml`:** Create a `wrangler.toml` file in the root of your project with the following content. Replace placeholders with your actual details.

    ```toml
    name = "aika-shop-auth" # Your worker's name
    main = "workers/auth-worker.js" # Path to the worker script
    compatibility_date = "2023-10-30"

    [[kv_namespaces]]
    binding = "USER_DATA_KV" # This must match the binding in the worker script
    id = "your_kv_namespace_id_here" # The ID from the previous step
    ```

5.  **Deploy:** Run the deploy command from your project root:
    ```bash
    wrangler deploy
    ```
6.  **Update Frontend API URL:** After deploying, Cloudflare will give you a URL for your worker (e.g., `https://aika-shop-auth.your-username.workers.dev`). You must update the `API_URL` constant in `js/auth.js` to point to this new URL.

    ```javascript
    // In js/auth.js
    const API_URL = 'https://aika-shop-auth.your-username.workers.dev';
    ```

### Important Note on API URLs vs. Secrets

A common question is: "Can I use Cloudflare Worker's 'Variables and Secrets' to store the API URL for the frontend?"

The answer is **no**, and it's important to understand why:

1.  **Secrets are Server-Side Only:** Secrets and variables set in your Cloudflare Worker's dashboard are only accessible by the worker's code *on the server*. They are never sent to the user's browser. This is a crucial security feature. You use them to store private API keys that your worker needs to call *other* services (e.g., a database password or a payment gateway API key).

2.  **The Frontend Needs the Public URL:** Your JavaScript files (`js/auth.js`, `js/main.js`) run in the user's browser. For the browser to send a request to your worker, it *must* know the worker's public URL. This URL is not a secret; it's the public address of your backend.

**Correct Implementation (as used in this project):**

-   You deploy your Cloudflare Worker (e.g., `auth-worker.js`).
-   Cloudflare gives you a public URL (e.g., `https://aika-shop-auth.your-username.workers.dev`).
-   You put this public URL into the `API_URL` constant in your frontend JavaScript (`js/auth.js`).

This is the correct and standard way to connect a static frontend to a serverless backend. The worker script in this project (`auth-worker.js`) only communicates with a KV store (using `env.USER_DATA_KV`), so it doesn't require any secrets itself.
