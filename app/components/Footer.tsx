import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <img src="/images/logo.png" alt="The EV Store" className="h-12 w-auto" />
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