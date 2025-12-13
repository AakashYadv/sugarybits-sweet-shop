import React, { useState } from 'react';

const CheckoutView = ({ totalAmount, onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', state: '', zipCode: '', country: 'USA'
  });
  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardHolder: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address, payment);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>1</div>
        <div className={`w-20 h-1 ${step >= 2 ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>2</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{step === 1 ? 'Shipping Details' : 'Payment Details'}</h2>
          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">${totalAmount.toFixed(2)}</span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="p-8 space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                  value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                <input required type="text" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                  value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input required type="text" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input required type="text" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                  <input required type="text" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <select className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={address.country} onChange={e => setAddress({...address, country: e.target.value})}>
                    <option>USA</option>
                    <option>Canada</option>
                    <option>UK</option>
                  </select>
                </div>
             </div>
             <div className="flex justify-between pt-4">
                <button type="button" onClick={onCancel} className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold">Continue to Payment</button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-800 dark:text-blue-300 text-sm mb-4 border border-blue-100 dark:border-blue-800">
               <i className="fa-solid fa-info-circle mr-2"></i> This is a secure mock payment. No real money will be charged.
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Holder Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                  value={payment.cardHolder} onChange={e => setPayment({...payment, cardHolder: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                <div className="relative">
                  <i className="fa-regular fa-credit-card absolute left-3 top-3 text-gray-400 dark:text-gray-500"></i>
                  <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={payment.cardNumber} onChange={e => setPayment({...payment, cardNumber: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                  <input required type="password" placeholder="123" maxLength={3} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-700 dark:text-white" 
                    value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} />
                </div>
             </div>
             <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(1)} className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">Back</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg">Place Order</button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutView;