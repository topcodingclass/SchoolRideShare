import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ProfileScreen = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    
    // Screening
    const [screening, setScreening] = useState({
        name: '',
        screeningDocument: '',
        screenDate: '',
        screenedBy: ''
    });

    // Cars and Kids
    const [cars, setCars] = useState([{ maker: '', model: '', color: '', plateNumber: '' }]);
    const [kids, setKids] = useState([{ name: '', school: '', grade: '' }]);

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (user) {
                setUserId(user.uid);
                const docRef = doc(db, "drivers", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name);
                    setEmail(data.email);
                    setPhone(data.phone);
                    setAddress(data.address);
                    setCity(data.city);
                    setZip(data.zip);
                    setScreening(data.screening || { name: '', screeningDocument: '', screenDate: '', screenedBy: '' });
                    setCars(data.cars || []);
                    setKids(data.kids || []);
                }
            }
        };

        fetchData();
    }, []);

    const updateProfile = async () => {
        if (userId) {
            await updateDoc(doc(db, "drivers", userId), {
                name,
                email,
                phone,
                address,
                city,
                zip,
                screening,
                cars,
                kids
            });
            console.log("Profile updated");
        }
    };

    const handleAddCar = () => {
        setCars([...cars, { maker: '', model: '', color: '', plateNumber: '' }]);
    };

    const handleAddKid = () => {
        setKids([...kids, { name: '', school: '', grade: '' }]);
    };

    return (
        <SafeAreaView style={{ flex: 1, padding: 15, margin:10}}>
            <ScrollView>
                <TextInput style={styles.input} label="Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} label="Email" value={email} onChangeText={setEmail} disabled />
                <TextInput style={styles.input} label="Phone" value={phone} onChangeText={setPhone} />
                <TextInput style={styles.input} label="Address" value={address} onChangeText={setAddress} />
                <TextInput style={styles.input} label="City" value={city} onChangeText={setCity} />
                <TextInput style={styles.input} label="Zip" value={zip} onChangeText={setZip} />
                
                {/* Driver Screening Section */}
                <Text variant="titleMedium" style={styles.subtitle}>Driver Screening</Text>
                <TextInput style={styles.input} label="Screening Name" value={screening.name} onChangeText={text => setScreening({ ...screening, name: text })} />
                <TextInput style={styles.input} label="Screening Document" value={screening.screeningDocument} onChangeText={text => setScreening({ ...screening, screeningDocument: text })} />
                <TextInput style={styles.input} label="Screening Date" value={screening.screenDate} onChangeText={text => setScreening({ ...screening, screenDate: text })} />
                <TextInput style={styles.input} label="Screened By" value={screening.screenedBy} onChangeText={text => setScreening({ ...screening, screenedBy: text })} />

                {/* Children Section */}
                <Text variant="titleMedium" style={styles.subtitle}>Children</Text>
                {kids.map((kid, index) => (
                    <View key={index} style={styles.section}>
                        <TextInput style={styles.input} label="Child Name" value={kid.name} onChangeText={text => {
                            const updatedKids = [...kids];
                            updatedKids[index].name = text;
                            setKids(updatedKids);
                        }} />
                        <TextInput style={styles.input} label="School" value={kid.school} onChangeText={text => {
                            const updatedKids = [...kids];
                            updatedKids[index].school = text;
                            setKids(updatedKids);
                        }} />
                        <TextInput style={styles.input} label="Grade" value={kid.grade} onChangeText={text => {
                            const updatedKids = [...kids];
                            updatedKids[index].grade = text;
                            setKids(updatedKids);
                        }} />
                    </View>
                ))}
                <Button mode="outlined" onPress={handleAddKid}>Add Child</Button>

                {/* Car Section */}
                <Text variant="titleMedium" style={styles.subtitle}>Car</Text>
                {cars.map((car, index) => (
                    <View key={index} style={styles.section}>
                        <TextInput style={styles.input} label="Maker" value={car.maker} onChangeText={text => {
                            const updatedCars = [...cars];
                            updatedCars[index].maker = text;
                            setCars(updatedCars);
                        }} />
                        <TextInput style={styles.input} label="Model" value={car.model} onChangeText={text => {
                            const updatedCars = [...cars];
                            updatedCars[index].model = text;
                            setCars(updatedCars);
                        }} />
                        <TextInput style={styles.input} label="Color" value={car.color} onChangeText={text => {
                            const updatedCars = [...cars];
                            updatedCars[index].color = text;
                            setCars(updatedCars);
                        }} />
                        <TextInput style={styles.input} label="Plate #" value={car.plateNumber} onChangeText={text => {
                            const updatedCars = [...cars];
                            updatedCars[index].plateNumber = text;
                            setCars(updatedCars);
                        }} />
                    </View>
                ))}
                <Button mode="outlined" onPress={handleAddCar}>Add Car</Button>

                <Button mode="contained" onPress={updateProfile} style={styles.saveButton}>
                    Save Profile
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    input: { backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: {marginVertical:5, alignSelf:'center' },
    section: { marginVertical: 10 },
    saveButton: { marginTop: 20 }
});
