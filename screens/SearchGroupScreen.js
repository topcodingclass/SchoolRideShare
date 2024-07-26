import React, {useState, useEffect} from 'react'
import { StyleSheet,  View, SafeAreaView, FlatList } from 'react-native'
import { TextInput,Text, Button } from 'react-native-paper';
import {db} from '../firebase';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import MapView, { Marker } from 'react-native-maps';

const SearchGroupScreen = () => {
    const [school, setSchool] = useState('')
    const [searchLocation, setSearchLocation] = useState('')
    const [groups, setGroups] = useState([])
    const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
    const fetchGroups = async () =>{
      const q = query(collection(db, "groups"), where("school", "==", school));
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

    const renderItem =({item}) =>(
      <View style={{margin:5}}>
        <Text variant="titleMedium">{item.name}</Text>
        <Text>Meeting Spot: {item.meetingSpot} - {item.meetingTime}</Text>
      </View>
    )

  return (
    <SafeAreaView style={{margin:5}}>
      <TextInput label="School" value={school} onChangeText={setSchool} />
      <TextInput label="Location" value={searchLocation} onChangeText={setSearchLocation} />
      <Button icon="layers-search-outline" mode="elevated" onPress={searchGroup} style={{marginVertical:10}}>
        Search
      </Button>
      <FlatList data={groups} renderItem={renderItem} />
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
          />
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
      {errorMsg && <Text>{errorMsg}</Text>}
    </SafeAreaView>
  )
}

export default SearchGroupScreen

const styles = StyleSheet.create({})