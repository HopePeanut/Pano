/**
 * alarm-statistics.js
 * 智慧运维系统 - 告警统计页面脚本
 * 
 * 本文件包含告警统计页面的所有交互逻辑和图表渲染
 */

// 全局存储 ECharts 实例
let activeCharts = {};

// 统一的窗口大小调整处理器
function handleResize() {
    for (const chartId in activeCharts) {
        if (activeCharts.hasOwnProperty(chartId)) {
            const chartInstance = activeCharts[chartId];
            if (chartInstance) {
                try {
                    chartInstance.resize();
                } catch (error) {
                    console.error(`[Debug] Error resizing chart ${chartId}:`, error);
                    // 移除有问题的实例
                    delete activeCharts[chartId]; 
                }
            }
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavbar();
    
    // 初始化筛选器
    initFilters();
    
    // 初始化模态框
    initModal();
    
    // 加载并渲染统计数据
    loadStatisticsData();
    
    // 初始化事件监听
    initEventListeners();
    
    // 更新数据时间戳
    updateTimestamps();

    // 添加统一的 resize 监听器
    window.addEventListener('resize', handleResize);
    console.log('[Debug] Global resize listener added.');
});

// 导航栏初始化
function initNavbar() {
    // 调用导航栏模板脚本中的初始化函数
    if (typeof initializeNavbar === 'function') {
        initializeNavbar();
    }
}

// 初始化筛选器
function initFilters() {
    // 加载站点数据
    loadSiteOptions();
    
    // 加载设备数据
    loadDeviceOptions();
    
    // 监听筛选器下拉点击
    document.querySelectorAll('.filter-dropdown .btn-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            // 关闭所有打开的下拉菜单
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown !== this.nextElementSibling) {
                    dropdown.classList.remove('show');
                }
            });
            
            // 切换当前下拉菜单的显示状态
            this.nextElementSibling.classList.toggle('show');
        });
    });
    
    // 点击其他区域时关闭下拉菜单
    document.addEventListener('click', function(event) {
        if (!event.target.matches('.btn-filter') && !event.target.closest('.dropdown-content')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // 初始化时间范围选择器
    document.querySelectorAll('.time-range-toggle .btn-time-range').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-range-toggle .btn-time-range').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // 根据选择的时间范围重新加载数据
            const timeRange = this.getAttribute('data-range');
            loadStatisticsData(timeRange);
        });
    });
    
    // 搜索按钮事件
    document.querySelector('.search-box .btn-search').addEventListener('click', function() {
        const searchTerm = document.getElementById('search-input').value.trim();
        if (searchTerm) {
            // 按关键词搜索
            filterByKeyword(searchTerm);
        }
    });
    
    // 回车键触发搜索
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm) {
                filterByKeyword(searchTerm);
            }
        }
    });
}

// 加载站点选项
function loadSiteOptions() {
    // 模拟站点数据
    const sites = [
        { id: 'site1', name: '清安储能站' },
        { id: 'site2', name: '南沙储能电站' },
        { id: 'site3', name: '天河充电站' },
        { id: 'site4', name: '黄埔光伏电站' },
        { id: 'site5', name: '白云储能站' }
    ];
    
    const siteFilterContent = document.getElementById('site-filter-content');
    siteFilterContent.innerHTML = '';
    
    sites.forEach(site => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${site.id}" checked> ${site.name}`;
        siteFilterContent.appendChild(label);
    });
    
    // 为站点筛选选项添加事件
    siteFilterContent.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 根据选择的站点重新加载数据
            loadStatisticsData();
        });
    });
}

// 加载设备选项
function loadDeviceOptions() {
    // 模拟设备数据
    const devices = [
        { id: 'dev1', name: '1#储能柜' },
        { id: 'dev2', name: '2#储能柜' },
        { id: 'dev3', name: '3#储能柜' },
        { id: 'dev4', name: '4#储能柜' },
        { id: 'dev5', name: '5#储能柜' },
        { id: 'dev6', name: '充电桩-01' },
        { id: 'dev7', name: '充电桩-02' },
        { id: 'dev8', name: '光伏逆变器-01' },
        { id: 'dev9', name: '光伏逆变器-02' }
    ];
    
    const deviceFilterContent = document.getElementById('device-filter-content');
    deviceFilterContent.innerHTML = '';
    
    devices.forEach(device => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${device.id}" checked> ${device.name}`;
        deviceFilterContent.appendChild(label);
    });
    
    // 为设备筛选选项添加事件
    deviceFilterContent.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 根据选择的设备重新加载数据
            loadStatisticsData();
        });
    });
}

