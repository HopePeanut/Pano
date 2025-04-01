/**
 * 告警与日志管理模块
 * 负责处理告警数据的加载、筛选、分页和操作
 */

// 告警与日志页面核心逻辑

// 页面状态管理
const pageState = {
    currentTab: 'realtime', // 当前活动标签：'realtime' 或 'history'
    siteFilter: ['all'], // 站点筛选
    deviceFilter: ['all'], // 设备筛选
    componentFilter: ['all'], // 子部件筛选
    levelFilter: ['all'], // 告警级别筛选
    dateRange: {
        startDate: null,
        endDate: null
    },
    searchKeyword: '', // 搜索关键词
    pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0
    }
};

// 模拟站点和设备数据
const siteDeviceData = {
    'site1': {
        name: '清安储能站',
        devices: [
            { id: 'system1', name: '1#储能系统' },
            { id: 'system2', name: '2#储能系统' }
        ]
    },
    'site2': {
        name: '南海储能站',
        devices: [
            { id: 'system3', name: '1#储能系统' },
            { id: 'system4', name: '2#储能系统' }
        ]
    },
    'site3': {
        name: '东湖储能站',
        devices: [
            { id: 'system5', name: '1#储能系统' }
        ]
    },
    'site4': {
        name: '西区储能站',
        devices: [
            { id: 'system6', name: '1#储能系统' },
            { id: 'system7', name: '2#储能系统' },
            { id: 'system8', name: '3#储能系统' }
        ]
    }
};

// 模拟告警数据（实际项目中应从API获取）
const alarmData = {
    // 实时告警数据
    realTimeAlarms: [
        {
            id: 'ALM20230815001',
            siteName: '清安储能站',
            deviceName: '1#储能系统',
            componentName: 'BMS',
            level: 'fault',
            description: '电池组1温度过高，已超过安全阈值，系统已自动关闭充电',
            time: '2023-08-15 15:30:22',
            suggestion: '请检查温控系统是否正常工作，可能需要降低环境温度或增加冷却'
        },
        {
            id: 'ALM20230815002',
            siteName: '清安储能站',
            deviceName: '2#储能系统',
            componentName: 'PCS',
            level: 'warning',
            description: 'PCS输出功率波动异常，可能影响设备寿命',
            time: '2023-08-15 16:15:43',
            suggestion: '检查电网电压是否稳定，排查外部干扰源，必要时联系厂商维修'
        },
        {
            id: 'ALM20230815003',
            siteName: '南海储能站',
            deviceName: '1#储能系统',
            componentName: '热管理',
        level: 'info',
            description: '散热风扇运行时间超过10000小时，建议检查维护',
            time: '2023-08-15 17:22:10',
            suggestion: '按照维护手册第45页流程进行风扇清洁或更换，建议在下次例行维护时处理'
        },
        // 更多实时告警...
    ],
    
    // 历史告警数据
    historyAlarms: [
        {
            id: 'ALM20230810001',
            siteName: '清安储能站',
            deviceName: '1#储能系统',
            componentName: 'BMS',
            level: 'fault',
            description: '单体电池电压过低，系统已停止放电',
            startTime: '2023-08-10 08:15:33',
            endTime: '2023-08-10 10:22:18',
            duration: '2小时6分钟',
            suggestion: '检查该单体电池是否损坏，如损坏需更换，并建议升级BMS控制策略',
            details: {
                cellId: 'BAT1-M3-C22',
                voltage: '2.85V',
                limitVoltage: '3.0V',
                operator: '张工',
                resolution: '更换了问题电池单元，重新校准了SOC'
            }
        },
        {
            id: 'ALM20230812001',
            siteName: '南海储能站',
            deviceName: '3#储能系统',
            componentName: '消防',
            level: 'warning',
            description: '烟感探测器触发预警，未检测到实际火情',
            startTime: '2023-08-12 14:30:25',
            endTime: '2023-08-12 14:45:12',
            duration: '14分钟47秒',
            suggestion: '检查烟感设备灵敏度，清洁传感器，确认周围环境无粉尘干扰',
            details: {
                deviceId: 'FIRE-SM-12',
                location: '3#电池仓东北角',
                smokeLevel: '1.2mg/m³',
                operator: '李工',
                resolution: '清洁了烟感设备，重新校准了阈值'
            }
        },
        // 更多历史告警...
    ]
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initAlarmTrendChart();
    
    // 初始化事件监听
    initEventListeners();
    
    // 加载默认数据
    loadAlarmData();
    
    // 更新统计卡片数据
    updateStatisticsCard();
});

