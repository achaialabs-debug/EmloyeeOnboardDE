import { Hammer, ArrowRight, PhoneCall, Briefcase, BookOpen, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  setPage: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setPage }) => {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 text-left space-y-8 z-10">
              <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-xs font-bold tracking-wide border border-gray-200/60 shadow-xs">
                <GraduationCap className="w-4 h-4 text-gray-600" />
                <span>ITI, Polytechnic & Technical Careers</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                Get Matched to Top <span className="text-gray-800 underline decoration-gray-300 decoration-wavy underline-offset-8">Technical & Skilled</span> Roles
              </h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed font-medium">
                Divine Enterprises Group connects NCVT/SCVT certified tradesmen, Polytechnic diploma engineers, and general loaders with leading industrial sites. Begin your professional onboarding.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => setPage('register')}
                  className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4.5 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer"
                >
                  <span>Apply for Job Placement</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-gray-100 max-w-lg">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">24-48 Hrs</h3>
                  <p className="text-xs text-gray-500 font-bold">Rapid Site Placement</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Compliant</h3>
                  <p className="text-xs text-gray-500 font-bold">ISO & Safety Standards</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Benefits</h3>
                  <p className="text-xs text-gray-500 font-bold">ESIC & EPF Coverage</p>
                </div>
              </div>
            </div>

            {/* Right Panel Card */}
            <div className="md:col-span-5 relative flex justify-center">
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-gray-100/60 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gray-100/60 rounded-full blur-3xl" />
              
              <div className="relative bg-white border border-gray-100 p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 text-gray-700 rounded-2xl border border-gray-100 shadow-sm">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Placement Gateway</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Divine Enterprises Group</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Segments</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 rounded-full bg-gray-900 mt-1.5" />
                      <div>
                        <strong className="text-xs font-bold text-gray-900 block">Polytechnic Diploma</strong>
                        <p className="text-[11px] text-gray-500 font-medium">Civil site engineers, safety coordinators, mechanical and electrical site leads</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 rounded-full bg-gray-500 mt-1.5" />
                      <div>
                        <strong className="text-xs font-bold text-gray-900 block">ITI Certified Trades</strong>
                        <p className="text-[11px] text-gray-500 font-medium">Certified fitters, electricians, welders, plumbers, heavy vehicle drivers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                      <div>
                        <strong className="text-xs font-bold text-gray-900 block">General Helpers</strong>
                        <p className="text-[11px] text-gray-500 font-medium">Warehouse loaders, construction helpers, safety guards, cleaning staff</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Tiers Grid */}
      <section className="bg-gray-50/50 py-24 border-y border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Structured Placement Tracks
            </h2>
            <p className="text-gray-500 font-medium text-base">
              We align applicant skills with specific job groups to guarantee correct salary standards and optimal site assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Channel 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Polytechnic Diploma</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                Specifically for diploma holders. Offers assignments in construction estimation, site supervision, safety compliance, foreman roles, and civil supervision.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 font-bold bg-gray-50 p-4 rounded-2xl">
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Civil / Electrical / Mechanical</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Site Supervisor & Safety Officers</span>
                </li>
              </ul>
            </div>

            {/* Channel 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ITI Certified Trades</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                NCVT or SCVT certified tradesmen. Direct assignments for electricians, fitters, welders, plumbers, and heavy equipment vehicle drivers.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 font-bold bg-gray-50 p-4 rounded-2xl">
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Electricians, Fitters & Welders</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Plumbers & JCB Vehicle Operators</span>
                </li>
              </ul>
            </div>

            {/* Channel 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 bg-gray-100 text-gray-900 border border-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
                <Hammer className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">General Helpers</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                General labor assistants and store runners. Rapid deployment orders, regular payout structures, and essential onsite safety kit materials.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 font-bold bg-gray-50 p-4 rounded-2xl">
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Loaders, Store Assistants & Beldars</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Accident Insurance Cover Standard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-14 h-14 bg-gray-50 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-xs">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Need Help with Registration?</h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto font-medium">
            If you encounter any issues while completing the online application form, you can contact our candidate helpline directly.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white border border-gray-100 px-6 py-4.5 rounded-2xl shadow-sm">
            <span className="font-bold text-gray-800 text-base">📞 Contact Support: +91 8228946314</span>
            <span className="hidden sm:inline text-gray-200">|</span>
            <a
              href="https://wa.me/918228946314?text=Hi,%20I%20need%20help%20with%20onboarding%20on%20Divine%20Enterprises"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
