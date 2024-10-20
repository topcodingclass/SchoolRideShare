import { StyleSheet, View, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from '../firebase';
import { Provider, TextInput, Text, Button, Divider } from 'react-native-paper';

const GroupMemberDetailScreen = ({ route }) => {
    const { member } = route.params || {};
    const [memberInfo, setMemberInfo] = useState(null)
    const [screening, setScreening] = useState([])
    const [groups, setGroups]=useState([])
    console.log("##############", member)

    useEffect(() => {
        fetchUserData();
        fetchScreeningData();
        fetchGroups()
    }, [])


    // Function to fetch user data from Firestore
    const fetchUserData = async () => {
        console.log("$$$$$$$$$$$$$$$ Fetch user started")
        const docRef = doc(db, "drivers", member.driverID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setMemberInfo({ id: member.driverID, ...docSnap.data() });
        } else {
            console.log("No such document!");
        }

        console.log("$$$$$$$$$$$$$$$ Fetch user", docSnap.data())
    };

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
                return memberData.driverID === member.driverID;
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

    const fetchScreeningData = async () => {
        const querySnapshot = await getDocs(collection(db, "drivers", member.driverID, "screening"));
        const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setScreening(docsData);

    };

    const updateStatus = async (status) => {
        try {
            const memberDocRef = doc(db, "groups", member.groupId, "members", member.id);
            await updateDoc(memberDocRef, { status: status });
        } catch (e) {
            console.log("Error updating status", e);
        }
    };

    const renderScreeningItem = ({ item }) => (
        <View style={{ marginVertical: 5 }}>
           
                <Text>Screend by:{item.screenedBy} {item.screenDate}</Text>
                <Text>{item.screeningDocument}</Text>
     

        </View>
    )

    const renderGroupsItem = ({ item }) => (
        <View style={{ marginVertical: 5 }}>
           
                <Text>{item.name}</Text>
                <Text>{item.meetingSpot}</Text>
     

        </View>
    )

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ marginVertical: 15 }}>
                <Text variant="labelLarge">Name: {member.driverName}</Text>
                <Text variant="labelLarge">Kid Name: {member.kidName}</Text>
            </View>

            <Text>Address:{member?.address}, {member?.city}</Text>
            <Text></Text>

            <Text variant="titleMedium">Screening History:</Text>
            <Divider />
            <FlatList data={screening} renderItem={renderScreeningItem} />


            <Text variant="titleMedium">Involved groups:</Text>
            <Divider />
            <FlatList data={groups} renderItem={renderGroupsItem} />

            <View style={{flexDirection:'row', justifyContent:'space-around', marginBottom:50}}>
                <Button mode="contained" onPress={() => updateStatus('approved')}>Approve</Button>
                <Button mode="contained" onPress={() => updateStatus('disapproved')} >Disapprove</Button>
            </View>
        </View>
    );
};

export default GroupMemberDetailScreen;

const styles = StyleSheet.create({
});