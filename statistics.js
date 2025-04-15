// statistics.js - 统计对比页面脚本

// 全局变量存储当前操作的卡片ID (用于模态框回调)
let currentCardIdForModal = null;

// 全局对象存储各模块的数据加载器函数
const moduleUpdaters = {
    'health-score-card': null, // 会在 initHealthScoreModule 中被赋值
    'downtime-card': null,     // 会在 initDowntimeModule 中被赋值
    'energy-card': null,       // 会在 initEnergyModule 中被赋值
    'alarm-card': null         // 会在 initAlarmModule 中被赋值
};

// ==================================
// DOMContentLoaded - 确保DOM加载完毕
// ==================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("统计对比页面 DOM 加载完成。");

    // 初始化所有图表和功能
    try {
        initHealthScoreModule();
        initDowntimeModule();
        initEnergyModule();
        initAlarmModule();
        initCommonCardActions(); // 初始化通用的卡片按钮事件
        initCustomDateModal();   // 初始化自定义日期模态框
    } catch (error) {
        console.error("初始化统计对比模块时出错:", error);
    }
});

// ==================================
// ECharts 实例存储
// ==================================
const charts = {
    healthScore: null,
    downtime: null,
    energy: null,
    alarm: null
};

// ==================================
// 模拟数据生成函数 (增加 timeRange, startDate, endDate 参数)
// ==================================

/**
 * 生成站点健康评分模拟数据
 * @param {string} timeRange - 'all', 'day', 'week', 'month', 'year', 'custom'
 * @param {string} [startDate] - 自定义开始日期 'YYYY-MM-DD'
 * @param {string} [endDate] - 自定义结束日期 'YYYY-MM-DD'
 * @returns {Array} - [{ name: '站点名称', score: 分数, trend: [每日分数] }, ...]
 */
function generateMockHealthScoreData(timeRange = 'all', startDate = null, endDate = null) {
    const sites = [
        '北京昌平', '上海嘉定', '深圳宝安', '广州南沙', '天津滨海',
        '杭州西湖', '南京江北', '成都天府', '武汉光谷', '西安高新',
        '重庆两江', '苏州工业园', '合肥高新', '郑州航空港', '长沙岳麓'
    ];
    console.log(`生成健康评分数据，时间范围: ${timeRange}${startDate ? ` (${startDate} to ${endDate})` : ''}`); // 日志

    // 在自定义模式下，实际应根据日期过滤数据，这里仅调整模拟参数
    const isCustom = timeRange === 'custom' && startDate && endDate;

    return sites.map(site => {
        let baseScore;
        let scoreVolatility = 10;

        switch (timeRange) {
            case 'year': baseScore = 65 + Math.random() * 30; scoreVolatility = 8; break;
            case 'month': baseScore = 60 + Math.random() * 35; scoreVolatility = 12; break;
            case 'week': baseScore = 70 + Math.random() * 25; scoreVolatility = 6; break;
            case 'day': baseScore = 75 + Math.random() * 20; scoreVolatility = 4; break;
            case 'custom': // 自定义范围的模拟可以更复杂，这里简单处理
                baseScore = 68 + Math.random() * 22; scoreVolatility = 7;
                break;
            case 'all':
            default: baseScore = 70 + Math.random() * 25; scoreVolatility = 10; break;
        }

        // 模拟趋势数据
        const trendLength = timeRange === 'all' ? 30 : (timeRange === 'year' ? 12 : (timeRange === 'month' ? 4 : (timeRange === 'week' ? 7 : (isCustom ? 15 : 1)))); // 自定义给15个点
        const trend = Array.from({ length: trendLength }, () => baseScore - (scoreVolatility / 2) + Math.random() * scoreVolatility);

        return {
            name: `${site}站`,
            score: parseFloat(baseScore.toFixed(1)),
            trend: trend.map(s => parseFloat(s.toFixed(1)))
        };
    });
}

/**
 * 生成非计划停机模拟数据
 * @param {string} timeRange - 'all', 'day', 'week', 'month', 'year', 'custom'
 * @param {string} [startDate] - 自定义开始日期 'YYYY-MM-DD'
 * @param {string} [endDate] - 自定义结束日期 'YYYY-MM-DD'
 * @returns {Array} - [{ name: '站点名称', downtimeHours: 小时, downtimeRate: 百分比, isAbnormal: bool }, ...]
 */
function generateMockDowntimeData(timeRange = 'all', startDate = null, endDate = null) {
    const sites = [
        '北京昌平', '上海嘉定', '深圳宝安', '广州南沙', '天津滨海',
        '杭州西湖', '南京江北', '成都天府', '武汉光谷', '西安高新',
        '重庆两江', '苏州工业园', '合肥高新', '郑州航空港', '长沙岳麓'
    ];
    console.log(`生成停机数据，时间范围: ${timeRange}${startDate ? ` (${startDate} to ${endDate})` : ''}`); // 日志
    const isCustom = timeRange === 'custom' && startDate && endDate;

    return sites.map(name => {
        let maxDowntime = 60;
        let periodHours = 30 * 24;

        switch (timeRange) {
            case 'year': maxDowntime = 55 + Math.random() * 10; periodHours = 365 * 24; break;
            case 'month': maxDowntime = 15; periodHours = 30 * 24; break;
            case 'week': maxDowntime = 5; periodHours = 7 * 24; break;
            case 'day': maxDowntime = 1; periodHours = 24; break;
            case 'custom': // 自定义时间范围的模拟
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // 计算天数
                    periodHours = diffDays * 24;
                    maxDowntime = Math.min(60, diffDays * 0.5 + Math.random() * diffDays * 0.2); // 模拟天数越多，可能停机时间越长
                } else {
                    maxDowntime = 10; periodHours = 15 * 24; // 默认给个范围
                }
                break;
            case 'all':
            default: maxDowntime = 60; periodHours = 30 * 24; break;
        }

        const downtimeHours = Math.random() * maxDowntime;
        const downtimeRate = periodHours > 0 ? (downtimeHours / periodHours) * 100 : 0;
        const isAbnormal = (timeRange === 'all' || timeRange === 'year' || isCustom) && downtimeHours > 40;

        return {
            name: `${name}站`,
            downtimeHours: parseFloat(downtimeHours.toFixed(1)),
            downtimeRate: parseFloat(downtimeRate.toFixed(2)),
            isAbnormal: isAbnormal
        };
    });
}

// --- 其他模块的模拟数据函数 (后续添加) ---
function generateMockEnergyData(granularity = 'site') { return []; }
function generateMockAlarmData(granularity = 'site') { return []; }


