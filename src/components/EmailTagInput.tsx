"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailTagInputProps {
  label: string;
  value: string[];
  onChange: (emails: string[]) => void;
  error?: string;
}

export function EmailTagInput({ label, value, onChange, error }: EmailTagInputProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = inputValue.trim();
      if (email && isValidEmail(email) && !value.includes(email)) {
        onChange([...value, email]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter((email) => email !== emailToRemove));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2",
          error && "border-destructive"
        )}
      >
        {value.map((email) => (
          <div
            key={email}
            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground"
          >
            <span>{email}</span>
            <button
              type="button"
              onClick={() => removeEmail(email)}
              className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          id={id}
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue && isValidEmail(inputValue) && !value.includes(inputValue)) {
              onChange([...value, inputValue]);
              setInputValue("");
            }
          }}
          placeholder="Type email and press Enter"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
} 