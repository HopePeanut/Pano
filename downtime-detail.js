// downtime-detail.js - 非计划停机率详情页脚本

// 全局变量
const charts = {
    trendChart: null // 停机趋势图表实例
};

// 当前筛选状态
const currentFilter = {
    timeRange: '30d', // 默认时间范围
    startDate: null,
    endDate: null,
    selectedSites: [], // 已选站点
    selectedDevices: [], // 已选设备
    viewBy: 'site', // 趋势图查看维度: 'site' 或 'device'
    chartType: 'line', // 趋势图类型: 'line' 或 'bar'
    sortField: 'duration', // 表格排序列
    sortOrder: 'desc', // 表格排序顺序
    currentPage: 1,
    pageSize: 10, // 表格每页条数
    searchTerm: '' // 表格搜索关键字
};

// 模拟站点和设备数据 (实际应用中应从后端获取)
const mockSiteDeviceData = {
    '清远储能电站': ['储能系统 #1', '储能系统 #2', '充电桩 #1'],
    '广州储能电站': ['储能系统 #1', '储能系统 #2', '充电桩 #1'],
    '深圳龙岗储能电站': ['储能系统 #1', '储能系统 #2', '储能系统 #3'],
    '佛山南海电站': ['储能系统 #1', '充电桩 #1', '充电桩 #2']
    // ... 其他站点
};

// DOMContentLoaded - 确保DOM加载完毕
document.addEventListener('DOMContentLoaded', () => {
    console.log("非计划停机率详情页 DOM 加载完成");

    try {
        // 初始化导航栏
        if (typeof initializeNavbar === 'function') {
            initializeNavbar('数据中心');
        } else {
            console.error('initializeNavbar function not found. Ensure navbar-template.js is loaded correctly.');
        }

        // 初始化页面各个模块
        initFilterSection();
        initOverviewMetrics(); // 初始化概览区 (可能只是绑定事件或设置默认值)
        initTrendChart();      // 初始化趋势图表
        initDetailsTable();    // 初始化详情表格
        initCustomDateModal(); // 初始化自定义日期模态框

        // 初始加载数据
        loadDowntimeData();

        // 窗口大小改变时调整图表
        window.addEventListener('resize', handleResize);

        // 处理筛选栏的吸顶效果 (如果需要)
        // window.addEventListener('scroll', handleStickyFilter);

    } catch (error) {
        console.error("初始化非计划停机率详情页出错:", error);
    }
});

// 处理窗口大小改变，调整图表尺寸
function handleResize() {
    console.log("Window resized");
    if (charts.trendChart) {
        try {
            charts.trendChart.resize();
        } catch (e) {
            console.error("Error resizing trend chart:", e);
        }
    }
}

// 初始化筛选区域
function initFilterSection() {
    console.log("初始化筛选区域");
    const timeRangeBtns = document.querySelectorAll('.time-range-toggle .btn-time-range');
    const customDateBtn = document.querySelector('.btn-custom-date');
    const siteSearch = document.getElementById('site-search');
    const deviceSearch = document.getElementById('device-search');
    const siteDropdown = document.getElementById('site-dropdown');
    const deviceDropdown = document.getElementById('device-dropdown');
    const selectedSitesContainer = document.getElementById('selected-sites');
    const selectedDevicesContainer = document.getElementById('selected-devices');
    const clearSiteBtn = document.getElementById('clear-site-select');
    const clearDeviceBtn = document.getElementById('clear-device-select');
    const queryButton = document.getElementById('query-button');

    // 1. 时间范围按钮事件
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            customDateBtn.classList.remove('active'); // 取消自定义按钮高亮
            currentFilter.timeRange = btn.dataset.range;
            currentFilter.startDate = null; // 清空自定义日期
            currentFilter.endDate = null;
            console.log(`时间范围更改为: ${currentFilter.timeRange}`);
            // 通常点击时间按钮后不立即查询，等待点击查询按钮
            // loadDowntimeData();
        });
    });

    // 2. 自定义日期按钮事件
    customDateBtn.addEventListener('click', () => {
        showCustomDateModal(); // 显示自定义日期模态框 (稍后实现)
    });

    // 3. 站点搜索选择初始化和事件
    // 填充站点选项
    if (siteSearch && siteDropdown) {
        const siteOptions = Object.keys(mockSiteDeviceData);
        
        // 初始化站点下拉列表
        renderSiteOptions(siteOptions);
        
        // 站点搜索框点击和输入事件
        siteSearch.addEventListener('focus', () => {
            siteDropdown.classList.add('active');
        });
        
        siteSearch.addEventListener('input', () => {
            const searchTerm = siteSearch.value.toLowerCase().trim();
            const filteredSites = siteOptions.filter(site => 
                site.toLowerCase().includes(searchTerm)
            );
            renderSiteOptions(filteredSites, searchTerm);
        });
        
        // 点击外部区域关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.site-select-group')) {
                siteDropdown.classList.remove('active');
            }
        });
        
        // 站点选项点击事件
        siteDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.select-option');
            if (option) {
                const siteName = option.dataset.value;
                if (!currentFilter.selectedSites.includes(siteName)) {
                    currentFilter.selectedSites.push(siteName);
                    updateSelectedSiteTags();
                    // 当选择站点后，自动更新设备下拉选项
                    updateDeviceOptions();
                    // 清空搜索框
                    siteSearch.value = '';
                    // 刷新选项列表
                    renderSiteOptions(siteOptions);
                }
            }
        });
        
        // 清空站点选择按钮
        if (clearSiteBtn) {
            clearSiteBtn.addEventListener('click', () => {
                currentFilter.selectedSites = [];
                updateSelectedSiteTags();
                updateDeviceOptions(); // 更新设备列表为空
            });
        }
        
        // 已选站点标签容器点击事件 (移除标签)
        if (selectedSitesContainer) {
            selectedSitesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-tag')) {
                    const tag = e.target.closest('.selected-tag');
                    if (tag) {
                        const siteName = tag.dataset.value;
                        currentFilter.selectedSites = currentFilter.selectedSites.filter(s => s !== siteName);
                        updateSelectedSiteTags();
                        updateDeviceOptions(); // 更新设备选项
                    }
                }
            });
        }
    }

    // 4. 设备搜索选择初始化和事件
    if (deviceSearch && deviceDropdown) {
        // 设备搜索框点击和输入事件
        deviceSearch.addEventListener('focus', () => {
            deviceDropdown.classList.add('active');
        });
        
        deviceSearch.addEventListener('input', () => {
            const searchTerm = deviceSearch.value.toLowerCase().trim();
            const availableDevices = getAvailableDevices();
            const filteredDevices = availableDevices.filter(device => 
                device.toLowerCase().includes(searchTerm)
            );
            renderDeviceOptions(filteredDevices, searchTerm);
        });
        
        // 点击外部区域关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.device-select-group')) {
                deviceDropdown.classList.remove('active');
            }
        });
        
        // 设备选项点击事件
        deviceDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.select-option');
            if (option) {
                const deviceName = option.dataset.value;
                if (!currentFilter.selectedDevices.includes(deviceName)) {
                    currentFilter.selectedDevices.push(deviceName);
                    updateSelectedDeviceTags();
                    // 清空搜索框
                    deviceSearch.value = '';
                    // 刷新选项列表
                    renderDeviceOptions(getAvailableDevices());
                }
            }
        });
        
        // 清空设备选择按钮
        if (clearDeviceBtn) {
            clearDeviceBtn.addEventListener('click', () => {
                currentFilter.selectedDevices = [];
                updateSelectedDeviceTags();
            });
        }
        
        // 已选设备标签容器点击事件 (移除标签)
        if (selectedDevicesContainer) {
            selectedDevicesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-tag')) {
                    const tag = e.target.closest('.selected-tag');
                    if (tag) {
                        const deviceName = tag.dataset.value;
                        currentFilter.selectedDevices = currentFilter.selectedDevices.filter(d => d !== deviceName);
                        updateSelectedDeviceTags();
                    }
                }
            });
        }
    }

    // 5. 查询按钮事件
    if (queryButton) {
        queryButton.addEventListener('click', () => {
            console.log("点击查询按钮");
            // 已经在上面的事件中更新了 currentFilter.selectedSites 和 currentFilter.selectedDevices
            loadDowntimeData();
        });
    }
}

