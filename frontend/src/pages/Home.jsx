import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import Lottie from "lottie-react";
import deliveryAnimation from "@/assets/delivery-van.json";
import faqAnimation from "@/assets/Delivery guy.json";
import { MapPin, Bell, ShieldCheck, Star, Shield, Lock, Cpu, Boxes, Hospital, ShoppingCart, Building2 } from "lucide-react";

function Counter({ to = 0, duration = 1600, prefix = '', suffix = '', className = '' }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const from = 0;
          const animate = (t) => {
            const prog = Math.min(1, (t - start) / duration);
            const valNow = Math.floor(from + (to - from) * prog);
            setVal(valNow);
            if (prog < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <div ref={ref} className={className}>
      <span className="tabular-nums tracking-tight text-4xl font-bold">{prefix}{val.toLocaleString()}{suffix}</span>
    </div>
  );
}

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTrack = () => {
    if (trackingId.trim()) {
      navigate(`/tracking?trackingId=${trackingId.trim()}`);
    }
  };

  const handleSubscribe = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 600));
      toast({ title: 'Subscribed', description: 'You will receive updates and tips in your inbox.' });
      setEmail('');
    } catch (e) {
      toast({ title: 'Subscription failed', description: 'Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-28 bg-gradient-to-r from-primary to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
        <div className="container relative z-10 grid md:grid-cols-2 gap-10 items-center animate-fade-in-up">
          <div className="space-y-6">
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
              Track Your Deliveries in <span className="text-accent">Real-Time</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-lg">
              Experience the future of logistics with our cutting-edge tracking system. 
              Fast, secure, and reliable delivery management at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <Input 
                type="text" 
                placeholder="Enter Tracking ID" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="bg-white/95 text-gray-800 h-12 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 h-12 px-8 text-lg font-semibold btn-hover"
                onClick={handleTrack}
              >
                Track Parcel
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
          <div className="block md:block max-w-[240px] md:max-w-[420px] mx-auto md:justify-self-end animate-fade-in">
            <Lottie animationData={deliveryAnimation} loop={true} />
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="py-10 bg-white border-b section-spacing">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Counter to={200000} suffix="+" className="text-primary" />
            <div className="text-sm text-muted-foreground">Parcels Delivered</div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Counter to={999} suffix=".9%" className="text-accent" />
            <div className="text-sm text-muted-foreground">Platform Uptime</div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Counter to={9000} suffix="+" className="text-primary" />
            <div className="text-sm text-muted-foreground">Active Customers</div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Counter to={100} suffix="+" className="text-accent" />
            <div className="text-sm text-muted-foreground">Regions Served</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 section-spacing">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Rush Delivery?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the most advanced logistics tracking system with real-time updates, 
              secure handling, and exceptional customer service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-xl">Live Map Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Watch your parcel move on the map in real-time from pickup to delivery.</p>
              </CardContent>
            </Card>
            <Card className="text-center card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit">
                  <Bell className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="mt-4 text-xl">Instant Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Receive instant notifications for every step of your parcel's journey.</p>
              </CardContent>
            </Card>
            <Card className="text-center card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-gray-500/10 p-4 rounded-full w-fit">
                  <ShieldCheck className="h-8 w-8 text-gray-500" />
                </div>
                <CardTitle className="mt-4 text-xl">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your deliveries are handled with the utmost care and security.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partners & Integrations */}
      <section className="py-16 bg-white">
        <style>{`
          .marquee-container { position: relative; overflow: hidden; }
          .marquee-fade:before, .marquee-fade:after { content: ""; position: absolute; top:0; bottom:0; width:80px; z-index: 1; }
          .marquee-fade:before { left:0; background: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)); }
          .marquee-fade:after { right:0; background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0)); }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .partners-track { display:flex; gap:48px; align-items:center; width: max-content; animation: marquee 40s linear infinite; }
          .partners-logo { height: 36px; filter: grayscale(100%); opacity: 0.9; transition: filter .2s, opacity .2s, transform .2s; }
          .partners-logo:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.03); }
        `}</style>
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-sm tracking-wide text-muted-foreground">PARTNERS & INTEGRATIONS</p>
            <h2 className="text-2xl md:text-3xl font-bold">We work with world‑class logistics providers</h2>
          </div>
          <div className="marquee-container marquee-fade">
            <div className="partners-track">
              {[
                { name: 'DHL', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/DHL_Logo.svg/2560px-DHL_Logo.svg.png' },
                { name: 'UPS', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/United_Parcel_Service_logo_2014.svg/2560px-United_Parcel_Service_logo_2014.svg.png' },
                { name: 'FedEx', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/FedEx_Express.svg/2560px-FedEx_Express.svg.png' },
                { name: 'USPS', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/USPS_Logo.svg/2560px-USPS_Logo.svg.png' },
                { name: 'DPD', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/DPD_Logo.svg/2560px-DPD_Logo.svg.png' },
                { name: 'GLS', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/GLS_logo.svg/2560px-GLS_logo.svg.png' },
                { name: 'TNT', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TNT_Express_logo.svg/2560px-TNT_Express_logo.svg.png' },
                { name: 'Aramex', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Aramex_logo.svg/2560px-Aramex_logo.svg.png' },
                { name: 'Maersk', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Maersk_Group_logo.svg/2560px-Maersk_Group_logo.svg.png' },
                { name: 'DB Schenker', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/DB_Schenker_Logo.svg/2560px-DB_Schenker_Logo.svg.png' },
              ].map((p) => (
                <img key={p.name} src={p.url} alt={`${p.name} logo`} className="partners-logo" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-slate-50 section-spacing">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Use Cases</h2>
            <p className="text-muted-foreground">Tailored solutions for every logistics workflow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><ShoppingCart className="h-5 w-5" /><CardTitle>E‑commerce</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">Real-time tracking for customer transparency and reduced WISMO support.</CardContent>
            </Card>
            <Card className="border-0 shadow-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><Building2 className="h-5 w-5" /><CardTitle>B2B Logistics</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">Fleet-level visibility, route monitoring, and exception alerts for operations.</CardContent>
            </Card>
            <Card className="border-0 shadow-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><Hospital className="h-5 w-5" /><CardTitle>Healthcare</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">Temperature-sensitive tracking, chain-of-custody logging, and on-time delivery.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-white section-spacing">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Security & Compliance</h2>
            <p className="text-muted-foreground">Built with best practices for data protection and reliability</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border rounded-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><Lock className="h-5 w-5" /><CardTitle>Encryption‑in‑Transit</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">All communication is secured with TLS. Sensitive fields are restricted by role.</CardContent>
            </Card>
            <Card className="border rounded-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><Shield className="h-5 w-5" /><CardTitle>Role‑Based Access</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">Admin and client roles ensure appropriate privileges for parcel operations.</CardContent>
            </Card>
            <Card className="border rounded-md card-hover">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary"><Cpu className="h-5 w-5" /><CardTitle>Reliable Infrastructure</CardTitle></div>
              </CardHeader>
              <CardContent className="text-muted-foreground">PWA offline support, push alerts, and real‑time updates keep you connected.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white section-spacing">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to track your parcels with our advanced system
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Tracking ID</h3>
              <p className="text-gray-600">Input your unique tracking number in the search bar</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">View Real-time Location</h3>
              <p className="text-gray-600">See your parcel's exact location on the interactive map</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Notifications</h3>
              <p className="text-gray-600">Receive instant updates at every step of the journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 section-spacing">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 card-hover">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Sarah Johnson" 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Business Owner</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "Rush Delivery has transformed how we manage our logistics. 
                The real-time tracking is incredibly accurate and reliable."
              </p>
            </Card>
            <Card className="p-6 card-hover">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Michael Chen" 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-600">E-commerce Manager</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "The notifications are instant and the interface is so intuitive. 
                Our customers love the transparency."
              </p>
            </Card>
            <Card className="p-6 card-hover">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Emily Rodriguez" 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-600">Freelance Designer</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "I can track all my shipments in one place. The mobile app is 
                fantastic and works perfectly on the go."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <div className="max-w-3xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground">Everything you need to know about tracking and deliveries</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="q1">
                    <AccordionTrigger>Do I need an account to track a parcel?</AccordionTrigger>
                    <AccordionContent>
                      Yes. For privacy and security, tracking requires authentication. Create an account or log in to proceed.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>What statuses can I expect to see?</AccordionTrigger>
                    <AccordionContent>
                      Typical statuses include Pending, Processing, In Transit, Out for Delivery, and Delivered.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>Can I receive notifications?</AccordionTrigger>
                    <AccordionContent>
                      Yes. You can enable email and in-app toasts in the Tracking page. Push notifications are coming soon.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q4">
                    <AccordionTrigger>How accurate is the live map?</AccordionTrigger>
                    <AccordionContent>
                      Accuracy depends on the courier's GPS availability and frequency of updates. We display the latest known location.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center items-center hidden lg:flex">
              <div className="max-w-md w-full">
                <Lottie animationData={faqAnimation} loop={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-slate-50 section-spacing">
        <div className="container max-w-3xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Get Logistics Tips & Updates</h2>
            <p className="text-muted-foreground">Subscribe to our monthly digest for tracking best practices and product news.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              aria-label="Email address"
            />
            <Button size="lg" className="h-12 px-6 btn-hover" onClick={handleSubscribe} disabled={submitting} aria-label="Subscribe">
              {submitting ? 'Submitting...' : 'Subscribe'}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 pb-24 md:pb-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        <div className="container text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Rush Delivery for their logistics needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 px-8 text-lg btn-hover">
              Track Your Parcel
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary btn-hover">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
