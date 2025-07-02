# Tailwind-like Styling System

This project uses a Tailwind-like utility system for consistent and maintainable styling across the React Native app. Instead of using `StyleSheet.create()`, we use inline style objects with utility functions from the theme provider.

## Why This Approach?

1. **Consistency**: All styling goes through the theme system
2. **Maintainability**: Easy to update styles globally via theme
3. **Readability**: Style intentions are clear and declarative
4. **Performance**: No StyleSheet lookups or array merging
5. **Flexibility**: Easy to compose and override styles

## Basic Usage

### Before (StyleSheet)
```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

// Usage
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>
```

### After (Tailwind-like Utilities)
```javascript
import { useTheme } from '../components/common';

const MyComponent = () => {
  const theme = useTheme();
  
  const containerStyle = {
    ...theme.space.p4,
    ...theme.space.mb6,
    backgroundColor: theme.scheme.surface,
    ...theme.rounded.lg,
  };
  
  const titleStyle = {
    ...theme.text.lg,
    ...theme.font.bold,
    color: theme.scheme.text,
  };
  
  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>Hello</Text>
    </View>
  );
};
```

## Available Utility Classes

### Spacing
- `theme.space.p1` through `theme.space.p8` - Padding
- `theme.space.m1` through `theme.space.m8` - Margin
- `theme.space.px1` through `theme.space.px8` - Horizontal padding
- `theme.space.py1` through `theme.space.py8` - Vertical padding
- `theme.space.mx1` through `theme.space.mx8` - Horizontal margin
- `theme.space.my1` through `theme.space.my8` - Vertical margin
- `theme.space.mt1` through `theme.space.mt8` - Margin top
- `theme.space.mb1` through `theme.space.mb8` - Margin bottom
- `theme.space.ml1` through `theme.space.ml8` - Margin left
- `theme.space.mr1` through `theme.space.mr8` - Margin right

### Typography
- `theme.text.xs` - Extra small text
- `theme.text.sm` - Small text
- `theme.text.base` - Base text size
- `theme.text.lg` - Large text
- `theme.text.xl` - Extra large text
- `theme.text.xl2` - 2X large text

### Font Weights
- `theme.font.normal` - Normal weight
- `theme.font.medium` - Medium weight
- `theme.font.semibold` - Semi-bold weight
- `theme.font.bold` - Bold weight
- `theme.font.mono` - Monospace font

### Border Radius
- `theme.rounded.none` - No border radius
- `theme.rounded.sm` - Small border radius
- `theme.rounded.md` - Medium border radius
- `theme.rounded.lg` - Large border radius
- `theme.rounded.xl` - Extra large border radius
- `theme.rounded.full` - Full/circle border radius

### Shadows
- `theme.shadows.sm` - Small shadow
- `theme.shadows.md` - Medium shadow
- `theme.shadows.lg` - Large shadow
- `theme.shadows.xl` - Extra large shadow

### Colors
- `theme.scheme.background` - Background color
- `theme.scheme.surface` - Surface color
- `theme.scheme.text` - Primary text color
- `theme.colors.primary` - Primary brand color
- `theme.colors.error` - Error color
- `theme.colors.success` - Success color
- `theme.colors.gray100` through `theme.colors.gray900` - Gray scale
- Role-based colors: `theme.colors.roleColors.primary`

## Component Examples

### Button Component
```javascript
const buttonStyle = {
  ...theme.space.px6,
  ...theme.space.py3,
  ...theme.rounded.lg,
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonTextStyle = {
  ...theme.text.base,
  ...theme.font.semibold,
  color: theme.colors.white,
};
```

### Input Component
```javascript
const inputContainerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.gray300,
  backgroundColor: theme.scheme.surface,
  ...theme.rounded.lg,
  ...theme.space.px3,
  minHeight: 48,
};

const inputStyle = {
  flex: 1,
  color: theme.scheme.text,
  ...theme.text.body,
  ...theme.space.py3,
};
```

### Card Component
```javascript
const cardStyle = {
  backgroundColor: theme.scheme.surface,
  ...theme.rounded.lg,
  ...theme.shadows.md,
  ...theme.space.mb4,
  ...theme.space.p4,
};
```

## Benefits Over Traditional StyleSheet

1. **Theme Integration**: All styles go through the theme system automatically
2. **Role-based Styling**: Colors and styles adapt based on user role
3. **Dark Mode**: Automatic dark mode support through theme.scheme
4. **Consistency**: Spacing, typography, and colors are consistent
5. **Composability**: Easy to combine multiple utilities
6. **Override Friendly**: Easy to override specific properties when needed

## Migration Strategy

When updating existing components:

1. Remove `StyleSheet` import
2. Replace `styles` object with inline style objects
3. Use theme utilities for common properties
4. Keep custom properties as regular style objects
5. Test component renders correctly

## Performance Considerations

- Inline styles are as performant as StyleSheet in React Native
- Theme utilities are pre-computed, no runtime calculations
- Object spreading is optimized by JavaScript engines
- Consider extracting complex style objects to variables for reuse within components

## Best Practices

1. **Use utilities for common properties**: spacing, typography, colors
2. **Extract complex styles**: Create style objects for complex components
3. **Compose systematically**: Start with layout, then spacing, then colors
4. **Override sparingly**: Use custom properties only when utilities don't suffice
5. **Stay consistent**: Use the same utility patterns across components
