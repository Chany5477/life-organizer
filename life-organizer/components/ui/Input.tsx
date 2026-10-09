'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-xs text-gray-500 block">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-xs text-gray-500 block">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y min-h-[80px]',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-xs text-gray-500 block">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = 'Select';
