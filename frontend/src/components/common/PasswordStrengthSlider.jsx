import React, { useEffect } from "react";

/**
 * Live password strength meter with 3-segment progress indicator and criteria checklist.
 * Evaluates:
 * 1. Length >= 8
 * 2. At least one uppercase letter (/[A-Z]/)
 * 3. At least one special character (/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/]/)
 */
export default function PasswordStrengthSlider({ password = "", onStrengthChange }) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/]/.test(password);

  const criteria = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "At least 1 uppercase letter (A-Z)", met: hasUppercase },
    { label: "At least 1 special character (!@#$...)", met: hasSpecial },
  ];

  const passedCount = criteria.filter((c) => c.met).length;
  const isStrong = passedCount === 3;

  useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(isStrong);
    }
  }, [isStrong, onStrengthChange]);

  // Determine segment colors based on criteria met
  const getSegmentColor = (segmentIndex) => {
    if (segmentIndex >= passedCount) {
      return "bg-slate-200";
    }
    if (passedCount === 1) {
      return "bg-red-500";
    }
    if (passedCount === 2) {
      return "bg-amber-500";
    }
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (!password) return { text: "Enter password", color: "text-slate-400" };
    if (passedCount === 1) return { text: "Weak", color: "text-red-600" };
    if (passedCount === 2) return { text: "Fair", color: "text-amber-600" };
    return { text: "Strong", color: "text-emerald-600" };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="mt-2 space-y-2">
      {/* 3-Segment Progress Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
        <span className="text-slate-500">Password Strength</span>
        <span className={`${strengthInfo.color} font-bold`}>{strengthInfo.text}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
        <div className={`h-full rounded-full transition-colors duration-200 ${getSegmentColor(0)}`} />
        <div className={`h-full rounded-full transition-colors duration-200 ${getSegmentColor(1)}`} />
        <div className={`h-full rounded-full transition-colors duration-200 ${getSegmentColor(2)}`} />
      </div>

      {/* Criteria Checklist */}
      <ul className="pt-1 space-y-1 text-[11px]">
        {criteria.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              item.met ? "text-emerald-600 font-semibold" : "text-slate-400"
            }`}
          >
            <span className="text-xs">{item.met ? "✓" : "○"}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
