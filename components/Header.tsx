import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Sparkles, ShoppingCart, Bookmark, LogIn, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { to: "/ai-chef", icon: Sparkles, text: "Kọbiri Chef" },
  { to: "/market-list", icon: ShoppingCart, text: "Market List" },
  { to: "/cookbook", icon: Bookmark, text: "My Cookbook" },
];

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 animate-in fade-in-20 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed top-0 right-0 bottom-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 p-6 shadow-2xl animate-in slide-in-from-right-full"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>
      )}
    </header>
  );
};

export default Header;