// health-score-detail.js - 站点健康评分详情页脚本

// 全局变量
const charts = {
    overviewChart: null,        // 总览图表
    dimensionChart: null,       // 维度分布图表
    trendChart: null,           // 详情弹窗-趋势图表
    stoppageChart: null,        // 详情弹窗-停机图表
    alarmChart: null,           // 详情弹窗-告警图表
    revenueChart: null,         // 详情弹窗-收益图表
    energyChart: null,          // 详情弹窗-能耗图表
    sohChart: null,            // 详情弹窗-SOH图表
    temperatureChart: null,      // 详情弹窗-温度一致性图表
    voltageChart: null         // 详情弹窗-电压一致性图表
};

// 当前筛选状态
const currentFilter = {
    timeRange: '30d',
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    searchTerm: '',
    visibleDimensions: ['stoppage', 'alarm', 'soh', 'temperature', 'voltage'], // 默认所有维度都可见
    sortField: 'totalScore',
    sortOrder: 'desc',
    currentPage: 1,
    pageSize: 10,
    chartType: 'bar',
    activeDimension: 'stoppage' // 默认显示停机维度
};

// DOMContentLoaded - 确保DOM加载完毕
document.addEventListener('DOMContentLoaded', () => {
    console.log("站点健康评分详情页 DOM 加载完成");
    
    try {
        // 初始化页面功能
        initFilterSection();
        initScoreOverviewSection();
        initScoreDimensionSection();
        initExplanationSection();
        initDetailModal();
        initCustomDateModal();
        
        // 加载默认数据
        loadHealthScoreData();
        
        // 窗口大小改变时调整图表
        window.addEventListener('resize', handleResize);
        
        // 处理筛选栏的吸顶效果
        window.addEventListener('scroll', handleStickyFilter);
        
    } catch (error) {
        console.error("初始化站点健康评分详情页出错:", error);
    }
});

// 处理窗口大小改变，调整图表尺寸
function handleResize() {
    for (const chartName in charts) {
        if (charts[chartName]) {
            charts[chartName].resize();
        }
    }
}

// 处理筛选栏吸顶效果
function handleStickyFilter() {
    const filterSection = document.getElementById('filter-section');
    const headerHeight = 60; // 假设顶部导航栏高度为60px
    
    if (window.scrollY > headerHeight) {
        filterSection.classList.add('sticky');
        document.body.style.paddingTop = `${filterSection.offsetHeight}px`;
    } else {
        filterSection.classList.remove('sticky');
        document.body.style.paddingTop = '0';
    }
}

// 初始化筛选区域
function initFilterSection() {
    console.log("初始化筛选区域");
    
    // 时间范围按钮
    const timeRangeBtns = document.querySelectorAll('.time-range-toggle .btn-time-range');
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter.timeRange = btn.dataset.range;
            currentFilter.startDate = null;
            currentFilter.endDate = null;
            loadHealthScoreData();
        });
    });
    
    // 自定义日期按钮
    const customDateBtn = document.querySelector('.btn-custom-date');
    if (customDateBtn) {
        customDateBtn.addEventListener('click', () => {
            showCustomDateModal();
        });
    }
    
    // 搜索按钮
    const searchBtn = document.querySelector('.btn-search');
    const searchInput = document.getElementById('site-search');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentFilter.searchTerm = searchInput.value.trim();
            loadHealthScoreData();
        });
        
        // 回车键触发搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentFilter.searchTerm = searchInput.value.trim();
                loadHealthScoreData();
            }
        });
    }
    
    // 导出按钮
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // 维度多选框
    const dimensionCheckboxes = document.querySelectorAll('.dimension-checkbox');
    dimensionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 更新可见维度列表
            currentFilter.visibleDimensions = Array.from(dimensionCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            // 至少保留一个维度
            if (currentFilter.visibleDimensions.length === 0) {
                checkbox.checked = true;
                currentFilter.visibleDimensions = [checkbox.value];
                alert('请至少选择一个评分维度');
            }
            
            // 刷新数据
            updateVisibleColumns();
            loadHealthScoreData();
        });
    });
}

// 更新表格中的可见列
function updateVisibleColumns() {
    console.log("更新表格可见列:", currentFilter.visibleDimensions);
    
    const table = document.querySelector('#health-score-table table');
    if (!table) return;
    
    // 更新表头
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        const headers = headerRow.querySelectorAll('th');
        // 站点名称(1)、综合评分(2)和操作列(最后两列)始终显示
        for (let i = 2; i < headers.length - 2; i++) {
            const header = headers[i];
            const dimension = header.dataset.sort?.replace('Score', '') || '';
            if (dimension && dimension !== 'total') {
                header.style.display = currentFilter.visibleDimensions.includes(dimension) ? '' : 'none';
            }
        }
    }
    
    // 更新数据行
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // 站点名称(1)、综合评分(2)和操作列(最后两列)始终显示
        for (let i = 2; i < cells.length - 2; i++) {
            const cell = cells[i];
            const dimension = headerRow.querySelectorAll('th')[i].dataset.sort?.replace('Score', '') || '';
            if (dimension && dimension !== 'total') {
                cell.style.display = currentFilter.visibleDimensions.includes(dimension) ? '' : 'none';
            }
        }
    });
}

// 导出数据功能
function exportData() {
    alert('数据导出功能即将实现，敬请期待！');
    // TODO: 实现导出为Excel或CSV的功能
}

// 加载健康评分数据（主函数）
function loadHealthScoreData() {
    console.log("加载健康评分数据:", currentFilter);
    
    // 显示加载中状态
    showLoading(true);
    
    // 模拟异步数据加载
    setTimeout(() => {
        try {
            // 生成模拟数据
            const data = generateHealthScoreData();
            
            // 更新总览表格和图表
            updateOverviewTable(data);
            updateOverviewChart(data);
            
            // 更新维度分布图表
            updateDimensionChart(data, currentFilter.activeDimension);
            
            // 隐藏加载状态
            showLoading(false);
            
        } catch (error) {
            console.error("加载健康评分数据失败:", error);
            showLoading(false);
            alert('数据加载失败，请重试');
        }
    }, 500); // 模拟网络延迟
}

// 显示/隐藏加载状态
function showLoading(isLoading) {
    // TODO: 实现加载指示器
    console.log(isLoading ? "显示加载状态" : "隐藏加载状态");
}

// 获取显示的时间范围文本
function getDisplayTimeRangeText(timeRange, startDate, endDate) {
    switch (timeRange) {
        case 'week': return '近7天';
        case 'month30': return '近30天';
        case 'thisMonth': return '本月';
        case 'lastMonth': return '上月';
        case 'custom': return startDate && endDate ? `${startDate} 至 ${endDate}` : '自定义';
        default: return '全部';
    }
}

// 初始化自定义日期模态框
function initCustomDateModal() {
    console.log("初始化自定义日期模态框");
    
    const modal = document.getElementById('custom-date-modal');
    const closeBtn = document.getElementById('close-custom-date');
    const cancelBtn = document.getElementById('cancel-custom-date');
    const confirmBtn = document.getElementById('confirm-custom-date');
    
    if (!modal || !closeBtn || !cancelBtn || !confirmBtn) {
        console.error("自定义日期模态框元素未找到");
        return;
    }
    
    // 关闭按钮事件
    closeBtn.addEventListener('click', hideCustomDateModal);
    cancelBtn.addEventListener('click', hideCustomDateModal);
    
    // 确认按钮事件
    confirmBtn.addEventListener('click', () => {
        const startDateInput = document.getElementById('custom-start-date');
        const endDateInput = document.getElementById('custom-end-date');
        
        if (!startDateInput.value || !endDateInput.value) {
            alert('请选择开始和结束日期');
            return;
        }
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (startDate > endDate) {
            alert('结束日期必须大于或等于开始日期');
            return;
        }
        
        // 设置自定义日期
        currentFilter.timeRange = 'custom';
        currentFilter.startDate = startDateInput.value;
        currentFilter.endDate = endDateInput.value;
        
        // 清除时间范围按钮的选中状态
        document.querySelectorAll('.time-range-toggle .btn-time-range').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 高亮显示自定义日期按钮
        document.querySelector('.btn-custom-date').classList.add('active');
        
        // 加载数据并关闭模态框
        loadHealthScoreData();
        hideCustomDateModal();
    });
}

// 显示自定义日期模态框
function showCustomDateModal() {
    const modal = document.getElementById('custom-date-modal');
    if (modal) {
        // 设置默认日期（如果未指定）
        const startDateInput = document.getElementById('custom-start-date');
        const endDateInput = document.getElementById('custom-end-date');
        
        if (!startDateInput.value || !endDateInput.value) {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 6);
            
            endDateInput.value = today.toISOString().split('T')[0];
            startDateInput.value = weekAgo.toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
    }
}