// 初始化告警趋势图
function initAlarmTrendChart() {
    const chartDom = document.getElementById('alarmChart');
    const myChart = echarts.init(chartDom);
    
    // 模拟24小时数据
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const faultData = [0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 0];
    const warningData = [1, 0, 0, 0, 1, 2, 1, 0, 1, 2, 1, 2, 1, 0, 1, 2, 3, 1, 1, 0, 2, 1, 0, 0];
    const infoData = [2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 1, 0, 1, 1, 0];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['故障', '告警', '提示'],
            right: 10,
            top: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '40px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: hours,
            axisLabel: {
                interval: 3,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine: {
                lineStyle: {
                    color: '#39B49A'
                }
            }
        },
        series: [
            {
                name: '故障',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: faultData,
                itemStyle: {
                    color: '#e74c3c'
                }
            },
            {
                name: '告警',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: warningData,
                itemStyle: {
                    color: '#f39c12'
                }
            },
            {
                name: '提示',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: infoData,
                itemStyle: {
                    color: '#39B49A'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 窗口大小改变时，重新调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 初始化事件监听
function initEventListeners() {
    // 告警类型切换
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            switchTab(tabType);
        });
    });
    
    // 添加筛选面板显示/隐藏功能
    const showFilterBtn = document.getElementById('showFilterBtn');
    if (showFilterBtn) {
        showFilterBtn.addEventListener('click', function() {
            const filterPanel = document.getElementById('filterPanel');
            if (filterPanel) {
                filterPanel.style.display = filterPanel.style.display === 'none' || filterPanel.style.display === '' ? 'block' : 'none';
            }
        });
    }
    
    // 站点筛选
    document.getElementById('siteSelect').addEventListener('change', function() {
        // 获取多选的值
        const selectedOptions = Array.from(this.selectedOptions).map(option => option.value);
        pageState.siteFilter = selectedOptions.length ? selectedOptions : ['all'];
        
        // 如果选择了"全部站点"，则清除其他选择
        if(pageState.siteFilter.includes('all') && pageState.siteFilter.length > 1) {
            const index = pageState.siteFilter.indexOf('all');
            if(index > -1) {
                pageState.siteFilter = ['all'];
                // 重置选择框状态
                Array.from(this.options).forEach(option => {
                    option.selected = option.value === 'all';
                });
            }
        }
        
        pageState.pagination.currentPage = 1;
        loadAlarmData();
    });
    
    // 设备筛选
    document.getElementById('deviceSelect').addEventListener('change', function() {
        // 获取多选的值
        const selectedOptions = Array.from(this.selectedOptions).map(option => option.value);
        pageState.deviceFilter = selectedOptions.length ? selectedOptions : ['all'];
        
        // 如果选择了"全部设备"，则清除其他选择
        if(pageState.deviceFilter.includes('all') && pageState.deviceFilter.length > 1) {
            const index = pageState.deviceFilter.indexOf('all');
            if(index > -1) {
                pageState.deviceFilter = ['all'];
                // 重置选择框状态
                Array.from(this.options).forEach(option => {
                    option.selected = option.value === 'all';
                });
            }
        }
        
        pageState.pagination.currentPage = 1;
                loadAlarmData();
    });
    
    // 子部件筛选
    const componentOptions = document.querySelectorAll('#componentFilter .tag');
    componentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            const value = checkbox.value;
            
            if(value === 'all') {
                // 如果点击"全部"选项
                const isActive = !this.classList.contains('active');
                
                componentOptions.forEach(opt => {
                    opt.classList.toggle('active', isActive && opt.getAttribute('data-value') === 'all');
                    opt.querySelector('input[type="checkbox"]').checked = isActive && opt.getAttribute('data-value') === 'all';
                });
                
                pageState.componentFilter = isActive ? ['all'] : [];
            } else {
                // 如果点击其他选项
                this.classList.toggle('active');
                checkbox.checked = !checkbox.checked;
                
                // 移除"全部"选项的选中状态
                const allOption = document.querySelector('#componentFilter .tag[data-value="all"]');
                allOption.classList.remove('active');
                allOption.querySelector('input[type="checkbox"]').checked = false;
                
                // 更新筛选状态
                const selectedComponents = Array.from(document.querySelectorAll('#componentFilter .tag.active'))
                    .map(opt => opt.getAttribute('data-value'));
                
                pageState.componentFilter = selectedComponents.length > 0 ? selectedComponents : ['all'];
                
                // 如果没有选中任何选项，则自动选中"全部"
                if(pageState.componentFilter.length === 0) {
                    allOption.classList.add('active');
                    allOption.querySelector('input[type="checkbox"]').checked = true;
                    pageState.componentFilter = ['all'];
                }
            }
            
            pageState.pagination.currentPage = 1;
            loadAlarmData();
        });
    });
    
    // 告警级别筛选
    const levelOptions = document.querySelectorAll('#levelFilter .tag');
    levelOptions.forEach(option => {
        option.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            const value = checkbox.value;
            
            if(value === 'all') {
                // 如果点击"全部"选项
                const isActive = !this.classList.contains('active');
                
                levelOptions.forEach(opt => {
                    opt.classList.toggle('active', isActive && opt.getAttribute('data-value') === 'all');
                    opt.querySelector('input[type="checkbox"]').checked = isActive && opt.getAttribute('data-value') === 'all';
                });
                
                pageState.levelFilter = isActive ? ['all'] : [];
            } else {
                // 如果点击其他选项
                this.classList.toggle('active');
                checkbox.checked = !checkbox.checked;
                
                // 移除"全部"选项的选中状态
                const allOption = document.querySelector('#levelFilter .tag[data-value="all"]');
                allOption.classList.remove('active');
                allOption.querySelector('input[type="checkbox"]').checked = false;
                
                // 更新筛选状态
                const selectedLevels = Array.from(document.querySelectorAll('#levelFilter .tag.active'))
                    .map(opt => opt.getAttribute('data-value'));
                
                pageState.levelFilter = selectedLevels.length > 0 ? selectedLevels : ['all'];
                
                // 如果没有选中任何选项，则自动选中"全部"
                if(pageState.levelFilter.length === 0) {
                    allOption.classList.add('active');
                    allOption.querySelector('input[type="checkbox"]').checked = true;
                    pageState.levelFilter = ['all'];
                }
            }
            
            pageState.pagination.currentPage = 1;
            loadAlarmData();
        });
    });
    
    // 日期筛选
    document.getElementById('dateFilterBtn').addEventListener('click', function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if(startDate && endDate) {
            pageState.dateRange.startDate = startDate;
            pageState.dateRange.endDate = endDate;
            pageState.pagination.currentPage = 1;
        loadAlarmData();
        } else {
            showToast('请选择完整的日期范围');
        }
    });
    
    // 搜索按钮
    document.getElementById('alarmSearchBtn').addEventListener('click', function() {
        const keyword = document.getElementById('alarmSearchInput').value.trim();
        pageState.searchKeyword = keyword;
        pageState.pagination.currentPage = 1;
        loadAlarmData();
    });
    
    // 搜索框回车事件
    document.getElementById('alarmSearchInput').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            const keyword = this.value.trim();
            pageState.searchKeyword = keyword;
            pageState.pagination.currentPage = 1;
            loadAlarmData();
        }
    });
    
    // 分页按钮事件
    document.getElementById('prevPage').addEventListener('click', function() {
        if(pageState.pagination.currentPage > 1) {
            pageState.pagination.currentPage--;
            loadAlarmData();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if(pageState.pagination.currentPage < pageState.pagination.totalItems / pageState.pagination.pageSize) {
            pageState.pagination.currentPage++;
            loadAlarmData();
        }
    });
    
    // 模态框关闭事件
    document.getElementById('closeAlarmDetail').addEventListener('click', closeAlarmDetailModal);
    document.getElementById('closeDetailBtn').addEventListener('click', closeAlarmDetailModal);
    
    // 点击模态框外部关闭
    document.getElementById('alarmDetailModal').addEventListener('click', function(e) {
        if(e.target === this) {
            closeAlarmDetailModal();
        }
    });
    
    // 添加趋势图显示/隐藏控制
    document.getElementById('showChartBtn').addEventListener('click', function() {
        document.getElementById('trendChartContainer').style.display = 'block';
        
        // 趋势图显示后，确保ECharts实例重绘以适应容器尺寸
        const chartDom = document.getElementById('alarmChart');
        if (chartDom) {
            const chart = echarts.getInstanceByDom(chartDom);
            if (chart) {
                chart.resize();
            } else {
                // 如果图表尚未初始化，则初始化它
                initAlarmTrendChart();
            }
        }
    });
    
    document.getElementById('closeChartBtn').addEventListener('click', function() {
        document.getElementById('trendChartContainer').style.display = 'none';
    });
}

