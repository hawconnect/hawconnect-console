# Console configuration and deployment

## Local settings

Copy `.env.example` to `.env.local`:

```dotenv
APP_URL=http://localhost:43127
SESSION_SECRET=REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
HAWCONNECT_ADMIN_API_URL=http://localhost:4000/api/admin
# Where admins sign in (production: https://account.hawconnect.de)
HAWCONNECT_LOGIN_URL=http://account.localhost:4000
```

Generate the session secret locally, for example with `openssl rand -base64 32`; never commit it.

The backend needs matching settings:

```dotenv
HAWCONNECT_CONSOLE_ORIGIN=http://localhost:43127
HAWCONNECT_ADMIN_EMAILS=maintainer@example.org
# At least 32 random characters
HAWCONNECT_OIDC_SECRET_HAWCONNECT_CONSOLE=
```

An account needs a bootstrap grant or a delegated capability to use the console; an email domain alone grants nothing. The console holds no database credentials; the backend owns the database and all migrations. Encrypted HttpOnly cookies keep the backend session token; capability, origin and CSRF checks, version conflicts and audit records stay on the backend.

## Announcement and club images (Cloudflare R2)

Image uploads and the image gallery use R2 when configured. Set these **runtime-only** variables on the console server, never as `VITE_*` or build arguments:

```dotenv
HAWCONNECT_R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
HAWCONNECT_R2_BUCKET=hawconnect-assets
HAWCONNECT_R2_ACCESS_KEY_ID=YOUR_BUCKET_ACCESS_KEY_ID
HAWCONNECT_R2_SECRET_ACCESS_KEY=YOUR_BUCKET_SECRET_ACCESS_KEY
HAWCONNECT_R2_PUBLIC_URL=https://assets.hawconnect.de
HAWCONNECT_R2_PREFIX=dash-images/
```

- Create an R2 API credential with Object Read & Write access limited to this bucket.
- Enable public read access through an R2 custom domain and use its HTTPS address as `HAWCONNECT_R2_PUBLIC_URL`. The S3 API endpoint is only for authenticated server uploads and listing.
- The prefix must be a dedicated, non-empty folder name such as `dash-images/`. Club images use the `clubs/` subfolder beneath it. Use this bucket only for public images, never personal or private files.
- Uploads go through the console's server, which checks the user's permission before touching R2, so browser CORS and presigned URLs are not needed.
- Accepted: JPEG, PNG, WebP and GIF up to 5 MiB, checked by type, size and file signature on the server. SVG and other formats are rejected. Objects get random, immutable names.
- Replacing or removing an image in a form only detaches it; stored objects are never deleted automatically.
- The gallery reads at most ten pages of 1,000 objects and reports an error rather than showing an incomplete list.

Without R2, entering an HTTPS image URL still works; uploads and the gallery show a configuration error. References: [S3 SDK configuration](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/), [public custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Deployment with Coolify

Create a Dockerfile application from the repository root using `/Dockerfile`, internal port **3000**, domain `https://console.hawconnect.de`:

```dotenv
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_URL=https://console.hawconnect.de
HAWCONNECT_ADMIN_API_URL=https://api.hawconnect.de/api/admin
HAWCONNECT_LOGIN_URL=https://account.hawconnect.de
SESSION_SECRET=YOUR_STABLE_PRIVATE_SESSION_SECRET
```

Set these in Coolify's runtime environment and the matching `HAWCONNECT_CONSOLE_ORIGIN` on the backend. The image has a health check at `/api/health`. Runtime changes need a restart; build-time changes need a rebuild. Do not log request bodies, tokens or private data.

The footer and sign-in page link to the legal pages on hawconnect.de in the console's current language; legal texts are not edited in the console.
