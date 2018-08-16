/**
 * Created by Niki on 2018/7/20 下午3:37.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import PropTypes from "prop-types";
import { Bubbles, DoubleBounce, Bars, Pulse } from 'react-native-loader';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const isIos = Platform.OS === 'ios';

export default class LoadingView extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <DoubleBounce size={20} color={'#ff9d02'} />
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    }
});