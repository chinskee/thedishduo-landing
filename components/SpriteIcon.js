import React from 'react';
import { View, Image } from 'react-native';

export default function SpriteIcon({ iconIndex = 0, iconSize = 48, spritePath, iconCount = 5 }) {
  // Update iconCount if you add more icons in the future!
  return (
    <View style={{
      width: iconSize,
      height: iconSize,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Image
        source={spritePath}
        style={{
          width: iconSize * iconCount,
          height: iconSize,
          resizeMode: 'cover',
          marginLeft: -iconIndex * iconSize,
        }}
      />
    </View>
  );
}