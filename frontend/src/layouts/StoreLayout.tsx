// ==========================================
// STORE LAYOUT (RETAIL E-COMMERCE SHELL)
// Google Material 3 / Modern Consumer Tech Retail
// Specs: AnnouncementBar, StoreHeader, Outlet, CartDrawer, StoreFooter
// ==========================================

import React from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { StoreHeader } from '../components/store/StoreHeader';
import { StoreFooter } from '../components/store/StoreFooter';
import { CartDrawer } from '../features/cart/CartDrawer';

export const StoreLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentCategory = searchParams.get('category') || 'all';

  const handleCategorySelect = (catId: string, subId?: string) => {
    if (catId === 'promo') {
      const hasFilters = Boolean(
        searchParams.get('category') || searchParams.get('sub') || searchParams.get('search') || searchParams.get('q')
      );
      if (location.pathname !== '/store' || hasFilters) {
        navigate('/store#section-promo');
        return;
      }
      const el = document.getElementById('section-promo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      nextParams.delete('category');
      nextParams.delete('sub');
    } else {
      nextParams.set('category', catId);
      if (subId && subId !== 'all') {
        nextParams.set('sub', subId);
      } else {
        nextParams.delete('sub');
      }
    }

    if (location.pathname !== '/store') {
      const qs = nextParams.toString();
      navigate(qs ? `/store?${qs}` : '/store');
      return;
    }

    setSearchParams(nextParams);
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
