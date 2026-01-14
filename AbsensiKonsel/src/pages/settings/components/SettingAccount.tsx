//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Stylex } from '../../../assets/styles/main';

// create a component
const SettingAccount = () => {

    const [username, setUsername] = useState('administrator');
    const [password, setPassword] = useState('password123');

    return (
        <View style={Stylex.sectionx}>
            <Text style={Stylex.sectionTitle}>AKUN PENGGUNA</Text>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Username :</Text>
                <TextInput
                    style={styles.fieldValue}
                    value={username}
                    onChangeText={setUsername}
                />
                <Text style={styles.editIcon}>✏️</Text>
            </View>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Password :</Text>
                <TextInput
                    style={styles.fieldValue}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Text style={styles.editIcon}>✏️</Text>
            </View>
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
