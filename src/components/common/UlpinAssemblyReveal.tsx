import React from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';

interface UlpinAssemblyRevealProps {
  ulpin: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCopy?: boolean;
}

export const UlpinAssemblyReveal: React.FC<UlpinAssemblyRevealProps> = ({
  ulpin,
  className = '',
  size = 'md',
  showCopy = true,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Split ULPIN into hierarchical segments: [Parcel, Building, Floor, Unit]
  const segments = React.useMemo(() => {
    if (!ulpin) return [];
    const parts = ulpin.split('-');
    if (parts.length >= 4) {
      return [
        { text: parts[0], label: 'Parcel ULPIN', isSep: false },
        { text: `-${parts[1]}`, label: 'Building', isSep: false },
        { text: `-${parts[2]}`, label: 'Floor', isSep: false },
        { text: `-${parts.slice(3).join('-')}`, label: 'Unit', isSep: false },
      ];
    } else if (parts.length > 1) {
      return parts.map((p, idx) => ({
        text: idx === 0 ? p : `-${p}`,
        label: idx === 0 ? 'Parcel' : `Level ${idx}`,
        isSep: false,
      }));
    }
    return [{ text: ulpin, label: 'ULPIN', isSep: false }];
  }, [ulpin]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textSize =
    size === 'lg'
      ? 'text-lg md:text-xl'
      : size === 'sm'
      ? 'text-xs'
      : 'text-sm md:text-base';

  return (
    <div className={`inline-flex items-center gap-2 font-mono ${className}`}>
      <div className={`inline-flex items-baseline flex-wrap font-semibold tracking-tight ${textSize}`}>
        {segments.map((seg, idx) => (
          <motion.span
            key={`${ulpin}-${idx}`}
            initial={{ opacity: 0, x: -6, filter: 'blur(2px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.18,
              delay: idx * 0.08,
              ease: [0.2, 0.65, 0.3, 0.9],
            }}
            className={
              idx === 0
                ? 'text-slate-900 dark:text-slate-100'
                : idx === 1
                ? 'text-blue-600 dark:text-indigo-400'
                : idx === 2
                ? 'text-teal-600 dark:text-cyan-400'
                : 'text-blue-700 dark:text-cyan-300 font-bold'
            }
            title={seg.label}
          >
            {seg.text}
          </motion.span>
        ))}
      </div>

      {showCopy && (
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy ULPIN"
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={copied ? 'Copied!' : 'Copy 3D ULPIN'}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
};
