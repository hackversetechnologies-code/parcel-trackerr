import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Package, User, Menu, X, Bell, LogOut, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMediaQuery } from 'react-responsive';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { theme, setTheme, systemTheme } = useTheme();
  const resolved = theme === 'system' ? systemTheme : theme;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tracking?trackingId=${searchQuery.trim()}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      toast({ title: 'Logged out successfully' });
      navigate('/login');
    } catch (error) {
      toast({ title: 'Error logging out', description: error.message });
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Track', path: '/tracking' },
    { name: 'About', path: '/about' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-[90] w-full shadow-sm animate-fade-in" style={{ backgroundColor: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Rush Delivery" className="h-8 w-8" />
            <span className="font-heading text-xl font-bold">Rush Delivery</span>
          </NavLink>

          {/* Desktop Navigation */}
          {!isTablet && (
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-foreground/80'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter Tracking ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" className="btn-hover" aria-label="Search tracking">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              aria-pressed={theme !== 'system'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
              title={`Theme: ${theme}`}
              className="btn-hover"
            >
              {theme === 'system' ? <Laptop className="h-5 w-5" /> : resolved === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative btn-hover" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout" className="btn-hover">
              <LogOut className="h-5 w-5" />
            </Button>
            {isTablet && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="btn-hover"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && isTablet && (
        <div className="fixed inset-0 z-40 animate-fade-in" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <div className="container py-16">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className="text-lg font-medium card-hover p-3 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}