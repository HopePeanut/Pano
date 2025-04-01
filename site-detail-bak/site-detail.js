// 站点详情页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航组件
    initNavComponents();
    
    // 初始化所有图表
    initCharts();
    
    // 初始化交互事件
    initEvents();
    
    // 初始化站点切换功能
    initSiteSwitcher();
    
    // 检查页面加载完成后，隐藏加载指示器
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

/**
 * 初始化导航组件
 */
function initNavComponents() {
    // 这里我们不再需要手动加载导航组件，
    // 因为common.js中的loadNavbar()已经处理了这个功能
    
    // 获取当前站点信息
    const siteId = localStorage.getItem('selectedSiteId') || 'site1';
    
    // 更新面包屑导航中的站点名称
    updateBreadcrumb(siteId);
    
    // 更新当前站点信息显示
    updateCurrentSiteInfo(siteId);
}

/**
 * 更新面包屑导航
 * @param {string} siteId - 站点ID
 */
function updateBreadcrumb(siteId) {
    // 获取站点名称
    const siteName = getSiteName(siteId);
    
    // 更新面包屑中的站点名称
    const breadcrumbSiteName = document.getElementById('breadcrumbSiteName');
    if (breadcrumbSiteName) {
        breadcrumbSiteName.textContent = siteName;
    }
}

/**
 * 更新当前站点信息显示
 * @param {string} siteId - 站点ID
 */
function updateCurrentSiteInfo(siteId) {
    // 获取站点名称
    const siteName = getSiteName(siteId);
    
    // 更新当前站点名称显示
    const currentSiteName = document.getElementById('currentSiteName');
    if (currentSiteName) {
        currentSiteName.textContent = siteName;
    }
}

/**
 * 获取站点名称
 * @param {string} siteId - 站点ID
 * @returns {string} 站点名称
 */
function getSiteName(siteId) {
    // 实际应用中应从数据源获取
    const siteNames = {
        'site1': '张家口储能电站',
        'site2': '广州储能电站',
        'site3': '深圳储能电站',
        'site4': '东莞储能电站'
    };
    
    return siteNames[siteId] || '未知站点';
}

/**
 * 初始化所有图表
 */
function initCharts() {
    initPowerCurveChart();
    initIncomeChart();
    initDowntimeChart();
}

/**
 * 初始化功率曲线图表
 */
