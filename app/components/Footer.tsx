import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, ArrowRight, Car, Package, Shield, ExternalLink } from 'lucide-react';

const PremiumFooter = () => {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { name: 'Model 3 Parts', href: '/model-3' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Best Sellers', href: '/best-sellers' },
    { name: 'Performance Parts', href: '/performance' }
  ];

  const supportLinks = [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Installation Guide', href: '/installation' },
    { name: 'Warranty Info', href: '/warranty' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'Help Center', href: '/help' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Tesla Specialists', href: '/specialists' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Return Policy', href: '/return-policy' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-500' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-400' }
  ];

  const partnerCompanies = [
    { name: 'Advanced Plumbing', url: 'advancedplumbingkamloops.ca' },
    { name: 'Rentals Kamloops', url: 'rentalskamloops.ca' },
    { name: 'Hodder Construction', url: 'hodder.ca' },
    { name: 'EV Store Cars', url: 'cars.theevstore.ca' }
  ];

  return (
    <footer className="bg-slate-800">
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                  Stay Updated with Tesla Parts
                </h3>
                <p className="text-blue-100 text-lg max-w-md">
                  Get the latest updates on new parts, exclusive deals, and Tesla maintenance tips.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[400px]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center">
                  Subscribe
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <Image 
                src="/images/logo.png" 
                alt="The EV Store"
                width={180}
                height={45}
                className="h-12 w-auto"
              />
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Precision-engineered Tesla components and professional installation services. 
                Elevating your Tesla experience with uncompromising quality.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-300">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span>Kamloops, British Columbia, Canada</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span>+1 (250) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span>info@theevstore.ca</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-600 transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-white font-semibold mb-6 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-400" />
                Shop
              </h4>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                Support
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-6 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-400" />
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Partner Companies Section */}
          <div className="border-t border-slate-700 pt-12 mb-12">
            <h4 className="text-white font-semibold mb-6 text-center">Our Business Network</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {partnerCompanies.map((company) => (
                <a
                  key={company.name}
                  href={`https://${company.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors duration-200 group"
                >
                  <h5 className="text-white font-medium mb-2 text-sm">{company.name}</h5>
                  <p className="text-slate-400 text-xs flex items-center justify-center group-hover:text-slate-300">
                    {company.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-slate-400 text-sm text-center lg:text-left">
                <p>&copy; {currentYear} The EV Store. All rights reserved.</p>
                <p className="mt-1">Professional Tesla parts and service in Kamloops, BC</p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-end gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;