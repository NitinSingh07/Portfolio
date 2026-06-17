'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  ArrowUpRight, Github, Linkedin, Mail, Moon, Sun, Sparkles, MapPin,
  Code2, Cloud, Database, Wrench, Palette, Layers, Zap, ArrowRight, ChevronRight, Briefcase, GraduationCap, ExternalLink
} from 'lucide-react'

const HeroScene = dynamic(() => import('@/components/hero-scene'), { ssr: false, loading: () => null })
// ------------------------------ Data ------------------------------
const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]


const PROJECTS = [
  {
    name: 'Case-King',
    tag: 'E-commerce',
    year: '2024',
    description:
      'A customizable phone case e-commerce platform with live design preview, Stripe checkout, secure auth and high-performance media pipeline.',
    bullets: [
      'Built end-to-end with Next.js App Router, Prisma & PostgreSQL.',
      'Stripe integration, Kinde Auth, UploadThing for media \u2014 improved CVR.',
    ],
    stack: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind', 'Stripe', 'Kinde', 'ShadCN', 'UploadThing'],
    accent: 'from-violet-500 via-fuchsia-500 to-pink-500',
    live: 'https://case-king.vercel.app/',
    github: 'https://github.com/NitinSingh07/CaseKing',
  },
  {
    name: 'ProManage',
    tag: 'SaaS \u00b7 Productivity',
    year: '2024',
    description:
      'A full-featured project management suite with task tracking, team assignments, and Gantt visualisation \u2014 deployed at scale on AWS.',
    bullets: [
      'TypeScript + Redux + Express stack, hosted on EC2/RDS/S3/Amplify.',
      'Cognito auth \u00b7 ~40% improvement in operational efficiency.',
    ],
    stack: ['Next.js', 'Node.js', 'Express', 'TypeScript', 'Redux', 'AWS'],
    accent: 'from-sky-500 via-cyan-400 to-emerald-400',
    live: 'https://main.d35i2z1v1of9nl.amplifyapp.com/',
    github: 'https://github.com/NitinSingh07/ProManage',
  },
  {
    name: 'She-Shield',
    tag: 'Safety \u00b7 Realtime',
    year: '2024',
    description: "A real-time women's safety platform with live location tracking, nearby emergency services and instant alert notifications.",
    bullets: [
      'Socket.io realtime alerts \u00b7 Leaflet maps \u00b7 OpenCage geocoding.',
      'Crime mapping dashboards + community forum \u2014 +15% engagement.',
    ],
    stack: ['React', 'Express', 'Socket.io', 'Leaflet', 'JWT', 'Recharts', 'Framer Motion'],
    accent: 'from-rose-500 via-orange-400 to-amber-300',
    live: 'https://she-shield-eight.vercel.app/',
    github: 'https://github.com/NitinSingh07/She-Shield',
  },
]

const EXPERIENCE = [
  {
    company: 'CloudSEK',
    role: 'Software Engineering Intern',
    period: 'Dec 2025 \u2014 March 2026 ',
    location: 'Remote',
    bullets: [
      'Spearheaded development of the Peer Comparison feature end-to-end, enabling 500+ organizations to benchmark security posture against industry peers using standardized security metrics \u2014 improving risk visibility by 30%.',
      'Integrated automated PDF security report generation via a template engine and RESTful APIs.',
      'Resolved 75+ production defects and daily bugs; performed label and UI optimizations to enhance usability, stability and reliability across live environments.',
    ],
    tags: ['REST APIs', 'PDF Engine', 'Production Defects', 'Daily Bugs', 'UI Polish', 'Next.js', 'Typescript'],
  },
  {
    company: 'BrandContext',
    role: 'Frontend Development Intern',
    period: 'Jun 2025 \u2014 Aug 2025',
    location: 'Remote',
    bullets: [
      'Enhanced 5 dashboards for a real-time analytics platform in collaboration with Google \u2014 decreasing page load times by 25%.',
      'Optimized interactive data visualization modules used by retail teams, reducing data load time by 40% and improving operational decisions across 100+ store locations.',
    ],
    tags: ['UI Optimisation', 'Next.js', 'Reaect.js', 'Tailwind', 'Typescript', 'Dashboards', 'Performance'],
  },
  {
    company: 'Cograd',
    role: 'Full Stack Development Intern',
    period: 'Aug 2024 \u2014 Feb 2025',
    location: 'Remote',
    bullets: [
      'Architected and delivered an ERP system for student onboarding, fee management, result processing, teacher onboarding, and geo-based attendance \u2014 improving workflow efficiency by 35%.',
      'Contributed scalable features to a production-grade platform showcased on Shark Tank India Season 4 and assisted in real-world deployment readiness.',
    ],
    tags: ['Full Stack', 'ERP', 'Reaect.js', 'Tailwind', 'Typescript', 'UI Optimisation', 'Shark Tank India', 'Deployment'],
  },
]

