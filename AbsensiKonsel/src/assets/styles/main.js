

import {StyleSheet, Dimensions } from 'react-native';

const topBarHeight = 90;

const { width } = Dimensions.get('window');

const centerAll = {
                justifyContent : 'center',
                alignItems : 'center'
    }

const bottomHeight = 71;

export const Stylex = StyleSheet.create({
    body : {
        flex : 1,
        // backgroundColor : 'yellow',
        // paddingBottom:bottomHeight
    },

    btnSetting : {
        position : 'absolute',
        top : 22,
        right : 20,
        zIndex:1

    },
    
    bottomBarContainer : {
        position : 'static',
        bottom : 0,
        width : '100%',
    },
    bottomBar : {
        flex:1,
        alignItems :'center',
        flexDirection : 'row',
        borderWidth : 4,
        borderColor : '#EBEBEB'
        
    },
    bottomBarItem : {
        // backgroundColor : 'pink',
        height : bottomHeight,
        flex :1,
        // borderWidth :1,
        // borderColor :'black',
        justifyContent : 'center',
        alignItems : 'center'
    },
    bottomBarText : {
        color : '#9C9C9C',
        fontSize : 9,
    },








    shaddowText : {
        textShadowColor : 'gray',
        textShadowOffset : {width : 1, height:1},
        textShadowRadius : 1,
        elevation: 0.7, // 👈 ini untuk Android
    },
    shaddow : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 0.7, // 👈 ini untuk Android
    },
});
