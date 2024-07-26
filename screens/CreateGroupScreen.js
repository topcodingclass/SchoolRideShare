import { StyleSheet, Text, View, SafeAreaView} from 'react-native'
import React, {useState, useEffect} from 'react'
import { TextInput, Button } from 'react-native-paper';

const CreateGroupScreen = () => {

  const [group, setGroup] = useState('')
  const [school, setSchool] = useState('')
  const [meetingSpot, setMeetingSpot] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [maxNoOfKids, setMaxNoOfKids] = useState('')

  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{flex: 1}}>
        <TextInput label="Group Name" value={group} onChangeText={setGroup} />
        <TextInput label="School" value={school} onChangeText={setSchool} />
        <TextInput label="Meeting Spot" value={meetingSpot} onChangeText={setMeetingSpot} />
        <TextInput label="Meeting Time" value={meetingTime} onChangeText={setMeetingTime} />
        <TextInput label="Maximum Number of Kids" value={maxNoOfKids} onChangeText={setMaxNoOfKids} />
      </View>
      <View style={{marginHorizontal:10, marginBottom:50, flex: 0.1}}>
        <Button icon="account-multiple-plus" mode="contained" onPress={() => console.log('Pressed')}>
          Create
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default CreateGroupScreen

const styles = StyleSheet.create({})