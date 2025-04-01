// 站点详情页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航组件
    initNavComponents();
    
    // 初始化站点切换功能
    initSiteSwitcher();
    
    // 初始化SCADA全屏查看功能
    initScadaModal();
    
    // 初始化功率曲线图表
    initPowerCurveChart();
    
    // 初始化收益图表
    initIncomeChart();
    
    // 初始化停机率图表
    initDowntimeChart();
    
    // 初始化面板日期切换按钮
    initDateButtons();
    
    // 初始化视频监控切换
    initVideoControls();
    
    // 初始化图表
    initCharts();
    
    // 初始化模式切换
    initDisplayModeSwitch();
    
    // 初始化标签页系统
    initTabSystem();
    
    // 自动检测屏幕尺寸并应用合适的模式
    autoSwitchDisplayMode();
    
    // 窗口大小改变时重新检测
    window.addEventListener('resize', autoSwitchDisplayMode);
    
    // 初始化可折叠面板
    initCollapsiblePanels();
    
    // 检查页面加载完成后，隐藏加载指示器
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

/**
 * 初始化导航组件
 */
function initNavComponents() {
    try {
        console.log("初始化站点详情页导航组件");
        
        // 获取当前站点信息
        const siteId = localStorage.getItem('selectedSiteId');
        console.log(`从localStorage获取的站点ID: ${siteId}`);
        
        // 如果站点ID为空，使用默认值
        const effectiveSiteId = siteId || '1';
        console.log(`使用的有效站点ID: ${effectiveSiteId}`);
        
        // 更新面包屑导航中的站点名称
        updateBreadcrumb(effectiveSiteId);
        
        // 更新当前站点信息显示
        updateCurrentSiteInfo(effectiveSiteId);
    } catch (error) {
        console.error("初始化站点导航组件时出错:", error);
    }
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
    console.log(`获取站点名称，ID: ${siteId}`);
    
    // 实际应用中应从数据源获取
    const siteNames = {
        '1': '张家口储能电站',
        '2': '广州储能电站',
        '3': '深圳储能电站',
        '4': '东莞储能电站',
        '5': '成都充电桩配储',
        '9': '重庆充电站',
        '10': '长沙光储充一体站',
        '11': '广州储能电站'
    };
    
    // 添加数字类型的键以提高兼容性
    const numericSiteId = parseInt(siteId, 10);
    if (!isNaN(numericSiteId) && siteNames[numericSiteId]) {
        return siteNames[numericSiteId];
    }
    
    return siteNames[siteId] || '未知站点';
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
 * 初始化站点切换功能
 */
function initSiteSwitcher() {
    const siteSearch = document.getElementById('siteSearch');
    const siteItems = document.querySelectorAll('.site-item');
    const siteModal = document.getElementById('siteModal');
    const closeSiteModal = document.getElementById('closeSiteModal');
    const modalSiteSearch = document.getElementById('modalSiteSearch');
    
    // 打开站点选择模态框
    if (siteSearch) {
        siteSearch.addEventListener('focus', () => {
            if (siteModal) {
                siteModal.style.display = 'block';
                if (modalSiteSearch) {
                    setTimeout(() => {
                        modalSiteSearch.focus();
                    }, 100);
                }
            }
        });
    }
    
    // 模态框内搜索功能
    if (modalSiteSearch) {
        modalSiteSearch.addEventListener('input', () => {
            const searchValue = modalSiteSearch.value.toLowerCase();
            let hasResults = false;
    
    siteItems.forEach(item => {
        const siteName = item.querySelector('.site-item-name').textContent.toLowerCase();
        const siteCapacity = item.querySelector('.site-capacity').textContent.toLowerCase();
                const siteLocation = item.querySelector('.site-location').textContent.toLowerCase();
                
                if (siteName.includes(searchValue) || 
                    siteCapacity.includes(searchValue) || 
                    siteLocation.includes(searchValue)) {
                    item.style.display = 'flex';
                    hasResults = true;
        } else {
            item.style.display = 'none';
        }
    });
    
            // 处理没有匹配结果的情况
    const noResultsMsg = document.querySelector('.no-results-message');
            if (!hasResults) {
        if (!noResultsMsg) {
            const message = document.createElement('div');
            message.className = 'no-results-message';
                    message.innerHTML = `
                        <i class="bi bi-search"></i>
                        <p>没有找到匹配的站点，请尝试其他关键词</p>
                    `;
                    document.querySelector('.site-list').appendChild(message);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
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
                
                // 显示切换成功提示
                showToast(`已切换到站点: ${getSiteName(siteId)}`);
            });
        });
    }
    
    // 进入设备监控
    const enterBackendBtn = document.getElementById('enterBackendBtn');
    if (enterBackendBtn) {
        enterBackendBtn.addEventListener('click', () => {
            window.location.href = 'device-monitor.html';
        });
    }
}

/**
 * 显示简单的提示信息
 * @param {string} message - 提示消息
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * 初始化功率曲线图表
 */
function initPowerCurveChart() {
    const chartContainer = document.getElementById('powerCurveChart');
    
    if (!chartContainer) return;
    
    const chart = echarts.init(chartContainer);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            data: ['计划功率', '实际功率', '电价'],
            textStyle: {
                color: '#666'
            },
            bottom: 0
        },
        xAxis: [
            {
            type: 'category',
                data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            axisPointer: {
                type: 'shadow'
            },
            axisLine: {
                lineStyle: {
                        color: '#ccc'
                }
            },
            axisTick: {
                    show: false
                }
            }
        ],
        yAxis: [
            {
            type: 'value',
                name: '功率(kW)',
                min: -2500,
                max: 2500,
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#39B49A'
                    }
            },
                axisLabel: {
                    formatter: '{value}'
            },
            splitLine: {
                lineStyle: {
                        color: 'rgba(0,0,0,0.05)'
                    }
            }
        },
            {
                type: 'value',
                name: '电价(元/kWh)',
                min: 0,
                max: 2,
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#39B49A'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '计划功率',
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: function(params) {
                        return params.value > 0 ? '#39B49A' : 'rgba(57, 180, 154, 0.6)';
                    }
                },
                data: [
                    -1500, -1800, -1200, -500, 
                    800, 1500, 1200, 800, 
                    -500, -1200, -1800, -1500
                ]
            },
            {
                name: '实际功率',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#39B49A',
                    width: 2
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#39B49A'
                },
                data: [
                    -1450, -1750, -1150, -450, 
                    850, 1550, 1250, 850, 
                    -450, -1150, -1750, -1450
                ]
            },
            {
                name: '电价',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                lineStyle: {
                    color: 'rgba(57, 180, 154, 0.4)',
                    width: 2,
                    type: 'dashed'
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: 'rgba(57, 180, 154, 0.4)'
                },
                data: [0.4, 0.35, 0.3, 0.5, 1.2, 1.4, 1.5, 1.4, 1.2, 1.5, 1.2, 0.8]
            }
        ]
    };
    
    chart.setOption(option);
    
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

