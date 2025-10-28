'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Pilih opsi...',
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 px-3 py-2 text-sm",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder="Cari bank..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              Tidak ada bank yang ditemukan
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between",
                  value === option && "bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => handleSelect(option)}
              >
                <span className="truncate">{option}</span>
                {value === option && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
