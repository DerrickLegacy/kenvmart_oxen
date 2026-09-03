# Publishing a Node.js + React App on Hostinger

## Target deployment

This guide is tailored to the current website:

- Domain: `kenvmart.kenvies.com`
- Hosting: Business Web Hosting
- Hosting account: `u547313549`
- Public directory: `/home/u547313549/domains/kenvmart.kenvies.com/public_html`

The recommended production design is **one Node.js application** that:

1. Runs the API.
2. Serves the compiled React files from `dist/`.
3. Listens on Hostinger's assigned `PORT`.
4. Uses `/api/...` for backend requests.

Do not run Vite's development server as the production website.

---

## 1. Prepare the application locally

### Recommended project structure

```text
project/
├── client/                 # React/Vite source
│   ├── src/
│   ├── index.html
│   └── package.json
├── server/
│   └── index.js            # Production Node entry point
├── package.json            # Root production scripts
├── package-lock.json
└── .gitignore
```

A single-root project is also fine. The important requirements are that the production start file exists and that the server can serve the React build.

### Root `package.json`

Use scripts similar to these, adapting the paths to the actual project:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite --host 0.0.0.0",
    "dev:server": "node --watch server/index.js",
    "build": "npm run build:client",
    "build:client": "npm --prefix client install && npm --prefix client run build",
    "start": "node server/index.js"
  }
}
```

If dependencies are already managed from the root, use the equivalent root-level build command instead. The key rules are:

- `build` must produce the production React files.
- `start` must launch the production Node server.
- `start` must not run Vite, `npm run dev`, `nodemon`, or `node --watch`.

### Verify locally

Run:

```bash
npm install
npm run build
npm start
```

Open the local URL shown by the application and test:

- The homepage loads.
- A direct refresh of routes such as `/dashboard` works.
- API requests such as `/api/health` work.
- Login, database access, uploads, and forms work.
- No browser request points to `localhost`, `127.0.0.1`, port `5173`, or a private development address.

---

## 2. Configure the production server

The Node server must use Hostinger's environment port:

```js
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Application listening on ${port}`);
});
```

Do not hard-code port `5173`, `4500`, or another local development port.

For an Express application serving a Vite React build, the production logic should be equivalent to:

