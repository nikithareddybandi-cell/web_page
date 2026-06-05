import React from 'react';
import { Navbar } from '../components/Navbar';

export const About = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="about-page">
      <Navbar />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-[#1A1A1A] mb-6">
                About TaxFile Pro
              </h1>
              <p className="text-base leading-relaxed text-[#5C5C5C] mb-6">
                Founded by tax professionals with over 25 years of combined experience, TaxFile Pro was created to simplify the complex world of tax filing for individuals and businesses alike.
              </p>
              <p className="text-base leading-relaxed text-[#5C5C5C] mb-6">
                We understand that tax season can be stressful. That's why we've built a platform that combines cutting-edge technology with personalized expert support to make your filing experience smooth and worry-free.
              </p>
              <p className="text-base leading-relaxed text-[#5C5C5C]">
                Our mission is to empower every client to achieve financial confidence through accurate, timely, and strategic tax filing services.
              </p>
            </div>

            <div>
              <img
                src="https://images.pexels.com/photos/12903168/pexels-photo-12903168.jpeg"
                alt="Professional team collaboration"
                className="w-full rounded-md shadow-lg"
                data-testid="about-team-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F1EDE4]" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-center text-[#1A1A1A] mb-16">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-md border border-black/5">
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Integrity
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                We operate with transparency and honesty in every interaction, ensuring your trust is never compromised.
              </p>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5">
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Excellence
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Our commitment to quality means double-checking every detail to deliver flawless results.
              </p>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5">
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Client-First
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Your financial success is our priority. We tailor our services to meet your unique needs.
              </p>
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