// 切换告警类型标签
function switchTab(tabType) {
    // 更新标签样式
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabType);
    });
    
    // 更新当前标签状态
    pageState.currentTab = tabType;
    
    // 更新表格显示
    document.getElementById('realTimeAlarmTable').style.display = tabType === 'realtime' ? 'table' : 'none';
    document.getElementById('historyAlarmTable').style.display = tabType === 'history' ? 'table' : 'none';
    
    // 重置分页和重新加载数据
    pageState.pagination.currentPage = 1;
    loadAlarmData();
}

// 加载告警数据
function loadAlarmData() {
    showLoading(true);
    
    // 模拟网络延迟
    setTimeout(() => {
        try {
            // 根据当前标签决定使用哪个数据集
            const dataSource = pageState.currentTab === 'realtime' ? alarmData.realTimeAlarms : alarmData.historyAlarms;
            
            // 筛选数据
            const filteredData = filterAlarmData(dataSource);
            
            // 分页处理
            const paginatedData = paginateData(filteredData);
            
            // 渲染表格
            renderAlarmTable(paginatedData);
            
            // 更新分页控件
            updatePagination(filteredData.length);
            
            // 判断是否需要显示空数据提示
            document.getElementById('emptyDataTip').style.display = filteredData.length === 0 ? 'flex' : 'none';
        } catch(error) {
            console.error('加载数据出错:', error);
            showToast('加载数据失败，请稍后重试');
        } finally {
            showLoading(false);
        }
    }, 300);
}

