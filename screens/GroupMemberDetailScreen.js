import { StyleSheet, View, FlatList } from 'react-native';
import React, {useState, useEffect} from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Provider, TextInput, Text, Button } from 'react-native-paper';

const GroupMemberDetailScreen = ({ route }) => {
    const {member} = route.params || {};
    const [memberInfo, setMemberInfo] = useState(null)
    const [screening, setScreening] = useState([])
    console.log("##############", member)

    useEffect(()=>{
        fetchUserData();
        fetchScreeningData();
    }, [])


    // Function to fetch user data from Firestore
    const fetchUserData = async () => {
        setUser({});
        const docRef = doc(db, "drivers", member.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setMemberInfo({ id: userID, ...docSnap.data() });
        } else {
            console.log("No such document!");
        }
    };

    const fetchScreeningData = async () => {
        const querySnapshot = await getDocs(collection(db, "drivers", member.id, "screening"));
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

    const renderScreeningItem = ({item}) =>(
        <View>
            <Text>{item.name}</Text>
            <Text>{item.screenDate}</Text>
            <Text>{item.screenedBy}</Text>
        </View>
    )

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View >
            <Text variant="titleMedium">Name: {member.kidName}</Text>
            <Text variant="titleMedium">Kid Name: {member.driverName}</Text>
            </View>

            <Text>Address:{memberInfo.address} {memberInfo.city}</Text>
            <Text></Text>

            <Text>Screening History:</Text>
            <FlatList data = {screening} renderItem={renderScreeningItem} />

            <View>
                <Button title="Approve" onPress={() => updateStatus('approved')} />
                <Button title="Disapprove" onPress={() => updateStatus('disapproved')} />
            </View>
        </View>
    );
};

export default GroupMemberDetailScreen;

const styles = StyleSheet.create({
});