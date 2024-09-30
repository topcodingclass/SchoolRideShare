import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
import { Button, Divider, Text, TextInput, Card, IconButton } from 'react-native-paper';
import { auth, db } from '../firebase'; // Make sure to import your Firebase setup
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const MainScreen = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [kids, setKids] = useState([]);
    const [selectedKid, setSelectedKid] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    //From Hannah
    const [schedules, setSchedules] = useState({});
    const [groups, setGroups] = useState({});
    const [todaysRide, setTodaysRide] = useState(null);
    const today = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const date = month + '-' + today + '-' + year;

    const userID = auth.currentUser.uid;

    useEffect(() => {
        fetchUserData();
        fetchKidsData();
        fetchGroups();
        fetchSchedules();
        fetchTodaysRide();
    }, []);

    //From Hannah

    // Function to fetch user data from Firestore
    const fetchUserData = async () => {
        setUser({});
        const docRef = doc(db, "drivers", userID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUser({ id: userID, ...docSnap.data() });
        } else {
            console.log("No such document!");
        }
    };

    //From Hannah
    const fetchGroups = async () => {
        const querySnapshot = await getDocs(collection(db, "groups"));

        let myGroups = [];

        // Loop through each group and check if you're a member
        await Promise.all(querySnapshot.docs.map(async (groupDoc) => {
            const groupData = groupDoc.data();

            // Fetch members subcollection for each group
            const membersSnapshot = await getDocs(collection(db, "groups", groupDoc.id, "members"));

            const isInGroup = membersSnapshot.docs.some((memberDoc) => {
                const memberData = memberDoc.data();
                return memberData.driverID === userID;
            });

            if (isInGroup) {
                myGroups.push({ id: groupDoc.id, ...groupData });
            }
        }));

        console.log("Groups you're in:", myGroups);


        // const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // console.log(docsData)
        setGroups([...myGroups])
    };

    const fetchSchedules = async () => {
        const querySnapshot = await getDocs(collection(db, "groups"));
        let futureSchedules = [];

        // Get the current date
        const now = new Date();

        // Loop through each group and check if you're a member
        await Promise.all(querySnapshot.docs.map(async (groupDoc) => {
            const groupData = groupDoc.data();

            // Fetch members subcollection for each group
            const membersSnapshot = await getDocs(collection(db, "groups", groupDoc.id, "members"));

            const isInGroup = membersSnapshot.docs.some((memberDoc) => {
                const memberData = memberDoc.data();
                return memberData.driverID === userID;
            });

            if (isInGroup) {
                console.log("Fetch my group schedule")
                // Fetch the schedule subcollection for this group
                const scheduleSnapshot = await getDocs(collection(db, "groups", groupDoc.id, "schedule"));
                
                // Filter future schedules
                const futureGroupSchedules = scheduleSnapshot.docs
                    .map((doc) => {
                        const scheduleData = doc.data();
                        // Convert Firestore Timestamp to Date
                        const scheduleDate = scheduleData.date.toDate().toDateString()
                        return { id: doc.id, ...scheduleData, date: scheduleDate, groupID: groupDoc.id };
                    })
                   .filter(schedule => schedule.date > now.toDateString()); // Filter for future dates
                console.log("$$$$$$$$$", futureGroupSchedules)
                // Append to futureSchedules array
                futureSchedules = [...futureSchedules, ...futureGroupSchedules];
            }
        }));

        console.log("Future schedules:", futureSchedules);
        setSchedules([...futureSchedules]);
   
};


const fetchTodaysRide = async () => {
    const q = query(collection(db, "schedule"), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("############### Today's ride", docsData)
    setTodaysRide([...docsData])
};


const fetchKidsData = async () => {
    const querySnapshot = await getDocs(collection(db, "drivers", userID, "kids"));
    const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setKids(docsData);
    if (docsData.length > 0) {
        setSelectedKid(docsData[0]); // Select the first kid by default
        setUser(prevUser => ({ 
            ...prevUser, 
            kidID: docsData[0].id, 
            kidName: docsData[0].name 
        }));
    }
};

const handleSwitchKid = () => {
    setModalVisible(true);
};

const handleKidSelection = (kid) => {
    setSelectedKid(kid);
    setUser(prevUser => ({ 
        ...prevUser, 
        kidID: docsData[0].id, 
        kidName: docsData[0].name 
    }));
    setModalVisible(false);
};

const renderSchedule = ({ item }) => (
    <View>
        <Divider />
        <Card.Title
             title={`${item.date} To ${item.direction} `}
             subtitle ={`${item.driverName}:    ${item.status}`}
            right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate('Ride Detail', {ride:item, groupID: item.groupID})} />}
        />
    </View>
)

const renderGroups = ({ item }) => (
    <View>
        <Card.Title
            title={item.name}
            right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate("Group Detail", { group: item, user:user })} />}
        />

    </View>
)

const renderKidItem = ({ item }) => (
    <TouchableOpacity style={styles.kidItem} onPress={() => handleKidSelection(item)}>
        <Text style={styles.kidName}>{item.name}</Text>
        <Text style={styles.kidDetails}>{item.school}, Grade {item.grade}</Text>
    </TouchableOpacity>
);

const NoDataComponent = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>There is no upcoming ride.</Text>
    </View>
  );

return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {user.name}({selectedKid ? selectedKid.name : '__________'})!</Text>
            <TouchableOpacity style={styles.switchButton} onPress={handleSwitchKid}>
                <Text style={styles.switchButtonText}>Switch kid</Text>
            </TouchableOpacity>
        </View>
        <Divider />
        { todaysRide &&
            <View>
            <Text style={{ marginLeft: 20 }} variant="titleMedium">Today's Ride</Text>
            <View>
                <Text variant='bodyMedium'>{date}: {todaysRide.name} </Text>
                <Text variant='labelMedium'>Message</Text>
                {/* <Text variant='labelLarge'>{groups.messages}</Text> */}
            </View>
        </View>
        }
        <View style={{ marginLeft: 20 }}>
            <Text variant="titleMedium" style={{marginVertical:10}}>Upcoming Rides</Text>
            <FlatList data={schedules} renderItem={renderSchedule} ListEmptyComponent={NoDataComponent}/>
        </View>
        <View style={{ marginLeft: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleLarge">My Groups</Text>
                <Button mode="contained" onPress={() => {
                    navigation.navigate('Search Group', {user: user});
                }}>Join Group</Button>
            </View>
            <FlatList data={groups} renderItem={renderGroups} />
        </View>

        <View style={{ marginLeft: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleLarge">My Walk Groups</Text>
                <Button mode="contained" onPress={() => {
                    navigation.navigate('Search Walk Bike Group', {user: user});
                }}>Join Walk Group</Button>
            </View>
            {/* <FlatList data={groups} renderItem={renderGroups} /> */}
        </View>

        {/* Modal for selecting a kid */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Select a Kid</Text>
                    <FlatList
                        data={kids}
                        renderItem={renderKidItem}
                        keyExtractor={(item) => item.id}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
        margin: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    welcomeText: {
        fontSize: 16,
        color: '#8a71b0', // light purple color
    },
    switchButton: {
        borderWidth: 1,
        borderColor: '#8a71b0', // light purple color
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#b19cd9', // light purple color
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    kidItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    kidName: {
        fontSize: 18,
    },
    kidDetails: {
        fontSize: 14,
        color: '#666',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#b19cd9',
        padding: 10,
        borderRadius: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MainScreen;