// 筛选告警数据
function filterAlarmData(data) {
    return data.filter(alarm => {
        // 站点筛选
        if(pageState.siteFilter.includes('all') || pageState.siteFilter.some(site => alarm.siteName.includes(site))) {
            // 设备筛选
            if(pageState.deviceFilter.includes('all') || pageState.deviceFilter.some(device => alarm.deviceName.includes(device))) {
                // 子部件筛选
                if(pageState.componentFilter.includes('all') || pageState.componentFilter.some(component => alarm.componentName.includes(component))) {
                    // 告警级别筛选
                    if(pageState.levelFilter.includes('all') || pageState.levelFilter.includes(alarm.level)) {
                        // 日期范围筛选
                        if(pageState.dateRange.startDate && pageState.dateRange.endDate) {
                            const alarmTime = pageState.currentTab === 'realtime' ? alarm.time : alarm.startTime;
                            const alarmDate = new Date(alarmTime);
                            const startDate = new Date(pageState.dateRange.startDate);
                            const endDate = new Date(pageState.dateRange.endDate);
                            endDate.setHours(23, 59, 59); // 设置结束日期为当天结束时间
                            
                            if(alarmDate >= startDate && alarmDate <= endDate) {
                                // 关键词搜索
                                return searchKeyword(alarm);
                            }
                            return false;
                        } else {
                            // 关键词搜索
                            return searchKeyword(alarm);
                        }
                    }
                }
            }
        }
        return false;
    });
    
    // 内部函数：关键词搜索
    function searchKeyword(alarm) {
        if(!pageState.searchKeyword) return true;
        
        const keyword = pageState.searchKeyword.toLowerCase();
        return alarm.siteName.toLowerCase().includes(keyword) ||
               alarm.deviceName.toLowerCase().includes(keyword) ||
               alarm.componentName.toLowerCase().includes(keyword) ||
               alarm.description.toLowerCase().includes(keyword);
    }
}

