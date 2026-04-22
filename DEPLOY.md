# SallonArt — Free Production Deployment Guide

Deploy for real customers at **zero cost** using Render (hosting) + Neon (PostgreSQL database).

## Step 1: Create Neon PostgreSQL Database (2 minutes)

1. Go to https://neon.tech → Sign up with GitHub
2. Click **"Create Project"**
3. Fill in:
   - **Project name:** `sallonart` (or customer's salon name)
   - **Database name:** `sallon`
   - **Region:** Singapore (closest to Sri Lanka)
4. Click **Create Project**
5. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/sallon?sslmode=require`)

Save this — you need it in Step 2.

## Step 2: Deploy to Render (5 minutes)

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your **MuhandiramTB/Sallon** repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `sallonart` (or your customer's salon name) |
| **Region** | Singapore |
| **Branch** | `main` |
| **Build Command** | `cd client && npm install && npm run build && cd ../server && npm install` |
| **Start Command** | `cd server && node src/index.js` |
| **Instance Type** | **Free** |

5. Click **"Advanced"** → Add these **Environment Variables**:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `<paste Neon connection string from Step 1>` | Required |
| `JWT_SECRET` | `<random 64-char string>` | Use https://randomkeygen.com/ |
| `ADMIN_EMAIL` | `owner@customersalon.com` | Customer's email |
| `ADMIN_PASSWORD` | `<strong password>` | Give to customer |
| `SALON_NAME` | `Customer's Salon Name` | Displays in UI |
| `PRIMARY_COLOR` | `#1e1e2e` | Dark theme |
| `SECONDARY_COLOR` | `#c9a96e` | Gold accent |

6. Click **"Create Web Service"**

Wait 3-5 minutes. You'll get a URL like `https://sallonart.onrender.com`.

## Step 3: Give to Your Customer

Send your customer:

```
Your salon booking system is ready!

Website: https://sallonart.onrender.com
Admin login: owner@customersalon.com / [password]

Steps:
1. Login as admin
2. Add service categories (Boys, Ladies, Spa)
3. Add services with prices
4. Share the website link on your WhatsApp
5. Customers book online, you confirm from dashboard
```

## Free Tier Limitations

| Limit | Details | Impact |
|-------|---------|--------|
| **Render sleep** | Sleeps after 15 min idle | First visit after sleep: 30-sec delay |
| **Neon free** | 0.5GB DB, auto-suspends after 5 min | ~5 sec wake-up for DB |
| **Bandwidth** | 100GB/month on Render | Plenty for small salon |
| **Uptime** | 99% on free (not guaranteed SLA) | Acceptable for most small salons |

## Upgrade Path (When Customer Grows)

| Issue | Solution | Cost |
|-------|----------|------|
| Want always-on (no sleep) | Render Starter Plan | $7/month |
| Need more DB storage | Neon Scale Plan | $19/month |
| Custom domain | Available FREE on Render | $0 |

## Managing Multiple Customers

Each customer = separate Render service from same GitHub repo:

```
Customer A: sallonart.onrender.com         (Salon Owner: Kumari)
Customer B: glamour-studio.onrender.com    (Salon Owner: Fathima)
Customer C: kings-barber.onrender.com      (Salon Owner: Ashan)
```

Each has **its own Neon database** — data is completely isolated.

## Troubleshooting

**Site shows "Application Error":**
- Check Render logs → most likely missing env var
- Verify `DATABASE_URL` starts with `postgresql://`
- Verify `JWT_SECRET` is set
- Verify `NODE_ENV=production`

**Login doesn't work:**
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars on Render
- Watch the deploy logs for "Admin user seeded: ..."

**Database errors:**
- Go to Neon dashboard → check if DB is active
- If suspended, just visit your site — it'll wake up

## Pricing Model for Your Customers

| Plan | What They Get | Suggested Price |
|------|---------------|-----------------|
| **Basic** | Free Render + Neon | Rs. 5,000 setup only |
| **Pro** | Render paid ($7/mo) — always on | Rs. 8,000 setup + Rs. 2,000/month |
| **Premium** | Pro + email notifications | Rs. 10,000 setup + Rs. 3,000/month |
