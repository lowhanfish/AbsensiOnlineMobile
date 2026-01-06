import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Dimensions,
    TouchableOpacity, Modal, SafeAreaView, Linking
} from 'react-native';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const ModalFile = ({ modalVisible, closePopup, pdfUrl }: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [useWebViewFallback, setUseWebViewFallback] = useState(false);

    const pdfUri = pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    // Google Docs Viewer URL untuk fallback
    const getViewerUrl = (url: string) => {
        return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
    };

    useEffect(() => {
        if (modalVisible) {
            setIsLoading(true);
            setLoadError(false);
            setErrorMessage('');
            setUseWebViewFallback(false);
        }
    }, [modalVisible]);

    const handleOpenExternal = async () => {
        try {
            await Linking.openURL(pdfUri);
            closePopup();
        } catch (err) {
            setErrorMessage('Tidak dapat membuka URL');
        }
    };

    const handleRetry = () => {
        setLoadError(false);
        setIsLoading(true);
        setUseWebViewFallback(false);
    };

    const handleUseWebView = () => {
        setLoadError(false);
        setIsLoading(true);
        setUseWebViewFallback(true);
    };

    return (
        <Modal
            visible={modalVisible}
            transparent={false}
            animationType="slide"
            onRequestClose={closePopup}
        >
            <SafeAreaView style={styles.fullContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Preview Absensi</Text>
                    <TouchableOpacity style={styles.closeBtn} onPress={closePopup}>
                        <Text style={styles.closeText}>✕ Tutup</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>

                    {!loadError && !useWebViewFallback && (
                        <Pdf
                            source={{ uri: pdfUri }}
                            style={styles.pdf}
                            onLoadComplete={(numberOfPages, filePath) => {
                                setIsLoading(false);
                            }}
                            onPageChanged={(page, numberOfPages) => {
                                // Halaman berubah
                            }}
                            onError={(error) => {
                                // Cek jika ini error SSL/network, fallback ke WebView
                                const errorMsg = error.message || '';
                                if (errorMsg.includes('Blob') || errorMsg.includes('SSL') || errorMsg.includes('network') || errorMsg.includes('request')) {
                                    setUseWebViewFallback(true);
                                    setIsLoading(true);
                                } else {
                                    setIsLoading(false);
                                    setLoadError(true);
                                    setErrorMessage(errorMsg);
                                }
                            }}
                            onPressLink={(uri) => {
                                Linking.openURL(uri);
                            }}
                            enablePaging={true}
                            horizontal={false}
                            activityIndicator={<Text style={styles.loadingText}>Memuat Dokumen...</Text>}
                        />
                    )}

                    {useWebViewFallback && !loadError && (
                        <WebView
                            source={{ uri: getViewerUrl(pdfUri) }}
                            style={styles.pdf}
                            onLoadStart={() => {
                                setIsLoading(true);
                                setLoadError(false);
                            }}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={(syntheticEvent: any) => {
                                setIsLoading(false);
                                setLoadError(true);
                                setErrorMessage(syntheticEvent.nativeEvent.description || 'Gagal memuat PDF');
                            }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                            renderLoading={() => (
                                <View style={styles.loadingOverlay}>
                                    <Text style={styles.loadingText}>Memuat Dokumen...</Text>
                                </View>
                            )}
                        />
                    )}

                    {loadError && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Gagal memuat PDF</Text>
                            <Text style={styles.errorMessage}>{errorMessage}</Text>
                            <Text style={styles.errorSubtext}>Coba salah satu opsi di bawah:</Text>

                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={handleRetry}
                            >
                                <Text style={styles.retryButtonText}>Coba Lagi (PDF)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.webviewButton}
                                onPress={handleUseWebView}
                            >
                                <Text style={styles.webviewButtonText}>Gunakan WebView</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.externalButton}
                                onPress={handleOpenExternal}
                            >
                                <Text style={styles.externalButtonText}>Buka dengan Browser</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>

            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    closeBtn: { padding: 8, backgroundColor: '#ffefef', borderRadius: 8 },
    closeText: { color: '#ff4d4d', fontWeight: 'bold' },
    pdf: { flex: 1, width: width, height: height },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#ff4d4d',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
        width: '80%',
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    webviewButton: {
        backgroundColor: '#FF9500',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
        width: '80%',
        alignItems: 'center',
    },
    webviewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    externalButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
        width: '80%',
        alignItems: 'center',
    },
    externalButtonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ModalFile;