const EDUCATION = {
  school: 'Indian Institute of Information Technology (IIIT) Una',
  location: 'Una, Himachal Pradesh',
  degree: 'B.Tech in Electronics and Communication Engineering',
  cgpa: '8.2 / 10',
  period: '2022 \u2014 2026',
}

const SKILLS = {
  Languages: ['C', 'C++', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3'],
  Frameworks: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'TanStack Query', 'GraphQL', 'jQuery'],
  'Cloud & DB': ['MongoDB', 'NeonDB', 'PostgreSQL', 'Prisma', 'Redis', 'AWS EC2', 'RDS', 'S3', 'Amplify', 'Cognito'],
  'DevOps & Tools': ['Docker', 'Linux', 'Git', 'GitHub', 'Postman', 'Thunder Client', 'Jupyter', 'MATLAB'],
  'UI & Styling': ['Tailwind', 'Bootstrap 5', 'Mantine', 'ShadCN', 'Material UI', 'Ant Design'],
}

const MARQUEE = [
  'Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Prisma',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'GraphQL', 'Redux', 'Stripe',
  'Framer Motion', 'Socket.io', 'Express', 'ShadCN', 'TanStack',
]

// ------------------------------ Helpers ------------------------------
function useMounted() {
  const [m, set] = useState(false)
  useEffect(() => set(true), [])
  return m
}

// Spotlight that follows the cursor in hero
function useSpotlight(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', handler)
    return () => el.removeEventListener('mousemove', handler)
  }, [ref])
}

// ------------------------------ Components ------------------------------
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  if (!mounted) return <div className="h-9 w-9" />
  const isDark = resolvedTheme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative h-9 w-9 rounded-full border border-border/60 grid place-items-center hover:bg-secondary transition-colors"
      aria-label="Toggle theme">
      <AnimatePresence mode="wait" initial={false}>
        < motion.div
          key={isDark ? 'm' : 's'}
          initial={{ rotate: -90, opacity: 0 }
          }
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {
            isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.div >
      </AnimatePresence >
    </button >
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <div
        className={`flex items-center gap-1 rounded-full border border-border/60 px-2 py-1.5 transition-all duration-500 ${scrolled ? 'bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]' : 'bg-background/40 backdrop-blur-md'
          }`}
      >
        <a href="#top" className="px-3 py-1.5 rounded-full flex items-center gap-2 font-mono text-xs tracking-tight">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          NPS
        </a >
        <div className="hidden sm:flex items-center">
          {
            NAV.map((n) => (
              <a key={n.href} href={n.href}
                className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                {n.label}
              </a >
            ))
          }
        </div >
        <a
          href="#contact"
          className="ml-1 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 py-1.5 text-sm font-medium hover:opacity-90 transition"
        >
          Let's talk <ArrowUpRight className="h-3.5 w-3.5" />
        </a >
        <ThemeToggle />
      </div >
    </motion.header >
  )
}

function AuroraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob bg-violet-600/60 h-[480px] w-[480px] -top-32 -left-24" />
      <div className="aurora-blob bg-fuchsia-500/50 h-[420px] w-[420px] top-20 right-0" style={{ animationDelay: '-4s' }} />
      <div className="aurora-blob bg-sky-500/40 h-[520px] w-[520px] bottom-0 left-1/3" style={{ animationDelay: '-9s' }} />
      <div className="absolute inset-0 bg-grid bg-grid-fade" />
      <div className="noise" />
    </div >
  )
}

