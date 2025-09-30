import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { name: 'Summary', href: '#summary' },
  { name: 'Research', href: '#research' },
  { name: 'Compute Forecast', href: '#compute' },
  { name: 'Timelines Forecast', href: '#timelines' },
  { name: 'Takeoff Forecast', href: '#takeoff' },
  { name: 'AI Goals Forecast', href: '#goals' },
  { name: 'Security Forecast', href: '#security' },
];

export const TopNav = () => {
  const [activeSection, setActiveSection] = useState('summary');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // Determine active section
      const sections = navItems.map(item => item.href.slice(1));
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm transition-all ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 flex-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`text-sm transition-all hover:text-black ${
                  activeSection === item.href.slice(1)
                    ? 'text-black font-semibold border-b-2 border-black'
                    : 'text-gray-800 hover:underline'
                }`}
              >
                {item.name}
              </a>
            ))}
            <Link
              to="/about"
              className="text-sm text-gray-800 hover:text-black hover:underline transition-all"
            >
              About
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex-1">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-white">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`text-base transition-all py-2 ${
                        activeSection === item.href.slice(1)
                          ? 'text-black font-semibold border-l-2 border-black pl-4'
                          : 'text-gray-800 hover:text-black pl-4'
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Link
                    to="/about"
                    onClick={() => setMobileOpen(false)}
                    className="text-base text-gray-800 hover:text-black py-2 pl-4"
                  >
                    About
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};
