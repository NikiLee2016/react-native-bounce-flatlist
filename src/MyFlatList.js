/**
 * Created by Niki on 2017/8/29 0029 20:34.
 * Email: m13296644326@163.com
 */
import React from 'react';
import {Platform, RefreshControl, ScrollView, View, StyleSheet, Dimensions} from 'react-native';

import {UltimateListView} from "rn-ultimate-listview";
import {EmptyDataView, NetworkError} from "./view/ErrorView";
import PropTypes from "prop-types";
import TextBetweenLines from "./view/TextBetweenLines";
import {SmartRefreshControl, ClassicsHeader, StoreHouseHeader, DefaultHeader} from 'react-native-smartrefreshlayout';
import ArrayUtils from "./util/ArrayUtils";
import LoadingView from "./view/LoadingView";
import * as _ from "loadsh";
import Images from "./Images";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const isIos = Platform.OS === 'ios';
const REQUEST_STATE_LOADING_FIRST_PAGE = -3;
const REQUEST_STATE_EMPTY_DATA = -2;
const REQUEST_STATE_NETWORK_ERROR = -1;
const arrow_down = require('./imageRes/arrow_down.png');
export default class MyFlatList extends React.Component {

    static propTypes = {
        /**
         * 默认空视图下, 文字描述
         */
        defaultEmptyDataDes: PropTypes.node,
        /**
         * 指定默认网络错误视图中, 图片距离文字的间距
         */
        netWorkErrorMarginTop: PropTypes.number,
        /**
         * 指定空数据视图中, 图片距离文字的间距
         */
        emptyDataMarginTop: PropTypes.number,
        /**
         * 加载数据的核心回调方法, 参数: page: 当前页码(注意从1开始);
         * startFetch: 请求数据成功(参数data: 请求到的数据数据); abortFetch: 请求数据失败.
         */
        onDataFetch: PropTypes.func.isRequired,
        /**
         * '数据已全部加载'视图的背景色. 默认透明
         */
        endViewBackgroundColor: PropTypes.node,
        /**
         * 头布局, 返回头布局
         */
        renderHeader: PropTypes.func,
        /**
         * 滑动监听, 参数为event, 通过event.nativeEvent.contentOffset.y, 可以拿到y方向上的偏移量
         */
        onScroll: PropTypes.func,
        /**
         * 分割线, 返回分割线布局
         */
        renderSeparator: PropTypes.func,
        /**
         * 相当于renderItem(), 参数: item, index
         */
        renderItem: PropTypes.func,
        /**
         * 不解释; 默认20;
         */
        pageSize: PropTypes.number,
        /**
         * 数据从服务器全部加载完成之后, 如果只有一页, 且只有少许几条数据, 这个时候如果显示'已全部加载'这个view,
         * 不太合适. 设置showAllLoadViewLimit, 可以指定当服务器数据只有一页时, 数据size超过多少, 才显示全部加载布局; 默认5条;
         */
        showAllLoadViewLimit: PropTypes.number,
        style: PropTypes.any,
        /**
         * 控件整体高度. 默认是屏幕高度减去44, 给个大概值就行, 主要是为了让LoadingView居中显示, 我实在是没想到合适的解决方案...
         */
        height: PropTypes.number,
        /**
         * 控件整体宽度. 默认为屏幕宽度. 注意如果控件的宽度小于屏幕宽度, 一定要指定width! 否则loadingView不会居中显示
         */
        width: PropTypes.number,

        /**
         * 自定义loadingView
         */
        customLoadingView: PropTypes.func,
        /**
         * 自定义网络错误视图方法. 参数 retry: 重新请求数据回调
         */
        customNetworkView: PropTypes.func,
        /**
         * 自定义空视图回调; 参数: retry: 重新请求数据回调; emptyDataMarginTop: 用户指定的文字距图片margin
         */
        customEmptyDataView: PropTypes.func,
        /**
         * 自定义底部提示已全部加载视图.
         */
        customAllLoadedView: PropTypes.func,
        /**
         * 自定义刷新列表时header的样式, 具体如何定义可以参照 react-native-smartrefreshlayout开发文档
         */
        customRefreshingHeader: PropTypes.func,
        /**
         * 自定义分页加载时布局, 建议高度为50
         */
        customPagingView: PropTypes.func,
    };

