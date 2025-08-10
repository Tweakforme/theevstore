"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Sparkles, Award, Users, MapPin, Calendar } from 'lucide-react';

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
    { value: "3 & Y", label: "Model Focus", icon: Award },
    { value: "2017-25", label: "Coverage", icon: Users },
    { value: "BC", label: "Kamloops", icon: MapPin }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          ></div>
          <div 
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          ></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium tracking-wider uppercase">Since 2020</span>
              <Sparkles className="h-5 w-5" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extralight tracking-tight text-slate-900 leading-none">
              <span className="block">Precision</span>
              <span className="block bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent font-light">
                Engineering
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
              Specializing in Tesla Model 3 and Y components since 2020. 
              <br className="hidden md:block" />
              <span className="text-slate-400">Where precision meets performance in Kamloops, BC.</span>
            </p>
            
            <div className="pt-12">
              <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-extralight text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-slate-900 mb-4 tracking-tight">
              Our Expertise
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Comprehensive Tesla solutions from precision parts to complete vehicles
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Tesla Parts & Service */}
            <div className="group relative bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="h-5 w-5 text-emerald-500" />
              </div>
              
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-light text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors duration-300">
                Tesla Parts & Service
              </h3>
              
              <p className="text-slate-600 leading-relaxed mb-8 font-light">
                Premium OEM and aftermarket components for Tesla Model 3 and Y (2017-2025). 
                Expert installation and maintenance by certified technicians who understand 
                the precision these vehicles demand.
              </p>
              
              <a href="/" className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors group/link">
                Explore Parts
                <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Vehicle Sales */}
            <div className="group relative bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="h-5 w-5 text-cyan-500" />
              </div>
              
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-cyan-600" />
              </div>
              
              <h3 className="text-2xl font-light text-slate-900 mb-6 group-hover:text-cyan-600 transition-colors duration-300">
                Vehicle Sales
              </h3>
              
              <p className="text-slate-600 leading-relaxed mb-8 font-light">
                Curated Tesla vehicles available at{' '}
                <span className="text-slate-900 font-medium">cars.theevstore.ca</span>. 
                Each vehicle undergoes comprehensive inspection to meet our exacting standards 
                for quality and performance.
              </p>
              
              <a 
                href="https://cars.theevstore.ca" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-cyan-600 font-medium hover:text-cyan-700 transition-colors group/link"
              >
                Browse Inventory
                <ExternalLink className="ml-2 h-4 w-4 group-hover/link:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company Portfolio */}
      <section className="py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-slate-900 mb-4 tracking-tight">
              Business Family
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Part of a diversified portfolio serving Kamloops with excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {companies.map((company, index) => (
              <div 
                key={company.name}
                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-1"
              >
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
                
                <div className="mb-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                    {company.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  {company.name}
                </h3>
                
                <p className="text-slate-600 mb-6 leading-relaxed font-light">
                  {company.description}
                </p>
                
                <a 
                  href={`https://${company.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-slate-500 hover:text-slate-700 text-sm transition-colors group/link"
                >
                  {company.url}
                  <ExternalLink className="ml-2 h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium tracking-wider uppercase">Experience Excellence</span>
              <Sparkles className="h-5 w-5" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extralight text-slate-900 mb-6 tracking-tight">
              Discover Precision
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Why Tesla owners choose The EV Store for premium parts, expert service, and quality vehicles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <a 
                href="/"
                className="group relative overflow-hidden px-8 py-4 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/25"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Shop Tesla Parts
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </a>
              
              <a 
                href="https://cars.theevstore.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-slate-300 text-slate-700 font-medium rounded-full hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 inline-flex items-center justify-center"
              >
                Browse Vehicles
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;