import {
  Heart,
  Sparkles,
  Compass,
  Users,
  BookOpen,
  Lock,
  CheckCircle,
  Orbit,
  Activity,
  Infinity as InfinityIcon,
} from 'lucide-react';
import Navigation from './Navigation';




const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] flex-col items-center overflow-hidden px-6 py-12 md:flex-row md:px-12 lg:px-24"
    >
      {/* Decorative Blobs */}
      <div className="bg-primary/10 absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full blur-3xl" />
      <div className="bg-accent/30 absolute right-[-5%] bottom-[10%] -z-10 h-[400px] w-[400px] rounded-full blur-3xl" />

      <div className="relative z-10 w-full space-y-8 md:w-1/2">
        <div className="home-reveal">
          <span className="font-hand text-primary mb-4 inline-block -rotate-2 text-2xl">
            Welcome back, traveler!
          </span>
          <h1 className="font-heading text-foreground mb-6 text-5xl leading-[1.1] font-bold md:text-7xl">
            Navigate the{' '}
            <span className="text-primary relative inline-block">
              Multiverse
              <svg
                className="text-accent absolute -bottom-1 left-0 -z-10 h-3 w-full"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </span>{' '}
            <br />
            expand your essence!
          </h1>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed md:text-xl">
            The gateway to crossing paths, entanglement alignment, and understanding your unique trajectory in the cosmic web.
          </p>

          {/* Trust Badges */}
          <div className="home-reveal home-reveal--delay-1 flex flex-wrap gap-4 pt-4">
            {[
              { icon: Orbit, label: 'Infinite Paths', color: 'text-indigo-600' },
              { icon: Lock, label: 'Secure Session', color: 'text-green-600' },
              {
                icon: CheckCircle,
                label: 'Entanglement-Verified',
                color: 'text-purple-600',
              },
              { icon: Heart, label: 'Source-Connected', color: 'text-red-600' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="home-reveal home-reveal--delay-2 bg-secondary/30 border-border/40 flex items-center justify-center gap-2 rounded-full border px-3 py-2"
              >
                <badge.icon
                  className={`h-4 w-4 flex-shrink-0 ${badge.color}`}
                />
                <span className="text-foreground text-xs font-semibold">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-12 w-full md:mt-0 md:w-1/2">
        <div className="home-reveal home-reveal--image relative z-10">
          <img
            src="/images/w6fBE5m6WYpbmECpuglt--1--kehj7.jpg"
            alt="Person standing on a peak looking at a cosmic sphere"
            className="h-auto w-full transform rounded-[3rem] shadow-2xl transition-transform duration-700 hover:rotate-0 md:rotate-3"
          />

          {/* Floating Cards */}
          <div className="home-float bg-card absolute -bottom-8 -left-4 flex max-w-[200px] items-center gap-3 rounded-2xl p-4 shadow-lg md:left-10">
            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">99% Entangled</p>
              <p className="text-muted-foreground text-xs">Real-time sync</p>
            </div>
          </div>

          {/* Second Badge */}
          <div className="home-float home-float--reverse bg-card absolute -top-4 -right-4 flex max-w-[200px] items-center gap-3 rounded-2xl p-4 shadow-lg md:-right-8">
            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Quantum Spirit Guide</p>
              <p className="text-muted-foreground text-xs">Free Consultation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  title,
  desc,
  img,
  delay,
  testId,
}: {
  title: string;
  desc: string;
  img: string;
  delay: number;
  testId: string;
}) => (
  <div
    className={`home-reveal home-hover-lift home-reveal--delay-${Math.round(delay * 10)}`}
    data-testid={testId}
  >
    <div className="bg-card h-full overflow-hidden rounded-[2rem] border-none shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="flex h-full flex-col p-0">
        <div className="bg-secondary/30 relative flex h-56 items-center justify-center overflow-hidden">
          <img
            src={img}
            alt={title}
            className="home-feature-image absolute h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-center p-8 text-center">
          <h3 className="font-heading text-foreground mb-3 text-2xl font-bold">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  </div>
);

const Features = () => {
  return (
    <section
      id="features"
      className="relative bg-white/50 px-6 py-24 md:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <span className="font-hand text-primary text-xl">
            Pillars of Navigation
          </span>
          <h2 className="font-heading text-foreground text-4xl font-bold md:text-5xl">
            How You Align
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            title="Quantum Entanglement"
            desc="Identify the core values and passions that define you. Align your inner essence with external career opportunities to find your natural fit."
            img="/images/card_entanglement.jpg"
            delay={0.1}
            testId="card-feature-entanglement"
          />
          <FeatureCard
            title="Multiverse Navigation"
            desc="Chart and simulate multiple career and life trajectories risk-free. Map parallel paths of potential to make future transitions with confidence."
            img="/images/card_navigation.jpg"
            delay={0.2}
            testId="card-feature-navigation"
          />
          <FeatureCard
            title="Consciousness Expansion"
            desc="Access reflective prompts and guidance tools designed to quiet decision noise, expand self-awareness, and clarify your path."
            img="/images/card_expansion.jpg"
            delay={0.3}
            testId="card-feature-expansion"
          />
        </div>
      </div>
    </section>
  );
};

const Community = () => {
  const benefits = [
    {
      title: 'Quantum-Synchronized AI',
      subtitle: 'Clarity in Major Decisions',
      desc: 'Formulate clarity when facing important life decisions or career pivots. The AI synchronizes with your selected parameters to map parallel trajectories tailored to your potential.',
      icon: Orbit,
      bgColor: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Higher Self Calibration',
      subtitle: 'Calming Alignment Anxiety',
      desc: 'Quiet the occasional anxiety of whether your life is fully aligned with your higher self goals. Access immediate, local reflective tools to ground your daily decisions.',
      icon: Activity,
      bgColor: 'bg-red-100 text-red-600',
    },
    {
      title: '100% Free & Unlimited',
      subtitle: 'Extended Local Interactions',
      desc: 'Engage in deep, extended self-reflection dialogues at absolutely zero cost. Running fully in your browser means infinite guidance without paywalls, subscriptions, or tracking.',
      icon: InfinityIcon,
      bgColor: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <section id="community" className="relative px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <span className="font-hand text-primary text-xl">
            Empower Your Journey
          </span>
          <h2 className="font-heading text-foreground text-4xl font-bold md:text-5xl">
            Portal Alignment Benefits
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="home-reveal"
            >
              <div className="bg-card h-full rounded-[2rem] border-none shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <div className="flex h-full flex-col p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${benefit.bgColor}`}
                    >
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-heading text-foreground font-bold">
                        {benefit.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {benefit.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground flex-1 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const QuoteSection = () => {
  return (
    <section
      id="wisdom"
      className="bg-secondary/20 flex items-center justify-center px-6 py-24 text-center"
    >
      <div className="home-reveal relative max-w-3xl">
        <h3
          data-testid="text-quote"
          className="font-hand text-foreground/80 text-3xl leading-relaxed md:text-5xl"
        >
          We are not human beings having a spiritual experience. We are spiritual beings having a human experience, navigating infinite quantum realities.
        </h3>

        <div className="font-heading text-primary mt-8 font-bold">
          — Pierre Teilhard de Chardin
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="bg-background selection:bg-primary/20 selection:text-primary-foreground min-h-screen">
      <Navigation currentPath="/" />
      <Hero />
      <Features />
      <Community />
      <QuoteSection />
      <section id="cta" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="home-reveal mb-12 space-y-4 text-center">
            <h2 className="font-heading text-foreground text-4xl font-bold md:text-5xl">
              Ready to find your alignment?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Choose your path and start your private navigation journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                id: 'cta-start-app',
                title: 'Start Navigating',
                description:
                  'Access the mini LLM app directly in your browser. Private, fast, and 100% off-grid.',
                href: '/app',
                testId: 'button-cta-app',
                icon: <Compass className="text-primary h-8 w-8 animate-spin-slow" />,
                buttonText: 'Consult Spirit Guide',
              },
              {
                id: 'cta-guide',
                title: 'Pathfinder Guide',
                description:
                  'Learn how to prompt your guide, tune archetypes, and navigate decision points.',
                href: '/guide',
                testId: 'button-cta-guide',
                icon: <BookOpen className="text-primary h-8 w-8" />,
                buttonText: 'Read Guide',
              },
              {
                id: 'cta-privacy',
                title: 'Privacy & Safeguards',
                description:
                  'Understand our zero-tracking, 100% local processing guarantee for your peace of mind.',
                href: '/privacy',
                testId: 'button-cta-privacy',
                icon: <Lock className="text-primary h-8 w-8" />,
                buttonText: 'View Privacy',
              },
            ].map((cta) => (
              <div
                key={cta.id}
                className="home-reveal home-hover-lift bg-card flex h-full flex-col items-center gap-4 rounded-[2rem] p-8 text-center shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="bg-primary/15 flex h-16 w-16 items-center justify-center rounded-full">
                  {cta.icon}
                </div>
                <h3 className="font-heading text-foreground text-2xl font-bold">
                  {cta.title}
                </h3>
                <p className="text-muted-foreground flex-1">
                  {cta.description}
                </p>
                <a href={cta.href}>
                  <button
                    data-testid={cta.testId}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold shadow-md transition-colors"
                  >
                    {cta.buttonText}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
