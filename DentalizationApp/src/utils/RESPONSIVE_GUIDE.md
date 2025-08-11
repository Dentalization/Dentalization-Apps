# Responsive Design Guide

Panduan penggunaan komponen dan utility responsif untuk aplikasi Dentalization.

## Utility Functions

### Dimensi Responsif
```javascript
import { wp, hp } from '../utils/responsive';

// Width percentage to DP
const width = wp(50); // 50% dari lebar layar

// Height percentage to DP
const height = hp(25); // 25% dari tinggi layar
```

### Font Sizes
```javascript
import { fontSizes, RFValue } from '../utils/responsive';

// Predefined font sizes
const styles = {
  title: { fontSize: fontSizes.title },
  body: { fontSize: fontSizes.md },
  caption: { fontSize: fontSizes.sm },
};

// Custom responsive font
const customFont = RFValue(18);
```

### Spacing
```javascript
import { spacing } from '../utils/responsive';

const styles = {
  container: {
    padding: spacing.lg,
    margin: spacing.md,
  },
};
```

### Device Detection
```javascript
import { isTablet, isSmallDevice, isLargeDevice } from '../utils/responsive';

if (isTablet()) {
  // Tablet-specific layout
} else if (isSmallDevice()) {
  // Small device layout
} else {
  // Default layout
}
```

## Responsive Components

### ResponsiveContainer
```javascript
import ResponsiveContainer from '../components/layouts/ResponsiveContainer';

<ResponsiveContainer 
  safeArea={true}
  padding="lg"
  backgroundColor="#F2F1F8"
>
  {/* Content */}
</ResponsiveContainer>
```

### ResponsiveCard
```javascript
import ResponsiveCard from '../components/layouts/ResponsiveCard';

<ResponsiveCard 
  padding="lg"
  margin="md"
  borderRadius="lg"
  onPress={() => {}}
>
  {/* Card content */}
</ResponsiveCard>
```

### ResponsiveText
```javascript
import ResponsiveText from '../components/layouts/ResponsiveText';

<ResponsiveText 
  size="lg"
  weight="bold"
  color="#333333"
  align="center"
>
  Responsive Text
</ResponsiveText>
```

### ResponsiveGrid
```javascript
import ResponsiveGrid from '../components/layouts/ResponsiveGrid';

<ResponsiveGrid 
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  numColumns={2} // Optional, auto-detects if not provided
  spacing="md"
/>
```

## Best Practices

1. **Gunakan percentage-based dimensions** daripada fixed values
2. **Gunakan spacing constants** untuk konsistensi
3. **Test di berbagai ukuran layar** (small, medium, large, tablet)
4. **Gunakan ResponsiveText** untuk semua text elements
5. **Leverage device detection** untuk layout yang berbeda

## Migration dari Hardcoded Values

### Before (Hardcoded)
```javascript
const styles = {
  container: {
    width: 300,
    height: 200,
    padding: 20,
    margin: 10,
    fontSize: 16,
    borderRadius: 8,
  },
};
```

### After (Responsive)
```javascript
import { wp, hp, spacing, fontSizes, borderRadius } from '../utils/responsive';

const styles = {
  container: {
    width: wp(80),
    height: hp(25),
    padding: spacing.lg,
    margin: spacing.sm,
    fontSize: fontSizes.md,
    borderRadius: borderRadius.md,
  },
};
```

## Breakpoints

- **Small Device**: < 375px width
- **Medium Device**: 375px - 414px width
- **Large Device**: >= 414px width
- **Tablet**: Detected by pixel density and dimensions

## Icon Sizes

```javascript
import { iconSizes } from '../utils/responsive';

// Available sizes: xs, sm, md, lg, xl, xxl
<Icon size={iconSizes.md} />
```