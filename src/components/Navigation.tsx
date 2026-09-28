import { Compass, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPath?: string;
}

export default function Navigation({ currentPath = '/' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'The Gateway', id: 'home' },
    { href: '/guide', label: 'Pathfinder Guide', id: 'guide' },
    { href: '/privacy', label: 'Privacy Policy', id: 'privacy' },
  ];

  const isCurrent = (href: string) => {
    if (href === '/' && currentPath === '/') return true;
    if (href !== '/' && currentPath.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-background/80 border-border/40 sticky top-0 z-50 flex w-full items-center justify-between border-b px-6 py-4 shadow-sm backdrop-blur-lg md:px-12">
      <a
        href="/"
        className="text-primary flex items-center gap-3 transition-opacity hover:opacity-85"
        data-testid="brand-logo"
      >
        <Compass className="h-8 w-8 animate-spin-slow text-red-400" />
        <span className="font-heading text-foreground text-2xl font-bold tracking-tight">
          qSpirit Guide
        </span>
      </a>

      {/* Desktop Nav */}
      <div className="hidden items-center gap-8 font-medium md:flex">
        {navLinks.map((link) => {
          const active = isCurrent(link.href);
          return (
            <a
              key={link.id}
              href={link.href}
              data-testid={`link-nav-${link.id}`}
              className={`relative w-fit text-sm transition-colors ${
                active
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className="navigation__link-motion">
                {link.label}
                {active && (
                  <div className="bg-primary absolute right-0 -bottom-1 left-0 h-0.5 rounded-full" />
                )}
              </div>
            </a>
          );
        })}

        {/* Large Primary Call to Action Button */}
        <a href="/app" data-testid="link-nav-cta">
          <button
            data-testid="button-launch-app-nav"
            className="font-heading bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-all hover:shadow-xl"
          >
            <Sparkles className="h-4 w-4" />
            Consult Spirit Guide
          </button>
        </a>
      </div>

      {/* Mobile Nav Toggle */}
      <button
        className="text-foreground bg-primary/10 hover:bg-primary/25 rounded-full p-2 transition-colors md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-menu-toggle"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="navigation__mobile-menu">
          <div
            className="bg-card border-border/60 absolute top-full right-4 left-4 z-50 mt-2 flex w-[calc(100%-2rem)] flex-col gap-5 rounded-2xl border p-6 shadow-2xl md:hidden"
          >
            {navLinks.map((link) => {
              const active = isCurrent(link.href);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  data-testid={`link-${link.id}-mobile`}
                  className={`navigation__mobile-link w-fit text-lg font-medium transition-colors ${
                    active
                      ? 'text-primary font-bold'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div
              className="border-border/40 border-t pt-4"
            >
              <a
                href="/app"
                className="block w-full"
                onClick={() => setIsOpen(false)}
              >
                <button
                  data-testid="button-launch-app-mobile"
                  className="font-heading bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold shadow-lg transition-all"
                >
                  <Sparkles className="h-5 w-5" />
                  Consult Spirit Guide
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
