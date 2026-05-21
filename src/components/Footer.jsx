import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Twitter, Phone, Mail, MapPin, ArrowRight } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-dark-800 dark:bg-dark-900 text-white">
      {/* CTA Strip */}
      <div className="animated-gradient py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4 tracking-wide">
            READY TO TRANSFORM YOUR <span className="text-brand-200">BODY?</span>
          </h2>
          <p className="text-white/80 font-body mb-8">Join 1000+ members already crushing their goals</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-heading font-bold px-8 py-4 rounded-xl
          hover:bg-brand-50 transition-all duration-200 text-lg">
            START YOUR JOURNEY <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" className="brightness-0 invert" />
            <p className="text-gray-400 font-body text-sm leading-relaxed">
              Pakistan's first AI-powered gym management system. Transforming fitness through technology.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Twitter, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 rounded-xl bg-dark-700 dark:bg-dark-600 flex items-center justify-center
                  text-gray-400 hover:bg-brand-500 hover:text-white transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-lg mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                ['Home', '/'], ['About Us', '/about'],
                ['Classes', '/classes'], ['Pricing Plans', '/plans'],
                ['Our Trainers', '/trainers'], ['AI Features', '/ai-features'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-brand-400 font-body text-sm
                  flex items-center gap-2 group transition-colors">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white text-lg mb-5">Services</h4>
            <ul className="space-y-3">
              {[
                'AI Workout Planner', 'BMI Calculator', 'Diet Consultation',
                'Personal Training', 'Group Classes', 'Online Booking',
              ].map(item => (
                <li key={item} className="text-gray-400 font-body text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white text-lg mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 font-body text-sm">
                  123 Fitness Street, Gulberg III, Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-500 flex-shrink-0" />
                <a href="tel:+923001234567" className="text-gray-400 hover:text-brand-400 font-body text-sm transition-colors">
                  +92 312-6784162
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-500 flex-shrink-0" />
                <a href="mailto:info@powerfit.pk" className="text-gray-400 hover:text-brand-400 font-body text-sm transition-colors">
                  info@powerfit.pk
                </a>
              </li>
            </ul>
            {/* Hours */}
            <div className="mt-5 p-4 bg-dark-700 dark:bg-dark-600 rounded-xl">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">Gym Hours</p>
              <p className="text-gray-300 text-xs font-body">Mon – Sat: 5:00 AM – 11:00 PM</p>
              <p className="text-gray-300 text-xs font-body">Sunday: 7:00 AM – 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700 dark:border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 font-body text-sm">
            © {year} PowerFit AI Gym. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
              <a key={item} href="#" className="text-gray-500 hover:text-gray-300 font-body text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
