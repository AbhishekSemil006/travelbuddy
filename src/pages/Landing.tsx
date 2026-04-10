import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MapPin, MessageCircle, ArrowRight, Sparkles, Globe, Heart, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroMockup from '@/assets/hero-mockup.jpg';

const features = [
  {
    icon: Users,
    title: 'Smart Matching',
    desc: 'Our algorithm pairs you with verified travelers who share your interests, budget, and travel style.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    desc: 'ID-verified users, real-time SOS alerts, live location sharing, and female-only trip options.',
  },
  {
    icon: MapPin,
    title: 'Trip Planning',
    desc: 'Create trips, set budgets, pick destinations, and invite compatible travel companions.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Message your travel partners with read receipts, typing indicators, and instant notifications.',
  },
];

const stats = [
  { value: '10K+', label: 'Travelers' },
  { value: '2.5K+', label: 'Trips Created' },
  { value: '98%', label: 'Safety Score' },
  { value: '120+', label: 'Countries' },
];

const destinations = [
  { name: 'Bali', travelers: 312 },
  { name: 'Kyoto', travelers: 189 },
  { name: 'Lisbon', travelers: 247 },
  { name: 'Patagonia', travelers: 156 },
  { name: 'Santorini', travelers: 203 },
  { name: 'Marrakech', travelers: 178 },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TravelBuddy Logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold text-foreground">TravelBuddy</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              The safest way to find travel partners
            </div>
            <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Travel Together,{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Stay Safe
              </span>
            </h1>
            <p className="mb-8 max-w-lg text-base text-muted-foreground sm:text-lg">
              TravelBuddy matches you with verified travel companions based on your interests, budget,
              and style — with built-in safety tools you can trust.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="sm" onClick={() => navigate('/auth')}>
              Get Started!
            </Button>
              <Button variant="outline" size="lg" className="text-base" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
              <img
                src={heroMockup}
                alt="TravelBuddy app showing trip discovery and travel matching features"
                className="relative w-full max-w-sm rounded-2xl border shadow-2xl shadow-primary/10"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Travel Safely
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From finding the perfect travel partner to staying safe on the road — TravelBuddy has
              you covered.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Trending Destinations
            </h2>
            <p className="text-muted-foreground">Join travelers heading to these popular spots</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                onClick={() => navigate('/auth')}
              >
                <MapPin className="mb-2 h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                <p className="font-display text-base font-semibold text-foreground">{dest.name}</p>
                <p className="text-xs text-muted-foreground">{dest.travelers} travelers</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center sm:p-12"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Find Your Travel Tribe?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-primary-foreground/80">
              Join thousands of verified travelers discovering safe, meaningful adventures together.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base font-semibold"
              onClick={() => navigate('/auth')}
            >
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="group relative w-full max-w-md overflow-hidden rounded-3xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 sm:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary/10 shadow-lg">
                  <span className="font-display text-4xl font-bold text-primary">AS</span>
                </div>
                
                <h3 className="mb-1 font-display text-2xl font-bold text-foreground">
                  Abhishek Semil
                </h3>
                <p className="mb-4 text-sm font-medium text-primary">
                  Full Stack Developer
                </p>
                
                <p className="mb-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  Crafted with <Heart className="h-4 w-4 fill-primary text-primary" /> for travelers
                </p>
                
                <div className="flex justify-center gap-4">
                  <a
                    href="https://github.com/AbhishekSemil006"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label="GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="mailto:contact@abhisheksemil.com"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TravelBuddy Logo" className="h-5 w-5 object-contain" />
            <span className="font-display text-sm font-semibold text-foreground">TravelBuddy</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TravelBuddy. Travel safe, travel together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
