/**
 * 非计划停机率详情页面JavaScript
 * 实现功能包括：站点和设备选择、时间范围选择、数据查询、图表绘制、表格显示等
 */

// 页面全局变量
let downtimeData = []; // 停机详情数据
let currentPage = 1; // 当前页码
let pageSize = 10; // 每页显示条数
let displayMode = 'by-site'; // 图表显示模式：按站点或按设备
let trendChart = null; // 趋势图表实例
let selectedSites = []; // 已选站点
let selectedDevices = []; // 已选设备
let startDate = moment().subtract(7, 'days').format('YYYY-MM-DD'); // 默认开始日期：7天前
let endDate = moment().format('YYYY-MM-DD'); // 默认结束日期：今天

// 模拟站点数据
const siteOptions = [
    { id: 'site1', text: '光伏电站A' },
    { id: 'site2', text: '光伏电站B' },
    { id: 'site3', text: '风电场A' },
    { id: 'site4', text: '风电场B' },
    { id: 'site5', text: '储能电站A' },
    { id: 'site6', text: '储能电站B' }
];

// 模拟设备数据（按站点分组）
const deviceOptions = {
    'site1': [
        { id: 'device1-1', text: '逆变器A-1' },
        { id: 'device1-2', text: '逆变器A-2' },
        { id: 'device1-3', text: '集电箱A-1' }
    ],
    'site2': [
        { id: 'device2-1', text: '逆变器B-1' },
        { id: 'device2-2', text: '集电箱B-1' }
    ],
    'site3': [
        { id: 'device3-1', text: '风机A-1' },
        { id: 'device3-2', text: '风机A-2' },
        { id: 'device3-3', text: '风机A-3' }
    ],
    'site4': [
        { id: 'device4-1', text: '风机B-1' },
        { id: 'device4-2', text: '风机B-2' }
    ],
    'site5': [
        { id: 'device5-1', text: '电池簇A-1' },
        { id: 'device5-2', text: 'PCS-A-1' }
    ],
    'site6': [
        { id: 'device6-1', text: '电池簇B-1' },
        { id: 'device6-2', text: 'PCS-B-1' }
    ]
};

// 页面加载完成后执行初始化
$(document).ready(function() {
    initPage();
});

/**
 * 初始化页面
 */
function initPage() {
    // 初始化导航栏
    if (typeof initNavbar === 'function') {
        initNavbar('data-analysis');
    }

    // 初始化日期选择器
    initDateRangePicker();
    
    // 初始化站点选择器
    initSiteSelector();
    
    // 初始化设备选择器（初始禁用）
    initDeviceSelector();
    
    // 绑定事件
    bindEvents();
    
    // 创建趋势图表
    initTrendChart();
    
    // 初始设置时间范围为近7天
    setTimeRange('7d');
    
    // 默认查询数据（可选，也可以等用户点击查询按钮）
    // queryData();
}

/**
 * 初始化日期范围选择器
 */
function initDateRangePicker() {
    $('#date-range').daterangepicker({
        startDate: moment().subtract(7, 'days'),
        endDate: moment(),
        opens: 'left',
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' 至 ',
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '从',
            toLabel: '到',
            customRangeLabel: '自定义',
            weekLabel: '周',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    }, function(start, end) {
        startDate = start.format('YYYY-MM-DD');
        endDate = end.format('YYYY-MM-DD');
        // 更新选中的时间范围按钮状态
        $('.btn-time-range').removeClass('active');
        $('.btn-time-range[data-range="custom"]').addClass('active');
    });
}

/**
 * 初始化站点选择器
 */
function initSiteSelector() {
    $('#site-selector').select2({
        placeholder: '请选择站点',
        allowClear: true,
        data: siteOptions,
        language: {
            noResults: function() {
                return '没有找到匹配的站点';
            }
        }
    });
}

/**
 * 初始化设备选择器
 */
function initDeviceSelector() {
    $('#device-selector').select2({
        placeholder: '请先选择站点',
        allowClear: true,
        data: [],
        language: {
            noResults: function() {
                return '没有找到匹配的设备';
            }
        }
    });
}

/**
 * 绑定页面事件
 */
