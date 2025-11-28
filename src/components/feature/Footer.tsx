import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <div className="flex items-center">
                <img 
                  src="/DCODE LOGO.png" 
                  alt="DCODE Systems" 
                  className="h-16 w-auto"
                />
              </div>
            </Link>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Empowering the next generation of developers with AI-powered learning, 
              expert mentorship, and real-world career opportunities.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://twitter.com/dcode_academy" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                <i className="ri-twitter-line text-2xl"></i>
              </a>
              <a href="https://linkedin.com/company/dcode-academy" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                <i className="ri-linkedin-line text-2xl"></i>
              </a>
              <a href="https://github.com/dcode-academy" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                <i className="ri-github-line text-2xl"></i>
              </a>
              <a href="https://discord.gg/dcode-community" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                <i className="ri-discord-line text-2xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 DCODE. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Made with</span>
            <i className="ri-heart-fill text-red-400"></i>
            <span className="text-gray-400 text-sm">for developers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
