//import liraries
import React, { useEffect, useState, } from 'react';
import { View, Text, StyleSheet, Switch, TextInput } from 'react-native';
import { Stylex } from '../../../assets/styles/main';
import { useSelector } from 'react-redux';



// create a component
const SettingNotifikasi = () => {
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [email, setEmail] = useState('kikensbatara@gmail.com');
    const toggleSwitch = () => setIsNotifEnabled(prev => !prev);
    // const profilex = useSelector((state: { PROFILE: any }) => state.PROFILE);
    // console.log(profilex);
    const URL = useSelector((state: { URL: any }) => state.URL)
    const token = useSelector((state: { TOKEN: string }) => state.TOKEN)

    const getProfile = async () => {

        console.log(URL.URL_presensi_settingProfile + "getOne")

        try {
            const response = await fetch(URL.URL_biodata + "getOne", {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `kikensbatara ${token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`error ${response.status} : ${errorData.message} ` || "Gagal mengirim ke server");
            }

            const result = await response.json();
            console.log("sukses mengambil data profile");
            console.log(result);
        } catch (err) {
            console.log(`Terjadi error : ${err}`)
        }

    }


    useEffect(() => {
        getProfile();
    }, [])




    return (
        <View style={Stylex.sectionx}>
            <Text style={Stylex.sectionTitle}>EMAIL NOTIFIKASI</Text>
            <View style={styles.toggleRow}>
                <Switch
                    trackColor={{ false: '#ccc', true: '#4CD964' }}
                    thumbColor={'#fff'}
                    onValueChange={toggleSwitch}
                    value={isNotifEnabled}
                />
                <View style={[styles.statusBadge, isNotifEnabled ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.statusText, isNotifEnabled ? styles.activeText : styles.inactiveText]}>
                        {isNotifEnabled ? 'AKTIF' : 'NON-AKTIF'}
                    </Text>
                </View>
            </View>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email :</Text>
                <Text style={Stylex.accountText}>{email}</Text>
                <Text style={styles.editIcon}>✏️</Text>
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    activeBadge: {
        borderColor: '#4CD964',
        backgroundColor: '#fff',
    },
    inactiveBadge: {
        borderColor: '#ccc',
        backgroundColor: '#f5f5f5',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    editIcon: {
        fontSize: 14,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    fieldLabel: {
        fontSize: 13,
        color: '#888',
        width: 80,
    },
    activeText: {
        color: '#4CD964',
    },
    inactiveText: {
        color: '#888',
    },
    fieldValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 4,
    },
});

//make this component available to the app
export default SettingNotifikasi;
