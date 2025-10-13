import { Text, ScrollView, View, StyleSheet, Dimensions, ImageBackground } from "react-native"
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Stylex } from "../../assets/styles/main";



const { height, width } = Dimensions.get('window');

const Dashboard = () => {
    const navigation = useNavigation();

    return (

        <ScrollView>
            <View style={{ flex: 1 }}>

                <View style={Stylex.titleContainer}>
                    <Text style={Stylex.h_title1}>Selamat Datang</Text>
                    <Text style={Stylex.h_title2}>Kiken Sukma Batara, S.Si.,MT</Text>
                </View>


                <View style={styles.container} >
                    <ImageBackground style={{ flex: 1 }} resizeMode="stretch" source={require('../../assets/images/bg1.png')}>
                        <Text style={{ fontSize: 50 }}>sfsdf</Text>
                        <Text style={{ fontSize: 50 }}>sfsdf1</Text>
                    </ImageBackground>

                </View>
            </View>



        </ScrollView>



    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: height,
        paddingHorizontal: 16,
        backgroundColor: 'red'
    },

});


export default Dashboard