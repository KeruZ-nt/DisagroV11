import { useEffect, useRef, useState } from 'react';

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  searchable?: boolean;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  buttonClassName = 'bg-black/20 border border-white/10 rounded-xl px-4 py-2.5',
  icon,
  disabled = false,
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search term when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className={selectedOption ? 'text-white' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {searchable && (
            <div className="p-2 border-b border-white/10 shrink-0">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Buscar..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                autoFocus
              />
            </div>
          )}
          <ul className="py-1 overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  option.value === value
                    ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">
                No hay opciones
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
