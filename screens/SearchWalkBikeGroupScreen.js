import React, { useState, useEffect } from 'react'
import { StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native'
import { Provider, TextInput, Text, Button } from 'react-native-paper';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import {Dropdown} from "react-native-paper-dropdown";

const SearchWalkBikeGroupScreen = ({ navigation, route }) => {
  const [school, setSchool] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [type, setType] = useState('')
  const [groups, setGroups] = useState([])
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDropDown, setShowDropDown] = useState(false);

  const {user} = route.params;

  const typeList = [
    { label: "Walk", value: "walk" },
    { label: "Bike", value: "bike" }
  ]
  

  // request permission and get curret position
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // useEffect(()=>{
  //   fetchGroups()
  // },[])

  const searchGroup = () => {
    console.log("Start search")
    fetchGroups()
  }

  //read groups from firebase
  const fetchGroups = async () => {
    const q = query(collection(db, "walkBikeGroups"), where("school", "==", school), where("type", "==", type));
    const querySnapshot = await getDocs(q);
    let groupsResult = [];

    querySnapshot.forEach((doc) => {
      groupsResult.push({ id: doc.id, ...doc.data() });
      console.log(doc.data())
    });
    // Sort rideByDate based on dateTime in ascending order
    //rideByDate.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());

    setGroups([...groupsResult]);
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={{ margin: 5 }} onPress={() => navigation.navigate("Walk Bike Group Detail", { group: item, user:user })}>
      <Text variant="titleMedium">{item.name}</Text>
      <Text>Meeting Spot: {item.meetingSpot} - {item.meetingTime}</Text>
    </TouchableOpacity>
  )

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, margin: 5 }}>

        <TextInput label="School" value={school} onChangeText={setSchool} style={{ marginBottom: 10 }} />
        <TextInput label="Location" value={searchLocation} onChangeText={setSearchLocation} style={{ marginBottom: 10 }} />
        <Dropdown
          label={"Type"}
          mode={"outlined"}          
          value={type}
          onSelect={setType}
          options={typeList}
          style={{ marginTop: 40, marginBottom: 50 }}
        />


        <Button
          icon="layers-search-outline"
          mode="elevated"
          onPress={searchGroup}
          style={{ marginVertical: 10 }}
        >
          Search
        </Button>


        <FlatList data={groups} renderItem={renderItem} />
        {location ? (
          <MapView
            style={{ flex: 1, width: '100%' }}
            initialRegion={{
              latitude: 33.891076733676805,
              longitude: -117.79237294534954,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker coordinate={{ latitude: 33.891076733676805, longitude: -117.79237294534954 }}>
              <View style={styles.customMarker}>
                <Text style={styles.markerText}>🏠</Text>
              </View>
            </Marker>

            {groups.map(marker => (
              <Marker
                key={marker.id}
                coordinate={marker.location}
                title={marker.name}
                onPress={() => navigation.navigate("Group Detail", { group: marker })}
              >
                <View style={styles.groupMarker}>
                  <Text style={styles.markerText}>📍</Text>
                  <Text style={styles.markerText}>{marker.name}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <Text>Loading...</Text>
        )}
        {errorMsg && <Text>{errorMsg}</Text>}
      </SafeAreaView>
    </Provider>
  )
}

const styles = StyleSheet.create({
  customMarker: {
    width: 40,   // Ensure width is set
    height: 40,  // Ensure height is set
    backgroundColor: 'gray', // Optional: for visibility
    borderRadius: 20, // Optional: to make it circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupMarker: {
    width: 120,   // Ensure width is set
    height: 40,  // Ensure height is set
    justifyContent: 'center',
    alignItems: 'center',
  },

  markerText: {
    color: 'red',
  },
});

export default SearchWalkBikeGroupScreen

