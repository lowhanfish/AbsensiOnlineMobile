//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Stylex } from '../../../assets/styles/main';
import ModalComponentNotActivated from '../../../components/ModalComponentNotActivated';



// create a component
const SettingAccount = () => {

    const [username, setUsername] = useState('administrator');
    const [password, setPassword] = useState('password123');

    const [modalActivated, SetModalActivated] = useState(false);

    return (
        <View style={Stylex.sectionx}>
            <Text style={Stylex.sectionTitle}>AKUN PENGGUNA</Text>
            <TouchableOpacity onPress={() => { SetModalActivated(!modalActivated) }} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Username :</Text>
                <Text style={Stylex.accountText}>{username}</Text>
                <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { SetModalActivated(!modalActivated) }} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Password :</Text>
                <Text style={Stylex.accountText}>{"**************"}</Text>
                <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>

            <ModalComponentNotActivated
                openModal={modalActivated}
                SetOpenModal={SetModalActivated}
            />
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fieldValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 4,
    },
    editIcon: {
        fontSize: 14,
        marginLeft: 8,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#888',
        width: 80,
    },

});

//make this component available to the app
export default SettingAccount;