// ==================================
// 图表配置选项
// ==================================

/**
 * 获取健康评分图表配置
 * @param {Array} data - generateMockHealthScoreData 返回的数据
 * @returns {object} ECharts option 配置
 */
function getHealthScoreChartOption(data) {
    return {
            tooltip: {
                trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params) => {
                // 自定义tooltip，显示分数和趋势
                const barParam = params.find(p => p.componentSubType === 'bar');
                const lineParam = params.find(p => p.componentSubType === 'line');
                if (!barParam) return '';
                let tooltip = `${barParam.name}<br/>评分: ${barParam.value}`;
                // 如果需要展示趋势图的详细数据，可以在这里添加
                // if (lineParam) { tooltip += `<br/>趋势点: ${lineParam.value}`; }
                return tooltip;
            }
        },
        grid: { // 调整网格保证标签显示完全
            left: '3%',
            right: '4%',
            bottom: '10%', // 为趋势图留出空间
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.map(item => item.name),
                axisLabel: {
                    interval: 0, // 显示所有标签
                    rotate: 30, // 旋转标签防止重叠
                    fontSize: 11
                }
            },
            // 第二个X轴用于趋势图 (隐藏)
            {
                type: 'category',
                gridIndex: 0, // 与第一个X轴在同一个网格
                show: false,
                data: data.map(item => item.name) // 需要与第一个轴数据一致
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '健康评分',
                min: Math.min(0, Math.floor(Math.min(...data.map(d => d.score)) / 10) * 10), // 动态最小值
                max: 100, // 最高100分
                axisLabel: { formatter: '{value} 分' }
            },
             // 第二个Y轴用于趋势图 (可以隐藏或显示在右侧)
            {
                type: 'value',
                gridIndex: 0,
                name: '趋势',
                show: false, // 默认隐藏趋势轴
                 min: 50, // 假设趋势在50-100波动
                 max: 100
            }
        ],
            series: [
                {
                    name: '健康评分',
                    type: 'bar',
                barMaxWidth: 40,
                    data: data.map(item => item.score),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#6FB3A8' }, // 渐变色
                        { offset: 1, color: '#49A18D' }
                    ])
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    color: '#333',
                    fontSize: 10
                },
                emphasis: {
                    focus: 'series',
                     itemStyle: {
                         color: '#2C7873' // 高亮颜色
                     }
                },
                tooltip: { // 单独配置柱状图的 tooltip valueFormatter
                    valueFormatter: value => value + ' 分'
                }
            },
            // 隐藏的趋势线 (如果需要可视化可以在tooltip中展示)
            {
                name: '评分趋势',
                type: 'line',
                xAxisIndex: 1, // 使用第二个X轴
                yAxisIndex: 1, // 使用第二个Y轴
                smooth: true,
                symbol: 'none', // 不显示点
                lineStyle: { width: 0 }, // 线宽为0使其不可见
                 // data 结构需要匹配趋势: [[day1_score, day2_score,...], [site2_scores], ...]
                 // 这里暂时简化，不直接渲染趋势线，仅在tooltip中暗示
                data: data.map(item => item.trend[item.trend.length - 1]) // 只取最后一个点示意
            }
        ]
    };
}

/**
 * 获取非计划停机图表配置 (移除granularity参数)
 * @param {Array} data - generateMockDowntimeData 返回的数据
 * @returns {object} ECharts option 配置
 */
