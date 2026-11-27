# Real-Time News Alerts: Frontend

React + Vite + React Router + Tailwind CSS client for the Real-Time News Alerts API.
The full documentation (features, API, deployment) is in the backend repository's README.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

With `VITE_API_URL` empty, Vite proxies `/api` to the backend on `http://localhost:5000`.
For production builds, set `VITE_API_URL` to the backend URL including `/api`.

## Try it

1. Open the site and press **Create your free account**. Use your own real email address so you can see the alert emails.
2. Pick your topics, choose a frequency and how you want alerts (email and/or browser), then press **Save preferences**.
3. Press **Send me a test alert now** to receive an email right away (check spam if needed).
4. Open **Dashboard** to see every alert you have received.

There are no shared demo credentials: each tester creates their own account.
