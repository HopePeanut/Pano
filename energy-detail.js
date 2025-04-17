// 确保 DOM 完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', function() {

    // --- 全局变量和状态 ---
    let energyChart = null; // ECharts 实例
    let currentFilters = {}; // 当前筛选条件
    let currentView = 'chart'; // 当前视图 (chart/table)
    let mockSites = []; // 模拟站点数据
    let mockEnergyData = {}; // 模拟能效数据
    let currentPage = 1; // 表格当前页码
    const itemsPerPage = 10; // 表格每页显示条数
    let totalPages = 1; // 表格总页数

    // --- DOM 元素引用 ---
    const navbarContainer = document.getElementById('navbar-container');
    const chartContainer = document.getElementById('energy-chart');
    const tableContainer = document.getElementById('energy-table');
    const tableBody = tableContainer.querySelector('tbody');
    const paginationContainer = document.getElementById('table-pagination');
    const currentPageSpan = paginationContainer.querySelector('.current-page');
    const totalPagesSpan = paginationContainer.querySelector('.total-pages');
    const prevPageButton = paginationContainer.querySelector('[data-page="prev"]');
    const nextPageButton = paginationContainer.querySelector('[data-page="next"]');

    // 筛选相关元素
    const filterSection = document.getElementById('filter-section');
    const timeRangeToggle = filterSection.querySelector('.time-range-toggle');
    const customDateButton = filterSection.querySelector('.btn-custom-date');
    const timeDimensionToggle = filterSection.querySelector('.time-dimension-toggle');
    const siteSearchInput = document.getElementById('site-search');
    const siteDropdown = document.getElementById('site-dropdown');
    const selectedSitesContainer = document.getElementById('selected-sites');
    const clearSiteSelectButton = document.getElementById('clear-site-select');
    const meterTypeToggle = filterSection.querySelector('.meter-type-toggle');
    const fieldCheckboxesContainer = filterSection.querySelector('.field-checkboxes');
    const queryButton = document.getElementById('query-button');

    // 数据展示区操作按钮
    const dataSection = document.getElementById('energy-data-section');
    const chartTypeToggle = dataSection.querySelector('.chart-type-toggle');
    const switchViewButton = dataSection.querySelector('.btn-switch-view');
    const exportButton = dataSection.querySelector('.btn-export');

    // 模态框相关元素
    const customDateModal = document.getElementById('custom-date-modal');
    const closeCustomDate = document.getElementById('close-custom-date');
    const cancelCustomDate = document.getElementById('cancel-custom-date');
    const confirmCustomDate = document.getElementById('confirm-custom-date');
    const customStartDateInput = document.getElementById('custom-start-date');
    const customEndDateInput = document.getElementById('custom-end-date');

    const fieldInfoModal = document.getElementById('field-info-modal');
    const fieldInfoButton = document.getElementById('field-info-btn');
    const closeFieldInfo = document.getElementById('close-field-info');
    const closeFieldInfoBtn = document.getElementById('close-field-info-btn');

    // --- 初始化函数 ---

    /**
     * 页面初始化总入口
     */
    function initializePage() {
        console.log("开始初始化页面...");
        // 1. 渲染导航栏 (需要 navbar-template.js 支持)
        if (typeof renderNavbar === 'function') {
            renderNavbar(navbarContainer);
            console.log("导航栏已渲染。");
        } else {
            console.warn("未找到 renderNavbar 函数，请确保 navbar-template.js 已正确加载。");
        }

        // 2. 设置 Moment.js 中文环境
        moment.locale('zh-cn');
        console.log("Moment.js 已设置为中文环境。");

        // 3. 初始化 ECharts 图表
        initChart();
        console.log("ECharts 图表实例已初始化。");

        // 4. 设置默认筛选条件
        setDefaultFilters();
        console.log("默认筛选条件已设置:", currentFilters);

        // 5. 模拟生成站点数据并填充下拉框
        generateMockSites();
        populateSiteDropdown();
        console.log("模拟站点数据已生成并填充下拉框。");

        // 6. 绑定所有事件监听器
        bindEventListeners();
        console.log("事件监听器已绑定。");

        // 7. 执行首次数据查询和渲染
        loadAndRenderData();
        console.log("首次数据加载和渲染完成。");

        console.log("页面初始化完成。");
    }

    /**
     * 初始化 ECharts 图表实例
     */
    function initChart() {
        if (chartContainer) {
            energyChart = echarts.init(chartContainer);
            // 设置基本的图表配置（稍后会被实际数据覆盖）
            energyChart.setOption({
                tooltip: { trigger: 'axis' },
                legend: { data: [], bottom: 10 }, // 图例，动态生成
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: { type: 'category', boundaryGap: false, data: [] }, // X轴，类别轴
                yAxis: { type: 'value', name: '电能差值 (kWh)' }, // Y轴，数值轴
                series: [] // 数据系列，动态生成
            });
        } else {
            console.error("无法找到图表容器 #energy-chart。");
        }
    }

    /**
     * 设置默认的筛选条件
     */
    function setDefaultFilters() {
        // 时间范围: 默认近7天
        const defaultTimeRangeBtn = timeRangeToggle.querySelector('[data-range="7d"]');
        if (defaultTimeRangeBtn) defaultTimeRangeBtn.classList.add('active');
        const { startDate, endDate } = getDateRange('7d');

        // 时间维度: 默认天
        const defaultDimensionBtn = timeDimensionToggle.querySelector('[data-dimension="day"]');
        if (defaultDimensionBtn) defaultDimensionBtn.classList.add('active');

        // 电表类型: 默认站点关口表
        const defaultMeterTypeBtn = meterTypeToggle.querySelector('[data-meter-type="main"]');
        if (defaultMeterTypeBtn) defaultMeterTypeBtn.classList.add('active');

        // 站点选择: 默认空
        const selectedSites = [];

        // 字段选择: 默认选中所有
        const selectedFields = Array.from(fieldCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked'))
                                   .map(cb => cb.value);

        currentFilters = {
            timeRangeLabel: '近7天', // 用于显示的标签
            startDate: startDate,
            endDate: endDate,
            dimension: 'day',
            sites: selectedSites,
            meterType: 'main',
            fields: selectedFields
        };
        // 更新UI以反映默认选择
        updateActiveButton(timeRangeToggle, defaultTimeRangeBtn);
        updateActiveButton(timeDimensionToggle, defaultDimensionBtn);
        updateActiveButton(meterTypeToggle, defaultMeterTypeBtn);
        updateSelectedSitesUI();
    }

    // --- 事件监听器绑定 ---

    /**
     * 绑定页面上所有的事件监听器
     */
    function bindEventListeners() {
        // 筛选区域事件
        bindFilterEvents();
        // 数据展示区操作事件
        bindDataActionsEvents();
        // 模态框事件
        bindModalEvents();
        // 窗口大小变化事件（用于图表自适应）
        window.addEventListener('resize', handleResize);
    }

    /**
     * 绑定筛选区域的事件监听器
     */
    function bindFilterEvents() {
        // 1. 时间范围按钮点击
        timeRangeToggle.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-time-range')) {
                const range = event.target.dataset.range;
                if (range) {
                    const { startDate, endDate } = getDateRange(range);
                    currentFilters.startDate = startDate;
                    currentFilters.endDate = endDate;
                    currentFilters.timeRangeLabel = event.target.textContent; // 更新标签
                    updateActiveButton(timeRangeToggle, event.target);
                    // 移除自定义时间范围的激活状态
                    customDateButton.classList.remove('active');
                    console.log("时间范围变更为:", range, startDate, endDate);
                    // 注意：这里通常不直接查询，让用户点查询按钮
                }
            }
        });

        // 2. 自定义日期按钮点击
        customDateButton.addEventListener('click', () => {
            // 设置模态框默认日期为当前选中范围
            customStartDateInput.value = currentFilters.startDate;
            customEndDateInput.value = currentFilters.endDate;
            customDateModal.style.display = 'flex'; // 显示模态框
        });

        // 3. 时间维度按钮点击
        timeDimensionToggle.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-time-dimension')) {
                const dimension = event.target.dataset.dimension;
                if (dimension) {
                    currentFilters.dimension = dimension;
                    updateActiveButton(timeDimensionToggle, event.target);
                    console.log("时间维度变更为:", dimension);
                    // 注意：这里通常不直接查询
                }
            }
        });

        // 4. 站点搜索输入
        siteSearchInput.addEventListener('input', handleSiteSearch);
        // 点击输入框时显示下拉框（如果需要）
        siteSearchInput.addEventListener('focus', () => {
            // 使用 setTimeout 确保在 click 事件之后执行，防止立即隐藏
            setTimeout(() => {
                 populateSiteDropdown(siteSearchInput.value); // 根据当前输入值过滤
                 siteDropdown.style.display = 'block';
            }, 0);
        });

        // 5. 站点下拉框选项点击 (事件委托)
        siteDropdown.addEventListener('click', (event) => {
            if (event.target.classList.contains('select-option') && !event.target.classList.contains('disabled')) {
                const siteId = event.target.dataset.id;
                const siteName = event.target.dataset.name;
                if (siteId && siteName && !currentFilters.sites.some(s => s.id === siteId)) {
                    currentFilters.sites.push({ id: siteId, name: siteName });
                    updateSelectedSitesUI();
                    siteSearchInput.value = ''; // 清空搜索框
                    populateSiteDropdown(); // 重新填充完整列表，标记已选
                    // siteDropdown.style.display = 'none'; // 选择后不再立即隐藏，交给 blur 或 document click 处理
                    console.log("已选择站点:", siteId, siteName);
                    siteSearchInput.focus(); // 选择后让输入框重新获得焦点，便于连续选择
                }
            }
        });

        // --- 新增：处理点击页面其他地方隐藏下拉框 --- (替代之前的 document click 监听器)
         siteSearchInput.addEventListener('blur', () => {
             // 使用 setTimeout 延迟隐藏，以便下拉框的点击事件能被触发
             setTimeout(() => {
                 if (!siteDropdown.matches(':hover')) { // 如果鼠标不在下拉框上
                     siteDropdown.style.display = 'none';
                 }
             }, 200); // 200ms 延迟
         });
        // --- 结束新增 ---

        // 6. 移除已选站点标签 (事件委托)
        selectedSitesContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')) {
                const siteIdToRemove = event.target.parentElement.dataset.id;
                currentFilters.sites = currentFilters.sites.filter(s => s.id !== siteIdToRemove);
                updateSelectedSitesUI();
                // 移除后重新填充下拉列表，更新可选状态
                populateSiteDropdown(siteSearchInput.value);
                console.log("已移除站点:", siteIdToRemove);
            }
        });

        // 7. 清空站点选择按钮
        clearSiteSelectButton.addEventListener('click', () => {
            currentFilters.sites = [];
            updateSelectedSitesUI();
            console.log("已清空所有选定站点。");
        });

        // 8. 电表类型按钮点击
        meterTypeToggle.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-meter-type')) {
                const meterType = event.target.dataset.meterType;
                if (meterType) {
                    currentFilters.meterType = meterType;
                    updateActiveButton(meterTypeToggle, event.target);
                    console.log("电表类型变更为:", meterType);
                    // 注意：这里通常不直接查询
                }
            }
        });

        // 9. 字段选择复选框变化
        fieldCheckboxesContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                currentFilters.fields = Array.from(fieldCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked'))
                                             .map(cb => cb.value);
                console.log("字段选择变更为:", currentFilters.fields);
                // 注意：这里通常不直接查询
            }
        });

        // 10. 查询按钮点击
        queryButton.addEventListener('click', () => {
            console.log("触发查询，当前筛选条件:", currentFilters);
            currentPage = 1; // 重置到第一页
            loadAndRenderData();
        });
    }

    /**
     * 绑定数据展示区域的操作按钮事件
     */
    function bindDataActionsEvents() {
        // 2. 视图切换 (图表/表格)
        switchViewButton.addEventListener('click', () => {
            const icon = switchViewButton.querySelector('i');
            if (currentView === 'chart') {
                // 切换到表格视图
                chartContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                paginationContainer.style.display = 'flex'; // 显示分页器
                currentView = 'table';
                switchViewButton.title = '切换视图';
                icon.classList.remove('fa-table');
                icon.classList.add('fa-chart-line');
                console.log("视图切换为: 表格");
                // 确保表格数据是最新的（如果之前没显示过）
                renderTableDetailed(mockEnergyData.tableData || [], currentPage);
            } else {
                // 切换回图表视图
                chartContainer.style.display = 'block';
                tableContainer.style.display = 'none';
                paginationContainer.style.display = 'none'; // 隐藏分页器
                currentView = 'chart';
                switchViewButton.title = '切换视图';
                icon.classList.remove('fa-chart-line');
                icon.classList.add('fa-table');
                console.log("视图切换为: 图表");
                // 确保图表是响应式的
                handleResize();
            }
        });

        // 3. 导出按钮点击
        exportButton.addEventListener('click', () => {
            // TODO: 实现真实的导出逻辑，这里仅作模拟提示
            console.log("触发导出操作，筛选条件:", currentFilters);
            alert("模拟导出：数据将导出为 Excel 文件。");
            // 示例：可以使用 SheetJS (xlsx) 库将 mockEnergyData.tableData 导出
        });

        // 4. 分页按钮点击 (事件委托)
        paginationContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.btn-page');
            if (!button || button.disabled) return;

            const direction = button.dataset.page;
            if (direction === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (direction === 'next' && currentPage < totalPages) {
                currentPage++;
            }
            renderTableDetailed(mockEnergyData.tableData || [], currentPage); // 使用当前数据渲染新页
        });
    }

    /**
     * 绑定模态框相关的事件
     */
    function bindModalEvents() {
        // 1. 关闭自定义日期模态框
        closeCustomDate.addEventListener('click', () => customDateModal.style.display = 'none');
        cancelCustomDate.addEventListener('click', () => customDateModal.style.display = 'none');

        // 2. 确认自定义日期选择
        confirmCustomDate.addEventListener('click', () => {
            const startDate = customStartDateInput.value;
            const endDate = customEndDateInput.value;

            if (startDate && endDate && moment(startDate).isBefore(moment(endDate))) {
                currentFilters.startDate = startDate;
                currentFilters.endDate = endDate;
                // 更新时间范围标签为自定义范围
                currentFilters.timeRangeLabel = `${startDate} 至 ${endDate}`;
                // 更新按钮状态
                updateActiveButton(timeRangeToggle, null); // 清除预设按钮激活状态
                customDateButton.classList.add('active'); // 激活自定义按钮

                customDateModal.style.display = 'none'; // 关闭模态框
                console.log("自定义时间范围选择:", startDate, endDate);
                // 注意：这里通常不直接查询
            } else {
                alert("请选择有效的开始和结束日期，且开始日期不能晚于结束日期。");
            }
        });

        // 3. 打开字段说明模态框
        fieldInfoButton.addEventListener('click', () => fieldInfoModal.style.display = 'flex');

        // 4. 关闭字段说明模态框
        closeFieldInfo.addEventListener('click', () => fieldInfoModal.style.display = 'none');
        closeFieldInfoBtn.addEventListener('click', () => fieldInfoModal.style.display = 'none');

        // 5. 点击模态框外部区域关闭 (可选)
        window.addEventListener('click', (event) => {
            if (event.target === customDateModal) {
                customDateModal.style.display = 'none';
            }
            if (event.target === fieldInfoModal) {
                fieldInfoModal.style.display = 'none';
            }
        });
    }

    // --- 数据处理和模拟 ---

    /**
     * 模拟生成站点数据
     */
    function generateMockSites() {
        mockSites = [
            { id: 'site001', name: '金华电器储能电站' },
            { id: 'site002', name: '乔凯科技储能电站' },
            { id: 'site003', name: '长寿望变储能电站' },
            { id: 'site004', name: '龙马超充站' },
            { id: 'site005', name: '恒压马蒂储能电站' },
            { id: 'site006', name: '金华电器储能电站' },
            { id: 'site007', name: '华亿轴承储能电站' },
        ];
    }

    /**
     * 填充站点选择下拉框
     * @param {string} [searchTerm=''] - 搜索关键词
     */
    function populateSiteDropdown(searchTerm = '') {
        siteDropdown.innerHTML = ''; // 清空现有选项
        const filteredSites = mockSites.filter(site =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredSites.length === 0) {
            siteDropdown.innerHTML = '<div class="select-option disabled">未找到匹配站点</div>';
            return;
        }

        filteredSites.forEach(site => {
            const isSelected = currentFilters.sites.some(s => s.id === site.id);
            const option = document.createElement('div');
            option.classList.add('select-option');
            option.dataset.id = site.id;
            option.dataset.name = site.name;
            option.textContent = site.name;
            if (isSelected) {
                option.classList.add('selected', 'disabled');
                option.title = '已选择';
                // 禁用点击事件 (或者在点击处理函数中检查 disabled 类)
            } else {
                 option.title = '点击选择';
            }
            siteDropdown.appendChild(option);
        });
    }

    /**
     * 处理站点搜索输入
     */
    function handleSiteSearch() {
        const searchTerm = siteSearchInput.value;
        populateSiteDropdown(searchTerm);
        // 输入时确保下拉框可见
        if (siteDropdown.style.display !== 'block') {
            siteDropdown.style.display = 'block';
        }
    }

    /**
     * 更新已选站点的UI显示
     */
    function updateSelectedSitesUI() {
        selectedSitesContainer.innerHTML = ''; // 清空
        
        if (currentFilters.sites.length === 0) {
            // 可以添加一个提示文本
            const emptyText = document.createElement('span');
            emptyText.className = 'empty-selection-text';
            emptyText.textContent = '未选择站点，将显示所有站点数据';
            emptyText.style.color = '#999';
            emptyText.style.fontStyle = 'italic';
            emptyText.style.fontSize = '13px';
            selectedSitesContainer.appendChild(emptyText);
            return;
        }
        
        currentFilters.sites.forEach(site => {
            const tag = document.createElement('span');
            tag.classList.add('selected-item');
            tag.dataset.id = site.id;
            tag.innerHTML = `
                ${site.name}
                <span class="remove-item" title="移除此站点"><i class="fas fa-times"></i></span>
            `;
            selectedSitesContainer.appendChild(tag);
        });
    }

    /**
     * 根据选择的范围代码获取开始和结束日期
     * @param {string} rangeCode - 如 '7d', '30d', 'thisMonth'
     * @returns {{startDate: string, endDate: string}} - YYYY-MM-DD 格式的日期
     */
    function getDateRange(rangeCode) {
        const end = moment(); // 结束日期为今天
        let start;

        switch (rangeCode) {
            case '7d':
                start = moment().subtract(6, 'days'); // 包括今天，共7天
                break;
            case '30d':
                start = moment().subtract(29, 'days'); // 包括今天，共30天
                break;
            // case 'thisMonth': // 移除本月选项的处理
            //     start = moment().startOf('month');
            //     break;
            default: // 默认为近7天
                start = moment().subtract(6, 'days');
        }
        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
        };
    }

    /**
     * 模拟获取能效数据
     * @param {object} filters - 当前筛选条件
     * @returns {Promise<object>} - 包含图表和表格数据的 Promise
     */
    function fetchEnergyData(filters) {
        console.log("开始模拟获取数据，筛选条件:", filters);
        // 显示加载状态 (如果需要)
        showLoading(chartContainer);
        if (tableContainer) showLoading(tableContainer.parentElement); // 在卡片上显示

        return new Promise(resolve => {
            // 模拟网络延迟
            setTimeout(() => {
                const simulatedData = generateMockEnergyData(filters);
                mockEnergyData = simulatedData; // 存储最新数据

                // 隐藏加载状态
                hideLoading(chartContainer);
                if (tableContainer) hideLoading(tableContainer.parentElement);

                console.log("模拟数据生成完成:", simulatedData);
                resolve(simulatedData);
            }, 800); // 模拟800ms延迟
        });
    }

    /**
     * 生成模拟能效数据
     * @param {object} filters - 当前筛选条件
     * @returns {object} - 包含 chartData 和 tableData 的对象
     */
    function generateMockEnergyData(filters) {
        const { startDate, endDate, dimension, sites, meterType, fields } = filters;
        const start = moment(startDate);
        const end = moment(endDate);
        const timeLabels = [];
        const chartSeries = {}; // 用于图表，格式 { fieldName: [value1, value2, ...] }
        const tableData = []; // 用于表格，格式 [{ time: '...', siteName: '...', meterType: '...', field: '...', value: ... }, ...]

        // 初始化图表数据结构
        fields.forEach(field => {
            chartSeries[field] = [];
        });

        // 获取站点列表，如果没有选择站点，则随机选一个或多个用于演示
        const targetSites = sites.length > 0 ? sites : [mockSites[0] || {id: 'default', name:'默认站点'}];

        // 根据时间维度生成时间标签和数据点
        let current = start.clone();
        while (current.isSameOrBefore(end)) {
            let label = '';
            let next = current.clone();

            // 根据维度确定标签和下一个时间点
            switch (dimension) {
                case 'hour':
                    label = current.format('YYYY-MM-DD HH:00');
                    next.add(1, 'hour');
                    break;
                case 'day':
                    label = current.format('YYYY-MM-DD');
                    next.add(1, 'day');
                    break;
                case 'week':
                    label = `第${current.week()}周 (${current.format('MM-DD')}~${next.add(6, 'days').format('MM-DD')})`; // 周标签
                     next = current.clone().add(1, 'week'); // 移动到下一周的开始
                     current = current.clone().startOf('week'); // 保证从周一开始
                    break;
                case 'month':
                    label = current.format('YYYY-MM');
                    next.add(1, 'month');
                    break;
                default: // 默认为 day
                    label = current.format('YYYY-MM-DD');
                     next.add(1, 'day');
            }
            timeLabels.push(label);

            // 为每个选定字段生成模拟数据
            fields.forEach(field => {
                let baseValue = 100; // 基础值
                // 可以根据字段类型给不同的基础值或波动范围
                if (field.includes('neg')) baseValue = 10;
                if (field.includes('tip')) baseValue = 50;
                if (field.includes('peak')) baseValue = 80;
                if (field.includes('valley')) baseValue = 20;

                // 模拟波动，可以加入随机性、趋势性等
                const randomFactor = (Math.random() - 0.3) * 50; // 波动因子
                const timeFactor = (current.diff(start, 'days') / end.diff(start, 'days')) * 30; // 时间趋势因子
                let value = Math.max(0, baseValue + randomFactor + timeFactor); // 确保非负
                value = parseFloat(value.toFixed(2)); // 保留两位小数

                chartSeries[field].push(value);

                // --- 修改: 为表格生成数据，包含 siteName 和 meterType --- 
                targetSites.forEach(site => {
                    tableData.push({
                        time: label,
                        siteName: site.name, // 新增站点名称
                        meterType: meterType, // 使用筛选的电表类型
                        // meterName: `${site.name}-${getMeterTypeName(meterType)}`, // 移除组合名称
                        siteId: site.id,
                        field: field,
                        fieldName: getFieldName(field), // 获取字段中文名 (统计类型)
                        value: value,
                        isAbnormal: Math.random() < 0.05 // 5% 概率标记为异常
                    });
                });
                // --- 结束修改 ---
            });

            // 移动到下一个时间点
             if (dimension === 'week') {
                 current = next; // 如果是周，直接跳到下一周
             } else {
                current = next;
             }
        }

        // 格式化图表数据
        const finalChartSeries = fields.map(field => {
            const isTotalActive = field === 'positive' || field === 'negative';
            const isTimeOfUse = field.match(/tip|peak|flat|valley/);

            // 定义样式
            let lineStyle = { color: getFieldColor(field), width: 2, type: 'solid' };
            let symbolSize = 4;
            if (isTotalActive) {
                lineStyle.width = 3;
                symbolSize = 6;
            } else if (isTimeOfUse) {
                lineStyle.type = 'dashed';
            }

            return {
                name: getFieldName(field),
                type: 'line', // 直接设置为 line
                data: chartSeries[field],
                smooth: true, // 折线图始终平滑
                itemStyle: { color: getFieldColor(field) },
                lineStyle: lineStyle,
                symbolSize: symbolSize,
                areaStyle: { opacity: 0.1, color: getFieldColor(field) }, // 始终应用面积样式
                emphasis: { focus: 'series' },
            }
        });

        return {
            chartData: { labels: timeLabels, series: finalChartSeries, legend: fields.map(field => getFieldName(field)) },
            tableData: tableData
        };
    }


    // --- UI 更新函数 ---

    /**
     * 更新按钮组的激活状态
     * @param {HTMLElement} buttonGroup - 按钮组容器
     * @param {HTMLElement | null} activeButton - 要激活的按钮，null 表示取消所有激活
     */
    function updateActiveButton(buttonGroup, activeButton) {
        const buttons = buttonGroup.querySelectorAll('.btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    /**
     * 渲染 ECharts 图表 (简化版，只处理折线图)
     * @param {object} data - 包含 labels, series, legend 的图表数据
     */
    function renderChart(data) {
        if (!energyChart || !data || !data.chartData) {
            console.warn("图表实例或数据无效，无法渲染图表。");
             // 可以显示空状态或错误提示
            if (energyChart) {
                energyChart.clear(); // 清空图表
                energyChart.setOption({ // 显示无数据提示
                    title: {
                        text: '暂无数据或未选择字段',
                        left: 'center',
                        top: 'center',
                        textStyle: { color: '#999' }
                    },
                    xAxis: { show: false },
                    yAxis: { show: false },
                    series: []
                });
            }
            return;
        }

        const { labels, series, legend } = data.chartData;

        // 注意：series 已经包含了正确的类型和样式，无需再处理
        // const updatedSeries = series.map(s => ({ ... })); // 不再需要

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            legend: { data: legend, bottom: 10, type: 'scroll' },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false, // 折线图不需要两边留白
                data: labels,
                axisLabel: { interval: 'auto', rotate: labels.length > 15 ? 30 : 0 }
            },
            yAxis: {
                type: 'value',
                name: '电能差值 (kWh)',
                nameTextStyle: { padding: [0, 0, 0, 50] },
                axisLine: { show: true },
                splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    type: 'slider',
                    start: 0,
                    end: 100,
                    bottom: '5%'
                }
            ],
            series: series // 直接使用传入的 series
        };

        energyChart.setOption(option, true); // true 表示不合并，完全替换旧配置
        console.log("图表已渲染为折线图。"); // 更新日志信息
    }

    /**
     * 渲染数据表格 - 详细版本 (每个字段一行)
     * @param {Array} data - 完整的表格数据数组
     * @param {number} page - 要显示的页码 (从1开始)
     */
    function renderTableDetailed(data, page) {
        tableBody.innerHTML = ''; // 清空表格内容

        if (!data || data.length === 0) {
            totalPages = 1;
            currentPage = 1;
            tableBody.innerHTML = '<tr><td colspan="13" class="text-center">暂无数据</td></tr>'; // 更新 colspan 为 13
            updatePaginationControls();
            console.log("表格数据为空，已显示提示。");
            return;
        }

        // 1. 按时间、站点和电表类型聚合数据
        const aggregatedData = {};
        data.forEach(row => {
            const key = `${row.time}_${row.siteName}_${row.meterType}`;
            if (!aggregatedData[key]) {
                aggregatedData[key] = {
                    time: row.time,
                    siteName: row.siteName,
                    meterType: row.meterType,
                    fields: {},
                    isAnyAbnormal: false
                };
            }
            aggregatedData[key].fields[row.field] = { value: row.value, isAbnormal: row.isAbnormal };
            if (row.isAbnormal) {
                aggregatedData[key].isAnyAbnormal = true;
            }
        });

        // 2. 转换聚合数据为数组，以便分页
        const tableRowsData = Object.values(aggregatedData);

        totalPages = Math.ceil(tableRowsData.length / itemsPerPage);
        currentPage = Math.max(1, Math.min(page, totalPages)); // 确保页码在有效范围内

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = tableRowsData.slice(startIndex, endIndex);

        const fragment = document.createDocumentFragment(); // 使用文档片段提高性能
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            
            // 如果有任何异常值，标记整行
            if (row.isAnyAbnormal) {
                tr.classList.add('abnormal');
            }

            // 获取各字段数据
            const positiveData = row.fields['positive'] || { value: '-', isAbnormal: false };
            const negativeData = row.fields['negative'] || { value: '-', isAbnormal: false };
            
            const tipPosData = row.fields['tip_pos'] || { value: '-', isAbnormal: false };
            const tipNegData = row.fields['tip_neg'] || { value: '-', isAbnormal: false };
            
            const peakPosData = row.fields['peak_pos'] || { value: '-', isAbnormal: false };
            const peakNegData = row.fields['peak_neg'] || { value: '-', isAbnormal: false };
            
            const flatPosData = row.fields['flat_pos'] || { value: '-', isAbnormal: false };
            const flatNegData = row.fields['flat_neg'] || { value: '-', isAbnormal: false };
            
            const valleyPosData = row.fields['valley_pos'] || { value: '-', isAbnormal: false };
            const valleyNegData = row.fields['valley_neg'] || { value: '-', isAbnormal: false };

            tr.innerHTML = `
                <td>${row.time || '-'}</td>
                <td>${row.siteName || '-'}</td> 
                <td>${getMeterTypeName(row.meterType) || '-'}</td>
                <td class="${positiveData.isAbnormal ? 'abnormal-cell' : ''}">${positiveData.value}</td>
                <td class="${negativeData.isAbnormal ? 'abnormal-cell' : ''}">${negativeData.value}</td>
                <td class="${tipPosData.isAbnormal ? 'abnormal-cell' : ''}">${tipPosData.value}</td>
                <td class="${tipNegData.isAbnormal ? 'abnormal-cell' : ''}">${tipNegData.value}</td>
                <td class="${peakPosData.isAbnormal ? 'abnormal-cell' : ''}">${peakPosData.value}</td>
                <td class="${peakNegData.isAbnormal ? 'abnormal-cell' : ''}">${peakNegData.value}</td>
                <td class="${flatPosData.isAbnormal ? 'abnormal-cell' : ''}">${flatPosData.value}</td>
                <td class="${flatNegData.isAbnormal ? 'abnormal-cell' : ''}">${flatNegData.value}</td>
                <td class="${valleyPosData.isAbnormal ? 'abnormal-cell' : ''}">${valleyPosData.value}</td>
                <td class="${valleyNegData.isAbnormal ? 'abnormal-cell' : ''}">${valleyNegData.value}</td>
            `;

            fragment.appendChild(tr);
        });

        tableBody.appendChild(fragment);
        updatePaginationControls();
        console.log(`表格已渲染第 ${currentPage} 页数据。`);
    }

    /**
     * 渲染数据表格 - 按时间聚合版本 (不再默认使用)
     * @param {Array} rawData - 原始数据数组，每个元素代表一个字段在一个时间点的值
     * @param {number} page - 要显示的页码 (从1开始)
     */
    function renderTableAggregated(rawData, page) {
        tableBody.innerHTML = ''; // 清空表格内容

        if (!rawData || rawData.length === 0) {
            totalPages = 1;
            currentPage = 1;
            tableBody.innerHTML = '<tr><td colspan="13" class="text-center">暂无数据</td></tr>'; // 调整列数为13
            updatePaginationControls();
            console.log("表格数据为空，已显示提示。");
            return;
        }

        // 1. 按时间和电表名称聚合数据
        const aggregatedData = {}; // key: time_meterName_meterType, value: { time, siteName, meterType, fields: {fieldName: value, isAbnormal}, isAnyAbnormal }
        rawData.forEach(row => {
            const key = `${row.time}_${row.siteName}_${row.meterType}`;
            if (!aggregatedData[key]) {
                aggregatedData[key] = {
                    time: row.time,
                    siteName: row.siteName,
                    meterType: row.meterType,
                    fields: {},
                    isAnyAbnormal: false
                };
            }
            aggregatedData[key].fields[row.field] = { value: row.value, isAbnormal: row.isAbnormal };
            if (row.isAbnormal) {
                aggregatedData[key].isAnyAbnormal = true;
            }
        });

        // 转换聚合数据为数组，以便分页
        const tableRowsData = Object.values(aggregatedData);

        totalPages = Math.ceil(tableRowsData.length / itemsPerPage);
        currentPage = Math.max(1, Math.min(page, totalPages)); // 确保页码在有效范围内

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = tableRowsData.slice(startIndex, endIndex);

        const fragment = document.createDocumentFragment(); // 使用文档片段提高性能
        pageData.forEach(aggRow => {
            const tr = document.createElement('tr');
            if (aggRow.isAnyAbnormal) {
                tr.classList.add('abnormal'); // 标记异常行
            }

            // 获取选中的字段，并按顺序显示
            const selectedFields = currentFilters.fields; // 获取当前选中的字段

            // 处理尖峰平谷数据，提取为单独变量以方便在表格中使用
            const tipPosData = aggRow.fields['tip_pos'] || { value: '-', isAbnormal: false };
            const tipNegData = aggRow.fields['tip_neg'] || { value: '-', isAbnormal: false };
            const tipValue = tipPosData.value !== '-' || tipNegData.value !== '-' ? 
                `${tipPosData.value !== '-' ? '正:' + tipPosData.value : ''} ${tipNegData.value !== '-' ? '反:' + tipNegData.value : ''}`.trim() : '-';
            const tipAbnormal = tipPosData.isAbnormal || tipNegData.isAbnormal;

            const peakPosData = aggRow.fields['peak_pos'] || { value: '-', isAbnormal: false };
            const peakNegData = aggRow.fields['peak_neg'] || { value: '-', isAbnormal: false };
            const peakValue = peakPosData.value !== '-' || peakNegData.value !== '-' ? 
                `${peakPosData.value !== '-' ? '正:' + peakPosData.value : ''} ${peakNegData.value !== '-' ? '反:' + peakNegData.value : ''}`.trim() : '-';
            const peakAbnormal = peakPosData.isAbnormal || peakNegData.isAbnormal;

            const flatPosData = aggRow.fields['flat_pos'] || { value: '-', isAbnormal: false };
            const flatNegData = aggRow.fields['flat_neg'] || { value: '-', isAbnormal: false };
            const flatValue = flatPosData.value !== '-' || flatNegData.value !== '-' ? 
                `${flatPosData.value !== '-' ? '正:' + flatPosData.value : ''} ${flatNegData.value !== '-' ? '反:' + flatNegData.value : ''}`.trim() : '-';
            const flatAbnormal = flatPosData.isAbnormal || flatNegData.isAbnormal;

            const valleyPosData = aggRow.fields['valley_pos'] || { value: '-', isAbnormal: false };
            const valleyNegData = aggRow.fields['valley_neg'] || { value: '-', isAbnormal: false };
            const valleyValue = valleyPosData.value !== '-' || valleyNegData.value !== '-' ? 
                `${valleyPosData.value !== '-' ? '正:' + valleyPosData.value : ''} ${valleyNegData.value !== '-' ? '反:' + valleyNegData.value : ''}`.trim() : '-';
            const valleyAbnormal = valleyPosData.isAbnormal || valleyNegData.isAbnormal;

            tr.innerHTML = `
                <td>${aggRow.time || '-'}</td>
                <td>${aggRow.siteName || '-'}</td>
                <td>${getMeterTypeName(aggRow.meterType) || '-'}</td>
                <td>聚合</td>
                <td class="${aggRow.fields['positive']?.isAbnormal ? 'abnormal-cell' : ''}">${aggRow.fields['positive']?.value ?? '-'}</td>
                <td class="${aggRow.fields['negative']?.isAbnormal ? 'abnormal-cell' : ''}">${aggRow.fields['negative']?.value ?? '-'}</td>
                <td class="${tipAbnormal ? 'abnormal-cell' : ''}">${tipValue}</td>
                <td class="${peakAbnormal ? 'abnormal-cell' : ''}">${peakValue}</td>
                <td class="${flatAbnormal ? 'abnormal-cell' : ''}">${flatValue}</td>
                <td class="${valleyAbnormal ? 'abnormal-cell' : ''}">${valleyValue}</td>
            `;

            fragment.appendChild(tr);
        });

        tableBody.appendChild(fragment);
        updatePaginationControls();
        console.log(`聚合表格已渲染第 ${currentPage} 页数据。`);
    }

    /**
     * 更新分页器的状态和显示
     */
    function updatePaginationControls() {
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
        // 如果只有一页，隐藏分页器
        paginationContainer.style.display = totalPages <= 1 && currentView === 'table' ? 'none' : 'flex';

    }

    /**
     * 窗口大小变化时调整图表大小
     */
    function handleResize() {
        if (energyChart && currentView === 'chart') {
            energyChart.resize();
        }
    }

    /**
     * 显示加载动画
     * @param {HTMLElement} container - 需要显示加载动画的容器
     */
    function showLoading(container) {
        if (!container) return;
        // 移除旧的加载动画（如果存在）
        const existingOverlay = container.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        // 创建新的加载动画
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        // 确保容器 position 是 relative 或 absolute
         if (getComputedStyle(container).position === 'static') {
             container.style.position = 'relative';
         }
        container.appendChild(overlay);
    }

    /**
     * 隐藏加载动画
     * @param {HTMLElement} container - 加载动画所在的容器
     */
    function hideLoading(container) {
        if (!container) return;
        const overlay = container.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }


    // --- 辅助函数 ---

    /**
     * 获取字段的中文名称
     * @param {string} fieldKey - 字段的英文键名 (如 'positive')
     * @returns {string} - 字段的中文名称
     */
    function getFieldName(fieldKey) {
        const names = {
            'positive': '正向有功',
            'negative': '反向有功',
            'tip_pos': '尖(正)',
            'tip_neg': '尖(反)',
            'peak_pos': '峰(正)',
            'peak_neg': '峰(反)',
            'flat_pos': '平(正)',
            'flat_neg': '平(反)',
            'valley_pos': '谷(正)',
            'valley_neg': '谷(反)'
        };
        return names[fieldKey] || fieldKey; // 如果没找到，返回原key
    }

    /**
     * 获取电表类型的中文名称
     * @param {string} typeKey - 电表类型的英文键名 (如 'main')
     * @returns {string} - 电表类型的中文名称
     */
    function getMeterTypeName(typeKey) {
        const names = {
            'main': '关口表',
            'storage': '储能并网表',
            'charging': '充电桩并网表',
            'photovoltaic': '光伏电表'
        };
        return names[typeKey] || typeKey;
    }


    /**
     * 为不同字段获取一个固定的颜色（用于图表）
     * @param {string} fieldKey
     * @returns {string} - CSS 颜色值
     */
    function getFieldColor(fieldKey) {
        // 使用 HSL 颜色空间生成颜色，确保颜色区分度较好且风格清新
        const fieldIndex = Object.keys({
            'positive': 0, 'negative': 1, 'tip_pos': 2, 'tip_neg': 3,
            'peak_pos': 4, 'peak_neg': 5, 'flat_pos': 6, 'flat_neg': 7,
            'valley_pos': 8, 'valley_neg': 9
        }).indexOf(fieldKey);

        const hueStep = 360 / 10; // 假设最多10个字段
        const hue = (fieldIndex * hueStep + 150) % 360; // 从绿色附近开始 (150度左右)
        const saturation = 70; // 饱和度
        const lightness = 50; // 亮度

        // 特殊处理正向/反向，让它们更突出或区分
        if (fieldKey === 'positive') return 'hsl(165, 70%, 45%)'; // 主色调的深色
        if (fieldKey === 'negative') return 'hsl(30, 80%, 60%)'; // 橙色系

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // --- 主流程控制 ---

    /**
     * 加载数据并更新图表和表格
     */
    async function loadAndRenderData() {
        try {
            const data = await fetchEnergyData(currentFilters);
            renderChart(data);
            renderTableDetailed(data.tableData || [], currentPage);

             // 如果当前是表格视图，确保分页器可见性正确
             if (currentView === 'table') {
                 updatePaginationControls();
             }

        } catch (error) {
            console.error("加载或渲染数据时出错:", error);
            // 显示错误信息给用户
            if (energyChart) energyChart.showLoading('default', { text: '加载数据失败' });
            tableBody.innerHTML = '<tr><td colspan="13" class="text-center">加载数据失败</td></tr>'; // 更新colspan为13
        }
    }


    // --- 页面启动 ---
    initializePage();

}); // DOMContentLoaded End