/**
 * 初始化收益图表
 */
function initIncomeChart() {
    const chartContainer = document.getElementById('incomeChart');
    
    if (!chartContainer) return;
    
    const chart = echarts.init(chartContainer);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c} 元',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: [
            {
            type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisTick: {
                    show: false
                },
            axisLine: {
                lineStyle: {
                        color: '#ccc'
                    }
                }
            }
        ],
        yAxis: [
            {
            type: 'value',
                name: '元',
            axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0,0,0,0.05)'
                }
                }
            }
        ],
        series: [
            {
                name: '日收益',
            type: 'bar',
            barWidth: '60%',
                data: [320, 410, 230, 420, 430, 520, 390],
            itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {offset: 0, color: '#39B49A'}, 
                            {offset: 1, color: 'rgba(57, 180, 154, 0.3)'}
                        ]
                    },
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ]
    };
    
    chart.setOption(option);
    
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

/**
 * 初始化停机率图表
 */
function initDowntimeChart() {
    const chartContainer = document.getElementById('downtimeChart');
    
    if (!chartContainer) return;
    
    const chart = echarts.init(chartContainer);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c}%',
            axisPointer: {
                type: 'line'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: '%',
            min: 0,
            max: 2,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0,0,0,0.05)'
                }
            }
        },
        series: [
            {
                name: '非计划停机率',
                type: 'line',
                smooth: true,
                data: [1.8, 1.5, 1.2, 1.0, 0.9, 0.7, 0.8, 0.9, 1.0, 1.2, 1.3, 1.2],
                lineStyle: {
                    color: '#39B49A',
                    width: 3
                },
            itemStyle: {
                    color: '#39B49A'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {offset: 0, color: 'rgba(57, 180, 154, 0.4)'},
                            {offset: 1, color: 'rgba(57, 180, 154, 0.1)'}
                        ]
                    }
                }
            }
        ]
    };
    
    chart.setOption(option);
    
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

