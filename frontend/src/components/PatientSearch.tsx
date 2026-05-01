import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Patient } from '../types';
// ===== RECENT PATIENTS LINK  =====
import { usePatients } from '../hooks/usePatients';
import { Patient as ApiPatient } from '../api/patientsApi';
// ===== END RECENT PATIENTS LINK =====

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  disabled?: boolean;
}


export function PatientSearch({ onSelectPatient, disabled = false }: PatientSearchProps) {
  // ===== RECENT PATIENTS LINK  =====
  const { filtered, isLoading, error, searchQuery, setSearchQuery } = usePatients();
  // ===== END RECENT PATIENTS LINK =====
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== RECENT PATIENTS LINK  =====
  const handleSelect = (patient: ApiPatient) => {
    onSelectPatient({ id: patient.id, name: patient.full_name, mrn: patient.mrn, language: patient.patient_language });
    setSearchQuery('');
    setShowDropdown(false);
  };
  // ===== END RECENT PATIENTS LINK =====

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F5E5A]" />
        {/* ===== RECENT PATIENTS LINK  ===== */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => searchQuery && setShowDropdown(true)}
          disabled={disabled}
          placeholder="Search patient by ID or name..."
          className={`w-full md:w-[280px] lg:w-[320px] h-[32px] pl-9 pr-3 rounded-md border border-[#E0DED6] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-0 ${
            disabled ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        />
        {/* ===== END RECENT PATIENTS LINK ===== */}
      </div>

      {/* ===== RECENT PATIENTS LINK  ===== */}
      {showDropdown && searchQuery.trim() && (isLoading || !!error || filtered.length > 0) && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#E0DED6] z-50 max-h-[240px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-[13px] text-[#5F5E5A]">Loading patients…</div>
          )}
          {error && (
            <div className="px-4 py-3 text-[13px] text-[#A32D2D]">{error}</div>
          )}
          {!isLoading && !error && filtered.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelect(patient)}
              className="w-full px-4 py-3 text-left hover:bg-[#F4F6F8] transition-colors border-b border-[#E0DED6] last:border-b-0"
            >
              <div className="text-[13px] font-medium text-[#1A1A1A]">{patient.full_name}</div>
              <div className="text-[11px] text-[#5F5E5A] mt-0.5">
                {patient.mrn} · {patient.patient_language}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* ===== END RECENT PATIENTS LINK ===== */}
    </div>
  );
}