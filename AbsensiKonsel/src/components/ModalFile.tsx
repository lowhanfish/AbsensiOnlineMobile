import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Dimensions,
    TouchableOpacity, Modal, SafeAreaView, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import ImageLib from './ImageLib';
import { useSelector } from 'react-redux';



const { width } = Dimensions.get('window');

const ModalFile = ({ modalVisible, closePopup, pdfUrl }: any) => {
    // Default URL jika pdfUrl kosong
    const targetUrl = pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetUrl)}`;

    const URL = useSelector((state: { URL: any }) => state.URL)

    console.log("MODAL FILE =======")
    console.log(pdfUrl);
    console.log("MODAL FILE =======")

    const [urlData, SetUrlData] = useState('');
    const [typeData, setTypeData] = useState('pdf');

    const checkFileExisting = () => {
        if (pdfUrl) {

            const data = pdfUrl.split('.');
            if (data[1] == 'pdf') {
                console.log("PDFFFFFF")
                setTypeData('pdf');
                SetUrlData(`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(URL.URL_APP + "uploads/" + pdfUrl)}` || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            } else {
                SetUrlData(URL.URL_APP + "uploads/" + pdfUrl || "https://www.vincyads.com/assets/uploads/no-image.png");
                setTypeData('image');
            }
        }
    }


    useEffect(() => {
        checkFileExisting();
    }, [pdfUrl])


    return (
        <Modal
            visible={modalVisible}
            transparent={false}
            animationType="slide"
            onRequestClose={closePopup}
        >
            <SafeAreaView style={styles.fullContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Preview Lampiran</Text>
                    <TouchableOpacity style={styles.closeBtn} onPress={closePopup}>
                        <Text style={styles.closeText}>✕ Tutup</Text>
                    </TouchableOpacity>
                </View>


                {
                    typeData == 'image' ? (
                        <View>
                            {/* INI IMAGE */}
                            <ImageLib urix={urlData} customWidth={"100%"} style={{}} />
                        </View>

                    ) : (
                        <View style={styles.content}>
                            {/* INI PDF */}
                            <WebView
                                source={{ uri: urlData }}
                                style={styles.webview}
                                startInLoadingState={true}
                                scalesPageToFit={true}
                                renderLoading={() => (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="large" color="#007AFF" />
                                        <Text style={styles.loadingText}>Memuat Dokumen...</Text>
                                    </View>
                                )}
                            />
                        </View>

                    )


                }







            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#ffefef',
        borderRadius: 8
    },
    closeText: {
        color: '#ff4d4d',
        fontWeight: 'bold'
    },
    content: {
        flex: 1
    },
    webview: {
        flex: 1,
        width: width
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    ImageFull: {
        flex: 1,
    }
});

export default ModalFile;