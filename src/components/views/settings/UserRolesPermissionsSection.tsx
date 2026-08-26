import React from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  permissionsMatrix: Record<string, Record<string, boolean>>;
  setPermissionsMatrix: React.Dispatch<React.SetStateAction<Record<string, Record<string, boolean>>>>;
  requireSecondSurveyor: boolean;
  setRequireSecondSurveyor: (v: boolean) => void;
}

const ROLES = ['Surveyor', 'Senior Surveyor', 'Admin'] as const;
const PERMISSIONS = [
  { key: 'createProperty', label: 'Create Property' },
  { key: 'editSettings', label: 'Edit Settings' },
  { key: 'approveValidation', label: 'Approve Validation' },
  { key: 'editDataSources', label: 'Edit Data Sources' },
] as const;

export const UserRolesPermissionsSection: React.FC<Props> = ({
  isExpanded,
  onToggle,
  permissionsMatrix,
  setPermissionsMatrix,
  requireSecondSurveyor,
  setRequireSecondSurveyor,
}) => {
  const togglePermission = (role: string, permKey: string) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permKey]: !prev[role]?.[permKey],
      },
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
      >
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            User Roles & Permissions
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
            Role vs permission authorization matrix & four-eyes cadastral sign-off policy
          </p>
        </div>
        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
          {/* Role vs Permission Matrix Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-2.5 font-semibold">Role</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p.key} className="p-2.5 text-center font-semibold">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ROLES.map((role) => (
                  <tr key={role} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {role}
                    </td>
                    {PERMISSIONS.map((p) => {
                      const isGranted = !!permissionsMatrix[role]?.[p.key];
                      return (
                        <td key={p.key} className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => togglePermission(role, p.key)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                              isGranted
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toggle: Require second surveyor sign-off */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Require second surveyor sign-off before marking property Validated
              </label>
              <span className="text-[11px] text-slate-400">
                Four-eyes principle: A distinct Senior Surveyor credential must countersign every 3D boundary model prior to state registry publication.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRequireSecondSurveyor(!requireSecondSurveyor)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                requireSecondSurveyor ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  requireSecondSurveyor ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
