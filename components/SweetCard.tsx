import React from 'react';
import { Sweet, UserRole } from '../types.ts';

interface SweetCardProps {
  sweet: Sweet;
  userRole?: UserRole;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRestock: (amount: number) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ 
  sweet, 
  userRole,
  isWishlisted, 
  onAddToCart, 
  onToggleWishlist,
  onEdit, 
  onDelete, 
  onRestock 
}) => {
  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity < 10;
  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img 
          src={sweet.imageUrl} 
          alt={sweet.name} 
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 backdrop-blur-md shadow-sm border border-white/50 dark:border-gray-600">
            {sweet.category}
          </span>
        </div>

        {/* Wishlist Button */}
        {!isAdmin && (
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
             className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all z-10 hover:scale-110 active:scale-95 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500'}`}
           >
             <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
           </button>
        )}

        {/* Stock Badge */}
        <div className="absolute bottom-4 left-4 z-10">
          {isOutOfStock ? (
             <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm bg-red-500 text-white border border-red-600 flex items-center gap-1">
                <i className="fa-solid fa-circle-xmark"></i> Sold Out
             </span>
          ) : (
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm border flex items-center gap-1 ${
                isLowStock ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'
            }`}>
                <i className={`fa-solid fa-circle ${isLowStock ? 'text-orange-500' : 'text-green-500'} text-[6px]`}></i>
                {sweet.quantity} Left
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" title={sweet.name}>
              {sweet.name}
            </h3>
            <span className="text-lg font-bold text-brand-600 dark:text-brand-400 font-mono tracking-tight whitespace-nowrap">${sweet.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{sweet.description}</p>

        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
          {/* Admin Actions */}
          {isAdmin ? (
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onEdit} className="text-xs font-semibold bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-pen"></i> Edit</button>
                    <button onClick={onDelete} className="text-xs font-semibold bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 dark:hover:text-red-400 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"><i className="fa-solid fa-trash"></i> Delete</button>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={() => onRestock(10)} className="flex-1 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 py-2 rounded-lg transition-colors border border-brand-100 dark:border-brand-800">+ 10 Stock</button>
                     <button onClick={() => onRestock(50)} className="flex-1 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 py-2 rounded-lg transition-colors border border-brand-100 dark:border-brand-800">+ 50</button>
                </div>
            </div>
          ) : (
            /* Customer Action */
             <button
               onClick={onAddToCart}
               disabled={isOutOfStock}
               className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all active:scale-95 ${
                 isOutOfStock 
                   ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                   : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-brand-600 dark:hover:bg-brand-400 shadow-lg shadow-gray-200 dark:shadow-gray-900/50 hover:shadow-brand-500/30'
               }`}
             >
               {isOutOfStock ? (
                   <><i className="fa-solid fa-ban mr-2"></i> Sold Out</>
               ) : (
                   <><i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart</>
               )}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SweetCard;