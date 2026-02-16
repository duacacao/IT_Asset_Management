# shadcn/ui Conventions

This document outlines the standards and conventions for using shadcn/ui components in this project.

## Table of Contents

- [General Principles](#general-principles)
- [Import Conventions](#import-conventions)
- [Component Patterns](#component-patterns)
- [Styling Guidelines](#styling-guidelines)
- [Custom Components](#custom-components)
- [Localization](#localization)

---

## General Principles

1. **Consistency First**: Follow existing patterns in the codebase
2. **Composition over Configuration**: Build complex UIs by composing shadcn components
3. **Type Safety**: Always use TypeScript and proper typing
4. **Accessibility**: Ensure components are accessible by default

---

## Import Conventions

### Quote Style

**Use single quotes for all imports:**

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ❌ Incorrect
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

### Import Order

Follow this order for imports:

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. Next.js
import { useRouter } from 'next/navigation'

// 3. External libraries (Radix, Lucide)
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

// 4. shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// 5. Custom components
import { DeviceCard } from '@/components/dashboard/DeviceCard'

// 6. Hooks
import { useDevicesQuery } from '@/hooks/useDevicesQuery'

// 7. Utilities
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'

// 8. Types
import { Device } from '@/types/device'

// 9. Local/Relative imports
import { DeviceTable } from './DeviceTable'
```

### Barrel Exports (Future)

When `src/components/ui/index.ts` is created:

```typescript
// ✅ Preferred (after barrel export is implemented)
import { Button, Input, Card } from '@/components/ui'

// ✅ Still acceptable (individual imports)
import { Button } from '@/components/ui/button'
```

---

## Component Patterns

### Function Declaration Pattern

Use function declarations for shadcn components (newer pattern):

```typescript
// ✅ Preferred - Function declaration with React.ComponentProps
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      type={type}
      {...props}
    />
  )
}
```

### ForwardRef Pattern (Legacy)

Only use `forwardRef` when absolutely necessary (mostly in older components):

```typescript
// ❌ Avoid for new components
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(...)} {...props} />
  }
)
Component.displayName = 'Component'
```

### Custom Components

When creating custom components that extend shadcn:

```typescript
// Example: Custom Card with header pattern
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeviceCardProps {
  device: Device
  onView?: (device: Device) => void
}

export function DeviceCard({ device, onView }: DeviceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

---

## Styling Guidelines

### Tailwind Class Ordering

Use `prettier-plugin-tailwindcss` for automatic class sorting.

### Data Attributes

Use `data-slot` attributes for styling hooks (shadcn convention):

```typescript
<div data-slot="card" className={cn(...)}>
  <div data-slot="card-header">
    <h3 data-slot="card-title">Title</h3>
  </div>
  <div data-slot="card-content">
    Content
  </div>
</div>
```

### Color Tokens

Always use semantic color tokens:

```typescript
// ✅ Correct
className="bg-destructive text-destructive-foreground"
className="bg-primary text-primary-foreground"
className="text-muted-foreground"

// ❌ Incorrect (hardcoded colors)
className="bg-red-500 text-white"
className="bg-blue-600"
```

### Class Variance Authority (CVA)

When using CVA for component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

---

## Custom Components

### Naming Conventions

- **shadcn/ui components**: PascalCase, in `src/components/ui/`
  - Example: `button.tsx`, `card.tsx`
  
- **Custom composite components**: PascalCase, in `src/components/`
  - Example: `DeviceCard.tsx`, `FilterBar.tsx`
  
- **Feature-specific components**: PascalCase, in feature folder
  - Example: `src/components/dashboard/DeviceList.tsx`

### Custom Component Guidelines

1. **Don't modify shadcn/ui components directly** - Extend them instead
2. **Place custom components in appropriate folders:**
   - `src/components/ui/` - Only for shadcn/ui components
   - `src/components/custom/` - For reusable custom components (future)
   - `src/components/dashboard/` - For dashboard-specific components
   - `src/components/auth/` - For auth-specific components

3. **Export pattern:**
```typescript
// Component file: src/components/dashboard/DeviceList.tsx
export function DeviceList({ devices }: DeviceListProps) {
  // Implementation
}

// Index file: src/components/dashboard/index.ts
export { DeviceList } from './DeviceList'
export { DeviceCard } from './DeviceCard'
```

---

## Localization

### Avoid Hardcoded Text

**Don't hardcode Vietnamese text in reusable components:**

```typescript
// ❌ Incorrect - Hardcoded in component
function Combobox({
  placeholder = "Chọn...",
  emptyText = "Không có kết quả",
  createLabel = "Thêm mới",
}) { }

// ✅ Correct - Accept as props with English defaults
function Combobox({
  placeholder = "Select...",
  emptyText = "No results found",
  createLabel = "Create new",
}: ComboboxProps) { }

// Usage in page component
<Combobox
  placeholder="Chọn phòng ban..."
  emptyText="Không tìm thấy phòng ban"
  createLabel="Thêm phòng ban mới"
/>
```

### Localization Strategy

For now, pass text as props. In the future, consider:
- `src/lib/ui-messages.ts` - Centralized message config
- Or a proper i18n solution (next-intl, react-i18next)

---

## Icons

### Lucide Icons (Preferred)

Always use Lucide React icons:

```typescript
// ✅ Correct
import { Pencil, Trash2, Download, Plus } from 'lucide-react'

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Thêm mới
</Button>

// ❌ Incorrect - Inline SVG
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">...</svg>
```

### Icon Sizing

- Small icons: `h-4 w-4` (buttons, inline)
- Medium icons: `h-5 w-5` (lists, cards)
- Large icons: `h-6 w-6` (empty states, features)

---

## Best Practices

### 1. Composition Pattern

Build complex UIs by composing small components:

```typescript
// ✅ Good - Composing shadcn components
<Card>
  <CardHeader>
    <CardTitle>Devices</CardTitle>
    <CardDescription>Manage your devices</CardDescription>
  </CardHeader>
  <CardContent>
    <DeviceTable devices={devices} />
  </CardContent>
  <CardFooter>
    <Button>Add Device</Button>
  </CardFooter>
</Card>
```

### 2. Props Spreading

Use props spreading carefully:

```typescript
// ✅ Good - Explicit props + rest
function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// ❌ Avoid - Blind spreading
function Button(props: ButtonProps) {
  return <button {...props} />
}
```

### 3. Type Safety

Always export component prop types:

```typescript
// Component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  // Implementation
}
```

---

## Migration Checklist

When refactoring existing code:

- [ ] Update imports to use single quotes
- [ ] Reorder imports according to convention
- [ ] Replace inline SVGs with Lucide icons
- [ ] Extract hardcoded Vietnamese text to props
- [ ] Use semantic color tokens
- [ ] Add `data-slot` attributes to custom components
- [ ] Export prop types for reusability

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons/)

---

## Version

Last updated: 2024
Project: IT Asset Management Dashboard
