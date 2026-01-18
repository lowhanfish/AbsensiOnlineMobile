//import liraries
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Stylex } from '../assets/styles/main';


type modalProps = {
    openModal: boolean,
    SetOpenModal: Dispatch<SetStateAction<boolean>>
}


// create a component
const ModalComponentNotActivated = ({ openModal, SetOpenModal }: modalProps) => {
    return (
        <Modal visible={openModal} transparent animationType="fade" onRequestClose={() => SetOpenModal(!openModal)} >
            <View style={styles.container}>
                <View style={styles.popup}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => SetOpenModal(!openModal)}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <View style={styles.textContainer}>
                        <Text style={styles.text1}>Ups...🥺</Text>
                        <Text style={styles.text2}>Sayangnya Fungsi/Component yang anda tuju</Text>
                        <Text style={styles.text2}>Dalam Tahap Pengembangan </Text>


                        <TouchableOpacity onPress={() => SetOpenModal(!openModal)} style={styles.btnExit}>
                            <Text style={styles.btnExitText}>KELUAR</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 2.5,
        padding: 15,
        zIndex: 1,
    },
    closeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#999999'
    },
    popup: {
        height: 250,
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 20
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text1: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#707070',
        paddingBottom: 15,
    },
    text2: {
        color: '#707070',
    },

    btnExit: {
        borderStyle: 'solid',
        borderWidth: 3,
        borderColor: '#CF8686',
        borderRadius: 5,


        height: 45,
        width: 200,
        justifyContent: 'center',
        alignItems: 'center',

        marginTop: 20

    },
    btnExitText: {
        color: '#CF8686',
        fontWeight: 800
    }
});

//make this component available to the app
export default ModalComponentNotActivated;