function getDowntimeChartOption(data) {
    // 移除 axisLabelName
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params) => {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(p => {
                    if (p.seriesName === '停机时长') {
                        tooltip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>${p.seriesName}: ${p.value} 小时<br/>`;
                    } else if (p.seriesName === '停机率') {
                        tooltip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>${p.seriesName}: ${p.value} %<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: { // 添加图例
            data: ['停机时长', '停机率'],
            bottom: 5 // 放置在底部
        },
        grid: {
            top: '8%', // 新增：增加顶部边距，防止标记被截断
            left: '3%',
            right: '4%',
            bottom: '15%', // 增加底部边距给图例和标签旋转
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: {
                interval: 0,
                rotate: 30,
                fontSize: 11
            }
        },
             yAxis: [
            {
                type: 'value',
                name: '停机时长 (小时)',
                position: 'left', // 左侧Y轴
                alignTicks: true, // 对齐刻度
                axisLine: { show: true, lineStyle: { color: '#49A18D'} }, // Y轴颜色
                axisLabel: { formatter: '{value} h' }
            },
            {
                type: 'value',
                name: '停机率 (%)',
                position: 'right', // 右侧Y轴
                alignTicks: true,
                axisLine: { show: true, lineStyle: { color: '#F39C12' } }, // Y轴颜色
                axisLabel: { formatter: '{value} %' }
            }
             ],
             series: [
            {
                name: '停机时长',
                type: 'bar',
                barMaxWidth: 40,
                yAxisIndex: 0, // 使用左侧Y轴
                tooltip: { valueFormatter: value => value + ' 小时' },
                itemStyle: {
                    color: (params) => { // 根据是否异常设置不同颜色
                        // 确保 data[params.dataIndex] 存在
                        const item = data[params.dataIndex];
                        return item?.isAbnormal ? '#E74C3C' : '#49A18D';
                    }
                },
                data: data.map(item => item.downtimeHours),
                 markPoint: { // 标记异常点
                     symbolSize: 20, // 标记大小
                     symbol: 'pin', // 标记形状
                     label: {
                         formatter: '{@[0]}', // 显示原始值
                         color: '#fff',
                         fontSize: 9
                     },
                     itemStyle: {
                         color: '#E74C3C' // 标记颜色
                     },
                     // 确保 item 存在
                     data: data.map((item, index) => item?.isAbnormal ? { coord: [index, item.downtimeHours], value: '异常' } : null).filter(Boolean)
                 }
            },
            {
                name: '停机率',
                type: 'line',
                yAxisIndex: 1, // 使用右侧Y轴
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                tooltip: { valueFormatter: value => value + ' %' },
                itemStyle: { color: '#F39C12' }, // 线条颜色
                lineStyle: { color: '#F39C12' },
                data: data.map(item => item.downtimeRate)
            }
        ]
    };
}

// ==================================
// 表格渲染函数 (更新以反映排名)
// ==================================

/**
 * 渲染健康评分表格 (增加排名列)
 * @param {HTMLElement} tableContainer - 表格容器元素
 * @param {Array} data - 经过排序和切片的 Top/Last 10 数据
 * @param {string} rankType - 'top' 或 'last'
 * @param {number} fullDataLength - 完整数据长度，用于计算 Last 10 的排名
 */
function renderHealthScoreTable(tableContainer, data, rankType = 'top', fullDataLength = data.length) {
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>排名</th>
                    <th>站点名称</th>
                    <th>健康评分</th>
                    <th>趋势 (示意)</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach((item, index) => {
        // 根据 rankType 计算正确排名
        const rank = rankType === 'top' ? index + 1 : fullDataLength - data.length + index + 1;
        const trendIcon = item.trend[item.trend.length - 1] > item.trend[0]
            ? '<i class="fas fa-arrow-up" style="color: var(--success-color);"></i>'
            : item.trend[item.trend.length - 1] < item.trend[0]
                ? '<i class="fas fa-arrow-down" style="color: var(--danger-color);"></i>'
                : '<i class="fas fa-minus" style="color: var(--warning-color);"></i>';
        tableHTML += `
            <tr>
                <td>${rank}</td>
                <td>${item.name}</td>
                <td>${item.score} 分</td>
                <td>${trendIcon}</td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table>`;
    tableContainer.innerHTML = tableHTML;
}

/**
 * 渲染非计划停机表格 (移除granularity参数)
 * @param {HTMLElement} tableContainer - 表格容器元素
 * @param {Array} data - 经过排序和切片的 Top/Last 10 数据
 * @param {string} rankType - 'top' (停机最多) 或 'last' (停机最少)
 */
function renderDowntimeTable(tableContainer, data, rankType = 'top') {
    const nameHeader = '站点名称'; // 固定表头
    const rankHeader = rankType === 'top' ? '停机排名 (高->低)' : '停机排名 (低->高)';
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>${rankHeader}</th>
                    <th>${nameHeader}</th>
                    <th>停机时长 (小时)</th>
                    <th>停机率 (%)</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach((item, index) => {
        const rank = index + 1; // 因为数据已经按需排序并切片
        const abnormalClass = item.isAbnormal ? 'class="abnormal-row"' : '';
        const statusText = item.isAbnormal ? '关注' : '正常';
        const statusColor = item.isAbnormal ? 'var(--warning-color)' : 'var(--success-color)';

        tableHTML += `
            <tr ${abnormalClass}>
                <td>${rank}</td>
                <td>${item.name}</td>
                <td>${item.downtimeHours.toFixed(1)}</td>
                <td>${item.downtimeRate.toFixed(2)} %</td>
                <td><span style="color: ${statusColor};">${statusText}</span></td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table>`;
    tableContainer.innerHTML = tableHTML;

    // 添加异常行的CSS (如果还没有的话)
    const styleId = 'downtime-table-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        .abnormal-row {
            background-color: #fffbeb; /* 淡黄色背景 */
        }
        .abnormal-row td {
             /* font-weight: bold; */ /* 可选：加粗异常行 */
        }
        .abnormal-row:hover {
            background-color: #fff3cd !important; /* 悬停时深一点的黄色 */
        }
        `;
        document.head.appendChild(style);
    }
}

// ==================================
// 模块初始化函数 (重大修改 - 添加排名逻辑)
// ==================================

/**
 * 初始化健康评分模块
 */
function initHealthScoreModule() {
    const cardId = 'health-score-card'; // 定义卡片ID
    const chartContainer = document.getElementById('health-score-chart');
    const tableContainer = document.getElementById('health-score-table');
    const card = document.getElementById(cardId);
    const rankToggleBtns = card?.querySelectorAll('.rank-toggle .btn-rank');
    const timeRangeToggleBtns = card?.querySelectorAll('.time-range-toggle .btn-time-range');
    const customDateBtn = card?.querySelector('.btn-custom-date');

    if (!chartContainer || !tableContainer || !card || !rankToggleBtns || rankToggleBtns.length === 0 || !timeRangeToggleBtns || timeRangeToggleBtns.length === 0 || !customDateBtn) {
        console.error(`${cardId} 所需元素未找到！`);
        return;
    }

    charts.healthScore = echarts.init(chartContainer);
    let currentRankType = 'top';
    let currentTimeRange = 'all'; // 包含 'all', 'day', ..., 'custom'
    let currentStartDate = null;
    let currentEndDate = null;
    let fullData = [];

    // 定义加载数据的函数
    const loadHealthScoreData = (rankType = currentRankType, timeRange = currentTimeRange, startDate = currentStartDate, endDate = currentEndDate) => {
        console.log(`加载健康评分数据，排名: ${rankType}, 时间范围: ${timeRange}${startDate ? ` (${startDate} to ${endDate})` : ''}`);
        currentRankType = rankType;
        currentTimeRange = timeRange;
        currentStartDate = startDate;
        currentEndDate = endDate;

        // 1. 生成数据
        fullData = generateMockHealthScoreData(timeRange, startDate, endDate);
        const fullDataLength = fullData.length;

        // 2. 排序
        if (rankType === 'top') {
            fullData.sort((a, b) => b.score - a.score);
            } else {
            fullData.sort((a, b) => a.score - b.score);
        }

        // 3. 切片
        const displayData = fullData.slice(0, 10);

        // 4. 更新图表和表格
        const chartOption = getHealthScoreChartOption(displayData);
        let titleText = `站点健康评分 (${getDisplayTimeRangeText(timeRange, startDate, endDate)})`;
        chartOption.title = { text: titleText, left: 'center', textStyle: { fontSize: 16 } };
        charts.healthScore.setOption(chartOption, true);
        renderHealthScoreTable(tableContainer, displayData, rankType, fullDataLength);

        // 6. 更新按钮状态
        rankToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.rank === rankType);
        });
        timeRangeToggleBtns.forEach(btn => {
            // 自定义日期时不激活任何预设按钮
            btn.classList.toggle('active', btn.dataset.range === timeRange && timeRange !== 'custom');
        });
        // 如果是自定义时间，给日历按钮添加激活样式 (可选)
        customDateBtn.classList.toggle('active', timeRange === 'custom');
    };

    // 将加载函数添加到全局更新器对象
    moduleUpdaters['health-score-card'] = loadHealthScoreData;

    // 初始加载
    loadHealthScoreData('top', 'all');

    // 窗口大小调整
    window.addEventListener('resize', () => {
        if (charts.healthScore) charts.healthScore.resize();
    });

    // 排名切换
    rankToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rankType = btn.dataset.rank;
            if (rankType !== currentRankType) {
                loadHealthScoreData(rankType, currentTimeRange, currentStartDate, currentEndDate);
            }
        });
    });

    // 预设时间范围切换
    timeRangeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timeRange = btn.dataset.range;
            if (timeRange !== currentTimeRange) {
                loadHealthScoreData(currentRankType, timeRange, null, null); // 清空自定义日期
            }
        });
    });

    // 自定义日期按钮点击
    customDateBtn.addEventListener('click', () => {
        currentCardIdForModal = cardId;
        const endDateInput = document.getElementById('custom-end-date');
        const startDateInput = document.getElementById('custom-start-date');
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = weekAgo.toISOString().split('T')[0];
        showCustomDateModal();
    });
}

