import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

type DateRange = { from: string; to: string };
type Preset = { label: string; key: string };

const PRESETS: Preset[] = [
  { label: 'Today', key: 'today' },
  { label: 'Yesterday', key: 'yesterday' },
  { label: 'This Week', key: 'thisWeek' },
  { label: 'This Month', key: 'thisMonth' },
  { label: 'This Quarter', key: 'thisQuarter' },
  { label: 'This Year', key: 'thisYear' },
  { label: 'Last Month', key: 'lastMonth' },
  { label: 'Last Quarter', key: 'lastQuarter' },
  { label: 'Last Year', key: 'lastYear' },
  { label: 'Custom Date Range', key: 'custom' },
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getPresetRange(key: string): DateRange | null {
  const now = new Date();
  const today = startOfDay(now);

  switch (key) {
    case 'today':
      return { from: toDateStr(today), to: toDateStr(today) };
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: toDateStr(y), to: toDateStr(y) };
    }
    case 'thisWeek': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { from: toDateStr(start), to: toDateStr(today) };
    }
    case 'thisMonth':
      return { from: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), to: toDateStr(today) };
    case 'thisQuarter': {
      const qStart = Math.floor(today.getMonth() / 3) * 3;
      return { from: toDateStr(new Date(today.getFullYear(), qStart, 1)), to: toDateStr(today) };
    }
    case 'thisYear':
      return { from: toDateStr(new Date(today.getFullYear(), 0, 1)), to: toDateStr(today) };
    case 'lastMonth': {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toDateStr(s), to: toDateStr(e) };
    }
    case 'lastQuarter': {
      const cq = Math.floor(today.getMonth() / 3);
      const lqStart = new Date(today.getFullYear(), (cq - 1) * 3, 1);
      const lqEnd = new Date(today.getFullYear(), cq * 3, 0);
      return { from: toDateStr(lqStart), to: toDateStr(lqEnd) };
    }
    case 'lastYear': {
      const ly = today.getFullYear() - 1;
      return { from: toDateStr(new Date(ly, 0, 1)), to: toDateStr(new Date(ly, 11, 31)) };
    }
    default:
      return null;
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

type Props = {
  from: string;
  to: string;
  onChange: (range: DateRange) => void;
  onClear?: () => void;
};

