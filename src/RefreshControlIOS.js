/**
 * Created by Niki on 9/28/18 11:11 AM.
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
    RefreshControl
} from 'react-native';
import PropTypes from "prop-types";
import MJRefresh, {ScrollView} from 'react-native-mjrefresh-lower'//rn<=0.54

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const isIos = Platform.OS === 'ios';

export default class RefreshControlIOS extends React.PureComponent {

    static propTypes = {
        //参数: event, 通过event.nativeEvent.percent可获取下拉位移百分比
        onHeaderMoving: PropTypes.func,
        //刷新回调
        onRefresh: PropTypes.func,
        customHeaderComponent: PropTypes.func,
        //是否处于刷新状态
        isRefreshingIOS: PropTypes.bool,
    };

    static defaultProps = {};

    constructor(props) {
        super(props);
    }

    finishRefresh = (params) => {
        this._refreshc && this._refreshc.finishRefresh(params);
    };

    render() {
        const {customHeaderComponent, onRefresh, onHeaderMoving, children, isRefreshingIOS} = this.props;
        if (!customHeaderComponent){
            return (<RefreshControl
                refreshing={isRefreshingIOS}
                onRefresh={onRefresh}
                tintColor="#666666"
                title="刷新数据"
                titleColor="#666666"
                colors={['#666666']}
                progressBackgroundColor="#ffffff"
            />)
        }
        return (
            <View style={styles.container}>
                <MJRefresh
                    style={{flex: 1}}
                    children={children}
                    ref={ref => this._refreshc = ref}
                    onRefresh={onRefresh}
                    onPulling={onHeaderMoving}>
                    {customHeaderComponent && customHeaderComponent()}
                </MJRefresh>
            </View>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});