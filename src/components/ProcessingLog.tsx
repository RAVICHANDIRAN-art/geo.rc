import React from 'react';
import type { LogEntry } from '../types/parcel';
import { Terminal, Trash2 } from 'lucide-react';

interface ProcessingLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ProcessingLog: React.FC<ProcessingLogProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          Processing Log
        </h3>
        <button
          onClick={onClearLogs}
          className="text-[10px] text-[#94A3B8] hover:text-rose-400 transition flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-2.5 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1.5 divide-y divide-[#172033]">
        {logs.length === 0 ? (
          <div className="text-[#94A3B8] text-[10px] italic py-1 text-center">
            Log output clear. Awaiting operations...
          </div>
        ) : (
          logs.map((log) => {
            const colorClass =
              log.type === 'success'
                ? 'text-emerald-400'
                : log.type === 'processing'
                ? 'text-amber-300'
                : log.type === 'error'
                ? 'text-rose-400 font-bold'
                : 'text-sky-300';

            return (
              <div key={log.id} className="pt-1 first:pt-0 leading-tight">
                <span className="text-[#64748B] mr-1.5 font-mono">[{log.timestamp}]</span>
                <span className={colorClass}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
