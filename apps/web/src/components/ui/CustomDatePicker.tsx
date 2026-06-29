import { es } from 'date-fns/locale/es';
import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

registerLocale('es', es);

type CustomDatePickerProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  className?: string;
  placeholderText?: string;
};

// Componente de botón personalizado para el DatePicker
const CustomInput = forwardRef<HTMLButtonElement, any>(
  ({ value, onClick, className }, ref) => (
    <button
      type="button"
      className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-left text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all flex items-center justify-between ${className}`}
      onClick={onClick}
      ref={ref}
    >
      <span className={value ? 'text-white' : 'text-slate-400'}>
        {value || 'Seleccionar fecha...'}
      </span>
      <Calendar className="w-4 h-4 text-slate-400" />
    </button>
  )
);
CustomInput.displayName = 'CustomInput';

export function CustomDatePicker({
  selected,
  onChange,
  showTimeSelect = false,
  className = '',
  placeholderText,
}: CustomDatePickerProps) {
  return (
    <div className={`relative custom-datepicker-wrapper ${className}`}>
      <DatePicker
        selected={selected}
        onChange={(date) => onChange(date)}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Hora"
        dateFormat={showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
        locale="es"
        placeholderText={placeholderText}
        customInput={<CustomInput />}
        calendarClassName="dark-theme-calendar"
      />
    </div>
  );
}