function initPowerCurveChart() {
    const chartDom = document.getElementById('powerCurveChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 生成一天24小时的时间点
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    // 生成模拟数据
    const planPower = generatePlanPowerData();
    const actualPower = generateActualPowerData(planPower);
    const priceData = generatePriceData();
    
    const option = {
        grid: {
            top: 30,
            right: 8,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        xAxis: {
            type: 'category',
            data: hours,
            axisPointer: {
                type: 'shadow'
            },
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisTick: {
                alignWithLabel: true,
                length: 2,
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                fontSize: 9,
                color: '#666',
                interval: 3,
                margin: 6
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '',
                min: -2000,
                max: 2000,
                interval: 1000,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ddd'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                axisLabel: {
                    formatter: '{value}kW',
                    fontSize: 9,
                    color: '#666',
                    margin: 2
                }
            },
            {
                type: 'value',
                name: '',
                min: 0,
                max: 1.2,
                interval: 0.3,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ddd'
                    }
                },
                axisLabel: {
                    formatter: '{value}元',
                    fontSize: 9,
                    color: '#666',
                    margin: 2
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '计划功率',
                type: 'line',
                smooth: true,
                data: planPower,
                symbol: 'none',
                lineStyle: {
                    width: 2,
                    color: '#39B49A'
                }
            },
            {
                name: '实际功率',
                type: 'line',
                smooth: true,
                data: actualPower,
                symbol: 'none',
                lineStyle: {
                    width: 2,
                    color: '#1890ff'
                }
            },
            {
                name: '电价',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: priceData,
                symbol: 'none',
                lineStyle: {
                    width: 2,
                    color: '#faad14',
                    type: 'dashed'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 窗口大小变化时重新调整图表大小
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

/**
 * 初始化收益图表
 */
function initIncomeChart() {
    const chartDom = document.getElementById('incomeChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 生成7天的日期
    const days = generateLastNDays(7);
    
    // 生成模拟收益数据
    const incomeData = generateIncomeData(7);
    
    const option = {
        grid: {
            top: 30,
            right: 8,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: days,
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisTick: {
                alignWithLabel: true,
                length: 2,
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                fontSize: 9,
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '',
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#ddd'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            axisLabel: {
                formatter: '¥{value}',
                fontSize: 9,
                color: '#666'
            }
        },
        series: [
            {
                name: '日收益',
                type: 'bar',
                barWidth: '60%',
                data: incomeData,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#39B49A' },
                        { offset: 1, color: '#73d1be' }
                    ])
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 处理日周月切换
    const timeBtns = document.querySelectorAll('.income-panel .time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            updateIncomeChart(myChart, period);
        });
    });
    
    // 窗口大小变化时重新调整图表大小
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

/**
 * 更新收益图表数据
 * @param {ECharts} chart - ECharts实例
 * @param {string} period - 时间周期，可以是day、week或month
 */
function updateIncomeChart(chart, period) {
    let daysCount, title;
    
    switch (period) {
        case 'day':
            daysCount = 7; // 一周的数据
            title = '日收益';
            break;
        case 'week':
            daysCount = 4; // 四周的数据
            title = '周收益';
            break;
        case 'month':
            daysCount = 6; // 六个月的数据
            title = '月收益';
            break;
        default:
            daysCount = 7;
            title = '日收益';
    }
    
    // 生成日期和数据
    let dates, data;
    
    if (period === 'day') {
        dates = generateLastNDays(daysCount);
        data = generateIncomeData(daysCount);
    } else if (period === 'week') {
        dates = generateLastNWeeks(daysCount);
        data = generateIncomeData(daysCount, 5000, 8000);
    } else {
        dates = generateLastNMonths(daysCount);
        data = generateIncomeData(daysCount, 20000, 30000);
    }
    
    chart.setOption({
        xAxis: {
            data: dates
        },
        series: [
            {
                name: title,
                data: data
            }
        ]
    });
}

/**
 * 初始化停机率图表
 */
function initDowntimeChart() {
    const chartDom = document.getElementById('downtimeChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 生成30天的日期
    const days = generateLastNDays(30);
    
    // 生成模拟停机率数据
    const downtimeData = generateDowntimeData(30);
    
    const option = {
        grid: {
            top: 30,
            right: 8,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        xAxis: {
            type: 'category',
            data: days,
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisTick: {
                alignWithLabel: true,
                length: 2,
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                fontSize: 9,
                color: '#666',
                interval: 6
            }
        },
        yAxis: {
            type: 'value',
            name: '',
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#ddd'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            axisLabel: {
                formatter: '{value}%',
                fontSize: 9,
                color: '#666'
            },
            max: 3
        },
        series: [
            {
                name: '停机率',
                type: 'line',
                smooth: true,
                data: downtimeData,
                symbol: 'emptyCircle',
                symbolSize: 3,
                lineStyle: {
                    width: 2,
                    color: '#f39c12'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(243, 156, 18, 0.2)' },
                        { offset: 1, color: 'rgba(243, 156, 18, 0.05)' }
                    ])
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 处理日周月切换
    const timeBtns = document.querySelectorAll('.downtime-panel .time-btn');
    const errorMsg = document.querySelector('.date-switch-error');
    
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // 显示错误信息
            if (period === 'day' || period === 'week') {
                errorMsg.style.display = 'block';
                setTimeout(() => {
                    errorMsg.style.display = 'none';
                }, 3000);
                return;
            }
            
            // 更新按钮状态
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            updateDowntimeChart(myChart, period);
        });
    });
    
    // 窗口大小变化时重新调整图表大小
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

/**
 * 初始化事件处理
 */
function initEvents() {
    // 初始化SCADA全屏查看
    initScadaModal();
    
    // 初始化视频控制
    initVideoControl();
}

/**
 * 初始化SCADA全屏查看功能
 */
function initScadaModal() {
    const scadaFullscreenBtn = document.getElementById('scadaFullscreenBtn');
    const scadaModal = document.getElementById('scadaModal');
    const closeScadaModal = document.getElementById('closeScadaModal');
    
    if (scadaFullscreenBtn && scadaModal) {
        scadaFullscreenBtn.addEventListener('click', () => {
            scadaModal.style.display = 'block';
        });
        
        if (closeScadaModal) {
            closeScadaModal.addEventListener('click', () => {
                scadaModal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === scadaModal) {
                scadaModal.style.display = 'none';
            }
        });
    }
}

/**
 * 初始化视频控制功能
 */
function initVideoControl() {
    const videoBtn = document.querySelector('.video-btn');
    const videoSelectorBtns = document.querySelectorAll('.video-selector-btn');
    
    if (videoBtn) {
        videoBtn.addEventListener('click', () => {
            const statusIndicator = document.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.classList.toggle('offline');
                statusIndicator.classList.toggle('online');
                
                if (statusIndicator.classList.contains('online')) {
                    statusIndicator.innerHTML = '<i class="bi bi-circle-fill"></i><span>在线</span>';
                    videoBtn.innerHTML = '<i class="bi bi-stop-circle"></i> 断开连接';
                } else {
                    statusIndicator.innerHTML = '<i class="bi bi-circle-fill"></i><span>离线</span>';
                    videoBtn.innerHTML = '<i class="bi bi-play-circle"></i> 尝试重新连接';
                }
            }
        });
    }
    
    if (videoSelectorBtns.length > 0) {
        videoSelectorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                videoSelectorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 在实际应用中，这里应该切换不同摄像头的视频源
                console.log('切换到摄像头:', btn.textContent);
            });
        });
    }
}

