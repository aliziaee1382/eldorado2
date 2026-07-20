import React, { useState, useEffect } from 'react';
import { Language, Product, BlogPost, HomeConfig, Category } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import AboutStory from './components/AboutStory';
import InteractiveBlog from './components/InteractiveBlog';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { productsData, blogData, defaultHomeConfig, defaultCategories } from './data';
import { loadFromCloudDb, saveToCloudDb, isFirebaseConfigured } from './lib/firebase';

export default function App() {
  const [currentLang, setLang] = useState<Language>('fa');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eldorado_theme');
    if (saved) {
      return saved === 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Default to light mode
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Host dynamic PHP database saver helper
  const syncToPhpApi = async (key: string, data: any) => {
    try {
      await fetch('api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'save_key',
          password: 'qwertyuiop1234567890',
          key: key,
          data: data
        })
      });
    } catch (err) {
      console.warn("PHP API not reachable:", err);
    }
  };

  // Dynamic products state with localStorage fallback
  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eldorado_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return productsData;
  });

  const setProducts = async (newProducts: Product[]) => {
    setProductsState(newProducts);
    localStorage.setItem('eldorado_products', JSON.stringify(newProducts));
    await syncToPhpApi('eldorado_products', newProducts);
    await saveToCloudDb('eldorado_products', newProducts);
  };

  // Dynamic blogs state with localStorage fallback
  const [blogs, setBlogsState] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('eldorado_blogs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return blogData;
  });

  const setBlogs = async (newBlogs: BlogPost[]) => {
    setBlogsState(newBlogs);
    localStorage.setItem('eldorado_blogs', JSON.stringify(newBlogs));
    await syncToPhpApi('eldorado_blogs', newBlogs);
    await saveToCloudDb('eldorado_blogs', newBlogs);
  };

  // Dynamic home page config state with localStorage fallback
  const [homeConfig, setHomeConfigState] = useState<HomeConfig>(() => {
    const saved = localStorage.getItem('eldorado_home_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultHomeConfig;
  });

  const setHomeConfig = async (newConfig: HomeConfig) => {
    setHomeConfigState(newConfig);
    localStorage.setItem('eldorado_home_config', JSON.stringify(newConfig));
    await syncToPhpApi('eldorado_home_config', newConfig);
    await saveToCloudDb('eldorado_home_config', newConfig);
  };

  // Dynamic categories state with localStorage fallback
  const [categories, setCategoriesState] = useState<Category[]>(() => {
    const saved = localStorage.getItem('eldorado_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultCategories;
  });

  const setCategories = async (newCategories: Category[]) => {
    setCategoriesState(newCategories);
    localStorage.setItem('eldorado_categories', JSON.stringify(newCategories));
    await syncToPhpApi('eldorado_categories', newCategories);
    await saveToCloudDb('eldorado_categories', newCategories);
  };

  // Initial fetch of fresh cloud data and cPanel host database on mount
  useEffect(() => {
    async function loadAllData() {
      // 1. Try to load from host PHP API database (main priority for cPanel users!)
      let loadedFromPhp = false;
      try {
        const res = await fetch('api.php');
        if (res.ok) {
          const text = await res.text();
          // Check if this is not static PHP source code
          if (text && !text.trim().startsWith('<?php')) {
            const db = JSON.parse(text);
            if (db) {
              if (db.eldorado_products) {
                setProductsState(db.eldorado_products);
                localStorage.setItem('eldorado_products', JSON.stringify(db.eldorado_products));
              }
              if (db.eldorado_blogs) {
                setBlogsState(db.eldorado_blogs);
                localStorage.setItem('eldorado_blogs', JSON.stringify(db.eldorado_blogs));
              }
              if (db.eldorado_home_config) {
                setHomeConfigState(db.eldorado_home_config);
                localStorage.setItem('eldorado_home_config', JSON.stringify(db.eldorado_home_config));
              }
              if (db.eldorado_categories) {
                setCategoriesState(db.eldorado_categories);
                localStorage.setItem('eldorado_categories', JSON.stringify(db.eldorado_categories));
              }
              if (db.eldorado_inquiries) {
                localStorage.setItem('eldorado_inquiries', JSON.stringify(db.eldorado_inquiries));
              }
              if (db.eldorado_contact_settings) {
                localStorage.setItem('eldorado_contact_settings', JSON.stringify(db.eldorado_contact_settings));
              }
              loadedFromPhp = true;
              console.log("Database successfully loaded and synchronized from your hosting!");
            }
          }
        }
      } catch (err) {
        console.warn('PHP API not found or not executed. Falling back to Local/Firebase storage:', err);
      }

      // 2. Fallback/sync to Firebase if PHP is not available or we want cloud sync
      if (!loadedFromPhp && isFirebaseConfigured()) {
        try {
          const cloudProducts = await loadFromCloudDb<Product[]>('eldorado_products', productsData);
          setProductsState(cloudProducts);
          localStorage.setItem('eldorado_products', JSON.stringify(cloudProducts));

          const cloudBlogs = await loadFromCloudDb<BlogPost[]>('eldorado_blogs', blogData);
          setBlogsState(cloudBlogs);
          localStorage.setItem('eldorado_blogs', JSON.stringify(cloudBlogs));

          const cloudHomeConfig = await loadFromCloudDb<HomeConfig>('eldorado_home_config', defaultHomeConfig);
          setHomeConfigState(cloudHomeConfig);
          localStorage.setItem('eldorado_home_config', JSON.stringify(cloudHomeConfig));

          const cloudCategories = await loadFromCloudDb<Category[]>('eldorado_categories', defaultCategories);
          setCategoriesState(cloudCategories);
          localStorage.setItem('eldorado_categories', JSON.stringify(cloudCategories));
        } catch (err) {
          console.error('Failed to load cloud data on mount:', err);
        }
      }
    }
    loadAllData();
  }, []);

  // Sync dark mode class on document element & theme-color meta tag
  useEffect(() => {
    const root = window.document.documentElement;
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }

    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('eldorado_theme', 'dark');
      themeColorMeta.setAttribute('content', '#030712');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('eldorado_theme', 'light');
      themeColorMeta.setAttribute('content', '#DC2626');
    }
  }, [darkMode]);

  const handleNavSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() !== '') {
      setActiveTab('products');
    }
  };

  // Capture lead submissions dynamically from ContactSection
  const handleNewLead = async (lead: { name: string; phone: string; message: string }) => {
    const saved = localStorage.getItem('eldorado_inquiries');
    let currentInquiries = [];
    if (saved) {
      try {
        currentInquiries = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const newId = currentInquiries.length > 0 ? Math.max(...currentInquiries.map((i: any) => i.id)) + 1 : 1;
    const newLead = {
      id: newId,
      name: lead.name,
      phone: lead.phone,
      message: lead.message,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: ''
    };
    const updated = [newLead, ...currentInquiries];
    
    // 1. Save locally
    localStorage.setItem('eldorado_inquiries', JSON.stringify(updated));
    
    // 2. Submit to PHP API
    try {
      await fetch('api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit_inquiry',
          lead: newLead
        })
      });
    } catch (e) {
      console.warn("Failed to register inquiry on cPanel host database:", e);
    }

    // 3. Sync to Firebase
    await saveToCloudDb('eldorado_inquiries', updated);
    
    // Dispatch custom event to let the AdminPanel state know if it is already open
    window.dispatchEvent(new CustomEvent('new_lead_added'));
  };

  // Determine active components based on tab state
  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Hero currentLang={currentLang} setActiveTab={setActiveTab} homeConfig={homeConfig} />
            <ProductCatalog 
              currentLang={currentLang} 
              searchTerm={searchTerm}
              products={products}
              categories={categories}
              isHome={true}
              setActiveTab={setActiveTab}
            />
            <AboutStory currentLang={currentLang} homeConfig={homeConfig} />
            <InteractiveBlog 
              currentLang={currentLang} 
              blogs={blogs} 
              isHome={true}
              setActiveTab={setActiveTab}
            />
            <ContactSection currentLang={currentLang} onNewLead={handleNewLead} />
          </>
        );
      case 'products':
        return (
          <ProductCatalog 
            currentLang={currentLang} 
            searchTerm={searchTerm}
            products={products}
            categories={categories}
          />
        );
      case 'about':
        return <AboutStory currentLang={currentLang} homeConfig={homeConfig} />;
      case 'blog':
        return <InteractiveBlog currentLang={currentLang} blogs={blogs} />;
      case 'contact':
        return <ContactSection currentLang={currentLang} onNewLead={handleNewLead} />;
      case 'admin':
        return (
          <AdminPanel
            currentLang={currentLang}
            products={products}
            setProducts={setProducts}
            blogs={blogs}
            setBlogs={setBlogs}
            homeConfig={homeConfig}
            setHomeConfig={setHomeConfig}
            categories={categories}
            setCategories={setCategories}
            onClose={() => setActiveTab('home')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col font-sans transition-colors duration-300`}
      dir={currentLang === 'fa' ? 'rtl' : 'ltr'}
    >
      <Navbar 
        currentLang={currentLang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleNavSearch}
      />

      <main className="flex-1">
        {renderActiveView()}
      </main>

      <Footer currentLang={currentLang} setActiveTab={setActiveTab} />
    </div>
  );
}