// 新增：渲染站点选项列表
function renderSiteOptions(sites, searchTerm = '') {
    const dropdown = document.getElementById('site-dropdown');
    if (!dropdown) return;
    
    if (sites.length === 0) {
        dropdown.innerHTML = '<div class="no-results">没有匹配的站点</div>';
    } else {
        let html = '';
        sites.forEach(site => {
            const isSelected = currentFilter.selectedSites.includes(site);
            const displayText = searchTerm ? highlightMatch(site, searchTerm) : site;
            html += `
                <div class="select-option ${isSelected ? 'selected' : ''}" data-value="${site}">
                    ${displayText}
                </div>
            `;
        });
        dropdown.innerHTML = html;
    }
}

// 新增：更新已选站点标签
function updateSelectedSiteTags() {
    const container = document.getElementById('selected-sites');
    if (!container) return;
    
    let html = '';
    currentFilter.selectedSites.forEach(site => {
        html += `
            <div class="selected-tag" data-value="${site}">
                ${site}
                <span class="remove-tag">✕</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 新增：获取可用设备列表
function getAvailableDevices() {
    const selectedSites = currentFilter.selectedSites;
    const availableDevices = new Set();

    if (selectedSites.length > 0) {
        selectedSites.forEach(siteName => {
            if (mockSiteDeviceData[siteName]) {
                mockSiteDeviceData[siteName].forEach(device => availableDevices.add(device));
            }
        });
        return Array.from(availableDevices);
    } else {
        // 如果没有选择站点，返回所有设备
        const allDevices = new Set();
        Object.values(mockSiteDeviceData).forEach(devices => {
            devices.forEach(device => allDevices.add(device));
        });
        return Array.from(allDevices);
    }
}

// 新增：渲染设备选项列表
function renderDeviceOptions(devices, searchTerm = '') {
    const dropdown = document.getElementById('device-dropdown');
    if (!dropdown) return;
    
    if (devices.length === 0) {
        dropdown.innerHTML = '<div class="no-results">没有匹配的设备</div>';
    } else {
        let html = '';
        devices.forEach(device => {
            const isSelected = currentFilter.selectedDevices.includes(device);
            const displayText = searchTerm ? highlightMatch(device, searchTerm) : device;
            html += `
                <div class="select-option ${isSelected ? 'selected' : ''}" data-value="${device}">
                    ${displayText}
                </div>
            `;
        });
        dropdown.innerHTML = html;
    }
}

// 新增：更新已选设备标签
function updateSelectedDeviceTags() {
    const container = document.getElementById('selected-devices');
    if (!container) return;
    
    let html = '';
    currentFilter.selectedDevices.forEach(device => {
        html += `
            <div class="selected-tag" data-value="${device}">
                ${device}
                <span class="remove-tag">✕</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 新增：高亮搜索匹配文本
function highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span style="background-color: #ffeb3b; color: #222;">$1</span>');
}

// 更新设备选择框选项 (根据所选站点)
function updateDeviceOptions() {
    // 根据当前选择的站点，更新设备下拉选项
    renderDeviceOptions(getAvailableDevices());
    // 保留那些在可用设备列表中的已选设备
    const availableDevices = getAvailableDevices();
    currentFilter.selectedDevices = currentFilter.selectedDevices.filter(device => 
        availableDevices.includes(device)
    );
    // 更新已选设备标签
    updateSelectedDeviceTags();
}

// 初始化概览指标区域
function initOverviewMetrics() {
    console.log("初始化概览指标区域");
    // 目前此区域主要是数据显示，可能不需要太多初始化交互
    // 可以添加点击卡片跳转等逻辑
}

// 初始化趋势图表区域
function initTrendChart() {
    console.log("初始化趋势图表区域");
    const chartContainer = document.getElementById('downtime-trend-chart');
    if (chartContainer && typeof echarts !== 'undefined') {
        charts.trendChart = echarts.init(chartContainer);
        console.log("趋势图表 ECharts 实例已创建");

        // !!! 移除视图切换按钮的事件监听 !!!
        /*
        const viewToggleBtns = document.querySelectorAll('.view-toggle .btn-view');
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // currentFilter.viewBy = btn.dataset.view; // viewBy 字段可能不再需要
                console.log(`趋势图视图切换`); // 更新日志信息
                loadDowntimeData(); // 重新加载数据以更新图表
            });
        });
        */

        // 绑定图表类型切换按钮 (折线/柱状)
        const chartTypeBtns = document.querySelectorAll('.chart-type-toggle .btn-chart-type');
        chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter.chartType = btn.dataset.type;
                console.log(`趋势图表类型切换为: ${currentFilter.chartType}`);
                // 仅更新图表类型，不需要重新加载数据
                 if (charts.trendChart) {
                    const option = charts.trendChart.getOption();
                    if (option && option.series) {
                        // 更新两条系列的类型
                        option.series.forEach(s => s.type = currentFilter.chartType);
                        charts.trendChart.setOption(option, true);
                    }
                 }
            });
        });

    } else if (typeof echarts === 'undefined') {
        console.error("ECharts library not loaded.");
    } else {
        console.error("Trend chart container not found.");
    }
}