/**
 * 初始化非计划停机模块
 */
function initDowntimeModule() {
    const cardId = 'downtime-card'; // 定义卡片ID
    const chartContainer = document.getElementById('downtime-chart');
    const tableContainer = document.getElementById('downtime-table');
    const card = document.getElementById(cardId);
    const rankToggleBtns = card?.querySelectorAll('.rank-toggle .btn-rank');
    const timeRangeToggleBtns = card?.querySelectorAll('.time-range-toggle .btn-time-range');
    const customDateBtn = card?.querySelector('.btn-custom-date');

    if (!chartContainer || !tableContainer || !card || !rankToggleBtns || rankToggleBtns.length === 0 || !timeRangeToggleBtns || timeRangeToggleBtns.length === 0 || !customDateBtn) {
        console.error(`${cardId} 所需元素未找到！`);
            return;
        }

    charts.downtime = echarts.init(chartContainer);
    let currentRankType = 'top';
    let currentTimeRange = 'all';
    let currentStartDate = null;
    let currentEndDate = null;
    let fullData = [];

    // 定义加载数据的函数
    const loadDowntimeData = (rankType = currentRankType, timeRange = currentTimeRange, startDate = currentStartDate, endDate = currentEndDate) => {
        console.log(`加载停机数据，排名: ${rankType}, 时间范围: ${timeRange}${startDate ? ` (${startDate} to ${endDate})` : ''}`);
        currentRankType = rankType;
        currentTimeRange = timeRange;
        currentStartDate = startDate;
        currentEndDate = endDate;

        // 1. 生成数据
        fullData = generateMockDowntimeData(timeRange, startDate, endDate);

        // 2. 排序
        if (rankType === 'top') {
            fullData.sort((a, b) => b.downtimeHours - a.downtimeHours);
        } else {
            fullData.sort((a, b) => a.downtimeHours - b.downtimeHours);
        }

        // 3. 切片
        const displayData = fullData.slice(0, 10);

        // 4. 更新图表和表格
        const chartOption = getDowntimeChartOption(displayData);
        let titleText = `非计划停机率 (${getDisplayTimeRangeText(timeRange, startDate, endDate)})`;
        chartOption.title = { text: titleText, left: 'center', textStyle: { fontSize: 16 } };
        charts.downtime.setOption(chartOption, true);
        renderDowntimeTable(tableContainer, displayData, rankType);

        // 6. 更新按钮状态
        rankToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.rank === rankType);
        });
        timeRangeToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === timeRange && timeRange !== 'custom');
        });
        customDateBtn.classList.toggle('active', timeRange === 'custom');
    };

    // 将加载函数添加到全局更新器对象
    moduleUpdaters['downtime-card'] = loadDowntimeData;

    // 初始加载
    loadDowntimeData('top', 'all');

    // 窗口大小调整
    window.addEventListener('resize', () => {
        if (charts.downtime) charts.downtime.resize();
    });

    // 排名切换
    rankToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rankType = btn.dataset.rank;
            if (rankType !== currentRankType) {
                loadDowntimeData(rankType, currentTimeRange, currentStartDate, currentEndDate);
            }
        });
    });

    // 预设时间范围切换
    timeRangeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timeRange = btn.dataset.range;
            if (timeRange !== currentTimeRange) {
                loadDowntimeData(currentRankType, timeRange, null, null);
            }
        });
    });

    // 自定义日期按钮点击
    customDateBtn.addEventListener('click', () => {
        currentCardIdForModal = cardId;
        const endDateInput = document.getElementById('custom-end-date');
        const startDateInput = document.getElementById('custom-start-date');
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = weekAgo.toISOString().split('T')[0];
        showCustomDateModal();
    });
}

