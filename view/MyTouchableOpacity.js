/**
 * Created by Niki on 2017/10/31 0031 10:17.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    TouchableOpacity,
} from 'react-native';
import PropTypes from "prop-types";

export default class MyTouchableOpacity extends React.Component {

    static propTypes = {
        onPress: PropTypes.func,
        style: PropTypes.any,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                {...this.props}
            >
                {this.props.children}
            </TouchableOpacity>
        )
    }

}