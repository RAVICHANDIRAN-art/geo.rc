import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  parcelId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  parcelId,
  onCancel,
  onConfirm
}) => {
  if (!isOpen || !parcelId) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-[#334155] rounded-2xl w-full max-w-sm p-5 shadow-2xl text-white space-y-4">
        <div className="flex items-center space-x-3 text-rose-400">
          <div className="p-2 bg-rose-950/60 border border-rose-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Delete Parcel</h3>
            <p className="text-xs text-rose-300 font-mono">Target: {parcelId}</p>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Are you sure you want to delete this parcel? This action will permanently remove the parcel boundary and associated area calculations from your session.
        </p>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1E293B]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#172033] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition"
          >
            CANCEL
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};
