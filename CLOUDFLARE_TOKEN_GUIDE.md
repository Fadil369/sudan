# 🔑 Cloudflare API Token - Required Permissions

## Current Issue

**Error Code:** 10000 - Authentication error  
**Failed Operations:**
- Deploy to Cloudflare Pages
- Deploy Cloudflare Worker

## ✅ Required API Token Permissions

### Create New API Token

1. **Go to Cloudflare Dashboard:**
   - URL: https://dash.cloudflare.com/profile/api-tokens
   - Click **"Create Token"**

2. **Use Custom Token (Not Template):**
   - Click **"Create Custom Token"**
   - Or start with "Edit Cloudflare Workers" template and modify

---

## 📋 Exact Permissions Needed

### For Cloudflare Pages + Workers Deployment

**Token Name:** `GitHub Actions - Sudan Portal Deployment`

### Account-Level Permissions

| Resource | Permission | Reason |
|----------|-----------|--------|
| **Cloudflare Pages** | **Edit** | Deploy to Pages, create projects |
| **Workers Scripts** | **Edit** | Deploy Worker API |
| **Workers KV Storage** | **Edit** | Create/manage KV namespaces |
| **D1** | **Edit** | Create databases, run migrations |
| **Account Settings** | **Read** | Verify account access |

### Zone-Level Permissions (If Using Custom Domain)

| Resource | Permission | Reason |
|----------|-----------|--------|
| **DNS** | **Edit** | Configure custom domain DNS |
| **Page Rules** | **Edit** | Set up redirects/rules |

### Account Resources

**Include:** Your Cloudflare account  
**Account:** Select your specific account (not "All accounts")

---

## 🎯 Step-by-Step Token Creation

### Method 1: Using UI (Recommended)

1. **Visit:** https://dash.cloudflare.com/profile/api-tokens

2. **Click "Create Token"**

3. **Click "Create Custom Token"**

4. **Configure Token:**

   **Token Name:** `GitHub-Actions-Sudan-Portal`

   **Permissions:**
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **Account Settings** → **Read**

