import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";

const ImageLib = ({ urix, customWidth, style }) => {
    const [height, setHeight] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [sizeLoading, setSizeLoading] = useState(true);
    const [actualWidth, setActualWidth] = useState(0);

    useEffect(() => {
        if (actualWidth === 0) return;

        const calculateHeight = (originalWidth, originalHeight) => {
            const ratio = originalHeight / originalWidth;
            setHeight(actualWidth * ratio);
            setSizeLoading(false);
        };

        if (typeof urix === 'number') {
            const img = Image.resolveAssetSource(urix);
            calculateHeight(img.width, img.height);
        } else {
            Image.getSize(
                urix,
                calculateHeight,
                (error) => {
                    console.error("Failed to get image size", error);
                    setSizeLoading(false);
                }
            );
        }
    }, [urix, actualWidth]);

    // Ekstrak border/borderRadius dari style props untuk View luar
    const { borderWidth, borderColor, borderRadius, ...restStyle } = StyleSheet.flatten(style || {});

    return (
        <View
            // View luar untuk border dan shadow (jika ada)
            style={[
                { width: customWidth, height: height || 100 }, // Dimensi dasar
                { borderWidth, borderColor, borderRadius }, // Properti border
                restStyle // Style lain yang tersisa (marginTop, backgroundColor, shadow)
            ]}
            onLayout={(event) => {
                if (typeof customWidth === 'string' || customWidth === undefined) {
                    setActualWidth(event.nativeEvent.layout.width);
                } else {
                    setActualWidth(customWidth);
                }
            }}
        >
            {/* View dalam untuk konten gambar dan clipping (jika borderRadius ada) */}
            <View
                style={[
                    StyleSheet.absoluteFill, // Agar mengisi View luar
                    {
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: borderRadius || 0, // Pastikan borderRadius diterapkan di sini
                        overflow: 'hidden', // Penting untuk clipping konten di dalam
                    },
                ]}
            >
                {(sizeLoading || imageLoading || actualWidth === 0) && (
                    <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#947306" />
                )}
                {height && actualWidth > 0 && (
                    <Image
                        source={typeof urix === 'string' ? { uri: urix } : urix}
                        style={{ width: actualWidth, height, resizeMode: 'contain' }}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                    />
                )}
            </View>
        </View>
    );
};

export default ImageLib;