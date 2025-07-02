import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Button, Input, Card, useTheme } from '../../components/common';

const TailwindStyleExample = () => {
  const theme = useTheme();

  // Example of inline styling with Tailwind-like utilities
  const containerStyle = {
    flex: 1,
    backgroundColor: theme.scheme.background,
    ...theme.space.p4,
  };

  const headerStyle = {
    ...theme.text.xl2,
    ...theme.font.bold,
    color: theme.scheme.text,
    ...theme.space.mb6,
    textAlign: 'center',
  };

  const sectionStyle = {
    ...theme.space.mb8,
  };

  const sectionTitleStyle = {
    ...theme.text.lg,
    ...theme.font.semibold,
    color: theme.scheme.text,
    ...theme.space.mb4,
  };

  const exampleBoxStyle = {
    backgroundColor: theme.colors.blue50,
    ...theme.space.p4,
    ...theme.rounded.lg,
    ...theme.space.mb4,
    borderWidth: 1,
    borderColor: theme.colors.blue200,
  };

  const codeStyle = {
    ...theme.text.sm,
    ...theme.font.mono,
    color: theme.colors.blue800,
    backgroundColor: theme.colors.blue100,
    ...theme.space.p2,
    ...theme.rounded.md,
    ...theme.space.mt2,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={headerStyle}>
          Tailwind-like Styling System
        </Text>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Spacing Utilities</Text>
          <View style={exampleBoxStyle}>
            <Text style={theme.text.base}>
              Use spacing utilities like theme.space.p4, theme.space.mb6, theme.space.mx2
            </Text>
            <Text style={codeStyle}>
              {`...theme.space.p4  // padding: 16\n...theme.space.mb6 // marginBottom: 24\n...theme.space.mx2 // marginHorizontal: 8`}
            </Text>
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Typography Utilities</Text>
          <View style={exampleBoxStyle}>
            <Text style={theme.text.base}>
              Typography utilities for consistent text styling
            </Text>
            <Text style={codeStyle}>
              {`...theme.text.xl2   // fontSize: 24\n...theme.font.bold  // fontWeight: 'bold'\n...theme.font.mono  // fontFamily: monospace`}
            </Text>
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Component Examples</Text>
          
          <Card shadow="lg" padding="lg">
            <Text style={[theme.text.lg, theme.font.semibold, theme.space.mb4]}>
              Card with Large Padding
            </Text>
            
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value=""
              onChangeText={() => {}}
            />
            
            <Button
              title="Submit"
              onPress={() => {}}
              variant="primary"
              size="lg"
            />
          </Card>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Color & Theming</Text>
          <View style={exampleBoxStyle}>
            <Text style={theme.text.base}>
              Colors adapt to theme and role-based contexts
            </Text>
            <Text style={codeStyle}>
              {`backgroundColor: theme.scheme.surface\ncolor: theme.scheme.text\nborderColor: theme.colors.primary`}
            </Text>
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Shadow & Border Utilities</Text>
          <View style={exampleBoxStyle}>
            <Text style={theme.text.base}>
              Consistent shadows and border radius
            </Text>
            <Text style={codeStyle}>
              {`...theme.shadows.md    // elevation + shadowOffset\n...theme.rounded.lg    // borderRadius: 8\n...theme.rounded.full  // borderRadius: 9999`}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TailwindStyleExample;
