# Security Policy & Hardening Guidelines

The **Smart Farm Bot IoT Platform** is designed for critical precision agricultural operations. We treat system availability, telemetry data integrity, hardware relay protection, and user authorization with highest priority.

---

## 🛡 Supported Versions

Security updates and patches are actively maintained for the following versions:

| Version | Supported | Status |
| :--- | :--- | :--- |
| `1.x.x` | ✅ Yes | Active Support & Security Patches |
| `< 1.0.0` | ❌ No | Deprecated / Unsupported |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or exploit within this project, **please do NOT report it in public GitHub issues or discussions.**

Instead, please report it via responsible disclosure:

1. **Email**: Send your findings to `security@agribot.io` (or repository maintainer).
2. **Details to Include**:
   - Component affected (e.g. Next.js Route Handler, ThingSpeak Ingestion Pipe, Supabase RLS Policy, or Edge Middleware).
   - Step-by-step reproduction steps or Proof of Concept (PoC).
   - Potential impact assessment on IoT hardware or customer telemetry logs.
3. **Response Timeline**:
   - **Initial Acknowledgement**: Within 24–48 hours.
   - **Severity Assessment & Triage**: Within 3–5 business days.
   - **Patch Release & Security Advisory**: Within 14 days of confirmed reproduction.

---

## 🔒 Security Architecture & Threat Model

### 1. Supabase Row Level Security (RLS)
- Both `public.profiles` and `public.telemetry_logs` have Row Level Security enabled.
- All client queries are bounded by `auth.uid() = user_id`.
- Unprivileged users can never inspect, alter, or purge other clients' hardware channels or telemetry logs.
- Privileged operations rely on the `public.is_admin()` helper function with `SECURITY DEFINER` verification.

### 2. ThingSpeak API Key Protection & Masking
- ThingSpeak Read API Keys are stored in PostgreSQL protected by Supabase RLS.
- Keys are transmitted exclusively via HTTPS to the ThingSpeak REST API.
- Keys are masked in the administrative user interface by default (`••••••••••••` with toggleable reveal).
- Pre-flight test endpoints do not persist keys to disk and use transient verification.

### 3. Session Security & SSR Cookie Storage
- Authentication uses Google OAuth 2.0 with the **Proof Key for Code Exchange (PKCE)** protocol.
- Auth tokens are managed through `@supabase/ssr` server-side HTTP cookies (`HttpOnly`, `SameSite=Lax`, and `Secure` in production).
- Tokens are automatically refreshed on each request through Next.js Edge Middleware.

### 4. HTTP Security Headers
The following HTTP security headers are enforced across all routes via `next.config.mjs`:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN` (mitigates clickjacking)
- `X-Content-Type-Options`: `nosniff` (prevents MIME type sniffing)
- `Referrer-Policy`: `origin-when-cross-origin`
- `Permissions-Policy`: Restricts camera, microphone, and browser geolocation.

### 5. Hardware Actuator Safeguards
- Manual relay overrides (such as Submersible Pump relay commands) are restricted to authenticated operators.
- Hardware state machine commands must match recognized states: `ACTIVE`, `IRRIGATING`, `PATROLLING`, `STANDBY`.
- Input fields from IoT feeds are parsed and clamped with strict validation to prevent NaN or injection payloads.

---

## 🔍 Security Audit & Dependency Scanning

Automated vulnerability scanning is integrated into the CI/CD pipeline:
- `npm audit --audit-level=high` runs on every pull request and push to `main`.
- GitHub CodeQL static analysis monitors TypeScript code for injections, SSRF, and prototype pollution.