/**
 * 初始化面板日期切换按钮
 */
function initDateButtons() {
    // 收益面板日期切换
    const incomeTimeButtons = document.querySelectorAll('.income-panel .time-btn');
    const incomeChart = echarts.getInstanceByDom(document.getElementById('incomeChart'));
    
    incomeTimeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            incomeTimeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新图表数据
            const period = btn.getAttribute('data-period');
            updateIncomeChart(incomeChart, period);
        });
    });
    
    // 停机率面板日期切换
    const downtimeTimeButtons = document.querySelectorAll('.downtime-panel .time-btn');
    const downtimeChart = echarts.getInstanceByDom(document.getElementById('downtimeChart'));
    
    downtimeTimeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            downtimeTimeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新图表数据
            const period = btn.getAttribute('data-period');
            updateDowntimeChart(downtimeChart, period);
        });
    });
}

/**
 * 更新收益图表数据
 * @param {ECharts} chart - ECharts实例
 * @param {string} period - 时间周期(day/week/month)
 */
function updateIncomeChart(chart, period) {
    if (!chart) return;
    
    let data, xAxisData;
    
    switch(period) {
        case 'day':
            xAxisData = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
            data = [120, 180, 230, 320, 290, 220];
            document.querySelector('.income-value').textContent = '¥980.5';
            document.querySelector('.income-panel .income-label').textContent = '今日收益';
            break;
        case 'week':
            xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            data = [320, 410, 230, 420, 430, 520, 390];
            document.querySelector('.income-value').textContent = '¥3,280.5';
            document.querySelector('.income-panel .income-label').textContent = '本周收益';
            break;
        case 'month':
            xAxisData = ['1周', '2周', '3周', '4周'];
            data = [2450, 2800, 3200, 2900];
            document.querySelector('.income-value').textContent = '¥12,350';
            document.querySelector('.income-panel .income-label').textContent = '本月收益';
            break;
    }
    
    const option = {
        xAxis: [
            {
                data: xAxisData
            }
        ],
        series: [
            {
                data: data
            }
        ]
    };
    
    chart.setOption(option);
}

/**
 * 更新停机率图表数据
 * @param {ECharts} chart - ECharts实例
 * @param {string} period - 时间周期(day/week/month)
 */
function updateDowntimeChart(chart, period) {
    if (!chart) return;
    
    let data, xAxisData;
    
    switch(period) {
        case 'day':
            xAxisData = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
            data = [0.5, 0.3, 0.8, 0.2, 0.6, 0.4];
            document.querySelector('.downtime-panel .downtime-value').textContent = '0.5%';
            document.querySelector('.downtime-panel .downtime-label').textContent = '今日停机率';
            break;
        case 'week':
            xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            data = [0.8, 1.1, 0.6, 0.9, 1.2, 0.7, 0.5];
            document.querySelector('.downtime-panel .downtime-value').textContent = '1.2%';
            document.querySelector('.downtime-panel .downtime-label').textContent = '本周停机率';
            break;
        case 'month':
            xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            data = [1.8, 1.5, 1.2, 1.0, 0.9, 0.7, 0.8, 0.9, 1.0, 1.2, 1.3, 1.2];
            document.querySelector('.downtime-panel .downtime-value').textContent = '1.2%';
            document.querySelector('.downtime-panel .downtime-label').textContent = '本月停机率';
            break;
    }
    
    const option = {
        xAxis: {
            data: xAxisData
        },
        series: [
            {
                data: data
            }
        ]
    };
    
    chart.setOption(option);
}

/**
 * 初始化视频监控切换
 */
