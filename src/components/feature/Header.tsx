
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = '';
    }

    return () => {
      document.body.style.overflowY = '';
    };
  }, [isMenuOpen]);

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

        </div>
      </header>

      {/* Mobile Navigation Drawer - Left Side */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className={`md:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="px-4 py-6">
              {/* Logo */}
              <div className="mb-8">
                <Link to="/" className="flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                  <img 
                    src="/DCODE LOGO.png" 
                    alt="DCODE Systems" 
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2 mb-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-3 px-3 text-gray-700 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Action Buttons */}
              <div className="space-y-3">
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
                <Link
                  to="/playground"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button 
                    size="sm" 
                    fullWidth
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0"
                  >
                    <i className="ri-rocket-line mr-2"></i>
                    Start Learning Now
                  </Button>
                </Link>
                <Link
                  to="/courses"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <button
                    className="w-full px-4 py-2.5 text-sm font-bold bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 hover:border-gray-950 transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
                  >
                    <i className="ri-play-circle-line"></i>
                    Explore Courses
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
