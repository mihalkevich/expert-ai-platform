import Link from 'next/link'
import {
  Zap,
  Wand2,
  Mic,
  Inbox,
  Star,
  Trophy,
  Users,
  Check,
  ArrowRight,
  X,
  Globe,
  AtSign,
} from 'lucide-react'

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ExpertAI</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50 via-white to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Personal Branding
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Grow Your
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Personal Brand
              </span>
              <br />
              with AI
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-lg">
              Turn any content into platform-optimized posts for LinkedIn, X, Instagram, Newsletter
              and Blog — in your unique voice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-violet-200"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400">Free forever — no credit card required</p>
          </div>

          {/* Right: Mock UI Screenshot */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-1 shadow-2xl shadow-violet-200">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Mock browser bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-4 bg-gray-100 rounded-md h-5" />
                </div>
                {/* Mock dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500" />
                    <div>
                      <div className="h-3 w-24 bg-gray-200 rounded mb-1.5" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['LinkedIn', 'X / Twitter', 'Instagram'].map((platform) => (
                      <div
                        key={platform}
                        className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-lg p-3"
                      >
                        <div className="h-2.5 w-16 bg-violet-200 rounded mb-2" />
                        <div className="space-y-1.5">
                          <div className="h-2 bg-gray-100 rounded" />
                          <div className="h-2 bg-gray-100 rounded w-4/5" />
                          <div className="h-2 bg-gray-100 rounded w-3/5" />
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          <div className="h-5 w-14 bg-violet-500 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-green-200" />
                      <div className="h-2.5 w-28 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-gray-700">5 posts generated</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold text-gray-700">Voice match: 97%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Wand2,
    title: 'Content Repurposing',
    description:
      'One piece of content transformed into 5 platform-optimized posts for LinkedIn, X, Instagram, Newsletter, and Blog.',
    color: 'violet',
  },
  {
    icon: Mic,
    title: 'Voice Learning',
    description:
      'AI deeply studies your writing style, tone, and vocabulary to generate content that sounds exactly like you.',
    color: 'indigo',
  },
  {
    icon: Inbox,
    title: 'Unified Inbox',
    description:
      'Manage all comments, DMs, and mentions from every platform in a single, organized inbox.',
    color: 'blue',
  },
  {
    icon: Star,
    title: 'Reputation Builder',
    description:
      'AI-powered expert comments on trending posts to grow your authority and visibility in your niche.',
    color: 'amber',
  },
  {
    icon: Trophy,
    title: 'Challenge Builder',
    description:
      'Launch 30-day challenge campaigns to engage your audience, grow your following, and build community.',
    color: 'green',
  },
  {
    icon: Users,
    title: 'AI Employees',
    description:
      'Virtual brand ambassadors that represent your company across platforms, engaging with your audience 24/7.',
    color: 'rose',
  },
]

const colorMap: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600',
  green: 'bg-green-100 text-green-600',
  rose: 'bg-rose-100 text-rose-600',
}

function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Everything You Need
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            All-in-one platform for
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              personal brand growth
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From content creation to community management, ExpertAI handles everything so you can
            focus on what matters — your expertise.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            const colorClass = colorMap[feature.color] ?? 'bg-gray-100 text-gray-600'
            return (
              <div
                key={feature.title}
                className="group bg-white border border-gray-100 hover:border-violet-200 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-violet-50"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    title: 'Connect & Train',
    description:
      'Connect your social accounts and feed ExpertAI your existing content. Our AI learns your unique writing voice, style, and tone in minutes.',
    icon: Mic,
  },
  {
    number: '02',
    title: 'Create & Repurpose',
    description:
      'Enter any content — a blog post, video transcript, or idea — and get 5 fully optimized versions for every platform instantly.',
    icon: Wand2,
  },
  {
    number: '03',
    title: 'Engage & Grow',
    description:
      'Manage all responses in one inbox, deploy AI reputation comments, track your analytics, and watch your audience grow.',
    icon: Star,
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              minutes
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No complicated setup. Start publishing great content on day one.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-violet-200 to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl font-black text-violet-100">{step.number}</span>
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'FREE',
    price: '$0',
    period: 'forever',
    description: 'Perfect to get started',
    cta: 'Get Started',
    ctaHref: '/register',
    popular: false,
    features: [
      '5 content repurposes / month',
      '2 social accounts',
      'Basic voice learning',
      'Unified inbox',
      '100 AI credits / month',
    ],
  },
  {
    name: 'PRO',
    price: '$29',
    period: 'per month',
    description: 'For growing creators',
    cta: 'Start Pro Trial',
    ctaHref: '/register?plan=pro',
    popular: true,
    features: [
      'Unlimited repurposing',
      '10 social accounts',
      'Advanced voice cloning',
      'Reputation Builder',
      'Challenge Builder',
      'Priority support',
    ],
  },
  {
    name: 'EXPERT',
    price: '$79',
    period: 'per month',
    description: 'For serious creators',
    cta: 'Go Expert',
    ctaHref: '/register?plan=expert',
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited social accounts',
      'AI Employees (5 agents)',
      'Team collaboration',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Simple Pricing
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Choose your{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              growth plan
            </span>
          </h2>
          <p className="text-lg text-gray-500">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-2xl shadow-violet-200 scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3
                  className={`text-sm font-bold tracking-widest mb-2 ${plan.popular ? 'text-violet-200' : 'text-gray-400'}`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-gray-900'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${plan.popular ? 'text-violet-200' : 'text-gray-400'}`}
                  >
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.popular ? 'text-violet-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-violet-200' : 'text-violet-600'}`}
                    />
                    <span
                      className={`text-sm ${plan.popular ? 'text-violet-100' : 'text-gray-600'}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors ${
                  plan.popular
                    ? 'bg-white text-violet-700 hover:bg-violet-50'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Consultant',
    avatar: 'SC',
    quote:
      'ExpertAI completely transformed my content strategy. I went from struggling to post once a week to having a full week\u2019s content ready in under an hour. My LinkedIn following grew 3x in 3 months.',
  },
  {
    name: 'Marcus Williams',
    role: 'Tech Entrepreneur',
    avatar: 'MW',
    quote:
      'The voice learning feature is uncanny. When my audience reads my AI-generated posts, they can\u2019t tell the difference. It sounds exactly like me. This is the future of personal branding.',
  },
  {
    name: 'Priya Patel',
    role: 'Executive Coach',
    avatar: 'PP',
    quote:
      'The reputation builder feature alone is worth the price. I get featured in conversations I\u2019d never have found on my own, and my authority in the coaching space has never been stronger.',
  },
]

function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Loved by Creators
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Real results from{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              real creators
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ───────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Start Growing Today
        </h2>
        <p className="text-xl text-violet-200 mb-10">
          Join thousands of creators and experts who are building their personal brand with AI.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold py-4 px-10 rounded-xl hover:bg-violet-50 transition-colors text-lg shadow-xl"
        >
          Start Free
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-6 text-sm text-violet-300">Free forever, no credit card required</p>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ExpertAI</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The AI platform for building your personal brand and growing your audience across all
              platforms.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <AtSign className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} ExpertAI. All rights reserved.</p>
          <p className="text-sm">Built with AI, for creators.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
