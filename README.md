# Mini CRM — Client Lead Management System

A full-stack CRM for tracking leads generated from a website contact form: list leads, update their status through a pipeline, and log follow-up notes.

## Features
- Admin authentication (JWT, bcrypt password hashing)
- Lead listing with name, email, phone, source, and status
- Status pipeline: New → Contacted → Converted (or Lost)
- Per-lead follow-up notes, timestamped
- Search by name/email and filter by status
- Dashboard with live counts per status

## Tech Stack
**Frontend:** React (Vite), React Router
**Backend:** Node.js, Express
**Database:** MongoDB (Mongoose)
**Auth:** JWT, bcrypt

## Project Structure
```
mini-crm/
  server/   # Express API (auth + leads)
  client/   # React frontend
```

## Running Locally

**1. Backend**
```bash
cd server
npm install
cp .env.example .env    # set JWT_SECRET and MONGO_URI
npm run dev
```

**2. Frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5175. The API runs on http://localhost:5200.

**Live demo:** https://mini-crm-sepia-kappa.vercel.app

**Demo login:** `demo.crm@gmail.com` / `Demo@1234`

> The backend runs on Render's free plan, so the first request after a while can take up to a minute.

## API
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create admin account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/leads?status=&search= | Yes | List leads, with filters |
| GET | /api/leads/stats/summary | Yes | Count of leads per status |
| POST | /api/leads | Yes | Add a lead |
| PUT | /api/leads/:id | Yes | Update a lead (e.g. status) |
| POST | /api/leads/:id/notes | Yes | Add a follow-up note |
| DELETE | /api/leads/:id | Yes | Delete a lead |

Send the token as `Authorization: Bearer <token>`.