```js
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Register API routes before the SPA fallback.
// app.use('/api/users', usersRouter);

const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));

// For React Router browser routes, return index.html for non-API paths.
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Production server listening on ${port}`);
});
```

If the backend and frontend use different folders, change `clientDist` to the real build location. Confirm that `dist/index.html` exists after `npm run build`.

For CommonJS, use `require()` instead of `import`, according to the project's `package.json`.

---

## 3. Fix frontend API configuration

The production React app should normally call the same domain with relative URLs:

```js
fetch('/api/health');
```

Avoid this in production:

```js
fetch('http://localhost:4500/api/health');
fetch('http://127.0.0.1:4500/api/health');
```

If Vite environment variables are used:

```env
VITE_API_URL=/api
```

Then call `${import.meta.env.VITE_API_URL}/...`.

Only use a separate API hostname when the team has intentionally configured DNS, HTTPS, CORS, and the backend deployment for it.

---

## 4. Commit the production configuration

Before deployment:

```bash
git add .
git commit -m "Prepare production deployment"
git push origin main
```

The repository should include:

- `package.json`
- `package-lock.json` or the package manager lockfile
- the Node production entry point
- React source files
- build configuration

Do not commit:

- `.env` files containing passwords or private keys
- `node_modules/`
- local databases unless explicitly required
- development-only configuration

Example `.gitignore`:

```text
node_modules/
.env
.env.*
!.env.example
dist/
logs/
```

---

## 5. Create/configure the Node.js application in hPanel

In hPanel, open the Node.js application area for `kenvmart.kenvies.com` and configure:

1. **Application root**: the directory containing the production `package.json`.
2. **Application URL/domain**: `kenvmart.kenvies.com`.
3. **Node.js version**: a version supported by the application and all dependencies.
4. **Application mode**: production.
5. **Entry file/start file**: the production entry point, for example `server/index.js`, if the panel asks for one.
6. **Build command**: `npm run build`.
7. **Start command**: `npm start` or the panel's equivalent start command.
8. **Repository/branch**: the repository and production branch used by the team.
9. **Environment variables**: add each production value in the panel, not in committed files.

If the panel uses a separate deployment directory, make sure the domain points to the Node.js application rather than only to an empty `public_html` folder. Do not manually copy only the React source into `public_html` and expect Node to execute it.

The exact field names can differ by hPanel interface version. The values above are the important part.

---

## 6. Add production environment variables

Add values such as:

```text
NODE_ENV=production
DATABASE_URL=...
JWT_SECRET=...
CORS_ORIGIN=https://kenvmart.kenvies.com
```

Use the real names expected by the application. Do not add quotes unless the application specifically requires them.

Important:

- Never paste secrets into frontend variables beginning with `VITE_`; those are exposed to browsers.
- Use HTTPS in production URLs.
- If a database is used, confirm its hostname, port, database name, username, password, and SSL requirements.
- Restart/redeploy after changing environment variables.

---

## 7. Deploy and restart

Use the panel's deployment action after saving the configuration. The deployment must complete these stages:

1. Fetch the selected branch.
2. Install dependencies.
3. Run `npm run build`.
4. Start `npm start`.
5. Attach the application to `kenvmart.kenvies.com`.

After deployment, restart the Node.js application from hPanel if the panel provides a restart action.

Do not treat a successful Git fetch as a successful website deployment. The build and application startup logs must also be successful.

---

## 8. Validate the live deployment

Test these URLs:

```text
https://kenvmart.kenvies.com/
https://kenvmart.kenvies.com/api/health
```

Then test a deep React route directly, for example:

```text
https://kenvmart.kenvies.com/login
```

Use the browser developer tools and confirm:

- The document returns HTTP 200.
- JavaScript files return HTTP 200 rather than 404.
- API requests go to `/api/...` on the correct domain.
- There are no `localhost` requests.
- There are no CORS errors.
- The console has no uncaught JavaScript exception.

A blank page with HTTP 200 usually means the server is reachable but the React bundle failed to load or crashed in the browser. Check the browser console and the Node runtime log, not just the web-server error log.

---

## 9. Troubleshooting checklist

### Build fails

Check the deployment build log for:

- Unsupported Node.js version.
- Missing dependency in `package.json`.
- Incorrect working directory.
- TypeScript or ESLint errors configured as build failures.
- Missing environment variable required at build time.

### Application starts then stops

Check the Node runtime log for:

- `Cannot find module`.
- Syntax/module-format errors.
- Database connection failure.
- Missing environment variables.
- Port binding errors.
- File paths that work on Windows but not Linux.

### Blank page but HTTP 200

Check:

- Browser console for a JavaScript exception.
- Network tab for failed JS/CSS files.
- Whether `dist/index.html` references the correct asset paths.
- Whether Vite `base` is incorrectly set to a local or subdirectory path.
- Whether the server serves `dist`.
- Whether the SPA fallback returns `index.html` for React routes.

### API returns 404

Check:

- API routes are registered before the SPA fallback.
- The frontend calls `/api/...`.
- The server process running in production is the intended entry file.
- The application root is correct.

### Direct React routes return 404

Add the SPA fallback after all API routes:

```js
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});
```

### Database requests time out

Check the database host and port from the hosting database settings. Do not use `localhost` unless the database is actually on the same server and the application is configured for it. Ensure the application is using production credentials from hPanel environment variables.

---

## 10. Required handover information for developers

The developer who deploys the application should provide:

- Repository and production branch.
- Application root.
- Build command.
- Start command.
- Node.js version.
- List of environment variable names, excluding their secret values.
- Production health-check URL.
- Database connection status.
- Confirmation that React deep links work.
- The final deployment log showing build success and application startup.

The final acceptance test is not just “the domain opens.” It is:

```text
Homepage loads
API health check returns success
Login works
Database operations work
Refresh on a React deep link works
No localhost requests appear in the browser
No uncaught browser or Node runtime errors remain
```