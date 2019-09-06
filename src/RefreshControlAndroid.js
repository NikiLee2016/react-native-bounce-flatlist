/**
 * Created by Niki on 9/27/18 6:41 PM.
 * Email: m13296644326@163.com
 */

import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import PropTypes from "prop-types";
import {SmartRefreshControl, AnyHeader, DefaultHeader} from "react-native-smartrefreshlayout";
// import {SmartRefreshControl, AnyHeader, DefaultHeader} from 'react-native-smartrefreshlayout';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const isIos = Platform.OS === 'ios';

export default class RefreshControlAndroid extends React.PureComponent {

    static propTypes = {
        //参数: event, 通过event.nativeEvent.percent可获取下拉位移百分比
        onHeaderMoving: PropTypes.func,
        headerHeight: PropTypes.number,
        //刷新回调
        onRefresh: PropTypes.func,
        customHeaderComponent: PropTypes.func,
    };

    static defaultProps = {};

    constructor(props) {
        super(props);
    }

    finishRefresh = (params) => {
        this._refreshc && this._refreshc.finishRefresh(params);
    };

    render() {
        const {onHeaderMoving, children, headerHeight, onRefresh, customHeaderComponent} = this.props;
        return (
            <SmartRefreshControl
                style={{flex: 1}}
                onHeaderMoving={onHeaderMoving}
                ref={ref => this._refreshc = ref}
                children={children}
                onRefresh={onRefresh}
                headerHeight={headerHeight}
                renderHeader={() => {
                    return customHeaderComponent ? customHeaderComponent() : (<DefaultHeader />)
                }}
                /*HeaderComponent={
                    customHeaderComponent ? (<AnyHeader>
                        {customHeaderComponent()}
                    </AnyHeader>) : (<DefaultHeader />)
                }*/
            />
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});