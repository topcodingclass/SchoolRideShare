import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchGroupScreen from './screens/SearchGroupScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Search Group" component={SearchGroupScreen} />
        <Stack.Screen name="Create Group" component={CreateGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