// 隐藏自定义日期模态框
function hideCustomDateModal() {
    const modal = document.getElementById('custom-date-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// =================================
// 数据生成和表格/图表更新功能
// =================================

// 生成模拟健康评分数据
function generateHealthScoreData() {
    const sites = [
        '清远储能电站', '广州储能电站', '深圳龙岗储能电站', '佛山南海电站',
        '东莞电站', '惠州储能电站', '肇庆储能电站', '韶关储能电站',
        '梅州储能电站', '湛江电站', '江门台山储能电站', '珠海储能电站'
    ];
    
    // 生成随机分数
    const getRandomScore = (base, variance) => {
        let score = base + Math.random() * variance - variance / 2;
        return Math.max(0, Math.min(100, Math.round(score)));
    };
    
    // 生成近7日的趋势数据
    const generateTrendData = (baseScore) => {
        let trend = [];
        for (let i = 0; i < 7; i++) {
            trend.push(getRandomScore(baseScore, 15));
        }
        return trend;
    };
    
    // 计算总评分并生成数据
    let healthData = sites.map(site => {
        // 各维度基础分数
        const baseStoppageScore = getRandomScore(85, 30);
        const baseAlarmScore = getRandomScore(82, 30);
        const baseSohScore = getRandomScore(88, 20);
        const baseTemperatureScore = getRandomScore(90, 25);
        const baseVoltageScore = getRandomScore(92, 20);
        
        // 各维度得分
        const stoppageScore = baseStoppageScore;
        const alarmScore = baseAlarmScore;
        const sohScore = baseSohScore;
        const temperatureScore = baseTemperatureScore;
        const voltageScore = baseVoltageScore;
        
        // 总评分 (加权平均)
        const totalScore = Math.round(
            stoppageScore * 0.2 + 
            alarmScore * 0.2 + 
            sohScore * 0.2 + 
            temperatureScore * 0.2 + 
            voltageScore * 0.2
        );
        
        // 生成各维度的趋势数据
        return {
            site: site,
            totalScore: totalScore,
            stoppageScore: stoppageScore,
            alarmScore: alarmScore,
            sohScore: sohScore,
            temperatureScore: temperatureScore,
            voltageScore: voltageScore,
            trend: generateTrendData(totalScore),
            stoppageTrend: generateTrendData(stoppageScore),
            alarmTrend: generateTrendData(alarmScore),
            sohTrend: generateTrendData(sohScore),
            temperatureTrend: generateTrendData(temperatureScore),
            voltageTrend: generateTrendData(voltageScore),
        };
    });
    
    // 根据搜索条件筛选
    if (currentFilter.searchTerm) {
        const searchTerm = currentFilter.searchTerm.toLowerCase();
        healthData = healthData.filter(data => data.site.toLowerCase().includes(searchTerm));
    }
    
    // 排序
    healthData.sort((a, b) => {
        const fieldA = a[currentFilter.sortField];
        const fieldB = b[currentFilter.sortField];
        
        if (currentFilter.sortOrder === 'asc') {
            return fieldA - fieldB;
        } else {
            return fieldB - fieldA;
        }
    });
    
    return healthData;
}

// 初始化评分概览部分
function initScoreOverviewSection() {
    console.log("初始化评分概览部分");
    
    // 初始化图表
    const chartContainer = document.getElementById('health-score-chart');
    if (chartContainer) {
        charts.overviewChart = echarts.init(chartContainer);
    }
    
    // 绑定表格排序事件
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            
            // 更新排序
            if (currentFilter.sortField === field) {
                // 如果点击当前排序列，则切换排序顺序
                currentFilter.sortOrder = currentFilter.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // 如果点击新列，则设置为该列降序
                currentFilter.sortField = field;
                currentFilter.sortOrder = 'desc';
            }
            
            // 更新排序图标
            sortableHeaders.forEach(h => {
                h.classList.remove('sorted-asc', 'sorted-desc');
                const icon = h.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-sort'; // 重置为默认图标
                }
            });
            
            // 重新加载数据
            loadHealthScoreData();
        });
    });
    
    // 绑定分页事件
    const pageBtns = document.querySelectorAll('.btn-page');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            
            if (page === 'prev' && currentFilter.currentPage > 1) {
                currentFilter.currentPage--;
            } else if (page === 'next' && currentFilter.currentPage < getTotalPages()) {
                currentFilter.currentPage++;
            }
            
            updatePagination();
            loadHealthScoreData();
        });
    });
    
    // 切换视图按钮
    const toggleViewBtn = document.querySelector('#score-overview-section .btn-toggle-view');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            const tableContainer = document.getElementById('health-score-table');
            const chartContainer = document.getElementById('health-score-chart');
            
            if (tableContainer.style.display === 'none') {
                // 切换到表格视图
                tableContainer.style.display = '';
                chartContainer.style.display = 'none';
                toggleViewBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
                toggleViewBtn.title = '切换到图表视图';
            } else {
                // 切换到图表视图
                tableContainer.style.display = 'none';
                chartContainer.style.display = '';
                toggleViewBtn.innerHTML = '<i class="fas fa-table"></i>';
                toggleViewBtn.title = '切换到表格视图';
                
                // 图表可能需要重绘
                if (charts.overviewChart) {
                    charts.overviewChart.resize();
                }
            }
        });
    }
    
    // 展开/收起按钮
    const expandCollapseBtn = document.querySelector('#score-overview-section .btn-expand-collapse');
    if (expandCollapseBtn) {
        expandCollapseBtn.addEventListener('click', () => {
            const sectionContent = document.querySelector('#score-overview-section .section-content');
            
            if (sectionContent.style.display === 'none') {
                // 展开
                sectionContent.style.display = '';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                expandCollapseBtn.title = '收起';
            } else {
                // 收起
                sectionContent.style.display = 'none';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                expandCollapseBtn.title = '展开';
            }
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.querySelector('#score-overview-section .btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadHealthScoreData();
        });
    }
}

// 更新分页器
function updatePagination() {
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const prevBtn = document.querySelector('.btn-page[data-page="prev"]');
    const nextBtn = document.querySelector('.btn-page[data-page="next"]');
    
    if (currentPageEl && totalPagesEl) {
        const totalPages = getTotalPages();
        
        currentPageEl.textContent = currentFilter.currentPage;
        totalPagesEl.textContent = totalPages;
        
        // 更新按钮状态
        if (prevBtn) {
            prevBtn.classList.toggle('disabled', currentFilter.currentPage <= 1);
        }
        
        if (nextBtn) {
            nextBtn.classList.toggle('disabled', currentFilter.currentPage >= totalPages);
        }
    }
}

// 获取总页数
function getTotalPages() {
    // 模拟固定为5页，实际应用中应根据数据总量计算
    return 5;
}

// 更新概览表格
function updateOverviewTable(data) {
    console.log("更新概览表格");
    
    const tableContainer = document.getElementById('health-score-table');
    if (!tableContainer) return;
    
    // 计算分页数据
    const startIndex = (currentFilter.currentPage - 1) * currentFilter.pageSize;
    const endIndex = startIndex + currentFilter.pageSize;
    const pageData = data.slice(startIndex, endIndex);
    
    // 生成表格内容
    const tbody = tableContainer.querySelector('tbody');
    if (tbody) {
        let html = '';
        
        if (pageData.length === 0) {
            html = `<tr><td colspan="8" class="text-center">暂无数据</td></tr>`;
        } else {
            pageData.forEach(site => {
                // 计算趋势图标
                const trend = site.trend; // 修改：使用正确的属性名 trend
                const lastIdx = trend.length - 1; // 使用修改后的变量
                const trendIcon = trend[lastIdx] > trend[0]
                    ? '<i class="fas fa-arrow-up" style="color: var(--success-color);"></i>'
                    : trend[lastIdx] < trend[0]
                        ? '<i class="fas fa-arrow-down" style="color: var(--danger-color);"></i>'
                        : '<i class="fas fa-minus" style="color: var(--warning-color);"></i>';
                
                // 生成进度条颜色类
                const getScoreColorClass = (score) => {
                    return score >= 80 ? 'score-high' : (score >= 60 ? 'score-medium' : 'score-low');
                };
                
                html += `
                    <tr>
                        <td>${site.site}</td>
                        <td>
                            <div>${site.totalScore}</div>
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.totalScore)}" style="width: ${site.totalScore}%;"></div>
                            </div>
                        </td>
                        <td style="${!currentFilter.visibleDimensions.includes('stoppage') ? 'display: none;' : ''}">
                            ${site.stoppageScore}
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.stoppageScore)}" style="width: ${site.stoppageScore}%;"></div>
                            </div>
                        </td>
                        <td style="${!currentFilter.visibleDimensions.includes('alarm') ? 'display: none;' : ''}">
                            ${site.alarmScore}
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.alarmScore)}" style="width: ${site.alarmScore}%;"></div>
                            </div>
                        </td>
                        <td style="${!currentFilter.visibleDimensions.includes('soh') ? 'display: none;' : ''}">
                            ${site.sohScore}
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.sohScore)}" style="width: ${site.sohScore}%;"></div>
                            </div>
                        </td>
                        <td style="${!currentFilter.visibleDimensions.includes('temperature') ? 'display: none;' : ''}">
                            ${site.temperatureScore}
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.temperatureScore)}" style="width: ${site.temperatureScore}%;"></div>
                            </div>
                        </td>
                        <td style="${!currentFilter.visibleDimensions.includes('voltage') ? 'display: none;' : ''}">
                            ${site.voltageScore}
                            <div class="score-progress">
                                <div class="score-progress-fill ${getScoreColorClass(site.voltageScore)}" style="width: ${site.voltageScore}%;"></div>
                            </div>
                        </td>
                        <td class="mini-chart-cell">
                            <div class="mini-chart" id="trend-mini-${startIndex + pageData.indexOf(site)}"></div>
                            ${trendIcon}
                        </td>
                        <td>
                            <button class="action-btn view-detail-btn" data-site="${site.site}">查看详情</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        tbody.innerHTML = html;
        
        // 更新分页
        updatePagination();
        
        // 渲染迷你趋势图
        pageData.forEach((site, index) => {
            const chartContainer = document.getElementById(`trend-mini-${startIndex + index}`);
            if (chartContainer) {
                const miniChart = echarts.init(chartContainer);
                const option = {
                    animation: false,
                    grid: {
                        top: 2,
                        right: 2,
                        bottom: 2,
                        left: 2
                    },
                    xAxis: {
                        type: 'category',
                        show: false,
                        data: [1, 2, 3, 4, 5, 6, 7]
                    },
                    yAxis: {
                        type: 'value',
                        show: false,
                        min: 50,
                        max: 100
                    },
                    series: [{
                        data: site.trend,
                        type: 'line',
                        showSymbol: false,
                        lineStyle: {
                            width: 2,
                            color: 'var(--primary-color)'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                    { offset: 0, color: 'rgba(75, 161, 141, 0.3)' },
                                    { offset: 1, color: 'rgba(75, 161, 141, 0)' }
                                ]
                            }
                        }
                    }]
                };
                miniChart.setOption(option);
            }
        });
        
        // 绑定详情按钮点击事件
        const detailBtns = tableContainer.querySelectorAll('.view-detail-btn');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const siteName = btn.dataset.site;
                const siteData = pageData.find(site => site.site === siteName);
                if (siteData) {
                    showDetailModal(siteData);
                }
            });
        });
    }
}

// 更新概览图表
function updateOverviewChart(data) {
    console.log("更新概览图表");
    
    if (!charts.overviewChart) return;
    
    // 按得分排序并取前15个站点（或全部，如果不足15个）
    const chartData = [...data]
        .sort((a, b) => currentFilter.sortOrder === 'desc' ? 
            b[currentFilter.sortField] - a[currentFilter.sortField] : 
            a[currentFilter.sortField] - b[currentFilter.sortField])
        .slice(0, 15);
    
    // 不同指标的颜色
    const colorMap = {
        totalScore: '#49A18D',
        stoppageScore: '#4CAF50',
        alarmScore: '#E74C3C',
        sohScore: '#F39C12',
        temperatureScore: '#3498DB',
        voltageScore: '#2ECC71'
    };
    
    // 构建图表配置
    const option = {
        title: {
            text: `站点健康评分 (${getDisplayTimeRangeText(currentFilter.timeRange, currentFilter.startDate, currentFilter.endDate)})`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const param = params[0];
                const site = chartData[param.dataIndex];
                let html = `<div style="font-weight:bold;margin-bottom:5px;">${site.site}</div>`;
                html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.totalScore};"></span>综合评分: ${site.totalScore}</div>`;
                
                if (currentFilter.visibleDimensions.includes('stoppage')) {
                    html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.stoppageScore};"></span>停机得分: ${site.stoppageScore}</div>`;
                }
                if (currentFilter.visibleDimensions.includes('alarm')) {
                    html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.alarmScore};"></span>告警得分: ${site.alarmScore}</div>`;
                }
                if (currentFilter.visibleDimensions.includes('soh')) {
                    html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.sohScore};"></span>电池SOH: ${site.sohScore}</div>`;
                }
                if (currentFilter.visibleDimensions.includes('temperature')) {
                    html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.temperatureScore};"></span>温度一致性: ${site.temperatureScore}</div>`;
                }
                if (currentFilter.visibleDimensions.includes('voltage')) {
                    html += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${colorMap.voltageScore};"></span>电压一致性: ${site.voltageScore}</div>`;
                }
                
                return html;
            }
        },
        legend: {
            data: ['综合评分'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: chartData.map(site => site.site),
            axisLabel: {
                interval: 0,
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '评分',
            min: 50,
            max: 100,
            axisLabel: {
                formatter: '{value} 分'
            }
        },
        series: [
            {
                name: '综合评分',
                type: 'bar',
                barMaxWidth: 40,
                data: chartData.map(site => ({
                    value: site.totalScore,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#6FB3A8' },
                            { offset: 1, color: '#49A18D' }
                        ])
                    }
                })),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 10
                }
            }
        ]
    };
    
    // 添加各维度得分的系列（如果选中）
    if (currentFilter.visibleDimensions.includes('stoppage')) {
        option.series.push({
            name: '停机得分',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: chartData.map(site => site.stoppageScore),
            itemStyle: { color: colorMap.stoppageScore }
        });
        option.legend.data.push('停机得分');
    }
    
    if (currentFilter.visibleDimensions.includes('alarm')) {
        option.series.push({
            name: '告警得分',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: chartData.map(site => site.alarmScore),
            itemStyle: { color: colorMap.alarmScore }
        });
        option.legend.data.push('告警得分');
    }
    
    if (currentFilter.visibleDimensions.includes('soh')) {
        option.series.push({
            name: '电池SOH',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: chartData.map(site => site.sohScore),
            itemStyle: { color: colorMap.sohScore }
        });
        option.legend.data.push('电池SOH');
    }
    
    if (currentFilter.visibleDimensions.includes('temperature')) {
        option.series.push({
            name: '温度一致性',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: chartData.map(site => site.temperatureScore),
            itemStyle: { color: colorMap.temperatureScore }
        });
        option.legend.data.push('温度一致性');
    }
    
    if (currentFilter.visibleDimensions.includes('voltage')) {
        option.series.push({
            name: '电压一致性',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: chartData.map(site => site.voltageScore),
            itemStyle: { color: colorMap.voltageScore }
        });
        option.legend.data.push('电压一致性');
    }
    
    charts.overviewChart.setOption(option, true);
}