// 初始化模态框
function initModal() {
    const modal = document.getElementById('custom-date-modal');
    const openModalBtn = document.querySelector('.btn-custom-date');
    const closeModalBtn = document.getElementById('close-custom-date');
    const cancelBtn = document.getElementById('cancel-custom-date');
    const confirmBtn = document.getElementById('confirm-custom-date');
    
    // 打开模态框
    openModalBtn.addEventListener('click', function() {
        modal.classList.add('active');
    });
    
    // 关闭模态框的多种方式
    closeModalBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // 确认自定义日期
    confirmBtn.addEventListener('click', function() {
        const startDate = document.getElementById('custom-start-date').value;
        const endDate = document.getElementById('custom-end-date').value;
        
        if (startDate && endDate) {
            // 使用自定义日期重新加载数据
            loadStatisticsData('custom', startDate, endDate);
            modal.classList.remove('active');
        } else {
            alert('请选择开始和结束日期');
        }
    });
    
    // 设置日期选择器默认值为今天和7天前
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    document.getElementById('custom-end-date').valueAsDate = today;
    document.getElementById('custom-start-date').valueAsDate = weekAgo;
}

// 初始化事件监听
function initEventListeners() {
    // 告警趋势图表类型切换
    document.querySelectorAll('#alarm-trend-card .btn-chart-type').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#alarm-trend-card .btn-chart-type').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const chartType = this.getAttribute('data-type');
            // 获取当前选中的时间范围
            const timeRange = document.querySelector('.time-range-toggle .btn-time-range.active').getAttribute('data-range');
            renderAlarmTrendChart(chartType, timeRange);
        });
    });
    
    // 告警类型图表类型切换
    document.querySelectorAll('#alarm-type-card .btn-chart-type').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#alarm-type-card .btn-chart-type').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const chartType = this.getAttribute('data-type');
            // 获取当前选中的时间范围
            const timeRange = document.querySelector('.time-range-toggle .btn-time-range.active').getAttribute('data-range');
            renderAlarmTypeChart(chartType, timeRange);
        });
    });
    
    // 告警TOP榜维度切换
    document.querySelectorAll('#alarm-top-card .btn-rank-dim').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#alarm-top-card .btn-rank-dim').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const dimension = this.getAttribute('data-dimension');
            // 获取当前选中的时间范围
            const timeRange = document.querySelector('.time-range-toggle .btn-time-range.active').getAttribute('data-range');
            renderAlarmTopChart(dimension, timeRange);
        });
    });
    
    // 视图切换按钮（图表/表格）
    document.querySelectorAll('.btn-switch-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardContent = this.closest('.stats-card').querySelector('.card-content');
            const chartContainer = cardContent.querySelector('.chart-container');
            const tableContainer = cardContent.querySelector('.table-container');
            
            if (chartContainer.style.display !== 'none') {
                chartContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                this.innerHTML = '<i class="fas fa-chart-bar"></i>';
                this.title = '切换为图表视图';
            } else {
                chartContainer.style.display = 'block';
                tableContainer.style.display = 'none';
                this.innerHTML = '<i class="fas fa-table"></i>';
                this.title = '切换为表格视图';
            }
        });
    });
    
    // 数据导出按钮
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardId = this.closest('.stats-card').id;
            exportData(cardId);
        });
    });
}

// 加载统计数据
function loadStatisticsData(timeRange = '7days', startDate = null, endDate = null) {
    // 在实际应用中，这里应该是从后端API获取数据
    // 这里使用模拟数据进行演示
    
    // 显示加载状态
    showLoading();
    
    // 模拟异步加载
    setTimeout(() => {
        // 加载告警概览数据
        loadAlarmOverview(timeRange);
        
        // 渲染告警趋势图
        renderAlarmTrendChart('bar', timeRange);
        
        // 渲染告警类型占比图
        renderAlarmTypeChart('pie', timeRange);
        
        // 渲染告警TOP榜
        renderAlarmTopChart('alarm', timeRange);
        
        // 隐藏加载状态
        hideLoading();
        
        // 更新时间戳
        updateTimestamps();
    }, 500);
}

