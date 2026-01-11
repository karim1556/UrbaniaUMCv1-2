Local MongoDB for Urbania (development)

1) Start local MongoDB via Docker Compose (from `server/`):

```bash
# from project/server
docker compose up -d
```

2) Point the server to local DB:

- Copy `.env.local.example` to `.env` in `server/` and ensure `MONGODB_URI` is set to:

```
MONGODB_URI=mongodb://localhost:27017/UrbaniaConnective2
```

3) Start the server:

```bash
# from project/server
npm install
npm run dev
```

4) (Optional) Seed an admin user:

```bash
# from project root
node create-admin.js
```

5) Run frontends:

- `easy-admin-craft-main` (admin UI) runs at http://localhost:8080
- `urbania-connective-main` (user site) runs at its configured dev port

Both frontends expect the API at `http://localhost:4000` by default.

Notes:
- If you prefer to use a cloud MongoDB (Atlas), leave `server/.env` set to that URI.
- If Docker is not available, install MongoDB locally and update `MONGODB_URI` accordingly.

Supabase option (replace MongoDB)
---------------------------------

If you'd prefer Supabase (hosted Postgres + auth + storage), follow these steps:

1. Create a new project on https://app.supabase.com and note the `URL` and `Service Role Key` (or `anon` key for client use).

2. Add the values to `server/.env` (or copy from `.env.local.example`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

3. The project includes a `server/supabaseClient.js` helper that reads the env vars and exports a Supabase client.

4. Migration notes:
- The current server uses Mongoose models and MongoDB documents.
- You will need to create equivalent SQL tables in Supabase. Typical tables: `admins`, `users`, `donations`, `events`, `registrations`, etc.
- Use Supabase Studio (Table editor) or SQL migration scripts in the SQL editor to create tables and define constraints/indexes.
- Adjust server code that uses Mongoose models to instead use Supabase queries (via `supabaseClient.js`) or add an adapter layer.

5. Seeding admin user:
- You can create an `admins` row in Supabase manually or run a small script that inserts the admin using the service role key.

6. Run the server:

```
# from project/server
npm install
npm run dev
```

If you want, I can:
- scaffold SQL table CREATE statements for the main models based on the existing Mongoose schemas, or
- implement an adapter layer that lets the server call Supabase for auth-related endpoints first.
