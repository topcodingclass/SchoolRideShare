import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const RouteTest = () => {
  const origin = { latitude: 33.88917628872742, longitude: -117.87446610854477 };
  const destination = { latitude: 33.87881766181721, longitude: -117.868563927231 };
  const waypoints = [
    { latitude: 33.88513797743602, longitude: -117.86672013383348 },
    
  ];
  const GOOGLE_MAPS_APIKEY = 'AIzaSyAwZ14E06iyM-L465xhMqZlLltS_FNJEjY';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapViewDirections
          origin={origin}
          destination={destination}
          waypoints={waypoints}  // Add waypoints here
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={5}
          strokeColor="hotpink"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default RouteTest;
