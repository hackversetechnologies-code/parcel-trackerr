import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Terms() {
  const updated = new Date().toLocaleDateString();

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'service', title: '2. Description of Service' },
    { id: 'accounts', title: '3. User Accounts' },
    { id: 'acceptable-use', title: '4. Acceptable Use' },
    { id: 'accuracy', title: '5. Parcel Data & Accuracy' },
    { id: 'ip', title: '6. Intellectual Property' },
    { id: 'third-party', title: '7. Third-Party Services' },
    { id: 'liability', title: '8. Limitation of Liability' },
    { id: 'indemnification', title: '9. Indemnification' },
    { id: 'termination', title: '10. Termination' },
    { id: 'law', title: '11. Governing Law' },
    { id: 'changes', title: '12. Changes to Terms' },
    { id: 'contact', title: '13. Contact' },
  ];

  return (
    <div className="pt-20 p-4 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {updated}</p>
      </div>

      {/* Table of Contents */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview & Navigation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">Use the links below to jump to a section.</p>
          <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6">
            {sections.map((s) => (
              <li key={s.id}><a className="underline" href={`#${s.id}`}>{s.title}</a></li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card id="acceptance" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            By accessing or using Rush Delivery (the “Service”), you agree to be bound by these Terms of Service (the
            “Terms”). If you do not agree, you may not access or use the Service.
          </p>
        </CardContent>
      </Card>

      <Card id="service" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            Rush Delivery provides real-time parcel tracking, delivery management tools, and related features via a web
            application and installable PWA. Features include live map tracking, notifications, and an admin dashboard
            for parcel updates.
          </p>
        </CardContent>
      </Card>

      <Card id="accounts" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>3. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate information and promptly update it as necessary.</li>
            <li>Admins have additional privileges and must use them responsibly.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="acceptable-use" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>4. Acceptable Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>Do not misuse, disrupt, or attempt to gain unauthorized access to the Service.</li>
            <li>Do not upload, transmit, or store illegal or harmful content.</li>
            <li>Use tracking data only for lawful purposes and in compliance with privacy laws.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="accuracy" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>5. Parcel Data & Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            While we strive for accuracy, parcel data may be subject to delays, network conditions, or third-party
            provider limitations. The Service is provided “as is” without warranties of accuracy or availability.
          </p>
        </CardContent>
      </Card>

      <Card id="ip" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>6. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            The Service and its original content, features, and functionality are owned by Rush Delivery and its
            licensors and are protected by applicable intellectual property laws.
          </p>
        </CardContent>
      </Card>

      <Card id="third-party" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>7. Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            The Service may integrate with third-party services (e.g., Firebase, mapping providers). Your use of those
            services is subject to their respective terms and policies.
          </p>
        </CardContent>
      </Card>

      <Card id="liability" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>8. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            To the maximum extent permitted by law, Rush Delivery shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from
            your use of the Service.
          </p>
        </CardContent>
      </Card>

      <Card id="indemnification" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>9. Indemnification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            You agree to defend, indemnify, and hold harmless Rush Delivery, its affiliates, and their respective
            officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and
            expenses arising from your use of the Service or violation of these Terms.
          </p>
        </CardContent>
      </Card>

      <Card id="termination" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>10. Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            We may suspend or terminate access to the Service immediately, without prior notice or liability, for any
            reason, including breach of these Terms.
          </p>
        </CardContent>
      </Card>

      <Card id="law" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>11. Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction,
            without regard to its conflict of law provisions.
          </p>
        </CardContent>
      </Card>

      <Card id="changes" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>12. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            We may modify these Terms at any time by posting updated terms on this page. Continued use of the Service
            after changes become effective constitutes acceptance of the new Terms.
          </p>
        </CardContent>
      </Card>

      <Card id="contact" className="mb-12 scroll-mt-24">
        <CardHeader>
          <CardTitle>13. Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>Email: support@rushdelivery.com</p>
          <p>Phone: +1 (800) RUSH-NOW</p>
          <p>Address: 123 Delivery Street, Logistics City, LC 12345</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top</a>
        </Button>
      </div>
    </div>
  );
}
