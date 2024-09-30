import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MyMap = () => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }}>
        {/* Custom Marker */}
        <View style={styles.customMarker}>
          <Text style={styles.markerText}>🏠</Text>
          <Text style={styles.markerText}>My Location</Text>
        </View>
      </Marker>
    </MapView>
  );
};

const styles = StyleSheet.create({
  customMarker: {
    width: 90,   // Ensure width is set
    height: 40,  // Ensure height is set
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default MyMap;
