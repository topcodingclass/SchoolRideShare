import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { collection, addDoc, doc, updateDoc, Timestamp, getDocs, query } from "firebase/firestore";
import { db } from '../firebase';
import MapView, { Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const RideDetailScreen = ({ route, navigation }) => {
  const { ride, groupID } = route.params || {};
  const [rideStatus, setRideStatus] = useState('not started');
  const [rideTime, setRideTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const GOOGLE_MAPS_APIKEY = 'AIzaSyAwZ14E06iyM-L465xhMqZlLltS_FNJEjY';
  const mapRef = useRef(null);
  const studentLocation = {lat: 33.89124412029269, long: -117.81936657798876}
  const driverLocation = {lat: 33.879000660305664, long: -117.85261151157783}

  console.log(groupID, ride)

  useEffect(() => {
    if (ride) {
    } else {
      navigation.goBack();
    }
  }, [ride]);

  useEffect(() => {
    fetchMessages();
  }, [])

// Reference to the messages collection
    const fetchMessages = async () => {
      console.log('Read message')
      try{
      const messagesCollectionRef = collection(db, "groups", groupID, "schedule", ride.id, "messages");

      // Create a query (you can add conditions if needed)
      const q = query(messagesCollectionRef);

      // Fetch the documents
      const querySnapshot = await getDocs(q);

      // Array to hold the messages
      let messages = [];

      // Loop through the documents and push data to the messages array
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      console.log("##################", messages)
      setMessages(messages)
    } catch (e) {
      console.log("Error reading schedules", e);
    }
    }

  const handleStartRide = async () => {
    setRideStatus('picked up');
    await updateRideStatus('picked up');
  };

  const handleCompleteRide = async () => {
    setRideStatus('completed');
    await updateRideStatus('completed');
  };

  const updateRideStatus = async (status) => {
    try {
      const rideDocRef = doc(db, "groups", groupID, "schedule", ride.id);
      await updateDoc(rideDocRef, { status: status });
    } catch (e) {
      console.log("Error updating ride status", e);
    }
  };

  const handleSetTime = async (eta) => {
    const arrivingTime = new Date();
      arrivingTime.setMinutes(arrivingTime.getMinutes() + eta);
    setRideTime(eta);
    try {
      const rideDocRef = doc(db, "groups", groupID, "schedule", ride.id);
      await updateDoc(rideDocRef, { expectedArriving: arrivingTime, status:'en route to pickup' });
      console.log("**************** Arriving time setup")
    } catch (e) {
      console.log("Error updating Time", e);
    }
  };

  const sendMessage = async () => {
    try {
      const messagesCollectionRef = collection(db, "groups", groupID, "schedule", ride.id, "messages");
      await addDoc(messagesCollectionRef, {
        message: newMessage,
        dateTime: Timestamp.fromDate(new Date())
      });
      setMessages([...messages, { message: newMessage, dateTime: Timestamp.fromDate(new Date()) }]);
      setNewMessage('');
      console.log("Message sent");
    } catch (e) {
      console.log("Error sending message", e);
    }
  };

  const cancelRide = async () => {
    try {
      const rideDocRef = doc(db, "groups", groupID, "schedule", ride.id);
      await updateDoc(rideDocRef, { status: 'cancelled' });
      navigation.goBack();
    } catch (e) {
      console.log("Error cancelling ride", e);
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={{ marginVertical: 5 }}>
      <Text>{item.message} | {item.dateTime.toDate().toDateString()} {item.dateTime.toDate().toLocaleTimeString()} </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
          <Text variant="titleMedium">{ride.date}(To {ride.direction})</Text>
          <Button mode="text" onPress={cancelRide}>
            Cancel Ride
          </Button>
        </View>
        <Divider />
      </View>

      <View style={{ margin: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button mode="outlined" onPress={() => handleSetTime(10)}>Arrive in 10 minutes</Button>
              <Button mode="outlined" onPress={() => handleSetTime(20)}>in 20</Button>
              <Button mode="outlined" onPress={() => handleSetTime(30)}>in 30</Button>
            </View>


      <View style={{ flex: 0.4 }}>
        <Text variant="titleMedium" style={{ marginTop: 15 }}>Messages ({messages.length}):</Text>
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => index.toString()}
         
        />
        <TextInput
          label="Message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button mode="outlined" onPress={sendMessage}>
          Send message
        </Button>


      </View>
      <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: (studentLocation.lat + driverLocation.lat) / 2,
            longitude: (studentLocation.long + driverLocation.long) / 2,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <MapViewDirections
            origin={{ latitude: driverLocation.lat, longitude: driverLocation.long }}
            destination={{ latitude: studentLocation.lat, longitude: studentLocation.long }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="hotpink"
          />

        </MapView>
      <View style={{flex:0.1, marginTop:40}}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

        <Button mode="contained" onPress={handleStartRide} disabled={rideStatus !== 'not started'}>
          Ride started
        </Button>
        <Button mode="contained" onPress={handleCompleteRide} disabled={rideStatus !== 'in progress'}>
          Completed
        </Button>
      </View>
      </View>
    </View>
  );
};

export default RideDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  etaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
    flex: 0.2,
  },
});