function Hero() {
  const ref = useRef(null)
  useSpotlight(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] overflow-hidden spotlight">
      < AuroraBackground />
      {/* 3D scene anchored to the right */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute right-[-6%] top-[18%] hidden lg:block h-[640px] w-[640px] opacity-90">
          <HeroScene />
        </div>
        {/* Mobile small accent */}
        <div className="absolute -top-10 right-0 lg:hidden h-[320px] w-[320px] opacity-70">
          <HeroScene />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-44 pb-32">
        < motion.div style={{ y, opacity }
        }>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 backdrop-blur px-3 py-1 text-xs font-mono text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-violet-400" />
            B.Tech IIIT Una'26 - Open to full-time roles
          </motion.div >

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] font-medium tracking-tight"
          >
            Nitin Pratap <span className="font-serif italic text-foreground/80">Singh</span>
          </motion.h1 >

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-2xl text-balance text-lg md:text-xl text-muted-foreground"
          >
            Software Engineer building <span className="text-foreground">delightful interfaces</span> at the
            intersection of design and engineering.Crafting fast, considered products with Next.js, TypeScript and a love for the details.
          </motion.p >

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
              View selected work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a >
            <a href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-sm font-medium hover:bg-secondary transition">
              <Mail className="h-4 w-4" /> Get in touch
            </a >
            <div className="ml-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <MapPin className="h-3.5 w-3.5" /> India · Open to remote
            </div >
          </motion.div >

          {/* Stat strip */}
          < motion.div
            initial={{ opacity: 0, y: 30 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border/60 bg-border/60"
          >
            {
              [
                { k: '3', v: 'Internships Completed' },
                { k: '15+', v: 'Projects shipped' },
                { k: 'AWS', v: 'EC2 · RDS · S3' },
                { k: '∞', v: 'Cups of chai' },
              ].map((s) => (
                <div key={s.v} className="bg-background/80 backdrop-blur-sm p-5">
                  <div className="text-2xl md:text-3xl font-medium tracking-tight">{s.k}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                </div >
              ))
            }
          </motion.div >
        </motion.div >
      </div >

      {/* Scroll indicator */}
      < motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-xs text-muted-foreground"
      >
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-foreground/30 to-transparent" />
        <span className="font-mono">scroll</span>
      </motion.div >
    </section >
  )
}

function MarqueeRow() {
  return (
    <div className="relative overflow-hidden border-y border-border/60 py-6 bg-background">
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {
          [...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="font-serif text-3xl md:text-5xl text-foreground/40 hover:text-foreground transition-colors">
              {t} <span className="text-violet-400/60">✦</span>
            </span>
          ))
        }
      </div >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div >
  )
}

function SectionLabel({ children, num }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="font-mono text-xs text-muted-foreground">{num}</span>
      <div className="h-px flex-1 bg-border/60" />
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{children}</span>
    </div >
  )
}

