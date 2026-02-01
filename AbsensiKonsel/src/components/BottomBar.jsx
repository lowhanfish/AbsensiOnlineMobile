//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stylex } from '../assets/styles/main';
import ImageLib from './ImageLib';
import { useSelector } from 'react-redux';
import ModalComponentNotActivated from './ModalComponentNotActivated';




// create a component
const BottomBar = ({ navigation }) => {

    var token = useSelector(state => state.TOKEN);
    var URL = useSelector(state => state.URL);

    const [modalActivated, SetModalActivated] = useState(false);



    useEffect(() => {

    }, [])


    return (
        <View style={[styles.bottomBarContainer]}>
            <View style={[styles.bottomBar]}>
                {/* <TouchableOpacity onPress={() => navigation.navigate("MainPage", { screen: "Profile" })} style={styles.bottomBarItem}> */}
                <TouchableOpacity onPress={() => { SetModalActivated(!modalActivated) }} style={styles.bottomBarItem}>
                    <ImageLib style={{ width: 42 }} urix={require('../assets/images/icon/profile.png')} />
                    <Text style={styles.bottomBarText}>PROFILE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { SetModalActivated(!modalActivated) }} style={styles.bottomBarItem}>
                    <ImageLib style={{ width: 42 }} urix={require('../assets/images/icon/kinerja.png')} />
                    <Text style={styles.bottomBarText}>KINERJA</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("MainPage", { screen: "Dashboard" })} style={styles.bottomBarItemMain}>
                    <ImageLib style={{ width: 45 }} urix={require('../assets/images/icon/home.png')} />
                    <Text style={styles.bottomBarText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { SetModalActivated(!modalActivated) }} style={styles.bottomBarItem}>
                    <ImageLib style={{ width: 42 }} urix={require('../assets/images/icon/pengumuman.png')} />
                    <Text style={styles.bottomBarText}>PENGUMUMAN</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("MainPage", { screen: "Settings" })} style={styles.bottomBarItem}>
                    <ImageLib style={{ width: 42 }} urix={require('../assets/images/icon/setting1.png')} />
                    <Text style={styles.bottomBarText}>SETTING</Text>
                </TouchableOpacity>

            </View>

            <ModalComponentNotActivated
                openModal={modalActivated}
                SetOpenModal={SetModalActivated}
            />
        </View>
    );
};

// define your styles
const bottomHeight = 75;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },

    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    bottomBar: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: '#EBEBEB',
        backgroundColor: '#FFFFFF'

    },
    bottomBarItem: {
        height: bottomHeight,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBarItemMain: {
        backgroundColor: '#D9D9D9',
        height: 80,
        width: 80,
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -15,
        borderRadius: 50,
        borderColor: 'white',
        borderWidth: 5,
    },
    bottomBarText: {
        color: '#9C9C9C',
        fontSize: 9,
    },
});

//make this component available to the app
export default BottomBar;