// 显示加载状态
function showLoading() {
    // 这里可以添加加载动画逻辑
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '<div class="loading-spinner">加载中...</div>';
    });
}

// 隐藏加载状态
function hideLoading() {
    // 移除加载动画
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.remove();
    });
}

// 加载告警概览数据
function loadAlarmOverview(timeRange = '7days') {
    // 模拟不同时间范围的数据
    let overviewData;
    
    switch(timeRange) {
        case 'day':
            overviewData = {
                total: 48,
                fault: 5,
                warning: 18,
                info: 25,
                unprocessed: 3
            };
            break;
        case 'week':
            overviewData = {
                total: 156,
                fault: 20,
                warning: 62,
                info: 74,
                unprocessed: 12
            };
            break;
        case 'month':
            overviewData = {
                total: 625,
                fault: 78,
                warning: 243,
                info: 304,
                unprocessed: 35
            };
            break;
        default: // 7days 或其他
            overviewData = {
                total: 389,
                fault: 45,
                warning: 156,
                info: 188,
                unprocessed: 23
            };
    }
    
    // 更新计数器
    document.getElementById('total-alarm-count').textContent = overviewData.total;
    document.getElementById('fault-alarm-count').textContent = overviewData.fault;
    document.getElementById('warning-alarm-count').textContent = overviewData.warning;
    document.getElementById('info-alarm-count').textContent = overviewData.info;
    document.getElementById('unprocessed-alarm-count').textContent = overviewData.unprocessed;
    
    // 添加数字增长动画效果
    animateCounters();
}

// 数字增长动画
function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        const finalValue = parseInt(counter.textContent);
        let startValue = 0;
        const duration = 1000; // 动画持续时间（毫秒）
        const frameRate = 30; // 每秒帧数
        const increment = finalValue / (duration / 1000 * frameRate);
        
        const timer = setInterval(() => {
            startValue += increment;
            counter.textContent = Math.floor(startValue);
            
            if (startValue >= finalValue) {
                counter.textContent = finalValue;
                clearInterval(timer);
            }
        }, 1000 / frameRate);
    });
}

// 重置图表容器函数 - 直接操作DOM，避免使用dispose
function resetChartContainer(chartId) {
    const chartDom = document.getElementById(chartId);
    if (!chartDom) return null;
    
    console.log(`[Debug] Resetting chart container for ${chartId}`);
    
    // 清除旧的图表实例引用
    if (activeCharts[chartId]) {
        // 不调用dispose，直接删除引用
        delete activeCharts[chartId];
    }
    
    // 保存父元素引用
    const parentNode = chartDom.parentNode;
    
    // 如果不存在父节点，直接返回
    if (!parentNode) {
        console.error(`[Debug] Cannot find parent node for ${chartId}`);
        return null;
    }
    
    // 记住原始的ID和样式
    const id = chartDom.id;
    const className = chartDom.className;
    const style = chartDom.getAttribute('style') || '';
    
    // 移除原始元素
    parentNode.removeChild(chartDom);
    
    // 创建新元素
    const newChartDom = document.createElement('div');
    newChartDom.id = id;
    newChartDom.className = className;
    newChartDom.setAttribute('style', style);
    
    // 添加新元素
    parentNode.appendChild(newChartDom);
    
    console.log(`[Debug] Chart container for ${chartId} has been reset`);
    
    // 返回新的DOM元素
    return newChartDom;
}