// 初始化评分维度分布部分
function initScoreDimensionSection() {
    console.log("初始化评分维度分布部分");
    
    // 初始化图表
    const chartContainer = document.getElementById('dimension-chart');
    if (chartContainer) {
        charts.dimensionChart = echarts.init(chartContainer);
    }
    
    // 切换维度标签页
    const dimensionTabs = document.querySelectorAll('.dimension-tab');
    dimensionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const dimension = tab.dataset.dimension;
            
            // 更新标签页激活状态
            dimensionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新当前维度
            currentFilter.activeDimension = dimension;
            
            // 重新加载维度图表
            const data = generateHealthScoreData();
            updateDimensionChart(data, dimension);
        });
    });
    
    // 切换图表类型
    const chartTypeBtns = document.querySelectorAll('.chart-type-toggle .btn-chart-type');
    chartTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const chartType = btn.dataset.type;
            
            // 更新按钮激活状态
            chartTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新当前图表类型
            currentFilter.chartType = chartType;
            
            // 切换表格/图表视图
            const chartContainer = document.getElementById('dimension-chart');
            const tableContainer = document.getElementById('dimension-table');
            
            if (chartType === 'table') {
                // 切换到表格视图
                chartContainer.style.display = 'none';
                tableContainer.style.display = '';
                updateDimensionTable(generateHealthScoreData(), currentFilter.activeDimension);
            } else {
                // 切换到图表视图
                chartContainer.style.display = '';
                tableContainer.style.display = 'none';
                
                // 重新加载图表
                const data = generateHealthScoreData();
                updateDimensionChart(data, currentFilter.activeDimension);
            }
        });
    });
    
    // 展开/收起按钮
    const expandCollapseBtn = document.querySelector('#score-dimension-section .btn-expand-collapse');
    if (expandCollapseBtn) {
        expandCollapseBtn.addEventListener('click', () => {
            const sectionContent = document.querySelector('#score-dimension-section .section-content');
            
            if (sectionContent.style.display === 'none') {
                // 展开
                sectionContent.style.display = '';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                expandCollapseBtn.title = '收起';
                
                // 可能需要重绘图表
                if (currentFilter.chartType !== 'table' && charts.dimensionChart) {
                    charts.dimensionChart.resize();
                }
            } else {
                // 收起
                sectionContent.style.display = 'none';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                expandCollapseBtn.title = '展开';
            }
        });
    }
}

