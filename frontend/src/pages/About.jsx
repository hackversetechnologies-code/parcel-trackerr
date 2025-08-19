import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Shield, Users, Target, Truck, Globe, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-20 p-4 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="mb-10 animate-fade-in-up">
        <div className="rounded-xl overflow-hidden relative bg-gradient-to-r from-primary to-blue-700 text-white">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 px-6 md:px-10 py-12 md:py-16">
            <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight">Delivering Clarity in Every Mile</h1>
            <p className="mt-3 md:mt-4 text-blue-100 max-w-2xl">
              Rush Delivery brings real-time transparency to logistics. From pickup to drop-off,
              our platform keeps teams and customers aligned with accurate tracking and proactive updates.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button asChild className="btn-hover">
                <a href="/contact">Contact Sales</a>
              </Button>
              <Button variant="outline" asChild className="btn-hover">
                <a href="/guide/user">View User Guide</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            To empower businesses and customers with reliable, real-time delivery tracking that builds trust, reduces support friction,
            and elevates the end-to-end shipping experience.
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            A connected logistics world where every parcel's journey is visible, proactive alerts are the norm,
            and delivery outcomes are consistently exceptional.
          </CardContent>
        </Card>
      </section>

      {/* Core Values */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Reliability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">We design resilient systems and processes that keep your operations moving 24/7.</CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Transparency</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Clear timelines, honest updates, and precise tracking for every stakeholder.</CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Innovation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">We continuously iterate to deliver a modern, accessible, and delightful experience.</CardContent>
          </Card>
        </div>
      </section>

      {/* Leadership */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Leadership Team</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            name: 'Ava Thompson', role: 'CEO & Co‑Founder',
            bio: 'Product strategist with a decade in logistics tech, focused on customer trust and impact.',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
          }, {
            name: 'Liam Patel', role: 'CTO & Co‑Founder',
            bio: 'Systems architect passionate about scalable, real-time infrastructure and developer experience.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
          }, {
            name: 'Sofia Martinez', role: 'Head of Operations',
            bio: 'Operational excellence leader driving on-time deliveries and continuous improvement.',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80'
          }].map((m) => (
            <Card key={m.name} className="card-hover">
              <CardHeader>
                <CardTitle>{m.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </CardHeader>
              <CardContent>
                <img 
                  src={m.image} 
                  alt={m.name} 
                  className="w-20 h-20 rounded-full mb-3 object-cover"
                />
                <p className="text-muted-foreground text-sm">{m.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Company Timeline</h2>
        <div className="space-y-4">
          {[{
            year: '2022', title: 'Founded', detail: 'Rush Delivery is founded to make parcel tracking simple and reliable.'
          }, {
            year: '2023', title: 'Real‑time Map Launch', detail: 'Introduced live map tracking with proactive notifications.'
          }, {
            year: '2024', title: 'PWA & Push', detail: 'Shipped installable PWA and push updates to connect faster with users.'
          }].map((e) => (
            <div key={e.year} className="flex items-start gap-4 card-hover p-4 rounded-lg">
              <div className="mt-1 text-primary font-bold w-14">{e.year}</div>
              <div className="flex-1">
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-muted-foreground">{e.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logistics Footprint */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Logistics Footprint</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> 1M+ Parcels</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Processed annually with real-time updates and reliable ETAs.</CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> 50+ Regions</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Serving customers across countries with consistent SLAs.</CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> 99.9% Uptime</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Platform availability you can count on during your busiest seasons.</CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-14">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Let's build your delivery experience</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-muted-foreground">Talk to us about your logistics needs and how we can support your growth.</p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild className="btn-hover">
                <a href="/contact">Get in Touch</a>
              </Button>
              <Button variant="outline" asChild className="btn-hover">
                <a href="/tracking">Start Tracking</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
