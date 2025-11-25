# Netlify Deployment Guide

This guide will help you deploy the Optimus website to Netlify using GitHub integration.

## Prerequisites

- A GitHub account
- A Netlify account (sign up at [netlify.com](https://netlify.com))
- SMTP credentials for sending emails (Gmail, SendGrid, etc.)

## Step 1: Push Your Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Netlify ready"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com](https://github.com) and create a new repository
   - Name it something like `optimus-website`

3. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/optimus-website.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Connect GitHub to Netlify

1. **Log in to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with your GitHub account (recommended for easier integration)

2. **Create a new site from Git**:
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your GitHub repositories if prompted
   - Select your `optimus-website` repository

3. **Configure build settings**:
   - **Build command**: `npm run build` (or leave empty - the build script will run automatically)
   - **Publish directory**: `static`
   - **Functions directory**: `netlify/functions`

   Netlify should auto-detect these from `netlify.toml`, but verify they match:
   ```
   Build command: npm run build
   Publish directory: static
   Functions directory: netlify/functions
   ```

4. **Click "Deploy site"**

## Step 3: Configure Environment Variables

After the initial deployment, you need to set up SMTP environment variables:

1. **Go to Site Settings**:
   - In your Netlify dashboard, click on your site
   - Go to **Site settings** → **Environment variables**

2. **Add the following environment variables**:
   - `SMTP_HOST` - Your SMTP server hostname (e.g., `smtp.gmail.com`)
   - `SMTP_PORT` - SMTP port (usually `587` for TLS or `465` for SSL)
   - `SMTP_USER` - Your SMTP username/email
   - `SMTP_PASS` - Your SMTP password or app-specific password
   - `CONTACT_RECIPIENT` - Email address to receive inquiries (e.g., `optimusbcc@gmail.com`)
   - `CONTACT_SENDER` - Email address to send from (optional, defaults to `CONTACT_RECIPIENT`)

3. **Example for Gmail**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password
   CONTACT_RECIPIENT=optimusbcc@gmail.com
   CONTACT_SENDER=no-reply@optimusbcc.co.zm
   ```

   **Note**: For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the app password as `SMTP_PASS`

4. **Redeploy**:
   - After adding environment variables, go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**

## Step 4: Test Your Deployment

1. **Visit your site**:
   - Netlify will provide a URL like `https://your-site-name.netlify.app`
   - You can also set up a custom domain later

2. **Test the contact form**:
   - Fill out the contact form on your site
   - Submit it and verify you receive the email

3. **Test PDF download**:
   - Click the "Download Company Profile" button
   - Verify the PDF downloads correctly

## Step 5: Set Up Custom Domain (Optional)

1. **Go to Domain settings**:
   - In your Netlify dashboard, go to **Domain settings**

2. **Add custom domain**:
   - Click "Add custom domain"
   - Enter your domain name (e.g., `optimusbcc.co.zm`)
   - Follow Netlify's instructions to configure DNS

3. **Enable HTTPS**:
   - Netlify automatically provisions SSL certificates via Let's Encrypt
   - HTTPS will be enabled once DNS is configured

## Continuous Deployment

Once connected to GitHub, every push to your `main` branch will automatically:
1. Trigger a new build on Netlify
2. Run the build script (copies Images and Profile folders)
3. Deploy the updated site
4. Run serverless functions with the latest code

**To update your site**:
```bash
git add .
git commit -m "Update website content"
git push origin main
```

Netlify will automatically rebuild and deploy within 1-2 minutes.

## Troubleshooting

### Contact Form Not Working

1. **Check environment variables**:
   - Verify all SMTP variables are set correctly in Netlify dashboard
   - Check for typos in variable names

2. **Check function logs**:
   - Go to **Functions** tab in Netlify dashboard
   - Click on `contact` function
   - View logs to see any errors

3. **Test SMTP credentials**:
   - Verify your SMTP credentials work with a test email client
   - For Gmail, ensure you're using an app-specific password

### Images or PDFs Not Loading

1. **Verify build script ran**:
   - Check build logs to ensure `build.js` copied Images and Profile folders
   - Look for "✓ Images folder copied successfully" in logs

2. **Check file paths**:
   - Ensure all image paths in HTML are relative (e.g., `Images/logo.jpg` not `/Images/logo.jpg`)
   - Verify PDF link uses relative path: `Profile/filename.pdf`

### Build Failures

1. **Check build logs**:
   - Go to **Deploys** tab → Click on failed deploy → View logs

2. **Common issues**:
   - Missing `package.json` dependencies
   - Build script errors
   - Incorrect publish directory

## File Structure

Your repository structure should look like this:
```
/
├── static/              # Publish directory (served as root)
│   ├── index.html
│   ├── projects-gallery.html
│   ├── script.js
│   ├── style.css
│   ├── Images/         # Copied during build
│   └── Profile/        # Copied during build
├── Images/             # Source folder (at root for GitHub)
├── Profile/            # Source folder (at root for GitHub)
├── netlify/
│   └── functions/
│       └── contact.js  # Serverless function
├── build.js            # Build script
├── netlify.toml        # Netlify configuration
├── package.json
└── server.js           # Old Express server (not used in production)
```

## Support

For issues or questions:
- Check Netlify documentation: [docs.netlify.com](https://docs.netlify.com)
- Check Netlify community: [community.netlify.com](https://community.netlify.com)
- Contact: mbmwenya@gmail.com

