

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

    // Page Darurat, Izin, Apel

    backBtn : {
        flexDirection : 'row',
        position : 'absolute',
        textAlignVertical: 'center',
        top : 30,
        left : 30,
        zIndex: 9
    },
    iconBack: {
        width: 14,
        textAlignVertical: 'center',
    },
    backTitle : {
        fontSize : 10,
        color : '#FFFFFF',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
        textAlignVertical: 'center',
        paddingLeft : 5,
    },
    daruratTitle:{
        paddingTop :75,
        paddingLeft :28
    },
    fontTitle : {
        fontSize : 24,
        color : '#FFFFFF',
        fontWeight : '400',
        fontFamily: 'Audiowide-Regular', 
    },
    daruratHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 30,
        marginBottom: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jumlahContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jumlahTampil: {
        fontSize : 8,
        color : '#636363',
        fontWeight : '400',
        fontFamily: 'Almarai-Regular', 
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        backgroundColor: '#D9D9D9',
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    headerContainer : {
        flex :1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginHorizontal: 20,
        borderColor: '#DEDEDE',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderRadius: 5,
        marginBottom: 18,
        backgroundColor: '#fff',
        paddingVertical: 0,
        height: 35
    },
    inputDarurat: {
        flex: 1,
        fontSize: 8,
        paddingHorizontal: 10,
        height: 35,
        lineHeight: 35, 
        textAlignVertical: 'center',
    },
    button: {
        padding: 10,
        height: 35,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: '#B193F0',
    },
    icon: {
        width: 15,
    },
    daruratSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 25,
        marginBottom: 15,
    },
    daruratInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    daruratContent : {
        marginHorizontal: 20,
        border: '2px solid #EBEBEB',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3,

        elevation: 3,

        flexDirection : 'row',
    },
    textContent : {
        flex :1,
        flexDirection : 'column',
        marginVertical : 6
    },
    titleContent : {
        fontSize : 10,
        color : '#636363',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
    },
    dateContent : {
        fontSize : 8,
        color : '#8D8D8D',
        fontWeight : '400',
        fontFamily: 'Almarai-Regular', 
    },
    nameContent : {
        fontSize : 8,
        color : '#A4A4A4',
        fontWeight : '700',
        fontFamily: 'Almarai-Bold', 
    },
    // Page Darurat, Izin, Apel

});