function initVideoControls() {
    const videoButtons = document.querySelectorAll('.video-selector-btn');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    const statusIndicator = document.querySelector('.status-indicator');
    
    if (videoButtons && videoPlaceholder) {
        videoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                videoButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 模拟摄像头切换
                const cameraName = btn.textContent;
                
                // 随机模拟摄像头状态
                const isOnline = Math.random() > 0.3;
                
                if (statusIndicator) {
                    if (isOnline) {
                        statusIndicator.className = 'status-indicator online';
                        statusIndicator.innerHTML = '<i class="bi bi-circle-fill"></i><span>在线</span>';
                        
                        // 更新视频容器
                        videoPlaceholder.innerHTML = `
                            <img src="images/video-${cameraName.charAt(0).toLowerCase() + cameraName.slice(1)}.jpg" class="video-feed" alt="${cameraName}监控画面">
                        `;
                    } else {
                        statusIndicator.className = 'status-indicator offline';
                        statusIndicator.innerHTML = '<i class="bi bi-circle-fill"></i><span>离线</span>';
                        
                        // 显示离线状态
                        videoPlaceholder.innerHTML = `
                            <i class="bi bi-camera-video-off-fill"></i>
                            <p>${cameraName}摄像头离线</p>
                            <button class="video-btn"><i class="bi bi-play-circle"></i> 尝试重新连接</button>
                        `;
                    }
                }
                
                showToast(`已切换到${cameraName}摄像头`);
            });
        });
    }
    
    // 重连按钮事件（动态绑定）
    document.addEventListener('click', (e) => {
        if (e.target.closest('.video-btn')) {
            showToast('正在尝试重新连接摄像头...');
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    if (statusIndicator) {
                        statusIndicator.className = 'status-indicator online';
                        statusIndicator.innerHTML = '<i class="bi bi-circle-fill"></i><span>在线</span>';
                        
                        const activeBtn = document.querySelector('.video-selector-btn.active');
                        const cameraName = activeBtn ? activeBtn.textContent : '主控室';
                        
                        // 更新视频容器
                        videoPlaceholder.innerHTML = `
                            <img src="images/video-${cameraName.charAt(0).toLowerCase() + cameraName.slice(1)}.jpg" class="video-feed" alt="${cameraName}监控画面">
                        `;
                        
                        showToast('摄像头连接成功');
                    }
                } else {
                    showToast('摄像头连接失败，请稍后再试');
                }
            }, 1500);
        }
    });
}

/**
 * 生成计划功率数据
 * @returns {Array} 24小时计划功率数据
 */
function generatePlanPowerData() {
    // 模拟一天的计划功率曲线
    // 早上和晚上放电，中午充电
    return [
        -800, -900, -700, -500, -200, 0,
        300, 500, 800, 1000, 1200, 1300,
        1200, 1100, 900, 800, 600, 200,
        -300, -800, -1200, -1000, -900, -800
    ];
}

/**
 * 生成实际功率数据
 * @returns {Array} 24小时实际功率数据
 */
function generateActualPowerData() {
    // 在计划功率的基础上增加一些随机波动
    const planData = generatePlanPowerData();
    return planData.map(value => {
        const variation = Math.random() * 200 - 100; // -100 到 100 之间的随机偏差
        return Math.round(value + variation);
    });
}

/**
 * 生成电价数据
 * @returns {Array} 24小时电价数据
 */
function generatePriceData() {
    // 模拟一天的电价曲线，有峰谷变化
    return [
        0.3, 0.25, 0.25, 0.25, 0.3, 0.4,
        0.5, 0.6, 0.7, 0.65, 0.6, 0.7,
        0.8, 0.8, 0.75, 0.7, 0.65, 0.75,
        0.9, 1.0, 0.9, 0.8, 0.6, 0.4
    ];
}

/**
 * 生成停机率数据
 * @returns {Array} 12个月的停机率数据
 */
function generateDowntimeData() {
    // 模拟12个月的停机率数据
    return [
        1.8, 1.5, 1.2, 1.0, 0.9, 0.7,
        0.8, 0.9, 1.0, 1.2, 1.3, 1.2
    ];
}

/**
 * 初始化显示模式切换
 */
function initDisplayModeSwitch() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const rightColumn = document.querySelector('.right-column');
    
    // 默认设置为紧凑模式
    rightColumn.classList.add('compact-mode');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            modeBtns.forEach(b => b.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 获取模式
            const mode = this.dataset.mode;
            
            // 应用模式
            if (mode === 'compact') {
                rightColumn.classList.add('compact-mode');
            } else {
                rightColumn.classList.remove('compact-mode');
            }
            
            // 如果切换到标准模式，重新初始化图表
            if (mode === 'standard') {
                setTimeout(() => {
                    if (window.incomeChart) window.incomeChart.resize();
                    if (window.downtimeChart) window.downtimeChart.resize();
                }, 300);
            } else {
                // 紧凑模式下初始化紧凑图表
                setTimeout(() => {
                    initCompactCharts();
                }, 300);
            }
        });
    });
}

