import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { FileText, Shield, Clock, TrendingUp } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="home-page">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-[#1A1A1A] mb-6"
                data-testid="hero-heading"
              >
                Professional Tax Filing Made Simple
              </h1>
              <p className="text-base leading-relaxed text-[#5C5C5C] mb-8 max-w-2xl">
                Expert tax preparation services for individuals and businesses. Secure, efficient, and hassle-free filing with personalized support every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-[#C86B53] text-white hover:bg-[#D87B63] px-8 py-6 text-lg h-auto"
                  data-testid="hero-get-started-button"
                >
                  Get Started Today
                </Button>
                <Button
                  onClick={() => navigate('/services')}
                  variant="outline"
                  className="border-[#123524] text-[#123524] hover:bg-[#123524] hover:text-white px-8 py-6 text-lg h-auto"
                  data-testid="hero-learn-more-button"
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative rounded-md overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/7108269/pexels-photo-7108269.jpeg"
                  alt="Professional office environment"
                  className="w-full h-auto"
                  data-testid="hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#F1EDE4]" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-center text-[#1A1A1A] mb-16">
            Why Choose TaxFile Pro?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="feature-card-accuracy">
              <div className="w-12 h-12 bg-[#123524] rounded-md flex items-center justify-center mb-4">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Accurate Filing
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Expert review ensures maximum refunds and zero errors
              </p>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="feature-card-secure">
              <div className="w-12 h-12 bg-[#123524] rounded-md flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Secure Platform
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Bank-level encryption protects your sensitive financial data
              </p>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="feature-card-fast">
              <div className="w-12 h-12 bg-[#123524] rounded-md flex items-center justify-center mb-4">
                <Clock className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Fast Processing
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Quick turnaround time with real-time status updates
              </p>
            </div>

            <div className="bg-white p-8 rounded-md border border-black/5" data-testid="feature-card-maximize">
              <div className="w-12 h-12 bg-[#123524] rounded-md flex items-center justify-center mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl tracking-tight text-[#1A1A1A] mb-3">
                Maximize Refunds
              </h3>
              <p className="text-sm text-[#5C5C5C]">
                Find every deduction and credit you deserve
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#123524]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white mb-6">
            Ready to Simplify Your Tax Filing?
          </h2>
          <p className="text-base text-white/80 mb-8">
            Join thousands of satisfied clients who trust us with their taxes
          </p>
          <Button
            onClick={() => navigate('/register')}
            className="bg-[#C86B53] text-white hover:bg-[#D87B63] px-8 py-6 text-lg h-auto"
            data-testid="cta-button"
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
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