// 初始化详情表格区域
function initDetailsTable() {
    console.log("初始化详情表格区域");
    const table = document.querySelector('#downtime-details-table table');
    const searchInput = document.getElementById('table-search');
    const exportBtn = document.getElementById('table-export-btn');
    const paginationControls = document.getElementById('table-pagination');

    // 1. 表格排序事件
    if (table) {
        const sortableHeaders = table.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                if (currentFilter.sortField === field) {
                    currentFilter.sortOrder = currentFilter.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    currentFilter.sortField = field;
                    currentFilter.sortOrder = 'desc';
                }
                // 更新表头排序图标 (需要辅助函数)
                // updateSortIcons(sortableHeaders, field, currentFilter.sortOrder);
                currentFilter.currentPage = 1; // 排序后回到第一页
                loadDowntimeData(); // 重新加载并渲染表格
            });
        });
    }

    // 2. 搜索框事件 (通常在输入时触发或按回车/按钮触发)
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentFilter.searchTerm = searchInput.value.trim();
                currentFilter.currentPage = 1; // 搜索后回到第一页
                loadDowntimeData();
            }
        });
        // 可选：添加搜索按钮或实时搜索逻辑
    }

    // 3. 导出按钮事件
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            console.log("触发导出Excel");
            exportTableData(); // 导出功能 (稍后实现)
        });
    }

    // 4. 分页按钮事件
    if (paginationControls) {
        paginationControls.addEventListener('click', (e) => {
            if (e.target.closest('.btn-page')) {
                const btn = e.target.closest('.btn-page');
                const pageAction = btn.dataset.page;
                const totalPages = parseInt(paginationControls.querySelector('.total-pages').textContent || '1');

                if (pageAction === 'prev' && currentFilter.currentPage > 1) {
                    currentFilter.currentPage--;
                    loadDowntimeData();
                } else if (pageAction === 'next' && currentFilter.currentPage < totalPages) {
                    currentFilter.currentPage++;
                    loadDowntimeData();
                }
            }
        });
    }
}

// 初始化自定义日期模态框 (与 health-score-detail.js 类似)
function initCustomDateModal() {
    console.log("初始化自定义日期模态框");
    const modal = document.getElementById('custom-date-modal');
    if (!modal) return console.error("自定义日期模态框未找到");

    const closeBtn = document.getElementById('close-custom-date');
    const cancelBtn = document.getElementById('cancel-custom-date');
    const confirmBtn = document.getElementById('confirm-custom-date');
    const startDateInput = document.getElementById('custom-start-date');
    const endDateInput = document.getElementById('custom-end-date');

    if (!closeBtn || !cancelBtn || !confirmBtn || !startDateInput || !endDateInput) {
        return console.error("自定义日期模态框内部元素不完整");
    }

    const showModal = () => modal.classList.add('active');
    const hideModal = () => modal.classList.remove('active');

    // 绑定事件
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    document.querySelector('.btn-custom-date').addEventListener('click', showModal);

    confirmBtn.addEventListener('click', () => {
        if (!startDateInput.value || !endDateInput.value) {
            alert('请选择开始和结束日期');
            return;
        }
        if (new Date(startDateInput.value) > new Date(endDateInput.value)) {
            alert('结束日期不能早于开始日期');
            return;
        }

        // 更新筛选条件
        currentFilter.timeRange = 'custom';
        currentFilter.startDate = startDateInput.value;
        currentFilter.endDate = endDateInput.value;

        // 更新按钮状态
        document.querySelectorAll('.time-range-toggle .btn-time-range').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.btn-custom-date').classList.add('active');

        hideModal();
        // loadDowntimeData(); // 等待点击查询按钮
         console.log(`自定义时间范围选择: ${currentFilter.startDate} to ${currentFilter.endDate}`);
    });
}

