'use client';

import * as React from 'react';
import { X, ChevronDown, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CreatableMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  createText?: string;
}

export function CreatableMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih atau buat tag...',
  className,
  disabled = false,
  createText = 'Buat tag baru',
}: CreatableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    return options.filter(option =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  // Check if search value is a new tag (not in options and not empty)
  const isNewTag = React.useMemo(() => {
    return (
      searchValue.trim() !== '' &&
      !options.some(
        opt => opt.toLowerCase() === searchValue.trim().toLowerCase()
      ) &&
      !value.some(val => val.toLowerCase() === searchValue.trim().toLowerCase())
    );
  }, [searchValue, options, value]);

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  // Focus input when popover opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSelect = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleCreate = () => {
    const newTag = searchValue.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
      setSearchValue('');
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isNewTag) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between min-h-10 h-auto px-3 py-2 text-sm',
            !value.length && 'text-muted-foreground',
            className
          )}
        >
          <div className='flex flex-wrap gap-1 flex-1'>
            {value.length === 0 ? (
              <span className='text-muted-foreground'>{placeholder}</span>
            ) : (
              value.map(tag => (
                <Badge
                  key={tag}
                  variant='secondary'
                  className='mr-1 mb-1 flex items-center gap-1'
                >
                  {tag}
                  <span
                    role='button'
                    tabIndex={0}
                    aria-label={`Remove ${tag}`}
                    className='ml-1 hover:text-red-600 cursor-pointer inline-flex items-center'
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(tag);
                      }
                    }}
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(tag);
                    }}
                  >
                    <X className='h-3 w-3' />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <div className='p-2'>
          <div className='relative'>
            <Input
              ref={inputRef}
              placeholder='Cari atau buat tag baru...'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className='h-8'
            />
          </div>
        </div>
        <div className='max-h-60 overflow-auto'>
          {isNewTag && (
            <button
              type='button'
              className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 border-b'
              onClick={handleCreate}
            >
              <Plus className='h-4 w-4 text-green-600' />
              <span>
                {createText}: <strong>{searchValue.trim()}</strong>
              </span>
            </button>
          )}
          {filteredOptions.length === 0 && !isNewTag ? (
            <div className='p-2 text-sm text-gray-500 text-center'>
              Tidak ada tag yang ditemukan
            </div>
          ) : (
            filteredOptions.map(option => {
              const isSelected = value.includes(option);
              return (
                <button
                  key={option}
                  type='button'
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between',
                    isSelected && 'bg-gray-100 dark:bg-gray-800'
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span className='truncate'>{option}</span>
                  {isSelected && (
                    <Check className='h-4 w-4 text-green-600 shrink-0' />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
