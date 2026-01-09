
import React from 'react';
import { UserProfile } from '../types';

export const Header: React.FC<{ 
  user: UserProfile; 
  onVipClick: () => void;
  onHomeClick: () => void;
}> = ({ user, onVipClick, onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-mystic-900/90 backdrop-blur-md border-b border-mystic-700 px-4 py-3 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-mystic-900 font-bold text-xl">
          玄
        </div>
        <h1 className="text-lg md:text-xl font-serif text-gold-400 font-bold tracking-widest">玄机</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onVipClick}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          user.isVip 
            ? 'bg-gold-500 text-mystic-900 shadow-[0_0_10px_#ffd700]' 
            : 'bg-mystic-700 text-gray-300 hover:bg-mystic-600'
        }`}>
          {user.isVip ? 'VIP 尊享版' : '开通 VIP'}
        </button>
      </div>
    </header>
  );
};

export const Card: React.FC<{ 
  title: string; 
  icon?: string; 
  children: React.ReactNode; 
  className?: string 
}> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-mystic-800 border border-mystic-700 rounded-xl p-4 md:p-6 shadow-xl ${className}`}>
    {title && (
      <h3 className="text-lg md:text-xl font-serif text-gold-400 mb-4 flex items-center gap-2 border-b border-mystic-700 pb-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
    )}
    {children}
  </div>
);

// Added className prop to fix type errors in Tools.tsx and allow custom layout adjustments
export const Button: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
}> = ({ onClick, disabled, children, variant = 'primary', fullWidth, className = '' }) => {
  const baseClass = "py-2 md:py-3 px-4 md:px-6 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base";
  const variants = {
    primary: "bg-gradient-to-r from-gold-600 to-gold-400 text-mystic-900 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:-translate-y-0.5",
    secondary: "bg-mystic-700 text-gold-100 hover:bg-mystic-600 border border-mystic-600"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClass} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-mystic-800 border border-gold-600 rounded-2xl max-w-md w-full p-6 relative animate-[fadeIn_0.3s_ease-out]">
        <button onClick={onClose} className="absolute top-3 right-3 text-mystic-400 hover:text-white">✕</button>
        {children}
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Very simple Markdown rendering for strict React/Tailwind env without external libs
  // In a real production app, use react-markdown
  const lines = content.split('\n');
  return (
    <div className="space-y-3 text-gold-100 leading-relaxed font-serif text-sm md:text-base">
      {lines.map((line, idx) => {
        if (line.startsWith('###')) return <h4 key={idx} className="text-base md:text-lg font-bold text-gold-400 mt-4">{line.replace(/^###\s+/, '')}</h4>;
        if (line.startsWith('##')) return <h3 key={idx} className="text-lg md:text-xl font-bold text-gold-500 mt-6 border-b border-mystic-600 pb-1">{line.replace(/^##\s+/, '')}</h3>;
        if (line.startsWith('#')) return <h2 key={idx} className="text-xl md:text-2xl font-bold text-gold-600 mt-8 text-center">{line.replace(/^#\s+/, '')}</h2>;
        if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc marker:text-gold-500">{line.replace(/^- /, '')}</li>;
        if (line.trim() === '') return <div key={idx} className="h-2"></div>;
        return <p key={idx}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>; // Simple bold strip for this mock, normally would parse
      })}
    </div>
  );
};
