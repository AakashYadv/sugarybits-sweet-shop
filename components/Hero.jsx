import React from 'react';

const Hero = () => {
  return (
    <div className="relative bg-brand-900 overflow-hidden rounded-3xl mb-16 shadow-2xl isolate">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-400 via-brand-900 to-transparent"></div>
         <svg className="absolute right-0 top-0 h-full w-1/2 translate-x-1/3 stroke-white/10" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="none" />
         </svg>
         <img 
            src="https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=2000&q=80" 
            alt="Background Texture" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
         />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-brand-100 ring-1 ring-inset ring-brand-100/20 mb-8 bg-brand-800/40 backdrop-blur-md">
           <span className="flex h-2 w-2 rounded-full bg-brand-300 mr-2 animate-pulse"></span>
           New Seasonal Flavors Available
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 drop-shadow-sm">
          Handcrafted <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-brand-100">Sweetness</span> <br/> Delivered to You.
        </h1>
        <p className="mt-4 text-lg leading-8 text-brand-100 max-w-2xl mx-auto font-light">
          Discover our premium collection of artisanal chocolates, gourmet gummies, and delicate pastries. Made with love, shipped with care.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <button 
            onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth'})} 
            className="rounded-full bg-white px-8 py-4 text-sm font-bold text-brand-900 shadow-xl hover:shadow-2xl hover:bg-brand-50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Shop Collection
          </button>
          <button className="text-sm font-semibold leading-6 text-white group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
            Our Story <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;