function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionLabel num="01">About</SectionLabel>
        <div className="grid md:grid-cols-12 gap-10">
          < motion.div
            initial={{ opacity: 0, y: 30 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8 space-y-6"
          >
            <h2 className="text-balance text-3xl md:text-5xl font-medium tracking-tight leading-tight">
              I design and build for the web with{' '}
              <span className="font-serif italic text-foreground/80">obsession over the details</span>.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              I'm a fresher Software Engineer who treats every interface like a product. From pixel-perfect motion to
              shipping production - grade backends on AWS, I love bridging the gap between what feels good and what scales.
              When I'm not shipping, I'm exploring new tech, contributing to side projects, or studying products I admire.
            </p >
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Currently looking for opportunities where I can ship fast, learn deeply, and obsess over craft alongside thoughtful teams.
            </p >
          </motion.div >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="md:col-span-4"
          >
            <div className="glass rounded-2xl p-6 space-y-5 ">
              <div >
                <div className="text-xs text-muted-foreground font-mono mb-1">CURRENTLY</div>
                <div className="text-sm">Open to SWE / Frontend roles</div>
              </div >
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">FOCUS</div>
                <div className="text-sm">Next.js · TypeScript · AWS · Design Engineering</div>
              </div >
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">VALUES</div>
                <div className="text-sm">Speed · Craft · Curiosity</div>
              </div >
              <div className="pt-3 border-t border-border/60 flex gap-2">
                < a href="https://github.com/NitinSingh07" target="_blank" rel="noreferrer"
                  className="grid place-items-center h-9 w-9 rounded-full border border-border/60 hover:bg-secondary transition">
                  < Github className="h-4 w-4" />
                </a >
                <a href="https://www.linkedin.com/in/nitin-pratap-singh-319665257/" target="_blank" rel="noreferrer"
                  className="grid place-items-center h-9 w-9 rounded-full border border-border/60 hover:bg-secondary transition">
                  < Linkedin className="h-4 w-4" />
                </a >
                <a href="mailto:nitinthakur4406@gmail.com" className="grid place-items-center h-9 w-9 rounded-full border border-border/60 hover:bg-secondary transition">
                  < Mail className="h-4 w-4" />
                </a >
              </div >
            </div >
          </motion.div >
        </div >
      </div >
    </section >
  )
}

function ProjectCard({ p, i }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-50, 50], [6, -6]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-50, 50], [-6, 6]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.a
      href={p.href}
      target="_blank"
      rel="noreferrer"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: i * 0.08 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur p-8 md:p-10 transition-colors hover:border-border"
    >
      {/* Accent gradient */}
      < div className={`absolute -top-32 -right-24 h-72 w-72 rounded-full bg-gradient-to-br ${p.accent} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700`} />
      < div className="absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(circle_at_top_right,black,transparent_60%)]" />

      < div className="relative">
        < div className="flex items-start justify-between gap-4">
          < div >
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              < span > {p.tag}</span >
              <span className="opacity-50">·</span>
              < span > {p.year}</span >
            </div >
            <h3 className="mt-3 text-3xl md:text-4xl font-medium tracking-tight">
              {p.name}
            </h3 >
          </div >
          <div className="h-11 w-11 grid place-items-center rounded-full border border-border/60 group-hover:bg-foreground group-hover:text-background transition-colors">
            < ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
          </div >
        </div >

        <p className="mt-5 text-muted-foreground max-w-2xl text-[15px] leading-relaxed">
          {p.description}
        </p >

        <ul className="mt-5 space-y-2">
          {
            p.bullets.map((b, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                < ChevronRight className="h-4 w-4 mt-0.5 text-foreground/60 shrink-0" />
                < span > {b}</span >
              </li >
            ))
          }
        </ul >

        <div className="mt-6 flex flex-wrap gap-1.5">
          {
            p.stack.map((s) => (
              <span key={s}
                className="rounded-full border border-border/60 bg-background/40 backdrop-blur px-2.5 py-1 text-xs font-mono text-muted-foreground">
                {s}
              </span >
            ))
          }
        </div >
      </div >
    </motion.a >
  )
}

function Projects() {
  return (
    <section id="work" className="relative py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionLabel num="02">Selected Work</SectionLabel>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-balance text-3xl md:text-5xl font-medium tracking-tight">
            Things I've <span className="font-serif italic text-foreground/80">built</span>.
          </h2>
          <a href="https://github.com/NitinSingh07" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
            View all on GitHub <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {
            PROJECTS.map((p, i) => (
              <div key={p.name} className={i === 0 ? 'md:col-span-2' : ''}>
                <ProjectCard p={p} i={i} />
              </div>
            ))
          }
        </div >
      </div >
    </section >
  )
}

