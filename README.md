# Jason Herrera — Interactive Resume
## Deployment Guide (~15 minutes)

Your resume is a static HTML file that talks to Airtable through a secure
serverless proxy. The Airtable token never appears in your browser or page
source — it lives only in Netlify's encrypted environment variables.

---

## What's in this folder

```
index.html                      ← the resume itself
netlify.toml                    ← tells Netlify how to route /api calls
netlify/functions/airtable.js   ← the secure proxy (never touches the browser)
README.md                       ← this file
```

---

## Step 1 — Create a GitHub account (skip if you have one)

1. Go to **github.com** → click **Sign up**
2. Enter your email, create a password, choose a username
3. Verify your email when prompted
4. You now have a free account — no credit card needed

---

## Step 2 — Create a new repository

1. Once signed in, click the **+** icon (top right) → **New repository**
2. Fill in:
   - **Repository name:** `resume` (or anything you like)
   - **Visibility:** Private ← recommended
   - Leave everything else unchecked
3. Click **Create repository**
4. You'll land on an empty repo page — leave this tab open

---

## Step 3 — Upload your files

GitHub lets you drag and drop files directly in the browser.

1. On your empty repo page, click **uploading an existing file**
   (small link near the bottom of the quick setup section)
2. Open Finder and navigate to the folder you unzipped
3. Select ALL four items at once and drag them into the GitHub upload area:
   - `index.html`
   - `netlify.toml`
   - `README.md`
   - the `netlify` **folder** (drag the whole folder)
4. Scroll down → click **Commit changes**

   > ⚠️  GitHub's drag-and-drop doesn't always pick up nested folders
   > reliably. If `netlify/functions/airtable.js` doesn't appear after
   > uploading, see the Troubleshooting section at the bottom.

5. Your repo should now show:
   ```
   netlify/functions/airtable.js
   index.html
   netlify.toml
   README.md
   ```

---

## Step 4 — Create a Netlify account (skip if you have one)

1. Go to **app.netlify.com** → click **Sign up**
2. Choose **Sign up with GitHub** — Netlify will automatically see your repos
3. Authorize Netlify when GitHub asks

---

## Step 5 — Connect your repo to Netlify

1. In Netlify, click **Add new site → Import an existing project**
2. Click **GitHub**
3. Find and click your `resume` repo
4. On the "Configure your site" screen:
   - **Branch to deploy:** `main` (already selected)
   - **Build command:** leave blank
   - **Publish directory:** leave blank
5. Click **Deploy site**

Netlify deploys in ~30 seconds. You'll get a live URL like
`https://random-words-123456.netlify.app` — it will show an error
until we add your Airtable credentials in the next step.

---

## Step 6 — Add your Airtable credentials

1. In Netlify → **Site configuration** (left sidebar) → **Environment variables**
2. Click **Add a variable** and add these two exactly as shown:

   | Key                 | Value                                                                                  |
   |---------------------|----------------------------------------------------------------------------------------|
   | `AIRTABLE_TOKEN`    | `patdgCvcqU32w6Uj2.e1c55019f30ae9f6871b3496a835b3b0aa51d6c5d33476d3899c61203f8915bf` |
   | `AIRTABLE_BASE_ID`  | `appqdiYeV7oRWhUc1`                                                                    |

   > Copy-paste exactly — no extra spaces.

3. Click **Save variables**

---

## Step 7 — Trigger a redeploy

Environment variables only take effect on the next deploy.

1. Go to the **Deploys** tab in Netlify
2. Click **Trigger deploy → Deploy site**
3. Wait ~30 seconds for the green "Published" badge

Open your live URL — the resume should load with all your data. 🎉

---

## Step 8 — Rename your URL (optional, 2 minutes)

1. **Site configuration → General → Site details → Change site name**
2. Type something like `jason-herrera-resume`
3. Your URL becomes `https://jason-herrera-resume.netlify.app`

---

## Step 9 — Custom domain (optional)

If you want `resume.aptos.legal` or similar:
1. **Domain management → Add a domain**
2. Enter your domain → Netlify provides DNS records to add at your registrar
3. SSL certificate is provisioned automatically (free)

---

## Updating your resume

**Content** (add a project, update a skill, edit anything):
→ Make changes directly in Airtable → refresh the live page
→ No redeployment needed

**Design** (HTML/CSS changes):
→ Replace `index.html` in your GitHub repo
→ Netlify auto-redeploys in ~30 seconds

---

## Troubleshooting

**The netlify folder didn't upload**
GitHub's web UI sometimes drops nested folders. Fix:
1. In your repo → **Add file → Upload files**
2. Navigate into the unzipped `netlify/functions/` folder on your Mac
3. Drag just `airtable.js` into the upload area
4. Change the file path field to `netlify/functions/airtable.js`
5. Commit

**Site loads but shows an error**
- Verify both environment variables are saved (no typos, no extra spaces)
- Make sure you triggered a new deploy after saving variables
- Check **Functions** tab in Netlify for error logs

---

## How the security works

```
Browser → /api/airtable?table=Projects
              ↓
       Netlify Function (airtable.js)
       reads AIRTABLE_TOKEN from encrypted env
              ↓
       Airtable API  ← token only travels server-side
              ↓
       JSON returned to browser (data only, never the token)
```
