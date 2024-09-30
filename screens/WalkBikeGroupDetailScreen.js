import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { collection, addDoc, getDocs, query, Timestamp, orderBy, onSnapshot, where, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import MapView, { Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const WalkBikeGroupDetailScreen = ({ route, navigation }) => {
    const { group, user } = route.params || {};
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [schedules, setSchedules] = useState([])
    const [messages, setMessages] = useState([]);

    // const user = { kidID: '12345', kidName: 'Karate Kid', driverID: '56789', driverName: 'Samurai Ninja' }
    const GOOGLE_MAPS_APIKEY = 'AIzaSyAwZ14E06iyM-L465xhMqZlLltS_FNJEjY';
    const destination = { latitude: 33.898118589335326, longitude: -117.79052497114252 };

    console.log(user)

    navigation.setOptions({ title: group.name })

    useEffect(() => {
        if (group) {
            fetchMembers();
            fetchMessages();
        } else {
            navigation.goBack();
        }
    }, [group]);

    const fetchMessages = async () => {
        const messagesCollectionRef = collection(db, "walkBikeGroups", group.id, "messages");
        const q = query(messagesCollectionRef, orderBy('dateTime', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log("#######Messages:", fetchedMessages)
            setMessages(fetchedMessages);
        });
    }

    const fetchMembers = async () => {
        const q = query(collection(db, "walkBikeGroups", group.id, "members"));
        const querySnapshot = await getDocs(q);
        let membersResult = [];
        querySnapshot.forEach((doc) => {
            membersResult.push({ id: doc.id, ...doc.data() });
        });
        setMembers(membersResult);
    }

    const renderMessageItem = ({ item }) => (
        <View style={styles.messageItem}>
             <Divider />
            <Text>{item.message} | {item.dateTime.toDate().toDateString()} {item.dateTime.toDate().toLocaleTimeString()}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View>
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text>{item.kidName}</Text>
            </View>
        </View>
    );

    if (!members) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No member information not available.</Text>
            </View>
        );
    }

    //Function for send message
    const sendMessage = async () => {
        try {
            const messagesCollectionRef = collection(db, "walkBikeGroups", group.id, "messages");
            // Add the document with auto-generated ID
            await addDoc(messagesCollectionRef, {
                message: message,
                dateTime: Timestamp.fromDate(new Date()),
                kidID: user.kidID
            });

            console.log("Document written with ID: ", messagesCollectionRef.id);
        } catch (e) {
            console.log("Error adding rider", e);
        }
    }

    const joinGroup = async () => {
        try {
            const membersCollectionRef = collection(db, "walkBikeGroups", group.id, "members");
            await addDoc(membersCollectionRef, {
                kidID: user.kidID,
                kidName: user.kidName
            });
            fetchMembers();
        } catch (e) {
            console.log("Error joining group", e);
        }
    };

    const leaveGroup = async () => {
        try {
            const membersCollectionRef = collection(db, "walkBikeGroups", group.id, "members");
            const q = query(membersCollectionRef, where("kidID", "==", user.kidID));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (memberDoc) => {
                await deleteDoc(doc(db, "walkBikeGroups", group.id, "members", memberDoc.id));
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
            <View style={styles.card}>
                <Text variant="titleLarge">Members ({members.length}):</Text>
                <FlatList
                    data={members}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </View>

            <View style={styles.card}>
                <Text variant="titleLarge">Messages ({messages.length}):</Text>
                <FlatList
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.id} // Use message ID as the key
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
            <Text variant="titleMedium">Suggested route</Text>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: (group.location.latitude + destination.latitude) / 2,
                    longitude: (group.location.longitude + destination.longitude) / 2,
                    latitudeDelta: 0.0292,
                    longitudeDelta: 0.0221,
                }}
            >
                <MapViewDirections
                    origin={group.location}
                    destination={destination}
                    //waypoints={waypoints}  // Add waypoints here
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={5}
                    strokeColor="hotpink"
                />
            </MapView>

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
    map: {
        marginTop: 5,
        flex: 0.4, width: '100%'
    },
});


export default WalkBikeGroupDetailScreen;
