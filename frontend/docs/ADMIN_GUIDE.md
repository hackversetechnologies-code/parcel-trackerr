# Rush Delivery - Admin Guide

## Overview
Admins manage parcels and monitor operations in the Admin Dashboard at /admin. Admin access is role-gated using JWT tokens.

## Roles
- Admin: Full access to create, update, and delete parcels.
- Client: Can only view tracking details of parcels when authenticated.

## Authentication
- Admin role is issued during registration or via a role update in Firestore.
- JWT is returned by the backend /login and contains email and role claims.

## Dashboard Features
### Parcels Tab
- Search: Filter parcels by tracking_id, sender, or receiver.
- Add Parcel: Opens a modal to create a new parcel with validation.
  - Fields: tracking_id, status (pending, processing, in transit, delivered), sender, receiver, estimated_delivery (date), location.lat, location.lng, location.address.
  - On success, the list refreshes automatically with React Query.
- Inline Edit:
  - Click Edit on a row to modify status and location (lat, lng, address).
  - Save updates the parcel via PUT /parcels/{id} and refreshes the data.
  - Cancel reverts editing state.
- Delete Parcel:
  - Shows a confirmation prompt prior to deletion.

### Users & Analytics Tabs
- Placeholders for future functionality.

## Data Model
Parcel:
```
{
  id: string,
  tracking_id: string,
  status: 'pending' | 'processing' | 'in transit' | 'delivered',
  location: { lat: number, lng: number, address?: string },
  estimated_delivery: string | ISO date,
  sender: string,
  receiver: string,
  updates: Array<{ timestamp: number | string, status?: string, message?: string }>
}
```

## Tips
- Maintain consistent statuses to keep the progress bar accurate.
- Provide coordinates and address to enable map display on the Tracking page.
- Use updates to enrich the customer timeline experience.