/**
 * 初始化站点切换功能
 */
function initSiteSwitcher() {
    const siteSearch = document.getElementById('siteSearch');
    const siteItems = document.querySelectorAll('.site-item');
    const siteModal = document.getElementById('siteModal');
    const closeSiteModal = document.getElementById('closeSiteModal');
    
    // 打开站点选择模态框
    if (siteSearch) {
        siteSearch.addEventListener('focus', () => {
            if (siteModal) {
                siteModal.style.display = 'block';
            }
        });
    }
    
    // 关闭模态框
    if (closeSiteModal && siteModal) {
        closeSiteModal.addEventListener('click', () => {
            siteModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === siteModal) {
                siteModal.style.display = 'none';
            }
        });
    }
    
    // 站点选择
    if (siteItems.length > 0) {
        siteItems.forEach(item => {
            item.addEventListener('click', () => {
                const siteId = item.getAttribute('data-site');
                
                // 更新当前选择的站点
                localStorage.setItem('selectedSiteId', siteId);
                
                // 更新界面
                updateBreadcrumb(siteId);
                updateCurrentSiteInfo(siteId);
                
                // 关闭模态框
                if (siteModal) {
                    siteModal.style.display = 'none';
                }
                
                // 模拟数据更新 - 在实际应用中应该从服务器获取新站点的数据
                initCharts();
            });
        });
    }
}

// 辅助函数 - 生成随机数
function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 辅助函数 - 生成计划功率数据
function generatePlanPowerData() {
    return [
        -1200, -1500, -1800, -1500, -1000, -800, -500, 0,
        500, 1000, 1500, 1800, 1500, 1200, 1000, 500,
        0, -500, -800, -1000, -1200, -1500, -1800, -1500
    ].map(value => value + getRandomValue(-100, 100));
}

// 辅助函数 - 生成实际功率数据
function generateActualPowerData(planData) {
    return planData.map(value => value + getRandomValue(-200, 200));
}

// 辅助函数 - 生成电价数据
function generatePriceData() {
    return [
        0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.5, 0.7,
        0.9, 1.1, 1.1, 1.1, 0.9, 0.9, 0.7, 0.7,
        0.5, 0.7, 0.9, 1.1, 0.9, 0.7, 0.5, 0.3
    ].map(value => value + Math.random() * 0.1 - 0.05);
}

// 辅助函数 - 生成最近N天的日期
function generateLastNDays(n) {
    const result = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        result.push(`${date.getMonth()+1}/${date.getDate()}`);
    }
    
    return result;
}

// 辅助函数 - 生成最近N周的日期
function generateLastNWeeks(n) {
    const result = [];
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    
    for (let i = n - 1; i >= 0; i--) {
        const weekNum = currentWeek - i;
        result.push(`第${weekNum > 0 ? weekNum : weekNum + 52}周`);
    }
    
    return result;
}

// 辅助函数 - 获取某一天是一年中的第几周
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// 辅助函数 - 生成最近N个月的日期
function generateLastNMonths(n) {
    const result = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    for (let i = n - 1; i >= 0; i--) {
        let monthIndex = currentMonth - i;
        let year = currentYear;
        
        if (monthIndex < 0) {
            monthIndex += 12;
            year -= 1;
        }
        
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        result.push(monthNames[monthIndex]);
    }
    
    return result;
}

// 辅助函数 - 生成收益数据
function generateIncomeData(n, min = 500, max = 1000) {
    return Array.from({ length: n }, () => getRandomValue(min, max));
}

// 辅助函数 - 生成停机率数据
function generateDowntimeData(n, min = 0, max = 2) {
    return Array.from({ length: n }, () => (Math.random() * (max - min) + min).toFixed(2));
}

// 更新停机率图表数据
function updateDowntimeChart(chart, period) {
    let daysCount;
    
    switch (period) {
        case 'day':
            daysCount = 30; // 30天的数据
            break;
        case 'week':
            daysCount = 12; // 12周的数据
            break;
        case 'month':
            daysCount = 12; // 12个月的数据
            break;
        default:
            daysCount = 30;
    }
    
    // 生成日期和数据
    let dates, data;
    
    if (period === 'day') {
        dates = generateLastNDays(daysCount);
        data = generateDowntimeData(daysCount);
    } else if (period === 'week') {
        dates = generateLastNWeeks(daysCount);
        data = generateDowntimeData(daysCount, 0.5, 2);
    } else {
        dates = generateLastNMonths(daysCount);
        data = generateDowntimeData(daysCount, 0.5, 1.5);
    }
    
    chart.setOption({
        xAxis: {
            data: dates
        },
        series: [
            {
                data: data
            }
        ]
    });
} 