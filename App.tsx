import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import { testSupabaseConnection } from './lib/debug';
import Spinner from './components/Spinner';
import { useAuth } from './hooks/useAuth';
import MobileMenu from './components/MobileMenu';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));
const CookbookPage = lazy(() => import('./pages/CookbookPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AIChefPage = lazy(() => import('./pages/AIChefPage'));
const AddRecipePage = lazy(() => import('./pages/AddRecipePage'));
const MarketListPage = lazy(() => import('./pages/MarketListPage'));

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Run Supabase connection test on startup
    testSupabaseConnection().then(success => {
      console.log('Supabase connection test completed. Success:', success);
    });
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} handleLogout={handleLogout} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Spinner /></div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/recipe/:source/:id" element={<RecipeDetailPage />} />
            <Route path="/cookbook" element={<CookbookPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ai-chef" element={<AIChefPage />} />
            <Route path="/add-recipe" element={<AddRecipePage />} />
            <Route path="/market-list" element={<MarketListPage />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-4 px-4 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Kọbiri - Your Global Cookbook</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;