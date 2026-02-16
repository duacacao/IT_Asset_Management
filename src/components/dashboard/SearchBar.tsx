'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name / ID...',
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [shortcut, setShortcut] = useState('Ctrl+F')

  // Detect OS for shortcut symbol (client-side only to avoid hydration mismatch)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.platform.includes('Mac')) {
      setShortcut('⌘+F')
    }
  }, [])

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        name="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pr-9 pl-9"
        autoComplete="off"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {!value && !isFocused && (
        <div className="text-muted-foreground border-border bg-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border px-1.5 py-0.5 text-xs">
          {shortcut}
        </div>
      )}
    </div>
  )
}
