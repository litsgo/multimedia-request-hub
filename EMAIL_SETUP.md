# Email Notification System Setup

The Multimedia Request Hub now includes an automated email notification system that sends status update notifications to employees when their task status changes.

## How It Works

1. When an admin updates a task status in the Dashboard
2. The system automatically sends an email to the employee's registered email address
3. The email includes task details and the new status

## Setup Instructions

### 1. Get a Resend API Key

The email system uses **Resend** as the email service provider (free tier available at https://resend.com).

- Sign up for a free account at https://resend.com
- Create an API key from the dashboard
- Copy your API key

### 2. Configure Environment Variables

Add the Resend API key to your Supabase project:

```bash
# Run this command in your terminal
supabase secrets set RESEND_API_KEY="your_api_key_here"
```

Or through the Supabase Dashboard:
1. Go to Project Settings > Configuration > Secrets
2. Add new secret with key: `RESEND_API_KEY`
3. Paste your API key as the value
4. Save

### 3. Deploy Edge Function

The email sending function is located at `supabase/functions/send-email/`.

Deploy it with:
```bash
supabase functions deploy send-email
```

### 4. Update Email From Address (Optional)

In `supabase/functions/send-email/index.ts`, you can customize the sender email:

```typescript
from: "noreply@multimediahub.com", // Change this to your domain
```

Make sure you have domain verification setup with Resend if using a custom domain.

## Email Content

The automated emails include:
- **Task ID**: Unique identifier for the request
- **Task Type**: Type of multimedia request (tarpaulin, video, poster, etc.)
- **Current Status**: Updated status (pending, in progress, completed, cancelled)
- **Task Description**: What was requested
- **Deadline**: Target completion date

## Testing

### Local Testing

To test emails locally:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the admin dashboard and update a task status

3. Check browser console for logs:
   - Success: "Email notification sent successfully to: employee@email.com"
   - Error: "Failed to send email notification" with error details

### Test Email Address

For testing, you can use Resend's test email setup:
- During development, use a test email address in your employee profile
- Resend will show test emails in your dashboard

## Troubleshooting

### "Failed to send email notification"

**Check the following:**
1. Is `RESEND_API_KEY` set correctly in Supabase secrets?
2. Is the Edge Function deployed? Run: `supabase functions deploy send-email`
3. Does the employee have a valid email address in their profile?
4. Check browser console for detailed error messages

### Email Not Arriving

1. Check Supabase Function logs: `supabase functions logs send-email`
2. Verify email address is correct in the request
3. Check spam/junk folder
4. For custom domains, ensure domain verification is complete in Resend

### CORS Issues

The Edge Function has CORS headers configured for all origins. If you see CORS errors:
1. Clear browser cache
2. Try in an incognito/private window
3. Check that the Supabase URL is correct in `src/services/emailService.ts`

## Alternative Email Services

The system can be adapted to use other email providers:

### SendGrid
- Replace Resend with SendGrid SDK
- Use `SENDGRID_API_KEY` environment variable
- Update function to use SendGrid client

### Mailgun
- Similar setup as SendGrid
- Configure domain with Mailgun
- Update function accordingly

### Custom SMTP
- Create a Node.js API endpoint
- Use nodemailer or similar library
- Configure SMTP credentials

Contact support or check the Supabase documentation for specific implementation details.

## File Structure

```
supabase/
  functions/
    send-email/
      index.ts          # Edge Function that sends emails
      
src/
  services/
    emailService.ts    # Client-side email service wrapper
    
src/components/
  RequestsTable.tsx    # Calls sendStatusUpdateEmail on status change
```

## Security Notes

- API keys are stored securely in Supabase secrets
- Email addresses come from verified employee records
- The Edge Function validates required fields before sending
- CORS is restricted to your Supabase domain in production