// 更新维度分布图表
function updateDimensionChart(data, dimension) {
    console.log(`更新维度分布图表: ${dimension}, 类型: ${currentFilter.chartType}`);
    
    if (!charts.dimensionChart) return;
    
    // 无数据时显示
    if (data.length === 0) {
        charts.dimensionChart.setOption({
            title: { text: '暂无数据', left: 'center', top: 'center' }
        });
        return;
    }
    
    // 从维度ID获取维度名称
    const getDimensionName = (dim) => {
        switch (dim) {
            case 'stoppage': return '非计划停机得分';
            case 'alarm': return '告警得分';
            case 'soh': return '电池SOH';
            case 'temperature': return '温度一致性';
            case 'voltage': return '电压一致性';
            default: return '综合评分';
        }
    };
    
    // 获取当前维度的分数字段
    const scoreField = dimension === 'total' ? 'totalScore' : `${dimension}Score`;
    
    // 根据图表类型生成不同的配置
    let option;
    
    switch (currentFilter.chartType) {
        case 'bar':
            // 柱状图：按得分排序展示所有站点的该维度得分
            option = {
                title: {
                    text: `${getDimensionName(dimension)} - 站点分布`,
                    left: 'center',
                    textStyle: { fontSize: 16 }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: [...data].sort((a, b) => b[scoreField] - a[scoreField]).map(site => site.site),
                    axisLabel: {
                        interval: 0,
                        rotate: 30,
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '评分',
                    min: 50,
                    max: 100
                },
                series: [
                    {
                        name: getDimensionName(dimension),
                        type: 'bar',
                        barMaxWidth: 40,
                        data: [...data].sort((a, b) => b[scoreField] - a[scoreField]).map(site => ({
                            value: site[scoreField],
                            itemStyle: {
                                color: site[scoreField] >= 80 ? '#4CAF50' : (site[scoreField] >= 60 ? '#FFC107' : '#F44336')
                            }
                        }))
                    }
                ]
            };
            break;
        
        case 'line':
            // 折线图：按站点名称字母顺序排列，展示趋势
            option = {
                title: {
                    text: `${getDimensionName(dimension)} - 趋势分布`,
                    left: 'center',
                    textStyle: { fontSize: 16 }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'line' }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: [...data].sort((a, b) => a.site.localeCompare(b.site)).map(site => site.site),
                    axisLabel: {
                        interval: 0,
                        rotate: 30,
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '评分',
                    min: 50,
                    max: 100
                },
                series: [
                    {
                        name: getDimensionName(dimension),
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        data: [...data].sort((a, b) => a.site.localeCompare(b.site)).map(site => site[scoreField]),
                        itemStyle: {
                            color: '#49A18D'
                        },
                        lineStyle: {
                            width: 3,
                            color: '#49A18D'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                    { offset: 0, color: 'rgba(73, 161, 141, 0.3)' },
                                    { offset: 1, color: 'rgba(73, 161, 141, 0)' }
                                ]
                            }
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ],
                            label: {
                                formatter: '平均值: {c}'
                            }
                        }
                    }
                ]
            };
            break;
        
        case 'heatmap':
            // 热力图：站点名称×得分区间的分布
            const scoreRanges = ['90-100', '80-90', '70-80', '60-70', '50-60'];
            const heatmapData = [];
            
            // 统计各得分区间的站点数量
            data.forEach(site => {
                const score = site[scoreField];
                let rangeIndex;
                
                if (score >= 90) rangeIndex = 0;
                else if (score >= 80) rangeIndex = 1;
                else if (score >= 70) rangeIndex = 2;
                else if (score >= 60) rangeIndex = 3;
                else rangeIndex = 4;
                
                heatmapData.push([rangeIndex, 0, 1]); // [y轴索引, x轴索引（固定为0）, 值]
            });
            
            // 合并相同区间的数据
            const mergedData = [];
            scoreRanges.forEach((_, index) => {
                const count = heatmapData.filter(item => item[0] === index).length;
                if (count > 0) {
                    mergedData.push([index, 0, count]);
                }
            });
            
            option = {
                title: {
                    text: `${getDimensionName(dimension)} - 评分热力分布`,
                    left: 'center',
                    textStyle: { fontSize: 16 }
                },
                tooltip: {
                    formatter: function(params) {
                        return `${scoreRanges[params.data[0]]}分: ${params.data[2]}个站点`;
                    }
                },
                grid: {
                    left: '15%',
                    right: '10%',
                    top: '15%',
                    bottom: '10%'
                },
                xAxis: {
                    type: 'category',
                    data: ['站点数量'],
                    splitArea: { show: true }
                },
                yAxis: {
                    type: 'category',
                    data: scoreRanges,
                    splitArea: { show: true }
                },
                visualMap: {
                    min: 0,
                    max: Math.max(...mergedData.map(item => item[2])),
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%',
                    inRange: {
                        color: ['#e0f5f0', '#49A18D']
                    }
                },
                series: [
                    {
                        name: getDimensionName(dimension),
                        type: 'heatmap',
                        data: mergedData,
                        label: {
                            show: true,
                            formatter: function(params) {
                                return params.data[2];
                            }
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            break;
        
        default:
            // 默认为柱状图
            option = {
                title: {
                    text: `${getDimensionName(dimension)} - 站点分布`,
                    left: 'center'
                },
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: data.map(site => site.site)
                },
                yAxis: { type: 'value' },
                series: [
                    {
                        name: getDimensionName(dimension),
                        type: 'bar',
                        data: data.map(site => site[scoreField])
                    }
                ]
            };
    }
    
    charts.dimensionChart.setOption(option, true);
}

// 更新维度表格
function updateDimensionTable(data, dimension) {
    console.log(`更新维度表格: ${dimension}`);
    
    const tableContainer = document.getElementById('dimension-table');
    if (!tableContainer) return;
    
    // 从维度ID获取维度名称
    const getDimensionName = (dim) => {
        switch (dim) {
            case 'stoppage': return '非计划停机得分';
            case 'alarm': return '告警得分';
            case 'soh': return '电池SOH';
            case 'temperature': return '温度一致性';
            case 'voltage': return '电压一致性';
            default: return '综合评分';
        }
    };
    
    // 获取当前维度的分数字段
    const scoreField = dimension === 'total' ? 'totalScore' : `${dimension}Score`;
    
    // 排序数据
    const sortedData = [...data].sort((a, b) => b[scoreField] - a[scoreField]);
    
    // 分页处理
    const pageSize = 10;  // 每页显示10条数据
    const totalPages = Math.ceil(sortedData.length / pageSize);
    let currentPage = 1;
    
    // 生成表格主体
    const generateTableBody = (page) => {
        const start = (page - 1) * pageSize;
        const end = Math.min(start + pageSize, sortedData.length);
        const pageData = sortedData.slice(start, end);
        
        let tbody = '';
        pageData.forEach((site, index) => {
            const actualIndex = start + index + 1;  // 实际排名
            const score = site[scoreField];
            const status = score >= 80 ? '优秀' : (score >= 60 ? '良好' : '需关注');
            const statusColor = score >= 80 ? 'var(--success-color)' : (score >= 60 ? 'var(--warning-color)' : 'var(--danger-color)');
            
            tbody += `
                <tr>
                    <td>${actualIndex}</td>
                    <td>${site.site}</td>
                    <td>
                        ${score}
                        <div class="score-progress">
                            <div class="score-progress-fill ${score >= 80 ? 'score-high' : (score >= 60 ? 'score-medium' : 'score-low')}" style="width: ${score}%;"></div>
                        </div>
                    </td>
                    <td><span style="color: ${statusColor};">${status}</span></td>
                    <td>
                        <button class="action-btn view-detail-btn" data-site="${site.site}">查看详情</button>
                    </td>
                </tr>
            `;
        });
        
        return tbody;
    };
    
    // 生成表格
    let html = `
        <div class="table-controls">
            <div class="search-box">
                <input type="text" id="dimension-table-search" placeholder="输入站点名称搜索...">
                <button class="btn btn-search"><i class="fas fa-search"></i></button>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>排名</th>
                    <th>站点名称</th>
                    <th>${getDimensionName(dimension)}</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="dimension-table-body">
                ${generateTableBody(currentPage)}
            </tbody>
        </table>
        <div class="pagination">
            <button class="btn btn-page" id="dimension-prev-page" data-page="prev"><i class="fas fa-chevron-left"></i></button>
            <span class="page-info">第 <span id="dimension-current-page">1</span> 页，共 <span id="dimension-total-pages">${totalPages}</span> 页</span>
            <button class="btn btn-page" id="dimension-next-page" data-page="next"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;
    
    tableContainer.innerHTML = html;
    
    // 添加分页事件处理
    const prevBtn = document.getElementById('dimension-prev-page');
    const nextBtn = document.getElementById('dimension-next-page');
    const currentPageEl = document.getElementById('dimension-current-page');
    
    // 分页按钮状态更新
    const updatePaginationState = () => {
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        prevBtn.classList.toggle('disabled', currentPage <= 1);
        nextBtn.classList.toggle('disabled', currentPage >= totalPages);
        currentPageEl.textContent = currentPage;
    };
    
    updatePaginationState();
    
    // 上一页
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('dimension-table-body').innerHTML = generateTableBody(currentPage);
            updatePaginationState();
            bindDetailButtons();
        }
    });
    
    // 下一页
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            document.getElementById('dimension-table-body').innerHTML = generateTableBody(currentPage);
            updatePaginationState();
            bindDetailButtons();
        }
    });
    
    // 搜索功能
    const searchInput = document.getElementById('dimension-table-search');
    const searchBtn = document.querySelector('#dimension-table .btn-search');
    
    const performSearch = () => {
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword) {
            const filteredData = sortedData.filter(site => 
                site.site.toLowerCase().includes(keyword)
            );
            
            if (filteredData.length > 0) {
                document.getElementById('dimension-table-body').innerHTML = generateFilteredTableBody(filteredData);
                document.getElementById('dimension-total-pages').textContent = '1';
                currentPageEl.textContent = '1';
                prevBtn.classList.add('disabled');
                nextBtn.classList.add('disabled');
            } else {
                document.getElementById('dimension-table-body').innerHTML = '<tr><td colspan="5" class="text-center">未找到匹配的站点</td></tr>';
                document.getElementById('dimension-total-pages').textContent = '1';
                currentPageEl.textContent = '1';
                prevBtn.classList.add('disabled');
                nextBtn.classList.add('disabled');
            }
        } else {
            // 重置为第一页
            currentPage = 1;
            document.getElementById('dimension-table-body').innerHTML = generateTableBody(currentPage);
            document.getElementById('dimension-total-pages').textContent = totalPages;
            updatePaginationState();
        }
        bindDetailButtons();
    };
    
    // 生成过滤后的表格内容（不分页）
    const generateFilteredTableBody = (filteredData) => {
        let tbody = '';
        filteredData.forEach((site, index) => {
            const score = site[scoreField];
            const status = score >= 80 ? '优秀' : (score >= 60 ? '良好' : '需关注');
            const statusColor = score >= 80 ? 'var(--success-color)' : (score >= 60 ? 'var(--warning-color)' : 'var(--danger-color)');
            
            tbody += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${site.site}</td>
                    <td>
                        ${score}
                        <div class="score-progress">
                            <div class="score-progress-fill ${score >= 80 ? 'score-high' : (score >= 60 ? 'score-medium' : 'score-low')}" style="width: ${score}%;"></div>
                        </div>
                    </td>
                    <td><span style="color: ${statusColor};">${status}</span></td>
                    <td>
                        <button class="action-btn view-detail-btn" data-site="${site.site}">查看详情</button>
                    </td>
                </tr>
            `;
        });
        return tbody;
    };
    
    // 搜索按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 搜索输入框回车事件
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 绑定详情按钮点击事件
    function bindDetailButtons() {
        const detailBtns = tableContainer.querySelectorAll('.view-detail-btn');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const siteName = btn.dataset.site;
                const siteData = sortedData.find(site => site.site === siteName);
                if (siteData) {
                    showDetailModal(siteData);
                }
            });
        });
    }
    
    // 初始绑定详情按钮
    bindDetailButtons();
}

// 初始化评分解释部分
function initExplanationSection() {
    console.log("初始化评分解释部分");
    
    // 展开/收起按钮
    const expandCollapseBtn = document.querySelector('#score-explanation-section .btn-expand-collapse');
    if (expandCollapseBtn) {
        expandCollapseBtn.addEventListener('click', () => {
            const sectionContent = document.querySelector('#score-explanation-section .section-content');
            
            if (sectionContent.style.display === 'none') {
                // 展开
                sectionContent.style.display = '';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                expandCollapseBtn.title = '收起';
            } else {
                // 收起
                sectionContent.style.display = 'none';
                expandCollapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                expandCollapseBtn.title = '展开';
            }
        });
    }
}

// 初始化详情模态框
function initDetailModal() {
    console.log("初始化详情模态框");
    
    const modal = document.getElementById('score-detail-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const closeFooterBtn = modal.querySelector('.btn-close');
    
    if (!modal || !closeBtn) {
        console.error("详情模态框元素未找到");
        return;
    }
    
    // 关闭按钮事件
    closeBtn.addEventListener('click', hideDetailModal);
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', hideDetailModal);
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideDetailModal();
        }
    });
    
    // 初始化图表
    const trendChartEl = document.getElementById('trend-chart');
    const stoppageChartEl = document.getElementById('stoppage-chart');
    const alarmChartEl = document.getElementById('alarm-chart');
    const revenueChartEl = document.getElementById('revenue-chart');
    const energyChartEl = document.getElementById('energy-chart');
    const sohChartEl = document.getElementById('soh-chart');
    const temperatureChartEl = document.getElementById('temperature-chart');
    const voltageChartEl = document.getElementById('voltage-chart');
    
    if (trendChartEl) charts.trendChart = echarts.init(trendChartEl);
    if (stoppageChartEl) charts.stoppageChart = echarts.init(stoppageChartEl);
    if (alarmChartEl) charts.alarmChart = echarts.init(alarmChartEl);
    if (revenueChartEl) charts.revenueChart = echarts.init(revenueChartEl);
    if (energyChartEl) charts.energyChart = echarts.init(energyChartEl);
    if (sohChartEl) charts.sohChart = echarts.init(sohChartEl);
    if (temperatureChartEl) charts.temperatureChart = echarts.init(temperatureChartEl);
    if (voltageChartEl) charts.voltageChart = echarts.init(voltageChartEl);
    
    // 初始化标签页切换功能
    const tabBtns = modal.querySelectorAll('.detail-tab');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新标签激活状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新内容显示
            const tabName = btn.dataset.tab;
            const tabPanes = modal.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            const activePane = document.getElementById(`${tabName}-tab-pane`);
            if (activePane) activePane.classList.add('active');
            
            // 可能需要重绘图表
            const chartName = `${tabName}Chart`;
            if (charts[chartName]) {
                charts[chartName].resize();
            }
        });
    });
    
    // 初始化导出按钮
    const exportBtn = modal.querySelector('.btn-export-detail');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('导出详情报告功能即将实现，敬请期待！');
        });
    }
}

// 显示详情模态框
function showDetailModal(siteData) {
    console.log("显示详情模态框:", siteData);
    
    const modal = document.getElementById('score-detail-modal');
    if (!modal) return;
    
    // 设置站点名称
    const siteNameEl = document.getElementById('modal-site-name');
    if (siteNameEl) siteNameEl.textContent = `${siteData.site} - 评分详情`;
    
    // 设置总分
    const totalScoreEl = document.getElementById('modal-total-score');
    if (totalScoreEl) totalScoreEl.textContent = siteData.totalScore;
    
    // 设置各维度分数和进度条
    updateDetailScoreBar('stoppage', siteData.stoppageScore);
    updateDetailScoreBar('alarm', siteData.alarmScore);
    updateDetailScoreBar('soh', siteData.sohScore);
    updateDetailScoreBar('temperature', siteData.temperatureScore);
    updateDetailScoreBar('voltage', siteData.voltageScore);
    
    // 更新图表数据
    updateDetailCharts(siteData);
    
    // 显示模态框
    modal.classList.add('active');
}

