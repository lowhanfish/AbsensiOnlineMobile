import React from 'react';
import { Text, View } from "react-native"
import FastImage from 'react-native-fast-image';
import { Stylex } from '../assets/styles/main';


const LoadingImage = () => {
    return (
        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <FastImage
                    source={{
                        uri: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWgydG5mNHkzcGEybmtnYjRla3hneXNmN2hxM2RoMnh1YnFhNnI3MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/QRmJC704DProuxlMkG/giphy.gif'
                    }}
                    style={{ width: 200, height: 200 }}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </View>
            <Text style={Stylex.LoadingText}>Loading...</Text>
        </View>
    )
}

export default LoadingImage