function bindEvents() {
    // 站点选择变化事件
    $('#site-selector').on('change', function() {
        selectedSites = $(this).val() || [];
        updateDeviceSelector();
    });
    
    // 设备选择变化事件
    $('#device-selector').on('change', function() {
        selectedDevices = $(this).val() || [];
    });
    
    // 时间范围按钮点击事件
    $('.btn-time-range').on('click', function() {
        const range = $(this).data('range');
        setTimeRange(range);
        $('.btn-time-range').removeClass('active');
        $(this).addClass('active');
        
        // 如果选择自定义，显示日期选择器
        if (range === 'custom') {
            $('.custom-date-container').show();
        } else {
            $('.custom-date-container').hide();
        }
    });
    
    // 查询按钮点击事件
    $('#query-btn').on('click', function() {
        queryData();
    });
    
    // 重置按钮点击事件
    $('#reset-btn').on('click', function() {
        // 重置站点选择
        $('#site-selector').val(null).trigger('change');
        
        // 重置设备选择
        $('#device-selector').val(null).trigger('change');
        
        // 重置时间范围为近7天
        $('.btn-time-range').removeClass('active');
        $('.btn-time-range[data-range="7"]').addClass('active');
        setTimeRange('7');
        
        // 隐藏自定义日期选择器
        $('.custom-date-container').hide();
    });
    
    // 按站点/按设备查看切换
    $('#view-by-site, #view-by-device').on('click', function() {
        $('#view-by-site, #view-by-device').removeClass('active');
        $(this).addClass('active');
        displayMode = $(this).attr('id') === 'view-by-site' ? 'by-site' : 'by-device';
        updateTrendChart();
    });
    
    // 日/周/月视图切换
    $('#view-daily, #view-weekly, #view-monthly').on('click', function() {
        $('#view-daily, #view-weekly, #view-monthly').removeClass('active');
        $(this).addClass('active');
        const viewMode = $(this).attr('id').replace('view-', '');
        updateTrendChartViewMode(viewMode);
    });
    
    // 表格/图表视图切换
    $('#view-mode-table, #view-mode-chart').on('click', function() {
        $('#view-mode-table, #view-mode-chart').removeClass('active');
        $(this).addClass('active');
        const mode = $(this).attr('id') === 'view-mode-table' ? 'table' : 'chart';
        toggleViewMode(mode);
    });
    
    // 导出按钮点击事件
    $('#export-btn').on('click', function() {
        exportToExcel();
    });
    
    // 搜索框输入事件
    $('#search-input').on('keyup', function() {
        const keyword = $(this).val().toLowerCase();
        filterTableData(keyword);
    });
}

/**
 * 设置时间范围
 * @param {string} range - 时间范围类型：7d(近7天), 30d(近30天), month(本月), custom(自定义)
 */
function setTimeRange(range) {
    let start, end;
    
    switch(range) {
        case '7d':
            start = moment().subtract(7, 'days');
            end = moment();
            break;
        case '30d':
            start = moment().subtract(30, 'days');
            end = moment();
            break;
        case 'month':
            start = moment().startOf('month');
            end = moment().endOf('month');
            break;
        case 'custom':
            // 保持日期选择器当前选择的日期
            return;
        default:
            start = moment().subtract(7, 'days');
            end = moment();
    }
    
    startDate = start.format('YYYY-MM-DD');
    endDate = end.format('YYYY-MM-DD');
    
    // 更新日期选择器
    $('#date-range').data('daterangepicker').setStartDate(start);
    $('#date-range').data('daterangepicker').setEndDate(end);
}

/**
 * 更新设备选择器内容
 */
function updateDeviceSelector() {
    // 清空已选设备
    selectedDevices = [];
    
    // 如果没有选择站点，则禁用设备选择器
    if (selectedSites.length === 0) {
        $('#device-selector').prop('disabled', true).empty().trigger('change');
        return;
    }
    
    // 启用设备选择器
    $('#device-selector').prop('disabled', false);
    
    // 获取所选站点的设备列表
    let deviceList = [];
    selectedSites.forEach(siteId => {
        if (deviceOptions[siteId]) {
            deviceList = deviceList.concat(deviceOptions[siteId]);
        }
    });
    
    // 更新设备选择器选项
    $('#device-selector').empty();
    deviceList.forEach(device => {
        const option = new Option(device.text, device.id, false, false);
        $('#device-selector').append(option);
    });
    
    // 触发更新
    $('#device-selector').trigger('change');
}

