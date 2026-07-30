# Aashray React Frontend

React + Vite frontend for the Child Adoption Admin API.

## Setup

1. Start the .NET API at `http://localhost:5080`.
2. Copy `.env.example` to `.env`.
3. Run:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

Default administrator:
- Email: `admin@cdac.org`
- Password: `Admin@123`

## Important backend note
The current backend supports listing/reviewing adoption applications but does not provide a parent-facing `POST /api/applications` endpoint. Therefore this frontend does not pretend to submit applications from a parent account.
