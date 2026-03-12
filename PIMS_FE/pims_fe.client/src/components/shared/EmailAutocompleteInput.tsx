import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { UserSuggestion } from "../../services/userService";

interface EmailAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: UserSuggestion) => void;
  fetchSuggestions: (query: string) => Promise<UserSuggestion[]>;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

const EmailAutocompleteInput: React.FC<EmailAutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  placeholder = "Enter email...",
  disabled = false,
  hasError = false,
}) => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await fetchSuggestions(value.trim());
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: UserSuggestion) => {
    onSelect(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus
          className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 pr-10 ${
            hasError
              ? "border-red-400 bg-red-50"
              : "border-gray-200 focus:border-primary"
          }`}
        />
        {searching && (
          <Loader2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.email}
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 cursor-pointer transition-colors"
            >
              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                {(s.fullName || s.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {s.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">{s.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailAutocompleteInput;
