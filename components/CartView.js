import React from 'react';
import { html } from 'htm/react';

const CartView = ({ items, onUpdateQuantity, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  if (items.length === 0) {
    return html`
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
           <i className="fa-solid fa-cart-shopping text-3xl text-gray-300 dark:text-gray-500"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added any sweets yet.</p>
        <button onClick=${() => window.location.hash = '#'} className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">
          Start Shopping &rarr;
        </button>
      </div>
    `;
  }

  return html`
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart (${items.length})</h2>
        ${items.map(item => html`
          <div key=${item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center">
             <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
               <img src=${item.imageUrl} alt=${item.name} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">${item.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">${item.name}</h3>
                 </div>
                 <span className="font-bold text-lg text-gray-900 dark:text-white">$${(item.price * item.cartQuantity).toFixed(2)}</span>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">${item.description}</p>
               
               <div className="flex justify-between items-center mt-4">
                 <div className="flex items-center gap-3">
                   <button 
                     onClick=${() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                     className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                   >
                     <i className="fa-solid fa-minus text-xs"></i>
                   </button>
                   <span className="font-mono font-medium w-6 text-center dark:text-white">${item.cartQuantity}</span>
                   <button 
                     onClick=${() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                     className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                   >
                     <i className="fa-solid fa-plus text-xs"></i>
                   </button>
                 </div>
                 <button 
                   onClick=${() => onUpdateQuantity(item.id, 0)}
                   className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                 >
                   Remove
                 </button>
               </div>
             </div>
          </div>
        `)}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
           
           <div className="space-y-3 mb-6">
             <div className="flex justify-between text-gray-600 dark:text-gray-300">
               <span>Subtotal</span>
               <span>$${subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-600 dark:text-gray-300">
               <span>Shipping</span>
               <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
             </div>
             <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-xl text-gray-900 dark:text-white">
               <span>Total</span>
               <span>$${subtotal.toFixed(2)}</span>
             </div>
           </div>

           <button 
             onClick=${onCheckout}
             className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-95"
           >
             Proceed to Checkout
           </button>
           <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">Secure checkout powered by SugaryBits</p>
        </div>
      </div>
    </div>
  `;
};

export default CartView;