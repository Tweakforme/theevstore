import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <svg width="160" height="40" viewBox="0 0 400 100">
              <path d="M75 18 Q88 12 105 18 L118 25 L125 32 L118 39 L105 46 Q88 52 75 46 Z" fill="#10b981"/>
              <rect x="120" y="28" width="10" height="5" fill="#10b981"/>
              <rect x="120" y="35" width="10" height="5" fill="#10b981"/>
              <path d="M15 65 Q45 15 85 28 Q125 38 145 65 Q125 52 85 42 Q45 32 15 65 Z" fill="#10b981"/>
              <path d="M145 25 Q210 5 290 18 Q370 28 385 52 Q350 38 290 32 Q210 26 145 25 Z" fill="#06b6d4"/>
              <path d="M385 52 Q365 46 345 52 Q325 58 305 65 Q285 72 265 78 L385 78 Z" fill="#06b6d4"/>
              <text x="115" y="78" fontFamily="system-ui" fontWeight="800" fontSize="26" fill="white">THE</text>
              <text x="165" y="78" fontFamily="system-ui" fontWeight="800" fontSize="30" fill="white">EV</text>
              <text x="210" y="78" fontFamily="system-ui" fontWeight="800" fontSize="30" fill="white">STORE</text>
            </svg>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md font-light">
              Elevating Tesla ownership through precision-engineered components and uncompromising quality.
            </p>
            <div className="flex space-x-4">
              {['f', 'ig', 'tw', 'yt'].map((social) => (
                <div key={social} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors duration-300 cursor-pointer">
                  <span className="text-slate-400 text-sm">{social}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">Shop</h4>
            <ul className="space-y-3 text-slate-400">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Performance', 'Premium'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-3 text-slate-400">
              {['Contact', 'Installation', 'Warranty', 'Returns', 'Help Center'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">&copy; 2025 The EV Store. Crafted with precision.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            {['Privacy', 'Terms', 'Shipping'].map((item) => (
              <a key={item} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;