// --- 其他模块的初始化函数 (后续添加) ---
function initEnergyModule() {
    console.log("初始化能耗统计模块");
    const cardId = 'energy-card';
    const card = document.getElementById(cardId);
    if (!card) {
        console.error(`未找到卡片元素: ${cardId}`);
        return;
    }
    const chartContainer = card.querySelector('.chart-container');
    const tableContainer = card.querySelector('.table-container');
    if (!chartContainer || !tableContainer) {
        console.error('未找到能耗统计的图表或表格容器');
        return;
    }

    // 初始化 ECharts 实例
    try {
        charts.energy = echarts.init(chartContainer);
    } catch (e) {
        console.error("初始化能耗图表失败:", e);
        return;
    }

    // 定义能耗数据加载函数 (此函数将注册到 moduleUpdaters)
    const loadEnergyData = (rankType = null, timeRange = null, startDate = null, endDate = null) => {
        const currentRank = rankType || card.querySelector('.rank-toggle .btn-rank.active')?.dataset.rank || 'top';
        const currentTimeRange = timeRange || card.querySelector('.time-range-toggle .btn-time-range.active')?.dataset.range || 'all';

        // 移除对未定义的 updateButtonStates 的调用
        // updateButtonStates(card, currentRank, currentTimeRange);

        // --- 新增：直接在此处更新按钮状态 --- 
        const rankToggleBtns = card.querySelectorAll('.rank-toggle .btn-rank');
        const timeRangeToggleBtns = card.querySelectorAll('.time-range-toggle .btn-time-range');
        const customDateBtn = card.querySelector('.btn-custom-date');

        rankToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.rank === currentRank);
        });
        timeRangeToggleBtns.forEach(btn => {
            // 自定义日期时不激活任何预设按钮
            btn.classList.toggle('active', btn.dataset.range === currentTimeRange && currentTimeRange !== 'custom');
        });
        if (customDateBtn) { // 检查按钮是否存在
             customDateBtn.classList.toggle('active', currentTimeRange === 'custom');
        }
        // --- 按钮状态更新结束 --- 

        // 获取模拟数据
        const data = generateEnergyData(currentRank, currentTimeRange, startDate, endDate);

        // 更新图表
        if (charts.energy) {
            charts.energy.setOption(getEnergyChartOption(data), true);
        }

        // 更新表格
        tableContainer.innerHTML = generateEnergyTable(data);

        console.log(`能耗数据加载完成: ${cardId}, 排名: ${currentRank}, 时间范围: ${currentTimeRange}`);
    };

    // 将加载函数注册到全局更新器中
    moduleUpdaters[cardId] = loadEnergyData;

    // 初始加载数据
    loadEnergyData('top', 'all');

    // --- 新增：为能耗卡片的按钮绑定事件 --- 
    const rankToggleBtns = card.querySelectorAll('.rank-toggle .btn-rank');
    const timeRangeToggleBtns = card.querySelectorAll('.time-range-toggle .btn-time-range');
    const customDateBtn = card.querySelector('.btn-custom-date');

    // 排名切换事件
    rankToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rankType = btn.dataset.rank;
            const currentActiveRank = card.querySelector('.rank-toggle .btn-rank.active')?.dataset.rank;
            if (rankType !== currentActiveRank) {
                // 注意：这里需要获取当前的时间范围等参数
                const currentTimeRange = card.querySelector('.time-range-toggle .btn-time-range.active')?.dataset.range || 
                                     (customDateBtn.classList.contains('active') ? 'custom' : 'all');
                 // 获取当前的自定义日期 (如果适用)
                const startDateInput = document.getElementById('custom-start-date');
                const endDateInput = document.getElementById('custom-end-date');
                const currentStartDate = currentTimeRange === 'custom' ? startDateInput.value : null;
                const currentEndDate = currentTimeRange === 'custom' ? endDateInput.value : null;
                loadEnergyData(rankType, currentTimeRange, currentStartDate, currentEndDate);
            }
        });
    });

    // 预设时间范围切换事件
    timeRangeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timeRange = btn.dataset.range;
            const currentActiveTime = card.querySelector('.time-range-toggle .btn-time-range.active')?.dataset.range;
             if (timeRange !== currentActiveTime || customDateBtn.classList.contains('active')) {
                const currentRankType = card.querySelector('.rank-toggle .btn-rank.active')?.dataset.rank || 'top';
                loadEnergyData(currentRankType, timeRange, null, null); // 切换预设范围时清除自定义日期
            }
        });
    });

    // 自定义日期按钮点击事件 (打开模态框)
    if (customDateBtn) {
        customDateBtn.addEventListener('click', () => {
            currentCardIdForModal = cardId; // 设置全局变量，告知模态框是哪个卡片触发的
            // 可以选择性地预设日期，或保持模态框的默认/上次选择
             const endDateInput = document.getElementById('custom-end-date');
             const startDateInput = document.getElementById('custom-start-date');
             if (!startDateInput.value || !endDateInput.value) { // 如果为空，设置默认值
                 const today = new Date();
                 const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
                 endDateInput.value = today.toISOString().split('T')[0];
                 startDateInput.value = weekAgo.toISOString().split('T')[0];
             }
            showCustomDateModal(); // 调用显示模态框的函数
        });
    }
    // --- 事件绑定结束 --- 

    console.log(`能耗统计模块 (${cardId}) 初始化完成`);
}

function initAlarmModule() {
    console.log("初始化告警统计模块");
    const cardId = 'alarm-card';
    const card = document.getElementById(cardId);
    if (!card) {
        console.error(`未找到卡片元素: ${cardId}`);
        return;
    }
    const chartContainer = card.querySelector('.chart-container');
    const tableContainer = card.querySelector('.table-container');
    const rankToggleBtns = card.querySelectorAll('.rank-toggle .btn-rank');
    const timeRangeToggleBtns = card.querySelectorAll('.time-range-toggle .btn-time-range');
    const customDateBtn = card.querySelector('.btn-custom-date');
    const rankDimensionBtns = card.querySelectorAll('.rank-dimension-toggle .btn-rank-dim'); // 获取维度按钮
    const filterBtn = card.querySelector('.btn-filter-alarm');
    const filterDropdown = document.getElementById('alarm-filter-dropdown');
    const filterCheckboxes = filterDropdown?.querySelectorAll('input[type="checkbox"]');
    const applyFilterBtn = filterDropdown?.querySelector('.btn-apply-filter');

    if (!chartContainer || !tableContainer || !rankToggleBtns || !timeRangeToggleBtns || !customDateBtn || !rankDimensionBtns || !filterBtn || !filterDropdown || !filterCheckboxes || !applyFilterBtn) {
        console.error(`告警卡片 (${cardId}) 部分必需元素未找到!`);
        return;
    }

    let currentRankType = 'top';
    let currentTimeRange = 'all';
    let currentStartDate = null;
    let currentEndDate = null;
    let currentDimension = 'site'; // 新增：当前排名维度
    let currentSelectedTypes = ['提示', '告警', '故障']; // 新增：当前选中的过滤类型

    // 初始化 ECharts 实例
    try {
        charts.alarm = echarts.init(chartContainer);
            } catch (e) {
        console.error("初始化告警图表失败:", e);
        return;
    }

    // 定义告警数据加载函数 (更新参数)
    const loadAlarmData = (rankType = currentRankType, timeRange = currentTimeRange, startDate = currentStartDate, endDate = currentEndDate, dimension = currentDimension, selectedTypes = currentSelectedTypes) => {
        currentRankType = rankType;
        currentTimeRange = timeRange;
        currentStartDate = startDate;
        currentEndDate = endDate;
        currentDimension = dimension;
        currentSelectedTypes = selectedTypes;

        console.log(`加载告警数据 - 排名:${rankType}, 时间:${timeRange}, 维度:${dimension}, 类型:${selectedTypes.join(',')}`);

        // 更新按钮状态
        rankToggleBtns.forEach(btn => { btn.classList.toggle('active', btn.dataset.rank === rankType); });
        timeRangeToggleBtns.forEach(btn => { btn.classList.toggle('active', btn.dataset.range === timeRange && timeRange !== 'custom'); });
        if (customDateBtn) { customDateBtn.classList.toggle('active', timeRange === 'custom'); }
        rankDimensionBtns.forEach(btn => { btn.classList.toggle('active', btn.dataset.dimension === dimension); }); // 更新维度按钮状态

        // 获取模拟数据 (传入新参数)
        const data = generateAlarmData(rankType, timeRange, startDate, endDate, selectedTypes, dimension);

        // 更新图表 (传入维度)
        if (charts.alarm) {
             const chartOption = getAlarmChartOption(data, dimension);
             let titleText = `告警统计 (${getDisplayTimeRangeText(timeRange, startDate, endDate)}) - ${dimension === 'site' ? '按站点' : '按告警名称'}`;
             chartOption.title = { text: titleText, left: 'center', textStyle: { fontSize: 14 } }; // 调整标题字号
            charts.alarm.setOption(chartOption, true);
        }

        // 更新表格 (传入维度)
        tableContainer.innerHTML = generateAlarmTable(data, rankType, dimension);
    };

    // 将加载函数注册到全局更新器中 (注意自定义日期回调只传时间参数)
     moduleUpdaters[cardId] = (rt, tr, sd, ed) => {
         // 自定义日期确认时，保持当前的排名类型、维度和过滤类型不变
         loadAlarmData(currentRankType, 'custom', sd, ed, currentDimension, currentSelectedTypes);
     };

    // 初始加载数据
    loadAlarmData('top', 'all', null, null, 'site', ['提示', '告警', '故障']);

    // --- 绑定按钮事件 (更新) --- 

    // 排名切换事件 (保持不变)
    rankToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rankType = btn.dataset.rank;
            if (rankType !== currentRankType) {
                loadAlarmData(rankType, currentTimeRange, currentStartDate, currentEndDate, currentDimension, currentSelectedTypes);
            }
        });
    });

     // 排名维度切换事件 (新增)
     rankDimensionBtns.forEach(btn => {
         btn.addEventListener('click', () => {
             const dimension = btn.dataset.dimension;
             if (dimension !== currentDimension) {
                 loadAlarmData(currentRankType, currentTimeRange, currentStartDate, currentEndDate, dimension, currentSelectedTypes);
             }
         });
     });

    // 预设时间范围切换事件 (保持不变)
    timeRangeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timeRange = btn.dataset.range;
            // 点击当前激活按钮或从自定义切回预设时触发
            if (timeRange !== currentTimeRange || currentTimeRange === 'custom') {
                loadAlarmData(currentRankType, timeRange, null, null, currentDimension, currentSelectedTypes);
            }
        });
    });

    // 自定义日期按钮点击事件 (保持不变)
    if (customDateBtn) {
        customDateBtn.addEventListener('click', () => {
             currentCardIdForModal = cardId;
             // ... (省略设置默认日期的代码) ...
             showCustomDateModal();
        });
    }

    // 过滤按钮点击事件 (切换下拉菜单显示)
    filterBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡到 document
        filterDropdown.classList.toggle('show');
    });

    // 应用过滤按钮点击事件
    applyFilterBtn.addEventListener('click', () => {
        const selectedTypes = Array.from(filterCheckboxes)
                                   .filter(cb => cb.checked)
                                   .map(cb => cb.value);
        if (selectedTypes.length === 0) {
            alert('请至少选择一种告警类型！');
            return;
        }
        loadAlarmData(currentRankType, currentTimeRange, currentStartDate, currentEndDate, currentDimension, selectedTypes);
        filterDropdown.classList.remove('show'); // 应用后关闭下拉菜单
    });

    // 点击下拉菜单内部不关闭
    filterDropdown.addEventListener('click', (event) => {
         event.stopPropagation();
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
         if (filterDropdown.classList.contains('show')) {
             filterDropdown.classList.remove('show');
         }
    });

    // --- 事件绑定结束 --- 

    // 窗口大小调整
    window.addEventListener('resize', () => {
        if (charts.alarm) charts.alarm.resize();
    });

    console.log(`告警统计模块 (${cardId}) 初始化完成 (含过滤和维度切换)`);
}

