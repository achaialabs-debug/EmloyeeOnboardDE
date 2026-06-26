import React, { useState } from 'react';
import { supabase, isSupabaseReady } from '../supabase';
import { 
  ArrowRight, ArrowLeft, Upload, Check, AlertCircle, 
  Award, Loader2, Hammer, BookOpen, User, Briefcase, Landmark, Copy
} from 'lucide-react';

interface FormData {
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  mobile: string;
  bloodGroup: string;
  maritalStatus: string;
  currentAddress: string;
  
  // Skilled specific fields
  skillCategory: 'iti' | 'polytechnic';
  trade: string;
  experienceYears: string;
  expectedWage: string;
  
  // ID and Bank details
  aadharNumber: string;
  panNumber: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  
  // Documents
  photo: string;
  aadharFront: string;
  aadharBack: string;
  bankPassbook: string;
}

interface RegistrationWizardProps {
  setPage: (page: string) => void;
  setSuccessData: (data: any) => void;
}

const initialFormState: FormData = {
  fullName: '',
  fatherName: '',
  dob: '',
  gender: 'Male',
  mobile: '',
  bloodGroup: '',
  maritalStatus: 'Single',
  currentAddress: '',
  
  skillCategory: 'iti',
  trade: '',
  experienceYears: '0',
  expectedWage: '',
  
  aadharNumber: '',
  panNumber: '',
  bankName: '',
  bankAccount: '',
  bankIfsc: '',
  
  photo: '',
  aadharFront: '',
  aadharBack: '',
  bankPassbook: '',
};

