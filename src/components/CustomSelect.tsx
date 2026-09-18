'use client';

import { useState, useRef, useEffect, Children, isValidElement, ReactNode } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Drop-in replacement for <select>, used exactly the same way (same
 * children, i.e. plain <option value="...">Label</option> elements) so
 * each call site's own option-computation logic (filtering by central
 * type, custom-product sentinels, XTO fallbacks, etc.) never needs to be
 * touched or duplicated -- only the wrapping tag changes from <select> to
 * <CustomSelect>.
 *
 * Renders TWO things at once, one hidden via CSS depending on screen
 * width (client feedback: desktop's native <select> is fine and liked
 * as-is, only mobile/tablet needs a real fix):
 * - A genuine native <select> with these same children, shown on desktop
 *   (max-width: 900px media query hides it) -- unchanged behaviour there.
 * - A custom button + list, shown only below that width, opening a
 *   properly positioned (directly under the field, not "n'importe où"),
 *   readable, touch-friendly dropdown -- built by reading the option
 *   elements' own value/children, not by re-deriving them.
 */
export function CustomSelect({ value, onChange, className, id, disabled, children }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Read the same <option> children the native select uses, so the two
  // renderings can never drift apart.
  const options: { value: string; label: string }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { value?: string; children?: ReactNode };
    const optValue = props.value ?? '';
    let label = '';
    if (typeof props.children === 'string' || typeof props.children === 'number') {
      label = String(props.children);
    } else if (Array.isArray(props.children)) {
      label = props.children.filter((c) => typeof c === 'string' || typeof c === 'number').join('');
    }
    options.push({ value: optValue, label });
  });

  const selected = options.find((o) => o.value === value);

  return (
    <div className="custom-select-wrapper" ref={wrapperRef}>
      <select
        id={id}
        className={`${className || ''} custom-select-native`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
      >
        {children}
      </select>

      <button
        type="button"
        className={`${className || ''} custom-select-trigger`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="custom-select-trigger-label">{selected?.label || options[0]?.label || ''}</span>
        <span className="custom-select-trigger-arrow" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="custom-select-list">
          {options.map((opt, i) => (
            <div
              key={`${opt.value}-${i}`}
              className={`custom-select-option${opt.value === value ? ' selected' : ''}`}
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