// 渲染告警趋势图
function renderAlarmTrendChart(chartType = 'bar', timeRange = '7days') {
    console.log(`[Debug] renderAlarmTrendChart called with chartType: ${chartType}, timeRange: ${timeRange}`);
    const chartId = 'alarm-trend-chart';
    
    // 重置图表容器
    const chartDom = resetChartContainer(chartId);
    if (!chartDom) {
        console.error(`[Debug] Error: Cannot reset container for ${chartId}`);
        return;
    }
    
    try {
        // 创建新实例
        const myChart = echarts.init(chartDom);
        console.log(`[Debug] New ECharts instance created for ${chartId}`);
        activeCharts[chartId] = myChart; // 存储新实例

        // --- 数据和配置部分开始 ---
        let dates = [];
        let faultData = [];
        let warningData = [];
        let infoData = [];
        
        switch(timeRange) {
            case 'day':
                for (let i = 0; i < 24; i++) {
                    dates.push(`${i}:00`);
                    faultData.push(Math.floor(Math.random() * 3));
                    warningData.push(Math.floor(Math.random() * 5));
                    infoData.push(Math.floor(Math.random() * 7));
                }
                break;
            case 'week':
                const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                dates = weekdays;
                faultData = [3, 5, 2, 4, 6, 2, 3];
                warningData = [8, 12, 9, 14, 10, 7, 11];
                infoData = [15, 10, 12, 18, 14, 16, 13];
                break;
            case 'month':
                for (let i = 1; i <= 30; i += 5) {
                    const endDay = Math.min(i + 4, 30);
                    dates.push(`${i}-${endDay}日`);
                    faultData.push(Math.floor(Math.random() * 10 + 5));
                    warningData.push(Math.floor(Math.random() * 15 + 10));
                    infoData.push(Math.floor(Math.random() * 20 + 15));
                }
                break;
            default:
                dates = getLastNDays(7).map(date => date.toLocaleDateString('zh-CN', {month: '2-digit', day: '2-digit'}));
                faultData = [6, 9, 4, 7, 5, 8, 6];
                warningData = [15, 22, 18, 25, 19, 28, 29];
                infoData = [30, 20, 36, 25, 22, 30, 25];
        }
        
        const option = {
             tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
             legend: { data: ['故障', '告警', '提示'], bottom: 0 },
             grid: { left: '3%', right: '4%', bottom: '8%', top: '3%', containLabel: true },
             xAxis: { type: 'category', data: dates, axisLabel: { rotate: 0 } },
             yAxis: { type: 'value', name: '告警数量', nameTextStyle: { padding: [0, 0, 0, 40] } },
             series: [
                 { name: '故障', type: chartType, stack: chartType === 'bar' ? '总量' : undefined, emphasis: { focus: 'series' }, data: faultData, itemStyle: { color: '#E74C3C' } },
                 { name: '告警', type: chartType, stack: chartType === 'bar' ? '总量' : undefined, emphasis: { focus: 'series' }, data: warningData, itemStyle: { color: '#F1C40F' } },
                 { name: '提示', type: chartType, stack: chartType === 'bar' ? '总量' : undefined, emphasis: { focus: 'series' }, data: infoData, itemStyle: { color: '#3498DB' } }
             ]
        };
        // --- 数据和配置部分结束 ---
        
        console.log(`[Debug] Option for ${chartId}:`, option);
        myChart.setOption(option); 
        console.log(`[Debug] setOption called for ${chartId}`);
        
        updateAlarmTrendTable(dates, faultData, warningData, infoData);
        
    } catch (error) {
        console.error(`[Debug] Error rendering ${chartId}:`, error);
    }
}

