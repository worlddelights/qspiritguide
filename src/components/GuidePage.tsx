import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, Shield, Cpu, Compass } from 'lucide-react';
import Navigation from './Navigation';

export default function GuidePage() {
  const faqs = [
    {
      q: 'How does qSpirit Guide work without sending data to servers?',
      a: 'qSpirit Guide uses LLM AI that runs exclusively in the browser on your device. We use transformers.js with model files downloaded from public Hugging Face Hub servers and then cached by your browser. Your prompts and generated replies stay only in your browser.',
    },
    {
      q: 'Is it really completely free with zero signups?',
      a: 'Yes. There are no registration forms, no email collection, no subscriptions, and no paywalls. It is built as an open, public-access tool for decision exploration and introspection.',
    },
    {
      q: 'What is the "Multiverse Navigation" metaphor?',
      a: 'While life may seem random, we believe The Quantum Field always guides you. To connect with it explicitly, simply avoid overthinking the synchronization ritual. Select any three symbols that surface in your awareness, and consider clicking the resonance wheel with your eyes closed. Naturally, there are no wrong choices here so just relax and enjoy the experience, whatever it surfaces.',
    },
    {
      q: 'How do I get the best guidance from the browser LLM?',
      a: 'Be specific about the decision or dilemma you are facing. Share your core values, concerns, and open questions. The guide will help ask reflective questions to clarify your path.',
    },
    {
      q: 'How can I get in touch or share a request or concern?',
      a: (
        <>
          Submit a{' '}
          <a
            href="https://github.com/worlddelights/qspiritguide/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:opacity-80"
          >
            GitHub Issue
          </a>{' '}
          in the qSpirit Guide repository. You can use an issue to share a
          request, report a problem, or raise a concern.
        </>
      ),
    },
  ];

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Navigation currentPath="/guide" />

      <main className="flex-1 px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <div className="bg-primary/10 text-primary border-primary/20 mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              Pathfinder Knowledge Base
            </div>
            <h1 className="font-heading text-4xl font-bold md:text-6xl">
              Pathfinder Guide & FAQ
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Everything you need to know about local AI processing, path-mapping principles, and navigating your decisions safely.
            </p>
          </motion.div>

          {/* FAQ Accordion / Grid */}
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-card border-border/60 rounded-2xl border p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/15 text-primary rounded-lg p-2.5 mt-0.5">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prompting Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary/5 border-primary/20 flex flex-col items-center justify-between gap-6 rounded-3xl border p-8 md:flex-row"
          >
            <div className="space-y-2 text-left">
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Ready to start your dialogue?
              </h3>
              <p className="text-muted-foreground text-sm">
                Launch the mini LLM app and begin exploring your options in total privacy.
              </p>
            </div>
            <a href="/app" className="shrink-0">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-bold shadow-lg transition-all hover:scale-105">
                Consult Spirit Guide
              </button>
            </a>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
