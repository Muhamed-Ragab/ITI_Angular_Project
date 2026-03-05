# Core Utilities

Reusable utility functions for the application.

## Format Utilities

### `formatCurrency(amount, options?)`

Formats a number as Egyptian Pound (EGP) currency using `Intl.NumberFormat`.

**Parameters:**
- `amount: number` - The amount to format
- `options?: object` - Optional formatting options:
  - `showDecimals?: boolean` - Show decimal places (default: `true`)
  - `minimumFractionDigits?: number` - Minimum fraction digits (default: `2`)
  - `maximumFractionDigits?: number` - Maximum fraction digits (default: `2`)

**Returns:** `string` - Formatted currency string (e.g., `"EGP 1,234.56"`)

**Example:**
```typescript
import { formatCurrency } from '@core/utils';

formatCurrency(1234.56);                    // 'EGP 1,234.56'
formatCurrency(1234.56, { showDecimals: false }); // 'EGP 1,235'
formatCurrency(100, { minimumFractionDigits: 0 }); // 'EGP 100'
```

---

### `formatRelativeTime(dateString, options?)`

Formats a date with relative time (e.g., "created 2 hours ago") using `Intl.RelativeTimeFormat`.

**Parameters:**
- `dateString: string | Date` - The date to format
- `options?: object` - Optional formatting options:
  - `prefix?: 'created' | 'updated' | 'ordered' | 'paid'` - Time prefix (default: `'created'`)
  - `showExactTime?: boolean` - Show exact time (default: `false`)

**Returns:** `string` - Formatted relative time string

**Example:**
```typescript
import { formatRelativeTime } from '@core/utils';

formatRelativeTime('2024-01-15T10:30:00Z'); 
// 'created 2 hours ago'

formatRelativeTime('2024-01-15T10:30:00Z', { prefix: 'updated' }); 
// 'updated 2 hours ago'

formatRelativeTime('2024-01-15T10:30:00Z', { prefix: 'ordered', showExactTime: true }); 
// 'ordered 2 hours ago at 10:30 AM'
```

---

### `formatDate(dateString, options?)`

Formats a date to a readable string.

**Parameters:**
- `dateString: string | Date` - The date to format
- `options?: object` - Optional formatting options:
  - `showTime?: boolean` - Show time (default: `false`)
  - `showYear?: boolean` - Show year (default: `true`)

**Returns:** `string` - Formatted date string

**Example:**
```typescript
import { formatDate } from '@core/utils';

formatDate('2024-01-15T10:30:00Z'); 
// 'Jan 15, 2024'

formatDate('2024-01-15T10:30:00Z', { showTime: true }); 
// 'Jan 15, 2024, 10:30 AM'

formatDate('2024-01-15T10:30:00Z', { showYear: false }); 
// 'Jan 15'
```

---

## Usage in Components

### Standalone Components

```typescript
import { Component } from '@angular/core';
import { formatCurrency, formatRelativeTime } from '@core/utils';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>Price: {{ formatCurrency(1234.56) }}</p>
      <p>Order {{ formatRelativeTime(orderDate, { prefix: 'ordered' }) }}</p>
    </div>
  `
})
export class ExampleComponent {
  orderDate = new Date().toISOString();
  
  // Expose utility functions to template
  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
  
  formatRelativeTime(date: string, prefix: string): string {
    return formatRelativeTime(date, { prefix });
  }
}
```

---

## Benefits

1. **Consistency**: All currency and date formatting uses the same format across the application
2. **Localization**: Uses `Intl` API for proper locale-aware formatting
3. **Maintainability**: Single source of truth for formatting logic
4. **Type Safety**: Full TypeScript support with proper types and documentation
5. **Flexibility**: Optional parameters for custom formatting needs
