"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Zap, Settings, Users, MapPin, Calendar, Wrench } from 'lucide-react';

const AboutPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companies = [
    {
      name: "Advanced Plumbing",
      url: "advancedplumbingkamloops.ca",
      description: "Premium plumbing solutions for residential and commercial needs",
      category: "Construction"
    },
    {
      name: "Rentals Kamloops",
      url: "rentalskamloops.ca", 
      description: "Home and Office Rentals in Kamloops, BC",
      category: "Real Estate"
    },
    {
      name: "Hodder Construction",
      url: "hodder.ca",
      description: "Expert construction services and project management",
      category: "Construction"
    },
    {
      name: "EV Store Cars",
      url: "cars.theevstore.ca",
      description: "Premium Tesla vehicles and certified pre-owned cars",
      category: "Automotive"
    }
  ];

  const stats = [
    { value: "2020", label: "Established", icon: Calendar },
    { value: "Model 3 & Y", label: "Specialization", icon: Zap },
    { value: "2017-2025", label: "Coverage", icon: Settings },
    { value: "Kamloops, BC", label: "Location", icon: MapPin }
  ];

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-24">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-full text-red-700 text-sm font-medium mb-8">
                
                Tesla Specialist Since 2020
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                The EV Store
                <span className="block text-3xl lg:text-4xl font-normal text-slate-600 mt-2">
                  Tesla Parts & Service Excellence
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Professional-grade Tesla Model 3 and Y components with expert installation services. 
                Serving Kamloops with precision engineering and uncompromising quality standards.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center group">
                  Browse Parts Catalog
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                  Schedule Service
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Wrench className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Tesla Model 3 & Y</p>
                  <p className="text-slate-400">Professional Service</p>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white shadow-lg rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Certified Parts</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white shadow-lg rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Expert Installation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-slate-600" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Professional Tesla Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete parts catalog and professional services for Tesla Model 3 and Y vehicles
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Tesla Parts & Service */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Settings className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Tesla Parts & Service
              </h3>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                OEM and high-performance aftermarket components for Tesla Model 3 and Y (2017-2025). 
                Professional installation by certified technicians with Tesla-specific diagnostic equipment.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  OEM Tesla replacement parts
                </li>
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  Performance upgrades & modifications
                </li>
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  Professional installation service
                </li>
              </ul>
              
              <button className="text-slate-900 font-semibold hover:text-slate-700 transition-colors inline-flex items-center">
                View Parts Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Vehicle Sales */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <ExternalLink className="h-5 w-5 text-slate-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Tesla Vehicle Sales
              </h3>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                Certified pre-owned Tesla vehicles available at cars.theevstore.ca. 
                Each vehicle undergoes comprehensive multi-point inspection and comes with detailed service history.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  Certified pre-owned Tesla vehicles
                </li>
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  Comprehensive vehicle inspection
                </li>
                <li className="flex items-center text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  Complete service documentation
                </li>
              </ul>
              
              <a 
                href="https://cars.theevstore.ca" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 font-semibold hover:text-red-700 transition-colors inline-flex items-center"
              >
                Browse Vehicle Inventory
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company Portfolio */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Business Network
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Part of a diverse portfolio of companies serving Kamloops with professional excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {companies.map((company, index) => (
              <div 
                key={company.name}
                className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all hover:border-slate-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    {company.category}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {company.name}
                </h3>
                
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {company.description}
                </p>
                
                <a 
                  href={`https://${company.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 text-sm transition-colors inline-flex items-center font-medium"
                >
                  {company.url}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Enhance Your Tesla?
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Professional Tesla parts and service in Kamloops, BC. Quality components, expert installation, 
            and exceptional customer service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-slate-100 transition-colors inline-flex items-center justify-center group">
              Shop Tesla Parts
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="https://cars.theevstore.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
            >
              Browse Vehicles
              <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">
              <p>© 2025 The EV Store. Professional Tesla solutions in Kamloops, BC.</p>
              <p className="mt-2 sm:mt-0">Serving Tesla Model 3 & Y since 2020</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;