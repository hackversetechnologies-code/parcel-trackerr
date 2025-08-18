import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  const updated = new Date().toLocaleDateString();

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'usage', title: '2. How We Use Your Information' },
    { id: 'sharing', title: '3. Sharing and Disclosure' },
    { id: 'security', title: '4. Data Security' },
    { id: 'retention', title: '5. Data Retention' },
    { id: 'rights', title: '6. Your Rights' },
    { id: 'transfers', title: '7. International Transfers' },
    { id: 'children', title: "8. Children's Privacy" },
    { id: 'changes', title: '9. Changes to This Policy' },
    { id: 'contact', title: '10. Contact Us' },
  ];

  return (
    <div className="pt-20 p-4 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
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

      <Card id="overview" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Rush Delivery ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our website, installable PWA, and
            related services (collectively, the "Services").
          </p>
          <p>By accessing or using our Services, you agree to the collection and use of information in accordance with this policy.</p>
        </CardContent>
      </Card>

      <Card id="collection" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>Account Data: name, email address, password hash, role (client/admin).</li>
            <li>Parcel & Tracking Data: tracking ID, status, ETAs, sender/receiver details, location (lat/lng), updates.</li>
            <li>Device & Usage Data: IP address, browser details, pages visited, actions performed, approximate location (if permitted).</li>
            <li>Cookies & Storage: session tokens (JWT) and preferences stored locally to enable authentication and app features.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="usage" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide parcel tracking and account services.</li>
            <li>Authenticate users and secure role-based access (client/admin).</li>
            <li>Send notifications and updates about parcel status (email, in-app, push where available).</li>
            <li>Improve performance, reliability, and user experience.</li>
            <li>Comply with legal obligations and prevent misuse.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="sharing" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>3. Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>We may share your information only in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With service providers (e.g., Firebase) strictly to operate our Services.</li>
            <li>For legal compliance, protection of rights, or in response to valid requests by authorities.</li>
            <li>In a merger, acquisition, or asset sale, subject to standard safeguards.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="security" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            We use industry-standard safeguards, including encryption in transit, hashed passwords, and limited access
            to sensitive data. However, no method of transmission or storage is 100% secure.
          </p>
        </CardContent>
      </Card>

      <Card id="retention" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>5. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            We retain your data only as long as needed for service provision, legal obligations, and legitimate
            business interests. You may request deletion of your personal data where applicable.
          </p>
        </CardContent>
      </Card>

      <Card id="rights" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>6. Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and update your account information.</li>
            <li>Request deletion of personal data, subject to legal constraints.</li>
            <li>Manage notification preferences and app permissions.</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="transfers" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>7. International Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            Our services may be provided using infrastructure in various regions. Your data may be processed outside
            your country, with appropriate protections in place.
          </p>
        </CardContent>
      </Card>

      <Card id="children" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>8. Children&apos;s Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            Our Services are not directed to children under 13. We do not knowingly collect information from children under 13.
            If you become aware of such data, contact us to remove it.
          </p>
        </CardContent>
      </Card>

      <Card id="changes" className="mb-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>9. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>
            We may update this Privacy Policy from time to time. Changes are effective when posted on this page. We encourage you to review this page periodically.
          </p>
        </CardContent>
      </Card>

      <Card id="contact" className="mb-12 scroll-mt-24">
        <CardHeader>
          <CardTitle>10. Contact Us</CardTitle>
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
