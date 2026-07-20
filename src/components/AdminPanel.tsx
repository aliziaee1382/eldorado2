import React, { useState } from 'react';
import { 
  Lock, 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  Database,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Language, Product, BlogPost, HomeConfig, Category } from '../types';
import { 
  getSavedFirebaseConfig, 
  isFirebaseConfigured, 
  saveFirebaseConfigKeys, 
  disconnectFirebase, 
  saveToCloudDb 
} from '../lib/firebase';

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  message: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Completed' | 'Cancelled';
  notes: string;
}

interface AdminPanelProps {
  currentLang: Language;
  products: Product[];
  setProducts: (p: Product[]) => void;
  blogs: BlogPost[];
  setBlogs: (b: BlogPost[]) => void;
  homeConfig: HomeConfig;
  setHomeConfig: (config: HomeConfig) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  onClose: () => void;
}

export default function AdminPanel({
  currentLang,
  products,
  setProducts,
  blogs,
  setBlogs,
  homeConfig,
  setHomeConfig,
  categories,
  setCategories,
  onClose
}: AdminPanelProps) {
  const isRtl = currentLang === 'fa';
  
  // Auth state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('eldorado_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Active Admin View Tab
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'blogs' | 'leads' | 'settings' | 'home' | 'database'>('dashboard');

  // Firebase connection states
  const [fbApiKey, setFbApiKey] = useState(() => getSavedFirebaseConfig()?.apiKey || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(() => getSavedFirebaseConfig()?.authDomain || '');
  const [fbProjectId, setFbProjectId] = useState(() => getSavedFirebaseConfig()?.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(() => getSavedFirebaseConfig()?.storageBucket || '');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(() => getSavedFirebaseConfig()?.messagingSenderId || '');
  const [fbAppId, setFbAppId] = useState(() => getSavedFirebaseConfig()?.appId || '');
  const [isFbConnected, setIsFbConnected] = useState(() => isFirebaseConfigured());
  const [fbSaveMessage, setFbSaveMessage] = useState('');

  // Home Page Management form states
  const [heroBadgeFa, setHeroBadgeFa] = useState(homeConfig.heroBadgeFa);
  const [heroBadgeEn, setHeroBadgeEn] = useState(homeConfig.heroBadgeEn);
  const [heroTitleFa, setHeroTitleFa] = useState(homeConfig.heroTitleFa);
  const [heroTitleEn, setHeroTitleEn] = useState(homeConfig.heroTitleEn);
  const [heroSubFa, setHeroSubFa] = useState(homeConfig.heroSubFa);
  const [heroSubEn, setHeroSubEn] = useState(homeConfig.heroSubEn);
  const [heroPromoFa, setHeroPromoFa] = useState(homeConfig.heroPromoFa);
  const [heroPromoEn, setHeroPromoEn] = useState(homeConfig.heroPromoEn);
  const [heroPromoSubFa, setHeroPromoSubFa] = useState(homeConfig.heroPromoSubFa);
  const [heroPromoSubEn, setHeroPromoSubEn] = useState(homeConfig.heroPromoSubEn);

  const [aboutTitleFa, setAboutTitleFa] = useState(homeConfig.aboutTitleFa);
  const [aboutTitleEn, setAboutTitleEn] = useState(homeConfig.aboutTitleEn);
  const [aboutSubFa, setAboutSubFa] = useState(homeConfig.aboutSubFa);
  const [aboutSubEn, setAboutSubEn] = useState(homeConfig.aboutSubEn);
  const [aboutContentFa, setAboutContentFa] = useState(homeConfig.aboutContentFa);
  const [aboutContentEn, setAboutContentEn] = useState(homeConfig.aboutContentEn);
  const [aboutImageMain, setAboutImageMain] = useState(homeConfig.aboutImageMain);
  const [aboutImageSec, setAboutImageSec] = useState(homeConfig.aboutImageSec);

  const [slidesState, setSlidesState] = useState(homeConfig.slideImages || []);

  const handleUpdateSlideField = (index: number, field: string, value: string) => {
    const updated = slidesState.map((slide, idx) => {
      if (idx === index) {
        return { ...slide, [field]: value };
      }
      return slide;
    });
    setSlidesState(updated);
  };

  const handleAddSlide = () => {
    setSlidesState([
      ...slidesState,
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
        titleFa: 'عنوان اسلاید جدید',
        titleEn: 'New Slide Title',
        subtitleFa: 'توضیحات کوتاه فارسی',
        subtitleEn: 'Short English Subtitle'
      }
    ]);
  };

  const handleDeleteSlide = (index: number) => {
    if (slidesState.length <= 1) {
      alert(isRtl ? 'حداقل باید یک اسلاید وجود داشته باشد!' : 'At least one slide is required!');
      return;
    }
    setSlidesState(slidesState.filter((_, idx) => idx !== index));
  };

  const handleSaveHomeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HomeConfig = {
      heroBadgeFa,
      heroBadgeEn,
      heroTitleFa,
      heroTitleEn,
      heroSubFa,
      heroSubEn,
      heroPromoFa,
      heroPromoEn,
      heroPromoSubFa,
      heroPromoSubEn,
      aboutTitleFa,
      aboutTitleEn,
      aboutSubFa,
      aboutSubEn,
      aboutContentFa,
      aboutContentEn,
      aboutImageMain,
      aboutImageSec,
      slideImages: slidesState
    };
    setHomeConfig(updated);
    localStorage.setItem('eldorado_home_config', JSON.stringify(updated));
    alert(isRtl ? 'تنظیمات صفحه اصلی با موفقیت ذخیره شد.' : 'Home page configuration saved successfully.');
  };

  const handleConnectFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey || !fbProjectId) {
      alert(isRtl ? 'لطفاً حداقل فیلدهای کلید API و شناسه پروژه را تکمیل نمایید!' : 'Please fill in at least the API Key and Project ID!');
      return;
    }
    const config = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim()
    };
    const success = saveFirebaseConfigKeys(config);
    if (success) {
      setIsFbConnected(true);
      setFbSaveMessage(isRtl ? 'اتصال برقرار شد! در حال انتقال داده‌های فعلی به ابر...' : 'Connected! Uploading current database records to cloud DB...');
      
      // Asynchronously upload current states to Firebase so they are immediately persisted!
      Promise.all([
        saveToCloudDb('eldorado_products', products),
        saveToCloudDb('eldorado_blogs', blogs),
        saveToCloudDb('eldorado_home_config', homeConfig),
        saveToCloudDb('eldorado_inquiries', inquiries)
      ]).then(() => {
        setFbSaveMessage(isRtl ? 'داده‌ها با موفقیت همگام‌سازی شدند. سیستم آماده است.' : 'Data successfully synchronized with Cloud Firestore.');
        setTimeout(() => setFbSaveMessage(''), 4000);
      }).catch((err) => {
        console.error(err);
        setFbSaveMessage(isRtl ? 'همگام‌سازی اولیه با شکست مواجه شد اما تنظیمات ذخیره شدند.' : 'Initial sync failed, but keys were stored locally.');
      });
    } else {
      alert(isRtl ? 'خطایی در ثبت اطلاعات رخ داد.' : 'Failed to register the configurations.');
    }
  };

  const handleDisconnectFirebase = () => {
    disconnectFirebase();
    setIsFbConnected(false);
    setFbApiKey('');
    setFbAuthDomain('');
    setFbProjectId('');
    setFbStorageBucket('');
    setFbMessagingSenderId('');
    setFbAppId('');
    alert(isRtl ? 'اتصال ابر قطع گردید. سیستم اکنون به حالت حافظه مرورگر سوئیچ کرد.' : 'Disconnected from Cloud Firestore. Reverting back to local storage.');
  };

  // Full Backup & Restore JSON implementation
  const handleExportBackup = () => {
    const fullBackup = {
      products,
      blogs,
      homeConfig,
      inquiries,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eldorado_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result;
        if (typeof content !== 'string') return;
        const parsed = JSON.parse(content);
        
        // Validate backup schema quickly
        if (!parsed.products || !parsed.blogs || !parsed.homeConfig) {
          alert(isRtl ? 'فایل پشتیبان نامعتبر است!' : 'Invalid backup file format!');
          return;
        }

        // Apply backup states
        setProducts(parsed.products);
        setBlogs(parsed.blogs);
        setHomeConfig(parsed.homeConfig);
        if (parsed.inquiries) {
          setInquiries(parsed.inquiries);
          localStorage.setItem('eldorado_inquiries', JSON.stringify(parsed.inquiries));
        }

        // Also save to Cloud storage if connected
        if (isFbConnected) {
          await Promise.all([
            saveToCloudDb('eldorado_products', parsed.products),
            saveToCloudDb('eldorado_blogs', parsed.blogs),
            saveToCloudDb('eldorado_home_config', parsed.homeConfig),
            saveToCloudDb('eldorado_inquiries', parsed.inquiries || [])
          ]);
        }

        alert(isRtl ? 'پشتیبان با موفقیت بازیابی شد و در سراسر سیستم اعمال گردید!' : 'Database restored and synchronized successfully!');
      } catch (err) {
        console.error(err);
        alert(isRtl ? 'خطایی در تجزیه فایل رخ داد.' : 'Failed to parse the backup file.');
      }
    };
    reader.readAsText(file);
  };

  // List of price inquiries / leads in localStorage
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('eldorado_inquiries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed default mockup leads so the board looks active and realistic
    const defaults: Inquiry[] = [
      {
        id: 1,
        name: 'امیرحسین رضایی',
        phone: '09123456789',
        message: 'درخواست کاتالوگ رنگ چوب راش و تصاویر مبل هفت نفره نیروانا رنگ سرمه‌ای مایل به تیره',
        date: '2026-07-18',
        status: 'Contacted',
        notes: 'کاتالوگ واتساپ ارسال شد. در انتظار تایید کالیته انتخابی مشتری.'
      },
      {
        id: 2,
        name: 'سارا کریمی',
        phone: '09359876543',
        message: 'استعلام قیمت ست مبل ال ماجستیک با پارچه تدی ترک سفید رنگ و ابعاد اختصاصی ۳.۵ در ۲ متر',
        date: '2026-07-19',
        status: 'Pending',
        notes: 'نیاز به هماهنگی با خط تولید کارخانه برای برآورد هزینه ابعاد سفارشی.'
      },
      {
        id: 3,
        name: 'علیرضا حسینی',
        phone: '09121112233',
        message: 'من چند مدل مبل تکی برای چیدمان کافی شاپ میخواستم، تخفیف عمده به چه صورته؟ تماس بگیرید.',
        date: '2026-07-19',
        status: 'Pending',
        notes: ''
      }
    ];
    localStorage.setItem('eldorado_inquiries', JSON.stringify(defaults));
    return defaults;
  });

  // Save updated inquiries
  const saveInquiries = (updated: Inquiry[]) => {
    setInquiries(updated);
    localStorage.setItem('eldorado_inquiries', JSON.stringify(updated));
  };

  // Contacts settings overriding
  const [contactSettings, setContactSettings] = useState(() => {
    const saved = localStorage.getItem('eldorado_contact_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      phone1: '09125720896',
      phone2: '02176264495',
      addressFa: 'تهران، جاده دماوند به سمت تهران، منطقه صنعتی کمرد، نبش کوچه تختی ۴، پلاک ۵۴۷',
      addressEn: 'No. 547, Next to Takhti 4th St, Kamard Industrial Zone, Damavand Road, Tehran, Iran',
      workingHoursFa: 'شنبه تا پنج‌شنبه: ۹:۰۰ الی ۱۸:۰۰ (روزهای تعطیل با هماهنگی قبلی)',
      workingHoursEn: 'Saturday to Thursday: 09:00 - 18:00 (Holidays by Appointment)',
      whatsapp: '989125720896',
      telegram: 'eldoradosofa_admin'
    };
  });

  const handleSaveContactSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('eldorado_contact_settings', JSON.stringify(contactSettings));
    alert(isRtl ? 'تغییرات تماس با موفقیت در سراسر سایت اعمال گردید.' : 'Contact settings updated successfully across the site.');
  };

  // Create / Edit states
  const [productSearch, setProductSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');

  // Product edit modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [pCode, setPCode] = useState('');
  const [pNameFa, setPNameFa] = useState('');
  const [pNameEn, setPNameEn] = useState('');
  const [pCategory, setPCategory] = useState<string>('');
  const [pImage, setPImage] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pDescFa, setPDescFa] = useState('');
  const [pDescEn, setPDescEn] = useState('');
  const [pFeaturesFa, setPFeaturesFa] = useState('');
  const [pFeaturesEn, setPFeaturesEn] = useState('');

  // Blog edit modal states
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [bTitleFa, setBTitleFa] = useState('');
  const [bTitleEn, setBTitleEn] = useState('');
  const [bDescFa, setBDescFa] = useState('');
  const [bDescEn, setBDescEn] = useState('');
  const [bContentFa, setBContentFa] = useState('');
  const [bContentEn, setBContentEn] = useState('');
  const [bImage, setBImage] = useState('');
  const [bAuthorFa, setBAuthorFa] = useState('');
  const [bAuthorEn, setBAuthorEn] = useState('');

  // Inquiry action notes state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryNoteText, setInquiryNoteText] = useState('');

  // Category CRUD states
  const [newCatId, setNewCatId] = useState('');
  const [newCatNameFa, setNewCatNameFa] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [catError, setCatError] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    
    const cleanId = newCatId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanId) {
      setCatError(isRtl ? 'شناسه دسته‌بندی باید انگلیسی و معتبر باشد!' : 'Category ID must be valid English letters/digits/hyphens!');
      return;
    }
    
    if (categories.some(c => c.id === cleanId)) {
      setCatError(isRtl ? 'این شناسه قبلاً تعریف شده است!' : 'This Category ID is already registered!');
      return;
    }
    
    if (!newCatNameFa.trim() || !newCatNameEn.trim()) {
      setCatError(isRtl ? 'هر دو نام فارسی و انگلیسی دسته‌بندی الزامی هستند!' : 'Both Persian and English category names are required!');
      return;
    }
    
    const newCategory: Category = {
      id: cleanId,
      nameFa: newCatNameFa.trim(),
      nameEn: newCatNameEn.trim()
    };
    
    const updated = [...categories, newCategory];
    setCategories(updated);
    
    // Clear inputs
    setNewCatId('');
    setNewCatNameFa('');
    setNewCatNameEn('');
  };

  const handleDeleteCategory = (catId: string) => {
    const usedCount = products.filter(p => p.category === catId).length;
    if (usedCount > 0) {
      alert(isRtl 
        ? `نمی‌توان این دسته را حذف کرد زیرا ${usedCount} محصول در حال حاضر به آن متصل هستند. ابتدا دسته این محصولات را در بخش مدیریت کالاها تغییر دهید.` 
        : `Cannot delete this category because ${usedCount} products are currently assigned to it. Reassign them first.`);
      return;
    }
    
    if (categories.length <= 1) {
      alert(isRtl 
        ? 'باید حداقل یک دسته‌بندی در پایگاه داده وجود داشته باشد!' 
        : 'At least one active category is required in the database!');
      return;
    }
    
    if (window.confirm(isRtl ? `آیا از حذف دسته بندی با شناسه «${catId}» اطمینان دارید؟` : `Are you sure you want to delete category "${catId}"?`)) {
      const updated = categories.filter(c => c.id !== catId);
      setCategories(updated);
    }
  };

  const handleForceHostSync = async () => {
    setSyncStatus(isRtl ? 'در حال هماهنگ‌سازی...' : 'Synchronizing database...');
    try {
      const res = await fetch('api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'save_all',
          password: 'qwertyuiop1234567890',
          products: products,
          blogs: blogs,
          homeConfig: homeConfig,
          categories: categories,
          inquiries: JSON.parse(localStorage.getItem('eldorado_inquiries') || '[]'),
          contactSettings: JSON.parse(localStorage.getItem('eldorado_contact_settings') || 'null')
        })
      });
      if (res.ok) {
        setSyncStatus(isRtl ? '✓ با موفقیت هماهنگ شد!' : '✓ Synchronized successfully!');
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        setSyncStatus(isRtl ? 'خطا در ارسال داده‌ها به هاست.' : 'Failed to synchronize.');
      }
    } catch (e) {
      setSyncStatus(isRtl ? 'خطا در برقراری ارتباط با api.php' : 'Could not contact PHP API.');
    }
  };

  // Custom confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'blog' | 'inquiry';
    id: number;
    title: string;
  } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'qwertyuiop1234567890') {
      setIsAuthenticated(true);
      localStorage.setItem('eldorado_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError(isRtl ? 'رمز عبور وارد شده اشتباه است!' : 'Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('eldorado_admin_auth');
  };

  // CRUD Product Actions
  const openAddProduct = () => {
    setEditingProduct(null);
    setPCode('');
    setPNameFa('');
    setPNameEn('');
    setPCategory(categories[0]?.id || 'sofa-seven');
    setPImage('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800');
    setPPrice(45000000);
    setPDescFa('');
    setPDescEn('');
    setPFeaturesFa('کلاف تمام چوب روس مستحکم\nفوم سرد ۳۵ کیلویی متراکم\nپایه‌های مبل خراطی گرجستان');
    setPFeaturesEn('Solid Russian pine frame\nHigh-density cold-molded foam\nSolid wood crafted legs');
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPCode(prod.code);
    setPNameFa(prod.nameFa);
    setPNameEn(prod.nameEn);
    setPCategory(prod.category);
    setPImage(prod.image);
    setPPrice(prod.price);
    setPDescFa(prod.descFa || '');
    setPDescEn(prod.descEn || '');
    setPFeaturesFa(prod.featuresFa.join('\n'));
    setPFeaturesEn(prod.featuresEn.join('\n'));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const listFeaturesFa = pFeaturesFa.split('\n').filter(f => f.trim() !== '');
    const listFeaturesEn = pFeaturesEn.split('\n').filter(f => f.trim() !== '');

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code: pCode || '100',
            nameFa: pNameFa,
            nameEn: pNameEn,
            category: pCategory,
            image: pImage,
            price: Number(pPrice),
            descFa: pDescFa,
            descEn: pDescEn,
            featuresFa: listFeaturesFa,
            featuresEn: listFeaturesEn
          };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem('eldorado_products', JSON.stringify(updated));
    } else {
      // Create new
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: newId,
        code: pCode || '100',
        nameFa: pNameFa,
        nameEn: pNameEn,
        category: pCategory,
        image: pImage,
        price: Number(pPrice),
        descFa: pDescFa,
        descEn: pDescEn,
        featuresFa: listFeaturesFa,
        featuresEn: listFeaturesEn
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      localStorage.setItem('eldorado_products', JSON.stringify(updated));
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      setDeleteConfirm({
        type: 'product',
        id,
        title: isRtl ? `مبل مدل ${prod.nameFa} (کد ${prod.code})` : `Sofa ${prod.nameEn} (Code ${prod.code})`
      });
    }
  };

  // CRUD Blog Actions
  const openAddBlog = () => {
    setEditingBlog(null);
    setBTitleFa('');
    setBTitleEn('');
    setBDescFa('');
    setBDescEn('');
    setBContentFa('');
    setBContentEn('');
    setBImage('https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800');
    setBAuthorFa('تحریریه مبل الدورادو');
    setBAuthorEn('Eldorado Editorial Board');
    setIsBlogModalOpen(true);
  };

  const openEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setBTitleFa(blog.titleFa);
    setBTitleEn(blog.titleEn);
    setBDescFa(blog.descFa);
    setBDescEn(blog.descEn);
    setBContentFa(blog.contentFa);
    setBContentEn(blog.contentEn);
    setBImage(blog.image);
    setBAuthorFa(blog.authorFa);
    setBAuthorEn(blog.authorEn);
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const todayFa = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
    const todayEn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (editingBlog) {
      const updated = blogs.map(b => {
        if (b.id === editingBlog.id) {
          return {
            ...b,
            titleFa: bTitleFa,
            titleEn: bTitleEn,
            descFa: bDescFa,
            descEn: bDescEn,
            contentFa: bContentFa,
            contentEn: bContentEn,
            image: bImage,
            authorFa: bAuthorFa,
            authorEn: bAuthorEn
          };
        }
        return b;
      });
      setBlogs(updated);
      localStorage.setItem('eldorado_blogs', JSON.stringify(updated));
    } else {
      const newId = blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
      const newBlog: BlogPost = {
        id: newId,
        titleFa: bTitleFa,
        titleEn: bTitleEn,
        descFa: bDescFa,
        descEn: bDescEn,
        contentFa: bContentFa,
        contentEn: bContentEn,
        image: bImage,
        dateFa: todayFa,
        dateEn: todayEn,
        authorFa: bAuthorFa,
        authorEn: bAuthorEn
      };
      const updated = [newBlog, ...blogs];
      setBlogs(updated);
      localStorage.setItem('eldorado_blogs', JSON.stringify(updated));
    }
    setIsBlogModalOpen(false);
  };

  const handleDeleteBlog = (id: number) => {
    const b = blogs.find(item => item.id === id);
    if (b) {
      setDeleteConfirm({
        type: 'blog',
        id,
        title: isRtl ? b.titleFa : b.titleEn
      });
    }
  };

  // Inquiries Actions
  const updateInquiryStatus = (id: number, status: Inquiry['status']) => {
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, status };
      }
      return inq;
    });
    saveInquiries(updated);
  };

  const handleSaveInquiryNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    const updated = inquiries.map(inq => {
      if (inq.id === selectedInquiry.id) {
        return { ...inq, notes: inquiryNoteText };
      }
      return inq;
    });
    saveInquiries(updated);
    setSelectedInquiry(null);
    setInquiryNoteText('');
  };

  const handleDeleteInquiry = (id: number) => {
    const inq = inquiries.find(item => item.id === id);
    if (inq) {
      setDeleteConfirm({
        type: 'inquiry',
        id,
        title: isRtl ? `پیام از ${inq.name}` : `Message from ${inq.name}`
      });
    }
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'product') {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('eldorado_products', JSON.stringify(updated));
    } else if (type === 'blog') {
      const updated = blogs.filter(b => b.id !== id);
      setBlogs(updated);
      localStorage.setItem('eldorado_blogs', JSON.stringify(updated));
    } else if (type === 'inquiry') {
      const updated = inquiries.filter(inq => inq.id !== id);
      saveInquiries(updated);
    }
    setDeleteConfirm(null);
  };

  // Render Login Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-red/10 rounded-full blur-xl"></div>
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-red/15 text-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-gray-950 dark:text-white">
              {isRtl ? 'ورود به پنل ادمین مبل الدورادو' : 'Eldorado Admin Protection'}
            </h2>
            <p className="text-xs text-gray-400 mt-1.5 font-medium">
              {isRtl ? 'جهت مدیریت محصولات، لیدها و مقالات وبسایت وارد شوید.' : 'Enter password to manage active inventory and leads.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                {isRtl ? 'رمز عبور مدیریت' : 'Admin Security Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRtl ? 'رمز عبور را وارد کنید...' : 'Enter security password...'}
                className={`w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-850 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/30 transition-all ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                {isRtl ? 'راهنمایی: رمز password هست' : 'Hint: Password is password'}
              </p>
            </div>

            {authError && (
              <p className={`text-[11px] font-bold text-brand-red ${isRtl ? 'text-right' : 'text-left'}`}>
                {authError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
              >
                {isRtl ? 'بازگشت به سایت' : 'Back to Store'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/10 transition-all"
              >
                {isRtl ? 'تایید و ورود' : 'Validate Auth'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const totalProducts = products.length;
  const totalBlogs = blogs.length;
  const pendingLeads = inquiries.filter(i => i.status === 'Pending').length;
  const averagePrice = products.length > 0 ? Math.round(products.reduce((acc, curr) => acc + curr.price, 0) / products.length) : 0;

  // Filtered lists for table search
  const filteredProductsTable = products.filter(p => 
    p.nameFa.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code.includes(productSearch)
  );

  const filteredBlogsTable = blogs.filter(b => 
    b.titleFa.toLowerCase().includes(blogSearch.toLowerCase()) ||
    b.titleEn.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors pb-16">
      
      {/* Admin Subheader & Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xs px-4 py-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
          <div className="w-11 h-11 bg-brand-red text-white font-black rounded-xl flex items-center justify-center text-xl shadow-lg shadow-brand-red/10">
            A
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg text-gray-950 dark:text-white">
              {isRtl ? 'پنل ادمین هوشمند مبلمان الدورادو' : 'Eldorado Admin Control Hub'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {isRtl ? 'مدیریت و مهندسی دکوراسیون خانگی • گرید کاربری ارشد' : 'Full Control System • Senior Operations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {isRtl ? 'نمایش وبسایت اصلی' : 'Exit to Storefront'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'خروج از پنل' : 'Lock Dashboard'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Sidebar/Top bar */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-8 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'dashboard'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{isRtl ? 'میز کار نظارت' : 'Operations Dashboard'}</span>
          </button>

          <button
            onClick={() => setAdminTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'products'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isRtl ? 'کاتالوگ محصولات' : 'Products Inventory'}</span>
          </button>

          <button
            onClick={() => setAdminTab('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'blogs'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isRtl ? 'تحریریه وبلاگ' : 'Blog Articles'}</span>
          </button>

          <button
            onClick={() => setAdminTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              adminTab === 'leads'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isRtl ? 'استعلام‌ها و لیدها' : 'Inquiries & Leads'}</span>
            {pendingLeads > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-brand-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                {pendingLeads}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'home'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{isRtl ? 'مدیریت صفحه اصلی' : 'Home Page Management'}</span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'settings'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isRtl ? 'تنظیمات تماس برند' : 'Brand Contacts'}</span>
          </button>

          <button
            onClick={() => setAdminTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'database'
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isRtl ? 'ابر دیتابیس و پشتیبان‌گیری' : 'Cloud DB & Backup'}</span>
          </button>
        </div>

        {/* TAB VIEW CONTENT */}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {adminTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Products */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    {isRtl ? 'کل مبلمان موجود' : 'Total Inventory'}
                  </span>
                  <div className="w-8 h-8 bg-brand-red/10 text-brand-red rounded-lg flex items-center justify-center">
                    <Package className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-2xl tracking-tight text-gray-950 dark:text-white">{totalProducts}</span>
                  <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +100%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                  {isRtl ? 'ثبت شده در دیتابیس کاتالوگ' : 'Live customizable models'}
                </p>
              </div>

              {/* Stat 2: Inquiries */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    {isRtl ? 'استعلام قیمت فعال (لید)' : 'Active Leads'}
                  </span>
                  <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-2xl tracking-tight text-gray-950 dark:text-white">{inquiries.length}</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded font-black">
                    {pendingLeads} {isRtl ? 'در انتظار' : 'Pending'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                  {isRtl ? 'ثبت درخواست‌های مشاوره مستقیم' : 'Direct customer queries'}
                </p>
              </div>

              {/* Stat 3: Blog posts */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    {isRtl ? 'مقالات انتشار یافته' : 'Blog Articles'}
                  </span>
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-2xl tracking-tight text-gray-950 dark:text-white">{totalBlogs}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                  {isRtl ? 'دانستنی‌های دکوراسیون و چیدمان' : 'Educational design insights'}
                </p>
              </div>

              {/* Stat 4: Average price */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    {isRtl ? 'میانگین بهای کاتالوگ' : 'Avg Catalog Price'}
                  </span>
                  <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-xl tracking-tight text-emerald-500">{averagePrice.toLocaleString()}</span>
                  <span className="text-[9px] text-gray-400 font-black">{isRtl ? 'تومان' : 'T'}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1.5">
                  {isRtl ? 'محاسبه شده بر مبنای مدل‌های پایه' : 'Based on base setups'}
                </p>
              </div>

            </div>

            {/* Visual Bento distributions / Category shares */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category distribution panel */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 lg:col-span-2">
                <h3 className={`font-black text-sm text-gray-900 dark:text-white mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <Package className="w-4.5 h-4.5 text-brand-red" />
                  <span>{isRtl ? 'پراکندگی دسته‌بندی کاتالوگ' : 'Catalog Category Distribution'}</span>
                </h3>

                <div className="space-y-5">
                  {categories.map((cat, idx) => {
                    const count = products.filter(p => p.category === cat.id).length;
                    const percent = (count / Math.max(1, products.length)) * 100;
                    const colors = ['bg-brand-red', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-teal-500'];
                    const colorClass = colors[idx % colors.length];
                    
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                          <span>{isRtl ? cat.nameFa : cat.nameEn}</span>
                          <span className="font-mono">{count} {isRtl ? 'مدل' : 'Models'}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colorClass} rounded-full transition-all duration-500`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Server Info / Operating parameters */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
                <h3 className={`font-black text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Settings className="w-4.5 h-4.5 text-brand-red" />
                  <span>{isRtl ? 'برامترهای سامانه ادمین' : 'System Parameters'}</span>
                </h3>

                <div className={`space-y-4 text-xs font-semibold text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="pb-3 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center">
                    <span>{isRtl ? 'مدیر ارشد مسئول:' : 'Operations Agent:'}</span>
                    <span className="text-gray-900 dark:text-white font-bold">0003</span>
                  </div>
                  <div className="pb-3 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center">
                    <span>{isRtl ? 'برچسب لینک توسعه:' : 'Link Signature:'}</span>
                    <a href="https://ali0003.ir" target="_blank" rel="noreferrer" className="text-brand-red font-bold hover:underline">ali0003.ir</a>
                  </div>
                  <div className="pb-3 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center">
                    <span>{isRtl ? 'دیتابیس ابری محلی:' : 'Database Engine:'}</span>
                    <span className="text-green-500 font-bold">Active LocalStorage</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isRtl ? 'مبلمان الدورادو نسخه:' : 'Eldorado Version:'}</span>
                    <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">v1.2.6-stable</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick action helper cards */}
            <div className="p-6 bg-gradient-to-r from-brand-red/10 to-transparent border border-brand-red/15 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <HelpCircle className="w-10 h-10 text-brand-red shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-gray-950 dark:text-white">
                    {isRtl ? 'راهنمای تغییرات در لحظه مبل‌ها' : 'Live Inventory Update Guide'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                    {isRtl 
                      ? 'تمامی محصولات و مقالاتی که در بخش‌های بعدی اضافه یا ویرایش می‌کنید به صورت فوری در کاتالوگ فروشگاه اصلی برای کلیه بازدیدکنندگان نمایش داده می‌شود.'
                      : 'Any products, blog articles, or pricing details edited here are immediately persisted and rendered on the live storefront.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG INVENTORY */}
        {adminTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={isRtl ? 'جستجو بر اساس نام مبل یا کد...' : 'Search by name or code...'}
                  className={`w-full py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-950 dark:text-white focus:outline-none focus:border-brand-red ${
                    isRtl ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
                  }`}
                />
              </div>

              <button
                onClick={openAddProduct}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isRtl ? 'ثبت مبل جدید' : 'Add New Sofa'}</span>
              </button>
            </div>

            {/* Products Inventory List */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 text-center w-12">#</th>
                      <th className="p-4 text-right">{isRtl ? 'تصویر' : 'Image'}</th>
                      <th className="p-4 text-right">{isRtl ? 'کد مبل' : 'Code'}</th>
                      <th className="p-4 text-right">{isRtl ? 'عنوان فارسی' : 'Persian Name'}</th>
                      <th className="p-4 text-right">{isRtl ? 'عنوان انگلیسی' : 'English Name'}</th>
                      <th className="p-4 text-right">{isRtl ? 'دسته‌بندی' : 'Category'}</th>
                      <th className="p-4 text-right">{isRtl ? 'بهای پایه (تومان)' : 'Base Price'}</th>
                      <th className="p-4 text-center">{isRtl ? 'عملیات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium text-gray-700 dark:text-gray-300">
                    {filteredProductsTable.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-400">
                          {isRtl ? 'هیچ مبلی یافت نشد.' : 'No sofa products found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProductsTable.map((prod, index) => (
                        <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors">
                          <td className="p-4 text-center font-mono">{index + 1}</td>
                          <td className="p-4">
                            <img src={prod.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                          </td>
                          <td className="p-4">
                            <span className="font-bold font-mono text-brand-red bg-brand-red/10 px-2 py-0.5 rounded">
                              {prod.code}
                            </span>
                          </td>
                          <td className="p-4 font-extrabold text-gray-950 dark:text-white">{prod.nameFa}</td>
                          <td className="p-4 font-bold text-gray-500">{prod.nameEn}</td>
                          <td className="p-4 text-[10.5px]">
                            {categories.find(c => c.id === prod.category)
                              ? (isRtl ? categories.find(c => c.id === prod.category)!.nameFa : categories.find(c => c.id === prod.category)!.nameEn)
                              : prod.category}
                          </td>
                          <td className="p-4 font-black font-mono">
                            {prod.price.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditProduct(prod)}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-brand-red/10 hover:text-brand-red text-gray-500 rounded-lg transition-colors"
                                title="ویرایش"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Edit/Add Modal */}
            {isProductModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-850 mb-6">
                    <h3 className="font-black text-sm sm:text-base text-gray-950 dark:text-white">
                      {editingProduct ? (isRtl ? 'ویرایش مشخصات مبل' : 'Edit Sofa Specifications') : (isRtl ? 'ثبت مبل راحتی جدید در کاتالوگ' : 'Register New Sofa')}
                    </h3>
                    <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Product Code */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">کد مبل (مثلا: ۱۰۱)</label>
                        <input
                          type="text"
                          required
                          value={pCode}
                          onChange={(e) => setPCode(e.target.value)}
                          className={`w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                      {/* Product Category */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">دسته‌بندی مبلمان</label>
                        <select
                          value={pCategory}
                          onChange={(e: any) => setPCategory(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {isRtl ? cat.nameFa : cat.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Name Fa */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">نام محصول (فارسی)</label>
                        <input
                          type="text"
                          required
                          value={pNameFa}
                          onChange={(e) => setPNameFa(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right"
                        />
                      </div>

                      {/* Name En */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">نام محصول (انگلیسی)</label>
                        <input
                          type="text"
                          required
                          value={pNameEn}
                          onChange={(e) => setPNameEn(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left"
                        />
                      </div>

                      {/* Price base */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">قیمت پایه تقریبی (تومان)</label>
                        <input
                          type="number"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(Number(e.target.value))}
                          className={`w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white font-mono ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                      {/* Image URL */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">آدرس تصویر (URL)</label>
                        <input
                          type="text"
                          required
                          value={pImage}
                          onChange={(e) => setPImage(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left"
                        />
                      </div>
                    </div>

                    {/* Desc Fa */}
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">توضیحات معرفی محصول (فارسی)</label>
                      <textarea
                        value={pDescFa}
                        onChange={(e) => setPDescFa(e.target.value)}
                        rows={3}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right"
                      />
                    </div>

                    {/* Desc En */}
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">توضیحات معرفی محصول (انگلیسی)</label>
                      <textarea
                        value={pDescEn}
                        onChange={(e) => setPDescEn(e.target.value)}
                        rows={3}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left"
                      />
                    </div>

                    {/* Features block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">ویژگی‌های کلیدی (فارسی - هر خط یک ویژگی)</label>
                        <textarea
                          value={pFeaturesFa}
                          onChange={(e) => setPFeaturesFa(e.target.value)}
                          rows={4}
                          placeholder="کلاف چوب راش..."
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right"
                        />
                      </div>

                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">ویژگی‌های کلیدی (انگلیسی - هر خط یک ویژگی)</label>
                        <textarea
                          value={pFeaturesEn}
                          onChange={(e) => setPFeaturesEn(e.target.value)}
                          rows={4}
                          placeholder="Kiln dried oak frame..."
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left"
                        />
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-850">
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/15"
                      >
                        ذخیره مبل در کاتالوگ
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BLOGS EDITORIAL */}
        {adminTab === 'blogs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder={isRtl ? 'جستجوی مقاله...' : 'Search articles...'}
                  className={`w-full py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs text-gray-950 dark:text-white focus:outline-none focus:border-brand-red ${
                    isRtl ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
                  }`}
                />
              </div>

              <button
                onClick={openAddBlog}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isRtl ? 'نگارش مقاله جدید' : 'Write New Article'}</span>
              </button>
            </div>

            {/* Blogs Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 text-center w-12">#</th>
                      <th className="p-4 text-right">{isRtl ? 'تصویر' : 'Image'}</th>
                      <th className="p-4 text-right">{isRtl ? 'عنوان مقاله (فارسی)' : 'Persian Title'}</th>
                      <th className="p-4 text-right">{isRtl ? 'نویسنده' : 'Author'}</th>
                      <th className="p-4 text-right">{isRtl ? 'تاریخ انتشار' : 'Published Date'}</th>
                      <th className="p-4 text-center">{isRtl ? 'عملیات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium text-gray-700 dark:text-gray-300">
                    {filteredBlogsTable.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-400">
                          {isRtl ? 'هیچ مقاله‌ای یافت نشد.' : 'No blog articles found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredBlogsTable.map((blog, idx) => (
                        <tr key={blog.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors">
                          <td className="p-4 text-center font-mono">{idx + 1}</td>
                          <td className="p-4">
                            <img src={blog.image} alt="" className="w-12 h-8 object-cover rounded-md" />
                          </td>
                          <td className="p-4 font-black text-gray-950 dark:text-white max-w-sm truncate">{blog.titleFa}</td>
                          <td className="p-4 text-gray-500">{blog.authorFa}</td>
                          <td className="p-4 font-mono text-[10.5px]">{blog.dateFa}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditBlog(blog)}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-brand-red/10 hover:text-brand-red text-gray-500 rounded-lg transition-colors"
                                title="ویرایش"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blog modal form */}
            {isBlogModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-850 mb-6">
                    <h3 className="font-black text-sm sm:text-base text-gray-950 dark:text-white">
                      {editingBlog ? (isRtl ? 'ویرایش مقاله تحریریه' : 'Edit Editorial Article') : (isRtl ? 'نگارش مقاله جدید برای دانستنی‌های الدورادو' : 'Write New Article')}
                    </h3>
                    <button onClick={() => setIsBlogModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBlog} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title Fa */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">عنوان مقاله (فارسی)</label>
                        <input
                          type="text"
                          required
                          value={bTitleFa}
                          onChange={(e) => setBTitleFa(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right font-bold"
                        />
                      </div>

                      {/* Title En */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">عنوان مقاله (انگلیسی)</label>
                        <input
                          type="text"
                          required
                          value={bTitleEn}
                          onChange={(e) => setBTitleEn(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left font-bold"
                        />
                      </div>

                      {/* Author Fa */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">نویسنده (فارسی)</label>
                        <input
                          type="text"
                          required
                          value={bAuthorFa}
                          onChange={(e) => setBAuthorFa(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right"
                        />
                      </div>

                      {/* Author En */}
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">نویسنده (انگلیسی)</label>
                        <input
                          type="text"
                          required
                          value={bAuthorEn}
                          onChange={(e) => setBAuthorEn(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left"
                        />
                      </div>

                      {/* Image URL */}
                      <div className="sm:col-span-2 text-left">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 text-right">آدرس تصویر روی جلد مقاله (URL)</label>
                        <input
                          type="text"
                          required
                          value={bImage}
                          onChange={(e) => setBImage(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left"
                        />
                      </div>
                    </div>

                    {/* Desc block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">خلاصه پیش‌نمایش (فارسی)</label>
                        <textarea
                          required
                          value={bDescFa}
                          onChange={(e) => setBDescFa(e.target.value)}
                          rows={2}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right"
                        />
                      </div>

                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">خلاصه پیش‌نمایش (انگلیسی)</label>
                        <textarea
                          required
                          value={bDescEn}
                          onChange={(e) => setBDescEn(e.target.value)}
                          rows={2}
                          className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left"
                        />
                      </div>
                    </div>

                    {/* Content Fa */}
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">متن تفصیلی مقاله (فارسی)</label>
                      <textarea
                        required
                        value={bContentFa}
                        onChange={(e) => setBContentFa(e.target.value)}
                        rows={6}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-right leading-relaxed"
                      />
                    </div>

                    {/* Content En */}
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">متن تفصیلی مقاله (انگلیسی)</label>
                      <textarea
                        required
                        value={bContentEn}
                        onChange={(e) => setBContentEn(e.target.value)}
                        rows={6}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-900 dark:text-white text-left leading-relaxed"
                      />
                    </div>

                    {/* Submit footer */}
                    <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-850">
                      <button
                        type="button"
                        onClick={() => setIsBlogModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/15"
                      >
                        انتشار مقاله
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEADS & PRICE INQUIRIES */}
        {adminTab === 'leads' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <h3 className="font-black text-sm text-gray-950 dark:text-white mb-2">
                {isRtl ? 'کارتابل استعلام قیمت و مشاوره دکوراسیون' : 'Active Leads Board'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRtl 
                  ? 'تمامی اطلاعاتی که مخاطبان در صفحه تماس وارد می‌کنند بلافاصله در این بخش ثبت می‌شود. شما می‌توانید کارشناس پیگیری‌کننده را تعیین کرده و یادداشت‌های فروش بنویسید.'
                  : 'Capture and track inquiries submitted by visitors. Change lead status, take follow-up sales notes, or discard lead rows.'}
              </p>
            </div>

            {/* Inquiries table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 text-center w-12">#</th>
                      <th className="p-4 text-right">{isRtl ? 'نام مشتری' : 'Customer Name'}</th>
                      <th className="p-4 text-right">{isRtl ? 'تلفن همراه' : 'Phone'}</th>
                      <th className="p-4 text-right">{isRtl ? 'شرح پیام / درخواست' : 'Request message'}</th>
                      <th className="p-4 text-right">{isRtl ? 'تاریخ ثبت' : 'Date'}</th>
                      <th className="p-4 text-right">{isRtl ? 'وضعیت پیگیری' : 'Status'}</th>
                      <th className="p-4 text-right">{isRtl ? 'یادداشت ادمین' : 'Admin Notes'}</th>
                      <th className="p-4 text-center">{isRtl ? 'عملیات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium text-gray-700 dark:text-gray-300">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-400">
                          {isRtl ? 'هیچ لیدی دریافت نشده است.' : 'No customer inquiries yet.'}
                        </td>
                      </tr>
                    ) : (
                      inquiries.map((inq, idx) => (
                        <tr key={inq.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors">
                          <td className="p-4 text-center font-mono">{idx + 1}</td>
                          <td className="p-4 font-extrabold text-gray-950 dark:text-white">{inq.name}</td>
                          <td className="p-4 font-mono font-bold text-gray-900 dark:text-gray-100">{inq.phone}</td>
                          <td className="p-4 max-w-xs break-words leading-relaxed text-gray-500 dark:text-gray-400">{inq.message}</td>
                          <td className="p-4 font-mono text-[10px]">{inq.date}</td>
                          <td className="p-4">
                            <select
                              value={inq.status}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold focus:outline-none border border-transparent ${
                                inq.status === 'Pending'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : inq.status === 'Contacted'
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  : inq.status === 'Completed'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : 'bg-gray-200/50 text-gray-400 border-gray-300/20'
                              }`}
                            >
                              <option value="Pending">{isRtl ? 'در انتظار پیگیری' : 'Pending'}</option>
                              <option value="Contacted">{isRtl ? 'تماس گرفته شده' : 'Contacted'}</option>
                              <option value="Completed">{isRtl ? 'سفارش نهایی گردید' : 'Sold/Completed'}</option>
                              <option value="Cancelled">{isRtl ? 'لغو شده' : 'Cancelled'}</option>
                            </select>
                          </td>
                          <td className="p-4 max-w-[150px] truncate text-brand-red font-semibold">
                            {inq.notes ? inq.notes : <span className="text-gray-300 font-normal italic">{isRtl ? 'بدون یادداشت' : 'No notes'}</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => { setSelectedInquiry(inq); setInquiryNoteText(inq.notes || ''); }}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-brand-red/10 hover:text-brand-red text-gray-500 rounded-lg transition-colors"
                                title="ثبت یادداشت"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note edit popup */}
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850 mb-4">
                    <h4 className="font-black text-xs text-gray-950 dark:text-white">
                      {isRtl ? `ثبت یادداشت پیگیری برای: ${selectedInquiry.name}` : `Follow-up notes for ${selectedInquiry.name}`}
                    </h4>
                    <button onClick={() => setSelectedInquiry(null)} className="p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveInquiryNotes} className="space-y-4">
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1.5">جزئیات تماس یا تعهدات داده شده به مشتری</label>
                      <textarea
                        required
                        value={inquiryNoteText}
                        onChange={(e) => setInquiryNoteText(e.target.value)}
                        placeholder="ثبت توافقات مالی، کالیته انتخابی و تاریخ ارسال نمونه..."
                        rows={4}
                        className="w-full py-2.5 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 text-xs font-bold"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-red text-white rounded-lg text-xs font-bold"
                      >
                        ذخیره یادداشت پیگیری
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BRAND CONTACT SETTINGS OVERRIDE */}
        {adminTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <h3 className="font-black text-sm text-gray-950 dark:text-white mb-2">
                {isRtl ? 'تنظیمات تماس مستقیم و نمایندگی‌های الدورادو' : 'Bespoke Brand Constants'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRtl 
                  ? 'شماره تماس‌های کارشناسان، آدرس‌های فیزیکی کارخانه و اطلاعات واتساپ/تلگرام قرار گرفته در بخش فوتر، نوار بالایی و پیام‌های پاپ‌آپ استعلام را به صورت پویا تغییر دهید.'
                  : 'Dynamically configure sales manager phone numbers, factory locations, and social media channels instantly.'}
              </p>
            </div>

            <form onSubmit={handleSaveContactSettings} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Phone 1 */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    تلفن همراه مدیریت فروش (واتساپ)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSettings.phone1}
                    onChange={(e) => setContactSettings({ ...contactSettings, phone1: e.target.value, whatsapp: e.target.value.replace(/^0/, '98') })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-mono"
                  />
                </div>

                {/* Phone 2 */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    تلفن ثابت نمایشگاه کارخانه کمرد
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSettings.phone2}
                    onChange={(e) => setContactSettings({ ...contactSettings, phone2: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-mono"
                  />
                </div>

                {/* Address Fa */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    آدرس دفتر کارخانه (فارسی)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={contactSettings.addressFa}
                    onChange={(e) => setContactSettings({ ...contactSettings, addressFa: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right leading-relaxed"
                  />
                </div>

                {/* Address En */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    آدرس دفتر کارخانه (انگلیسی)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={contactSettings.addressEn}
                    onChange={(e) => setContactSettings({ ...contactSettings, addressEn: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left leading-relaxed"
                  />
                </div>

                {/* Working hours Fa */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    ساعات کاری (فارسی)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSettings.workingHoursFa}
                    onChange={(e) => setContactSettings({ ...contactSettings, workingHoursFa: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right"
                  />
                </div>

                {/* Working hours En */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    ساعات کاری (انگلیسی)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSettings.workingHoursEn}
                    onChange={(e) => setContactSettings({ ...contactSettings, workingHoursEn: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left"
                  />
                </div>

                {/* Telegram ID */}
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    آیدی تلگرام پشتیبانی کارخانه
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSettings.telegram}
                    onChange={(e) => setContactSettings({ ...contactSettings, telegram: e.target.value })}
                    className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-mono"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-850">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-red/15 transition-all"
                >
                  اعمال سراسری تغییرات تماس
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 6: HOME PAGE MANAGEMENT */}
        {adminTab === 'home' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md rounded-3xl p-6 sm:p-8 animate-fade-in">
            <div className={`flex items-center gap-3 border-b border-gray-100 dark:border-gray-850 pb-5 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  {isRtl ? 'مدیریت و پیکربندی صفحه اصلی' : 'Home Page Customization'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {isRtl ? 'تغییر تصاویر اسلایدر، بنر طلایی و داستان برند مبل الدورادو' : 'Manage sliders, promo badge, and brand history story'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveHomeConfig} className="space-y-8">
              
              {/* Section 1: Hero Main Texts */}
              <div>
                <h4 className={`text-xs font-black text-brand-red uppercase tracking-wide border-b border-gray-100 dark:border-gray-850 pb-2 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'بخش ۱: متون بنر اصلی (Hero)' : 'Section 1: Hero Main Banner'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Badge Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">نشان تگ برتر (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={heroBadgeFa}
                      onChange={(e) => setHeroBadgeFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-semibold"
                    />
                  </div>
                  {/* Badge En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">نشان تگ برتر (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={heroBadgeEn}
                      onChange={(e) => setHeroBadgeEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-semibold"
                    />
                  </div>

                  {/* Title Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">عنوان بزرگ اصلی (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={heroTitleFa}
                      onChange={(e) => setHeroTitleFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-extrabold"
                    />
                  </div>
                  {/* Title En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">عنوان بزرگ اصلی (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={heroTitleEn}
                      onChange={(e) => setHeroTitleEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-extrabold"
                    />
                  </div>

                  {/* Sub Fa */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className={`text-xs font-bold text-gray-600 dark:text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>توضیحات تکمیلی (فارسی)</label>
                    <textarea
                      required
                      rows={2}
                      value={heroSubFa}
                      onChange={(e) => setHeroSubFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right leading-relaxed font-semibold"
                    />
                  </div>
                  {/* Sub En */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className={`text-xs font-bold text-gray-600 dark:text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>توضیحات تکمیلی (انگلیسی)</label>
                    <textarea
                      required
                      rows={2}
                      value={heroSubEn}
                      onChange={(e) => setHeroSubEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left leading-relaxed font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Golden Promo Banner */}
              <div>
                <h4 className={`text-xs font-black text-brand-red uppercase tracking-wide border-b border-gray-100 dark:border-gray-850 pb-2 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'بخش ۲: تگ شناور بنر طلایی ضمانت' : 'Section 2: Golden Float Guarantee Tag'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promo Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">متن طلایی تگ (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={heroPromoFa}
                      onChange={(e) => setHeroPromoFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-semibold"
                    />
                  </div>
                  {/* Promo En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">متن طلایی تگ (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={heroPromoEn}
                      onChange={(e) => setHeroPromoEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-semibold"
                    />
                  </div>

                  {/* Promo Sub Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">زیرمتن تگ طلایی (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={heroPromoSubFa}
                      onChange={(e) => setHeroPromoSubFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-semibold"
                    />
                  </div>
                  {/* Promo Sub En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">زیرمتن تگ طلایی (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={heroPromoSubEn}
                      onChange={(e) => setHeroPromoSubEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Slideshow Management */}
              <div>
                <div className={`flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <h4 className="text-xs font-black text-brand-red uppercase tracking-wide">
                    {isRtl ? 'بخش ۳: مدیریت تصاویر اسلاید اصلی' : 'Section 3: Main Slideshow Slider Images'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="px-3 py-1 bg-brand-red text-white text-[10px] font-black rounded-lg hover:bg-brand-red-dark transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isRtl ? 'افزودن اسلاید جدید' : 'Add New Slide'}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {slidesState.map((slide: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 relative"
                    >
                      {/* Delete Slide Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="absolute top-4 left-4 w-7 h-7 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center cursor-pointer"
                        title={isRtl ? 'حذف این اسلاید' : 'Delete this slide'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className={`inline-block px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-[10px] text-gray-500 font-extrabold mb-4`}>
                        {isRtl ? `اسلاید شماره ${idx + 1}` : `Slide #${idx + 1}`}
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* URL */}
                        <div className="md:col-span-2 flex flex-col gap-1">
                          <label className={`text-[10px] font-bold text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}>آدرس تصویر اسلاید (لینک Unsplash)</label>
                          <input
                            type="text"
                            required
                            value={slide.url}
                            onChange={(e) => handleUpdateSlideField(idx, 'url', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left font-mono"
                          />
                        </div>

                        {/* Slide Title Fa */}
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">عنوان اسلاید (فارسی)</label>
                          <input
                            type="text"
                            required
                            value={slide.titleFa}
                            onChange={(e) => handleUpdateSlideField(idx, 'titleFa', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-right font-extrabold"
                          />
                        </div>
                        {/* Slide Title En */}
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">عنوان اسلاید (انگلیسی)</label>
                          <input
                            type="text"
                            required
                            value={slide.titleEn}
                            onChange={(e) => handleUpdateSlideField(idx, 'titleEn', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left font-extrabold"
                          />
                        </div>

                        {/* Slide Subtitle Fa */}
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">زیرعنوان اسلاید (فارسی)</label>
                          <input
                            type="text"
                            required
                            value={slide.subtitleFa}
                            onChange={(e) => handleUpdateSlideField(idx, 'subtitleFa', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-right font-semibold"
                          />
                        </div>
                        {/* Slide Subtitle En */}
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">زیرعنوان اسلاید (انگلیسی)</label>
                          <input
                            type="text"
                            required
                            value={slide.subtitleEn}
                            onChange={(e) => handleUpdateSlideField(idx, 'subtitleEn', e.target.value)}
                            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Brand History & About Story */}
              <div>
                <h4 className={`text-xs font-black text-brand-red uppercase tracking-wide border-b border-gray-100 dark:border-gray-850 pb-2 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'بخش ۴: داستان برند و پیشینه کارخانه' : 'Section 4: Brand Story & Factory History'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* About Title Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">عنوان داستان برند (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={aboutTitleFa}
                      onChange={(e) => setAboutTitleFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-extrabold"
                    />
                  </div>
                  {/* About Title En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">عنوان داستان برند (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={aboutTitleEn}
                      onChange={(e) => setAboutTitleEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-extrabold"
                    />
                  </div>

                  {/* About Sub Fa */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">زیرعنوان داستان برند (فارسی)</label>
                    <input
                      type="text"
                      required
                      value={aboutSubFa}
                      onChange={(e) => setAboutSubFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right font-semibold"
                    />
                  </div>
                  {/* About Sub En */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">زیرعنوان داستان برند (انگلیسی)</label>
                    <input
                      type="text"
                      required
                      value={aboutSubEn}
                      onChange={(e) => setAboutSubEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-semibold"
                    />
                  </div>

                  {/* About Content Fa */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className={`text-xs font-bold text-gray-600 dark:text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>متن کامل داستان برند (فارسی)</label>
                    <textarea
                      required
                      rows={6}
                      value={aboutContentFa}
                      onChange={(e) => setAboutContentFa(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-right leading-relaxed font-semibold"
                    />
                  </div>
                  {/* About Content En */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className={`text-xs font-bold text-gray-600 dark:text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>متن کامل داستان برند (انگلیسی)</label>
                    <textarea
                      required
                      rows={6}
                      value={aboutContentEn}
                      onChange={(e) => setAboutContentEn(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left leading-relaxed font-semibold"
                    />
                  </div>

                  {/* Main Image URL */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">آدرس تصویر بزرگ قاب اصلی (About Image Main)</label>
                    <input
                      type="text"
                      required
                      value={aboutImageMain}
                      onChange={(e) => setAboutImageMain(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-mono"
                    />
                  </div>
                  {/* Sec Image URL */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">آدرس تصویر کوچک مصالح (About Image Materials)</label>
                    <input
                      type="text"
                      required
                      value={aboutImageSec}
                      onChange={(e) => setAboutImageSec(e.target.value)}
                      className="w-full py-2.5 px-4 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs text-gray-900 dark:text-white text-left font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-gray-850">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-2xl text-xs font-black shadow-xl shadow-brand-red/15 transition-all active:scale-98 cursor-pointer"
                >
                  {isRtl ? 'ذخیره کل پیکربندی صفحه اصلی' : 'Save Entire Home Page Configurations'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 7: DATABASE MANAGEMENT & BACKUPS */}
        {adminTab === 'database' && (
          <div className="space-y-8 animate-fade-in">
            {/* Status Banner */}
            <div className="p-6 sm:p-8 rounded-3xl border bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className={`flex gap-4 items-start ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <div className="p-3.5 rounded-2xl shrink-0 bg-green-500/10 text-green-500">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
                    {isRtl ? 'اتصال مستقیم و امن به دیتابیس هاست (cPanel)' : 'Direct Host-Based cPanel Database Sync'}
                    <span className="px-2 py-0.5 text-[9px] font-black bg-green-500/10 text-green-500 rounded-md">ACTIVE & SECURE</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {isRtl 
                      ? 'وب‌سایت هم‌اکنون به سیستم ذخیره‌سازی مستقل از فیلترینگ مجهز است. تمام تغییرات شما در فایل data_db.php روی هاست خودتان به صورت آنی و لحظه‌ای ذخیره می‌شود.'
                      : 'Connected directly to your cPanel web hosting flat-file database proxy. Fully independent and unaffected by international network issues.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={handleForceHostSync}
                  className="px-5 py-3 bg-brand-red text-white hover:bg-brand-red-dark rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand-red/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isRtl ? 'ذخیره همه‌جانبه و هماهنگ‌سازی دستی کل سایت' : 'Force Server-Wide Database Sync'}
                </button>
                {syncStatus && (
                  <p className={`text-[10px] font-bold text-center ${syncStatus.includes('✓') ? 'text-green-500' : 'text-brand-red'}`}>
                    {syncStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Category CRUD Manager (Col 7) */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className={`font-black text-sm text-gray-950 dark:text-white mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Package className="w-4 h-4 text-brand-red" />
                  <span>{isRtl ? 'مدیریت پویا دسته‌بندی‌های مبلمان' : 'Dynamic Furniture Category Management'}</span>
                </h3>
                <p className={`text-xs text-gray-400 leading-relaxed mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl 
                    ? 'شما می‌توانید دسته‌بندی‌های کاتالوگ مبل را به صورت دلخواه اضافه، حذف یا ویرایش کنید. این دسته‌بندی‌ها به طور خودکار در فیلترهای منوی کاتالوگ و فرم ایجاد محصول لود می‌شوند.'
                    : 'Manage product catalog filters dynamically. Add or remove categories, which instantly updates the web-store and admin panel dropdowns.'}
                </p>

                {/* Categories Table/List */}
                <div className="space-y-3 mb-6">
                  {categories.map((cat) => {
                    const prodCount = products.filter(p => p.category === cat.id).length;
                    return (
                      <div 
                        key={cat.id} 
                        className={`p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                      >
                        <div>
                          <div className={`flex items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-black text-gray-950 dark:text-white">
                              {isRtl ? cat.nameFa : cat.nameEn}
                            </span>
                            <span className="text-[9px] bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono">
                              {cat.id}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            {isRtl ? `نام انگلیسی: ${cat.nameEn}` : `Persian Name: ${cat.nameFa}`}
                            {' • '}
                            <span className="font-bold text-brand-red">
                              {isRtl ? `${prodCount} محصول متصل` : `${prodCount} Products`}
                            </span>
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                          title={isRtl ? 'حذف دسته‌بندی' : 'Delete Category'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-4">
                  <h4 className={`text-xs font-black text-gray-950 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? '＋ افزودن دسته‌بندی جدید' : '＋ Add New Category'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 font-mono">ID (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. sofa-classic"
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs font-mono text-gray-950 dark:text-white text-left focus:outline-none"
                      />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">نام فارسی *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: مبل کلاسیک سلطنتی"
                        value={newCatNameFa}
                        onChange={(e) => setNewCatNameFa(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-right focus:outline-none"
                      />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">نام انگلیسی *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Classic"
                        value={newCatNameEn}
                        onChange={(e) => setNewCatNameEn(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-xs text-gray-950 dark:text-white text-left focus:outline-none"
                      />
                    </div>
                  </div>

                  {catError && (
                    <p className={`text-[10px] font-bold text-red-500 ${isRtl ? 'text-right' : 'text-left'}`}>
                      ⚠️ {catError}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-[11px] font-black transition-colors cursor-pointer"
                    >
                      {isRtl ? 'ثبت دسته‌بندی جدید' : 'Register Category'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Local Backup / Restore Panel (Col 5) */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className={`font-black text-sm text-gray-950 dark:text-white mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Download className="w-4 h-4 text-brand-red" />
                    <span>{isRtl ? 'نسخه پشتیبان دیتابیس (JSON Backup)' : 'Database Backup & Restore'}</span>
                  </h3>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl 
                      ? 'شما می‌توانید در هر زمان کل محتوای پنل مدیریت (محصولات، مقالات، تنظیمات صفحه اصلی و لیدها) را به صورت یک فایل پشتیبان دانلود کنید و روی سایت جدید بازیابی کنید.'
                      : 'Export your entire store setup into a single offline backup file or upload an existing backup to restore it.'}
                  </p>
                </div>

                {/* Export Card */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl flex items-center justify-between gap-4">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">
                      {isRtl ? 'پشتیبان‌گیری کامل دیتابیس' : 'Download Complete Backup'}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isRtl ? 'ذخیره کل داده‌ها در قالب فایل JSON' : 'Save as a structured JSON file'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="p-3 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    title={isRtl ? 'دانلود نسخه پشتیبان' : 'Export Backup'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-3">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">
                      {isRtl ? 'بازیابی نسخه پشتیبان' : 'Upload & Restore Backup'}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isRtl ? 'بارگذاری فایل پشتیبان قبلی روی سیستم' : 'Load an existing backup file to restore database'}
                    </p>
                  </div>
                  
                  <label className="flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl hover:border-brand-red/50 hover:bg-brand-red/5 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 hover:text-brand-red">{isRtl ? 'انتخاب فایل JSON پشتیبان' : 'Select Backup JSON File'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-950 dark:text-white">
                    {isRtl ? 'تایید عملیات حذف' : 'Confirm Deletion'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {isRtl 
                      ? `آیا از حذف «${deleteConfirm.title}» اطمینان کامل دارید؟ این عملیات غیرقابل بازگشت است.` 
                      : `Are you sure you want to permanently delete "${deleteConfirm.title}"? This action cannot be undone.`}
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    {isRtl ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/15 transition-colors"
                  >
                    {isRtl ? 'بله، حذف شود' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