/**
 * 初始化趋势图表
 */
function initTrendChart() {
    // 初始化趋势图
    trendChart = echarts.init(document.getElementById('downtime-trend-chart'));
    
    // 设置空的初始配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                params.forEach(param => {
                    // 为异常数据添加标记
                    let marker = param.marker;
                    let value = param.value;
                    if (value > 4) { // 大于4小时视为异常
                        marker = '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#f39c12;"></span>';
                    }
                    result += marker + param.seriesName + ': ' + value + ' 小时<br/>';
                });
                return result;
            }
        },
        legend: {
            data: [],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '60px',
            top: '30px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            axisLabel: {
                formatter: function(value) {
                    return value.substr(5); // 只显示月-日
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '停机时长(小时)',
            axisLine: {
                show: true
            },
            axisLabel: {
                formatter: '{value}'
            }
        },
        series: []
    };
    
    // 应用配置
    trendChart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        trendChart.resize();
    });
}

/**
 * 查询数据
 */
function queryData() {
    // 显示加载中
    showLoading();
    
    // 模拟网络请求延迟
    setTimeout(function() {
        // 生成模拟数据
        downtimeData = generateMockData();
        
        // 更新指标
        updateMetrics();
        
        // 更新趋势图
        updateTrendChart();
        
        // 更新表格
        updateTable();
        
        // 更新饼图和柱状图
        updateChartView();
        
        // 隐藏加载中
        hideLoading();
    }, 800);
}

/**
 * 生成模拟数据
 */
function generateMockData() {
    // 清空现有数据
    downtimeData = [];
    
    // 日期范围
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;
    const dateRange = [];
    for (let i = 0; i < days; i++) {
        dateRange.push(moment(startDate).add(i, 'days').format('YYYY-MM-DD'));
    }
    
    // 停机原因列表
    const downtimeReasons = [
        '设备故障', '计划检修', '电网故障', '极端天气', '通信中断',
        '控制系统异常', '保护装置动作', '电气连接问题', '冷却系统故障'
    ];
    
    // 为每个选中站点生成数据
    selectedSites.forEach(siteId => {
        const siteName = siteOptions.find(site => site.id === siteId).text;
        
        // 获取站点下的设备
        const devices = deviceOptions[siteId] || [];
        
        // 选中的设备或全部设备
        const targetDevices = selectedDevices.length > 0 
            ? devices.filter(d => selectedDevices.includes(d.id)) 
            : devices;
        
        // 为每个设备生成停机记录
        targetDevices.forEach(device => {
            // 随机生成1-3条停机记录
            const recordCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < recordCount; i++) {
                // 随机选择开始日期
                const startDateIndex = Math.floor(Math.random() * days);
                const downtimeStartDate = dateRange[startDateIndex];
                
                // 随机生成停机时长（0.5-12小时）
                const downtimeDuration = (Math.random() * 11.5 + 0.5).toFixed(1);
                
                // 随机生成开始时间
                const startHour = Math.floor(Math.random() * 18); // 0-17时
                const startMinute = Math.floor(Math.random() * 60); // 0-59分
                const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
                
                // 计算结束时间
                const endDateTime = moment(`${downtimeStartDate} ${startTimeStr}`, 'YYYY-MM-DD HH:mm')
                    .add(parseFloat(downtimeDuration), 'hours');
                const endDateStr = endDateTime.format('YYYY-MM-DD');
                const endTimeStr = endDateTime.format('HH:mm');
                
                // 随机选择停机原因
                const reasonIndex = Math.floor(Math.random() * downtimeReasons.length);
                
                // 创建停机记录
                downtimeData.push({
                    id: `downtime-${siteId}-${device.id}-${i}`,
                    siteId: siteId,
                    siteName: siteName,
                    deviceId: device.id,
                    deviceName: device.text,
                    startDate: downtimeStartDate,
                    startTime: startTimeStr,
                    endDate: endDateStr,
                    endTime: endTimeStr,
                    duration: parseFloat(downtimeDuration),
                    reason: downtimeReasons[reasonIndex]
                });
            }
        });
    });
    
    // 按停机开始时间排序
    downtimeData.sort((a, b) => {
        const dateA = `${a.startDate} ${a.startTime}`;
        const dateB = `${b.startDate} ${b.startTime}`;
        return moment(dateB).diff(moment(dateA));
    });
}