// Canvas image compressor helper
const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ setPage, setSuccessData }) => {
  // formType: null (selection screen) | 'skilled' | 'unskilled'
  const [formType, setFormType] = useState<'skilled' | 'unskilled' | null>(null);
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [compressionStatus, setCompressionStatus] = useState<{[key: string]: string}>({});
  
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [submittedCandidateData, setSubmittedCandidateData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const itiTrades = [
    'Electrician (इलेक्ट्रीशियन)',
    'Fitter (फ़िटर)',
    'Welder (वेल्डर)',
    'Plumber (प्लम्बर)',
    'Carpenter (बढ़ई)',
    'Machinist / Turner (मशीनिस्ट/टर्नर)',
    'Surveyor / Civil Draftsman (सर्वेयर)',
    'JCB / Heavy Vehicle Driver (भारी वाहन चालक)',
    'Wireman (वायरमैन)'
  ];

  const polytechnicTrades = [
    'Civil Engineering Diploma (सिविल डिप्लोमा)',
    'Electrical Engineering Diploma (इलेक्ट्रिकल डिप्लोमा)',
    'Mechanical Engineering Diploma (मैकेनिक डिप्लोमा)',
    'Site Supervisor / Foreman (साइट सुपरवाइजर)',
    'Safety Officer (सुरक्षा अधिकारी)',
    'CAD Draftsman / Estimator (CAD ड्राफ्ट्समैन)'
  ];

  const unskilledTrades = [
    'Construction Helper / Beldar (निर्माण सहायक)',
    'Loader / Unloader (बोझा उठाने वाला)',
    'Sweeper / Cleaner (सफाई कर्मी)',
    'Security Guard (सुरक्षा गार्ड)',
    'Store Helper / Runner (स्टोर हेल्पर)'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressionStatus(prev => ({ ...prev, [fieldName]: 'Compressing...' }));

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const rawBase64 = reader.result as string;
        const compressedBase64 = await compressImage(rawBase64);
        
        const originalSizeKB = Math.round(rawBase64.length * 0.75 / 1024);
        const compressedSizeKB = Math.round(compressedBase64.length * 0.75 / 1024);
        
        setFormData((prev) => ({
          ...prev,
          [fieldName]: compressedBase64,
        }));
        setCompressionStatus(prev => ({ 
          ...prev, 
          [fieldName]: `Ready • Compressed (${originalSizeKB}KB ➜ ${compressedSizeKB}KB)` 
        }));
      } catch (err) {
        console.error("Compression failed:", err);
        setCompressionStatus(prev => ({ ...prev, [fieldName]: 'Error' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    setErrorMsg('');
    if (formType === 'skilled') {
      if (step === 1) {
        if (!formData.fullName.trim()) return fail('Full Name is required. (पूरा नाम आवश्यक है)');
        if (!formData.mobile.trim() || formData.mobile.length < 10) return fail('Valid 10-digit Mobile is required. (सही 10 अंकों का मोबाइल नंबर आवश्यक है)');
        if (!formData.bloodGroup) return fail('Blood group is required for safety. (सुरक्षा के लिए रक्त समूह आवश्यक है)');
      } else if (step === 2) {
        if (!formData.trade) return fail('Please select your specialty trade. (कृपया अपना ट्रेड चुनें)');
        if (!formData.expectedWage.trim()) return fail('Please enter your expected wages. (कृपया अपना अपेक्षित वेतन दर्ज करें)');
      } else {
        if (!formData.aadharNumber.trim() || formData.aadharNumber.length !== 12) return fail('Valid 12-digit Aadhar is required. (सही 12 अंकों का आधार नंबर आवश्यक है)');
        if (!formData.bankAccount.trim()) return fail('Bank Account number is required. (बैंक खाता संख्या आवश्यक है)');
        if (!formData.bankIfsc.trim() || formData.bankIfsc.length !== 11) return fail('Valid 11-character IFSC is required. (सही 11 अंकों का IFSC कोड आवश्यक है)');
      }
    } else { // Unskilled Flow
      if (step === 1) {
        if (!formData.fullName.trim()) return fail('Full Name is required. (पूरा नाम आवश्यक है)');
        if (!formData.mobile.trim() || formData.mobile.length < 10) return fail('Valid 10-digit Mobile is required. (सही 10 अंकों का मोबाइल नंबर आवश्यक है)');
        if (!formData.trade) return fail('Please choose a labor trade. (कृपया काम का प्रकार चुनें)');
        if (!formData.expectedWage.trim()) return fail('Please enter expected daily wages. (कृपया दैनिक वेतन दर्ज करें)');
        if (!formData.bloodGroup) return fail('Blood group is required. (रक्त समूह आवश्यक है)');
      } else {
        if (!formData.aadharNumber.trim() || formData.aadharNumber.length !== 12) return fail('Valid 12-digit Aadhar is required. (सही 12 अंकों का आधार नंबर आवश्यक है)');
        if (!formData.bankAccount.trim()) return fail('Bank Account number is required. (बैंक खाता संख्या आवश्यक है)');
        if (!formData.bankIfsc.trim() || formData.bankIfsc.length !== 11) return fail('Valid 11-character IFSC is required. (सही 11 अंकों का IFSC कोड आवश्यक है)');
      }
    }
    return true;
  };

  const fail = (msg: string) => {
    setErrorMsg(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const regId = 'DEG-' + Math.floor(100000 + Math.random() * 900000);
      const submissionData = {
        registration_id: regId,
        full_name: formData.fullName,
        father_name: formData.fatherName || 'N/A',
        dob: formData.dob || new Date().toISOString().split('T')[0],
        gender: formData.gender,
        mobile: formData.mobile,
        blood_group: formData.bloodGroup,
        marital_status: formData.maritalStatus,
        current_address: formData.currentAddress || 'Bihar',
        permanent_address: formData.currentAddress || 'Bihar',
        
        skill_category: formType === 'unskilled' ? 'unskilled' : formData.skillCategory,
        trade: formData.trade,
        experience_years: formType === 'unskilled' ? 0 : (parseInt(formData.experienceYears, 10) || 0),
        expected_wage: formData.expectedWage,
        preferred_location: 'N/A', // Set a default database fallback silently to avoid constraint error
        
        aadhar_number: formData.aadharNumber,
        pan_number: formData.panNumber || null,
        bank_name: formData.bankName || 'N/A',
        bank_account: formData.bankAccount,
        bank_ifsc: formData.bankIfsc.toUpperCase(),
        
        photo_url: formData.photo || null,
        aadhar_front_url: formData.aadharFront || null,
        aadhar_back_url: formData.aadharBack || null,
        bank_passbook_url: formData.bankPassbook || null,
        
        status: 'pending',
        created_at: new Date().toISOString()
      };

      if (isSupabaseReady) {
        const { error } = await supabase
          .from('candidates')
          .insert([submissionData]);
        
        if (error) {
          console.warn("Supabase insert error, falling back to local storage...", error);
          saveToLocalStorage(submissionData);
        }
      } else {
        saveToLocalStorage(submissionData);
      }

      setSubmittedCandidateData({
        registrationId: regId,
        fullName: formData.fullName,
        trade: formData.trade,
        mobile: formData.mobile,
        skillCategory: formType === 'unskilled' ? 'unskilled' : formData.skillCategory
      });
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to submit registration. (सबमिट करने में विफलता)");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToLocalStorage = (data: any) => {
    const list = JSON.parse(localStorage.getItem('deg_candidates') || '[]');
    list.push(data);
    localStorage.setItem('deg_candidates', JSON.stringify(list));
  };

  // If no selection has been made, render category selection screen
  if (!formType) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-10 w-full">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboarding Portal</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
            Select Your Placement Path (अपनी श्रेणी चुनें)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {/* Skilled Path */}
          <button
            onClick={() => {
              setFormType('skilled');
              setStep(1);
            }}
            className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-900 shadow-xs flex flex-col items-center text-center cursor-pointer transition-all duration-350 transform hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="p-5 bg-gray-50 text-gray-700 rounded-2xl border border-gray-100 mb-6 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors duration-300">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Skilled Technician</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">ITI Certified Trades & Polytechnic Diploma Holders</p>
            <p className="text-[10px] text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg mt-4 border border-gray-100 group-hover:bg-gray-100/50">
              कुशल कारीगर और डिप्लोमा धारक
            </p>
          </button>

          {/* Unskilled Path */}
          <button
            onClick={() => {
              setFormType('unskilled');
              setStep(1);
            }}
            className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-900 shadow-xs flex flex-col items-center text-center cursor-pointer transition-all duration-355 transform hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="p-5 bg-gray-50 text-gray-700 rounded-2xl border border-gray-100 mb-6 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors duration-300">
              <Hammer className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">General Helpers</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Helpers, Loaders, Cleaners & Security Guards</p>
            <p className="text-[10px] text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg mt-4 border border-gray-100 group-hover:bg-gray-100/50">
              अकुशल मजदूर और सहायक
            </p>
          </button>
        </div>
      </div>
    );
  }

  const maxSteps = formType === 'skilled' ? 3 : 2;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 w-full flex-grow space-y-6">
      
      {/* Dynamic MNC Style Wizard Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-lg font-extrabold text-gray-900">
            {formType === 'skilled' ? 'Skilled Candidate Onboarding' : 'General Helper Onboarding'}
          </h2>
          <p className="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-wider">
            {formType === 'skilled' ? 'Technical Stream' : 'Helper Support Stream'}
          </p>
        </div>
        <button 
          type="button"
          onClick={() => {
            setFormType(null);
            setFormData(initialFormState);
            setStep(1);
          }}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          Change Track
        </button>
      </div>

      {/* Progress Steps Timeline */}
      <div className="bg-white rounded-2xl px-8 py-6 shadow-xs border border-gray-150 flex items-center justify-between text-xs font-bold relative overflow-hidden">
        
        {/* Progress Background Line */}
        <div className="absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        
        {/* Dynamic Highlight Line */}
        <div 
          className="absolute top-1/2 left-[12%] h-0.5 bg-gray-900 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ 
            width: `${((step - 1) / (maxSteps - 1)) * 76}%` 
          }}
        />

        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center space-y-1.5">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-all duration-350 ${
            step > 1 
              ? 'bg-gray-900 border-gray-900 text-white' 
              : step === 1 
              ? 'bg-white border-gray-900 text-gray-900 shadow-xs' 
              : 'bg-white border-gray-200 text-gray-300'
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className={step === 1 ? 'text-gray-900' : 'text-gray-400 font-semibold'}>Profile</span>
        </div>

        {/* Step 2 (Only render for skilled or render as step 2 for both) */}
        {formType === 'skilled' ? (
          <div className="relative z-10 flex flex-col items-center space-y-1.5">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-all duration-350 ${
              step > 2 
                ? 'bg-gray-900 border-gray-900 text-white' 
                : step === 2 
                ? 'bg-white border-gray-900 text-gray-900 shadow-xs' 
                : 'bg-white border-gray-200 text-gray-300'
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={step === 2 ? 'text-gray-900' : 'text-gray-400 font-semibold'}>Specialty</span>
          </div>
        ) : null}

        {/* Last Step */}
        <div className="relative z-10 flex flex-col items-center space-y-1.5">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-all duration-350 ${
            step === maxSteps 
              ? 'bg-white border-gray-900 text-gray-900 shadow-xs' 
              : 'bg-white border-gray-200 text-gray-300'
          }`}>
            {maxSteps === 3 ? '3' : '2'}
          </div>
          <span className={step === maxSteps ? 'text-gray-900' : 'text-gray-400 font-semibold'}>Credentials</span>
        </div>

      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-md">
        
        {errorMsg && (
          <div className="mb-6 bg-red-50/50 border border-red-200 p-4 rounded-2xl flex items-start space-x-3 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* ==================== SKILLED FLOW ==================== */}
          {formType === 'skilled' && (
            <>
              {/* Step 1: Personal Profile */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Personal Profile (व्यक्तिगत जानकारी)</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Full Name (पूरा नाम) *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Father's / Husband's Name (पिता/पति का नाम)</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder="e.g. Mohan Sharma"
                      className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Mobile Number (मोबाइल नंबर) *</label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({ ...prev, mobile: val }));
                        }}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Blood Group (रक्त समूह) *</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none bg-white"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Date of Birth (जन्म तिथि)</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Gender (लिंग)</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Qualification & Trade */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span>Skills & Trade Profile (योग्यता विवरण)</span>
                  </h3>

                  {/* Qualification Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Technical Qualification *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, skillCategory: 'iti', trade: '' }))}
                        className={`p-4.5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                          formData.skillCategory === 'iti'
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                            : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <Award className="w-5 h-5 mb-1.5" />
                        <span className="font-extrabold text-xs">ITI Certified Trade</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, skillCategory: 'polytechnic', trade: '' }))}
                        className={`p-4.5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                          formData.skillCategory === 'polytechnic'
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                            : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <BookOpen className="w-5 h-5 mb-1.5" />
                        <span className="font-extrabold text-xs">Polytechnic Diploma</span>
                      </button>
                    </div>
                  </div>

                  {/* Specialty selector & Expected Wages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Choose Specialty Trade *</label>
                      <select
                        name="trade"
                        value={formData.trade}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none bg-white"
                        required
                      >
                        <option value="">-- Choose Trade --</option>
                        {formData.skillCategory === 'iti' && itiTrades.map((t) => <option key={t} value={t}>{t}</option>)}
                        {formData.skillCategory === 'polytechnic' && polytechnicTrades.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Expected Salary / Wages *</label>
                      <input
                        type="text"
                        name="expectedWage"
                        value={formData.expectedWage}
                        onChange={handleChange}
                        placeholder="e.g. ₹500/day or ₹18,000/month"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Experience & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Experience (Years)</label>
                      <input
                        type="number"
                        name="experienceYears"
                        min={0}
                        value={formData.experienceYears}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Current Address (पता)</label>
                      <input
                        type="text"
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleChange}
                        placeholder="Village, PO, Block, District"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Identity & Bank & Credentials */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-gray-500" />
                    <span>Identity Verification & Bank Details</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Aadhar Number (12 Digits) *</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      maxLength={12}
                      value={formData.aadharNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData((prev) => ({ ...prev, aadharNumber: val }));
                      }}
                      placeholder="0000 0000 0000"
                      className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-bold tracking-widest transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bank Account for Payouts (बैंक विवरण)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-extrabold text-gray-400 uppercase block mb-1">Account Number *</label>
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData((prev) => ({ ...prev, bankAccount: val }));
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-lg text-xs font-semibold outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-extrabold text-gray-400 uppercase block mb-1">IFSC Code *</label>
                        <input
                          type="text"
                          name="bankIfsc"
                          maxLength={11}
                          value={formData.bankIfsc.toUpperCase()}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-lg text-xs font-semibold uppercase tracking-widest outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload Grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Passport Photo */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Passport Photo (पासपोर्ट फोटो)</span>
                      {compressionStatus.photo && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.photo}</span>}
                      {formData.photo ? (
                        <div className="relative">
                          <img src={formData.photo} alt="Photo" className="w-16 h-16 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, photo: '' })); setCompressionStatus(prev => ({ ...prev, photo: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Aadhar Front */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Aadhar Front (आधार फ्रंट)</span>
                      {compressionStatus.aadharFront && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.aadharFront}</span>}
                      {formData.aadharFront ? (
                        <div className="relative">
                          <img src={formData.aadharFront} alt="Aadhar" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, aadharFront: '' })); setCompressionStatus(prev => ({ ...prev, aadharFront: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Aadhar Back */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Aadhar Back (आधार बैक)</span>
                      {compressionStatus.aadharBack && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.aadharBack}</span>}
                      {formData.aadharBack ? (
                        <div className="relative">
                          <img src={formData.aadharBack} alt="Aadhar Back" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, aadharBack: '' })); setCompressionStatus(prev => ({ ...prev, aadharBack: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Bank Passbook */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Bank Passbook / Cheque (पासबुक/चेक)</span>
                      {compressionStatus.bankPassbook && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.bankPassbook}</span>}
                      {formData.bankPassbook ? (
                        <div className="relative">
                          <img src={formData.bankPassbook} alt="Bank Passbook" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, bankPassbook: '' })); setCompressionStatus(prev => ({ ...prev, bankPassbook: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'bankPassbook')} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== UNSKILLED FLOW ==================== */}
          {formType === 'unskilled' && (
            <>
              {/* Step 1: Personal & Labor Job Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Helper Profile Details (मजदूर विवरण)</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Full Name (पूरा नाम) *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Father's Name (पिता का नाम)</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="e.g. Suresh Kumar"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Mobile Number (मोबाइल) *</label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({ ...prev, mobile: val }));
                        }}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Choose Labor Work *</label>
                      <select
                        name="trade"
                        value={formData.trade}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none bg-white"
                        required
                      >
                        <option value="">-- Choose Job --</option>
                        {unskilledTrades.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Expected Daily Wage (मजदूरी) *</label>
                      <input
                        type="text"
                        name="expectedWage"
                        value={formData.expectedWage}
                        onChange={handleChange}
                        placeholder="जैसे: ₹400/दिन या ₹450/दिन"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Blood Group *</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none bg-white"
                        required
                      >
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Current Address (घर का पता)</label>
                      <input
                        type="text"
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleChange}
                        placeholder="Village, PO, District, State"
                        className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-medium tracking-wide transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Verification Details & Photo Upload */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2.5 flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-gray-500" />
                    <span>Identity Card & Bank Details</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Aadhar Number (आधार नंबर) *</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      maxLength={12}
                      value={formData.aadharNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData((prev) => ({ ...prev, aadharNumber: val }));
                      }}
                      placeholder="0000 0000 0000"
                      className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-xl text-sm font-bold tracking-widest transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Wages Bank details (बैंक खाता)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-extrabold text-gray-400 uppercase block mb-1">Account Number *</label>
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData((prev) => ({ ...prev, bankAccount: val }));
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-lg text-xs font-semibold outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-extrabold text-gray-400 uppercase block mb-1">IFSC Code *</label>
                        <input
                          type="text"
                          name="bankIfsc"
                          maxLength={11}
                          value={formData.bankIfsc.toUpperCase()}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-gray-950 focus:ring-4 focus:ring-gray-150 rounded-lg text-xs font-semibold uppercase tracking-widest outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload Grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Passport Photo */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Passport Photo (पासपोर्ट फोटो)</span>
                      {compressionStatus.photo && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.photo}</span>}
                      {formData.photo ? (
                        <div className="relative">
                          <img src={formData.photo} alt="Photo" className="w-16 h-16 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, photo: '' })); setCompressionStatus(prev => ({ ...prev, photo: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Aadhar Front */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Aadhar Front (आधार फ्रंट)</span>
                      {compressionStatus.aadharFront && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.aadharFront}</span>}
                      {formData.aadharFront ? (
                        <div className="relative">
                          <img src={formData.aadharFront} alt="Aadhar Front" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, aadharFront: '' })); setCompressionStatus(prev => ({ ...prev, aadharFront: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Aadhar Back */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Aadhar Back (आधार बैक)</span>
                      {compressionStatus.aadharBack && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.aadharBack}</span>}
                      {formData.aadharBack ? (
                        <div className="relative">
                          <img src={formData.aadharBack} alt="Aadhar Back" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, aadharBack: '' })); setCompressionStatus(prev => ({ ...prev, aadharBack: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack')} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Bank Passbook */}
                    <div className="border border-dashed border-gray-200 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/20 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs font-extrabold text-gray-700">Bank Passbook / Cheque (पासबुक/चेक)</span>
                      {compressionStatus.bankPassbook && <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{compressionStatus.bankPassbook}</span>}
                      {formData.bankPassbook ? (
                        <div className="relative">
                          <img src={formData.bankPassbook} alt="Bank Passbook" className="w-20 h-12 object-cover rounded-xl border" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, bankPassbook: '' })); setCompressionStatus(prev => ({ ...prev, bankPassbook: '' })); }} className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-[10px] font-bold text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Choose File</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'bankPassbook')} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-8 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold flex items-center space-x-2 text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back (पीछे जाएं)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFormType(null)}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 px-5 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < maxSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 text-xs transition-colors shadow-xs ml-auto cursor-pointer"
              >
                <span>Next Step (आगे बढ़ें)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-extrabold flex items-center justify-center space-x-2 text-xs transition-colors shadow-sm disabled:opacity-50 ml-auto cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Onboarding (दर्ज करें)</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Success Popup Modal */}
      {showSuccessPopup && submittedCandidateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-150 shadow-2xl relative overflow-hidden transform scale-100 transition-all">
            {/* Card Watermark */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full flex items-center justify-center font-extrabold text-gray-900/5 select-none text-2xl">
              DEG
            </div>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 shadow-xs">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Registration Successful!</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">पंजीकरण सफलतापूर्वक पूरा हुआ</p>
              </div>
            </div>

            {/* Candidate Info Summary Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4 text-xs font-semibold text-left">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-150">
                <span className="text-[9px] uppercase font-bold text-gray-400">Registration ID</span>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-gray-950 tracking-wider text-sm">{submittedCandidateData.registrationId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(submittedCandidateData.registrationId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-950 transition-colors cursor-pointer"
                    title="Copy ID"
                  >
                    {copied ? (
                      <span className="text-[9px] text-emerald-600 font-bold uppercase">Copied!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Candidate Name</span>
                  <span className="font-bold text-gray-900">{submittedCandidateData.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Mobile</span>
                  <span className="font-bold text-gray-900">{submittedCandidateData.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Assigned Trade</span>
                  <span className="font-bold text-gray-900">{submittedCandidateData.trade}</span>
                </div>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-[10px] text-gray-500 font-semibold text-center mt-5 leading-normal">
              Your profile has been saved. Please proceed to view and download your official employment registration slip.
            </p>

            {/* Actions */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSuccessData(submittedCandidateData);
                  setPage('success');
                }}
                className="w-full bg-gray-950 hover:bg-gray-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-xs"
              >
                <span>View & Print Slip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationWizard;
