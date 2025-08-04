import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Menu, X, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { assets } from '../../assets/assets';

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, onAuthStateChanged, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* added school logo */}
            <Link to="/" className="flex items-center">
                  <img
                    src={assets.logo}
                    alt="School Logo"
                    className="h-20 w-20 object-contain"
                  />
            </Link>

            {onAuthStateChanged && (
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <Link 
                  to="/dashboard" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/notices" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  Notices
                </Link>
                <Link 
                  to="/students" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  Students
                </Link>
              </nav>
            )}
          </div>

          {onAuthStateChanged ? (
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center gap-3">
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name || user?.email}
                  </span>
                  <Avatar 
                    fallback={user?.name || user?.email?.substring(0, 2) || 'AU'} 
                    size="sm"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={<LogOut className="h-4 w-4" />}
                className="ml-4"
                onClick={handleLogout}
              >
                <span className="sr-only md:not-sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                icon={<User className="h-4 w-4" />}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </div>
          )}

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && onAuthStateChanged && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/notices"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Notices
            </Link>
            <Link
              to="/students"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Students
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