/**
 * 更新指标数据
 */
function updateMetrics() {
    // 计算总停机时长
    const totalDowntime = downtimeData.reduce((sum, item) => sum + item.duration, 0).toFixed(1);
    
    // 计算停机次数
    const downtimeCount = downtimeData.length;
    
    // 计算平均停机时长
    const avgDowntime = downtimeCount > 0 ? (totalDowntime / downtimeCount).toFixed(1) : 0;
    
    // 查找最大停机时长
    const maxDowntime = downtimeData.length > 0 
        ? Math.max(...downtimeData.map(item => item.duration)).toFixed(1)
        : 0;
    
    // 计算非计划停机率（总停机时长 / 理论运行时长）
    // 理论运行时长 = 天数 × 24小时 × 设备数量
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;
    let deviceCount = 0;
    
    selectedSites.forEach(siteId => {
        const siteDevices = deviceOptions[siteId] || [];
        if (selectedDevices.length > 0) {
            deviceCount += siteDevices.filter(d => selectedDevices.includes(d.id)).length;
        } else {
            deviceCount += siteDevices.length;
        }
    });
    
    const theoreticalRuntime = days * 24 * deviceCount;
    const downtimeRate = theoreticalRuntime > 0 
        ? ((totalDowntime / theoreticalRuntime) * 100).toFixed(2)
        : 0;
    
    // 更新页面显示
    $('#metric-total-downtime').text(`${totalDowntime} 小时`);
    $('#metric-downtime-rate').text(`${downtimeRate}%`);
    $('#metric-downtime-count').text(`${downtimeCount} 次`);
    $('#metric-avg-downtime').text(`${avgDowntime} 小时`);
    $('#metric-max-downtime').text(`${maxDowntime} 小时`);
}

/**
 * 更新趋势图表
 */
