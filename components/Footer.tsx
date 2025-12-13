import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-brand-600 rounded-lg rotate-3 flex items-center justify-center text-white shadow-md">
                 <i className="fa-solid fa-candy-cane text-sm"></i>
               </div>
               <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">SugaryBits</span>
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
               Crafting moments of joy, one sweet treat at a time. Quality ingredients, sustainable sourcing, and unforgettable flavors delivered worldwide.
             </p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">All Products</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">New Arrivals</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">Best Sellers</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">Gift Bundles</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">FAQ</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Stay Sweet</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 leading-relaxed">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all dark:text-white" />
              <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm">Join</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2024 SugaryBits Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors transform hover:scale-110"><i className="fa-brands fa-instagram text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors transform hover:scale-110"><i className="fa-brands fa-twitter text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors transform hover:scale-110"><i className="fa-brands fa-facebook text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors transform hover:scale-110"><i className="fa-brands fa-tiktok text-xl"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;