// --- 主数据加载和更新函数 (框架) ---
function loadDowntimeData() {
    console.log("开始加载非计划停机数据，筛选条件:", JSON.parse(JSON.stringify(currentFilter)));
    showLoading(true);

    // 模拟异步请求
    setTimeout(() => {
        try {
            // 1. 生成或获取模拟/真实数据
            // !!! 简化模拟数据生成逻辑以排查错误 !!!
            const rawData = generateSimplifiedMockData(currentFilter);
            // const rawData = generateMockDowntimeData(currentFilter); // 暂时注释掉复杂的生成逻辑

            // 2. 根据筛选、排序、分页、搜索处理数据
            // !!! 简化数据处理逻辑以排查错误 !!!
            const processedData = processSimplifiedData(rawData, currentFilter);
            // const processedData = processDowntimeData(rawData, currentFilter); // 暂时注释掉复杂的处理逻辑

            // 检查 processedData 是否有效
            if (!processedData || !processedData.chartData || !processedData.tablePageData) {
                throw new Error("处理后的数据结构无效");
            }

            // 3. 更新概览指标
            updateOverviewMetrics(rawData); // 概览通常基于原始筛选数据

            // 4. 更新趋势图表
            updateTrendChart(processedData.chartData); // 图表数据可能需要特殊聚合

            // 5. 更新详情表格
            updateDetailsTable(processedData.tablePageData, processedData.totalPages);

            showLoading(false);
        } catch (error) {
            // !!! 添加更详细的错误日志 !!!
            console.error("加载或处理停机数据时捕获到错误:", error);
            console.error("错误详情 (可能包含堆栈跟踪):", error.stack);
            showLoading(false);
            // 显示更友好的错误提示
            alert(`数据加载或处理过程中遇到问题。详情请查看浏览器控制台日志 (按F12)。错误信息: ${error.message}`);
            // alert("数据加载失败，请稍后重试或检查筛选条件。"); // 原提示
        }
    }, 500); // 模拟延迟
}

// --- 新增：简化的数据生成和处理函数 ---

// 生成最基础的模拟数据
function generateSimplifiedMockData(filter) {
    console.log("生成简化的模拟停机数据...");
    const sites = ['模拟站点A', '模拟站点B'];
    const devices = ['设备1', '设备2', '设备3'];
    const data = [];
    for (let i = 0; i < 25; i++) { // 生成固定数量的记录
        const site = sites[Math.floor(Math.random() * sites.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const duration = Math.floor(Math.random() * 300) + 10; // 10-310分钟
        const startTime = moment().subtract(Math.random() * 30, 'days').add(Math.random() * 12, 'hours');
        const endTime = moment(startTime).add(duration, 'minutes');
        data.push({
            site: site,
            device: device,
            startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
            endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
            duration: duration, // 分钟
            reason: Math.random() > 0.7 ? '模拟原因' : null
        });
    }
    console.log(`生成了 ${data.length} 条简化的模拟记录`);
    return data;
}

// 最基础的数据处理，包含分页和图表数据（时长+率）
function processSimplifiedData(rawData, filter) {
    console.log("处理简化的停机数据 (时长+率)...");
    // 1. 分页 (保持不变)
    const totalItems = rawData.length;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / filter.pageSize) : 1;
    filter.currentPage = Math.max(1, Math.min(filter.currentPage, totalPages));
    const startIndex = (filter.currentPage - 1) * filter.pageSize;
    const tablePageData = rawData.slice(startIndex, startIndex + filter.pageSize);

    // 2. 准备图表数据 (同时包含停机时长和停机率)
    const chartAggregationDuration = {}; // 按日期聚合停机时长
    const dates = [];
    let start, end;

    // 确定日期范围
    if (filter.timeRange === 'custom' && filter.startDate && filter.endDate) {
        start = moment(filter.startDate).startOf('day');
        end = moment(filter.endDate).endOf('day');
    } else {
        const rangeMap = { '7d': 7, '30d': 30, 'thisMonth': 'month' };
        const durationDays = rangeMap[filter.timeRange] || 30;
        if (filter.timeRange === 'thisMonth') {
            start = moment().startOf('month');
            end = moment().endOf('day');
        } else {
            end = moment().endOf('day');
            start = moment().subtract(durationDays - 1, 'days').startOf('day');
        }
    }

    // 初始化日期轴和聚合对象
    let currentDate = moment(start);
    while(currentDate <= end) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        dates.push(dateStr);
        chartAggregationDuration[dateStr] = 0;
        currentDate.add(1, 'day');
    }

    // 聚合数据 - 累加每日总时长
    rawData.forEach(item => {
        const dateStr = moment(item.startTime).format('YYYY-MM-DD');
        if (chartAggregationDuration.hasOwnProperty(dateStr)) {
            chartAggregationDuration[dateStr] += item.duration;
        }
    });

    // 计算每日停机率 (模拟)
    const dailyRateData = dates.map(date => {
        const totalDuration = chartAggregationDuration[date];
        // 假设每天理论运行 24 * 60 = 1440 分钟
        // 注意: 更精确的计算应基于所选站点/设备的数量和实际运行日历
        const theoreticalMinutes = 1440;
        const rate = theoreticalMinutes > 0 ? ((totalDuration / theoreticalMinutes) * 100).toFixed(2) : 0;
        return parseFloat(rate); // 转换为数字
    });

    const chartData = {
        xAxisData: dates,
        seriesData: [
            {
                name: '停机时长 (分钟)',
                type: filter.chartType || 'line',
                yAxisIndex: 0, // 使用第一个 Y 轴 (左侧)
                data: dates.map(date => chartAggregationDuration[date])
            },
            {
                name: '停机率 (%)',
                type: filter.chartType || 'line',
                yAxisIndex: 1, // 使用第二个 Y 轴 (右侧)
                data: dailyRateData
            }
        ]
    };

    return {
        tablePageData,
        totalPages,
        chartData
    };
}

