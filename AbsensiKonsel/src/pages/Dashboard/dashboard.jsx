import { Text } from "react-native"
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();

    return (
        <Text style={{ fontSize: 50 }}>Dashboard</Text>
    )
}

export default Dashboard