// 更新：模拟生成更详细的告警数据，支持过滤和按维度聚合
function generateAlarmData(rankType = 'top', timeRange = 'all', startDate = null, endDate = null, selectedTypes = ['提示', '告警', '故障'], dimension = 'site') {
    console.log(`生成告警数据, 排名: ${rankType}, 时间范围: ${timeRange}, 类型: ${selectedTypes.join(',')}, 维度: ${dimension}`);
    const sites = [
        '北京昌平站', '上海嘉定站', '深圳宝安站', '广州南沙站', '天津滨海站',
        '杭州西湖站', '南京江北站', '成都天府站', '武汉光谷站', '西安高新站',
        '重庆两江站', '苏州工业园站', '合肥高新站', '郑州航空港站', '长沙岳麓站'
    ];
    const possibleAlarms = [
        { name: '电池温度过高', type: '告警' },
        { name: '电池电压异常', type: '告警' },
        { name: 'SOC过低', type: '提示' },
        { name: 'PCS通讯中断', type: '故障' },
        { name: 'BMS通讯中断', type: '故障' },
        { name: '电网电压波动', type: '提示' },
        { name: '功率超限', type: '告警' },
        { name: '风扇故障', type: '故障' },
        { name: '门禁异常', type: '提示' },
        { name: '充电超时', type: '提示' },
        { name: '系统过载', type: '告警' },
        { name: '绝缘故障', type: '故障' },
    ];
    let detailedData = [];
    let baseOccurrence = 5; // 每个站点/告警类型的基础发生次数

    // 根据时间调整基础发生次数
    switch (timeRange) {
        case 'day': baseOccurrence = 1; break;
        case 'week': baseOccurrence = 5; break;
        case 'month': baseOccurrence = 20; break;
        case 'year': baseOccurrence = 100; break;
        case 'all': baseOccurrence = 200; break;
        case 'custom': baseOccurrence = 10; break; // 简化
    }

    // 生成详细的告警记录 (模拟)
    sites.forEach(site => {
        possibleAlarms.forEach(alarm => {
            // 随机决定该告警是否在该站点发生，以及发生次数
            if (Math.random() < 0.7) { // 70% 的告警可能发生
                const count = Math.max(0, Math.floor(baseOccurrence * Math.random() + (Math.random() - 0.3) * baseOccurrence * 0.5));
                if (count > 0) {
                    detailedData.push({
                        siteName: site,
                        alarmName: alarm.name,
                        alarmType: alarm.type,
                        count: count
                    });
                }
            }
        });
    });

    // 1. 根据选中的类型过滤
    const filteredData = detailedData.filter(item => selectedTypes.includes(item.alarmType));

    // 2. 根据维度进行聚合
    let aggregatedData = [];
    if (dimension === 'site') {
        const siteMap = {};
        filteredData.forEach(item => {
            if (!siteMap[item.siteName]) {
                siteMap[item.siteName] = { name: item.siteName, count: 0 };
            }
            siteMap[item.siteName].count += item.count;
        });
        aggregatedData = Object.values(siteMap);
    } else { // dimension === 'alarmName'
        const alarmMap = {};
        filteredData.forEach(item => {
            if (!alarmMap[item.alarmName]) {
                alarmMap[item.alarmName] = { name: item.alarmName, count: 0 };
            }
            alarmMap[item.alarmName].count += item.count;
        });
        aggregatedData = Object.values(alarmMap);
    }

    // 3. 排序
    if (rankType === 'top') {
        aggregatedData.sort((a, b) => b.count - a.count);
    } else {
        aggregatedData.sort((a, b) => a.count - b.count);
    }

    // 4. 切片
    return aggregatedData.slice(0, 10);
}