// --- 数据处理/生成/更新函数 (后续逐步实现) ---

// 生成模拟数据 (需要更精确的时间过滤)
function generateMockDowntimeData(filter) {
    console.log("生成模拟停机数据...");
    const data = [];
    const sitesToUse = filter.selectedSites.length > 0 ? filter.selectedSites : Object.keys(mockSiteDeviceData);

    // 确定时间范围
    let filterStart, filterEnd;
    if (filter.timeRange === 'custom' && filter.startDate && filter.endDate) {
        filterStart = moment(filter.startDate).startOf('day');
        filterEnd = moment(filter.endDate).endOf('day');
    } else {
        // 根据预设范围计算
        const rangeMap = {
            '7d': 7,
            '30d': 30,
            'thisMonth': 'month' // moment().startOf('month')
        };
        const duration = rangeMap[filter.timeRange] || 30; // 默认30天

        if (filter.timeRange === 'thisMonth') {
            filterStart = moment().startOf('month');
            filterEnd = moment().endOf('day'); // 到今天结束
        } else {
            filterEnd = moment().endOf('day');
            filterStart = moment().subtract(duration - 1, 'days').startOf('day'); // -1 因为包含今天
        }
    }
    console.log(`数据生成时间范围: ${filterStart.format('YYYY-MM-DD')} to ${filterEnd.format('YYYY-MM-DD')}`);


    sitesToUse.forEach(site => {
        const availableDevices = mockSiteDeviceData[site] || [];
        const devicesToUse = filter.selectedDevices.length > 0
            ? availableDevices.filter(dev => filter.selectedDevices.includes(dev))
            : availableDevices;

        devicesToUse.forEach(device => {
            // 为每个设备生成一些模拟停机记录
            const numRecords = Math.floor(Math.random() * 8) + 2; // 增加记录数量
            // 调整起始时间，确保能覆盖筛选范围
            let possibleStartTime = moment(filterStart).subtract(Math.random() * 15, 'days'); // 从筛选范围之前一点开始

            for (let i = 0; i < numRecords; i++) {
                 // 停机时长更合理分布
                 let durationMinutes;
                 const randType = Math.random();
                 if (randType < 0.6) { // 60% 短时停机
                     durationMinutes = Math.floor(Math.random() * 60) + 5; // 5-64分钟
                 } else if (randType < 0.9) { // 30% 中等停机
                     durationMinutes = Math.floor(Math.random() * 180) + 60; // 1-4小时
                 } else { // 10% 长时停机
                     durationMinutes = Math.floor(Math.random() * 480) + 240; // 4-12小时
                 }

                // 停机间隔更随机
                const intervalHours = Math.random() * 72 + 1; // 1小时到3天
                const startTime = moment(possibleStartTime).add(intervalHours, 'hours');
                const endTime = moment(startTime).add(durationMinutes, 'minutes');

                // 检查停机时段是否与筛选范围有交集
                const downtimeInterval = moment.range(startTime, endTime);
                const filterInterval = moment.range(filterStart, filterEnd);

                if (downtimeInterval.overlaps(filterInterval)) {
                     // 只添加在筛选范围内的数据
                    data.push({
                        site: site,
                        device: device,
                        startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
                        endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
                        duration: durationMinutes,
                        reason: (Math.random() > 0.6) ? ['PCS通信中断', 'BMS故障', '电网波动', '维护保养'][Math.floor(Math.random()*4)] : null
                    });
                }
                possibleStartTime = endTime; // 下次停机基于本次结束时间
                // 如果生成的结束时间已经远超筛选范围，可以提前停止生成
                if (possibleStartTime.isAfter(moment(filterEnd).add(5, 'days'))) {
                    break;
                }
            }
        });
    });
    console.log(`生成了 ${data.length} 条模拟停机记录`);
    return data;
}

// 处理数据 (过滤、排序、分页、聚合等)
function processDowntimeData(rawData, filter) {
    console.log("处理停机数据...");
    let filteredData = [...rawData]; // 创建副本以进行处理

    // 1. 搜索过滤 (表格数据) - 应在排序和分页前
    if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filteredData = filteredData.filter(item =>
            item.site.toLowerCase().includes(term) ||
            item.device.toLowerCase().includes(term) ||
            (item.reason && item.reason.toLowerCase().includes(term))
        );
    }

    // 2. 排序 (表格数据)
    filteredData.sort((a, b) => {
        let comparison = 0;
        if (filter.sortField === 'duration') {
            comparison = a.duration - b.duration;
        } else if (filter.sortField === 'startTime') {
             comparison = new Date(a.startTime) - new Date(b.startTime);
        }
        // 可以添加按站点、设备排序
        else if (filter.sortField === 'site') {
             comparison = a.site.localeCompare(b.site);
             if (comparison === 0) { // 站点相同，再按设备排
                 comparison = a.device.localeCompare(b.device);
             }
             if (comparison === 0) { // 设备也相同，再按时间排
                 comparison = new Date(a.startTime) - new Date(b.startTime);
             }
        }
         else if (filter.sortField === 'device') {
             comparison = a.device.localeCompare(b.device);
              if (comparison === 0) { // 设备相同，再按时间排
                 comparison = new Date(a.startTime) - new Date(b.startTime);
             }
        }

        return filter.sortOrder === 'desc' ? (comparison * -1) : comparison;
    });

    // 3. 分页 (表格数据)
    const totalItems = filteredData.length;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / filter.pageSize) : 1;
    // 确保当前页不超过总页数
     currentFilter.currentPage = Math.max(1, Math.min(currentFilter.currentPage, totalPages));
    const startIndex = (currentFilter.currentPage - 1) * filter.pageSize;
    const tablePageData = filteredData.slice(startIndex, startIndex + filter.pageSize);

    // 4. 聚合数据 (用于图表，基于原始筛选数据 rawData)
    // 注意：聚合时也应考虑时间范围
    let chartData = aggregateDataForChart(rawData, filter);

    return {
        tablePageData,
        totalPages,
        chartData
    };
}

