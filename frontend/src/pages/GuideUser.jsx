import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

export default function GuideUser() {
  return (
    <div className="pt-20 p-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Guide</h1>
        <p className="text-gray-600">How to track parcels and use Rush Delivery as a customer.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Go to the Home page and enter your Tracking ID.</li>
              <li>Press "Track Parcel" or hit Enter to open the tracking page.</li>
              <li>On the tracking page, view real-time status, map, and timeline.</li>
              <li>Use "Share Tracking" to copy a public link to your clipboard.</li>
            </ol>
            <Button asChild>
              <Link to="/tracking">Try Tracking</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Do I need an account to track a parcel?</AccordionTrigger>
                <AccordionContent>
                  Tracking requires authentication to protect parcel information. Create an account and log in to track.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What statuses can I see?</AccordionTrigger>
                <AccordionContent>
                  Typical statuses are: Pending, Processing, In Transit, Out for Delivery, and Delivered.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I get notifications?</AccordionTrigger>
                <AccordionContent>
                  Enable notifications in the Tracking page sidebar to receive updates via email or in-app toasts.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
