// SplashScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar, Dimensions, Text } from 'react-native';

const { width, height } = Dimensions.get('window');
const SHORT = Math.min(width, height);

// Palet warna
const COLORS = {
  primary: '#483AA0',  // background
  bgSoft:  '#F2F1F8',  // teks di atas primary
};

// Helper clamp
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Props:
 * - onFinish?: () => void
 * - minVisibleMs?: number       // default 3000 ms
 * - autoHide?: boolean          // default true
 * - showWordmark?: boolean      // default false (bersih, hanya logo)
 * - wordmark?: string           // default "Dentalization"
 * - tagline?: string            // optional, default undefined
 */
const SplashScreen = ({
  onFinish,
  minVisibleMs = 3000,
  autoHide = true,
  showWordmark = false,
  wordmark = 'Dentalization',
  tagline
}) => {
  useEffect(() => {
    if (!autoHide) return;
    const t = setTimeout(() => onFinish && onFinish(), minVisibleMs);
    return () => clearTimeout(t);
  }, [onFinish, minVisibleMs, autoHide]);

  // Logo BESAR: target 70% sisi terpendek, clamp 260–480 px
  const logoSize = clamp(SHORT * 0.70, 260, 480);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.center}>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
          accessible
          accessibilityLabel="Dentalization Logo"
        />

        {showWordmark && (
          <>
            <View style={{ height: 12 }} />
            <Text style={styles.appName}>{wordmark}</Text>
            {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  appName: {
    color: COLORS.bgSoft,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  tagline: {
    color: 'rgba(242,241,248,0.85)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4
  }
});

export default SplashScreen;