    static defaultProps = {
        endViewBackgroundColor: '#0000',
        pageSize: 20,
        showAllLoadViewLimit: 5,
        //默认是屏幕高度 - 88
        height: screenHeight - 44 - 44,
        width: screenWidth,
        emptyDataMarginTop: 90.
    };

    constructor(p) {
        super(p);
        //当前页码, 注意从1开始
        this.page = REQUEST_STATE_LOADING_FIRST_PAGE;
        //此次请求到的数据size
        this.currentDataSize = 0;
        this.headerHeight = 0;
        this.state = {
            isEmpty: false,//
            netWorkError: false,
            isRefreshingIOS: false,
        };

    }

    render() {
        if (this.state.isEmpty || this.state.netWorkError) {
            return (
                <ScrollView
                    refreshControl={this._getRefreshControl()}
                    style={[{flex: 1}, this.props.style]}>
                    {this.props.renderHeader && this.props.renderHeader()}
                    {this._getWrongStateView()}
                </ScrollView>
            );
        }
        return this._getListView();
    }

    _getListView = () => {
        let listProps = _.omit(this.props, 'style');
        let {renderItem, renderSeparator} = listProps;
        return (<View style={[{flex: 1}, this.props.style]}>
            <UltimateListView
                customRefreshControl={this._getRefreshControl}
                ref={(ref) => this.ultimate = ref}
                //这样可以不需要再data里面指定key
                keyExtractor={(item, index) => index}
                //refreshableMode="advanced" //basic or advanced
                refreshableMode={isIos ? 'advanced' : 'basic'} //basic or advanced
                refreshable={true}
                //onEndReachedThreshold={30}
                displayDate={false}

                arrowImageSource={arrow_down}
                arrowImageStyle={{width: 30, height: 30}}

                customRefreshViewHeight={200}
                paginationAllLoadedView={this._getAllLoadedView}
                paginationFetchingView={() => null}
                {...listProps}
                item={renderItem}
                header={this._renderHeader}
                separator={renderSeparator}
                //emptyView={this.getEmptyView}
                onFetch={this._onDataFetch}
                refreshableTitlePull="下拉刷新"
                refreshableTitleRelease="释放加载"
                refreshableTitleRefreshing="拼命加载中..."
                waitingSpinnerText="拼命加载中..."
                paginationWaitingView={this.props.customPagingView}

            />
            {this._getLoadingView()}
        </View>);
    };

    _renderHeader = () => {
        const {renderHeader} = this.props;
        if (!renderHeader){
            return null;
        }
        return (<View
            onLayout={(event) => this.headerHeight = event.nativeEvent.layout.height}
        >
            {renderHeader()}
        </View>)
    };

    _getLoadingView = () => {
        if (this.page !== REQUEST_STATE_LOADING_FIRST_PAGE) {
            return null;
        }
        let {height, width, customLoadingView} = this.props;
        const topProp = this.headerHeight === 0 ? {} : {top: this.headerHeight};
        return (<View style={{
            backgroundColor: '#f5f5f5',
            height: screenHeight,
            position: 'absolute',
            width,
            ...topProp,
        }}>
            <View style={{justifyContent: 'center', alignItems: 'center', height}}>
                {customLoadingView ? customLoadingView() : (<LoadingView/>)}
            </View>
        </View>);
    };

    _getWrongStateView = () => {
        if (this.state.isEmpty) {
            return this._getEmptyDataView();
        }
        else if (this.state.netWorkError) {
            return this._getNetworkErrorView();
        }
        else {
            return null;
        }
    };

    _getEmptyDataView = () => {
        let {customEmptyDataView, defaultEmptyDataDes, emptyDataMarginTop} = this.props;
        if (customEmptyDataView) {
            return customEmptyDataView(this.refresh, defaultEmptyDataDes, emptyDataMarginTop);
        }
        return (<EmptyDataView text={defaultEmptyDataDes} marginTop={emptyDataMarginTop} source={Images.empty_data}/>);
    };

    _getNetworkErrorView = () => {
        let {customNetworkView} = this.props;
        if (customNetworkView) {
            return customNetworkView(this.refresh);
        }
        return (<NetworkError
            marginTop={this.props.netWorkErrorMarginTop}
            onReload={this.refresh}/>);
    };


    /**
     * 暴露方法: 滑动到指定offset距离
     * @param params 数据格式: {offset: number, animated: boolean}
     */
    scrollToOffset = (params) => {
        this.ultimate && this.ultimate.scrollToOffset(params);
    };


