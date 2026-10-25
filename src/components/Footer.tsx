import { Compass, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-border/40 border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-4">
            <a href="/" className="text-primary flex items-center gap-3">
              <Compass className="h-8 w-8 text-red-400" />
              <span className="font-heading text-foreground text-2xl font-bold">
                qSpirit Guide
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Navigate the Multiverse. Expand your Essence. Free, browser-native AI guidance designed for authentic life and career path exploration.
            </p>
            <div className="text-muted-foreground/80 flex items-center gap-2 text-xs">
              <ShieldCheck className="text-primary h-4 w-4" />
              <span>100% Private & Off-Grid (Runs in your browser)</span>
            </div>
          </div>

          {/* Center Column: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-foreground text-sm font-bold uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/"
                  data-testid="link-footer-home"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  The Gateway (Home)
                </a>
              </li>
              <li>
                <a
                  href="/app"
                  data-testid="link-footer-app"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  The Alignment Portal (App)
                </a>
              </li>
              <li>
                <a
                  href="/guide"
                  data-testid="link-footer-guide"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pathfinder Guide (FAQ)
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  data-testid="link-footer-privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy & Safeguards
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/worlddelights/qspiritguide"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-github"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  View source & contribute
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: CTA */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h4 className="font-heading text-foreground font-bold">
                Ready to Explore?
              </h4>
              <p className="text-muted-foreground text-sm">
                Launch your private AI guide session directly inside your browser. No signups required.
              </p>
            </div>
            <a href="/app" className="w-full" data-testid="link-footer-cta">
              <button
                data-testid="button-footer-launch-app"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold shadow-lg transition-all hover:shadow-xl"
              >
                <Sparkles className="h-5 w-5" />
                Consult Spirit Guide
              </button>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border/40 my-6 border-t" />

        {/* Bottom: Copyright */}
        <div className="text-muted-foreground/70 flex flex-col items-center justify-between gap-4 text-center text-xs md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} qSpirit Guide. All rights reserved.
          </p>
          <p className="flex items-center justify-center gap-1">
            Traversing the cosmic web <Heart className="h-3 w-3 text-red-400" /> in alignment
          </p>
        </div>
      </div>
    </footer>
  );
}
