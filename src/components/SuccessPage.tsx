import React from 'react';
import { CheckCircle, Printer, MessageSquare, Home } from 'lucide-react';

interface SuccessPageProps {
  successData: {
    registrationId: string;
    fullName: string;
    trade: string;
    mobile: string;
    skillCategory: string;
  } | null;
  setPage: (page: string) => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ successData, setPage }) => {
  const candidate = successData || {
    registrationId: 'DEG-JOB-88888',
    fullName: 'Guest Candidate',
    trade: 'General Laborer',
    mobile: '9999999999',
    skillCategory: 'unskilled'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-20 w-full flex-grow flex flex-col justify-center items-center">
      {/* Success Info (hidden during printing) */}
      <div className="print:hidden flex flex-col items-center text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-550 shadow-xs">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Registration Complete
        </h1>
        <p className="text-xs font-medium text-gray-400 max-w-sm">
          Your profile has been saved in the Divine Enterprises Group system database.
        </p>
      </div>

      {/* Printable Receipt Slip Card */}
      <div 
        id="registration-slip" 
        className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg w-full relative overflow-hidden"
      >
        {/* Card Watermark */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full flex items-center justify-center font-extrabold text-gray-900/5 select-none text-2xl">
          DEG
        </div>

        {/* Slip Header */}
        <div className="text-center pb-6 border-b border-dashed border-gray-200 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-gray-900 font-extrabold text-base tracking-tight">
            <img 
              src="https://www.divineenterprisesgroup.in/images/icon.webp" 
              alt="Logo" 
              className="w-7 h-7"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png';
              }}
            />
            <span className="uppercase text-sm tracking-wide">DIVINE ENTERPRISES GROUP</span>
          </div>
          <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
            Employment Registration Slip
          </p>
        </div>

        {/* Slip Content */}
        <div className="py-6 space-y-4 text-xs text-gray-600 font-medium text-left">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Registration ID:</span>
            <span className="font-extrabold text-gray-900 tracking-widest text-base">{candidate.registrationId}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-450 block">Worker Name:</span>
              <span className="font-bold text-gray-900 text-sm">{candidate.fullName}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-450 block">Mobile:</span>
              <span className="font-bold text-gray-900 text-sm">{candidate.mobile}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-450 block">Skill Stream:</span>
              <span className="font-bold text-gray-900 capitalize text-sm">{candidate.skillCategory}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-450 block">Assigned Trade:</span>
              <span className="font-bold text-gray-900 text-sm">{candidate.trade}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[9px] uppercase font-bold text-gray-450 block font-bold">Registered On:</span>
            <span className="text-xs font-extrabold text-gray-900">
              {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center space-y-1">
          <p className="text-[10px] font-bold text-gray-505 uppercase tracking-wider">Instructions to Candidate:</p>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Report to the nearest Divine Enterprises Group regional office or WhatsApp this slip to coordinate your site deployment order.
          </p>
        </div>
      </div>

      {/* Control Buttons (hidden during printing) */}
      <div className="print:hidden w-full space-y-4 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handlePrint}
            className="bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors cursor-pointer text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => setPage('landing')}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
          <div className="flex items-start space-x-3 text-emerald-850">
            <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-emerald-900">Fast Deployment Coordination</h4>
              <p className="text-[11px] font-semibold text-emerald-700/90 leading-normal">
                WhatsApp your Registration ID **{candidate.registrationId}** directly to our site coordinator for rapid assignments.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/918228946314?text=Hi,%20I%20have%20registered%20on%20Divine%20Enterprises%20Jobs%20Portal.%20My%20Registration%20ID%20is%20${candidate.registrationId}.%20Please%20assign%20me%2520a%2520job%2520site.`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-650 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-xs text-center transition-colors"
          >
            <span>WhatsApp Coordinator</span>
          </a>
        </div>
      </div>

      {/* Print Specific Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #registration-slip {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 20px auto !important;
            width: 100% !important;
            max-width: 500px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;