// 更新告警趋势表格
function updateAlarmTrendTable(dates, faultData, warningData, infoData) {
    // 构建表格数据
    const tableData = [];
    for (let i = 0; i < dates.length; i++) {
        tableData.push({
            date: dates[i],
            fault: faultData[i],
            warning: warningData[i],
            info: infoData[i],
            total: faultData[i] + warningData[i] + infoData[i]
        });
    }
    
    const tableContainer = document.getElementById('alarm-trend-table');
    
    // 创建表格HTML
    let tableHTML = `
    <table>
        <thead>
            <tr>
                <th>日期</th>
                <th>故障</th>
                <th>告警</th>
                <th>提示</th>
                <th>总数</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // 添加表格行
    tableData.forEach(row => {
        tableHTML += `
        <tr>
            <td>${row.date}</td>
            <td>${row.fault}</td>
            <td>${row.warning}</td>
            <td>${row.info}</td>
            <td>${row.total}</td>
        </tr>
        `;
    });
    
    tableHTML += `
        </tbody>
    </table>
    `;
    
    // 更新表格容器内容
    tableContainer.innerHTML = tableHTML;
}

// 渲染告警类型占比图
function renderAlarmTypeChart(chartType = 'pie', timeRange = '7days') {
    console.log(`[Debug] renderAlarmTypeChart called with chartType: ${chartType}, timeRange: ${timeRange}`);
    const chartId = 'alarm-type-chart';
    
    // 重置图表容器
    const chartDom = resetChartContainer(chartId);
    if (!chartDom) {
        console.error(`[Debug] Error: Cannot reset container for ${chartId}`);
        return;
    }
    
    try {
        // 创建新实例
        const myChart = echarts.init(chartDom);
        console.log(`[Debug] New ECharts instance created for ${chartId}`);
        activeCharts[chartId] = myChart;

        // --- 数据和配置部分开始 ---
        let data;
        switch(timeRange) {
            case 'day':
                data = [
                    { value: 12, name: 'EMS' }, { value: 16, name: 'BMS' }, { value: 9, name: 'PCS' }, { value: 5, name: '热管理' }, { value: 2, name: '消防' }, { value: 3, name: '动环电气' }
                ];
                break;
            case 'week':
                data = [
                    { value: 35, name: 'EMS' }, { value: 42, name: 'BMS' }, { value: 28, name: 'PCS' }, { value: 15, name: '热管理' }, { value: 8, name: '消防' }, { value: 10, name: '动环电气' }
                ];
                break;
            case 'month':
                data = [
                    { value: 130, name: 'EMS' }, { value: 168, name: 'BMS' }, { value: 95, name: 'PCS' }, { value: 65, name: '热管理' }, { value: 32, name: '消防' }, { value: 45, name: '动环电气' }
                ];
                break;
            default:
                data = [
                    { value: 88, name: 'EMS' }, { value: 105, name: 'BMS' }, { value: 65, name: 'PCS' }, { value: 38, name: '热管理' }, { value: 20, name: '消防' }, { value: 28, name: '动环电气' }
                ];
        }
        
        const option = {
             tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
             legend: { orient: 'horizontal', bottom: 0, data: data.map(item => item.name) },
             series: [{
                name: '设备类型',
                type: chartType === 'rose' ? 'pie' : chartType,
                radius: chartType === 'rose' ? ['30%', '70%'] : '70%',
                center: ['50%', '45%'],
                roseType: chartType === 'rose' ? 'radius' : undefined,
                itemStyle: { borderRadius: 5 },
                label: { show: true, formatter: '{b}: {d}%' },
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
                data: data
             }]
        };
        // --- 数据和配置部分结束 ---

        console.log(`[Debug] Option for ${chartId}:`, option);
        myChart.setOption(option); 
        console.log(`[Debug] setOption called for ${chartId}`);
        
        updateAlarmTypeTable(data);
        
    } catch (error) {
        console.error(`[Debug] Error rendering ${chartId}:`, error);
    }
}

// 更新告警类型表格
function updateAlarmTypeTable(data) {
    const tableContainer = document.getElementById('alarm-type-table');
    
    // 计算总数
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // 创建表格HTML
    let tableHTML = `
    <table>
        <thead>
            <tr>
                <th>告警类型</th>
                <th>数量</th>
                <th>占比</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // 添加表格行
    data.forEach(item => {
        const percentage = ((item.value / total) * 100).toFixed(2);
        tableHTML += `
        <tr>
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${percentage}%</td>
        </tr>
        `;
    });
    
    // 添加合计行
    tableHTML += `
        <tr>
            <td><strong>合计</strong></td>
            <td><strong>${total}</strong></td>
            <td><strong>100%</strong></td>
        </tr>
    `;
    
    tableHTML += `
        </tbody>
    </table>
    `;
    
    // 更新表格容器内容
    tableContainer.innerHTML = tableHTML;
}