// 分页处理
function paginateData(data) {
    const { currentPage, pageSize } = pageState.pagination;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    
    return data.slice(start, end);
}

// 渲染告警表格
function renderAlarmTable(data) {
    // 确定使用哪个表格体
    const tableBodyId = pageState.currentTab === 'realtime' ? 'realTimeAlarmTableBody' : 'historyAlarmTableBody';
    const tableBody = document.getElementById(tableBodyId);
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 添加数据行
    data.forEach(alarm => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', alarm.id);
        
        // 根据不同的表格类型创建不同的单元格
        if (pageState.currentTab === 'realtime') {
            row.innerHTML = `
                <td>${alarm.siteName}</td>
                <td>${alarm.deviceName}</td>
                <td>${alarm.componentName}</td>
                <td class="status-cell status-${alarm.level}">
                    <span class="status-indicator"></span>
                    ${getLevelText(alarm.level)}
                </td>
                <td class="truncate-text" title="${alarm.description}">${alarm.description}</td>
                <td>${alarm.time}</td>
                <td class="truncate-text" title="${alarm.suggestion}">${alarm.suggestion}</td>
            `;
        } else {
            // 历史告警表格 - 不包含智能诊断建议和查看详情
            row.innerHTML = `
                <td>${alarm.siteName}</td>
                <td>${alarm.deviceName}</td>
                <td>${alarm.componentName}</td>
                <td class="status-cell status-${alarm.level}">
                    <span class="status-indicator"></span>
                    ${getLevelText(alarm.level)}
                </td>
                <td class="truncate-text" title="${alarm.description}">${alarm.description}</td>
                <td>${pageState.currentTab === 'realtime' ? alarm.time : alarm.startTime}</td>
                <td>${pageState.currentTab === 'realtime' ? '' : alarm.endTime}</td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// 获取告警级别文本
function getLevelText(level) {
    switch(level) {
        case 'fault': return '故障';
        case 'warning': return '告警';
        case 'info': return '提示';
        default: return level;
    }
}

// 更新分页控件
function updatePagination(totalItems) {
    const { pageSize, currentPage } = pageState.pagination;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    pageState.pagination.totalItems = totalItems;
    
    // 更新分页按钮状态
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
    
    // 更新页码显示
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';
    
    // 确定显示哪些页码
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if(endPage - startPage < 4 && totalPages > 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加页码
    for(let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number${i === currentPage ? ' active' : ''}`;
        pageNumber.textContent = i;
        
        pageNumber.addEventListener('click', function() {
            pageState.pagination.currentPage = i;
    loadAlarmData();
        });
        
        pageNumbersContainer.appendChild(pageNumber);
    }
}

// 显示告警详情
function showAlarmDetail(alarmId) {
    // 查找对应的告警数据
    const alarm = pageState.currentTab === 'realtime' ? alarmData.realTimeAlarms.find(a => a.id === alarmId) : alarmData.historyAlarms.find(a => a.id === alarmId);
    
    if(!alarm) {
        showToast('未找到告警详情');
        return;
    }
    
    // 设置模态框标题
    document.getElementById('alarmDetailTitle').textContent = `告警详情 - ${alarm.id}`;
    
    // 设置模态框内容
    const detailContent = document.getElementById('alarmDetailContent');
    detailContent.innerHTML = `
        <div class="detail-group">
            <div class="detail-label">告警站点：</div>
            <div class="detail-value">${alarm.siteName}</div>
        </div>
        <div class="detail-group">
            <div class="detail-label">设备名称：</div>
            <div class="detail-value">${alarm.deviceName}</div>
        </div>
        <div class="detail-group">
            <div class="detail-label">子部件：</div>
            <div class="detail-value">${alarm.componentName}</div>
        </div>
        <div class="detail-group">
            <div class="detail-label">告警级别：</div>
            <div class="detail-value">
                <span class="status-cell status-${alarm.level}">
                    <span class="status-indicator"></span>
                    ${getLevelText(alarm.level)}
                </span>
            </div>
        </div>
        <div class="detail-group">
            <div class="detail-label">告警描述：</div>
            <div class="detail-value">${alarm.description}</div>
        </div>
        <div class="detail-group">
            <div class="detail-label">发生时间：</div>
            <div class="detail-value">${alarm.time}</div>
        </div>
        <div class="detail-group">
            <div class="detail-label">处理建议：</div>
            <div class="detail-value">${alarm.suggestion}</div>
        </div>
    `;
    
    // 添加详细信息
    if(alarm.details) {
        for(const [key, value] of Object.entries(alarm.details)) {
            let label;
            switch(key) {
                case 'cellId': label = '电池单元ID'; break;
                case 'voltage': label = '电压值'; break;
                case 'limitVoltage': label = '限制电压'; break;
                case 'operator': label = '处理人员'; break;
                case 'resolution': label = '解决方案'; break;
                case 'deviceId': label = '设备ID'; break;
                case 'location': label = '设备位置'; break;
                case 'smokeLevel': label = '烟雾浓度'; break;
                default: label = key;
            }
            
            detailContent.innerHTML += `
                <div class="detail-group">
                    <div class="detail-label">${label}：</div>
                    <div class="detail-value">${value}</div>
                </div>
            `;
        }
    }
    
    // 显示模态框
    document.getElementById('alarmDetailModal').style.display = 'flex';
}

// 关闭告警详情模态框
function closeAlarmDetailModal() {
    document.getElementById('alarmDetailModal').style.display = 'none';
}

// 显示/隐藏加载指示器
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
}