function ExperienceCard({ e, i }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-50, 50], [6, -6]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-50, 50], [-6, 6]), { stiffness: 200, damping: 20 })

  const onMove = (event) => {
    const r = ref.current.getBoundingClientRect()
    mx.set(event.clientX - r.left - r.width / 2)
    my.set(event.clientY - r.top - r.height / 2)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: i * 0.08 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur p-8 md:p-10 transition-colors hover:border-border"
    >
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span>{e.period}</span>
              <span className="opacity-50">·</span>
              <span>{e.location}</span>
            </div>
            <h3 className="mt-3 text-2xl md:text-3xl font-medium tracking-tight">
              {e.role} <span className="text-muted-foreground">@ {e.company}</span>
            </h3>
          </div>
          <div className="h-11 w-11 shrink-0 grid place-items-center rounded-full border border-border/60 bg-secondary text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {e.bullets.map((b, idx) => (
            <li key={idx} className="flex gap-3 text-[15px] text-muted-foreground leading-relaxed">
              <ChevronRight className="h-4 w-4 mt-1 text-foreground/60 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
          {e.tags.map((t) => (
            <span key={t} className="rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1.5 text-xs font-mono text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Experience() {
  return (
    <section id="experience" className="relative py-32 px-6">
      <div className="mx-auto max-w-4xl">
        <SectionLabel num="03">Experience</SectionLabel>
        <div className="mb-12">
          <h2 className="text-balance text-3xl md:text-5xl font-medium tracking-tight">
            Where I've <span className="font-serif italic text-foreground/80">worked</span>.
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          {EXPERIENCE.map((e, i) => (
            <ExperienceCard key={i} e={e} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

const SKILL_ICONS = {
  Languages: Code2,
  Frameworks: Layers,
  'Cloud & DB': Cloud,
  'DevOps & Tools': Wrench,
  'UI & Styling': Palette,
}

function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionLabel num="05">Toolkit</SectionLabel>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-balance text-3xl md:text-5xl font-medium tracking-tight">
            The stack I <span className="font-serif italic text-foreground/80">reach for</span>.
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            A pragmatic mix of tools, picked for shipping fast without compromising craft.
          </p >
        </div >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {
            Object.entries(SKILLS).map(([cat, items], i) => {
              const Icon = SKILL_ICONS[cat] || Zap
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 grid place-items-center rounded-lg bg-secondary">
                      < Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">{cat}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {
                      items.map((s) => (
                        <span key={s}
                          className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/40 transition">
                          {s}
                        </span >
                      ))
                    }
                  </div >
                  <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/0 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </motion.div >
              )
            })}
        </div >
      </div >
    </section >
  )
}

function Contact() {
  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        < div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-sky-500/20 blur-[100px] rounded-full" />
        < div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        < SectionLabel num="06">Get in touch</SectionLabel>
        < motion.h2
          initial={{ opacity: 0, y: 20 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-balance text-4xl md:text-7xl font-medium tracking-tight leading-[0.95]"
        >
          Let's build something{' '}
          < span className="font-serif italic text-shimmer">remarkable</span>.
        </motion.h2 >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Have a role, a project, or just want to talk shop ? My inbox is always open.
        </motion.p >

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <a href="mailto:nitinthakur4406@gmail.com"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition\">
            < Mail className="h-4 w-4" />
            nitinthakur4406 @gmail.com
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a >
        </motion.div >

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex justify-center gap-3"
        >
          {
            [
              { Icon: Github, href: 'https://github.com/NitinSingh07', label: 'GitHub' },
              { Icon: Linkedin, href: 'https://www.linkedin.com/in/nitin-pratap-singh-319665257/', label: 'LinkedIn' },
              { Icon: Mail, href: 'mailto:nitinthakur4406@gmail.com', label: 'Email' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="group h-11 w-11 grid place-items-center rounded-full border border-border/60 hover:bg-foreground hover:text-background transition-colors"
                aria-label={label} >
                <Icon className="h-4 w-4" />
              </a >
            ))
          }
        </motion.div >
      </div >
    </section >
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 px-6">
      < div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
        < div >© {new Date().getFullYear()} Nitin Pratap Singh · Built with Next.js & Framer Motion.</div >
        <div className="flex items-center gap-4">
          < span > v1.0.0</span >
          <span className="flex items-center gap-1.5">
            < span className="relative flex h-1.5 w-1.5">
              < span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              < span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span >
            Available
          </span >
        </div >
      </div >
    </footer >
  )
}

// ------------------------------ Page ------------------------------
function App() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      < Navbar />
      <Hero />
      <MarqueeRow />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
      <Footer />
    </main >
  )
}

export default App