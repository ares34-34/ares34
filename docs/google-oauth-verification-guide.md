# Google OAuth Verification Guide - ARES34

**Last updated:** March 2026
**App:** ARES34 | **Domain:** ares34.com
**Scopes:** `userinfo.email`, `userinfo.profile`, `calendar.readonly`, `calendar.events`

---

## Table of Contents

1. [Overview and Scope Classification](#1-overview-and-scope-classification)
2. [Prerequisites Checklist](#2-prerequisites-checklist)
3. [Step-by-Step Submission Process](#3-step-by-step-submission-process)
4. [Demo Video Requirements](#4-demo-video-requirements)
5. [Common Rejection Reasons and How to Avoid Them](#5-common-rejection-reasons-and-how-to-avoid-them)
6. [Timeline Expectations](#6-timeline-expectations)
7. [Enterprise / Private App Considerations](#7-enterprise--private-app-considerations)
8. [Support Email Requirements](#8-support-email-requirements)
9. [Post-Verification Maintenance](#9-post-verification-maintenance)
10. [Reference Links](#10-reference-links)

---

## 1. Overview and Scope Classification

### Scope Breakdown

| Scope | Classification | Notes |
|-------|---------------|-------|
| `userinfo.email` | Non-sensitive | Basic sign-in |
| `userinfo.profile` | Non-sensitive | Basic sign-in |
| `calendar.readonly` | **Sensitive** | Read calendar events |
| `calendar.events` | **Sensitive** | Read/write calendar events |

### What This Means

- **Sensitive scopes** require Google OAuth verification but do NOT require a third-party
  security audit (CASA/LETA). Only **restricted** scopes (like full Gmail access) require that.
- Until verified, users see an "unverified app" warning screen with a
  "Google hasn't verified this app" message and must click "Advanced" to proceed.
- After verification, users see a clean consent screen with your app name and logo.

### Scope Narrowing Recommendation

If ARES34 only reads calendar data (no creating/modifying events), consider dropping
`calendar.events` and using only `calendar.readonly`. Fewer scopes = faster review and
users grant access more readily. If you need write access, keep both.

---

## 2. Prerequisites Checklist

Complete ALL of these before submitting:

### Domain and Branding

- [ ] **Domain verified** in Google Search Console: https://search.google.com/search-console
  - Verify ownership of `ares34.com` via DNS TXT record or HTML file
  - The domain must appear in your OAuth consent screen's "Authorized domains"
- [ ] **App homepage** hosted on verified domain: `https://ares34.com`
- [ ] **App logo** uploaded (120x120px PNG, no Google trademarks)
- [ ] **App name** set to "ARES34" (must not contain Google product names like
  "Calendar" unless followed by trademark symbol)

### Legal Pages (on verified domain)

- [ ] **Privacy Policy** live at `https://ares34.com/privacy`
  - Must explicitly list each Google scope and what data you access
  - Must describe how Google Calendar data is used, stored, and shared
  - Must include Google API Services User Data Policy compliance (Limited Use)
  - Section 8 (8.1-8.6) already covers this -- verify it matches your actual scopes
- [ ] **Terms of Service** live at `https://ares34.com/terms`
- [ ] Privacy Policy linked from the consent screen must match the one on your homepage

### Technical

- [ ] All redirect URIs use **HTTPS** (no HTTP)
- [ ] OAuth consent screen configured as **External** user type
- [ ] All requested scopes declared in the consent screen configuration
- [ ] Test the full OAuth flow end-to-end in a staging environment

### Support Email

- [ ] Support email configured (see [Section 8](#8-support-email-requirements))
- [ ] Developer contact email configured in consent screen settings

---

## 3. Step-by-Step Submission Process

### Step 1: Configure the OAuth Consent Screen

1. Go to **Google Cloud Console** > **APIs & Services** > **OAuth consent screen**
   - Direct URL: `https://console.cloud.google.com/apis/credentials/consent?project=YOUR_PROJECT_ID`
2. Set **User Type** to "External"
3. Fill in:
   - **App name:** ARES34
   - **User support email:** support@ares34.com (or your chosen email, see Section 8)
   - **App logo:** Upload 120x120px PNG
   - **App homepage:** https://ares34.com
   - **Privacy Policy link:** https://ares34.com/privacy
   - **Terms of Service link:** https://ares34.com/terms
   - **Authorized domains:** ares34.com
   - **Developer contact email:** your developer email
4. Add scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

### Step 2: Verify Domain Ownership

1. Go to **Google Cloud Console** > **APIs & Services** > **Domain verification**
   - Direct URL: `https://console.cloud.google.com/apis/credentials/domainverification?project=YOUR_PROJECT_ID`
2. Click **Add domain** and enter `ares34.com`
3. You will be redirected to Google Search Console to verify ownership
4. Recommended: Use DNS TXT record method (add a TXT record to your DNS)
5. Wait for verification to complete (usually minutes to a few hours)

### Step 3: Prepare the Demo Video

See [Section 4](#4-demo-video-requirements) for detailed requirements.

1. Record the video showing the full OAuth flow
2. Upload to **YouTube** as **Unlisted**
3. Copy the YouTube URL

### Step 4: Submit for Verification

1. Go to the **Verification Center** in Google Cloud Console:
   - Direct URL: `https://console.cloud.google.com/auth/verification?project=YOUR_PROJECT_ID`
   - Alternative: `https://console.developers.google.com/auth/branding?project=YOUR_PROJECT_ID`
2. Or navigate: **APIs & Services** > **OAuth consent screen** > click **"Submit for verification"**
3. Fill in the submission form:
   - **Scopes justification:** Write a clear explanation for each sensitive scope
     (see example below)
   - **YouTube video link:** Paste your unlisted demo video URL
   - **Contact email:** Must be monitored -- Google will email you here
4. Confirm policy compliance checkboxes
5. Click **Submit**

### Scope Justification Examples

Use these as templates:

**For `calendar.readonly`:**
> "ARES34 is an AI-powered executive advisory platform for business leaders.
> We use calendar.readonly to read the user's Google Calendar events so our AI
> agents can provide context-aware business recommendations. For example, if a
> CEO asks about preparing for an upcoming board meeting, ARES34 can reference
> their calendar to identify the meeting date and provide timely advice.
> Calendar data is only accessed when the user explicitly asks a question that
> requires calendar context. Data is not stored permanently and is only used
> within the scope of the user's current query."

**For `calendar.events`:**
> "ARES34 uses calendar.events to allow users to create calendar entries for
> action items recommended by our AI advisory board. When ARES34 recommends
> a strategic action (e.g., schedule a follow-up meeting with investors), the
> user can choose to add it directly to their Google Calendar. Events are only
> created with explicit user consent for each action."

### Step 5: Monitor and Respond

1. Check your developer contact email daily for messages from
   `api-oauth-consent-review@google.com`
2. Google may request clarifications or changes -- respond promptly
3. You can check status in the Verification Center at any time

---

## 4. Demo Video Requirements

### Format and Upload

- **Upload to:** YouTube (via YouTube Studio)
- **Visibility:** **Unlisted** (not Public, not Private)
- **Length:** Keep it concise, ideally 3-7 minutes. No official maximum, but shorter
  and focused videos get reviewed faster.
- **Language:** The consent screen language toggle (bottom-left of Google's consent
  screen) **must be set to English** during recording.
- **Audio:** Not required, but helpful. You can use text annotations instead.

### Required Content (in order)

1. **App overview** (30 seconds)
   - Show the ARES34 homepage at ares34.com
   - Briefly explain what the app does

2. **OAuth consent flow** (1-2 minutes)
   - Start from the point where the user initiates Google Calendar connection
   - Show the complete Google consent screen (ensure language is English)
   - Show the app name "ARES34" and scopes being requested
   - Show the user granting consent
   - Show the redirect back to your app

3. **Demonstrate each sensitive scope** (2-4 minutes)
   - **calendar.readonly:** Show how the app reads and displays calendar data.
     Navigate to a feature that fetches calendar events. Show the data being used
     in context (e.g., AI agent referencing an upcoming meeting).
   - **calendar.events:** Show creating a calendar event from within the app.
     Demonstrate that events are only created with user action/consent.

4. **Data handling** (30 seconds)
   - Show where users can disconnect/revoke Google Calendar access
   - Show any settings related to calendar data management

### Video Tips

- Use a clean test account with realistic (but not sensitive) calendar data
- Make sure the consent screen shows ALL scopes you are requesting
- Record at high resolution (1080p minimum)
- Do NOT speed up the video -- play at normal speed
- Do NOT edit out any part of the consent flow
- If your app has a login step before OAuth, include it
- Show the actual production app at ares34.com (or a staging URL that matches
  your OAuth configuration)

### Recording Tools

- **macOS:** QuickTime Player (File > New Screen Recording) or OBS Studio
- **Chrome extension:** Loom (easy to upload, then download and re-upload to YouTube)

---

## 5. Common Rejection Reasons and How to Avoid Them

### 1. Privacy Policy Does Not Match Scopes

**Problem:** Your privacy policy does not explicitly mention the Google data you access,
or uses vague language like "we may collect information."

**Fix for ARES34:** Verify that Section 8 of your privacy policy at
`https://ares34.com/privacy` explicitly lists:
- `calendar.readonly` and `calendar.events` scopes by name
- Exactly what calendar data you read (event titles, dates, attendees, etc.)
- How the data is used (AI context for advisory responses)
- How long data is retained
- That data is not sold or shared with third parties
- Google API Services User Data Policy / Limited Use compliance

### 2. Homepage Does Not Link to Privacy Policy

**Problem:** Google checks that your homepage (ares34.com) has a visible link to the
same privacy policy URL you provided in the consent screen.

**Fix for ARES34:** Ensure the footer of ares34.com includes a link to
`https://ares34.com/privacy`. The link text should say "Aviso de Privacidad" or
"Privacy Policy."

### 3. App Name Contains Google Trademarks

**Problem:** If your app name or description includes words like "Google," "Calendar,"
"Gmail," etc. without proper trademark attribution.

**Fix for ARES34:** The app name "ARES34" does not contain Google trademarks, so this
should not be an issue. However, in your app description on the consent screen, if you
mention "Google Calendar," use the full name (not just "Calendar") and do not imply
Google endorsement.

### 4. Demo Video Is Incomplete

**Problem:** Video does not show the full OAuth flow, skips the consent screen, or
does not demonstrate how each scope is used.

**Fix for ARES34:** Follow the video checklist in Section 4 exactly. The most common
miss is not showing how each individual scope is used in the app.

### 5. Scope Justification Is Too Vague

**Problem:** Writing something like "We need calendar access for our app" without
explaining the specific feature.

**Fix for ARES34:** Use the detailed justification templates in Step 4 of Section 3.
Reference specific features and user workflows.

### 6. HTTP Redirect URIs

**Problem:** Using `http://` instead of `https://` for redirect URIs.

**Fix for ARES34:** Ensure all OAuth redirect URIs in your Google Cloud Console
credentials use `https://ares34.com/...` (Vercel provides HTTPS by default).

### 7. Requesting More Scopes Than Demonstrated

**Problem:** Your consent screen requests scopes that your demo video does not show
being used.

**Fix for ARES34:** Every scope listed must have a corresponding feature demonstrated
in the video. If you request `calendar.events` (write), show a calendar event being
created.

### 8. Mismatched Domains

**Problem:** The domain in your OAuth redirect URIs does not match your verified
authorized domain.

**Fix for ARES34:** All redirect URIs should use `ares34.com` (the verified domain).

---

## 6. Timeline Expectations

### Typical Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Preparation (prerequisites) | 1-3 days | Domain verification, video, policy review |
| Brand verification | 2-3 business days | Google verifies domain ownership and branding |
| Sensitive scope review | 3-5 business days | Google reviews scope justifications and video |
| Revisions (if needed) | +3-7 business days per round | If Google requests changes |
| **Total (happy path)** | **1-2 weeks** | If no revisions needed |
| **Total (with revisions)** | **2-4 weeks** | 1-2 rounds of revisions |

### What Affects Timeline

- **Quality of submission:** Complete, detailed submissions with good videos get
  approved faster
- **Responsiveness:** Reply to Google's emails within 24 hours to avoid delays
- **Scope count:** More sensitive scopes = more scrutiny
- **Holiday periods:** Google's review team may be slower during US holidays

### During Review

- Your app continues to work for users already authorized
- New users will see the "unverified app" warning until approved
- You can have up to 100 test users while unverified (configured in the
  OAuth consent screen)
- Do NOT modify your consent screen configuration during review (this can
  reset the process)

---

## 7. Enterprise / Private App Considerations

### Important: Internal vs. External User Type

ARES34 is a private, invitation-only platform. There are two paths:

#### Option A: Internal User Type (Google Workspace only)

If ALL your users are within a single Google Workspace organization:
- Set user type to **"Internal"** in the consent screen
- **No verification needed** -- sensitive scopes are auto-approved for internal apps
- Users must be members of your Google Workspace domain
- **Limitation:** Only works if you have Google Workspace and all users are on
  your domain (e.g., @ares34.com)

#### Option B: External User Type (recommended for ARES34)

Since ARES34 users have their own Google accounts (gmail.com, custom domains, etc.):
- Set user type to **"External"**
- **Verification IS required** even though the app is private
- The 100 test user limit applies while unverified
- After verification, any Google account can authorize (no user cap)

### Recommendation for ARES34

Use **External** user type and go through verification because:
1. Your users (CEOs, founders) use various Google accounts, not a single Workspace domain
2. The "unverified app" warning looks unprofessional for an enterprise product
3. The 100 test user limit will eventually be restrictive
4. Verification is a one-time process for sensitive (non-restricted) scopes

### Private App Tips

- In your scope justification, explain that ARES34 is an enterprise platform
  available by invitation only. Google does not penalize private apps -- they
  just need to see that data handling is responsible.
- Your demo video should still show the full flow even though users are invited.
- The privacy policy should mention that access is by invitation, which actually
  strengthens your case (smaller, controlled user base = lower risk).

---

## 8. Support Email Requirements

### Yes, You Need a Custom Domain Email

Google requires a **User Support Email** on the OAuth consent screen. While you CAN
use a personal Gmail, it looks unprofessional for an enterprise product and may raise
flags during review.

### Recommended Setup

**Create:** `support@ares34.com`

**Steps to make it work with Google Cloud Console:**

1. **Set up email forwarding** for `support@ares34.com` in your DNS/email provider
   (Vercel, Cloudflare, etc.) to forward to your actual inbox.

2. **Register as a Google Account:**
   - Go to: https://accounts.google.com/SignUpWithoutGmail
   - Create a Google account using `support@ares34.com`
   - Google will send a verification email to confirm access

3. **Add as project owner** in Google Cloud Console:
   - Go to **IAM & Admin** > **IAM**
   - Add `support@ares34.com` as a principal with "Owner" role

4. **Select in consent screen:**
   - The email will now appear in the "User support email" dropdown

### Alternative: Google Group

Instead of a direct email, you can create a Google Group:
1. Go to https://groups.google.com
2. Create a group (e.g., `ares34-support@googlegroups.com`)
3. Add team members to the group
4. Use this group email as the User Support Email

### Developer Contact Email

Separately, you need a **Developer contact email** in the consent screen. This is where
Google sends review communications. Use a monitored email -- missing Google's emails
will delay your verification.

---

## 9. Post-Verification Maintenance

### Ongoing Requirements

- **Sensitive scopes:** No annual re-verification required (only restricted scopes
  require annual re-verification)
- **Adding new scopes:** If you add new sensitive scopes later, you must re-submit
  for verification
- **Scope changes:** Removing scopes does not require re-verification
- **Privacy policy:** Must remain accessible and accurate at all times
- **Domain:** Must remain verified in Google Search Console

### If You Change Scopes Later

1. Update your consent screen configuration with new scopes
2. Update your privacy policy to reflect the new data access
3. Record a new demo video showing the new scope usage
4. Re-submit for verification (only the new scopes are reviewed)

---

## 10. Reference Links

### Google Cloud Console Pages

- OAuth consent screen: `https://console.cloud.google.com/apis/credentials/consent`
- Credentials (API keys, OAuth clients): `https://console.cloud.google.com/apis/credentials`
- Domain verification: `https://console.cloud.google.com/apis/credentials/domainverification`
- Verification Center: `https://console.cloud.google.com/auth/verification`
- IAM (for adding support email): `https://console.cloud.google.com/iam-admin/iam`

### Google Documentation

- OAuth App Verification Help Center: https://support.google.com/cloud/answer/13463073
- Verification Requirements: https://support.google.com/cloud/answer/13464321
- Submitting for Verification: https://support.google.com/cloud/answer/13461325
- Demo Video Requirements: https://support.google.com/cloud/answer/13804565
- Sensitive Scope Verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
- OAuth 2.0 Policies: https://developers.google.com/identity/protocols/oauth2/policies
- Google API Services User Data Policy: https://developers.google.com/terms/api-services-user-data-policy
- Policy Compliance: https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance
- Calendar API Scopes: https://developers.google.com/workspace/calendar/api/auth
- Brand Verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification

### Useful Third-Party Guides

- Nylas Google OAuth Verification Guide: https://www.nylas.com/blog/google-oauth-app-verification/
- Ryan Schiang's 2024 Walkthrough: https://ryanschiang.com/google-oauth-verification-what-to-expect
- CloudSponge Demo Video Guide: https://www.cloudsponge.com/blog/google-oauth-verification-video/

---

## Quick Reference: Submission Checklist

```
PRE-SUBMISSION
[ ] Domain ares34.com verified in Google Search Console
[ ] Privacy policy live at https://ares34.com/privacy with Google Calendar section
[ ] Terms of service live at https://ares34.com/terms
[ ] Homepage links to privacy policy in footer
[ ] support@ares34.com created and registered as Google Account
[ ] support@ares34.com added as project Owner in IAM
[ ] All OAuth redirect URIs use HTTPS
[ ] OAuth consent screen fully configured (External user type)
[ ] All 4 scopes declared in consent screen

DEMO VIDEO
[ ] Recorded full OAuth consent flow (English language toggle)
[ ] Showed calendar.readonly usage (reading events)
[ ] Showed calendar.events usage (creating events)
[ ] Showed revocation/disconnect option
[ ] Uploaded to YouTube as Unlisted
[ ] Video is 3-7 minutes, normal speed, 1080p+

SUBMISSION
[ ] Scope justifications written (specific, feature-based)
[ ] YouTube link pasted
[ ] Developer contact email is monitored
[ ] Policy compliance checkboxes confirmed
[ ] Clicked "Submit for verification"

POST-SUBMISSION
[ ] Monitoring email daily for Google review team messages
[ ] NOT modifying consent screen during review
```
