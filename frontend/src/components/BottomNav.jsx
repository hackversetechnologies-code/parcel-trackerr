import { NavLink } from 'react-router-dom';
import { Home, Search, User, Bell } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

export default function BottomNav() {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  if (!isMobile) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tracking', icon: Search, label: 'Track' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/contact', icon: Bell, label: 'Contact' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t shadow-sm z-[80]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', backgroundColor: 'hsl(var(--card))', borderTopColor: 'hsl(var(--border))', borderTopWidth: 1 }}
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-foreground/70'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
