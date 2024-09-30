import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchGroupScreen from './screens/SearchGroupScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import SearchWalkBikeGroupScreen from './screens/SearchWalkBikeGroupScreen';
import WalkBikeGroupDetailScreen from './screens/WalkBikeGroupDetailScreen';
import LogInScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ScheduleRideScreen from './screens/ScheduleRideScreen';
import RideDetailScreen from './screens/RideDetailScreen';
import MainScreen from './screens/MainScreen';
import GroupMemberDetailScreen from './screens/GroupMemberDetailScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Login" component={LogInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
      {/* <Stack.Screen name="MyMap" component={MyMap} /> */}
      <Stack.Screen name="Schedule Ride" component={ScheduleRideScreen} />
      <Stack.Screen name="Search Walk Bike Group" component={SearchWalkBikeGroupScreen} />
      <Stack.Screen name="Walk Bike Group Detail" component={WalkBikeGroupDetailScreen} />
        <Stack.Screen name="Search Group" component={SearchGroupScreen} />
        <Stack.Screen name="Group Detail" component={GroupDetailScreen} />
        <Stack.Screen name="Create Group" component={CreateGroupScreen} />
        <Stack.Screen name="Ride Detail" component={RideDetailScreen} />
        <Stack.Screen name="Group Member Detail" component={GroupMemberDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
