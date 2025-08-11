import React from 'react';
import { View, FlatList } from 'react-native';
import { wp, getResponsiveColumns, spacing } from '../../utils/responsive';

const ResponsiveGrid = ({ 
  data, 
  renderItem, 
  numColumns,
  spacing: itemSpacing = 'md',
  style,
  contentContainerStyle,
  ...props 
}) => {
  const columns = numColumns || getResponsiveColumns();
  const itemSpace = typeof itemSpacing === 'string' ? spacing[itemSpacing] : itemSpacing;
  
  const renderGridItem = ({ item, index }) => {
    const isLastInRow = (index + 1) % columns === 0;
    const itemStyle = {
      flex: 1,
      marginRight: isLastInRow ? 0 : itemSpace,
      marginBottom: itemSpace,
    };
    
    return (
      <View style={itemStyle}>
        {renderItem({ item, index })}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderGridItem}
      numColumns={columns}
      key={columns} // Force re-render when columns change
      style={style}
      contentContainerStyle={{
        padding: itemSpace,
        ...contentContainerStyle,
      }}
      {...props}
    />
  );
};

export default ResponsiveGrid;