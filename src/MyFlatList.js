/**
 * Created by Niki on 2017/8/29 0029 20:34.
 * Email: m13296644326@163.com
 */
import React from 'react';
import {Dimensions, Platform, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';

import {UltimateListView} from "rn-ultimate-listview";
import {EmptyDataView, NetworkError} from "./view/ErrorView";
import PropTypes from "prop-types";
import TextBetweenLines from "./view/TextBetweenLines";
// import {SmartRefreshControl, ClassicsHeader, StoreHouseHeader, DefaultHeader} from 'react-native-smartrefreshlayout';
import ArrayUtils from "./util/ArrayUtils";
import LoadingView from "./view/LoadingView";
import * as _ from "lodash";
import Images from "./Images";
import RefreshControlAndroid from "./RefreshControlAndroid";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const isIos = Platform.OS === 'ios';
const REQUEST_STATE_LOADING_FIRST_PAGE = -3;
const REQUEST_STATE_EMPTY_DATA = -2;
const REQUEST_STATE_NETWORK_ERROR = -1;
const REQUEST_STATE_SUCCESS = 1;
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
         * 是否支持下拉刷新. 默认为true
         */
        refreshable: PropTypes.bool,
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
        /**
         * 自定义ios端刷新布局
         */
        renderScrollComponent: PropTypes.func,
        /**
         * 刷新组建下拉位移回调, 参数: event, 通过event.nativeEvent.percent可获取下拉位移百分比
         */
        onRefreshControlMoving: PropTypes.func,
        /**
         * 刷新组建高度
         */
        refreshControlHeight: PropTypes.number,
        /**
         * 刷新回调
         */
        onRefresh: PropTypes.func,
        /**
         * 刷新完成回调
         */
        onRefreshFinish: PropTypes.func,
        /**
         * 自定义数据全部加载判断依据, 默认判断依据为数组长度是否小于pageSize
         */
        allLoadedProof: PropTypes.func,

    };

    static defaultProps = {
        endViewBackgroundColor: '#0000',
        pageSize: 20,
        showAllLoadViewLimit: 5,
        //默认是屏幕高度 - 88
        height: screenHeight - 44 - 44,
        width: screenWidth,
        emptyDataMarginTop: 90,
        refreshable: true,
    };

    constructor(p) {
        super(p);
        //当前页码, 注意从1开始
        this.page = 0;
        //此次请求到的数据size
        this.currentDataSize = 0;
        this.headerHeight = 0;
        this.state = {
            isEmpty: false,
            netWorkError: false,
            isRefreshingIOS: false,
            loadState: REQUEST_STATE_LOADING_FIRST_PAGE,
        };

    }

    render() {
        if (this.state.isEmpty || this.state.netWorkError) {
            this.ultimate = null;
            const {refreshable} = this.props;
            const controlConfig = refreshable ? {refreshControl: this._getRefreshControl()} : {};
            return (
                <ScrollView
                    {...this.props}
                    ref={r => this.emptyScrollView = r}
                    {...controlConfig}
                    style={[{flex: 1}, this.props.style]}>
                    {this.props.renderHeader && this.props.renderHeader()}
                    {this._getWrongStateView()}
                </ScrollView>
            );
        }
        this.emptyScrollView = null;
        return this._getListView();
    }

    _getListView = () => {
        let listProps = _.omit(this.props, 'style');
        let {renderItem, renderSeparator, refreshable, renderScrollComponent} = listProps;
        return (<View style={[{flex: 1}, this.props.style]}>
            <UltimateListView
                customRefreshControl={this._getRefreshControl}
                ref={(ref) => this.ultimate = ref}
                //这样可以不需要再data里面指定key
                keyExtractor={(item, index) => index + ''}
                //refreshableMode="advanced" //basic or advanced
                refreshableMode={isIos ? 'advanced' : 'basic'} //basic or advanced
                refreshable={refreshable}
                //onEndReachedThreshold={30}
                displayDate={false}
                arrowImageSource={arrow_down}
                arrowImageStyle={{width: 30, height: 30}}
                customRefreshViewHeight={200}
                paginationAllLoadedView={this._getAllLoadedView}
                paginationFetchingView={() => null}
                {...listProps}
                onScroll={this._onScroll}
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
                {...this._getRenderScrollComponentProps()}
                //renderScrollComponent={this._renderScrollComponent}
            />
            {this._getLoadingView()}
        </View>);
    };

    /**
     * 参数字段:
     * animated: 是否执行动画
     * index: The index to scroll to. 必需
     * viewOffset: A fixed number of pixels to offset the final target position.
     * viewPosition: A value of 0 places the item specified by index at the top, 1 at the bottom, and 0.5 centered in the middle.
     * @param params: 见上文
     */
    scrollToIndex = (params) => {
        if (!params.viewOffset) {
            params.viewOffset = 0;
        }
        this.ultimate && this.ultimate.scrollToIndex(params);
    }

    _getRenderScrollComponentProps = () => {
        const {renderScrollComponent} = this.props;
        if (!renderScrollComponent) {
            return {};
        }
        return {
            renderScrollComponent: (props) => renderScrollComponent(props, this.refresh),
        };
    };

    _renderHeader = () => {
        const {loadState} = this.state;
        if (loadState === REQUEST_STATE_LOADING_FIRST_PAGE
            || loadState === REQUEST_STATE_NETWORK_ERROR
            || loadState === REQUEST_STATE_EMPTY_DATA) {
            return null;
        }
        const {renderHeader} = this.props;
        if (!renderHeader) {
            return null;
        }
        return (<View
            onLayout={(event) => this.headerHeight = event.nativeEvent.layout.height}
        >
            {renderHeader()}
        </View>)
    };

    _getLoadingView = () => {
        const {loadState} = this.state;
        if (loadState !== REQUEST_STATE_LOADING_FIRST_PAGE) {
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
        } else if (this.state.netWorkError) {
            return this._getNetworkErrorView();
        } else {
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
        this.emptyScrollView && this.emptyScrollView.scrollTo({x: 0, y: params.offset, animated: params.animated});
    };

    scrollToEnd  = (params) => {
        this.ultimate && this.ultimate.scrollToEnd(params);
        this.emptyScrollView && this.emptyScrollView.scrollToEnd({params});
    };

    /**
     * 暴露方法, 刷新列表数据
     * @param showLoader 刷新时是否显示loader, 默认不显示
     * @param scrollToTop 刷新之后是否滚动到顶部, 默认true
     */
    refresh = (showLoader, scrollToTop = true) => {
        this.setState({isRefreshingIOS: true});
        let {isEmpty, netWorkError} = this.state;
        //如果之前是空数据,网络请求错误状态或者要求显示loader, 那么将this.page设为 REQUEST_STATE_LOADING_FIRST_PAGE, 加载时显示loadingView
        if (isEmpty || netWorkError || showLoader) {
            this.setState({loadState: REQUEST_STATE_LOADING_FIRST_PAGE});
        }
        this.setState({
            isEmpty: false,
            netWorkError: false,
        }, () => {
            if (scrollToTop) {
                /*if (!isIos) {
                    //安卓需要手动调用划定顶部
                    this.scrollToOffset({y: 0, animate: true});
                }
                this.ultimate && this.ultimate.refresh()*/
                this.scrollToOffset({y: 0, animated: !isIos});
                this.ultimate && this.ultimate.refresh();
            } else {
                this.ultimate && this.ultimate.refresh()
            }
        });
    };

    _onScroll = (nativeEvent) => {
        let listProps = _.omit(this.props, 'style');
        if (listProps && listProps.onScroll) {
            listProps.onScroll(nativeEvent);
        }

    };

    /**
     * 获取列表的数据集合
     * @returns {null} 数据源
     */
    getDataList = () => {
        if (this.ultimate) {
            let rows = this.ultimate.getRows();
            if (rows === null) {
                rows = [];
            }
            return rows;
        }
        return [];
    };

    /**
     * 根据数据源静态刷新列表, 不会请求网络
     * @param rows: 数据源
     */
    updateDataList = (rows) => {
        // TODO: 如果数据位空, 显示空布局
        this.ultimate && this.ultimate.updateDataSource(rows);
        if (!ArrayUtils.isNotEmptyArray(rows)) {
            this._displayEmptyView();
        }
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
            this._displayEmptyView();
        } else {
            this.setState({loadState: REQUEST_STATE_SUCCESS});
            this.currentDataSize = data ? data.length : 0;
            this.startFetch(data, this.props.pageSize);
        }
    };

    _displayEmptyView = () => {
        this.page = 1;
        this.currentDataSize = 0;
        this.setState({
            isEmpty: true,
            netWorkError: false,
            loadState: REQUEST_STATE_EMPTY_DATA
        });
    };

    /**
     * 终止请求
     * @private
     */
    _abortDataFetch = () => {
        this._stopSmartRefresh();
        this.setState({isRefreshingIOS: false});
        if (this.page === 1) {
            this.setState({
                isEmpty: false,
                netWorkError: true,
                loadState: REQUEST_STATE_NETWORK_ERROR
            });
        } else {
            this.abortFetch();
        }
    };

    /**
     * 停止SmartRefreshControl的刷新
     * @private
     */
    _stopSmartRefresh = () => {
        this.refreshControl && this.refreshControl.finishRefresh();
        //this.refreshControlIOS && this.refreshControlIOS.finishRefresh();
        //出发刷新完成的回调
        this.props.onRefreshFinish && this.props.onRefreshFinish();
    };

    _getRefreshControlIOS = () => {
        return (<RefreshControl
            refreshing={this.state.isRefreshingIOS}
            onRefresh={this.refresh}
            tintColor="#666666"
            title="刷新数据"
            titleColor="#666666"
            colors={['#666666']}
            progressBackgroundColor="#ffffff"
        />)
    };

    /**
     * 产生一个RefreshControl对象. IOS下直接返回原生RefreshControl; Android下返回SmartRefreshControl
     * @returns {XML}
     * @private
     */
    _getRefreshControl = () => {
        let {customRefreshingHeader, onRefreshControlMoving, refreshControlHeight, onRefresh} = this.props;
        if (isIos) {
            return this._getRefreshControlIOS();
        }
        return (<RefreshControlAndroid
            onHeaderMoving={onRefreshControlMoving}
            headerHeight={refreshControlHeight}
            ref={ref => this.refreshControl = ref}
            customHeaderComponent={customRefreshingHeader}
            onRefresh={() => {
                onRefresh && onRefresh();
                this.refresh();
            }
            }/>);
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
            <TextBetweenLines text="没有更多了" textStyle={{color: '#c1c1c1', fontSize: 12,}} lineWidth={25}
                              style={{marginTop: 0, marginBottom: 0,}}/>
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