// 聚合数据以适应图表格式 (需要根据 viewBy 区分)
function aggregateDataForChart(rawData, filter) {
    console.log(`为图表聚合数据... 按 ${filter.viewBy}`);
    const aggregation = {}; // key: site/device, value: { date: duration }

    // 确定时间范围和刻度 (天)
    let start, end;
     if (filter.timeRange === 'custom' && filter.startDate && filter.endDate) {
        start = moment(filter.startDate).startOf('day');
        end = moment(filter.endDate).endOf('day');
    } else {
        const rangeMap = { '7d': 7, '30d': 30, 'thisMonth': 'month' };
        const duration = rangeMap[filter.timeRange] || 30;
        if (filter.timeRange === 'thisMonth') {
             start = moment().startOf('month');
             end = moment().endOf('day');
        } else {
            end = moment().endOf('day');
            start = moment().subtract(duration - 1, 'days').startOf('day');
        }
    }

    const datesInRange = [];
    let current = moment(start);
    while(current.isSameOrBefore(end, 'day')) {
        datesInRange.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
    }

    // 按选择的维度进行聚合
    rawData.forEach(item => {
        // 确定聚合的 key (站点或设备)
        const key = filter.viewBy === 'site' ? item.site : item.device;
        // 如果是按设备查看，但没有选择任何特定设备，则跳过（避免聚合所有设备）
        // 或者根据需求决定是否聚合所有设备
        if (filter.viewBy === 'device' && filter.selectedDevices.length === 0 && !Object.keys(mockSiteDeviceData).includes(item.device)){
           // 如果按设备查看且未选设备，可能需要不同的处理逻辑
           // 这里暂时简单处理：如果设备不在站点列表里（比如没选站点时），就不聚合
           // return;
        }

        if (!aggregation[key]) {
            aggregation[key] = {};
            datesInRange.forEach(date => aggregation[key][date] = 0); // 初始化每天时长为0
        }

        const startTime = moment(item.startTime);
        const endTime = moment(item.endTime);
        const durationMinutes = item.duration;
        const filterInterval = moment.range(start, end); // 筛选时间范围

        // 将单次停机时长按天分配到筛选范围内
        let currentDay = moment(startTime).startOf('day');
        let remainingDuration = durationMinutes;
        let loopGuard = 0; // 防止无限循环

        while (currentDay.isSameOrBefore(endTime, 'day') && remainingDuration > 0 && loopGuard < 100) {
            const dayStr = currentDay.format('YYYY-MM-DD');
            // 只聚合在筛选日期范围内并且存在于 datesInRange 中的天
            if (aggregation[key][dayStr] !== undefined) {
                const dayStartMoment = moment(currentDay); // 当天的开始
                const dayEndMoment = moment(currentDay).endOf('day'); // 当天的结束

                const effectiveStartTime = moment.max(startTime, dayStartMoment);
                const effectiveEndTime = moment.min(endTime, dayEndMoment);

                // 计算当天实际的停机时长
                let durationThisDay = moment.duration(effectiveEndTime.diff(effectiveStartTime)).asMinutes();
                durationThisDay = Math.max(0, durationThisDay); // 确保不为负

                // 分配时长，不能超过剩余总时长
                const allocatedDuration = Math.min(remainingDuration, durationThisDay);
                if (allocatedDuration > 0) {
                     aggregation[key][dayStr] += allocatedDuration;
                     remainingDuration -= allocatedDuration;
                }
            }
            currentDay.add(1, 'day');
            loopGuard++;
        }
         if(loopGuard >= 100) console.warn("Loop guard triggered during duration allocation");
    });

    // 转换成 ECharts series 格式
    const seriesData = Object.keys(aggregation).map(key => {
        const dailyValues = datesInRange.map(date => parseFloat(aggregation[key][date].toFixed(1)));
        return {
            name: key,
            type: filter.chartType, // 应用当前选择的图表类型
            data: dailyValues,
            smooth: true, // 折线图平滑
            areaStyle: filter.chartType === 'line' ? { opacity: 0.3 } : null, // 仅折线图显示区域样式
            stack: filter.chartType === 'bar' ? 'total' : null, // 柱状图可堆叠
            emphasis: { focus: 'series' }, // 高亮系列
            barMaxWidth: 40 // 柱状图最大宽度
        };
    });

    return {
        xAxisData: datesInRange.map(d => moment(d).format('MM-DD')), // 格式化X轴标签
        seriesData
    };
}


