# Child Adoption System — Admin Backend (.NET)

## What's in here

```
database/database.sql          -- MySQL schema (updated: adds social_workers, home_visits, system_settings)
api/ChildAdoptionAdmin.Api/    -- .NET 8 Web API project (admin backend only)
```

## Schema changes from your original file

Your admin portal UI needs two entities that weren't in the original schema, so I added them (you gave the go-ahead to modify the DB):

- **`social_workers`** — separate table, not just another admin role, since social workers have their own login, district/area assignment, and are referenced by home visits.
- **`home_visits`** — links an `adoption_request` to a `social_worker`, with scheduling fields and the visit report fields shown in your "Home Visit Details" mockup (overall impression, family environment, financial stability, family support, concerns, remarks).
- **`system_settings`** — simple key/value table backing the "System Settings" screen (general, roles, application, notification, document settings panels all read/write into this).
- Added `role` and `status` to `admins`, and `reviewed_by_admin_id` to `adoption_requests` so you can track which admin actioned an application.

Notifications were intentionally left out of the backend, per your instruction.

## Setup

1. **Database**
   ```bash
   mysql -u root -p < database/database.sql
   ```
   (uses the credentials you gave me — root / your MySQL password — update `appsettings.json` if these differ per environment)

2. **Backend**
   ```bash
   cd api/ChildAdoptionAdmin.Api
   dotnet restore
   dotnet run
   ```
   Swagger UI will be at `https://localhost:<port>/swagger` — use it to test every endpoint and log in first via `/api/auth/login`.

3. **Default login** (seeded in database.sql)
   - Email: `admin@cdac.org`
   - Password: `Admin@123`
   - **Change this immediately** — the seeded hash is a placeholder; regenerate it with BCrypt before using in anything beyond local dev, or just register a real admin and delete the seed row.

## Endpoint map (screen → API)

| Screen | Endpoints |
|---|---|
| 1. Login | `POST /api/auth/login` |
| 2. Dashboard | `GET /api/dashboard/stats`, `GET /api/dashboard/recent-activity` |
| 3. User Management | `GET/POST/PUT/DELETE /api/social-workers`, `GET/POST /api/admins` |
| 4. Add Social Worker | `POST /api/social-workers` |
| 5. Parent Management | `GET /api/parents`, `GET /api/parents/{id}`, `PUT /api/parents/{id}/status` |
| 6. Child Management | `GET/POST/PUT/DELETE /api/children` |
| 7. Applications | `GET /api/applications`, `PUT /api/applications/{id}/review` |
| 9–10. Home Visits | `GET/POST /api/home-visits`, `PUT /api/home-visits/{id}/complete`, `PUT .../cancel` |
| 11. Reports | `GET /api/reports/{application-summary|home-visits|child-matching|adoption-decisions|monthly-activity|user-activity}` |
| 13. System Settings | `GET/PUT /api/settings` |
| 14. Admin Profile | `GET/PUT /api/admins/me`, `PUT /api/admins/me/password` |
| 15. Logout | Handled client-side (discard JWT) — no endpoint needed |

## Not included

- **Notifications** — skipped per your instruction.
- **File upload** for photos/documents — `profile_photo`, `file_path` etc. are plain string columns right now (store a URL/path). If you want actual file upload handling (e.g. to local disk or S3), tell me and I'll add it.
- **Spring Boot user-service integration** — this admin API reads/writes the `users` table directly against the shared MySQL DB. If instead the Spring Boot service should own that table and the admin API should call it over REST, let me know — that's a different design (service-to-service calls instead of shared DB access) and worth deciding deliberately before you build more on top of this.