function updateTrendChart() {
    if (!trendChart || downtimeData.length === 0) return;
    
    // 准备日期范围（X轴数据）
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;
    const dateLabels = [];
    for (let i = 0; i < days; i++) {
        dateLabels.push(moment(startDate).add(i, 'days').format('MM-DD'));
    }
    
    // 准备系列数据
    const seriesData = [];
    
    // 根据显示模式生成图表数据
    if (displayMode === 'by-site') {
        // 按站点模式
        const siteMap = new Map();
        
        // 统计每个站点每天的停机时长
        selectedSites.forEach(siteId => {
            const siteName = siteOptions.find(site => site.id === siteId).text;
            const dailyDowntime = new Array(days).fill(0);
            const dailyRate = new Array(days).fill(0);
            
            // 设备总数（用于计算停机率）
            let deviceCount = 0;
            if (selectedDevices.length > 0) {
                deviceCount = deviceOptions[siteId].filter(d => selectedDevices.includes(d.id)).length;
            } else {
                deviceCount = deviceOptions[siteId].length;
            }
            
            // 遍历停机数据
            downtimeData.forEach(item => {
                if (item.siteId === siteId) {
                    const dayIndex = moment(item.startDate).diff(moment(startDate), 'days');
                    if (dayIndex >= 0 && dayIndex < days) {
                        dailyDowntime[dayIndex] += item.duration;
                    }
                }
            });
            
            // 计算每天的停机率
            for (let i = 0; i < days; i++) {
                dailyRate[i] = deviceCount > 0 ? (dailyDowntime[i] / (deviceCount * 24)) * 100 : 0;
            }
            
            siteMap.set(siteId, {
                name: siteName,
                downtime: dailyDowntime,
                rate: dailyRate
            });
        });
        
        // 生成柱状图系列（停机时长）
        siteMap.forEach((siteData, siteId) => {
            seriesData.push({
                name: siteData.name,
                type: 'bar',
                barMaxWidth: 40,
                data: siteData.downtime
            });
        });
        
        // 生成折线图系列（停机率）
        siteMap.forEach((siteData, siteId) => {
            seriesData.push({
                name: `${siteData.name}停机率`,
                type: 'line',
                yAxisIndex: 1,
                symbol: 'circle',
                symbolSize: 6,
                data: siteData.rate.map(rate => parseFloat(rate.toFixed(2)))
            });
        });
        
    } else {
        // 按设备模式
        const deviceMap = new Map();
        
        // 筛选显示的设备
        let displayDevices = [];
        selectedSites.forEach(siteId => {
            const siteDevices = deviceOptions[siteId] || [];
            if (selectedDevices.length > 0) {
                displayDevices = displayDevices.concat(
                    siteDevices.filter(d => selectedDevices.includes(d.id))
                );
            } else {
                displayDevices = displayDevices.concat(siteDevices);
            }
        });
        
        // 当设备数量过多时，限制显示前10个
        if (displayDevices.length > 10) {
            displayDevices = displayDevices.slice(0, 10);
        }
        
        // 统计每个设备每天的停机时长
        displayDevices.forEach(device => {
            const deviceName = device.text;
            const siteName = siteOptions.find(site => 
                site.id === selectedSites.find(siteId => 
                    deviceOptions[siteId].some(d => d.id === device.id)
                )
            ).text;
            
            const dailyDowntime = new Array(days).fill(0);
            const dailyRate = new Array(days).fill(0);
            
            // 遍历停机数据
            downtimeData.forEach(item => {
                if (item.deviceId === device.id) {
                    const dayIndex = moment(item.startDate).diff(moment(startDate), 'days');
                    if (dayIndex >= 0 && dayIndex < days) {
                        dailyDowntime[dayIndex] += item.duration;
                    }
                }
            });
            
            // 计算每天的停机率（设备一天理论运行24小时）
            for (let i = 0; i < days; i++) {
                dailyRate[i] = (dailyDowntime[i] / 24) * 100;
            }
            
            deviceMap.set(device.id, {
                name: `${siteName}-${deviceName}`,
                downtime: dailyDowntime,
                rate: dailyRate
            });
        });
        
        // 生成柱状图系列（停机时长）
        deviceMap.forEach((deviceData, deviceId) => {
            seriesData.push({
                name: deviceData.name,
                type: 'bar',
                barMaxWidth: 30,
                data: deviceData.downtime
            });
        });
        
        // 生成折线图系列（停机率）
        deviceMap.forEach((deviceData, deviceId) => {
            seriesData.push({
                name: `${deviceData.name}停机率`,
                type: 'line',
                yAxisIndex: 1,
                symbol: 'circle',
                symbolSize: 6,
                data: deviceData.rate.map(rate => parseFloat(rate.toFixed(2)))
            });
        });
    }
    
    // 获取图例数据
    const legendData = seriesData.map(series => series.name);
    
    // 更新图表选项
    trendChart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                let tooltipText = `${params[0].axisValue}<br/>`;
                
                // 分组显示柱状图和折线图数据
                const barData = params.filter(param => param.seriesType === 'bar');
                const lineData = params.filter(param => param.seriesType === 'line');
                
                // 先显示柱状图数据（停机时长）
                barData.forEach(param => {
                    tooltipText += `${param.marker} ${param.seriesName}: ${param.value} 小时<br/>`;
                });
                
                tooltipText += '<br/>';
                
                // 再显示折线图数据（停机率）
                lineData.forEach(param => {
                    tooltipText += `${param.marker} ${param.seriesName}: ${param.value}%<br/>`;
                });
                
                return tooltipText;
            }
        },
        legend: {
            data: legendData,
            type: 'scroll',
            top: 10,
            textStyle: {
                fontSize: 12
            }
        },
        xAxis: {
            data: dateLabels
        },
        series: seriesData
    });
}

/**
 * 更新表格数据
 */
