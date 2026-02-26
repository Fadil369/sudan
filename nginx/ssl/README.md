# SSL/TLS certificates (optional)

This folder is mounted into the `nginx` container at `/etc/nginx/ssl`.

If you enable HTTPS in `nginx/nginx.conf`, place your certificate and key here (example names):
- `cert.pem`
- `key.pem`

For local development you can keep HTTP-only (default).