// 隐藏详情模态框
function hideDetailModal() {
    const modal = document.getElementById('score-detail-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 更新详情模态框中的得分条
function updateDetailScoreBar(dimension, score) {
    const barEl = document.getElementById(`modal-${dimension}-bar`);
    const scoreEl = document.getElementById(`modal-${dimension}-score`);
    
    if (barEl) {
        barEl.style.width = `${score}%`;
        barEl.className = 'dimension-score-fill';
        if (score >= 80) barEl.classList.add('score-high');
        else if (score >= 60) barEl.classList.add('score-medium');
        else barEl.classList.add('score-low');
    }
    
    if (scoreEl) {
        scoreEl.textContent = score;
    }
}

// 更新详情模态框中的图表
function updateDetailCharts(siteData) {
    console.log("更新详情模态框图表");
    
    // 时间范围
    const timeRangeText = getDisplayTimeRangeText(currentFilter.timeRange, currentFilter.startDate, currentFilter.endDate);
    
    // 生成X轴日期标签（假设是近7日数据）
    const xAxisLabels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        xAxisLabels.push(`${month}-${day}`);
    }
    
    // 更新趋势图表
    if (charts.trendChart) {
        const option = {
            title: {
                text: `健康评分趋势 (${timeRangeText})`,
                left: 'center',
                textStyle: { fontSize: 14 }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: ['总评分', '停机率', '告警', '电池SOH', '温度一致性', '电压一致性'],
                bottom: 5, // 修改：将图例移到底部
                type: 'scroll' // 修改：如果图例过多，允许滚动
                // right: 10, // 移除之前的配置
                // top: 5,
                // textStyle: { fontSize: 12 }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%', // 修改：为底部的图例留出更多空间
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: xAxisLabels
            },
            yAxis: {
                type: 'value',
                name: '评分',
                min: 50,
                max: 100
            },
            series: [
                {
                    name: '总评分',
                    type: 'line',
                    data: siteData.trend,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: { color: '#49A18D' },
                    lineStyle: { width: 3 }
                },
                {
                    name: '停机率',
                    type: 'line',
                    data: siteData.stoppageTrend,
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: '#4CAF50' }
                },
                {
                    name: '告警',
                    type: 'line',
                    data: siteData.alarmTrend,
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: '#E74C3C' }
                },
                {
                    name: '电池SOH',
                    type: 'line',
                    data: siteData.sohTrend,
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: '#722ed1' }
                },
                {
                    name: '温度一致性',
                    type: 'line',
                    data: siteData.temperatureTrend,
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: '#eb2f96' }
                },
                {
                    name: '电压一致性',
                    type: 'line',
                    data: siteData.voltageTrend,
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: '#52c41a' }
                }
            ]
        };
        charts.trendChart.setOption(option, true);
    }
    
    // 生成示例异常事件
    generateAnomalyEvents(siteData);
    
    // 更新其他图表
    updateStoppageChart(siteData);
    updateAlarmChart(siteData);
    updateRevenueChart(siteData);
    updateEnergyChart(siteData);
    updateSohChart(siteData);
    updateTemperatureChart(siteData);
    updateVoltageChart(siteData);
}

// 生成异常事件列表
function generateAnomalyEvents(siteData) {
    console.log("生成异常事件列表");
    
    const anomalyListEl = document.getElementById('anomaly-list');
    if (!anomalyListEl) return;
    
    // 模拟生成异常事件数据
    const events = [];
    
    // 根据各维度分数低于阈值来生成事件
    if (siteData.stoppageScore < 60) {
        events.push({
            type: 'stoppage',
            title: '非计划停机时长过高',
            time: '2023-06-20 14:30',
            impact: '降低停机得分 15 分'
        });
    }
    
    if (siteData.alarmScore < 70) {
        events.push({
            type: 'alarm',
            title: '关键告警未处理',
            time: '2023-06-22 09:15',
            impact: '降低告警得分 10 分'
        });
    }
    
    if (siteData.revenueScore < 65) {
        events.push({
            type: 'revenue',
            title: '日发电量低于预期',
            time: '2023-06-21 全天',
            impact: '降低收益得分 12 分'
        });
    }
    
    if (siteData.energyScore < 75) {
        events.push({
            type: 'energy',
            title: '能效比异常',
            time: '2023-06-19 - 2023-06-22',
            impact: '降低能耗得分 8 分'
        });
    }
    
    // 如果没有异常事件，添加一个默认信息
    if (events.length === 0) {
        anomalyListEl.innerHTML = '<div class="no-anomaly">该站点在选定时间范围内无异常事件</div>';
        return;
    }
    
    // 渲染异常事件列表
    let html = '';
    events.forEach(event => {
        const iconClass = event.type === 'stoppage' ? 'fa-pause-circle' :
                           event.type === 'alarm' ? 'fa-bell' :
                           event.type === 'revenue' ? 'fa-money-bill-wave' :
                           'fa-bolt';
        
        html += `
            <div class="anomaly-item ${event.type}-anomaly">
                <div class="anomaly-icon"><i class="fas ${iconClass}"></i></div>
                <div class="anomaly-content">
                    <div class="anomaly-title">${event.title}</div>
                    <div class="anomaly-time">${event.time}</div>
                    <div class="anomaly-impact">${event.impact}</div>
                </div>
            </div>
        `;
    });
    
    anomalyListEl.innerHTML = html;
}

// 更新停机详情图表
function updateStoppageChart(siteData) {
    if (!charts.stoppageChart) return;
    
    // 生成模拟的停机数据
    const generateStoppageData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的停机得分生成模拟数据
        // 分数越低，停机时间越长
        const maxHoursPerDay = 24;
        const baseDowntimePercent = (100 - siteData.stoppageScore) / 100; // 得分越低，停机率越高
        
        // 生成每日停机时长和停机次数
        const downtimeHours = [];
        const downtimeCount = [];
        
        for (let i = 0; i < 30; i++) {
            // 低分数的日子有更多的停机时间
            const randomFactor = Math.random() * 0.5 + 0.5; // 0.5 - 1.0
            const hours = Math.min(maxHoursPerDay, baseDowntimePercent * maxHoursPerDay * randomFactor);
            downtimeHours.push(parseFloat(hours.toFixed(1)));
            
            // 停机次数通常为1-3次
            const count = hours > 0 ? Math.ceil(Math.random() * 3) : 0;
            downtimeCount.push(count);
        }
        
        return { dates, downtimeHours, downtimeCount };
    };
    
    const stoppageData = generateStoppageData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 近30天停机情况`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === '停机时长') {
                        tooltip += `${param.seriesName}: ${param.value} 小时<br/>`;
                    } else if (param.seriesName === '停机次数') {
                        tooltip += `${param.seriesName}: ${param.value} 次<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['停机时长', '停机次数'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: stoppageData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '停机时长(小时)',
                min: 0,
                max: 24
            },
            {
                type: 'value',
                name: '停机次数',
                min: 0,
                max: 5,
                interval: 1,
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '停机时长',
                type: 'bar',
                data: stoppageData.downtimeHours,
                itemStyle: {
                    color: function(params) {
                        // 停机时间超过8小时标为红色
                        return params.data > 8 ? '#E74C3C' : '#4CAF50';
                    }
                }
            },
            {
                name: '停机次数',
                type: 'line',
                yAxisIndex: 1,
                data: stoppageData.downtimeCount,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: '#3498DB' }
            }
        ]
    };
    
    charts.stoppageChart.setOption(option, true);
    
    // 生成并更新停机详情表格
    updateStoppageTable(siteData, stoppageData);
}

