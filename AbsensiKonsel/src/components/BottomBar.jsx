//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stylex } from '../assets/styles/main';
import ImageLib from './ImageLib';



// create a component
const BottomBar = () => {
    return (
        <View style={[Stylex.bottomBarContainer]}>
            <View style={[Stylex.bottomBar]}>
                <TouchableOpacity style={Stylex.bottomBarItem}>
                    <ImageLib style={{ width: 41 }} urix={require('../assets/images/icon/image1.png')} />
                    <Text style={Stylex.bottomBarText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Stylex.bottomBarItem}>
                    <ImageLib style={{ width: 41 }} urix={require('../assets/images/icon/image1.png')} />
                    <Text style={Stylex.bottomBarText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Stylex.bottomBarItem}>
                    <ImageLib style={{ width: 41 }} urix={require('../assets/images/icon/image1.png')} />
                    <Text style={Stylex.bottomBarText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Stylex.bottomBarItem}>
                    <ImageLib style={{ width: 41 }} urix={require('../assets/images/icon/image1.png')} />
                    <Text style={Stylex.bottomBarText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Stylex.bottomBarItem}>
                    <ImageLib style={{ width: 41 }} urix={require('../assets/images/icon/image1.png')} />
                    <Text style={Stylex.bottomBarText}>Profile</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

//make this component available to the app
export default BottomBar;
