"use client";

import { getScheduleInputError } from "@/lib/articles/schedule-input";
import { cn } from "@/lib/utils";

type SchedulePublishInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  testId?: string;
  "aria-label"?: string;
};

export default function SchedulePublishInput({
  id,
  value,
  onChange,
  disabled = false,
  className,
  inputClassName,
  testId,
  "aria-label": ariaLabel = "Jadwal tayang WIB",
}: SchedulePublishInputProps) {
  const error = value ? getScheduleInputError(value) : null;

  return (
    <div className={cn("space-y-1", className)}>
      <input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "border bg-white px-3 py-2 text-sm",
          error ? "border-jepang-red" : "border-jepang-border",
          inputClassName,
        )}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
      />
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-xs text-jepang-red"
          role="alert"
          data-testid={testId ? `${testId}-error` : undefined}
        >
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-jepang-muted">Minimal 30 menit dari sekarang (WIB)</p>
      )}
    </div>
  );
}

export { getScheduleInputError };
