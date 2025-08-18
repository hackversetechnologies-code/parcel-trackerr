# Rush Delivery - User Guide

## Overview
Rush Delivery lets you securely track your parcels in real-time, view a delivery timeline, and see the live location (when available). You can share a tracking link with others and optionally enable notifications.

## Getting a Tracking ID
- Your Tracking ID is provided by the sender or merchant after they create your shipment in the system.
- It typically appears in your order confirmation email/message or your account’s shipments page with the merchant.

## Logging In
- Tracking requires authentication for privacy.
- Visit /login to create an account or log in.
- After login, your session is stored and used to access parcel details.

## Tracking a Parcel
1. On the Home page or Navbar, enter your Tracking ID and submit.
2. You will be redirected to /tracking?trackingId=YOUR_ID.
3. If the parcel exists and you’re authenticated, you’ll see:
   - Status ribbon and a progress bar (Pending, Processing, In Transit, Delivered).
   - Timeline with key events. If the parcel has updates, they are shown in order; otherwise a default timeline appears.
   - Live map of the last known location (if available).

## Sharing Your Tracking Link
- Click “Share Tracking” in the sidebar to copy a secure tracking link to your clipboard.
- You can paste and share this link via email or messaging apps.

## Notifications
- On the Tracking page, toggle Email (and future SMS/Push) notifications.
- You’ll receive updates when the parcel status changes.

## Troubleshooting
- "Authentication required" toast: Log in at /login, then retry the tracking page.
- "No parcel found": Verify the Tracking ID was entered correctly and provided by the sender.
- Map not showing location: The parcel may not have coordinates yet.

---

# FAQ
- Do I need an account? Yes, to protect parcel data.
- What statuses are shown? Pending, Processing, In Transit, Delivered.
- Can I track multiple parcels? Yes, one at a time using the Tracking ID.
