import React, { useState } from 'react';
import { PersonCredential } from '../types';
import { User, Plus, Trash2, Camera, Upload, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { extractVectorFromImageUrl } from '../utils/faceMatcher';

interface PersonnelManagerProps {
  personnel: PersonCredential[];
  onAddPerson: (person: PersonCredential) => void;
  onDeletePerson: (id: string) => void;
  isEnrollModalOpen: boolean;
  setIsEnrollModalOpen: (open: boolean) => void;
  presetCapturedImage?: string;
  presetCapturedVector?: number[];
}

export const PersonnelManager: React.FC<PersonnelManagerProps> = ({
  personnel,
  onAddPerson,
  onDeletePerson,
  isEnrollModalOpen,
  setIsEnrollModalOpen,
  presetCapturedImage,
  presetCapturedVector
}) => {
  const [filter, setFilter] = useState<'ALL' | 'AUTHORIZED' | 'RESTRICTED'>('ALL');

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Systems Architect');
  const [department, setDepartment] = useState('Cybersecurity Division');
  const [accessLevel, setAccessLevel] = useState('Level 4 - Top Secret');
  const [clearance, setClearance] = useState('ALPHA-01');
  const [badgeId, setBadgeId] = useState('SEC-9402');
  const [status, setStatus] = useState<'AUTHORIZED' | 'RESTRICTED'>('AUTHORIZED');
  const [imagePreview, setImagePreview] = useState<string>(presetCapturedImage || '');
  const [biometricVector, setBiometricVector] = useState<number[] | undefined>(presetCapturedVector);

  React.useEffect(() => {
    if (presetCapturedImage) {
      setImagePreview(presetCapturedImage);
    }
    if (presetCapturedVector) {
      setBiometricVector(presetCapturedVector);
    }
  }, [presetCapturedImage, presetCapturedVector]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setImagePreview(dataUrl);
          const vec = await extractVectorFromImageUrl(dataUrl);
          setBiometricVector(Array.from(vec));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalVector = biometricVector;
    if (!finalVector && imagePreview) {
      const vec = await extractVectorFromImageUrl(imagePreview);
      finalVector = Array.from(vec);
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPerson: PersonCredential = {
      id: newId,
      image: imagePreview || personnel[0]?.image || '',
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      access_level: accessLevel.trim(),
      clearance: clearance.trim(),
      badge_id: badgeId.trim() || `${newId}-B`,
      status,
      issued_date: new Date().toISOString().split('T')[0],
      biometricVector: finalVector
    };

    onAddPerson(newPerson);
    setIsEnrollModalOpen(false);
    setName('');
    setImagePreview('');
    setBiometricVector(undefined);
  };

  const filteredPersonnel = personnel.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e131f] border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Personnel Credential Directory</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered profiles enrolled for biometric facial verification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Segmented Filter */}
          <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs">
            {(['ALL', 'AUTHORIZED', 'RESTRICTED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === mode
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'ALL' ? 'All Profiles' : mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Profile</span>
          </button>
        </div>
      </div>

      {/* Clean Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPersonnel.map((person) => {
          const isAuth = person.status === 'AUTHORIZED';
          return (
            <div
              key={person.id}
              className="bg-[#0e131f] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{person.name}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{person.role}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{person.id} · {person.badge_id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeletePerson(person.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Remove Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-800/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department</span>
                    <span className="text-slate-200">{person.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clearance Tier</span>
                    <span className="font-mono font-medium text-cyan-400">{person.clearance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Access Level</span>
                    <span className="text-slate-300">{person.access_level}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center space-x-1.5 font-medium ${
                  isAuth ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAuth ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span>{person.status}</span>
                </span>
                <span className="text-slate-500 text-[11px]">Enrolled {person.issued_date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e131f] border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4.5 bg-[#0b0e17] border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Enroll New Personnel</h3>
                <p className="text-xs text-slate-400 mt-0.5">Provide credentials and a reference portrait.</p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="p-6 space-y-4">
              {/* Reference Image */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Reference Photo</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-700 bg-slate-950 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-[11px]">
                      <Camera className="w-5 h-5 mb-1" />
                      No Photo
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Or snap directly in the live feed via "Enroll Face".
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Chief Security Officer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Threat Intelligence"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Badge ID</label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="e.g. SEC-8804"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Access Level</label>
                  <input
                    type="text"
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    placeholder="Level 4 - Top Secret"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Clearance Code</label>
                  <input
                    type="text"
                    value={clearance}
                    onChange={(e) => setClearance(e.target.value)}
                    placeholder="ALPHA-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Authorization Status</label>
                <div className="flex space-x-4 text-xs">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'AUTHORIZED'}
                      onChange={() => setStatus('AUTHORIZED')}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-medium">Authorized Access</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === 'RESTRICTED'}
                      onChange={() => setStatus('RESTRICTED')}
                      className="accent-amber-500"
                    />
                    <span className="text-amber-400 font-medium">Restricted Access</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer shadow-md"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
