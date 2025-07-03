import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, ShoppingCart, Bookmark, LogIn, LogOut, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { to: "/ai-chef", icon: Sparkles, text: "Kọbiri Chef" },
  { to: "/market-list", icon: ShoppingCart, text: "Market List" },
  { to: "/cookbook", icon: Bookmark, text: "My Cookbook" },
];

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user: any; // Simplified user type
  handleLogout: () => void;
}

const NavLinkItems: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
  <>
    {navLinks.map(({ to, icon: Icon, text }) => (
      <Button variant="ghost" asChild key={to} className={cn(isMobile && "w-full justify-start text-lg py-6")}>
          <Link to={to} className="flex items-center gap-4">
              <Icon className="w-5 h-5" /> {text}
          </Link>
      </Button>
    ))}
  </>
);


const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, setIsMenuOpen, user, handleLogout }) => {
  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-card text-card-foreground p-6 animate-in fade-in-20 md:hidden">
      <div className="flex items-center justify-between mb-8">
        <span className="font-bold text-xl">Menu</span>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
          <X className="w-6 h-6" />
          <span className="sr-only">Close menu</span>
        </Button>
      </div>
      <nav className="flex flex-col gap-2">
        <NavLinkItems isMobile />
        <div className="border-t my-4"></div>
        {user ? (
          <Button onClick={handleLogout} className="w-full justify-start text-lg py-6" variant="ghost">
            <LogOut className="w-5 h-5 mr-4" /> Logout
          </Button>
        ) : (
          <Button asChild className="w-full justify-start text-lg py-6" variant="ghost">
            <Link to="/login" className="flex items-center">
              <LogIn className="w-5 h-5 mr-4" /> Login
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu; 