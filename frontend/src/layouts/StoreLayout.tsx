// ==========================================
// STORE LAYOUT (RETAIL E-COMMERCE SHELL)
// Google Material 3 / Modern Consumer Tech Retail
// Specs: AnnouncementBar, StoreHeader, Outlet, CartDrawer, StoreFooter
// ==========================================

import React from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { StoreHeader } from '../components/store/StoreHeader';
import { StoreFooter } from '../components/store/StoreFooter';
import { CartDrawer } from '../features/cart/CartDrawer';

export const StoreLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get('category') || 'all';

  const handleCategorySelect = (catId: string, subId?: string) => {
    if (catId === 'promo') {
      const el = document.getElementById('section-promo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (catId === 'all') {
      searchParams.delete('category');
      searchParams.delete('sub');
    } else {
      searchParams.set('category', catId);
      if (subId && subId !== 'all') {
        searchParams.set('sub', subId);
      } else {
        searchParams.delete('sub');
      }
    }
    setSearchParams(searchParams);

    // If not on /store, navigate to /store with category
    if (!window.location.pathname.startsWith('/store')) {
      const q = subId && subId !== 'all' ? `?category=${catId}&sub=${subId}` : `?category=${catId}`;
      navigate(`/store${q}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#172033] font-sans selection:bg-[#00B8D9] selection:text-white">
      {/* 1. Retail Store Header with Department Nav */}
      <StoreHeader
        selectedCategory={currentCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* 3. Main Outlet Container */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. Customer Shopping / Requisition Cart Drawer */}
      <CartDrawer />

      {/* 5. Comprehensive Retail Footer */}
      <StoreFooter />
    </div>
  );
};