export default function DateRangePicker({ from, to, onChange, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState(() => {
    if (from) { const d = new Date(from); return { year: d.getFullYear(), month: d.getMonth() }; }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<'from' | 'to' | null>(null);
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);
  const [activePreset, setActivePreset] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Right month is always leftMonth + 1
  const rightMonth = leftMonth.month === 11
    ? { year: leftMonth.year + 1, month: 0 }
    : { year: leftMonth.year, month: leftMonth.month + 1 };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sync temp values when props change
  useEffect(() => { setTempFrom(from); setTempTo(to); }, [from, to]);

  const handleOpen = () => {
    setOpen(true);
    setActivePreset('');
    setSelecting(null);
    // Position calendar to show current selection or current month
    if (from) {
      const d = new Date(from);
      setLeftMonth({ year: d.getFullYear(), month: d.getMonth() });
    } else {
      const now = new Date();
      setLeftMonth({ year: now.getFullYear(), month: now.getMonth() });
    }
  };

  const handlePreset = (key: string) => {
    setActivePreset(key);
    if (key === 'custom') {
      setSelecting('from');
      setTempFrom('');
      setTempTo('');
      return;
    }
    const range = getPresetRange(key);
    if (range) {
      setTempFrom(range.from);
      setTempTo(range.to);
      setSelecting(null);
      onChange(range);
      setOpen(false);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (!selecting || selecting === 'from') {
      setTempFrom(dateStr);
      setTempTo('');
      setSelecting('to');
      setActivePreset('custom');
    } else {
      // selecting === 'to'
      if (dateStr < tempFrom) {
        // Clicked before start → reset start
        setTempFrom(dateStr);
        setTempTo('');
        setSelecting('to');
      } else {
        setTempTo(dateStr);
        setSelecting(null);
        onChange({ from: tempFrom, to: dateStr });
        setOpen(false);
      }
    }
  };

  const prevMonth = () => {
    setLeftMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  };
  const nextMonth = () => {
    setLeftMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });
  };
  const prevYear = () => setLeftMonth(p => ({ ...p, year: p.year - 1 }));
  const nextYear = () => setLeftMonth(p => ({ ...p, year: p.year + 1 }));

  const isInRange = (dateStr: string) => {
    const endDate = tempTo || hoverDate;
    if (!tempFrom || !endDate) return false;
    return dateStr > tempFrom && dateStr < endDate;
  };

  const isRangeStart = (dateStr: string) => dateStr === tempFrom;
  const isRangeEnd = (dateStr: string) => dateStr === (tempTo || (selecting === 'to' ? hoverDate : null));

  const formatDisplay = () => {
    if (!from && !to) return '';
    const fmtD = (s: string) => {
      const d = new Date(s);
      return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    };
    if (from && to) return `${fmtD(from)} – ${fmtD(to)}`;
    if (from) return fmtD(from);
    return '';
  };

  const renderCalendar = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const todayStr = toDateStr(new Date());
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="w-[280px]">
        {/* Month header */}
        <div className="text-center text-sm font-semibold text-slate-800 mb-3">
          {MONTHS[month]} {year}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="h-9" />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isStart = isRangeStart(dateStr);
            const isEnd = isRangeEnd(dateStr);
            const inRange = isInRange(dateStr);
            const isSelected = isStart || isEnd;

            return (
              <div
                key={dateStr}
                className={`relative h-9 flex items-center justify-center ${
                  inRange ? 'bg-primary-100' : ''
                } ${isStart && (tempTo || hoverDate) ? 'rounded-l-full bg-primary-100' : ''} ${
                  isEnd && tempFrom ? 'rounded-r-full bg-primary-100' : ''
                }`}
              >
                <button
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => { if (selecting === 'to') setHoverDate(dateStr); }}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-colors relative z-10 ${
                    isSelected
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : isToday
                        ? 'border-2 border-primary-400 text-primary-700 hover:bg-primary-100'
                        : inRange
                          ? 'text-primary-700 hover:bg-primary-200'
                          : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
          from || to
            ? 'bg-primary-50 border-primary-200 text-primary-700'
            : 'bg-card border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Calendar size={16} />
        {from || to ? formatDisplay() : 'Date Range'}
        {(from || to) && onClear && (
          <span
            onClick={e => { e.stopPropagation(); onClear(); }}
            className="ml-1 p-0.5 rounded-full hover:bg-primary-200 transition-colors"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-card rounded-xl shadow-2xl border border-slate-200 flex overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Presets sidebar */}
          <div className="w-48 border-r border-slate-100 py-2 shrink-0">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activePreset === p.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.key === 'custom' && <Calendar size={14} />}
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendars — only visible when Custom Date Range is selected */}
          {activePreset === 'custom' && (
            <div className="p-4">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1">
                  <button onClick={prevYear} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronsLeft size={16} />
                  </button>
                  <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                  <button onClick={nextYear} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>

              {/* Two calendars */}
              <div className="flex gap-6" onMouseLeave={() => setHoverDate(null)}>
                {renderCalendar(leftMonth.year, leftMonth.month)}
                {renderCalendar(rightMonth.year, rightMonth.month)}
              </div>

              {/* Selected range display */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-surface rounded-xl border border-slate-200 text-sm">
                  <span className={`flex-1 text-center ${tempFrom ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {tempFrom ? new Date(tempFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Start date'}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={`flex-1 text-center ${tempTo ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {tempTo ? new Date(tempTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'End date'}
                  </span>
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
