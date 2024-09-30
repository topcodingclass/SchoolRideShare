import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { collection, addDoc, doc, updateDoc, Timestamp, getDocs, query } from "firebase/firestore";
import { db } from '../firebase';

const RideDetailScreen = ({ route, navigation }) => {
  const { ride, groupID } = route.params || {};
  const [rideStatus, setRideStatus] = useState('not started');
  const [rideTime, setRideTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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
    setRideTime(eta);
    try {
      const rideDocRef = doc(db, "groups", groupID, "schedule", ride.id);
      await updateDoc(rideDocRef, { eta: eta, status:'en route to pickup' });
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

      <View style={styles.etaButtons}>

        {['5 minutes', '10 minutes', '20 minutes', '30 minutes', '45 minutes', '1 hour'].map((time, index) => (
          <Button style={{ marginVertical: 4 }} key={index} mode="outlined" onPress={() => handleSetTime(time)}>
            Arrive in {time}
          </Button>
        ))}
      </View>


      <View style={{ flex: 0.4 }}>
        <Text variant="titleLarge" style={{ marginTop: 15 }}>Messages ({messages.length}):</Text>
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => index.toString()}
          style={{ marginTop: 20 }}
        />
        <TextInput
          label="Message"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          numberOfLines={3}
          style={{ marginVertical: 10 }}
        />
        <Button mode="contained" onPress={sendMessage}>
          Send message
        </Button>


      </View>
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
    flex: 0.3,
  },
});