// 更新概览指标卡片 (需要考虑理论运行时长)
function updateOverviewMetrics(rawData) {
    console.log("更新概览指标...");

     // 确定时间范围用于计算理论时长
    let filterStart, filterEnd;
    if (currentFilter.timeRange === 'custom' && currentFilter.startDate && currentFilter.endDate) {
        filterStart = moment(currentFilter.startDate).startOf('day');
        filterEnd = moment(currentFilter.endDate).endOf('day');
    } else {
        const rangeMap = { '7d': 7, '30d': 30, 'thisMonth': 'month' };
        const duration = rangeMap[currentFilter.timeRange] || 30;
        if (currentFilter.timeRange === 'thisMonth') {
            filterStart = moment().startOf('month');
            filterEnd = moment().endOf('day');
        } else {
            // 注意：这里修复了之前 start, end 未正确赋值的笔误
            filterEnd = moment().endOf('day');
            filterStart = moment().subtract(duration - 1, 'days').startOf('day');
        }
    }

    // 计算理论运行时长 (分钟)
    // 考虑选中的站点和设备，如果没选，则基于 rawData 中的 unique site-device 计算
    let uniqueSiteDevices = new Set();
    if (currentFilter.selectedSites.length > 0 || currentFilter.selectedDevices.length > 0) {
        const sitesToConsider = currentFilter.selectedSites.length > 0 ? currentFilter.selectedSites : Object.keys(mockSiteDeviceData);
        sitesToConsider.forEach(site => {
            const devicesInSite = mockSiteDeviceData[site] || [];
            const devicesToConsider = currentFilter.selectedDevices.length > 0
                                     ? devicesInSite.filter(d => currentFilter.selectedDevices.includes(d))
                                     : devicesInSite;
            devicesToConsider.forEach(device => uniqueSiteDevices.add(`${site}-${device}`));
        });
    } else {
        // 如果站点和设备都未选，基于 rawData 推断涉及的设备
        rawData.forEach(d => uniqueSiteDevices.add(`${d.site}-${d.device}`));
    }

    const numberOfUnits = uniqueSiteDevices.size || 1; // 防止除以0
    const daysInRange = moment.duration(filterEnd.diff(filterStart)).asDays() + 1; // +1 包含首尾两天
    const theoreticalMinutes = daysInRange * 24 * 60 * numberOfUnits;
    console.log(`计算理论时长: ${daysInRange} 天, ${numberOfUnits} 个单元, 总计 ${theoreticalMinutes} 分钟`);

    const totalDurationMinutes = rawData.reduce((sum, item) => sum + item.duration, 0);
    const totalDurationHours = (totalDurationMinutes / 60).toFixed(1);
    const downtimeCount = rawData.length;
    const avgDurationMinutes = downtimeCount > 0 ? (totalDurationMinutes / downtimeCount) : 0;
    const maxDurationMinutes = downtimeCount > 0 ? Math.max(...rawData.map(item => item.duration)) : 0;

    const downtimeRate = theoreticalMinutes > 0 ? (totalDurationMinutes / theoreticalMinutes * 100).toFixed(2) : 0;

    // 更新DOM
    const overviewSection = document.getElementById('overview-metrics-section');
    if(overviewSection) {
        overviewSection.querySelector('#total-downtime-hours .metric-value').textContent = totalDurationHours;
        overviewSection.querySelector('#downtime-rate .metric-value').textContent = `${downtimeRate} %`;
        overviewSection.querySelector('#downtime-count .metric-value').textContent = downtimeCount;
        overviewSection.querySelector('#avg-downtime-duration .metric-value').textContent = formatDuration(avgDurationMinutes);
        overviewSection.querySelector('#max-downtime-duration .metric-value').textContent = formatDuration(maxDurationMinutes);
    }
}


// 更新趋势图表 (支持双 Y 轴)
function updateTrendChart(chartData) {
    if (!charts.trendChart || !chartData || !chartData.xAxisData || !chartData.seriesData || chartData.seriesData.length < 2) {
        console.error("无效的图表数据（需要时长和率）或图表未初始化");
        if(charts.trendChart) charts.trendChart.clear(); // 清空旧图表
        return;
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                // 确保 params 是数组
                if (!Array.isArray(params) || params.length === 0) {
                    return '';
                }
                let tooltipText = params[0].name + '<br/>'; // X轴日期 (YYYY-MM-DD)
                params.forEach(item => {
                    const seriesName = item.seriesName;
                    let value = item.value;
                    // 格式化数值，如果是率则加%，如果是时长则加 min
                    let formattedValue = seriesName.includes('率')
                                         ? (typeof value === 'number' ? value.toFixed(2) + '%' : '-- %')
                                         : (typeof value === 'number' ? Math.round(value) + ' min' : '-- min'); // 时长取整

                    const marker = item.marker; // 系列颜色标记
                    tooltipText += `${marker} ${seriesName}: ${formattedValue}<br/>`;
                });
                return tooltipText;
            }
        },
        legend: {
            data: chartData.seriesData.map(s => s.name), // 从数据中获取图例名称
            bottom: 10 // 图例放底部
        },
        grid: {
            left: '3%',
            right: '4%', // 为右侧Y轴留出空间
            bottom: '10%', // 为图例留出空间
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false, // 折线图通常不需要边界间隙
            data: chartData.xAxisData,
            axisLine: { lineStyle: { color: '#ccc' } },
            axisLabel: { color: '#666' }
        },
        yAxis: [
            { // 第一个 Y 轴 (左侧，停机时长)
                type: 'value',
                name: '停机时长 (分钟)',
                position: 'left',
                axisLine: { show: true, lineStyle: { color: '#5470c6' } }, // 蓝色轴线
                axisLabel: { formatter: '{value} min', color: '#666' },
                splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } // 浅色虚线网格
            },
            { // 第二个 Y 轴 (右侧，停机率)
                type: 'value',
                name: '停机率 (%)',
                position: 'right',
                min: 0, // 率通常从0开始
                max: 100, // 可以设置最大值，比如100
                axisLine: { show: true, lineStyle: { color: '#91cc75' } }, // 绿色轴线
                axisLabel: { formatter: '{value} %', color: '#666' },
                splitLine: { show: false } // 通常第二个轴不显示网格线，避免混乱
            }
        ],
        series: chartData.seriesData.map((s, index) => ({
            name: s.name,
            type: s.type || currentFilter.chartType || 'line', // 允许数据指定类型，否则用当前选择的
            yAxisIndex: s.yAxisIndex || 0, // 关联到对应的 Y 轴
            smooth: true, // 平滑曲线
            data: s.data,
            // 根据 Y 轴索引设置不同颜色
            itemStyle: {
                 color: s.yAxisIndex === 0 ? '#5470c6' : '#91cc75' // 蓝色和绿色
            },
            lineStyle: {
                 color: s.yAxisIndex === 0 ? '#5470c6' : '#91cc75'
            },
            // 只给停机时长添加面积图效果
            areaStyle: s.yAxisIndex === 0 ? { opacity: 0.2, color: '#5470c6' } : null,
            // 强调样式等其他配置...
        }))
    };

    try {
        charts.trendChart.setOption(option, true); // true 表示不合并，完全替换旧配置
        console.log("趋势图表已更新 (双轴)");
    } catch (e) {
        console.error("更新趋势图表时出错:", e);
    }
}