    /**
     * 暴露方法, 刷新列表数据
     * @param showLoader 刷新时是否显示loader, 默认不显示
     * @param scrollToTop 刷新之后是否滚动到顶部, 默认true
     */
    refresh = (showLoader, scrollToTop = true) => {
        this.setState({isRefreshingIOS: true});
        try {
            scrollToTop && this.scrollToOffset({y: 0, animate: true});
        } catch (err) {
        }
        let {isEmpty, netWorkError} = this.state;
        //如果之前是空数据,网络请求错误状态或者要求显示loader, 那么将this.page设为 REQUEST_STATE_LOADING_FIRST_PAGE, 加载时显示loadingView
        if (isEmpty || netWorkError || showLoader) {
            this.page = REQUEST_STATE_LOADING_FIRST_PAGE;
        }
        this.setState({
            isEmpty: false,
            netWorkError: false,
        }, () => this.ultimate && this.ultimate.refresh());
    };

    /**
     * 开始请求数据
     * @param page 当前页码, 注意是从1开始的
     * @param startFetch 开始请求回调
     * @param abortFetch 终止请求回调
     * @private
     */
    _onDataFetch = (page = 1, startFetch, abortFetch) => {
        //注意this.page在这里总会有一次赋值
        this.page = page;
        this.startFetch = startFetch;
        this.abortFetch = abortFetch;
        this.props.onDataFetch(page, this._startDataFetch, this._abortDataFetch);
    };

    /**
     * 开始加载渲染数据
     * @param data 数据源数组
     */
    _startDataFetch = (data) => {
        //停止刷新
        this._stopSmartRefresh();
        this.setState({isRefreshingIOS: false});
        if (!ArrayUtils.isNotEmptyArray(data) && this.page === 1) {
            this.currentDataSize = 0;
            this.page = REQUEST_STATE_EMPTY_DATA;
            this.setState({
                isEmpty: true,
                netWorkError: false,
            });
        }
        else {
            this.currentDataSize = data.length;
            this.startFetch(data, this.props.pageSize);
        }
    };

    /**
     * 终止请求
     * @private
     */
    _abortDataFetch = () => {
        this._stopSmartRefresh();
        this.setState({isRefreshingIOS: false});
        if (this.page === 1) {
            this.page = REQUEST_STATE_NETWORK_ERROR;
            this.setState({
                isEmpty: false,
                netWorkError: true,
            });
        }
        else {
            this.abortFetch();
        }
    };

    /**
     * 停止SmartRefreshControl的刷新
     * @private
     */
    _stopSmartRefresh = () => {
        !isIos && this.refreshControl && this.refreshControl.finishRefresh();
    };

    /**
     * 产生一个RefreshControl对象. IOS下直接返回原生RefreshControl; Android下返回SmartRefreshControl
     * @returns {XML}
     * @private
     */
    _getRefreshControl = () => {
        if (isIos) {
            return (<RefreshControl
                refreshing={this.state.isRefreshingIOS}
                onRefresh={this.refresh}
                tintColor="#666666"
                title="刷新数据"
                titleColor="#666666"
                colors={['#666666']}
                progressBackgroundColor="#ffffff"
            />);
        }
        let {customRefreshingHeader} = this.props;
        return (<SmartRefreshControl
            //finishRefresh
            ref={ref => this.refreshControl = ref}
            onRefresh={this.refresh}
            HeaderComponent={customRefreshingHeader ? customRefreshingHeader() : (<DefaultHeader/>)}/>)
    };

    /**
     * 获取尾部全部加载视图
     * @returns {*}
     * @private
     */
    _getAllLoadedView = () => {
        let {showAllLoadViewLimit, customAllLoadedView} = this.props;
        //如果大于一页, 那么直接显示
        if (this.currentDataSize >= showAllLoadViewLimit || this.page > 1) {
            if (customAllLoadedView) {
                return customAllLoadedView();
            }
            return (<AllLoadedView style={{backgroundColor: this.props.endViewBackgroundColor}}/>)
        }
        return null;
    }

}

class AllLoadedView extends React.Component {
    render() {
        return (<View style={[{height: 40, alignItems: 'center', justifyContent: 'center'}, this.props.style]}>
            <TextBetweenLines text="没有更多了" textStyle={{color: '#c1c1c1', fontSize: 12,}} lineWidth={25}/>
        </View>);
    }
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
