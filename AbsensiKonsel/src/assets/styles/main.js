

import {StyleSheet, Dimensions } from 'react-native';

const topBarHeight = 90;

const { width } = Dimensions.get('window');

const centerAll = {
                justifyContent : 'center',
                alignItems : 'center'
    }

const bottomHeight = 71;

export const Stylex = StyleSheet.create({
    bg1 : {

    },
    bg2 : {

    },
    body : {
        display : 'flex',
        flex : 1,
        // backgroundColor : 'yellow',
        paddingBottom:bottomHeight
    },

    btnSetting : {
        position : 'absolute',
        top : 30,
        right : 30,
        zIndex:9

    },
    
    bottomBarContainer : {
        position : 'absolute',
        bottom : 0,
        width : '100%',
    },
    bottomBar : {
        flex:1,
        alignItems :'center',
        flexDirection : 'row',
        borderWidth : 2,
        borderColor : '#EBEBEB',
        backgroundColor :'#FFFFFF'
        
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

    titleContainer:{
        paddingTop :75,
        paddingLeft :28
    },
    h_title1 : {
        fontSize : 24,
        color : '#FFFFFF',
        fontWeight : '900',
        fontFamily: 'Audiowide', 
    },
    h_title2 : {
        fontSize : 10,
        color : '#A4A4A4'

    },
});
