/**
 * Created by Niki on 2017/12/19 0019 14:47.
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
} from 'react-native';
import PropTypes from "prop-types";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default class TextBetweenLines extends React.Component {

    static propTypes = {
        textStyle: PropTypes.object,                //文字style
        text: PropTypes.string.isRequired,          //标题文字
        lineWidth: PropTypes.number,                //线长度
    };

    static defaultProps = {
        lineWidth: 50,
    };

    render() {
        let lineStyle = {height: 0.5, backgroundColor: '#d3d3d3', width: this.props.lineWidth};
        return (<View style={[{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            justifyContent: 'center',
            marginTop: 15,
            marginBottom: 15,
        }, this.props.style]}>
            <View style={lineStyle}/>
            <Text style={[{
                marginHorizontal: 15,
                color: '#181818',
                fontSize: 14,
            }, this.props.textStyle]}>{this.props.text}</Text>
            <View style={lineStyle}/>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});