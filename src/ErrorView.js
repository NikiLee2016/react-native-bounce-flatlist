/**
 * Created by Niki on 2017/12/19 0019 14:57.
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

import {AssetImages} from "../../constants/index";
import MyTouchableOpacity from "../MyTouchableOpacity";

export class NetworkError extends React.Component {
    static propTypes = {
        onReload: PropTypes.func,
        marginTop: PropTypes.number,
    };

    render() {
        return (<View style={{
            flex: 1,
            alignItems: 'center',
            marginTop: this.props.marginTop || 100,
            marginBottom: 10,
        }}>
            <Image source={AssetImages.NETWORK_ERROR} style={styles.imageStyle} resizeMode={'cover'}/>
            <Text style={[styles.textStyle]}>网络不给力~ 请重试</Text>
            <MyTouchableOpacity
                onPress={this.props.onReload}
                style={styles.retryButton}>
                <Text style={{fontSize: 16, color: "#ff8c02"}}>重试</Text>
            </MyTouchableOpacity>
        </View>);
    }
}

export class EmptyDataView extends React.Component {

    static propTypes = {
        text: PropTypes.node.isRequired,
        marginTop: PropTypes.number,
        source: PropTypes.number,
    };
    render() {
        return createEmptyComponent(this.props.source, this.props.text, this.props.marginTop);
    }
}

const createEmptyComponent = (source, text, marginTop) => {
    return (<View style={ {
        flex: 1,
        alignItems: 'center',
        marginTop: marginTop || 100,
        marginBottom: 10,
    }}>
        <Image source={source} style={styles.imageStyle} resizeMode={'contain'}/>
        <Text style={[styles.textStyle]}>{text}</Text>
    </View>);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
        marginTop: 100,
        marginBottom: 100,
    },
    imageStyle: {
        width: 120,
        height: 124
    },
    textStyle: {
        color: '#9a9da1',
        fontSize: 16,
        marginTop: 20,
    },
    retryButton: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 132,
        height: 40,
        borderRadius: 20,
        borderStyle: "solid",
        borderWidth: 0.5,
        borderColor: "#f6a623"
    },
});