// 更新停机详情表格
function updateStoppageTable(siteData, stoppageData) {
    const tableContainer = document.getElementById('stoppage-table');
    if (!tableContainer) return;
    
    // 筛选有停机记录的日期
    const stoppageRecords = [];
    for (let i = 0; i < stoppageData.dates.length; i++) {
        if (stoppageData.downtimeHours[i] > 0) {
            stoppageRecords.push({
                date: stoppageData.dates[i],
                hours: stoppageData.downtimeHours[i],
                count: stoppageData.downtimeCount[i]
            });
        }
    }
    
    // 对停机记录按时长降序排序
    stoppageRecords.sort((a, b) => b.hours - a.hours);
    
    // 生成表格HTML
    let html = `
        <h4>停机详情记录</h4>
        <table>
            <thead>
                <tr>
                    <th>日期</th>
                    <th>停机时长(小时)</th>
                    <th>停机次数</th>
                    <th>影响</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (stoppageRecords.length === 0) {
        html += `<tr><td colspan="4" class="text-center">近30天内无停机记录</td></tr>`;
    } else {
        stoppageRecords.forEach(record => {
            // 根据停机时长计算影响程度
            let impact = '';
            let impactClass = '';
            
            if (record.hours >= 12) {
                impact = '严重';
                impactClass = 'impact-severe';
            } else if (record.hours >= 4) {
                impact = '中等';
                impactClass = 'impact-medium';
            } else {
                impact = '轻微';
                impactClass = 'impact-light';
            }
            
            html += `
                <tr>
                    <td>${record.date}</td>
                    <td>${record.hours}</td>
                    <td>${record.count}</td>
                    <td><span class="${impactClass}">${impact}</span></td>
                </tr>
            `;
        });
    }
    
    html += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = html;
}

// 更新告警详情图表
function updateAlarmChart(siteData) {
    if (!charts.alarmChart) return;
    
    // 根据站点的告警得分生成模拟数据
    // 告警得分越低，告警数量越多
    const generateAlarmData = () => {
        const alarmTypes = ['故障告警', '设备警告', '连接中断', '性能降级', '配置错误'];
        const alarmLevels = ['严重', '重要', '次要', '提示'];
        
        // 基于站点得分计算告警数量
        const baseAlarmCount = Math.round((100 - siteData.alarmScore) * 0.5);
        
        // 按告警类型分布
        const alarmByType = alarmTypes.map(type => ({
            name: type,
            value: Math.round(baseAlarmCount * (Math.random() * 0.7 + 0.3))
        }));
        
        // 按告警级别分布
        const alarmByLevel = alarmLevels.map((level, index) => {
            // 告警得分越低，高级别告警越多
            let factor;
            switch(index) {
                case 0: factor = (100 - siteData.alarmScore) * 0.01; break; // 严重告警
                case 1: factor = (100 - siteData.alarmScore) * 0.008; break; // 重要告警
                case 2: factor = (100 - siteData.alarmScore) * 0.006; break; // 次要告警
                case 3: factor = (100 - siteData.alarmScore) * 0.004; break; // 提示告警
                default: factor = 0.005;
            }
            
            return {
                name: level,
                value: Math.max(0, Math.round(baseAlarmCount * factor * (Math.random() * 0.5 + 0.5)))
            };
        });
        
        // 生成30天内的告警趋势
        const dates = [];
        const alarmCounts = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
            
            // 随机生成每天的告警数
            const dailyCount = Math.max(0, Math.round((baseAlarmCount / 30) * (Math.random() * 2.5)));
            alarmCounts.push(dailyCount);
        }
        
        return {
            byType: alarmByType,
            byLevel: alarmByLevel,
            trend: { dates, counts: alarmCounts }
        };
    };
    
    const alarmData = generateAlarmData();
    
    // 创建告警图表 - 分成左右两个图表
    const option = {
        title: {
            text: `${siteData.site} - 近30天告警趋势`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis', // 改为 axis 触发，更适合柱状图
            axisPointer: { type: 'shadow' }, // 添加阴影指示器
            formatter: function(params) {
                // 只处理柱状图的 tooltip
                if (params[0] && params[0].componentSubType === 'bar') {
                    return `${params[0].name}<br/>${params[0].marker}${params[0].seriesName}: ${params[0].value}`;
                }
                return '';
            }
        },
        // legend: [ // 移除图例，因为只有一个系列
        //     {
        //         orient: 'vertical',
        //         right: 10,
        //         top: 'middle',
        //         data: alarmData.byLevel.map(item => item.name), // 告警级别图例
        //         textStyle: { fontSize: 12 }
        //     }
        // ],
        grid: {
            left: '3%', // 调整网格，使其更居中
            right: '4%',
            bottom: '10%', // 减少底部边距，因为没有图例了
            top: '15%', // 调整顶部边距
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: alarmData.trend.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '告警次数'
        },
        series: [
            // 移除饼图 series
            // {
            //     name: '告警级别分布',
            //     type: 'pie',
            //     ...
            // },
            {
                name: '告警趋势',
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: alarmData.trend.counts,
                itemStyle: {
                    color: '#3498DB'
                },
                barMaxWidth: 30 // 设置柱子最大宽度
            }
        ]
    };
    
    charts.alarmChart.setOption(option, true);
    
    // 移除调用 updateAlarmTable 的代码
    // updateAlarmTable(siteData, alarmData);
}

// 更新收益详情图表
function updateRevenueChart(siteData) {
    if (!charts.revenueChart) return;
    
    // 生成模拟的收益数据（基于站点的收益得分）
    const generateRevenueData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的收益得分生成收益数据
        // 分数越高，收益越好
        const baseRevenue = 5000 + (siteData.revenueScore - 50) * 100; // 基础日收益
        const randomFactor = 0.3; // 随机波动因子
        
        // 生成每日收益
        const dailyRevenue = [];
        const targetRevenue = []; // 目标收益线
        let totalRevenue = 0;
        
        for (let i = 0; i < 30; i++) {
            // 随机波动的日收益
            const random = Math.random() * randomFactor * 2 - randomFactor; // -randomFactor ~ +randomFactor
            const revenue = baseRevenue * (1 + random);
            dailyRevenue.push(parseFloat(revenue.toFixed(2)));
            
            // 目标收益线（固定值）
            targetRevenue.push(baseRevenue);
            
            // 累计总收益
            totalRevenue += revenue;
        }
        
        return { 
            dates, 
            dailyRevenue, 
            targetRevenue,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            averageRevenue: parseFloat((totalRevenue / 30).toFixed(2))
        };
    };
    
    const revenueData = generateRevenueData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 近30天收益情况`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === '日收益') {
                        tooltip += `${param.seriesName}: ${param.value} 元<br/>`;
                    } else if (param.seriesName === '目标收益') {
                        tooltip += `${param.seriesName}: ${param.value} 元<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['日收益', '目标收益'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: revenueData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '收益(元)'
        },
        series: [
            {
                name: '日收益',
                type: 'bar',
                data: revenueData.dailyRevenue,
                itemStyle: {
                    color: function(params) {
                        // 低于目标收益标为红色，高于目标标为绿色
                        return params.data < revenueData.targetRevenue[params.dataIndex] ? '#E74C3C' : '#2ECC71';
                    }
                }
            },
            {
                name: '目标收益',
                type: 'line',
                data: revenueData.targetRevenue,
                symbol: 'none',
                lineStyle: { 
                    width: 2,
                    type: 'dashed',
                    color: '#F39C12'
                }
            }
        ]
    };
    
    charts.revenueChart.setOption(option, true);
    
    // 更新收益详情表格
    updateRevenueTable(siteData, revenueData);
}

// 更新收益详情表格
function updateRevenueTable(siteData, revenueData) {
    const tableContainer = document.getElementById('revenue-table');
    if (!tableContainer) return;
    
    // 生成表格HTML
    let html = `
        <div class="revenue-summary">
            <div class="summary-item">
                <div class="summary-label">近30天总收益</div>
                <div class="summary-value">${revenueData.totalRevenue.toLocaleString()} 元</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">日均收益</div>
                <div class="summary-value">${revenueData.averageRevenue.toLocaleString()} 元</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">收益评分</div>
                <div class="summary-value">${siteData.revenueScore} 分</div>
            </div>
        </div>
        
        <h4>每日收益明细</h4>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>实际收益(元)</th>
                        <th>目标收益(元)</th>
                        <th>差异(%)</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加每日收益数据（展示最近10天）
    const recentDays = 10;
    for (let i = revenueData.dates.length - recentDays; i < revenueData.dates.length; i++) {
        const actual = revenueData.dailyRevenue[i];
        const target = revenueData.targetRevenue[i];
        const diff = ((actual - target) / target * 100).toFixed(2);
        const status = actual >= target ? '达标' : '未达标';
        const statusClass = actual >= target ? 'status-good' : 'status-bad';
        
        html += `
            <tr>
                <td>${revenueData.dates[i]}</td>
                <td>${actual.toLocaleString()}</td>
                <td>${target.toLocaleString()}</td>
                <td class="${diff >= 0 ? 'positive' : 'negative'}">${diff >= 0 ? '+' : ''}${diff}%</td>
                <td><span class="${statusClass}">${status}</span></td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="note">* 仅显示最近${recentDays}天数据</div>
    `;
    
    tableContainer.innerHTML = html;
}

// 更新能耗详情图表
function updateEnergyChart(siteData) {
    if (!charts.energyChart) return;
    
    // 生成模拟的能耗数据（基于站点的能耗得分）
    const generateEnergyData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的能耗得分生成能耗数据
        // 分数越高，能效越好（能耗越低）
        const baseConsumption = 1000 - (siteData.energyScore - 50) * 10; // 基础日能耗
        const randomFactor = 0.3; // 随机波动因子
        
        // 生成每日能耗
        const dailyConsumption = [];
        const targetConsumption = []; // 目标能耗线
        let totalConsumption = 0;
        
        for (let i = 0; i < 30; i++) {
            // 随机波动的日能耗
            const random = Math.random() * randomFactor * 2 - randomFactor; // -randomFactor ~ +randomFactor
            const consumption = baseConsumption * (1 + random);
            dailyConsumption.push(parseFloat(consumption.toFixed(2)));
            
            // 目标能耗线（固定值）
            targetConsumption.push(baseConsumption);
            
            // 累计总能耗
            totalConsumption += consumption;
        }
        
        return { 
            dates, 
            dailyConsumption, 
            targetConsumption,
            totalConsumption: parseFloat(totalConsumption.toFixed(2)),
            averageConsumption: parseFloat((totalConsumption / 30).toFixed(2))
        };
    };
    
    const energyData = generateEnergyData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 近30天能耗情况`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === '日能耗') {
                        tooltip += `${param.seriesName}: ${param.value} 度<br/>`;
                    } else if (param.seriesName === '目标能耗') {
                        tooltip += `${param.seriesName}: ${param.value} 度<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['日能耗', '目标能耗'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: energyData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '能耗(度)'
        },
        series: [
            {
                name: '日能耗',
                type: 'bar',
                data: energyData.dailyConsumption,
                itemStyle: {
                    color: function(params) {
                        // 低于目标能耗标为红色，高于目标标为绿色
                        return params.data < energyData.targetConsumption[params.dataIndex] ? '#E74C3C' : '#2ECC71';
                    }
                }
            },
            {
                name: '目标能耗',
                type: 'line',
                data: energyData.targetConsumption,
                symbol: 'none',
                lineStyle: { 
                    width: 2,
                    type: 'dashed',
                    color: '#F39C12'
                }
            }
        ]
    };
    
    charts.energyChart.setOption(option, true);
    
    // 更新能耗详情表格
    updateEnergyTable(siteData, energyData);
}

