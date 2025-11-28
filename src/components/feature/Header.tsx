
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import GlobalSearch from './GlobalSearch';
import SidebarSettingsDropdown from './SidebarSettingsDropdown';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Mentors', href: '/mentors' },
    { name: 'Playground', href: '/playground' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-theme-card-bg/95 backdrop-blur-md border-b border-theme-border shadow-lg' 
          : 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-theme-bg-primary dark:via-theme-bg-secondary dark:to-theme-bg-primary'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Fixed Position */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="/DCODE LOGO.png" 
                  alt="DCODE Systems" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative transition-all duration-300 font-medium group ${
                    isScrolled 
                      ? 'text-theme-text-primary hover:text-brand-primary' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    isScrolled ? 'bg-brand-primary' : 'bg-white'
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Search and Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Global Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                  isScrolled 
                    ? 'bg-theme-hover-bg text-theme-text-secondary hover:bg-theme-hover-bg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <i className="ri-search-line mr-2"></i>
                Search
                <kbd className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  isScrolled ? 'bg-theme-hover-bg text-theme-text-tertiary' : 'bg-white/20 text-white/60'
                }`}>
                  ⌘K
                </kbd>
              </button>

              <Link to="/auth/signin">
                <Button 
                  variant={isScrolled ? "brand-outline" : "secondary"} 
                  size="sm"
                  className={!isScrolled ? "border-white/30 text-white hover:bg-white/10" : ""}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button variant="brand" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu and search */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isScrolled 
                    ? 'hover:bg-theme-hover-bg text-theme-text-primary' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <i className="ri-search-line text-xl"></i>
              </button>
              
              <button
                type="button"
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isScrolled 
                    ? 'hover:bg-theme-hover-bg text-theme-text-primary' 
                    : 'hover:bg-white/10 text-white'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <i className={`text-xl ${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-theme-card-bg/95 backdrop-blur-md border-t border-theme-border shadow-lg animate-slide-down">
              <div className="px-4 py-4 space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-3 px-2 text-theme-text-primary hover:text-brand-primary hover:bg-theme-hover-bg rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-theme-border space-y-3">
                  <Link
                    to="/auth/signin"
                    className="block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="brand-outline" size="sm" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/auth/signin"
                    className="block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="brand" size="sm" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
