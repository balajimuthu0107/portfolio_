import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import profileImage from './asstes/image.jpg'
import {
  FiMenu,
  FiX,
  FiMail,
  FiArrowRight,
  FiGithub,
  FiLinkedin,
  FiPhone,
  FiDownload,
} from 'react-icons/fi'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const skills = [
  { name: 'React', level: 50 },
  { name: 'Tailwind CSS', level: 80 },
  { name: 'JavaScript', level: 70 },
  { name: 'TypeScript', level: 60 },
  { name: 'Java', level: 75 },
  { name: 'Responsive Design', level: 50 },
]

const projects = [
  {
    title: 'Library Management System',
    description: 'A responsive library management system built with React and Tailwind CSS.',
    tags: ['Java'],
    github: 'https://github.com/balajimuthu0107/Library-Management-System',
  },
  {
    title: 'Billing System',
    description: 'Interactive billing and invoice management system with real-time balance tracking, customer accounts, and receipt generation.',
    tags: ['React', 'TypeScript', 'Firebase'],
    github: 'https://github.com/balajimuthu0107/KKMBillingSystem',
  },
  {
    title: 'E-commerce UI',
    description: 'Modern e-commerce product gallery with mobile-first layout.',
    tags: ['UI/UX', 'Responsive', 'CSS'],
    github: 'https://github.com/',
  },

]

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSkill, setActiveSkill] = useState(null)
  const [status, setStatus] = useState('')
  const formRef = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    
    const formData = new FormData(event.target);
    formData.append("access_key", "022eafcf-5a9b-4e49-af66-bfd22c27bd5d");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus('sent');
        event.target.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <a href="#home" className="text-2xl font-semibold tracking-tight text-cyan-300 sm:text-3xl">
            <p><span> Portflio</span></p>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300 md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
        <div className={`${menuOpen ? 'block' : 'hidden'} border-t border-slate-800 bg-slate-950 px-6 pb-6 md:hidden`}>
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link block rounded-xl px-4 py-3 transition hover:bg-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-8">
        <section id="home" className="grid min-h-[calc(100vh-72px)] place-items-center gap-10 pt-10 md:pt-16">
          <div className="section-card w-full rounded-3xl p-8 shadow-xl shadow-slate-950/20 backdrop-blur-md md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-3xl space-y-6">
                <p className="text-cyan-300 text-xl sm:text-2xl">Hi, I'm <span className="name">Balaji</span><span className="type-name">Muthu</span></p>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/90">Frontend Developer</p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  I build clean, responsive web experiences.
                </h1>
                <p className="text-slate-300 sm:text-lg">
                Proficient in HTML, CSS, JavaScript, and Java, with hands-on experience building a Library Management System and a Calculator app — eager to bring this foundation to a real-world team.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a href="#projects" className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto">
                    View Projects
                    <FiArrowRight className="ml-2" />
                  </a>
                  <a href="#contact" className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-6 py-3 text-sm text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300 sm:w-auto">
                    Let's Talk
                  </a>
                  <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-6 py-3 text-sm text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300 sm:w-auto">
                    Resume
                    <FiDownload className="ml-2" />
                  </a>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" />
                  <div className="profile-wrap">
                    <div className="ring ring-3"></div>
                    <div className="ring ring-2"></div>
                    <div className="ring ring-1"></div>
                    <div className="profile-img-wrapper">
                      <img src={profileImage} alt="Portrait of Balaji" className="profile-img" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section-card scroll-mt-24 rounded-3xl p-8 shadow-xl shadow-slate-950/10 backdrop-blur-md md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
            <div>
              <p className="text-cyan-300">About Me</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Creative problem solver with a polished frontend focus.</h2>
              <p className="mt-5 text-slate-300 leading-8">
                I'm a frontend developer who enjoys turning ideas into real, usable products. I've built projects like a Library Management System and a Calculator from scratch, and I'm passionate about creating clean, interactive web experiences.
              </p>
            </div>
            <div className="info-card rounded-3xl p-6 text-slate-200 shadow-lg shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fast facts</p>
              <ul className="mt-6 space-y-4 text-slate-300">
                <li>
                  <a
                    href="https://www.google.com/maps/place/Kodambakkam,+Chennai,+Greater+Chennai,+Tamil+Nadu/@13.0505068,80.2115185,3394m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a5266f066d7dc93:0xfaeae16b3a24c9c5!8m2!3d13.0521019!4d80.2255286!16s%2Fm%2F076vr4f?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    <span className="text-lg">📍</span>
                    <span>
                      <span className="font-semibold text-white">Location:</span> Chennai Kodambakkam, Tamil Nadu, India
                    </span>
                  </a>
                </li>
                <li>
                  <span className="font-semibold text-white">Experience:</span> Building modern web interfaces
                </li>
                <li>
                  <span className="font-semibold text-white">Focus:</span> Responsive UI, performance, accessible interactions
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="skills" className="section-card scroll-mt-24 mt-10 rounded-3xl p-8 shadow-xl shadow-slate-950/10 backdrop-blur-md md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-cyan-300">Skills</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Tools and technologies I work with.</h2>
            </div>
            <p className="max-w-2xl text-slate-300">
              A balanced toolkit for responsive frontend development, component-driven apps, and modern styling.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {skills.map((skill) => {
              const isActive = activeSkill === skill.name

              return (
                <button
                  key={skill.name}
                  type="button"
                  onClick={() => setActiveSkill(isActive ? null : skill.name)}
                  className={`skill-card px-5 py-2.5 text-left text-slate-100 transition hover:border-cyan-400 hover:bg-slate-900 ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{skill.name}</span>
                    {isActive ? (
                      <span className="font-bold text-cyan-300 text-sm">{skill.level}%</span>
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400"></span>
                    )}
                  </div>
                  {isActive ? (
                    <div className="mt-2">
                      <div className="bar-track h-1.5">
                        <div className="bar-fill" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </section>

        <section id="projects" className="section-card scroll-mt-24 mt-10 rounded-3xl p-8 shadow-xl shadow-slate-950/10 backdrop-blur-md md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-cyan-300">Projects</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Selected work.</h2>
            </div>
            <p className="max-w-2xl text-slate-300">
              Example projects that highlight responsive layouts, clean UI, and component-based design.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.title} className="project-card space-y-4 rounded-3xl p-6 transition hover:border-cyan-400 hover:bg-slate-900">
                <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                <p className="text-slate-300 leading-7">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-300 transition hover:text-white"
                >
                  View on GitHub <FiArrowRight />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section-card scroll-mt-24 mt-10 rounded-3xl p-8 shadow-xl shadow-slate-950/10 backdrop-blur-md md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div>
              <p className="text-cyan-300">Contact</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Let's build something together.</h2>
              <p className="mt-5 text-slate-300 leading-8">
                Have an idea or a project? Send a message and I will reply as soon as possible.
              </p>
              <div className="info-card mt-8 space-y-5 rounded-3xl p-6 text-slate-200 shadow-lg shadow-slate-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex w-6 shrink-0 justify-center">
                    <FiMail className="text-cyan-300 text-xl" />
                  </div>
                  <a href="mailto:balajimuthu0107@gmail.com" className="transition hover:text-cyan-300 break-words">
                    balajimuthu0107@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-6 shrink-0 justify-center">
                    <FiPhone className="text-cyan-300 text-xl" />
                  </div>
                  <a href="tel:+918148145130" className="transition hover:text-cyan-300">
                    +91 81481 45130
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-6 shrink-0 justify-center">
                    <FiGithub className="text-cyan-300 text-xl" />
                  </div>
                  <a className="transition hover:text-cyan-300 break-words" href="https://github.com/balajimuthu0107/portfolio_" target="_blank" rel="noreferrer">
                    github.com/balajimuthu0107/portfolio_
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-6 shrink-0 justify-center">
                    <FiLinkedin className="text-cyan-300 text-xl" />
                  </div>
                  <a className="transition hover:text-cyan-300" href="https://www.linkedin.com/in/balajimuthu/" target="_blank" rel="noreferrer">
                    Balaji Muthu
                  </a>
                </div>
              </div>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="contact-form-container group">
              <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Message</label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Your message"
                  required
                  className="h-32 w-full resize-none rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group/btn relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover/btn:duration-1000 group-hover/btn:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-10 bg-white/20" />
                  </div>
                  <span className="relative">{status === 'sending' ? 'Sending...' : 'Send message'}</span>
                </button>
              </div>
              {status === 'sent' && (
                <p className="text-center text-sm font-medium text-cyan-400">Message sent! I&apos;ll reply soon.</p>
              )}
              {status === 'error' && (
                <p className="text-center text-sm font-medium text-red-400">Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/90 py-8 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm md:flex-row md:px-8">
          <p>© 2026 Balaji. Crafted with React and responsive design.</p>
          <p>Built for modern portfolios and clean user experience.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