/**
 * 初始化标签页系统
 */
function initTabSystem() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有标签按钮的active类
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // 添加当前标签按钮的active类
            this.classList.add('active');
            
            // 隐藏所有标签内容
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 显示对应的标签内容
            const tabId = this.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // 重新初始化紧凑图表
            setTimeout(() => {
                if (tabId === 'income') {
                    initIncomeCompactChart();
                } else if (tabId === 'downtime') {
                    initDowntimeCompactChart();
                }
            }, 100);
        });
    });
}

/**
 * 根据屏幕尺寸自动切换显示模式
 */
function autoSwitchDisplayMode() {
    const rightColumn = document.querySelector('.right-column');
    const compactModeBtn = document.querySelector('.mode-btn[data-mode="compact"]');
    const standardModeBtn = document.querySelector('.mode-btn[data-mode="standard"]');
    
    // 如果屏幕宽度小于等于1366px，切换到紧凑模式
    if (window.innerWidth <= 1366) {
        rightColumn.classList.add('compact-mode');
        compactModeBtn.classList.add('active');
        standardModeBtn.classList.remove('active');
        
        // 初始化紧凑图表
        setTimeout(initCompactCharts, 300);
    } else {
        rightColumn.classList.remove('compact-mode');
        compactModeBtn.classList.remove('active');
        standardModeBtn.classList.add('active');
        
        // 初始化标准图表
        setTimeout(() => {
            if (window.incomeChart) window.incomeChart.resize();
            if (window.downtimeChart) window.downtimeChart.resize();
        }, 300);
    }
}

/**
 * 初始化所有紧凑图表
 */
function initCompactCharts() {
    initIncomeCompactChart();
    initDowntimeCompactChart();
}

/**
 * 初始化收益紧凑图表
 */
function initIncomeCompactChart() {
    const incomeChartCompact = document.getElementById('incomeChartCompact');
    if (!incomeChartCompact) return;
    
    const compactChart = echarts.init(incomeChartCompact);
    
    const option = {
        grid: {
            top: 10,
            right: 10,
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
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisLabel: {
                fontSize: 10
            },
            splitLine: {
                lineStyle: {
                    color: '#eee'
                }
            }
        },
        series: [{
            data: [450, 680, 320, 490, 560, 730, 610],
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
                color: '#39B49A'
            }
        }]
    };
    
    compactChart.setOption(option);
    window.incomeCompactChart = compactChart;
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        if (window.incomeCompactChart) {
            window.incomeCompactChart.resize();
        }
    });
}

/**
 * 初始化停机率紧凑图表
 */
function initDowntimeCompactChart() {
    const downtimeChartCompact = document.getElementById('downtimeChartCompact');
    if (!downtimeChartCompact) return;
    
    const compactChart = echarts.init(downtimeChartCompact);
    
    const option = {
        grid: {
            top: 10,
            right: 10,
            bottom: 20,
            left: 40,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '3月', '5月', '7月', '9月', '11月'],
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisLabel: {
                fontSize: 10,
                formatter: '{value}%'
            },
            splitLine: {
                lineStyle: {
                    color: '#eee'
                }
            }
        },
        series: [{
            data: [1.2, 0.8, 1.5, 0.6, 1.0, 0.8],
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                color: '#39B49A'
            },
            itemStyle: {
                color: '#39B49A'
            }
        }]
    };
    
    compactChart.setOption(option);
    window.downtimeCompactChart = compactChart;
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        if (window.downtimeCompactChart) {
            window.downtimeCompactChart.resize();
        }
    });
}

/**
 * 初始化可折叠面板
 */
function initCollapsiblePanels() {
    const collapsiblePanels = document.querySelectorAll('.panel-collapsible');
    
    collapsiblePanels.forEach(panel => {
        const header = panel.querySelector('.panel-header');
        
        header.addEventListener('click', function() {
            panel.classList.toggle('collapsed');
            
            // 如果面板展开，重新初始化内部图表
            if (!panel.classList.contains('collapsed')) {
                const chartContainer = panel.querySelector('.chart-container');
                if (chartContainer) {
                    const chartId = chartContainer.id;
                    if (chartId === 'incomeChart' && window.incomeChart) {
                        window.incomeChart.resize();
                    } else if (chartId === 'downtimeChart' && window.downtimeChart) {
                        window.downtimeChart.resize();
                    }
                }
            }
        });
    });
} 