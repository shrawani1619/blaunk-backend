# IP Whitelisting System

Secure IP whitelisting for the backend using **MongoDB**. Only requests from allowed IPs can access the API (except admin and health routes).

## Database (MongoDB)

- **Collection:** `allowedips` (Mongoose model: `AllowedIp`)
- **Fields:** `_id`, `serviceProvider` (String), `ipAddress` (String, unique), `createdAt`, `updatedAt`
- Uses the same MongoDB connection as the rest of the app (no PostgreSQL).

### Mongoose usage examples

```js
const AllowedIp = require('./models/AllowedIp');

// List all
const list = await AllowedIp.find({}).sort({ createdAt: 1 }).lean();

// Add (upsert by ipAddress)
const doc = await AllowedIp.findOneAndUpdate(
  { ipAddress: '192.168.1.1' },
  { $set: { serviceProvider: 'AIRTEL' } },
  { new: true, upsert: true }
);

// Check if allowed
const found = await AllowedIp.findOne({ ipAddress: '192.168.1.1' });

// Delete by id
await AllowedIp.findByIdAndDelete(id);
```

## APIs (admin – no whitelist applied)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/add-ip` | Add allowed IP |
| GET | `/admin/ip-list` | Get all allowed IPs |
| DELETE | `/admin/delete-ip/:id` | Remove IP by id |

### POST /admin/add-ip

**Body (JSON):**

```json
{
  "service_provider": "AIRTEL",
  "ip_address": "192.168.1.1"
}
```

**Response (201):**

```json
{
  "success": true,
  "row": {
    "id": "...",
    "service_provider": "AIRTEL",
    "ip_address": "192.168.1.1",
    "created_at": "2025-03-13T12:00:00.000Z"
  }
}
```

(`id` is the MongoDB `_id` string.)

### GET /admin/ip-list

**Response (200):**

```json
{
  "list": [
    {
      "id": "...",
      "service_provider": "AIRTEL",
      "ip_address": "192.168.1.1",
      "created_at": "2025-03-13T12:00:00.000Z"
    }
  ]
}
```

### DELETE /admin/delete-ip/:id

**Response (200):** `{ "success": true }`  
**404:** IP entry not found. (`id` is MongoDB `_id`.)

## Middleware: checkIPWhitelist

- **Location:** `middleware/checkIPWhitelist.js`
- **Behaviour:**
  - Reads client IP from `x-forwarded-for` (first IP), then `x-real-ip`, then `req.socket.remoteAddress` (strips `::ffff:` for IPv4-mapped).
  - If **no IPs** are in the whitelist, all requests are allowed (bootstrap).
  - Paths **bypassed:** `/health`, `/admin`, `/admin/*` (so you can manage the whitelist from any IP).
  - For all other routes: if the client IP is **not** in the whitelist, responds with **403** and body `{ "message": "Access Denied: Unauthorized IP" }`.

## Reverse proxy (Nginx)

Ensure the real client IP is forwarded:

```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Example usage (curl)

```bash
# Bootstrap: add your IP (works from any IP because /admin is bypassed)
curl -X POST http://localhost:5000/admin/add-ip \
  -H "Content-Type: application/json" \
  -d '{"service_provider":"Office","ip_address":"203.0.113.50"}'

# List allowed IPs
curl http://localhost:5000/admin/ip-list

# Delete IP (use the id from the list response)
curl -X DELETE http://localhost:5000/admin/delete-ip/<mongo_id>

# From a non-whitelisted IP, any other route returns 403
curl http://localhost:5000/api/auth/login
# {"message":"Access Denied: Unauthorized IP"}
```

## File layout

```
backend/src/
├── models/AllowedIp.js
├── middleware/checkIPWhitelist.js
├── services/ipWhitelistService.js
├── controllers/adminIpWhitelistController.js
└── routes/adminIpWhitelistRoutes.js
```