// 更新统计卡片数据
function updateStatisticsCard() {
    // 计算各种告警数量
    const faultCount = countAlarmsByLevel('fault');
    const warningCount = countAlarmsByLevel('warning');
    const infoCount = countAlarmsByLevel('info');
    const totalCount = faultCount + warningCount + infoCount;
    
    // 更新DOM
    document.getElementById('faultAlarmCount').textContent = faultCount;
    document.getElementById('warningAlarmCount').textContent = warningCount;
    document.getElementById('infoAlarmCount').textContent = infoCount;
    document.getElementById('totalAlarmCount').textContent = totalCount;
    
    // 辅助函数：计算指定级别的告警数量
    function countAlarmsByLevel(level) {
        return pageState.currentTab === 'realtime' ? alarmData.realTimeAlarms.filter(alarm => alarm.level === level).length : alarmData.historyAlarms.filter(alarm => alarm.level === level).length;
    }
}

// 显示提示信息
function showToast(message, type = 'info') {
    const tooltip = document.getElementById('tooltip');
    const tooltipMessage = document.querySelector('.tooltip-message');
    const tooltipTitle = document.querySelector('.tooltip-title');
    
    // 设置标题
    switch(type) {
        case 'success':
            tooltipTitle.textContent = '成功';
            tooltip.className = 'tooltip tooltip-success';
            break;
        case 'error':
            tooltipTitle.textContent = '错误';
            tooltip.className = 'tooltip tooltip-error';
            break;
        case 'warning':
            tooltipTitle.textContent = '警告';
            tooltip.className = 'tooltip tooltip-warning';
            break;
        default:
            tooltipTitle.textContent = '提示';
            tooltip.className = 'tooltip';
    }
    
    // 设置消息
    tooltipMessage.textContent = message;
    
    // 显示提示框
    tooltip.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
} 