// 更新：获取告警统计图表配置，支持不同维度
function getAlarmChartOption(data, dimension = 'site') {
    const axisName = dimension === 'site' ? '站点名称' : '告警名称';
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                 if (!params || params.length === 0) return '';
                 const p = params[0];
                 // 根据维度显示不同的提示信息
                 const nameLabel = dimension === 'site' ? '站点' : '告警名称';
                 return `${nameLabel}: ${p.name}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>告警次数: ${p.value}`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%', // 为旋转的X轴标签留出更多空间
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: {
                interval: 0,
                rotate: 30,
                fontSize: 10, // 标签可能变长，稍微缩小字号
                formatter: function (value) { // 防止标签过长
                    return value.length > 8 ? value.substring(0, 8) + '...' : value;
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '告警次数'
        },
        series: [
            {
                name: '告警次数',
                type: 'bar',
                barMaxWidth: 40,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#FFA07A' },
                        { offset: 1, color: '#FF7F50' }
                    ])
                },
                 label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    color: '#333',
                    fontSize: 10
                },
                emphasis: {
                    focus: 'series',
                     itemStyle: {
                         color: '#E9967A'
                     }
                },
                data: data.map(item => item.count)
            }
        ]
    };
}

// 更新：生成告警统计表格，支持不同维度
function generateAlarmTable(data, rankType = 'top', dimension = 'site') {
    const rankHeader = rankType === 'top' ? '排名 (高->低)' : '排名 (低->高)';
    const nameHeader = dimension === 'site' ? '站点名称' : '告警名称';
    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>${rankHeader}</th>
                    <th>${nameHeader}</th>
                    <th>告警次数</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach((item, index) => {
        tableHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.count}</td>
            </tr>
        `;
    });
    tableHtml += `</tbody></table>`;
    return tableHtml;
}

// ==================================
// 通用卡片操作按钮事件处理
// ==================================
function initCommonCardActions() {
    const cards = document.querySelectorAll('.stats-card');

    cards.forEach(card => {
        const switchViewBtn = card.querySelector('.btn-switch-view');
        const exportBtn = card.querySelector('.btn-export');
        const detailsBtn = card.querySelector('.btn-details');
        const chartContainer = card.querySelector('.chart-container');
        const tableContainer = card.querySelector('.table-container');

        // 切换视图 (图/表)
        if (switchViewBtn && chartContainer && tableContainer) {
            switchViewBtn.addEventListener('click', () => {
                const isChartVisible = chartContainer.style.display !== 'none';
                chartContainer.style.display = isChartVisible ? 'none' : '';
                tableContainer.style.display = isChartVisible ? '' : 'none';
                // 切换按钮图标
                switchViewBtn.innerHTML = isChartVisible ? '<i class="fas fa-chart-bar"></i>' : '<i class="fas fa-table"></i>';
                switchViewBtn.title = isChartVisible ? '切换到图表' : '切换到表格';
                // 如果切换回图表，尝试resize以适应容器
                if (!isChartVisible) {
                    const chartId = chartContainer.id.replace('-chart', ''); // health-score-chart -> healthScore
                     if (charts[chartId]) {
                         try { charts[chartId].resize(); } catch(e) {}
                     }
                }
            });
        }

        // 导出数据 (占位符)
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const cardId = card.id;
                const isChartVisible = chartContainer.style.display !== 'none';
                console.log(`导出卡片 [${cardId}] 的数据，当前显示的是 ${isChartVisible ? '图表' : '表格'}`);
                alert('导出功能暂未实现'); // 临时提示
            });
        }

        // 查看详情
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                const cardId = card.id;
                console.log(`查看卡片 [${cardId}] 的详情`);
                
                // 根据不同的卡片类型执行不同的操作
                if (cardId === 'health-score-card') {
                    // 健康评分卡片 - 跳转到健康评分详情页面
                    window.location.href = 'health-score-detail.html';
                } else {
                    // 其他卡片暂时显示提示信息
                    alert('详情功能正在开发中，敬请期待！');
                }
            });
        }
    });
}

// ==================================
// 自定义日期模态框
// ==================================
function initCustomDateModal() {
    const modal = document.getElementById('custom-date-modal');
    const closeBtn = document.getElementById('close-custom-date');
    const confirmBtn = document.getElementById('confirm-custom-date');
    const startDateInput = document.getElementById('custom-start-date');
    const endDateInput = document.getElementById('custom-end-date');

    if (!modal || !closeBtn || !confirmBtn || !startDateInput || !endDateInput) {
        console.error('自定义日期模态框元素未找到！');
        return;
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate) {
            const cardId = currentCardIdForModal;
            if (moduleUpdaters[cardId]) {
                moduleUpdaters[cardId](null, null, startDate, endDate);
            }
            modal.style.display = 'none';
        }
    });

    // 初始化日期输入框
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDateInput.value = weekAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
}

function showCustomDateModal() {
    const modal = document.getElementById('custom-date-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function getDisplayTimeRangeText(timeRange, startDate, endDate) {
    switch (timeRange) {
        case 'all':
            return '累计';
        case 'year':
            return '全年';
        case 'month':
            return '本月';
        case 'week':
            return '本周';
        case 'day':
            return '今日';
        case 'custom':
            return `${startDate} 至 ${endDate}`;
        default:
            return '未知时间范围';
    }
}

// ==================================
// 能耗统计模块 (Energy Consumption)
// ==================================

// 模拟生成能耗数据 (储能系统：充电量、放电量、效率)
function generateEnergyData(rankType = 'top', timeRange = 'all') {
    console.log(`生成能耗数据, 排名: ${rankType}, 时间范围: ${timeRange}`);
    const sites = [
        '北京未来科学城站', '长沙岳麓站', '郑州航空港站', '武汉光谷站',
        '天津滨海站', '南京江北站', '合肥高新站', '杭州西湖站',
        '上海临港站', '深圳前海站', '广州南沙站', '成都天府站',
        '重庆两江站', '西安西咸站', '苏州工业园站'
    ];
    let data = [];

    // 根据时间范围调整数据基数和波动范围
    let baseCharge = 5000;
    let chargeRange = 2000;
    let efficiencyBase = 80;
    let efficiencyRange = 15;

    switch (timeRange) {
        case 'day': baseCharge = 100; chargeRange = 50; break;
        case 'week': baseCharge = 700; chargeRange = 300; break;
        case 'month': baseCharge = 3000; chargeRange = 1500; break;
        case 'year': baseCharge = 40000; chargeRange = 15000; break;
        case 'all': baseCharge = 100000; chargeRange = 40000; break;
        // 'custom' 时间范围的数据模拟可以更复杂，暂时使用 'all' 的基数
    }

    for (let i = 0; i < sites.length; i++) {
        const charge = Math.max(1, Math.floor(baseCharge + (Math.random() - 0.5) * chargeRange)); // 充电量，确保不为0
        const efficiency = efficiencyBase + Math.random() * efficiencyRange; // 效率 %
        const discharge = Math.floor(charge * (efficiency / 100)); // 放电量

        data.push({
            name: sites[i],
            charge: charge,
            discharge: discharge,
            efficiency: parseFloat(efficiency.toFixed(2)) // 保留两位小数
        });
    }

    // 根据充电量排序
    data.sort((a, b) => b.charge - a.charge);

    // 根据排名类型选择 Top 10 或 Last 10
    if (rankType === 'top') {
        data = data.slice(0, 10);
    } else { // rankType === 'last'
        // 如果需要 Last 10，则取排序后的后10个；如果总数不足，则取全部
        data = data.slice(-10);
        // Last 10 通常也期望按升序显示，所以反转一下
        data.reverse();
    }

    return data;
}

// 获取能耗统计图表配置 (储能)
function getEnergyChartOption(data) {
    const siteNames = data.map(item => item.name);
    const chargeData = data.map(item => item.charge);
    const dischargeData = data.map(item => item.discharge);
    const efficiencyData = data.map(item => item.efficiency);

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params) => {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(p => {
                    let unit = '';
                    if (p.seriesName === '充电量' || p.seriesName === '放电量') {
                        unit = ' kWh';
                    } else if (p.seriesName === '系统效率') {
                        unit = ' %';
                    }
                    tooltip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>${p.seriesName}: ${p.value}${unit}<br/>`;
                });
                return tooltip;
            }
        },
        legend: {
            data: ['充电量', '放电量', '系统效率'],
            bottom: 5
        },
        grid: {
            top: '15%', // 留出更多空间给图例和标题
            left: '3%',
            right: '4%', // 右侧留空间给Y轴2
            bottom: '15%', // 底部留空间给图例和X轴标签旋转
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: siteNames,
            axisLabel: {
                interval: 0, // 显示所有标签
                rotate: 30, // 旋转标签防止重叠
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '电量 (kWh)',
                position: 'left',
                axisLabel: { formatter: '{value} kWh' },
                splitLine: { show: true }
            },
            {
                type: 'value',
                name: '效率 (%)',
                position: 'right',
                min: 0,
                max: 100, // 效率通常在0-100之间
                axisLabel: { formatter: '{value} %' },
                splitLine: { show: false } // 避免过多网格线
            }
        ],
        series: [
            {
                name: '充电量',
                type: 'bar',
                yAxisIndex: 0, // 使用左侧Y轴
                itemStyle: { color: '#5470C6' }, // 示例颜色
                data: chargeData
            },
            {
                name: '放电量',
                type: 'bar',
                yAxisIndex: 0, // 使用左侧Y轴
                itemStyle: { color: '#91CC75' }, // 示例颜色
                data: dischargeData
            },
            {
                name: '系统效率',
                type: 'line',
                yAxisIndex: 1, // 使用右侧Y轴
                itemStyle: { color: '#EE6666' }, // 示例颜色
                symbol: 'circle', // 标记点样式
                symbolSize: 8,
                data: efficiencyData
            }
        ]
    };
}