// 更新能耗详情表格
function updateEnergyTable(siteData, energyData) {
    const tableContainer = document.getElementById('energy-table');
    if (!tableContainer) return;
    
    // 生成表格HTML
    let html = `
        <div class="energy-summary">
            <div class="summary-item">
                <div class="summary-label">近30天总能耗</div>
                <div class="summary-value">${energyData.totalConsumption.toLocaleString()} 度</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">日均能耗</div>
                <div class="summary-value">${energyData.averageConsumption.toLocaleString()} 度</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">能耗评分</div>
                <div class="summary-value">${siteData.energyScore} 分</div>
            </div>
        </div>
        
        <h4>每日能耗明细</h4>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>实际能耗(度)</th>
                        <th>目标能耗(度)</th>
                        <th>差异(%)</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加每日能耗数据（展示最近10天）
    const recentDays = 10;
    for (let i = energyData.dates.length - recentDays; i < energyData.dates.length; i++) {
        const actual = energyData.dailyConsumption[i];
        const target = energyData.targetConsumption[i];
        const diff = ((actual - target) / target * 100).toFixed(2);
        const status = actual >= target ? '达标' : '未达标';
        const statusClass = actual >= target ? 'status-good' : 'status-bad';
        
        html += `
            <tr>
                <td>${energyData.dates[i]}</td>
                <td>${actual.toLocaleString()}</td>
                <td>${target.toLocaleString()}</td>
                <td class="${diff >= 0 ? 'positive' : 'negative'}">${diff >= 0 ? '+' : ''}${diff}%</td>
                <td><span class="${statusClass}">${status}</span></td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="note">* 仅显示最近${recentDays}天数据</div>
    `;
    
    tableContainer.innerHTML = html;
}

// 更新SOH详情图表
function updateSohChart(siteData) {
    if (!charts.sohChart) return;
    
    // 生成模拟的SOH数据
    const generateSohData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的SOH得分生成模拟数据
        // 分数越高，SOH值越高
        const baseSoh = siteData.sohScore; // 基础SOH值（与得分相近）
        const randomFactor = 0.1; // 随机波动因子
        
        // 生成每日SOH数据和剩余寿命
        const dailySoh = [];
        const batteryLifeData = [];
        
        for (let i = 0; i < 30; i++) {
            // SOH 值随时间缓慢下降
            const decreaseFactor = i * 0.01; // 模拟每天下降一点点
            const random = Math.random() * randomFactor - randomFactor / 2; // 保留一些随机性
            // 确保 SOH 不会低于 50 且不会高于前一天或初始值
            const previousSoh = i > 0 ? dailySoh[i-1] : baseSoh;
            let soh = previousSoh - decreaseFactor + random;
            soh = Math.min(previousSoh, soh); // 不能高于前一天
            soh = Math.max(50, soh); // 最低不低于 50
            
            dailySoh.push(parseFloat(soh.toFixed(1)));
            
            // 基于SOH计算的电池剩余寿命（年）
            // SOH 100% 对应约5年寿命，80%对应3年，60%对应1年，低于60%为0
            let remainingLife = 0;
            if (soh >= 80) {
                remainingLife = 3 + (soh - 80) * 0.1; // 80-100% -> 3-5年
            } else if (soh >= 60) {
                remainingLife = 1 + (soh - 60) * 0.1; // 60-80% -> 1-3年
            } else if (soh > 50) {
                remainingLife = (soh - 50) * 0.1; // 50-60% -> 0-1年
            }
            batteryLifeData.push(parseFloat(remainingLife.toFixed(1)));
        }
        
        return { 
            dates, 
            dailySoh, 
            batteryLifeData,
            averageSoh: parseFloat((dailySoh.reduce((a, b) => a + b, 0) / dailySoh.length).toFixed(1)),
            currentSoh: dailySoh[dailySoh.length - 1],
            sohTrend: dailySoh[dailySoh.length - 1] - dailySoh[0] // 正值表示上升趋势，负值表示下降趋势
        };
    };
    
    const sohData = generateSohData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 电池SOH趋势`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === 'SOH') {
                        tooltip += `${param.seriesName}: ${param.value}%<br/>`;
                    } else if (param.seriesName === '剩余寿命') {
                        tooltip += `${param.seriesName}: ${param.value} 年<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['SOH', '剩余寿命'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sohData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'SOH(%)',
                min: 50,
                max: 100
            },
            {
                type: 'value',
                name: '剩余寿命(年)',
                min: 0,
                max: 5,
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: 'SOH',
                type: 'line',
                data: sohData.dailySoh,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: function(params) {
                        // SOH低于80%标为黄色，低于60%标为红色
                        return params.data >= 80 ? '#722ed1' : (params.data >= 60 ? '#F39C12' : '#E74C3C');
                    }
                },
                markLine: {
                    data: [
                        { yAxis: 80, name: '良好阈值', lineStyle: { color: '#F39C12', type: 'dashed' } },
                        { yAxis: 60, name: '警戒阈值', lineStyle: { color: '#E74C3C', type: 'dashed' } }
                    ],
                    label: { show: true, position: 'start' }
                }
            },
            {
                name: '剩余寿命',
                type: 'bar',
                yAxisIndex: 1,
                data: sohData.batteryLifeData,
                itemStyle: { 
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(114, 46, 209, 0.8)' },
                        { offset: 1, color: 'rgba(114, 46, 209, 0.2)' }
                    ])
                },
                barWidth: 10
            }
        ]
    };
    
    charts.sohChart.setOption(option, true);
    
    // 更新SOH详情表格
    updateSohTable(siteData, sohData);
}

// 更新SOH详情表格
function updateSohTable(siteData, sohData) {
    const tableContainer = document.getElementById('soh-table');
    if (!tableContainer) return;
    
    // 生成表格HTML
    let html = `
        <div class="soh-summary">
            <div class="summary-item">
                <div class="summary-label">当前SOH</div>
                <div class="summary-value">${sohData.currentSoh}%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">30天平均SOH</div>
                <div class="summary-value">${sohData.averageSoh}%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">SOH评分</div>
                <div class="summary-value">${siteData.sohScore} 分</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">SOH变化趋势</div>
                <div class="summary-value ${sohData.sohTrend >= 0 ? 'trend-up' : 'trend-down'}">
                    ${sohData.sohTrend >= 0 ? '+' : ''}${sohData.sohTrend.toFixed(1)}%
                    <i class="fas fa-${sohData.sohTrend >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
            </div>
        </div>
        
        <h4>电池健康状态评估</h4>
        <div class="battery-health-assessment">
            <div class="assessment-level ${sohData.currentSoh >= 80 ? 'level-good' : (sohData.currentSoh >= 60 ? 'level-warning' : 'level-danger')}">
                <div class="level-icon">
                    <i class="fas fa-${sohData.currentSoh >= 80 ? 'check-circle' : (sohData.currentSoh >= 60 ? 'exclamation-triangle' : 'times-circle')}"></i>
                </div>
                <div class="level-details">
                    <div class="level-title">
                        ${sohData.currentSoh >= 80 ? '状态良好' : (sohData.currentSoh >= 60 ? '需要关注' : '需要更换')}
                    </div>
                    <div class="level-description">
                        ${sohData.currentSoh >= 80 
                            ? '电池健康状态良好，预计剩余寿命充足，可继续正常使用。' 
                            : (sohData.currentSoh >= 60 
                                ? '电池健康状态一般，建议定期检查，注意SOH变化趋势。' 
                                : '电池健康状态较差，建议尽快安排更换计划，避免影响系统可靠性。')}
                    </div>
                </div>
            </div>
        </div>
        
        <h4>电池寿命预测</h4>
        <div class="battery-life-prediction">
            <div class="prediction-item">
                <div class="prediction-label">预计剩余寿命</div>
                <div class="prediction-value">${sohData.batteryLifeData[sohData.batteryLifeData.length - 1]} 年</div>
            </div>
            <div class="prediction-item">
                <div class="prediction-label">预计更换时间</div>
                <div class="prediction-value">
                    ${new Date(new Date().setFullYear(new Date().getFullYear() + 
                        Math.floor(sohData.batteryLifeData[sohData.batteryLifeData.length - 1]))).toLocaleDateString()}
                </div>
            </div>
        </div>
    `;
    
    tableContainer.innerHTML = html;
}

// 更新温度一致性图表
function updateTemperatureChart(siteData) {
    if (!charts.temperatureChart) return;
    
    // 生成模拟的温度一致性数据
    const generateTemperatureData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的温度一致性得分生成模拟数据
        // 分数越高，温差越小
        const baseScore = siteData.temperatureScore; // 基础温度一致性得分
        
        // 温差值（°C）- 得分越高，温差越小
        // 温差0-3°C对应得分90-100
        // 温差3-6°C对应得分70-90
        // 温差6-10°C对应得分50-70
        let baseTemp = 25; // 基础温度25°C
        
        // 估算温差
        let tempDiff;
        if (baseScore >= 90) {
            tempDiff = 3 - (baseScore - 90) * 0.3; // 90-100分 -> 3-0°C温差
        } else if (baseScore >= 70) {
            tempDiff = 6 - (baseScore - 70) * 0.15; // 70-90分 -> 6-3°C温差
        } else {
            tempDiff = 10 - (baseScore - 50) * 0.2; // 50-70分 -> 10-6°C温差
        }
        
        // 生成每日温度数据
        const dailyTempDiff = [];
        const maxTemp = [];
        const minTemp = [];
        const avgTemp = [];
        
        for (let i = 0; i < 30; i++) {
            // 随机波动温差
            const randomFactor = Math.random() * 0.4 - 0.2; // -0.2 ~ +0.2
            const diff = Math.max(0, tempDiff * (1 + randomFactor));
            dailyTempDiff.push(parseFloat(diff.toFixed(1)));
            
            // 生成最高、最低和平均温度
            const tempVariation = Math.random() * 2 - 1; // -1 ~ +1
            const avgTempValue = baseTemp + tempVariation;
            avgTemp.push(parseFloat(avgTempValue.toFixed(1)));
            
            maxTemp.push(parseFloat((avgTempValue + diff/2).toFixed(1)));
            minTemp.push(parseFloat((avgTempValue - diff/2).toFixed(1)));
        }
        
        return { 
            dates, 
            dailyTempDiff, 
            maxTemp,
            minTemp,
            avgTemp,
            currentTempDiff: dailyTempDiff[dailyTempDiff.length - 1],
            avgTempDiff: parseFloat((dailyTempDiff.reduce((a, b) => a + b, 0) / dailyTempDiff.length).toFixed(1))
        };
    };
    
    const temperatureData = generateTemperatureData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 电池温度一致性趋势`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === '温差') {
                        tooltip += `${param.seriesName}: ${param.value}°C<br/>`;
                    } else if (param.seriesName === '最高温度') {
                        tooltip += `${param.seriesName}: ${param.value}°C<br/>`;
                    } else if (param.seriesName === '最低温度') {
                        tooltip += `${param.seriesName}: ${param.value}°C<br/>`;
                    } else if (param.seriesName === '平均温度') {
                        tooltip += `${param.seriesName}: ${param.value}°C<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['温差', '最高温度', '最低温度', '平均温度'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: temperatureData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '温度(°C)',
                min: function(value) {
                    return Math.floor(Math.min(...temperatureData.minTemp) - 2);
                },
                max: function(value) {
                    return Math.ceil(Math.max(...temperatureData.maxTemp) + 2);
                }
            },
            {
                type: 'value',
                name: '温差(°C)',
                min: 0,
                max: function(value) {
                    return Math.ceil(Math.max(...temperatureData.dailyTempDiff) + 2);
                },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '温差',
                type: 'bar',
                yAxisIndex: 1,
                data: temperatureData.dailyTempDiff,
                itemStyle: {
                    color: function(params) {
                        // 温差超过3°C标为黄色，超过6°C标为红色
                        return params.data <= 3 ? '#eb2f96' : (params.data <= 6 ? '#F39C12' : '#E74C3C');
                    }
                },
                barWidth: 10
            },
            {
                name: '最高温度',
                type: 'line',
                data: temperatureData.maxTemp,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: '#E74C3C' }
            },
            {
                name: '最低温度',
                type: 'line',
                data: temperatureData.minTemp,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: '#3498DB' }
            },
            {
                name: '平均温度',
                type: 'line',
                data: temperatureData.avgTemp,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { 
                    width: 2,
                    type: 'dashed'
                },
                itemStyle: { color: '#2ECC71' }
            }
        ]
    };
    
    charts.temperatureChart.setOption(option, true);
    
    // 更新温度一致性详情表格
    updateTemperatureTable(siteData, temperatureData);
}

// 更新温度一致性详情表格
function updateTemperatureTable(siteData, temperatureData) {
    const tableContainer = document.getElementById('temperature-table');
    if (!tableContainer) return;
    
    // 温度一致性等级评估
    let uniformityLevel, uniformityDescription, uniformityClass;
    if (temperatureData.currentTempDiff <= 3) {
        uniformityLevel = '优秀';
        uniformityDescription = '电池组温度一致性优秀，电池管理系统工作正常。';
        uniformityClass = 'level-good';
    } else if (temperatureData.currentTempDiff <= 6) {
        uniformityLevel = '良好';
        uniformityDescription = '电池组温度一致性良好，建议定期检查散热系统。';
        uniformityClass = 'level-warning';
    } else {
        uniformityLevel = '不佳';
        uniformityDescription = '电池组温度一致性较差，请检查散热系统或电池管理系统。';
        uniformityClass = 'level-danger';
    }
    
    // 生成表格HTML
    let html = `
        <div class="temperature-summary">
            <div class="summary-item">
                <div class="summary-label">当前温差</div>
                <div class="summary-value">${temperatureData.currentTempDiff}°C</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">30天平均温差</div>
                <div class="summary-value">${temperatureData.avgTempDiff}°C</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">温度一致性评分</div>
                <div class="summary-value">${siteData.temperatureScore} 分</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">当前平均温度</div>
                <div class="summary-value">${temperatureData.avgTemp[temperatureData.avgTemp.length - 1]}°C</div>
            </div>
        </div>
        
        <h4>温度一致性评估</h4>
        <div class="temperature-assessment">
            <div class="assessment-level ${uniformityClass}">
                <div class="level-icon">
                    <i class="fas fa-${uniformityClass === 'level-good' ? 'check-circle' : (uniformityClass === 'level-warning' ? 'exclamation-triangle' : 'times-circle')}"></i>
                </div>
                <div class="level-details">
                    <div class="level-title">${uniformityLevel}</div>
                    <div class="level-description">${uniformityDescription}</div>
                </div>
            </div>
        </div>
        
        <h4>近期温度变化记录</h4>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>最高温度(°C)</th>
                        <th>最低温度(°C)</th>
                        <th>温差(°C)</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加最近10天的温度记录
    const recentDays = 10;
    for (let i = temperatureData.dates.length - recentDays; i < temperatureData.dates.length; i++) {
        const tempDiff = temperatureData.dailyTempDiff[i];
        let statusClass, statusText;
        
        if (tempDiff <= 3) {
            statusClass = 'status-good';
            statusText = '优秀';
        } else if (tempDiff <= 6) {
            statusClass = 'status-warning';
            statusText = '良好';
        } else {
            statusClass = 'status-danger';
            statusText = '不佳';
        }
        
        html += `
            <tr>
                <td>${temperatureData.dates[i]}</td>
                <td>${temperatureData.maxTemp[i]}</td>
                <td>${temperatureData.minTemp[i]}</td>
                <td>${tempDiff}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }
    
    html += `
            </tbody>
        </table>
    </div>
    `;
    
    tableContainer.innerHTML = html;
}

// 更新电压一致性图表
function updateVoltageChart(siteData) {
    if (!charts.voltageChart) return;
    
    // 生成模拟的电压一致性数据
    const generateVoltageData = () => {
        // 生成最近30天的日期标签
        const dates = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            dates.push(`${month}-${day}`);
        }
        
        // 基于站点的电压一致性得分生成模拟数据
        // 分数越高，电压差异越小
        const baseScore = siteData.voltageScore; // 基础电压一致性得分
        
        // 电压标准差（mV）- 得分越高，标准差越小
        // 标准差0-50mV对应得分90-100
        // 标准差50-100mV对应得分70-90
        // 标准差100-200mV对应得分50-70
        let baseVoltage = 3700; // 基础电压3.7V (3700mV)
        
        // 估算电压标准差
        let voltageStdDev;
        if (baseScore >= 90) {
            voltageStdDev = 50 - (baseScore - 90) * 5; // 90-100分 -> 50-0mV标准差
        } else if (baseScore >= 70) {
            voltageStdDev = 100 - (baseScore - 70) * 2.5; // 70-90分 -> 100-50mV标准差
        } else {
            voltageStdDev = 200 - (baseScore - 50) * 5; // 50-70分 -> 200-100mV标准差
        }
        
        // 生成每日电压数据
        const dailyVoltageStdDev = [];
        const maxVoltage = [];
        const minVoltage = [];
        const avgVoltage = [];
        
        for (let i = 0; i < 30; i++) {
            // 随机波动标准差
            const randomFactor = Math.random() * 0.4 - 0.2; // -0.2 ~ +0.2
            const stdDev = Math.max(1, voltageStdDev * (1 + randomFactor));
            dailyVoltageStdDev.push(parseFloat(stdDev.toFixed(1)));
            
            // 生成最高、最低和平均电压
            const voltageVariation = Math.random() * 100 - 50; // -50 ~ +50 mV
            const avgVoltageValue = baseVoltage + voltageVariation;
            avgVoltage.push(parseFloat(avgVoltageValue.toFixed(1)));
            
            // 最大电压差异约为标准差的3倍
            const voltRange = stdDev * 3;
            maxVoltage.push(parseFloat((avgVoltageValue + voltRange/2).toFixed(1)));
            minVoltage.push(parseFloat((avgVoltageValue - voltRange/2).toFixed(1)));
        }
        
        return { 
            dates, 
            dailyVoltageStdDev, 
            maxVoltage,
            minVoltage,
            avgVoltage,
            currentStdDev: dailyVoltageStdDev[dailyVoltageStdDev.length - 1],
            avgStdDev: parseFloat((dailyVoltageStdDev.reduce((a, b) => a + b, 0) / dailyVoltageStdDev.length).toFixed(1))
        };
    };
    
    const voltageData = generateVoltageData();
    
    // 更新图表
    const option = {
        title: {
            text: `${siteData.site} - 电池电压一致性趋势`,
            left: 'center',
            textStyle: { fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                let tooltip = `${params[0].name}<br/>`;
                params.forEach(param => {
                    if (param.seriesName === '电压标准差') {
                        tooltip += `${param.seriesName}: ${param.value} mV<br/>`;
                    } else if (param.seriesName === '最高电压') {
                        tooltip += `${param.seriesName}: ${param.value} mV<br/>`;
                    } else if (param.seriesName === '最低电压') {
                        tooltip += `${param.seriesName}: ${param.value} mV<br/>`;
                    } else if (param.seriesName === '平均电压') {
                        tooltip += `${param.seriesName}: ${param.value} mV<br/>`;
                    }
                });
                return tooltip;
            }
        },
        legend: {
            data: ['电压标准差', '最高电压', '最低电压', '平均电压'],
            right: 10,
            top: 5
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: voltageData.dates,
            axisLabel: {
                interval: 'auto',
                rotate: 30,
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '电压(mV)',
                min: function(value) {
                    return Math.floor((Math.min(...voltageData.minVoltage) - 100) / 100) * 100;
                },
                max: function(value) {
                    return Math.ceil((Math.max(...voltageData.maxVoltage) + 100) / 100) * 100;
                }
            },
            {
                type: 'value',
                name: '标准差(mV)',
                min: 0,
                max: function(value) {
                    return Math.ceil(Math.max(...voltageData.dailyVoltageStdDev) + 50);
                },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '电压标准差',
                type: 'bar',
                yAxisIndex: 1,
                data: voltageData.dailyVoltageStdDev,
                itemStyle: {
                    color: function(params) {
                        // 标准差超过50mV标为黄色，超过100mV标为红色
                        return params.data <= 50 ? '#52c41a' : (params.data <= 100 ? '#F39C12' : '#E74C3C');
                    }
                },
                barWidth: 10
            },
            {
                name: '最高电压',
                type: 'line',
                data: voltageData.maxVoltage,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: '#E74C3C' }
            },
            {
                name: '最低电压',
                type: 'line',
                data: voltageData.minVoltage,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2 },
                itemStyle: { color: '#3498DB' }
            },
            {
                name: '平均电压',
                type: 'line',
                data: voltageData.avgVoltage,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { 
                    width: 2,
                    type: 'dashed'
                },
                itemStyle: { color: '#2ECC71' }
            }
        ]
    };
    
    charts.voltageChart.setOption(option, true);
    
    // 更新电压一致性详情表格
    updateVoltageTable(siteData, voltageData);
}

// 更新电压一致性详情表格
function updateVoltageTable(siteData, voltageData) {
    const tableContainer = document.getElementById('voltage-table');
    if (!tableContainer) return;
    
    // 电压一致性等级评估
    let uniformityLevel, uniformityDescription, uniformityClass;
    if (voltageData.currentStdDev <= 50) {
        uniformityLevel = '优秀';
        uniformityDescription = '电池组电压一致性优秀，电池健康状态良好。';
        uniformityClass = 'level-good';
    } else if (voltageData.currentStdDev <= 100) {
        uniformityLevel = '良好';
        uniformityDescription = '电池组电压一致性良好，建议定期检查电池管理系统。';
        uniformityClass = 'level-warning';
    } else {
        uniformityLevel = '不佳';
        uniformityDescription = '电池组电压一致性较差，可能存在电池不匹配或老化不均的情况。';
        uniformityClass = 'level-danger';
    }
    
    // 生成表格HTML
    let html = `
        <div class="voltage-summary">
            <div class="summary-item">
                <div class="summary-label">当前电压标准差</div>
                <div class="summary-value">${voltageData.currentStdDev} mV</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">30天平均标准差</div>
                <div class="summary-value">${voltageData.avgStdDev} mV</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">电压一致性评分</div>
                <div class="summary-value">${siteData.voltageScore} 分</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">当前平均电压</div>
                <div class="summary-value">${(voltageData.avgVoltage[voltageData.avgVoltage.length - 1]/1000).toFixed(2)} V</div>
            </div>
        </div>
        
        <h4>电压一致性评估</h4>
        <div class="voltage-assessment">
            <div class="assessment-level ${uniformityClass}">
                <div class="level-icon">
                    <i class="fas fa-${uniformityClass === 'level-good' ? 'check-circle' : (uniformityClass === 'level-warning' ? 'exclamation-triangle' : 'times-circle')}"></i>
                </div>
                <div class="level-details">
                    <div class="level-title">${uniformityLevel}</div>
                    <div class="level-description">${uniformityDescription}</div>
                </div>
            </div>
        </div>
        
        <h4>近期电压变化记录</h4>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>最高电压(V)</th>
                        <th>最低电压(V)</th>
                        <th>标准差(mV)</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加最近10天的电压记录
    const recentDays = 10;
    for (let i = voltageData.dates.length - recentDays; i < voltageData.dates.length; i++) {
        const stdDev = voltageData.dailyVoltageStdDev[i];
        let statusClass, statusText;
        
        if (stdDev <= 50) {
            statusClass = 'status-good';
            statusText = '优秀';
        } else if (stdDev <= 100) {
            statusClass = 'status-warning';
            statusText = '良好';
        } else {
            statusClass = 'status-danger';
            statusText = '不佳';
        }
        
        html += `
            <tr>
                <td>${voltageData.dates[i]}</td>
                <td>${(voltageData.maxVoltage[i]/1000).toFixed(2)}</td>
                <td>${(voltageData.minVoltage[i]/1000).toFixed(2)}</td>
                <td>${stdDev}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }
    
    html += `
            </tbody>
        </table>
    </div>
    `;
    
    tableContainer.innerHTML = html;
} 