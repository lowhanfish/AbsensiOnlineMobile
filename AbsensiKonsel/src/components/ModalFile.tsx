import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Dimensions,
    TouchableOpacity, Modal,
} from 'react-native';
import { Stylex } from '../assets/styles/main';
const { height } = Dimensions.get('window');



const ModalFile = ({ modalVisible, closePopup }: any) => {
    return (
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closePopup} >
            <View style={Stylex.overlay1}>
                <View >
                    <TouchableOpacity style={Stylex.closeButton} onPress={closePopup}>
                        <Text style={Stylex.closeText}>✕</Text>
                    </TouchableOpacity>


                    {/* DISINI PDF DI TAMPILKAN */}

                </View>
            </View>
        </Modal>
    )
}



export default ModalFile
