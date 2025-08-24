# Multi-stage Docker build for Sudan Digital Identity System
# Optimized for production deployment with security and performance

# Stage 1: Build Environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add build metadata
LABEL maintainer="Sudan Digital Transformation Initiative <digital@sudan.gov.sd>"
LABEL version="1.0.0"
LABEL description="Sudan National Digital Identity System"

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production --no-audit --no-fund

# Copy all source code
COPY . .

# Build arguments for environment configuration
ARG REACT_APP_OID_BASE=1.3.6.1.4.1.61026.1
ARG REACT_APP_API_URL=https://api.sudan.gov.sd
ARG REACT_APP_BLOCKCHAIN_NETWORK=sudan-mainnet
ARG REACT_APP_BIOMETRIC_SERVICE_URL=https://biometric.sudan.gov.sd
ARG NODE_ENV=production

# Set environment variables for build
ENV REACT_APP_OID_BASE=$REACT_APP_OID_BASE
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_BLOCKCHAIN_NETWORK=$REACT_APP_BLOCKCHAIN_NETWORK
ENV REACT_APP_BIOMETRIC_SERVICE_URL=$REACT_APP_BIOMETRIC_SERVICE_URL
ENV NODE_ENV=$NODE_ENV
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Build the application
RUN npm run build

# Stage 2: Production Runtime
FROM nginx:1.25-alpine AS runtime

# Install security updates and required packages
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    tini \
    curl \
    ca-certificates

# Create non-root user for security
RUN addgroup -g 1001 -S sudanapp && \
    adduser -S sudanuser -u 1001 -G sudanapp

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy enhanced Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx configuration for the app
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
# Sudan Digital Identity System Nginx Configuration
server {
    listen 3000;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.sudan.gov.sd wss:; manifest-src 'self';" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml
        text/plain
        text/css
        text/xml
        text/javascript
        application/xml
        application/rss+xml;
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html;
    
    # Main location block
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://api.sudan.gov.sd/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass 1;
        proxy_no_cache 1;
        expires off;
    }
    
    # Manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
        expires off;
    }
}
EOF

# Create directories and set permissions
RUN mkdir -p /var/cache/nginx /var/run/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R sudanuser:sudanapp /var/cache/nginx /var/run/nginx /var/log/nginx /usr/share/nginx/html /var/run/nginx.pid

# Create health check script
RUN cat > /usr/local/bin/healthcheck << 'EOF'
#!/bin/sh
curl -f http://localhost:3000/health || exit 1
EOF
RUN chmod +x /usr/local/bin/healthcheck

# Security: Remove unnecessary files and set permissions
RUN rm -rf /tmp/* /var/tmp/* && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER sudanuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
