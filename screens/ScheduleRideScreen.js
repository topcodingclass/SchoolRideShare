import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import { collection, getDocs, query, addDoc } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';


const ScheduleRideScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState('')
  const [selectedGroup, setSelectedGroup] = useState();
  const [location, setLocation] = useState();
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [destination, setDestination] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const driver = {id:'testID', carID:'testCar', name:'Bob'}

  useEffect(() => {
    fetchGroups();
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateTime;
    setShowPicker(Platform.OS === 'ios');
    setDateTime(currentDate);
  };

  const fetchGroups = async () => {
    const q = query(collection(db, "groups"));
    const querySnapshot = await getDocs(q);
    let groupsResult = [];

    querySnapshot.forEach((doc) => {
      groupsResult.push({ id: doc.id, ...doc.data() });
    });

    console.log(groupsResult)
    setGroups([...groupsResult]);
  };


  const handleConfirm = async() => {
    try {
      const docRef = await addDoc(collection(db, "groups", group,"schedule" ), {
        date:dateTime,
        driverID: driver.id,
        driverName:driver.name,
        direction: destination,
        carID: driver.carID,
        status:'not started'
    });
    console.log("Document written with ID: ", docRef.id);
    navigation.navigate("Main")

  } catch (e) {
    console.error("Error adding document: ", e);
  }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupItem, selectedGroup?.id === item.id && styles.selectedGroupItem]}
      onPress={() => setSelectedGroup(item)}
    >
      <Text variant="titleMedium">{item.name}</Text>
      <Text>Meeting Spot: {item.meetingSpot} - {item.meetingTime}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1, justifyContent: 'space-between', marginHorizontal: 20 }}>
      <View style={{ flex: 0.4 }}>
        <Picker
          selectedValue={group}
          onValueChange={(itemValue, itemIndex) => setGroup(itemValue)}
          itemStyle={{ fontSize: 15 }}>
          {groups.map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.id} />
          ))}
        </Picker>
      </View>
      <View style={{ flex: 0.3}}>
        <Picker
          selectedValue={destination}
          onValueChange={(itemValue, itemIndex) => {
            setDestination(itemValue);
          }}
          itemStyle={{ fontSize: 15 }}>
          <Picker.Item label="To School" value="school" />
          <Picker.Item label="To Home" value="home" />
        </Picker>
      </View>
      <View style={{ flex:0.3, flexDirection: 'row', justifyContent: 'space-between', margin: 15, alignItems: 'center' }}>
        <Text variant="titleMedium">Select Ride Date:</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={dateTime}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        // showPicker={showPicker} // This prop might not be needed or should be managed inside `DateTimePicker` component if custom
        />
      </View>
      
      <View style={{flex:1}}>

      <Button
        mode="contained"
        style={styles.confirmButton}
        onPress={handleConfirm}
      >
        Confirm Schedule
      </Button>
      </View>
    </View>
  );
}

export default ScheduleRideScreen;

const styles = StyleSheet.create({
  groupItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 5,
  },
  selectedGroupItem: {
    backgroundColor: '#ddd',
  },
  confirmButton: {
    marginTop: 20,
  },
});