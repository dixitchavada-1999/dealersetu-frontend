type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  'aria-label'?: string;
};

/** Accessible on/off switch matching the app's styling. */
export default function Toggle({ checked, onChange, disabled, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-primary-600' : 'bg-slate-300'}`}
      {...rest}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}
