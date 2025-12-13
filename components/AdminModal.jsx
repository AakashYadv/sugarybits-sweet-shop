import React, { useState, useEffect } from 'react';
import { SweetCategory } from '../types.js';

const AdminModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: SweetCategory.CHOCOLATE,
    description: '',
    price: 0,
    quantity: 0,
    imageUrl: `https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80`
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all relative z-10 flex flex-col max-h-[90vh]">
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below to update your inventory.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Product Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Delicious Chocolate Bar"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
              <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none bg-white dark:bg-gray-700 transition-all dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                     {Object.values(SweetCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                      <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
              </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Price ($)</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Stock Quantity</label>
            <input
              type="number"
              min="0"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all dark:bg-gray-700 dark:text-white"
              placeholder="Describe the taste and texture..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Image URL</label>
             <div className="flex gap-2">
                 <input
                  type="url"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm text-gray-600 dark:text-gray-300 transition-all dark:bg-gray-700"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                {formData.imageUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
             </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              className="px-8 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Save Product
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;