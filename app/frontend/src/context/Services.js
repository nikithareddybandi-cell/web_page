import React from 'react';
import { Navbar } from '../components/Navbar';
import { CheckCircle2 } from 'lucide-react';

export const Services = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="services-page">
      <Navbar />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-[#1A1A1A] mb-6">
              Our Services
            </h1>
            <p className="text-base leading-relaxed text-[#5C5C5C] max-w-3xl mx-auto">
              Comprehensive tax solutions tailored to your specific needs, whether you're an individual, small business, or large corporation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="service-individual">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://images.pexels.com/photos/7947661/pexels-photo-7947661.jpeg"
                  alt="Individual tax filing"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-4">
                Individual Tax Filing
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Personal income tax returns</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Itemized deductions optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Investment income reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Tax credit identification</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="service-business">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src="https://images.pexels.com/photos/7108269/pexels-photo-7108269.jpeg"
                  alt="Business tax services"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-4">
                Business Tax Services
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Corporate tax preparation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Quarterly estimated tax planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Payroll tax compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">State and local tax filings</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="service-planning">
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-4">
                Tax Planning & Advisory
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Strategic tax reduction planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Retirement account strategies</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Estate and gift tax planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Multi-year tax projections</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="service-support">
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-4">
                Audit Support & Resolution
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">IRS audit representation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Notice and letter response</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Payment plan negotiation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#2D6A4F] mt-1 flex-shrink-0" size={20} />
                  <span className="text-sm text-[#5C5C5C]">Back tax filing assistance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#FDFBF7] border-t border-black/5" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-[#5C5C5C]">
            © 2024 TaxFile Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};