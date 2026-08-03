# TM Forum frontend

Next.js development interface for the TM Forum party management system.

Copy `.env.example` to `.env.local`, start the backend services, then run `npm install` and `npm run dev`. Open `http://localhost:3000`; Mailpit at `http://localhost:8025` provides verification links. The frontend proxies requests to `BACKEND_API_URL`, avoiding local browser CORS configuration.
