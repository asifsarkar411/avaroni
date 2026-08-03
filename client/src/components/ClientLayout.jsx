'use client';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProductModal from './ProductModal';
import AOS from 'aos';

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    AOS.init({ 
      duration: 600, 
      once: true, 
      offset: 30,
      easing: 'ease-in-out',
      disable: 'mobile'
    });
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <ProductModal />
      <main>{children}</main>
    </>
  );
}