// 更新详情表格
function updateDetailsTable(tableData, totalPages) {
    console.log(`更新详情表格... 第 ${currentFilter.currentPage} 页 / 共 ${totalPages} 页`);
    const tbody = document.querySelector('#downtime-details-table tbody');
    const paginationContainer = document.getElementById('table-pagination');

    if (!tbody || !paginationContainer) return console.error("表格或分页容器未找到");

    let html = '';
    if (tableData && tableData.length > 0) {
        tableData.forEach(item => {
            const durationFormatted = formatDuration(item.duration); // 格式化时长
            const isLongDowntime = item.duration >= 240; // 超过4小时 (240分钟)
            html += `
                <tr class="${isLongDowntime ? 'long-downtime-highlight' : ''}" title="${isLongDowntime ? '停机超过4小时' : ''}">
                    <td>${item.site}</td>
                    <td>${item.device}</td>
                    <td>${item.startTime}</td>
                    <td>${item.endTime}</td>
                    <td data-duration="${item.duration}">${durationFormatted} ${isLongDowntime ? '<i class="fas fa-exclamation-triangle warning-icon" style="color: #E74C3C; margin-left: 5px;"></i>' : ''}</td>
                    <td>${item.reason || '--'}</td>
                </tr>
            `;
        });
    } else {
        html = `<tr><td colspan="6" class="text-center">没有找到匹配的停机记录</td></tr>`;
    }
    tbody.innerHTML = html;

    // 更新分页信息
    const pageInfo = paginationContainer.querySelector('.page-info');
    if (pageInfo) {
        pageInfo.querySelector('.current-page').textContent = currentFilter.currentPage;
        pageInfo.querySelector('.total-pages').textContent = totalPages;
    }


    // 更新分页按钮状态
    const prevBtn = paginationContainer.querySelector('.btn-page[data-page="prev"]');
    const nextBtn = paginationContainer.querySelector('.btn-page[data-page="next"]');
    if (prevBtn) prevBtn.disabled = currentFilter.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentFilter.currentPage >= totalPages;
     // 如果只有一页，两个按钮都禁用
     if (totalPages <= 1) {
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
     }
}

// 更新表头排序图标 (辅助函数)
function updateSortIcons(headers, activeField, sortOrder) {
    headers.forEach(h => {
        const icon = h.querySelector('i');
        if (!icon) return;
        const field = h.dataset.sort;
        h.classList.remove('sorted-asc', 'sorted-desc');
        icon.className = 'fas fa-sort'; // Reset icon
        if (field === activeField) {
            if (sortOrder === 'asc') {
                h.classList.add('sorted-asc');
                icon.className = 'fas fa-sort-up';
            } else {
                h.classList.add('sorted-desc');
                icon.className = 'fas fa-sort-down';
            }
        }
    });
}

// 格式化时长 (分钟 -> X小时Y分钟)
function formatDuration(minutes) {
    if (minutes == null || isNaN(minutes) || minutes < 0) return '--';
    if (minutes === 0) return '0分钟'; // 处理0分钟的情况
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60); // 使用 round 更符合习惯
    let result = '';
    if (hours > 0) {
        result += `${hours}小时`;
    }
    // 如果有小时且分钟不为0，或者只有分钟，才显示分钟
    if ((hours > 0 && mins > 0) || (hours === 0 && mins > 0)) {
         if (hours > 0) result += ' '; // 加个空格
        result += `${mins}分钟`;
    }
     // 如果只有小时且分钟为0
     else if (hours > 0 && mins === 0) {
         // result 已经包含了 "X小时"
     }
    return result;
}

// 显示/隐藏加载状态 (简单实现)
function showLoading(isLoading) {
    // 可以在页面上添加一个全局的loading遮罩层
    console.log(isLoading ? "显示加载状态..." : "隐藏加载状态.");
    // 示例： document.body.classList.toggle('is-loading', isLoading);
    // 简单禁用查询按钮
    const queryButton = document.getElementById('query-button');
    if (queryButton) {
        queryButton.disabled = isLoading;
        queryButton.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> 查询中...' : '<i class="fas fa-search"></i> 查询';
    }
}

// 导出表格数据 (框架)
function exportTableData() {
    alert("导出功能待实现。需要引入 SheetJS (xlsx) 等库将表格数据导出为 Excel 文件。");
    // 1. 获取当前表格所有数据 (需要重新获取或处理原始过滤数据)
    // 2. 格式化数据
    // 3. 使用库 (如 SheetJS) 生成 Excel 文件
    // 4. 触发下载
}

// 获取显示的时间范围文本 (辅助函数)
function getDisplayTimeRangeText(timeRange, startDate, endDate) {
     switch (timeRange) {
        case '7d': return '近7天';
        case '30d': return '近30天';
        case 'thisMonth': return '本月';
        case 'custom': return startDate && endDate ? `${startDate} 至 ${endDate}` : '自定义';
        default: return '未知范围';
    }
} 