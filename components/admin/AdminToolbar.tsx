import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminToolbarProps = {
  children?: React.ReactNode;
  className?: string;
};

export function AdminToolbar({ children, className }: AdminToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}

type AdminFilterOption<T extends string> = {
  value: T;
  label: string;
  testId?: string;
};

export function AdminFilterButtons<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: AdminFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option.value || "all"}
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
          data-testid={option.testId}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Cari…",
  className,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  testId?: string;
}) {
  const input = (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        placeholder={placeholder}
        className="pl-9"
        data-testid={testId}
      />
    </div>
  );

  if (onSubmit) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full sm:ml-auto sm:w-auto"
      >
        {input}
      </form>
    );
  }

  return <div className="w-full sm:ml-auto sm:w-auto">{input}</div>;
}
