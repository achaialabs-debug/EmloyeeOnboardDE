import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../supabase';
import { 
  Users, HardHat, CheckCircle, Clock, Search, Download, 
  ShieldAlert, Lock, Eye, X, BookOpen, GraduationCap 
} from 'lucide-react';

interface Candidate {
  id: string;
  registrationId: string;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  mobile: string;
  bloodGroup: string;
  maritalStatus: string;
  currentAddress: string;
  permanentAddress: string;
  
  skillCategory: string;
  trade: string;
  experienceYears: string;
  expectedWage: string;
  
  aadharNumber: string;
  panNumber: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  
  photo?: string;
  aadharFront?: string;
  aadharBack?: string;
  bankPassbook?: string;
  
  status: string;
  placementNotes?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Update states
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('deg_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchCandidates();
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsValidating(true);

    try {
      let isPinValid = false;

      if (isSupabaseReady) {
        // Query to check if the entered PIN matches the value in Supabase.
        // This does the comparison on the database server, so the actual PIN is never sent to the browser.
        const { data, error } = await supabase
          .from('admin_config')
          .select('key')
          .eq('key', 'admin_pin')
          .eq('value', pinInput);

        if (error) {
          console.error("Supabase auth check failed:", error);
          isPinValid = false;
        } else if (data && data.length > 0) {
          isPinValid = true;
        } else {
          isPinValid = false;
        }
      } else {
        isPinValid = false;
      }

      if (isPinValid) {
        sessionStorage.setItem('deg_admin_auth', 'true');
        setIsAuthenticated(true);
        fetchCandidates();
      } else {
        setPinError('Invalid Admin PIN. Please try again. (गलत पिन दर्ज किया गया है)');
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setPinError("Database validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      let dataList: any[] = [];
      let fetchSuccess = false;

      if (isSupabaseReady) {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn("Supabase fetch failed, falling back to local storage...", error);
        } else if (data) {
          dataList = data;
          fetchSuccess = true;
        }
      }

      if (!fetchSuccess) {
        dataList = JSON.parse(localStorage.getItem('deg_candidates') || '[]');
        // Sort descending by date
        dataList.sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
      }

      // Map DB snake_case key to camelCase props
      const parsedList: Candidate[] = dataList.map((row: any) => ({
        id: row.id || row.registration_id || Math.random().toString(),
        registrationId: row.registration_id || row.registrationId || 'N/A',
        fullName: row.full_name || row.fullName || 'N/A',
        fatherName: row.father_name || row.fatherName || '',
        dob: row.dob || '',
        gender: row.gender || '',
        mobile: row.mobile || '',
        bloodGroup: row.blood_group || row.bloodGroup || '',
        maritalStatus: row.marital_status || row.maritalStatus || '',
        currentAddress: row.current_address || row.currentAddress || '',
        permanentAddress: row.permanent_address || row.permanentAddress || '',
        skillCategory: row.skill_category || row.skillCategory || 'unskilled',
        trade: row.trade || '',
        experienceYears: String(row.experience_years ?? row.experienceYears ?? '0'),
        expectedWage: row.expected_wage || row.expectedWage || '',
        aadharNumber: row.aadhar_number || row.aadharNumber || '',
        panNumber: row.pan_number || row.panNumber || '',
        bankName: row.bank_name || row.bankName || '',
        bankAccount: row.bank_account || row.bankAccount || '',
        bankIfsc: row.bank_ifsc || row.bankIfsc || '',
        photo: row.photo_url || row.photo || '',
        aadharFront: row.aadhar_front_url || row.aadharFront || '',
        aadharBack: row.aadhar_back_url || row.aadharBack || '',
        bankPassbook: row.bank_passbook_url || row.bankPassbook || '',
        status: row.status || 'pending',
        placementNotes: row.placement_notes || row.placementNotes || '',
        createdAt: row.created_at || row.createdAt || new Date().toISOString()
      }));

      setCandidates(parsedList);
    } catch (err) {
      console.error("Error loading candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsUpdating(true);
    try {
      let updateSuccess = false;

      if (isSupabaseReady) {
        const { error } = await supabase
          .from('candidates')
          .update({
            status: updateStatus,
            placement_notes: updateNotes
          })
          .eq('registration_id', selectedCandidate.registrationId);

        if (error) {
          console.warn("Supabase update error, falling back to local storage...", error);
        } else {
          updateSuccess = true;
        }
      }

      if (!updateSuccess) {
        const list = JSON.parse(localStorage.getItem('deg_candidates') || '[]');
        const updatedList = list.map((item: any) => {
          if (item.registration_id === selectedCandidate.registrationId || item.registrationId === selectedCandidate.registrationId) {
            return {
              ...item,
              status: updateStatus,
              placement_notes: updateNotes,
              placementNotes: updateNotes
            };
          }
          return item;
        });
        localStorage.setItem('deg_candidates', JSON.stringify(updatedList));
      }

      // Update UI state
      setCandidates((prev) => 
          prev.map((c) => 
            c.registrationId === selectedCandidate.registrationId 
              ? { ...c, status: updateStatus, placementNotes: updateNotes } 
              : c
          )
      );

      setSelectedCandidate((prev) => 
        prev ? { ...prev, status: updateStatus, placementNotes: updateNotes } : null
      );
      
      alert("Placement status updated.");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) return;

    const headers = [
      'Registration ID', 'Full Name', 'Father Name', 'DOB', 'Gender', 'Mobile', 
      'Blood Group', 'Marital Status', 'Current Address', 'Permanent Address', 
      'Skill Category', 'Trade/Job', 'Experience Years', 'Expected Wage', 
      'Aadhar Number', 'PAN Number', 'Bank Name', 
      'Account Number', 'IFSC Code', 'Placement Status', 'Notes', 'Created At'
    ];

    const rows = filteredCandidates.map(c => [
      c.registrationId,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.fatherName.replace(/"/g, '""')}"`,
      c.dob,
      c.gender,
      c.mobile,
      c.bloodGroup,
      c.maritalStatus,
      `"${c.currentAddress.replace(/"/g, '""')}"`,
      `"${c.permanentAddress.replace(/"/g, '""')}"`,
      c.skillCategory,
      c.trade,
      c.experienceYears,
      `"${c.expectedWage.replace(/"/g, '""')}"`,
      `'${c.aadharNumber}`,
      c.panNumber || 'N/A',
      c.bankName,
      `'${c.bankAccount}`,
      c.bankIfsc,
      c.status,
      `"${(c.placementNotes || '').replace(/"/g, '""')}"`,
      c.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DEG_Candidates_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.aadharNumber.includes(searchQuery) ||
      c.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = skillFilter === 'all' || c.skillCategory === skillFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesSkill && matchesStatus;
  });

  const totalCount = candidates.length;
  const polytechnicCount = candidates.filter(c => c.skillCategory === 'polytechnic').length;
  const itiCount = candidates.filter(c => c.skillCategory === 'iti').length;
  const unskilledCount = candidates.filter(c => c.skillCategory === 'unskilled').length;
  const placedCount = candidates.filter(c => c.status === 'placed').length;
  const pendingCount = candidates.filter(c => c.status === 'pending').length;

  const openDetails = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setUpdateStatus(cand.status);
    setUpdateNotes(cand.placementNotes || '');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center px-6 py-24 flex-grow bg-gray-50 w-full">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-4">Recruiter Portal</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Divine Enterprises Group</p>
          </div>

          {pinError && (
            <div className="bg-red-50/50 border border-red-200 p-4 rounded-xl text-xs font-semibold text-red-700 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-left">Enter Recruiter PIN *</label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-gray-150 focus:border-gray-900 text-center text-2xl tracking-widest font-black transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isValidating ? 'Validating PIN...' : 'Unlock Dashboard'}
            </button>
          </form>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-medium">Database credentials are protected. Unauthorized entry logs are audited.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow space-y-8 text-left bg-gray-50/20">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recruiter Registry</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Manpower placements • Divine Enterprises Group
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Excel</span>
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            Applicants <Users className="w-4 h-4 text-gray-400" />
          </span>
          <p className="text-2xl font-black text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            Polytechnic <BookOpen className="w-4 h-4 text-gray-400" />
          </span>
          <p className="text-2xl font-black text-gray-900">{polytechnicCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            ITI Trades <GraduationCap className="w-4 h-4 text-gray-400" />
          </span>
          <p className="text-2xl font-black text-gray-900">{itiCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            Helpers <HardHat className="w-4 h-4 text-gray-400" />
          </span>
          <p className="text-2xl font-black text-gray-900">{unskilledCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            Placed <CheckCircle className="w-4 h-4 text-emerald-500" />
          </span>
          <p className="text-2xl font-black text-emerald-600">{placedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center justify-between">
            Pending <Clock className="w-4 h-4 text-amber-500" />
          </span>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by worker name, phone, aadhar, or trade..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 focus:bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:outline-none focus:border-gray-900"
          >
            <option value="all">All Stream Channels</option>
            <option value="iti">ITI Certified (कुशल आईटीआई)</option>
            <option value="polytechnic">Polytechnic (पॉलिटेक्निक)</option>
            <option value="unskilled">Unskilled Helper (अकुशल मजदूर)</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:outline-none focus:border-gray-900"
          >
            <option value="all">All Placements</option>
            <option value="pending">Pending</option>
            <option value="placed">Placed</option>
            <option value="interviewed">Interviewed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidate Listings table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Querying database registry...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-900">No applicant profiles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Reg ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Stream Group</th>
                  <th className="px-6 py-4">Trade specialty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Folder Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.registrationId}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{c.fullName}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{c.mobile}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-200">
                        {c.skillCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{c.trade}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase ${
                        c.status === 'placed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : c.status === 'interviewed'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetails(c)}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-[10px] font-extrabold transition-colors border border-gray-200 inline-flex items-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-550" />
                        <span>Open Folder</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Modal Overlay */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col">
            
            {/* Header */}
            <div className="px-8 py-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Candidate Profile Sheet</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registration ID: {selectedCandidate.registrationId}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 flex-grow">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Photo & Status Control */}
                <div className="md:col-span-4 space-y-6 text-center">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-gray-150 mx-auto shadow-xs bg-gray-50">
                    {selectedCandidate.photo ? (
                      <img src={selectedCandidate.photo} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase">
                        No Photo
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900">{selectedCandidate.fullName}</h3>
                  
                  {/* Status Updator */}
                  <form onSubmit={handleUpdateStatus} className="bg-gray-50 border border-gray-150 p-4.5 rounded-2xl text-left space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">
                      Update Placement Record
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-extrabold text-gray-400 block mb-0.5">Status</label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="placed">Placed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-extrabold text-gray-400 block mb-0.5">Placement Notes</label>
                      <textarea
                        value={updateNotes}
                        onChange={(e) => setUpdateNotes(e.target.value)}
                        rows={2}
                        placeholder="Log deployment details..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdating ? 'Saving...' : 'Update Record'}
                    </button>
                  </form>
                </div>

                {/* Right Profiles Detail */}
                <div className="md:col-span-8 space-y-6 text-left">
                  
                  {/* Personal details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-1.5">
                      Personal Details (व्यक्तिगत विवरण)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-xs font-medium">
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Father/Husband Name:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.fatherName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Date of Birth:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.dob || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Gender:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.gender || 'Male'}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Mobile Number:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.mobile}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Blood Group:</span>
                        <span className="font-extrabold text-red-650">{selectedCandidate.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Marital Status:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.maritalStatus || 'Single'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-1.5">
                      Job Preference & Qualifications (कौशल)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-xs font-medium">
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Skill Level:</span>
                        <span className="font-bold text-gray-900 capitalize">{selectedCandidate.skillCategory}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Trade:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.trade}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Experience:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.experienceYears} Years</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Expected Wage:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.expectedWage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-1.5">
                      Address Details (पते का विवरण)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Current Address:</span>
                        <p className="font-bold text-gray-900 leading-normal">{selectedCandidate.currentAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Permanent Address:</span>
                        <p className="font-bold text-gray-900 leading-normal">{selectedCandidate.permanentAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Identity & Bank details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-1.5">
                      Identity & Bank Details (पहचान और बैंक विवरण)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-xs font-medium">
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Aadhar Number:</span>
                        <span className="font-bold text-gray-900 tracking-wider">{selectedCandidate.aadharNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">PAN Number:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.panNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Bank Name:</span>
                        <span className="font-bold text-gray-900">{selectedCandidate.bankName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">Bank Account:</span>
                        <span className="font-bold text-gray-900 tracking-widest">{selectedCandidate.bankAccount}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block text-[9px] font-bold uppercase mb-0.5">IFSC Code:</span>
                        <span className="font-bold text-gray-900 uppercase tracking-widest">{selectedCandidate.bankIfsc}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Documents preview grid */}
              <div className="space-y-4 pt-8 border-t border-gray-100 text-left">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Uploaded Identity Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 text-center bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Aadhar Card Front</span>
                    {selectedCandidate.aadharFront ? (
                      <a href={selectedCandidate.aadharFront} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedCandidate.aadharFront} alt="Aadhar Front" className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity" />
                        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                          View Full Image
                        </span>
                      </a>
                    ) : (
                      <div className="h-32 bg-white flex items-center justify-center text-xs text-gray-300 font-bold border border-gray-100 rounded-lg">Not Uploaded</div>
                    )}
                  </div>

                  <div className="space-y-2 text-center bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Aadhar Card Back</span>
                    {selectedCandidate.aadharBack ? (
                      <a href={selectedCandidate.aadharBack} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedCandidate.aadharBack} alt="Aadhar Back" className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity" />
                        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                          View Full Image
                        </span>
                      </a>
                    ) : (
                      <div className="h-32 bg-white flex items-center justify-center text-xs text-gray-300 font-bold border border-gray-100 rounded-lg">Not Uploaded</div>
                    )}
                  </div>

                  <div className="space-y-2 text-center bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Bank Passbook / Cheque</span>
                    {selectedCandidate.bankPassbook ? (
                      <a href={selectedCandidate.bankPassbook} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedCandidate.bankPassbook} alt="Bank Doc" className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity" />
                        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/40 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                          View Full Image
                        </span>
                      </a>
                    ) : (
                      <div className="h-32 bg-white flex items-center justify-center text-xs text-gray-300 font-bold border border-gray-100 rounded-lg">Not Uploaded</div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close Folder
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
