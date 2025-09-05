# Affiliate System Implementation

This document describes the complete affiliate system implementation for the My Dating DNA project.

## Overview

The affiliate system allows users to earn 40% commission on sales they refer through their unique affiliate links. The system includes:

- **180-day cookie tracking** for affiliate attribution
- **30-day hold period** before commissions are locked
- **Automatic commission calculation** at 40% of subtotal
- **Comprehensive dashboard** for affiliates to track performance
- **Admin panel** for payout management
- **Stripe webhook integration** for real-time commission tracking

## System Architecture

### Database Models

1. **Affiliate** - Stores affiliate information
2. **AffiliateClick** - Tracks clicks on affiliate links
3. **AffiliateAttribution** - Records affiliate attributions
4. **Order** - Stores order information with affiliate codes
5. **Commission** - Tracks commission calculations and status
6. **Payout** - Manages payout periods
7. **PayoutItem** - Individual payout items per affiliate

### Key Features

- **Last-click attribution model** - The most recent affiliate link clicked gets credit
- **Automatic commission voiding** for refunds and disputes
- **Monthly payout schedule** with CSV export functionality
- **Real-time dashboard** showing clicks, conversions, and earnings
- **Admin tools** for managing payouts and viewing all affiliate data

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── affiliate/
│   │       ├── register/route.ts          # Affiliate registration
│   │       ├── dashboard/route.ts         # Affiliate dashboard data
│   │       ├── admin/route.ts             # Admin panel endpoints
│   │       └── cron/
│   │           └── lock-commissions/route.ts  # Cron job for locking commissions
│   ├── webhooks/
│   │   └── affiliate/route.ts             # Stripe webhook handler
│   ├── affiliates/page.tsx                # Affiliate dashboard frontend
│   └── admin/affiliates/page.tsx          # Admin panel frontend
├── lib/
│   └── models/
│       ├── Affiliate.ts                   # Affiliate model
│       ├── AffiliateClick.ts              # Click tracking model
│       ├── AffiliateAttribution.ts        # Attribution model
│       ├── Order.ts                       # Order model
│       ├── Commission.ts                  # Commission model
│       ├── Payout.ts                      # Payout model
│       └── PayoutItem.ts                  # Payout item model
├── components/ui/                         # UI components
└── middleware.ts                          # Affiliate tracking middleware
```

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local`:

```env
# Existing variables...
STRIPE_AFFILIATE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CRON_SECRET=your_cron_secret_here
```

### 2. Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs
```

### 3. Stripe Webhook Configuration

1. Go to your Stripe Dashboard
2. Navigate to Webhooks
3. Create a new webhook endpoint: `https://yourdomain.com/api/webhooks/affiliate`
4. Select these events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Copy the webhook secret to your environment variables

### 4. Vercel Cron Job (if using Vercel)

The `vercel.json` file is already configured to run the commission locking cron job daily at 2 AM UTC.

## Usage

### For Affiliates

1. **Registration**: Visit `/affiliates` to register as an affiliate
2. **Dashboard**: View your performance metrics, commissions, and payout information
3. **Sharing**: Use your unique affiliate link (`?ref=YOURCODE`) to refer customers
4. **Tracking**: Monitor clicks, conversions, and earnings in real-time

### For Admins

1. **Admin Panel**: Visit `/admin/affiliates` to manage the affiliate system
2. **Payout Management**: Create payouts for specific date ranges
3. **CSV Export**: Export payout data for external payment processing
4. **Commission Tracking**: View all commissions and their statuses

## Commission Flow

1. **Click Tracking**: When someone clicks an affiliate link (`?ref=CODE`), a cookie is set for 180 days
2. **Purchase**: During checkout, the affiliate code is passed to Stripe via metadata
3. **Commission Creation**: When payment is successful, a commission record is created with "pending" status
4. **Hold Period**: Commissions remain pending for 30 days to allow for refunds
5. **Locking**: After 30 days, commissions are automatically locked (via cron job)
6. **Payout**: Admins can create payouts for locked commissions and export CSV files
7. **Payment**: After external payment, commissions are marked as "paid"

## API Endpoints

### Affiliate Endpoints

- `POST /api/affiliate/register` - Register as an affiliate
- `GET /api/affiliate/dashboard` - Get affiliate dashboard data

### Admin Endpoints

- `GET /api/affiliate/admin?action=payouts` - Get all payouts
- `GET /api/affiliate/admin?action=commissions` - Get all commissions
- `GET /api/affiliate/admin?action=affiliates` - Get all affiliates
- `POST /api/affiliate/admin` - Create payouts, export data, mark as paid

### Webhook Endpoints

- `POST /api/webhooks/affiliate` - Stripe webhook handler

### Cron Endpoints

- `POST /api/affiliate/cron/lock-commissions` - Lock pending commissions

## Security Considerations

1. **Admin Access**: Currently allows any authenticated user to access admin features. Implement proper role-based access control in production.
2. **Cron Security**: The cron endpoint requires a secret token for security.
3. **Webhook Verification**: Stripe webhooks are verified using the webhook secret.
4. **Data Validation**: All inputs are validated before database operations.

## Customization

### Commission Rate

To change the commission rate, update the `COMMISSION_RATE` constant in `/src/app/api/webhooks/affiliate/route.ts`:

```typescript
const COMMISSION_RATE = 0.40; // Change to desired rate (e.g., 0.30 for 30%)
```

### Hold Period

To change the hold period, update the `HOLD_DAYS` constant in the same file:

```typescript
const HOLD_DAYS = 30; // Change to desired days
```

### Cookie Duration

To change the cookie duration, update the `maxAge` in `/middleware.ts`:

```typescript
response.cookies.set("aff_code", refCode.toUpperCase(), {
  maxAge: 15552000, // Change to desired seconds (180 days = 15552000)
  // ... other options
});
```

## Testing

### Test the Complete Flow

1. Register as an affiliate
2. Use your affiliate link to visit the site
3. Make a test purchase
4. Check the affiliate dashboard for the commission
5. Wait 30 days (or manually trigger the cron job) to see the commission lock
6. Create a payout in the admin panel
7. Export the CSV and mark as paid

### Manual Cron Job Testing

You can manually trigger the commission locking by making a POST request to `/api/affiliate/cron/lock-commissions` with the proper authorization header.

## Troubleshooting

### Common Issues

1. **Commissions not appearing**: Check if the webhook is properly configured and the affiliate code is being passed in Stripe metadata
2. **Cookie not setting**: Ensure the middleware is properly configured and the affiliate code exists in the database
3. **Cron job not running**: Verify the Vercel cron configuration and check the logs

### Debugging

- Check the browser's developer tools for cookie values
- Monitor the Stripe webhook logs
- Check the database for commission records
- Verify the cron job execution in Vercel logs

## Support

For issues or questions about the affiliate system, check:

1. The webhook logs in Stripe Dashboard
2. The application logs in your hosting platform
3. The database for data consistency
4. The browser console for frontend issues

## Future Enhancements

Potential improvements to consider:

1. **Recurring Commissions**: Support for subscription-based commissions
2. **Tiered Commission Rates**: Different rates based on performance
3. **Affiliate Onboarding**: Automated approval process
4. **Advanced Analytics**: More detailed reporting and insights
5. **Multi-currency Support**: Support for different currencies
6. **API Rate Limiting**: Implement rate limiting for API endpoints
7. **Audit Logging**: Track all changes to commissions and payouts
