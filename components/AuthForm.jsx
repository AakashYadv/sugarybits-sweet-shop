import React, { useState } from 'react';

const AuthForm = ({ onLogin, onRegister, view, toggleView }) => {
  const [identifier, setIdentifier] = useState(''); // Username or Email
  const [password, setPassword] = useState('');
  
  // Register specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'LOGIN') {
      onLogin(identifier);
    } else {
      onRegister({
        firstName,
        lastName,
        email,
        username,
        password
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="relative bg-brand-600 p-10 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/20">
               <i className={`fa-solid ${view === 'LOGIN' ? 'fa-right-to-bracket' : 'fa-user-plus'} text-3xl text-white`}></i>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              {view === 'LOGIN' ? 'Welcome Back' : 'Join SugaryBits'}
            </h2>
            <p className="text-brand-100 font-medium">
              {view === 'LOGIN' ? 'Access your sweet dashboard' : 'Create your account to start shopping'}
            </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {view === 'REGISTER' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">First Name</label>
                   <input
                     type="text"
                     required
                     className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Last Name</label>
                   <input
                     type="text"
                     required
                     className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Email Address</label>
                <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"></i>
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Username</label>
                <div className="relative">
                    <i className="fa-solid fa-at absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"></i>
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
              </div>
            </>
          )}

          {view === 'LOGIN' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Username or Email</label>
              <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"></i>
                  <input
                    type="text"
                    required
                    placeholder="e.g. user@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"></i>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 mt-2"
          >
            {view === 'LOGIN' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
           <p className="text-sm text-gray-500 dark:text-gray-400">
             {view === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
             <button 
               onClick={() => toggleView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
               className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
             >
               {view === 'LOGIN' ? 'Sign up' : 'Log in'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;