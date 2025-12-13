import React, { useState, useEffect, useCallback } from 'react';
import { Sweet, User, UserRole, SweetCategory, ToastMessage, ToastType, CartItem, Address, PaymentDetails, Order, OrderStatus, RegisterData } from './types';
//import { sweetService } from './services/mockService.ts';
import { sweetService } from "@/services/apiService";


import SweetCard from './components/SweetCard';
import AdminModal from './components/AdminModal';
import AuthForm from './components/AuthForm';
import Toast from './components/Toast';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderList from './components/OrderList';
import Footer from './components/Footer';
import Hero from './components/Hero';
import GenericPage from './components/GenericPage';

type View = 'DASHBOARD' | 'LOGIN' | 'REGISTER' | 'CART' | 'CHECKOUT' | 'ORDERS' | 'WISHLIST' | 'GENERIC_PAGE';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Generic Page State
  const [genericPageData, setGenericPageData] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Theme Effect ---
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- Session Check (IndexedDB is async) ---
  useEffect(() => {
    const checkSession = async () => {
        const storedUserId = localStorage.getItem('sb_current_user_id');
        if (storedUserId) {
            try {
                // We need to fetch the user from IDB
                const dbUser = await sweetService.getUserById(storedUserId);
                if (dbUser) setUser(dbUser);
            } catch (e) {
                console.error("Session restoration failed", e);
            }
        }
    };
    checkSession();
  }, []);

  // --- Data Fetching ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        category: categoryFilter,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
      };
      
      const data = await sweetService.getSweets(filters);
      setSweets(data);

      if (user) {
        const cartData = await sweetService.getCart(user.id);
        const wishlistData = await sweetService.getWishlist(user.id);
        const orderData = await sweetService.getOrders(user);
        setCart(cartData);
        setWishlist(wishlistData);
        setOrders(orderData);
      } else {
        setCart([]);
        setWishlist([]);
        setOrders([]);
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
      // Don't show error toast on first load race conditions
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, minPrice, maxPrice, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // --- Handlers ---

  const handleLogin = async (identifier: string) => {
    try {
      setLoading(true);
      const user = await sweetService.login(identifier);
      setUser(user);
      setCurrentView('DASHBOARD');
      addToast('success', `Welcome back, ${user.username}!`);
    } catch (err: any) {
      addToast('error', err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setLoading(true);
      const user = await sweetService.register(data);
      setUser(user);
      setCurrentView('DASHBOARD');
      addToast('success', `Welcome to SugaryBits, ${user.firstName}!`);
    } catch (err: any) {
      addToast('error', err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await sweetService.logout();
    setUser(null);
    setCurrentView('LOGIN');
    setCart([]);
    setWishlist([]);
    addToast('info', "You have been logged out.");
  };

  const handleAddToCart = async (sweet: Sweet) => {
    if (!user) {
      addToast('info', "Please login to shop.");
      setCurrentView('LOGIN');
      return;
    }
    try {
      const updatedCart = await sweetService.addToCart(user.id, sweet);
      setCart(updatedCart);
      addToast('success', `Added ${sweet.name} to cart`);
    } catch (e: any) {
      addToast('error', e.message || "Could not add to cart");
    }
  };

  const handleUpdateCartQty = async (id: string, qty: number) => {
    if (!user) return;
    try {
      const updatedCart = await sweetService.updateCartItemQuantity(user.id, id, qty);
      setCart(updatedCart);
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleToggleWishlist = async (sweetId: string) => {
    if (!user) {
      addToast('info', "Please login to use wishlist.");
      setCurrentView('LOGIN');
      return;
    }
    try {
      const updatedList = await sweetService.toggleWishlist(user.id, sweetId);
      setWishlist(updatedList);
      if (updatedList.includes(sweetId)) {
        addToast('success', "Added to wishlist");
      } else {
        addToast('info', "Removed from wishlist");
      }
    } catch (e) {
      addToast('error', "Wishlist update failed");
    }
  };

  const handlePlaceOrder = async (address: Address, payment: PaymentDetails) => {
    if (!user) return;
    setLoading(true);
    try {
      await sweetService.createOrder(user.id, address, cart);
      addToast('success', "Order placed successfully!");
      setCart([]); 
      await sweetService.clearCart(user.id); // Explicit clear call to update state correctly
      fetchData(); 
      setCurrentView('ORDERS');
    } catch (e: any) {
      addToast('error', e.message || "Order processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await sweetService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      addToast('success', "Order status updated");
    } catch (e) {
      addToast('error', "Failed to update status");
    }
  };

  const handleSaveSweet = async (sweet: Partial<Sweet>) => {
    try {
      if (sweet.id) {
        await sweetService.updateSweet(sweet as Sweet);
        addToast('success', 'Sweet updated successfully');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newSweetData } = sweet as Sweet; 
        await sweetService.addSweet(newSweetData as any);
        addToast('success', 'New sweet added to inventory');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      addToast('error', "Failed to save sweet");
    }
  };

  const handleDeleteSweet = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this sweet?")) return;
    try {
      await sweetService.deleteSweet(id);
      addToast('info', 'Sweet removed from inventory');
      fetchData();
    } catch(e) {
      addToast('error', "Failed to delete sweet");
    }
  };

  const handleRestock = async (id: string, amount: number) => {
    try {
      const updated = await sweetService.restockSweet(id, amount);
      setSweets(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToast('success', `Restocked ${updated.name} (+${amount})`);
    } catch(e) {
      addToast('error', "Failed to restock");
    }
  };

  const handleFooterNavigation = (linkName: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    switch(linkName) {
      case 'All Products':
      case 'New Arrivals':
      case 'Best Sellers':
      case 'Gift Bundles':
        setSearchTerm('');
        setCategoryFilter('All');
        setCurrentView('DASHBOARD');
        break;
      
      case 'FAQ':
        setGenericPageData({
          title: 'Frequently Asked Questions',
          content: (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="font-bold text-lg mb-2">How long does shipping take?</h3>
                <p>Standard shipping takes 3-5 business days. Express shipping options are available at checkout.</p>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="font-bold text-lg mb-2">Do you offer international shipping?</h3>
                <p>Yes! We currently ship to over 50 countries worldwide. Shipping rates will be calculated at checkout.</p>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="font-bold text-lg mb-2">Are your products gluten-free?</h3>
                <p>Many of our items are gluten-free. Please check the "Nutritional Info" tab on each product page for specific allergen information.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">What is your return policy?</h3>
                <p>Due to the perishable nature of our goods, we cannot accept returns on opened items. If your order arrives damaged, please contact us within 48 hours for a replacement.</p>
              </div>
            </div>
          )
        });
        setCurrentView('GENERIC_PAGE');
        break;

      case 'Shipping & Returns':
        setGenericPageData({
          title: 'Shipping & Returns',
          content: (
            <div className="space-y-6">
              <p>We take pride in packaging our sweets so they arrive in perfect condition.</p>
              <div>
                <h3 className="font-bold text-lg mb-2">Shipping Policy</h3>
                <p className="mb-2">Orders placed before 2 PM EST are typically processed the same day. Orders placed after 2 PM or on weekends will be processed the next business day.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Standard Shipping: $5.99 (Free on orders over $50)</li>
                  <li>Express Shipping: $12.99</li>
                  <li>Overnight Shipping: $24.99</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Return Policy</h3>
                <p>If you are not completely satisfied with your purchase, please contact our support team. While we cannot accept returns on food items, we will happily issue a refund or replacement for any damaged or incorrect items.</p>
              </div>
            </div>
          )
        });
        setCurrentView('GENERIC_PAGE');
        break;

      case 'Contact Us':
        setGenericPageData({
          title: 'Contact Us',
          content: (
            <div className="space-y-6">
              <p>Have a question or just want to say hello? We'd love to hear from you!</p>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-4">Customer Support</h3>
                <p className="mb-2"><i className="fa-solid fa-envelope w-6"></i> hello@sugarybits.com</p>
                <p className="mb-2"><i className="fa-solid fa-phone w-6"></i> 1-800-SWEETS-1</p>
                <p><i className="fa-solid fa-location-dot w-6"></i> 123 Candy Lane, Sweet City, SC 12345</p>
              </div>
              <p>Our support team is available Monday through Friday, 9 AM to 5 PM EST.</p>
            </div>
          )
        });
        setCurrentView('GENERIC_PAGE');
        break;

      case 'Privacy Policy':
        setGenericPageData({
          title: 'Privacy Policy',
          content: (
            <div className="space-y-4 text-sm">
              <p>At SugaryBits, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from sugarybits.com.</p>
              <h3 className="font-bold text-md mt-4">Personal Information We Collect</h3>
              <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
              <h3 className="font-bold text-md mt-4">How We Use Your Information</h3>
              <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
              <h3 className="font-bold text-md mt-4">Data Retention</h3>
              <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
            </div>
          )
        });
        setCurrentView('GENERIC_PAGE');
        break;

      default:
        addToast('info', `Navigating to ${linkName}...`);
    }
  };

  // --- Renderers ---

  const renderNavbar = () => (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => { setCurrentView('DASHBOARD'); setSearchTerm(''); setCategoryFilter('All'); }}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl rotate-3 flex items-center justify-center mr-3 shadow-lg shadow-brand-500/30 group-hover:rotate-6 transition-transform">
              <i className="fa-solid fa-candy-cane text-white text-lg"></i>
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">SugaryBits</span>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
             {/* Theme Toggle */}
             <button
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="p-2.5 text-gray-400 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
               title="Toggle Theme"
             >
               <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
             </button>

            {user ? (
              <>
                {user.role === UserRole.CUSTOMER && (
                  <>
                     <button 
                       onClick={() => setCurrentView('WISHLIST')} 
                       className={`p-2.5 relative rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-all active:scale-95 ${currentView === 'WISHLIST' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'text-gray-500 dark:text-gray-400'}`}
                       title="Wishlist"
                     >
                        <i className={`${currentView === 'WISHLIST' ? 'fa-solid' : 'fa-regular'} fa-heart text-xl`}></i>
                     </button>
                     <button 
                       onClick={() => setCurrentView('CART')} 
                       className={`p-2.5 relative rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-all mr-2 active:scale-95 ${currentView === 'CART' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'text-gray-500 dark:text-gray-400'}`}
                       title="Cart"
                     >
                        <i className="fa-solid fa-cart-shopping text-xl"></i>
                        {cart.length > 0 && (
                          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full ring-2 ring-white dark:ring-gray-900">
                            {cart.reduce((a, b) => a + b.cartQuantity, 0)}
                          </span>
                        )}
                     </button>
                  </>
                )}
                
                <button 
                  onClick={() => setCurrentView('ORDERS')} 
                  className={`hidden md:flex items-center px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentView === 'ORDERS' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  <i className="fa-solid fa-box-open mr-2"></i> Orders
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.firstName || user.username}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{user.role}</span>
                </div>
                
                {user.role === UserRole.ADMIN && (
                   <button 
                     onClick={() => { setEditingSweet(undefined); setIsModalOpen(true); }}
                     className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-gray-900/20 dark:shadow-white/10 hover:-translate-y-0.5 flex items-center"
                   >
                     <i className="fa-solid fa-plus mr-2"></i> Add Item
                   </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket text-xl"></i>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView('LOGIN')} 
                  className="text-gray-600 dark:text-gray-300 font-bold hover:text-brand-600 dark:hover:text-brand-400 px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setCurrentView('REGISTER')} 
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-brand-500/30 hover:-translate-y-0.5"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <>
      <div className="animate-fade-in">
        <Hero />
        
        <div className="flex items-end justify-between mb-8 px-2" id="product-grid">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Collection</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Found {sweets.length} products matching your criteria</p>
           </div>
        </div>

        {renderFilters()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sweets.map(sweet => (
            <SweetCard 
              key={sweet.id} 
              sweet={sweet}
              userRole={user?.role}
              isWishlisted={wishlist.includes(sweet.id)}
              onAddToCart={() => handleAddToCart(sweet)}
              onToggleWishlist={() => handleToggleWishlist(sweet.id)}
              onEdit={() => { setEditingSweet(sweet); setIsModalOpen(true); }}
              onDelete={() => handleDeleteSweet(sweet.id)}
              onRestock={(amt) => handleRestock(sweet.id, amt)}
            />
          ))}
          {sweets.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
               <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-search text-gray-400 text-xl"></i>
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
               <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 sticky top-24 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 transition-colors">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <i className="fa-solid fa-search absolute left-4 top-3.5 text-gray-400"></i>
            <input 
              type="text" 
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-10 pr-4 py-3 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white" 
              placeholder="Search sweets..." 
              value={searchTerm} 
              onChange={e=>setSearchTerm(e.target.value)} 
            />
        </div>
        <div className="w-full md:w-56">
            <select 
              value={categoryFilter} 
              onChange={e=>setCategoryFilter(e.target.value)} 
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all cursor-pointer dark:text-white"
            >
                <option value="All">All Categories</option>
                {Object.values(SweetCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <div className="flex gap-2">
            <input type="number" placeholder="Min $" className="w-24 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-3 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
            <div className="flex items-center text-gray-400">-</div>
            <input type="number" placeholder="Max $" className="w-24 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-3 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => {
    const wishlistItems = sweets.filter(s => wishlist.includes(s.id));
    return (
      <div className="space-y-8 animate-fade-in">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
               <i className="fa-solid fa-heart text-xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
              <p className="text-gray-500 dark:text-gray-400">Saved items for later</p>
            </div>
         </div>
         
         {wishlistItems.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
               <p className="text-gray-400 mb-4">Your wishlist is looking a bit empty.</p>
               <button onClick={() => setCurrentView('DASHBOARD')} className="text-brand-600 font-bold hover:underline">Start Shopping</button>
            </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistItems.map(sweet => (
                <SweetCard 
                  key={sweet.id} 
                  sweet={sweet}
                  userRole={user?.role}
                  isWishlisted={true}
                  onAddToCart={() => handleAddToCart(sweet)}
                  onToggleWishlist={() => handleToggleWishlist(sweet.id)}
                  onEdit={() => { setEditingSweet(sweet); setIsModalOpen(true); }}
                  onDelete={() => handleDeleteSweet(sweet.id)}
                  onRestock={(amt) => handleRestock(sweet.id, amt)}
                />
              ))}
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
      <Toast toasts={toasts} removeToast={removeToast} />
      {renderNavbar()}

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !sweets.length ? (
           <div className="flex justify-center py-40">
              <div className="flex flex-col items-center gap-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-100 border-t-brand-600"></div>
                 <p className="text-brand-600 font-medium animate-pulse">Loading sweetness...</p>
              </div>
           </div>
        ) : (
          <>
            {(currentView === 'LOGIN' || currentView === 'REGISTER') && (
               <div className="max-w-md mx-auto mt-20 animate-fade-in-up">
                 <AuthForm 
                   onLogin={handleLogin} 
                   onRegister={handleRegister}
                   view={currentView} 
                   toggleView={setCurrentView} 
                 />
               </div>
            )}
            
            {currentView === 'DASHBOARD' && renderDashboard()}
            
            {currentView === 'CART' && (
              <div className="animate-fade-in">
                <CartView 
                  items={cart} 
                  onUpdateQuantity={handleUpdateCartQty} 
                  onCheckout={() => setCurrentView('CHECKOUT')} 
                />
              </div>
            )}
            
            {currentView === 'CHECKOUT' && (
              <div className="animate-fade-in">
                <CheckoutView 
                  totalAmount={cart.reduce((sum, i) => sum + (i.price * i.cartQuantity), 0)}
                  onSubmit={handlePlaceOrder}
                  onCancel={() => setCurrentView('CART')}
                />
              </div>
            )}
            
            {currentView === 'ORDERS' && (
              <div className="animate-fade-in">
                 <OrderList orders={orders} role={user?.role || UserRole.CUSTOMER} onUpdateStatus={handleUpdateOrderStatus} />
              </div>
            )}

            {currentView === 'WISHLIST' && renderWishlist()}

            {currentView === 'GENERIC_PAGE' && genericPageData && (
                <GenericPage 
                    title={genericPageData.title}
                    content={genericPageData.content}
                    onBack={() => setCurrentView('DASHBOARD')}
                />
            )}
          </>
        )}
      </main>

      <Footer addToast={addToast} onNavigate={handleFooterNavigation} />

      {isModalOpen && (
        <AdminModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingSweet(undefined); }}
          onSave={handleSaveSweet}
          initialData={editingSweet}
        />
      )}
    </div>
  );
};

export default App;