// 渲染告警TOP榜
function renderAlarmTopChart(dimension = 'alarm', timeRange = '7days') {
    console.log(`[Debug] renderAlarmTopChart called with dimension: ${dimension}, timeRange: ${timeRange}`);
    const chartId = 'alarm-top-chart';
    
    // 重置图表容器
    const chartDom = resetChartContainer(chartId);
    if (!chartDom) {
        console.error(`[Debug] Error: Cannot reset container for ${chartId}`);
        return;
    }
    
    try {
        // 创建新实例
        const myChart = echarts.init(chartDom);
        console.log(`[Debug] New ECharts instance created for ${chartId}`);
        activeCharts[chartId] = myChart;

        // --- 数据和配置部分开始 ---
        let data;
        if (dimension === 'alarm') {
             switch(timeRange) {
                case 'day':
                    data = [
                         { name: 'SOC过低', value: 11 }, { name: '电池温度过高', value: 8 }, { name: '电池电压异常', value: 7 }, { name: '电网电压波动', value: 6 }, { name: '通信中断', value: 5 }
                    ];
                    break;
                case 'week':
                    data = [
                         { name: 'SOC过低', value: 32 }, { name: '电池温度过高', value: 25 }, { name: '电池电压异常', value: 21 }, { name: '电网电压波动', value: 19 }, { name: '通信中断', value: 18 }, { name: '风扇故障', value: 15 }, { name: '功率超限', value: 13 }
                    ];
                    break;
                case 'month':
                    data = [
                         { name: 'SOC过低', value: 112 }, { name: '电池温度过高', value: 95 }, { name: '电池电压异常', value: 81 }, { name: '通信中断', value: 78 }, { name: '电网电压波动', value: 69 }, { name: '风扇故障', value: 65 }, { name: '功率超限', value: 53 }, { name: '门禁异常', value: 42 }, { name: '充电超时', value: 30 }
                    ];
                    break;
                default:
                    data = [
                         { name: 'SOC过低', value: 80 }, { name: '电池温度过高', value: 65 }, { name: '电池电压异常', value: 55 }, { name: '通信中断', value: 45 }, { name: '电网电压波动', value: 40 }, { name: '功率超限', value: 35 }, { name: '风扇故障', value: 25 }, { name: '充电超时', value: 29 }, { name: '门禁异常', value: 15 }
                    ];
            }
        } else {
            switch(timeRange) {
                case 'day':
                    data = [
                         { name: '清安储能站', value: 13 }, { name: '南沙储能电站', value: 10 }, { name: '天河充电站', value: 9 }, { name: '黄埔光伏电站', value: 9 }, { name: '白云储能站', value: 7 }
                    ];
                    break;
                case 'week':
                    data = [
                         { name: '清安储能站', value: 42 }, { name: '南沙储能电站', value: 35 }, { name: '天河充电站', value: 28 }, { name: '黄埔光伏电站', value: 27 }, { name: '白云储能站', value: 24 }
                    ];
                    break;
                case 'month':
                    data = [
                         { name: '清安储能站', value: 165 }, { name: '南沙储能电站', value: 142 }, { name: '天河充电站', value: 118 }, { name: '黄埔光伏电站', value: 110 }, { name: '白云储能站', value: 90 }
                    ];
                    break;
                default:
                    data = [
                         { name: '清安储能站', value: 108 }, { name: '南沙储能电站', value: 95 }, { name: '天河充电站', value: 78 }, { name: '黄埔光伏电站', value: 65 }, { name: '白云储能站', value: 43 }
                    ];
            }
        }
        
        data.sort((a, b) => b.value - a.value);
        
        const option = {
              tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
             grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
             xAxis: { type: 'value', name: '告警数量' },
             yAxis: { type: 'category', data: data.map(item => item.name), inverse: true },
             series: [{
                name: '告警数量',
                type: 'bar',
                data: data.map(item => item.value),
                label: { show: true, position: 'right' },
                itemStyle: {
                    color: function(params) {
                        const colorList = [
                            '#3498DB', '#3498DB', '#3498DB', '#3498DB', '#3498DB', 
                            '#F1C40F', '#F1C40F', '#F1C40F', 
                            '#E74C3C', '#E74C3C'
                        ];
                        return colorList[params.dataIndex] || '#3498DB';
                    }
                }
             }]
        };
        // --- 数据和配置部分结束 ---

        console.log(`[Debug] Option for ${chartId}:`, option);
        myChart.setOption(option); 
        console.log(`[Debug] setOption called for ${chartId}`);
        
        updateAlarmTopTable(data, dimension);
        
    } catch (error) {
        console.error(`[Debug] Error rendering ${chartId}:`, error);
    }
}

// 更新告警TOP表格
function updateAlarmTopTable(data, dimension) {
    const tableContainer = document.getElementById('alarm-top-table');
    
    // 创建表格HTML
    let tableHTML = `
    <table>
        <thead>
            <tr>
                <th>排名</th>
                <th>${dimension === 'alarm' ? '告警名称' : '站点名称'}</th>
                <th>数量</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // 添加表格行
    data.forEach((item, index) => {
        tableHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.value}</td>
        </tr>
        `;
    });
    
    tableHTML += `
        </tbody>
    </table>
    `;
    
    // 更新表格容器内容
    tableContainer.innerHTML = tableHTML;
}

