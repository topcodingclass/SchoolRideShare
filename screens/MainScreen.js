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
    const [schedules, setSchedules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [todaysRide, setTodaysRide] = useState(null);
    const today = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const date = month + '-' + today + '-' + year;

    const userID = auth.currentUser.uid;

    const fetchData = async () => {
        fetchUserData();
        fetchKidsData();
        fetchGroups();
        fetchSchedules();
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchData);
        const interval = setInterval(() => updateRidesWithTimeLeft(), 1000);
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [navigation, schedules]);

    const updateRidesWithTimeLeft = () => {
        const updatedRides = schedules?.map(schedule => {
            if (schedule.expectedArriving) {
                const now = new Date();
                const expectedArriving = schedule.expectedArriving.toDate();
                const timeLeft = Math.max(0, Math.floor((expectedArriving - now) / 1000));
                return { ...schedule, timeLeft };
            } else {
                return { ...schedule, timeLeft: null };
            }
        });
        setSchedules(updatedRides);


        getTodaysRide(updatedRides);
    };

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
        const now = new Date(); // Current date and time
        // Set the time to 12:00 AM (midnight) for the current date
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);


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
                        console.log("*******", scheduleData)
                        // Convert Firestore Timestamp to Date
                        const scheduleDate = scheduleData.date.toDate().toDateString()
                        console.log(scheduleDate, Date(Date.parse(scheduleDate)))
                        return { id: doc.id, ...scheduleData, date: scheduleDate, groupID: groupDoc.id, firebaseDate: scheduleData.date.toDate() };
                    })
                    .filter(schedule => schedule.firebaseDate > todayMidnight); // Filter for future dates
                console.log("$$$$$$$$$", futureGroupSchedules)
                // Append to futureSchedules array
                futureSchedules = [...futureSchedules, ...futureGroupSchedules];
                futureSchedules.sort((a, b) => a.firebaseDate.getTime() - b.firebaseDate.getTime());
            }
        }));

        console.log("Future schedules:", futureSchedules);
        setSchedules([...futureSchedules]);


    };


    const getTodaysRide = async (futureSchedules) => {
        //console.log("Get todays ride", futureSchedules)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight today

        //console.log("&&&&&&&&&&&&", schedules)
        const todaysSchedules = futureSchedules.filter(schedule => {
            const scheduleDate = new Date(schedule.firebaseDate.getFullYear(), schedule.firebaseDate.getMonth(), schedule.firebaseDate.getDate()); // Midnight of schedule's date
            console.log(scheduleDate.getTime(), today.getTime())
            return scheduleDate.getTime() === today.getTime(); // Compare only the date portion
        });

        //console.log("------Today rides",todaysSchedules);
        setTodaysRide([...todaysSchedules])
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

    const renderSchedule = ({ item }) => {
        const timeLeftMinutes = item.timeLeft !== null ? Math.floor(item.timeLeft / 60) : '-';
        const timeLeftSeconds = item.timeLeft !== null ? item.timeLeft % 60 : '-';
        const timeLeftText = item.timeLeft !== null ? `Arrives in ${timeLeftMinutes} min ${timeLeftSeconds} sec` : '';

        console.log(item, timeLeftText)

        return (
            <View>
                <Divider />
                <Card.Title
                    title={`${item.date} To ${item.direction}`}
                    subtitle={`Driver: ${item.driverName} - ${item.timeLeft !== null && item.timeLeft !== undefined ? timeLeftText : item.status}`}
                    right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate('Ride Detail', { ride: item, groupID: item.groupID })} />}
                />

            </View>
        )
    }

    const renderTodaySchedule = ({ item }) => {
        const timeLeftMinutes = item.timeLeft !== null ? Math.floor(item.timeLeft / 60) : '-';
        const timeLeftSeconds = item.timeLeft !== null ? item.timeLeft % 60 : '-';
        const timeLeftText = item.timeLeft !== null ? `Arrives in ${timeLeftMinutes} min ${timeLeftSeconds} sec` : '';

        console.log(item, timeLeftText)

        return (
            <View>
                <Card style={{ elevation: 0, shadowOpacity: 0, borderWidth: 0 }}>
                    <Card.Title
                        title={`${item.date} To ${item.direction}`}
                        subtitle={`Driver: ${item.driverName} - ${item.status}`}
                        right={(props) => (
                            <IconButton
                                {...props}
                                icon="dots-vertical"
                                onPress={() => navigation.navigate('Ride Detail', { ride: item, groupID: item.groupID })}
                            />
                        )}
                    />
                    <Card.Content>
                        <Text>
                            {item.timeLeft !== null && item.timeLeft !== undefined ? (
                                <Text style={{ color: 'red' }}> {timeLeftText}</Text>
                            ) : null}
                        </Text>
                    </Card.Content>
                </Card>

            </View>
        )
    }

    const renderGroups = ({ item }) => (
        <View>
            <Card.Title
                title={item.name}
                right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate("Group Detail", { group: item, user: user })} />}
            />

        </View>
    )

    const renderKidItem = ({ item }) => (
        <TouchableOpacity style={styles.kidItem} onPress={() => handleKidSelection(item)}>
            <Text style={styles.kidName}>{item.name}</Text>
            <Text style={styles.kidDetails}>{item.school}, Grade {item.grade}</Text>
        </TouchableOpacity>
    );

    const NoDataComponent = (text) => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>There is no {text} ride.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                    <Text style={styles.welcomeText}>Welcome, {user.name}({selectedKid ? selectedKid.name : '__________'})!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.switchButton} onPress={handleSwitchKid}>
                    <Text style={styles.switchButtonText}>Switch kid</Text>
                </TouchableOpacity>
            </View>
            <Divider />
            {todaysRide && (
                <View style={styles.todayRideSection}>
                    <Text style={styles.todayRideTitle} variant="titleMedium">Today's Ride</Text>
                    <FlatList
                        data={todaysRide}
                        renderItem={renderTodaySchedule}
                        ListEmptyComponent={() => NoDataComponent("today's")}
                    />
                </View>
            )}
            <View style={styles.upcomingRideSection}>
                <Text variant="titleMedium" style={{ marginVertical: 10 }}>Upcoming Rides</Text>
                <FlatList data={schedules} renderItem={renderSchedule} ListEmptyComponent={() => NoDataComponent("upcoming")} />
            </View>
            <View style={{ marginLeft: 20, marginTop: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="titleMedium">My Groups</Text>
                    <Button mode="text" onPress={() => {
                        navigation.navigate('Search Group', { user: user });
                    }}>+ Join Group</Button>
                </View>
                <FlatList data={groups} renderItem={renderGroups} />
            </View>

            <View style={{ marginLeft: 20, marginTop: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="titleMedium">My Walk Groups</Text>
                    <Button mode="text" onPress={() => {
                        navigation.navigate('Search Walk Bike Group', { user: user });
                    }}>+ Join Walk Group</Button>
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
    todayRideSection: {
        backgroundColor: '#ebedef',
        padding: 16,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
    },
    todayRideTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#8a71b0', // Emphasizing color
    },
    upcomingRideSection: {
        backgroundColor: '#f2f4f4',
        padding: 16,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
    },
});

export default MainScreen;
