import { motion } from 'framer-motion';
import { ShieldCheck, Lock, HardDrive, EyeOff } from 'lucide-react';
import Navigation from './Navigation';

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Navigation currentPath="/privacy" />

      <main className="flex-1 px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <div className="bg-primary/10 text-primary border-primary/20 mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              Privacy & Data Sovereignty
            </div>
            <h1 className="font-heading text-4xl font-bold md:text-6xl">
              Privacy Policy & Safeguards
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              qSpirit Guide is designed from the ground up as a zero-data-collection, browser-native platform. Your introspection belongs strictly to you.
            </p>
          </motion.div>

          {/* Privacy Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <div className="bg-card border-border/60 rounded-3xl border p-8 space-y-3">
              <div className="bg-primary/15 text-primary rounded-xl p-3 w-fit">
                <HardDrive className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">100% Local AI Processing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The mini LLM runs in your browser using WebGPU/transformers.js. Public model files are downloaded from Hugging Face Hub, but your prompts and generated replies are processed locally and are not sent to Hugging Face or a remote inference service.
              </p>
            </div>

            <div className="bg-card border-border/60 rounded-3xl border p-8 space-y-3">
              <div className="bg-primary/15 text-primary rounded-xl p-3 w-fit">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Zero Data Harvesting</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We do not collect names, email addresses, usage analytics, or personal profiles. There are no registration forms, ads, or tracking cookies.
              </p>
            </div>

            <div className="bg-card border-border/60 rounded-3xl border p-8 space-y-3">
              <div className="bg-primary/15 text-primary rounded-xl p-3 w-fit">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Browser-Only Storage</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your settings and past session logs are saved exclusively in your browser&apos;s local storage (`localStorage` or `IndexedDB`). Clearing your browser cache permanently removes all session history.
              </p>
            </div>

            <div className="bg-card border-border/60 rounded-3xl border p-8 space-y-3">
              <div className="bg-primary/15 text-primary rounded-xl p-3 w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Cloudflare Security</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We use privacy-friendly Cloudflare Turnstile bot protection to secure static page delivery without utilizing invasive tracking cookies.
              </p>
            </div>
          </motion.div>

          {/* Last Updated */}
          <div className="text-muted-foreground/70 text-center text-xs pt-4">
            Last updated: August 2026 &bull; qSpirit Guide Privacy Architecture
          </div>
        </div>
      </main>

    </div>
  );
}