5. **Account Resources:**
   - **Include** → Select your specific account
   - (Don't select "All accounts" - security best practice)

6. **Client IP Address Filtering (Optional):**
   - Leave empty for GitHub Actions
   - Or add GitHub Actions IP ranges if you want extra security

7. **TTL (Time to Live):**
   - Recommended: **1 year** (default)
   - Or custom expiration

8. **Click "Continue to Summary"**

9. **Review and Create:**
   - Verify all permissions
   - Click **"Create Token"**

10. **Copy Token Immediately:**
    - ⚠️ **You can only see it once!**
    - Copy the entire token string
    - Store it securely

---

### Method 2: Using Wrangler CLI

```bash
# Login to Cloudflare
npx wrangler login

# This will generate a token automatically with appropriate permissions
# Token saved to ~/.wrangler/config/default.toml
```

---

## 🔧 Update GitHub Secrets

### Add/Update the Token

1. **Go to GitHub Repository Settings:**
   ```
   https://github.com/Fadil369/sudan/settings/secrets/actions
   ```

2. **Update `CLOUDFLARE_API_TOKEN`:**
   - Click on the secret name
   - Click **"Update secret"**
   - Paste the new token
   - Click **"Update secret"**

3. **Verify `CLOUDFLARE_ACCOUNT_ID`:**
   - Make sure this is also set
   - Find your Account ID at: https://dash.cloudflare.com/
   - It's shown in the right sidebar (32-character hex string)

---

## 📝 Minimal Permissions (If You Want to Restrict)

If you only want to deploy Pages (without Workers):

**Minimal Set:**
- **Account** → **Cloudflare Pages** → **Edit**
- **Account** → **Account Settings** → **Read**

**For Full Sudan Portal (Pages + Workers + D1):**
- **Account** → **Cloudflare Pages** → **Edit**
- **Account** → **Workers Scripts** → **Edit**
- **Account** → **Workers KV Storage** → **Edit**
- **Account** → **D1** → **Edit**
- **Account** → **Account Settings** → **Read**

---

## 🎯 Visual Guide

### Token Creation Screen Example

```
┌─────────────────────────────────────────────────┐
│ Create Custom Token                              │
├─────────────────────────────────────────────────┤
│                                                  │
│ Token name                                       │
│ ┌──────────────────────────────────────────┐   │
│ │ GitHub-Actions-Sudan-Portal              │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ Permissions                                      │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Account  ▼   Cloudflare Pages  ▼  Edit  ▼│   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Account  ▼   Workers Scripts   ▼  Edit  ▼│   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Account  ▼   Workers KV Storage ▼ Edit  ▼│   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Account  ▼   D1                 ▼ Edit  ▼│   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Account  ▼   Account Settings   ▼ Read  ▼│   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ Account Resources                                │
│ ┌──────────────────────────────────────────┐   │
│ │ Include ▼  Your Account (abc123...)      │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ [ Continue to summary ]                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ✅ After Creating Token

### Update GitHub Secret

```bash
# The new token will look like:
# aBcD1234eFgH5678iJkL9012mNoPqRsTuVwXyZ...

# Add to GitHub:
1. Go to: https://github.com/Fadil369/sudan/settings/secrets/actions
2. Click: CLOUDFLARE_API_TOKEN
3. Click: "Update secret"
4. Paste: [your new token]
5. Save
```

### Re-trigger Deployment

```bash
# Option 1: Manual re-run
# Go to: https://github.com/Fadil369/sudan/actions
# Click latest failed run → Re-run all jobs

# Option 2: Push new commit
git commit --allow-empty -m "🔑 Retry deployment with updated API token"
git push origin main
```

---

## 🧪 Test Token Permissions

Before updating GitHub secrets, test locally:

```bash
# Set token temporarily
export CLOUDFLARE_API_TOKEN="your-new-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Test Pages deployment
npx wrangler pages deploy dist --project-name=sudan-gov

# Test Worker deployment
npx wrangler deploy workers/api/index.js --name sudan-gov-api

# If both succeed ✅ → Token has correct permissions
# If either fails ❌ → Check permissions again
```

---

## 🚨 Common Mistakes

### ❌ Wrong Permission Level
```
Account → Cloudflare Pages → Read  ❌
Should be: Edit ✅
```

### ❌ Zone-Level Instead of Account-Level
```
Zone → Cloudflare Pages → Edit  ❌
Should be: Account → Cloudflare Pages → Edit ✅
```

### ❌ Missing Permissions
```
Only Cloudflare Pages  ❌
Need: Pages + Workers Scripts + KV + D1 ✅
```

### ❌ "All Accounts" Selected
```
Account Resources: All accounts  ⚠️ (works but overly permissive)
Should be: Specific account ✅ (security best practice)
```

---

## 📖 Reference Links

**Cloudflare API Token Docs:**
- https://developers.cloudflare.com/fundamentals/api/get-started/create-token/

**Pages API Permissions:**
- https://developers.cloudflare.com/pages/platform/api/

**Workers API Permissions:**
- https://developers.cloudflare.com/workers/wrangler/api/

**GitHub Actions with Cloudflare:**
- https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

---

## 🎯 Quick Checklist

Before re-running deployment:

- [ ] Created new API token at https://dash.cloudflare.com/profile/api-tokens
- [ ] Added **Account** → **Cloudflare Pages** → **Edit**
- [ ] Added **Account** → **Workers Scripts** → **Edit**
- [ ] Added **Account** → **Workers KV Storage** → **Edit**
- [ ] Added **Account** → **D1** → **Edit**
- [ ] Added **Account** → **Account Settings** → **Read**
- [ ] Selected specific account (not "All accounts")
- [ ] Copied token immediately (shown only once!)
- [ ] Updated GitHub secret `CLOUDFLARE_API_TOKEN`
- [ ] Verified GitHub secret `CLOUDFLARE_ACCOUNT_ID` is set
- [ ] Ready to re-trigger deployment

---

## 💡 Pro Tip: Test Locally First

Save time by testing the token locally before updating GitHub:

```bash
# 1. Export token
export CLOUDFLARE_API_TOKEN="your-new-token"

# 2. Quick test
npx wrangler whoami

# Expected output if token is valid:
# ✓ Getting User settings...
# 👋 You are logged in with an API Token, associated with email '...'
```

If `wrangler whoami` succeeds, your token is valid! ✅

---

**Next Step:** Create the token with these permissions, update GitHub secret, then re-trigger the workflow! 🚀
