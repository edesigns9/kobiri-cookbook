import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, ShoppingCart, Bookmark, LogIn, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { to: "/ai-chef", icon: Sparkles, text: "Kọbiri Chef" },
  { to: "/market-list", icon: ShoppingCart, text: "Market List" },
  { to: "/cookbook", icon: Bookmark, text: "My Cookbook" },
];

interface HeaderProps {
  user: any;
  handleLogout: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const NavLinkItems: React.FC = () => (
  <>
    {navLinks.map(({ to, icon: Icon, text }) => (
      <Button variant="ghost" asChild key={to}>
          <Link to={to} className="flex items-center gap-4">
              <Icon className="w-5 h-5" /> {text}
          </Link>
      </Button>
    ))}
  </>
);


const Header: React.FC<HeaderProps> = ({ user, handleLogout, setIsMenuOpen }) => {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1 text-2xl font-bold">
            <img src="/assets/Kobiri-pan.svg" alt="Kọbiri Logo" className="w-14 h-14" />
            <span>Kọbiri</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinkItems />
          </nav>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={handleLogout} size="sm" className="hidden md:inline-flex">
                Logout
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-6 h-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;