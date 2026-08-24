import React from 'react';
import { AlertCircle } from 'lucide-react';

export const LegalDisclaimer: React.FC = () => {
  return (
    <div className="p-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-[10px] text-[#94A3B8] flex items-start space-x-2">
      <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
      <p className="leading-normal">
        <strong className="text-[#E5E7EB]">Legal Disclaimer:</strong> Map measurements and AI feature extractions are for visualization and preliminary surveying only. Official property boundaries and legal cadastral records must be verified using authorized government records and certified surveyor field data.
      </p>
    </div>
  );
};