function updateTable() {
    // 清空表格内容
    const $tableBody = $('#downtime-table tbody');
    $tableBody.empty();
    
    // 如果没有数据
    if (downtimeData.length === 0) {
        $tableBody.html('<tr><td colspan="6" class="text-center">暂无数据</td></tr>');
        $('.pagination-info').text('共 0 条记录');
        return;
    }
    
    // 计算分页
    const totalPages = Math.ceil(downtimeData.length / pageSize);
    currentPage = Math.min(currentPage, totalPages);
    
    // 获取当前页数据
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, downtimeData.length);
    const currentPageData = downtimeData.slice(startIndex, endIndex);
    
    // 生成表格内容
    currentPageData.forEach(item => {
        const startDateTime = `${item.startDate} ${item.startTime}`;
        const endDateTime = `${item.endDate} ${item.endTime}`;
        const isLongDowntime = item.duration > 4; // 停机超过4小时标记为异常
        
        const row = `
            <tr class="${isLongDowntime ? 'table-warning' : ''}">
                <td>${item.siteName}</td>
                <td>${item.deviceName}</td>
                <td>${startDateTime}</td>
                <td>${endDateTime}</td>
                <td>${item.duration} 小时</td>
                <td>${item.reason}</td>
            </tr>
        `;
        
        $tableBody.append(row);
    });
    
    // 更新分页信息
    $('.pagination-info').text(`共 ${downtimeData.length} 条记录`);
    
    // 更新分页控件
    updatePagination(totalPages);
}

/**
 * 更新分页控件
 * @param {number} totalPages - 总页数
 */