// 生成能耗统计表格 (储能)
function generateEnergyTable(data) {
    let tableHtml = `<table class="stats-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>站点名称</th>
                                <th>充电量 (kWh)</th>
                                <th>放电量 (kWh)</th>
                                <th>系统效率 (%)</th>
                            </tr>
                        </thead>
                        <tbody>`;
    data.forEach((item, index) => {
        tableHtml += `<tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.charge}</td>
                        <td>${item.discharge}</td>
                        <td>${item.efficiency}</td>
                      </tr>`;
    });
    tableHtml += `   </tbody>
                    </table>`;
    return tableHtml;
}

// 加载并更新能耗卡片数据
function loadEnergyData(cardId = 'energy-card', rankType = null, timeRange = null, startDate = null, endDate = null) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const currentRank = rankType || card.querySelector('.rank-toggle .btn-rank.active')?.dataset.rank || 'top';
    const currentTimeRange = timeRange || card.querySelector('.time-range-toggle .btn-time-range.active')?.dataset.range || 'all';

    // 更新按钮状态
    updateButtonStates(card, currentRank, currentTimeRange);

    // 获取或生成数据
    const data = generateEnergyData(currentRank, currentTimeRange, startDate, endDate);

    // 获取图表和表格容器
    const chartContainer = card.querySelector('.chart-container');
    const tableContainer = card.querySelector('.table-container');
    const chartInstance = echarts.getInstanceByDom(chartContainer);

    if (!chartInstance) {
        console.error(`图表实例未找到: ${cardId}`);
        return;
    }

    // 更新图表
    chartInstance.setOption(getEnergyChartOption(data), true); // true 表示不合并配置

    // 更新表格
    tableContainer.innerHTML = generateEnergyTable(data);

    // 更新时间范围显示文本 (如果需要的话，可以添加一个 .time-range-display 元素)
    // const displayElement = card.querySelector('.time-range-display');
    // if (displayElement) {
    //     displayElement.textContent = getDisplayTimeRangeText(currentTimeRange, startDate, endDate);
    // }

    console.log(`能耗数据加载完成: ${cardId}, 排名: ${currentRank}, 时间范围: ${currentTimeRange}`);
}

// 初始化能耗统计卡片
function initEnergyCard() {
    console.log('初始化能耗统计卡片');
    const card = document.getElementById('energy-card');
    if (!card) {
        console.error('未找到能耗统计卡片元素');
        return;
    }

    const chartContainer = card.querySelector('.chart-container');
    const tableContainer = card.querySelector('.table-container');
    if (!chartContainer || !tableContainer) {
        console.error('未找到能耗统计卡片的图表或表格容器');
        return;
    }

    // 初始化 ECharts 实例
    const chartInstance = echarts.init(chartContainer);

    // 加载初始数据
    loadEnergyData('energy-card', 'top', 'all');

    // 绑定通用卡片操作事件 (时间范围, 排名, 视图切换等)
    initCommonCardActions(card, loadEnergyData);
}