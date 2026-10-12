import React from 'react';
import type { PIIFinding } from '../../types';
import { AlertTriangle, ShieldAlert, AlertCircle, Info } from 'lucide-react';

interface TokenBadgeProps {
  finding: PIIFinding;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({ finding, isSelected, onClick }) => {
  const getBadgeStyle = () => {
    switch (finding.severity) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/25';
      case 'LOW':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25';
    }
  };

  const getIcon = () => {
    switch (finding.severity) {
      case 'CRITICAL':
        return <ShieldAlert className="w-3 h-3 text-rose-400" />;
      case 'HIGH':
        return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      case 'LOW':
        return <Info className="w-3 h-3 text-cyan-400" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${getBadgeStyle()} ${
        isSelected ? 'ring-2 ring-emerald-400 scale-105' : ''
      }`}
    >
      {getIcon()}
      <span className="font-semibold">{finding.type}</span>
      <span className="opacity-70 text-[10px]">({finding.value.length > 15 ? finding.value.slice(0, 12) + '...' : finding.value})</span>
    </button>
  );
};
