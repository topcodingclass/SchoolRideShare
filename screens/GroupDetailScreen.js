import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from '../firebase';
import { doc, addDoc, Timestamp, where, deleteDoc } from "firebase/firestore";
import { TextInput, Text, Button, Divider } from 'react-native-paper';

const GroupDetailScreen = ({ route, navigation }) => {
    const { group, user } = route.params || {};
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [schedules, setSchedules] = useState([])

    console.log(user)
    navigation.setOptions({ title: group.name })

    useEffect(() => {
        if (group) {
            fetchMembers();
            fetchSchedules();
        } else {
            navigation.goBack();
        }
    }, [group]);

    const fetchMembers = async () => {
        const q = query(collection(db, "groups", group.id, "members"));
        const querySnapshot = await getDocs(q);
        let membersResult = [];
        querySnapshot.forEach((doc) => {
            membersResult.push({ id: doc.id, ...doc.data() });
        });
        setMembers(membersResult);
    }

    const fetchSchedules = async () => {
        const q = query(collection(db, "groups", group.id, "schedule"));
        const querySnapshot = await getDocs(q);
        let scheduleResult = [];
        querySnapshot.forEach((doc) => {
            scheduleResult.push({ id: doc.id, ...doc.data() });
        });
        setSchedules(scheduleResult);
    }


    const renderItem = ({ item }) => (
        <View>
            <Divider />
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }} 
                onPress={() => navigation.navigate("Member", { member: item})}>
                <Text>{item.driverName} - {item.kidName}</Text>
                <Text style={{ color: 'blue' }}>{item.status}</Text>
            </TouchableOpacity>
        </View>
    );

    if (!members) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No member information not available.</Text>
            </View>
        );
    }

    const renderScheduleItem = ({ item }) => (
        <View>
            <Divider />
            <TouchableOpacity  
                onPress={() => navigation.navigate("Ride Detail", { ride: item, groupID: group.id })}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text>{item.date.toDate().toDateString()}</Text>
                <Text style={{ color: 'blue' }}>{item.status}</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginVertical:3}}>

                <Text>To {item.direction}</Text>
                
                    <Text>Driver: {item.driverName}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (!schedules) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No schedule information is available.</Text>
            </View>
        );
    }
    //Function for send message
    const sendMessage = async () => {
        try {
            const messagesCollectionRef = collection(db, "groups", group.id, "messages");
            // Add the document with auto-generated ID
            await addDoc(messagesCollectionRef, {
                message: message,
                dateTime: Timestamp.fromDate(new Date())
            });

            console.log("Document written with ID: ", messagesCollectionRef.id);
        } catch (e) {
            console.log("Error adding rider", e);
        }
    }

    const joinGroup = async () => {
        try {
            const membersCollectionRef = collection(db, "groups", group.id, "members");
            await addDoc(membersCollectionRef, {
                driverID: user.id,
                driverName: user.name,
                kidID: user.kidID,
                kidName: user.kidName,
                status: "pending"
            });
            fetchMembers();
        } catch (e) {
            console.log("Error joining group", e);
        }
    };

    const leaveGroup = async () => {
        try {
            const membersCollectionRef = collection(db, "groups", group.id, "members");
            const q = query(membersCollectionRef, where("kidID", "==", user.kidID));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (memberDoc) => {
                await deleteDoc(doc(db, "groups", group.id, "members", memberDoc.id));
                console.log("Member removed")
            });
            fetchMembers();
        } catch (e) {
            console.log("Error leaving group", e);
        }
    };



    return (
        <View style={{ flex: 1, margin: 7 }}>
            <View style={{ flex: 0.1 }}>
                <Text variant="titleMedium">Meeting Spot: {group.meetingSpot}</Text>
                <Text variant="titleMedium">Meeting Time: {group.meetingTime}</Text>
            </View>
            <View style={styles.memberCard}>
                <Text variant="titleLarge" style={{ marginTop: 15 }}>Members ({members.length}):</Text>
                <FlatList
                    data={members}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </View>
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', margin: 5 }}>
                    <Text variant="titleLarge">Schedules ({schedules.length}):</Text>
                    <Button icon="plus" onPress={()=>navigation.navigate("Schedule Ride")}>Add Schedule</Button>
                </View>
                <FlatList
                    data={schedules}
                    renderItem={renderScheduleItem}
                    keyExtractor={item => item.id}
                />
            </View>
            <View style={{ flex: 0.3 }}>
                <TextInput
                    style={{ marginVertical: 10 }}
                    placeholder="Enter Message"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                />
                <Button style={{ width: 100, alignSelf: 'flex-end' }} icon="message" mode="contained" onPress={sendMessage}>
                    Send
                </Button>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', position: 'absoluete', bottom: 0, marginVertical: 50 }}>
                <Button icon="account-multiple-plus-outline" mode="elevated" onPress={joinGroup}>
                    Join Group
                </Button>
                <Button icon="logout" mode="elevated" onPress={leaveGroup}>
                    Leave Group
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 0.4,
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    memberCard: {
        flex: 0.2,
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default GroupDetailScreen;
