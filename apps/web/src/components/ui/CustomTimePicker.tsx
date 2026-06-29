import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TimeKeeperModule from 'react-timekeeper';

const TimeKeeper = (TimeKeeperModule as any).default || TimeKeeperModule;

type CustomTimePickerProps = {
  time: string;
  onChange: (time: string) => void;
  className?: string;
};

export function CustomTimePicker({
  time,
  onChange,
  className = '',
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-left text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all flex items-center justify-between"
      >
        <span className={time ? 'text-white' : 'text-slate-400'}>
          {time || 'Seleccionar hora...'}
        </span>
        <Clock className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 top-full right-0 sm:left-0 sm:right-auto animate-in fade-in slide-in-from-top-2 dark-timekeeper">
          <TimeKeeper
            time={time || '12:00'}
            onChange={(newTime) => onChange(newTime.formatted24)}
            onDoneClick={() => setIsOpen(false)}
            switchToMinuteOnHourSelect
            doneButton={(newTime) => (
              <button
                type="button"
                className="w-full py-4 text-center text-[13px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-white/5 transition-colors uppercase tracking-wide border-t border-white/5"
                onClick={() => setIsOpen(false)}
              >
                Aceptar
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}