function updatePagination(totalPages) {
    const $pagination = $('.pagination');
    $pagination.empty();
    
    // 上一页按钮
    $pagination.append(`
        <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">上一页</a>
        </li>
    `);
    
    // 页码按钮
    // 如果页数较多，显示当前页附近的页码和首尾页
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // 调整startPage确保显示maxPageButtons个页码
    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // 添加首页按钮
    if (startPage > 1) {
        $pagination.append(`
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `);
        
        // 如果不相邻，添加省略号
        if (startPage > 2) {
            $pagination.append(`
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
            `);
        }
    }
    
    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        $pagination.append(`
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }
    
    // 添加尾页按钮
    if (endPage < totalPages) {
        // 如果不相邻，添加省略号
        if (endPage < totalPages - 1) {
            $pagination.append(`
                <li class="page-item disabled">
                    <a class="page-link" href="#">...</a>
                </li>
            `);
        }
        
        $pagination.append(`
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `);
    }
    
    // 下一页按钮
    $pagination.append(`
        <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">下一页</a>
        </li>
    `);
    
    // 绑定分页点击事件
    $('.pagination .page-link').on('click', function(e) {
        e.preventDefault();
        
        // 如果是禁用状态，不执行操作
        if ($(this).parent().hasClass('disabled')) {
            return;
        }
        
        // 获取目标页码
        const targetPage = parseInt($(this).data('page'));
        
        // 切换到目标页
        if (targetPage !== currentPage) {
            currentPage = targetPage;
            updateTable();
            
            // 滚动到表格顶部
            $('html, body').animate({
                scrollTop: $('#downtime-table').offset().top - 100
            }, 300);
        }
    });
}

/**
 * 表格数据过滤（搜索功能）
 * @param {string} keyword - 搜索关键词
 */
function filterTableData(keyword) {
    if (!keyword || keyword.length === 0) {
        // 重置为原始数据
        updateTable();
        return;
    }
    
    // 过滤匹配关键词的数据
    const filteredData = downtimeData.filter(item => {
        return (
            item.siteName.toLowerCase().includes(keyword) ||
            item.deviceName.toLowerCase().includes(keyword) ||
            item.startDate.includes(keyword) ||
            item.endDate.includes(keyword) ||
            item.reason.toLowerCase().includes(keyword) ||
            item.duration.toString().includes(keyword)
        );
    });
    
    // 临时保存原始数据
    const originalData = downtimeData;
    
    // 使用过滤后的数据更新表格
    downtimeData = filteredData;
    currentPage = 1; // 重置到第一页
    updateTable();
    
    // 恢复原始数据
    downtimeData = originalData;
}

/**
 * 导出到Excel
 */
function exportToExcel() {
    if (downtimeData.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    // 准备导出数据
    const exportData = downtimeData.map(item => {
        return {
            '站点名称': item.siteName,
            '设备名称': item.deviceName,
            '停机开始时间': `${item.startDate} ${item.startTime}`,
            '停机结束时间': `${item.endDate} ${item.endTime}`,
            '停机时长(小时)': item.duration,
            '停机原因': item.reason
        };
    });
    
    // 构建文件名
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const fileName = `非计划停机记录_${timestamp}.csv`;
    
    // 构建CSV内容
    let csvContent = '\uFEFF'; // 添加BOM以支持中文
    
    // 添加标题行
    const headers = Object.keys(exportData[0]);
    csvContent += headers.join(',') + '\r\n';
    
    // 添加数据行
    exportData.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // 包含逗号的字段用双引号包裹
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        });
        csvContent += values.join(',') + '\r\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 显示加载中效果
 */
function showLoading() {
    // 在实际项目中可以添加一个加载中的遮罩层
    // 这里简单处理，使用表格的加载状态
    $('#downtime-table tbody').html('<tr><td colspan="6" class="text-center">数据加载中...</td></tr>');
    $('#btn-query').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> 查询中...');
}

/**
 * 隐藏加载中效果
 */
function hideLoading() {
    // 恢复查询按钮状态
    $('#btn-query').prop('disabled', false).html('<i class="fas fa-search"></i> 查询');
}

/**
 * 更新图表显示模式（日/周/月视图）
 * @param {string} viewMode - 视图模式：daily, weekly, monthly
 */
function updateTrendChartViewMode(viewMode) {
    // 保存当前的显示模式
    const currentMode = displayMode;
    
    // 根据视图模式调整数据
    const aggregatedData = aggregateDataByTimeUnit(viewMode);
    
    // 更新图表
    updateTrendChartWithData(aggregatedData, currentMode);
}

/**
 * 根据时间单位聚合数据
 * @param {string} timeUnit - 时间单位：daily, weekly, monthly
 * @returns {Object} 聚合后的数据
 */
function aggregateDataByTimeUnit(timeUnit) {
    const aggregated = {};
    
    // 获取所有站点和设备的列表
    const siteMap = {};
    const deviceMap = {};
    
    downtimeData.forEach(item => {
        siteMap[item.siteId] = item.siteName;
        deviceMap[item.deviceId] = item.deviceName;
    });
    
    const sites = Object.keys(siteMap);
    const devices = Object.keys(deviceMap);
    
    // 初始化数据结构
    const timeFormat = timeUnit === 'daily' ? 'YYYY-MM-DD' : 
                      timeUnit === 'weekly' ? 'YYYY-[W]WW' : 'YYYY-MM';
    
    // 生成时间范围
    const start = moment(startDate);
    const end = moment(endDate);
    const timeLabels = [];
    const current = moment(start);
    
    while (current <= end) {
        const timeKey = current.format(timeFormat);
        timeLabels.push(timeKey);
        
        // 初始化聚合数据
        if (!aggregated[timeKey]) {
            aggregated[timeKey] = {
                bySite: {},
                byDevice: {}
            };
            
            // 初始化站点数据
            sites.forEach(siteId => {
                aggregated[timeKey].bySite[siteId] = 0;
            });
            
            // 初始化设备数据
            devices.forEach(deviceId => {
                aggregated[timeKey].byDevice[deviceId] = 0;
            });
        }
        
        // 根据时间单位递增
        if (timeUnit === 'daily') {
            current.add(1, 'day');
        } else if (timeUnit === 'weekly') {
            current.add(1, 'week');
        } else {
            current.add(1, 'month');
        }
    }
    
    // 按时间单位聚合数据
    downtimeData.forEach(item => {
        const itemDate = moment(item.startTime);
        const timeKey = itemDate.format(timeFormat);
        
        if (aggregated[timeKey]) {
            aggregated[timeKey].bySite[item.siteId] += item.duration;
            aggregated[timeKey].byDevice[item.deviceId] += item.duration;
        }
    });
    
    return {
        timeLabels: timeLabels,
        siteMap: siteMap,
        deviceMap: deviceMap,
        aggregatedData: aggregated
    };
}

/**
 * 切换视图模式（表格/图表）
 * @param {string} mode - 视图模式：table 或 chart
 */
function toggleViewMode(mode) {
    if (mode === 'table') {
        $('#table-view').show();
        $('#chart-view').hide();
    } else {
        $('#table-view').hide();
        $('#chart-view').show();
        
        // 确保图表已经初始化
        if (!$('#downtime-pie-chart').data('initialized')) {
            updateChartView();
        }
    }
}

/**
 * 更新图表视图（饼图和柱状图）
 */
function updateChartView() {
    // 初始化饼图
    initPieChart();
    
    // 初始化柱状图
    initBarChart();
    
    // 标记为已初始化
    $('#downtime-pie-chart').data('initialized', true);
}

/**
 * 初始化停机原因饼图
 */
function initPieChart() {
    // 计算停机原因分布
    const reasonsData = calculateReasonDistribution();
    
    // 初始化饼图实例
    const pieChart = echarts.init(document.getElementById('downtime-pie-chart'));
    
    // 设置饼图配置
    const option = {
        title: {
            text: '停机原因分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 10,
            top: 'middle',
            data: reasonsData.map(item => item.name)
        },
        series: [
            {
                name: '停机原因',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: reasonsData
            }
        ]
    };
    
    // 应用配置
    pieChart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        pieChart.resize();
    });
}

/**
 * 计算停机原因分布数据
 * @returns {Array} 停机原因分布数据
 */
function calculateReasonDistribution() {
    const reasonsMap = {};
    
    // 统计各原因的停机时长
    downtimeData.forEach(item => {
        if (!reasonsMap[item.reason]) {
            reasonsMap[item.reason] = 0;
        }
        reasonsMap[item.reason] += item.duration;
    });
    
    // 转换为饼图数据格式
    const reasonsData = Object.keys(reasonsMap).map(reason => {
        return {
            name: reason,
            value: reasonsMap[reason].toFixed(2)
        };
    });
    
    // 按停机时长降序排序
    reasonsData.sort((a, b) => b.value - a.value);
    
    return reasonsData;
}

/**
 * 初始化停机时长柱状图（按站点统计）
 */
function initBarChart() {
    // 按站点统计停机时长
    const siteData = calculateSiteDowntime();
    
    // 初始化柱状图实例
    const barChart = echarts.init(document.getElementById('downtime-bar-chart'));
    
    // 设置柱状图配置
    const option = {
        title: {
            text: '站点停机时长统计',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: '{b}: {c}小时'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            top: '60px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: siteData.map(item => item.name),
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '停机时长(小时)'
        },
        series: [
            {
                name: '停机时长',
                type: 'bar',
                data: siteData.map(item => item.value),
                itemStyle: {
                    color: function(params) {
                        // 根据停机时长设置不同颜色
                        const value = params.data;
                        if (value > 20) {
                            return '#e74c3c'; // 严重
                        } else if (value > 10) {
                            return '#f39c12'; // 警告
                        } else {
                            return '#49A18D'; // 正常
                        }
                    }
                }
            }
        ]
    };
    
    // 应用配置
    barChart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        barChart.resize();
    });
}

/**
 * 计算各站点的停机时长
 * @returns {Array} 站点停机时长数据
 */
function calculateSiteDowntime() {
    const sitesMap = {};
    
    // 统计各站点的停机时长
    downtimeData.forEach(item => {
        if (!sitesMap[item.siteName]) {
            sitesMap[item.siteName] = 0;
        }
        sitesMap[item.siteName] += item.duration;
    });
    
    // 转换为柱状图数据格式
    const sitesData = Object.keys(sitesMap).map(site => {
        return {
            name: site,
            value: sitesMap[site].toFixed(2)
        };
    });
    
    // 按停机时长降序排序
    sitesData.sort((a, b) => b.value - a.value);
    
    return sitesData;
} 