import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function GuideAdmin() {
  return (
    <div className="pt-20 p-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Guide</h1>
        <p className="text-gray-600">Instructions for administrators to manage parcels and users.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Create parcels from the Admin Dashboard using the Add Parcel button.</li>
              <li>Edit parcel status and location inline in the parcels table.</li>
              <li>Review and manage users in the Users tab.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parcel Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>tracking_id</TableCell>
                  <TableCell>Unique ID customers use to track the parcel.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>status</TableCell>
                  <TableCell>One of: pending, processing, in transit, delivered.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>location</TableCell>
                  <TableCell>Object with lat, lng, and address properties.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>estimated_delivery</TableCell>
                  <TableCell>ISO date or timestamp for ETA.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>updates</TableCell>
                  <TableCell>Array of timeline events with timestamp and message.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