// 渲染告警详情表格
function renderAlarmDetailsTable() {
    const tableContainer = document.getElementById('alarm-details-table');
    
    // 模拟告警详情数据
    const alarmData = [
        { site: '清安储能站', device: '1#储能柜', type: '通信中断', level: '告警', startTime: '2023-09-28 10:15:32', endTime: '2023-09-28 10:45:21', duration: '29分49秒', status: '已恢复' },
        { site: '南沙储能电站', device: '2#储能柜', type: '电池温度过高', level: '故障', startTime: '2023-09-28 14:22:10', endTime: '', duration: '-', status: '未处理' },
        { site: '天河充电站', device: '充电桩-01', type: '充电异常', level: '告警', startTime: '2023-09-28 16:05:47', endTime: '2023-09-28 16:35:12', duration: '29分25秒', status: '已恢复' },
        { site: '黄埔光伏电站', device: '光伏逆变器-01', type: '光伏组件故障', level: '故障', startTime: '2023-09-28 08:12:33', endTime: '2023-09-28 11:40:58', duration: '3时28分25秒', status: '已处理' },
        { site: '清安储能站', device: '2#储能柜', type: '电池SOC过低', level: '告警', startTime: '2023-09-29 09:27:14', endTime: '', duration: '-', status: '未处理' },
        { site: '南沙储能电站', device: '1#储能柜', type: '通信中断', level: '提示', startTime: '2023-09-29 11:33:45', endTime: '2023-09-29 11:45:12', duration: '11分27秒', status: '已恢复' },
        { site: '白云储能站', device: '1#储能柜', type: '逆变器过载', level: '告警', startTime: '2023-09-29 13:50:21', endTime: '', duration: '-', status: '未处理' },
        { site: '天河充电站', device: '充电桩-02', type: '充电桩通信中断', level: '提示', startTime: '2023-09-29 15:17:39', endTime: '2023-09-29 15:32:08', duration: '14分29秒', status: '已恢复' },
        { site: '黄埔光伏电站', device: '光伏逆变器-02', type: '通信中断', level: '提示', startTime: '2023-09-30 07:45:32', endTime: '2023-09-30 08:10:45', duration: '25分13秒', status: '已恢复' },
        { site: '清安储能站', device: '2#储能柜', type: '电池均衡异常', level: '告警', startTime: '2023-09-30 10:05:18', endTime: '2023-09-30 14:30:26', duration: '4时25分08秒', status: '已处理' }
    ];
    
    // 创建表格HTML
    let tableHTML = `
    <table>
        <thead>
            <tr>
                <th>站点</th>
                <th>设备</th>
                <th>告警类型</th>
                <th>告警等级</th>
                <th>告警时间</th>
                <th>恢复时间</th>
                <th>持续时长</th>
                <th>处理状态</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // 添加表格行，并根据告警等级和状态添加特定样式
    alarmData.forEach(alarm => {
        const levelClass = alarm.level === '故障' ? 'level-fault' : (alarm.level === '告警' ? 'level-warning' : 'level-info');
        
        const statusClass = alarm.status === '未处理' ? 'status-unprocessed' : 
                          (alarm.status === '已处理' ? 'status-processed' : 'status-recovered');
        
        tableHTML += `
        <tr>
            <td>${alarm.site}</td>
            <td>${alarm.device}</td>
            <td>${alarm.type}</td>
            <td><span class="alarm-level ${levelClass}">${alarm.level}</span></td>
            <td>${alarm.startTime}</td>
            <td>${alarm.endTime || '-'}</td>
            <td>${alarm.duration}</td>
            <td><span class="alarm-status ${statusClass}">${alarm.status}</span></td>
        </tr>
        `;
    });
    
    tableHTML += `
        </tbody>
    </table>
    `;
    
    // 更新表格容器内容
    tableContainer.innerHTML = tableHTML;
}

// 按关键词过滤数据
function filterByKeyword(keyword) {
    // 在实际应用中，这里应该调用后端API进行过滤
    // 这里模拟前端过滤
    alert(`正在搜索关键词: ${keyword}`);
    
    // 重新加载数据，模拟筛选结果
    loadStatisticsData();
}

// 数据导出功能
function exportData(cardId) {
    // 模拟数据导出
    alert(`正在导出 ${cardId} 数据...`);
    
    // 在实际应用中，这里应该调用后端API导出数据
    setTimeout(() => {
        alert('数据导出成功！');
    }, 1000);
}

// 更新数据时间戳
function updateTimestamps() {
    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN');
    
    document.querySelectorAll('.data-update-time span').forEach(span => {
        span.textContent = formattedTime;
    });
}

// 获取最近N天的日期数组
function getLastNDays(n) {
    const result = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        result.push(date);
    }
    return result;
} 