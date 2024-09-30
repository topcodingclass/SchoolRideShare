import { StyleSheet, View, SafeAreaView } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper';
import React, {useState, useEffect} from 'react'
import {db, auth} from "../firebase"
import { collection, addDoc } from "firebase/firestore"; 

const CreateGroupScreen = () => {

  const [groupName, setGroupName] = useState('')
  const [school, setSchool] = useState('')
  const [meetingSpot, setMeetingSpot] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [maxNoOfKids, setMaxNoOfKids] = useState('')
  const [address, setAddress] = useState('')

  // const userID = auth.currentUser.uid;

  const createGroup = async() => { 
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        // userID: userID, 
        name: groupName, 
        school: school, 
        meetingSpot: meetingSpot, 
        meetingTime: meetingTime,  
        address: address
    });
    console.log("Document written with ID: ", docRef.id);

  } catch (e) {
    console.error("Error adding document: ", e);
  }
 }

  return (
    <SafeAreaView style={{ margin:15, paddingVertical: 10, justifyContent:'center' }}>
      <View>
        {/* <Text variant="headlineLarge" style={{paddingBottom:15}}>Create a Carpool Group</Text> */}
        <TextInput mode="outlined" label="Group Name" value={groupName} onChangeText={text => setGroupName(text)}/>
        <TextInput mode="outlined" label="School" value={school} onChangeText={text => setSchool(text)}/>
        <TextInput mode="outlined" label="Meeting Spot" value={meetingSpot} onChangeText={text => setMeetingSpot(text)}/>
        <TextInput mode="outlined" label="Address" value={address} onChangeText={text => setAddress(text)}/>
        <TextInput mode="outlined" label="Meeting Time" value={meetingTime} onChangeText={text => setMeetingTime(text)}/>
        <TextInput mode="outlined" label="Maximum Number of Kids" value={maxNoOfKids} onChangeText={text => setMaxNoOfKids(text)}/>
        
      </View>
      <View style={{ flexDirection:'row', paddingVertical: 17, justifyContent:'space-around', marginTop:50}}>
        <Button icon='account-multiple-plus' mode="contained-tonal" onPress={createGroup} style={{ width: 170 }}>
          Create Group
        </Button>
        {/* onPress={()=>navigation.navigate('MainScreen'))} */}
        <Button icon='cancel' mode="contained-tonal" style={{ width: 170 }}>
          Cancel
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default CreateGroupScreen

const styles = StyleSheet.create({})