import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQ() {
  return (
    <div className="pt-20 p-4 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-2">Answers to common questions about tracking, notifications, accounts, maps, and more. See the <a href="/guide/user" className="underline">User Guide</a> for step‑by‑step walkthroughs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>How do I track my parcel?</AccordionTrigger>
              <AccordionContent>
                Enter your tracking ID in the search bar on the Home or Tracking page and press Track. You will see real-time status, ETA, timeline, and a live map.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Do I need an account to track?</AccordionTrigger>
              <AccordionContent>
                You can search a tracking ID without an account. Some advanced features like notifications may require login.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Why is my parcel not found?</AccordionTrigger>
              <AccordionContent>
                Double-check the tracking ID for typos. If you still cannot find it, the parcel may not be registered yet or has been archived. Contact support with your details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Shipping & Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="s1">
              <AccordionTrigger>What does each status mean?</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6">
                  <li><strong>Pending</strong> – label created, awaiting pickup</li>
                  <li><strong>Processing</strong> – parcel received, being sorted</li>
                  <li><strong>In Transit</strong> – on the way to destination</li>
                  <li><strong>Out for Delivery</strong> – on the final leg to recipient</li>
                  <li><strong>Delivered</strong> – successfully delivered</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="s2">
              <AccordionTrigger>Can I change my delivery address?</AccordionTrigger>
              <AccordionContent>
                Contact support as soon as possible. We’ll attempt the update if the parcel hasn’t reached the final stage. Use the <a href="/contact" className="underline">Contact</a> page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q4">
              <AccordionTrigger>How do I enable notifications?</AccordionTrigger>
              <AccordionContent>
                On the Tracking page, toggle Email notifications. SMS and push notifications may be added and can be enabled from the same section when available.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger>Why am I not receiving emails?</AccordionTrigger>
              <AccordionContent>
                Check your spam folder. Ensure your email settings and preferences are correct. If the issue persists, contact support.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Maps & ETA</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="m1">
              <AccordionTrigger>How is the ETA calculated?</AccordionTrigger>
              <AccordionContent>
                ETA is derived from distance to destination and average speed assumptions along with historical updates when available. It’s an estimate and may shift with new data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m2">
              <AccordionTrigger>Why is the map location not available?</AccordionTrigger>
              <AccordionContent>
                The courier may not have provided coordinates yet. We’ll show the latest known information and update the map as soon as data is available.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accounts & Security</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q6">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                Go to the Login page and switch to Register. Enter your email and a secure password to create an account.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q7">
              <AccordionTrigger>How do I reset my password?</AccordionTrigger>
              <AccordionContent>
                From the Profile page, use the Security tab to update your password. Support for password reset via email may be provided.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q8">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                We use industry-standard measures including encryption in transit and hashed passwords. See our Privacy Policy for details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="b1">
              <AccordionTrigger>How do I contact support?</AccordionTrigger>
              <AccordionContent>
                Use the <a href="/contact" className="underline">Contact</a> page to submit a request. Include your tracking ID for fastest assistance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b2">
              <AccordionTrigger>Do you offer premium notifications?</AccordionTrigger>
              <AccordionContent>
                We plan to offer premium notification tiers (e.g., SMS urgency, extended history). Follow the newsletter on the Home page for updates.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
