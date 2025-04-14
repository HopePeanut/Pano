document.addEventListener('DOMContentLoaded', () => {
    console.log("站点首页 DEMO 初始化...");
    initSiteHomepage();
});

// 模拟当前站点ID (后续可以从URL参数等获取)
let currentSiteId = 1; // 假设当前是站点1

// 模拟站点数据 (后面会扩展)
const mockSiteData = {
    1: {
        name: "重庆南岸区能源站",
        type: "multi", // multi, ess, ev, pv
        capacity: "2MW/4MWh (储能), 12个7kW桩 (充电), 50kWp (光伏)",
        safeRunningDays: 730,
        todayDowntimeRate: 0.5, // 百分比
        cumulativeDowntimeRate: 1.2, // 百分比
        todayDowntimeHours: 0.8, // 今日停机时长(小时)
        downtimeTrend: {
            daily: [0.3, 0.2, 0, 0.5, 0.8, 0.4, 0.2], // 近7天停机率
            weekly: [0.7, 0.8, 0.5, 1.2, 0.9, 0.6, 0.4, 1.2], // 近8周停机率
            monthly: [1.1, 0.9, 1.3, 1.0, 1.2, 1.4] // 近6个月停机率
        },
        fireAlarms: 1, // 告警数量
        cameras: [
            { id: 101, name: "大门入口" },
            { id: 102, name: "储能区A" },
            { id: 103, name: "充电桩" },
            { id: 104, name: "储能区B" },
            { id: 105, name: "周界围栏东" }
        ],
        operatingData: {
            ess: {
                strategy: "峰谷套利",
                powerPlan: [/* 24h */ 50, 60, 70, 80, 90, 100, 110, 120, 100, 80, 60, 50, 50, 60, 70, 150, 180, 200, 190, 160, 120, 100, 80, 60],
                powerActual: [/* 24h */ 45, 55, 68, 75, 88, 95, 105, 118, 98, 78, 58, 48, 49, 59, 69, 145, 175, 198, 185, 155, 115, 98, 79, 58],
                price: [/* 24h */ 0.3, 0.3, 0.3, 0.3, 0.3, 0.8, 0.8, 0.8, 1.2, 1.2, 1.2, 0.8, 0.8, 0.3, 0.3, 0.3, 0.8, 0.8, 1.2, 1.2, 1.2, 0.8, 0.3, 0.3]
            },
            ev: {
                totalPower: 45.5, // kW
                chargingGuns: 8, // 正在充电的数量
                powerCurve: [/* 24h */ 5, 10, 15, 20, 25, 30, 35, 40, 45, 40, 35, 30, 25, 20, 25, 30, 35, 40, 45, 40, 35, 30, 20, 10]
            },
            pv: {
                generationPower: 35.2, // kW
                powerCurve: [/* 24h */ 0, 0, 0, 0, 5, 15, 25, 35, 40, 45, 50, 48, 45, 40, 30, 20, 10, 5, 0, 0, 0, 0, 0, 0]
            }
        }
    },
    2: {
        name: "成都高新区能源站",
        type: "ess",
        capacity: "5MW/10MWh",
        safeRunningDays: 365,
        todayDowntimeRate: 0.1,
        cumulativeDowntimeRate: 0.8,
        todayDowntimeHours: 0.2, // 今日停机时长(小时)
        downtimeTrend: {
            daily: [0.1, 0, 0, 0.2, 0.3, 0.2, 0.1], // 近7天停机率
            weekly: [0.4, 0.6, 0.2, 0.8, 0.3, 0.1, 0.3, 0.7], // 近8周停机率 
            monthly: [0.7, 0.6, 0.9, 0.7, 0.8, 0.5] // 近6个月停机率
        },
        fireAlarms: 0,
        cameras: [
            { id: 201, name: "主入口" },
            { id: 202, name: "PCS室" },
            { id: 203, name: "电池仓1" },
            { id: 204, name: "电池仓2" }
        ],
        operatingData: {
            ess: {
                strategy: "需量控制",
                powerPlan: [/* 24h */ 100, 120, 140, 160, 180, 200, 220, 240, 200, 160, 120, 100, 100, 120, 140, 300, 360, 400, 380, 320, 240, 200, 160, 120],
                powerActual: [/* 24h */ 90, 110, 135, 155, 175, 195, 215, 235, 195, 155, 115, 95, 98, 118, 138, 290, 350, 395, 375, 315, 235, 198, 158, 118],
                price: [/* 24h */ 0.4, 0.4, 0.4, 0.4, 0.4, 0.7, 0.7, 0.7, 1.1, 1.1, 1.1, 0.7, 0.7, 0.4, 0.4, 0.4, 0.7, 0.7, 1.1, 1.1, 1.1, 0.7, 0.4, 0.4]
            }
        }
    },
    3: {
        name: "上海浦东充电站",
        type: "ev",
        capacity: "30个120kW快充桩",
        safeRunningDays: 180,
        todayDowntimeRate: 0.0,
        cumulativeDowntimeRate: 0.5,
        todayDowntimeHours: 0, // 今日停机时长(小时)
        downtimeTrend: {
            daily: [0, 0, 0.1, 0, 0.2, 0, 0], // 近7天停机率
            weekly: [0.2, 0.3, 0.1, 0.5, 0.4, 0.1, 0, 0], // 近8周停机率
            monthly: [0.4, 0.5, 0.6, 0.3, 0.5, 0.2] // 近6个月停机率
        },
        fireAlarms: 0,
        cameras: [
            { id: 301, name: "入口匝道" },
            { id: 302, name: "A区充电位" },
            { id: 303, name: "B区充电位" },
            { id: 304, name: "出口匝道" }
        ],
        operatingData: {
            ev: {
                totalPower: 850.0, // kW
                chargingGuns: 15, // 正在充电的数量
                powerCurve: [/* 24h */ 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 800, 700, 600, 550, 600, 650, 750, 850, 800, 700, 500, 300, 100]
            }
        }
    },
    4: {
        name: "甘肃酒泉光伏电站",
        type: "pv",
        capacity: "10MWp",
        safeRunningDays: 500,
        todayDowntimeRate: 0.2,
        cumulativeDowntimeRate: 1.0,
        todayDowntimeHours: 0.5, // 今日停机时长(小时)
        downtimeTrend: {
            daily: [0.1, 0.3, 0.2, 0, 0.5, 0.4, 0.2], // 近7天停机率
            weekly: [0.8, 0.7, 1.1, 0.9, 1.2, 0.8, 1.0, 0.9], // 近8周停机率
            monthly: [0.9, 1.1, 0.8, 1.0, 1.2, 1.0] // 近6个月停机率
        },
        fireAlarms: 0,
        cameras: [
            { id: 401, name: "升压站" },
            { id: 402, name: "光伏区A-1" },
            { id: 403, name: "光伏区B-3" },
            { id: 404, name: "检修通道" },
            { id: 405, name: "逆变器室" }
        ],
        operatingData: {
            pv: {
                generationPower: 6800.5, // kW
                powerCurve: [/* 24h */ 0, 0, 0, 0, 500, 1500, 3000, 5000, 6500, 7500, 8000, 7800, 7500, 6000, 4000, 2000, 1000, 500, 0, 0, 0, 0, 0, 0]
            }
        }
    }
};

// 页面初始化函数
function initSiteHomepage() {
    // 1. 加载导航栏
    if (typeof loadNavbar === 'function') {
        loadNavbar('站点首页'); // 假设navbar-template.js提供loadNavbar函数
    } else {
        console.error("loadNavbar function not found. Ensure navbar-template.js is loaded correctly.");
    }

    // 2. 设置页面头部信息 (面包屑, 站点名称)
    setupPageHeader(currentSiteId);

    // 3. 加载各个板块的数据 (后续步骤实现)
    loadSiteInfoPanel(currentSiteId);
    loadOperatingOverviewPanel(currentSiteId);
    loadOverallStatusPanel(currentSiteId);
    loadScadaPanel(currentSiteId);
    loadVideoMonitorPanel(currentSiteId);
    loadDowntimeRatePanel(currentSiteId);

    // 4. 添加事件监听器 (后续步骤实现)
    addEventListeners();

    console.log(`已加载站点 ${currentSiteId} 的首页`);
}

// 设置页面头部信息
function setupPageHeader(siteId) {
    const site = mockSiteData[siteId];
    if (!site) {
        console.error(`Site data not found for ID: ${siteId}`);
        return;
    }

    // 更新面包屑
    const breadcrumbContainer = document.querySelector('.breadcrumb-container');
    if (breadcrumbContainer) {
        breadcrumbContainer.innerHTML = `
            <a href="dashboard.html">监控中心</a>
            <span>/</span>
            <a href="#" class="current-site-breadcrumb">${site.name}</a>
        `;
    }

    // 更新当前站点显示名称
    const currentSiteNameSpan = document.getElementById('current-site-name');
    if (currentSiteNameSpan) {
        currentSiteNameSpan.textContent = site.name;
    }
}

// --- 各板块加载函数 (占位符) ---
function loadSiteInfoPanel(siteId) {
    console.log(`加载站点信息板块 for site ${siteId}...`);
    const panel = document.querySelector('.site-info-panel');
    const site = mockSiteData[siteId];

    if (!panel || !site) {
        console.error("无法加载站点信息板块：元素或数据未找到。");
        if(panel) panel.innerHTML = '<h2>站点信息</h2><p>加载错误</p>';
        return;
    }

    // --- 解析装机容量 --- 
    let capacityHtml = '';
    const capacityParts = site.capacity.split(', '); // 基于逗号和空格分割
    capacityParts.forEach(part => {
        let iconClass = 'fa-question-circle'; // 默认图标
        let label = part; // 默认标签

        if (part.includes('储能')) {
            iconClass = 'fa-battery-full capacity-icon ess';
            label = part.replace('(储能)', '').trim();
        } else if (part.includes('充电')) {
            iconClass = 'fa-charging-station capacity-icon ev';
            label = part.replace('(充电)', '').trim();
        } else if (part.includes('光伏')) {
            iconClass = 'fa-solar-panel capacity-icon pv';
            label = part.replace('(光伏)', '').trim();
        }
        
        // 如果成功解析出类型，则添加带图标的条目
        if (iconClass !== 'fa-question-circle') {
             capacityHtml += `
                <div class="info-item capacity-detail">
                    <i class="fas ${iconClass}"></i>
                    <span class="info-value">${label}</span>
                </div>
            `;
        } else {
            // 如果无法解析，直接显示原始文本（作为备用）
             capacityHtml += `
                <div class="info-item capacity-detail">
                     <i class="fas ${iconClass}"></i>
                    <span class="info-value">${part}</span>
                </div>
            `;
        }
    });

    // 使用Font Awesome图标
    panel.innerHTML = `
        <h2>站点信息</h2>
        <div class="info-list">
            <div class="info-item capacity-summary">
                <i class="fas fa-bolt info-icon capacity-icon"></i>
                <span class="info-label">装机容量:</span> 
            </div>
            ${capacityHtml} 
            <div class="info-item">
                <i class="fas fa-shield-alt info-icon safety-icon"></i>
                <span class="info-label">安全运行:</span>
                <span class="info-value">${site.safeRunningDays} 天</span>
            </div>
            <div class="info-item">
                <i class="fas fa-clock info-icon downtime-icon"></i>
                <span class="info-label">今日停机率:</span>
                <span class="info-value">${site.todayDowntimeRate}%</span>
            </div>
            <div class="info-item">
                <i class="fas fa-chart-line info-icon cumulative-downtime-icon"></i>
                <span class="info-label">累计停机率:</span>
                <span class="info-value">${site.cumulativeDowntimeRate}%</span>
            </div>
        </div>
    `;
}

function loadOperatingOverviewPanel(siteId) {
    console.log(`加载运行概况板块 for site ${siteId}...`);
    const panel = document.querySelector('.operating-overview-panel');
    const site = mockSiteData[siteId];

    if (!panel || !site || !site.operatingData) {
        console.error("无法加载运行概况板块：元素或数据未找到。");
        if(panel) panel.innerHTML = '<h2>运行概况</h2><p>加载错误</p>';
        return;
    }

    let contentHtml = '';

    switch (site.type) {
        case 'ess':
            contentHtml = generateEssOverview(site.operatingData.ess);
            break;
        case 'ev':
            contentHtml = generateEvOverview(site.operatingData.ev);
            break;
        case 'pv':
            contentHtml = generatePvOverview(site.operatingData.pv);
            break;
        case 'multi':
            contentHtml = generateMultiOverviewTabs(site.operatingData);
            break;
        default:
            contentHtml = '<p>未知的站点类型</p>';
    }

    panel.innerHTML = `<h2>运行概况</h2>${contentHtml}`;

    // 如果是多元融合站，添加Tab切换事件监听
    if (site.type === 'multi') {
        addMultiOverviewTabListeners(site.operatingData);
        // 默认触发第一个tab的点击事件来加载内容
        const firstTab = panel.querySelector('.overview-tab');
        if (firstTab) firstTab.click(); // 确保点击第一个存在的tab
    }
}

// --- 生成不同类型概况的HTML --- 

// 优化生成包含SVG模拟图表的HTML，让曲线图更逼真
function generatePowerChartPlaceholderHtml(title, legendItems, datasets) {
    let legendHtml = '';
    if (legendItems && legendItems.length > 0) {
        legendHtml = '<div class="chart-legend">';
        legendItems.forEach(item => {
            legendHtml += `<span><i class="fas fa-circle ${item.colorClass}"></i> ${item.label}</span>`;
        });
        legendHtml += '</div>';
    }

    // --- 增强型SVG绘制逻辑 ---
    const svgWidth = 400; // 增加SVG画布宽度，提供更好的细节表现
    const svgHeight = 180; // 增加高度
    const padding = { top: 15, right: 20, bottom: 25, left: 40 }; // 调整内边距
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // 增加网格线
    let gridLines = '';
    // 水平网格线
    const yGridCount = 5;
    for (let i = 0; i <= yGridCount; i++) {
        const y = padding.top + (chartHeight * i) / yGridCount;
        gridLines += `<line class="grid-line" x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" />`;
    }
    // 垂直网格线
    const xGridCount = 6; // 6小时一条线
    for (let i = 0; i <= xGridCount; i++) {
        const x = padding.left + (chartWidth * i) / xGridCount;
        gridLines += `<line class="grid-line" x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}" />`;
    }

    let polylines = '';
    let dots = '';
    let maxY = 0;

    // 查找所有数据中的最大值 (忽略非数值或负数)
    datasets.forEach(ds => {
        if (ds && ds.data && ds.data.length > 0) {
            const currentMax = Math.max(...ds.data.filter(val => typeof val === 'number' && val >= 0));
            if (currentMax > maxY) {
                maxY = currentMax;
            }
        }
    });
    // 防止 maxY 为 0 导致除零错误
    if (maxY === 0) maxY = 1;
    
    // 设置Y轴刻度值
    let yAxisLabels = '';
    for (let i = 0; i <= yGridCount; i++) {
        const yValue = Math.round((maxY * (yGridCount - i)) / yGridCount);
        const y = padding.top + (chartHeight * i) / yGridCount;
        yAxisLabels += `<text class="axis-label y-label" x="${padding.left - 8}" y="${y}" text-anchor="end" alignment-baseline="middle">${yValue}</text>`;
    }

    // 生成X轴坐标点 (24个点均匀分布)
    const xStep = chartWidth / 23; // 23个间隔
    
    // X轴刻度值
    let xAxisLabels = '';
    for (let i = 0; i <= 24; i += 4) {
        const x = padding.left + i * xStep;
        xAxisLabels += `<text class="axis-label x-label" x="${x}" y="${padding.top + chartHeight + 15}" text-anchor="middle">${i}:00</text>`;
    }

    datasets.forEach(ds => {
        if (ds && ds.data && ds.data.length === 24) {
            let points = '';
            ds.data.forEach((value, index) => {
                const x = padding.left + index * xStep;
                const y = padding.top + chartHeight - Math.max(0, (value / maxY) * chartHeight);
                points += `${x.toFixed(1)},${y.toFixed(1)} `;
                
                // 为每个数据点添加小圆点
                if (index % 4 === 0) { // 每4小时一个点，避免过于拥挤
                    dots += `<circle class="data-point ${ds.colorClass}" cx="${x}" cy="${y}" r="3" />`;
                }
            });
            
            // 添加曲线的平滑效果，使用贝塞尔曲线
            let smoothPath = '';
            ds.data.forEach((value, index) => {
                const x = padding.left + index * xStep;
                const y = padding.top + chartHeight - Math.max(0, (value / maxY) * chartHeight);
                
                if (index === 0) {
                    smoothPath += `M ${x},${y} `;
                } else {
                    // 使用平滑的曲线连接各点
                    const prevX = padding.left + (index - 1) * xStep;
                    const prevY = padding.top + chartHeight - Math.max(0, (ds.data[index - 1] / maxY) * chartHeight);
                    
                    const cpX1 = prevX + (x - prevX) / 3;
                    const cpX2 = prevX + 2 * (x - prevX) / 3;
                    
                    smoothPath += `C ${cpX1},${prevY} ${cpX2},${y} ${x},${y} `;
                }
            });
            
            // 添加渐变区域填充在曲线下方
            const gradientId = `gradient-${ds.colorClass}`;
            const areaPath = `${smoothPath} L ${padding.left + 23 * xStep},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`;
            
            // 定义渐变
            polylines += `
                <defs>
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" class="gradient-stop-top ${ds.colorClass}" />
                        <stop offset="100%" class="gradient-stop-bottom" />
                    </linearGradient>
                </defs>
                <path class="area-path" d="${areaPath}" fill="url(#${gradientId})" opacity="0.2" />
                <path class="chart-line ${ds.colorClass}" d="${smoothPath}" />
            `;
        }
    });

    // 轴线
    const axisLines = `
        <line class="axis-line" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}"/>
        <line class="axis-line" x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"/>
    `;

    const svgContent = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            ${gridLines}
            ${axisLines}
            ${polylines}
            ${dots}
            ${yAxisLabels}
            ${xAxisLabels}
        </svg>
    `;

    return `
        <div class="chart-container overview-chart">
            <div class="chart-title">${title}</div>
            ${svgContent} 
            ${legendHtml}
        </div>
    `;
}

// 优化储能概况展示 - 修改当前策略显示方式
function generateEssOverview(data) {
    if (!data) return '<p>储能数据缺失</p>';
    
    // 静态充放电数据
    const staticData = {
        powerPlan: [200, 300, 400, 500, 800, 600, 400, 200, 0, -200, -400, -600, -800, -600, -400, -200, 0, 200, 400, 600, 800, 600, 400, 200],
        powerActual: [180, 280, 420, 480, 750, 580, 420, 220, 30, -180, -350, -620, -780, -590, -420, -190, 20, 180, 420, 590, 750, 620, 380, 220]
    };
    
    const chartTitle = "24小时功率曲线 (kW)";
    const legendItems = [
        { label: "计划功率", colorClass: "plan-color" },
        { label: "实际功率", colorClass: "actual-color" },
        { label: "电价(元/kWh)", colorClass: "price-color" }
    ];
    
    // 使用静态数据
    const datasets = [
        { data: staticData.powerPlan, colorClass: "plan-color" },
        { data: staticData.powerActual, colorClass: "actual-color" }
    ];
    
    const chartHtml = generatePowerChartPlaceholderHtml(chartTitle, legendItems, datasets);

    return `
        <div class="overview-content">
            <div class="strategy-display">
                <div class="strategy-label">
                    <i class="fas fa-chart-line"></i>
                    <span>当前策略:</span>
                </div>
                <div class="strategy-value">${data.strategy || '峰谷套利'}</div>
            </div>
            
            <div class="overview-metrics">
                <div class="metric-item">
                    <div class="metric-icon soc-icon">
                        <i class="fas fa-battery-three-quarters"></i>
                    </div>
                    <div class="metric-data">
                        <span class="metric-value">${data.soc || '65'}%</span>
                        <span class="metric-label">当前SOC</span>
                    </div>
                </div>
                
                <div class="metric-item">
                    <div class="metric-icon power-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="metric-data">
                        <span class="metric-value">${data.currentPower || '+380'} kW</span>
                        <span class="metric-label">实时功率</span>
                    </div>
                </div>
            </div>
            
            ${chartHtml}
        </div>
    `;
}

// 优化充电桩概况展示
function generateEvOverview(data) {
    if (!data) return '<p>充电桩数据缺失</p>';
    
    // 静态充电功率曲线数据
    const staticData = {
        powerCurve: [120, 180, 250, 280, 310, 350, 420, 480, 520, 580, 620, 680, 720, 680, 620, 580, 540, 480, 420, 380, 320, 280, 220, 180]
    };
    
    // 信息展示区
    const infoHtml = `
        <div class="overview-info-grid">
            <div class="overview-metric-card">
                <div class="metric-card-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <div class="metric-card-data">
                    <span class="metric-card-value">${data.totalPower !== undefined ? data.totalPower.toFixed(1) : '520.5'} kW</span>
                    <span class="metric-card-label">当前总功率</span>
                </div>
            </div>
            
            <div class="overview-metric-card">
                <div class="metric-card-icon">
                    <i class="fas fa-charging-station"></i>
                </div>
                <div class="metric-card-data">
                    <span class="metric-card-value">${data.chargingGuns !== undefined ? data.chargingGuns : '8'}</span>
                    <span class="metric-card-label">正在充电枪数</span>
                </div>
            </div>
            
            <div class="overview-metric-card usage-card">
                <div class="metric-card-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="metric-card-data">
                    <span class="metric-card-value">${data.usageRate || '66.7'}%</span>
                    <span class="metric-card-label">枪位利用率</span>
                </div>
                <div class="usage-progress">
                    <div class="usage-bar" style="width: ${data.usageRate || '66.7'}%"></div>
                </div>
            </div>
        </div>
    `;
    
    // 功率曲线图
    const chartTitle = "24小时充电功率 (kW)";
    const legendItems = [
        { label: "充电功率", colorClass: "ev-power-color" }
    ];
    const datasets = [
        { data: staticData.powerCurve, colorClass: "ev-power-color" }
    ];
    const chartHtml = generatePowerChartPlaceholderHtml(chartTitle, legendItems, datasets);

    return `<div class="overview-content">${infoHtml}${chartHtml}</div>`;
}

// 优化光伏概况展示
function generatePvOverview(data) {
    if (!data) return '<p>光伏数据缺失</p>';
    
    // 静态发电功率曲线数据 - 模拟日出到日落的发电曲线
    const staticData = {
        powerCurve: [0, 0, 0, 0, 0, 5, 20, 80, 150, 280, 350, 410, 430, 420, 380, 320, 230, 140, 60, 10, 0, 0, 0, 0]
    };
    
    // 计算发电效率百分比
    const powerPercent = 80; // 静态效率
    
    // 信息显示区
    const infoHtml = `
        <div class="overview-content">
            <div class="pv-status-card">
                <div class="pv-icon-container">
                    <i class="fas fa-sun pv-sun-icon"></i>
                </div>
                <div class="pv-data-container">
                    <div class="pv-data-row">
                        <div class="pv-data-item">
                            <span class="pv-data-value">${data.generationPower !== undefined ? data.generationPower.toFixed(1) : '415.8'} kW</span>
                            <span class="pv-data-label">当前发电功率</span>
                        </div>
                        <div class="pv-data-item">
                            <span class="pv-data-value">${data.todayGeneration || '1980'} kWh</span>
                            <span class="pv-data-label">今日发电量</span>
                        </div>
                    </div>
                    
                    <div class="pv-efficiency-container">
                        <div class="pv-efficiency-label">
                            <span>发电效率</span>
                            <span class="pv-efficiency-value">${powerPercent}%</span>
                        </div>
                        <div class="pv-efficiency-bar">
                            <div class="pv-efficiency-fill" style="width: ${powerPercent}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${generatePowerChartPlaceholderHtml(
                "24小时发电功率 (kW)", 
                [{ label: "发电功率", colorClass: "pv-power-color" }], 
                [{ data: staticData.powerCurve, colorClass: "pv-power-color" }]
            )}
        </div>
    `;

    return infoHtml;
}

// 保持多元融合站Tab切换逻辑不变
function generateMultiOverviewTabs(data) {
    let tabsHtml = '<div class="overview-tabs">';
    if (data.ess) tabsHtml += '<button class="overview-tab" data-type="ess">储能</button>';
    if (data.ev) tabsHtml += '<button class="overview-tab" data-type="ev">充电</button>';
    if (data.pv) tabsHtml += '<button class="overview-tab" data-type="pv">光伏</button>';
    tabsHtml += '</div>';

    // 内容容器，初始为空，由tab点击事件填充
    tabsHtml += '<div class="overview-tab-content"></div>'; 

    return tabsHtml;
}

// --- 多元融合站Tab切换逻辑 --- 

function addMultiOverviewTabListeners(operatingData) {
    const panel = document.querySelector('.operating-overview-panel');
    const tabs = panel.querySelectorAll('.overview-tab');
    const contentContainer = panel.querySelector('.overview-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除其他tab的active状态
            tabs.forEach(t => t.classList.remove('active'));
            // 给当前tab添加active状态
            tab.classList.add('active');

            const type = tab.dataset.type;
            let content = '';
            switch (type) {
                case 'ess':
                    content = generateEssOverview(operatingData.ess);
                    break;
                case 'ev':
                    content = generateEvOverview(operatingData.ev);
                    break;
                case 'pv':
                    content = generatePvOverview(operatingData.pv);
                    break;
            }
            contentContainer.innerHTML = content;
        });
    });
}

function loadOverallStatusPanel(siteId) {
    console.log(`加载运行总览板块 for site ${siteId}...`);
    const panel = document.querySelector('.overall-status-panel');
    const site = mockSiteData[siteId];

    if (!panel || !site) {
        console.error("无法加载运行总览板块：元素或数据未找到。");
        if(panel) panel.innerHTML = '<h2>运行总览</h2><p>加载错误</p>';
        return;
    }

    // 模拟 & 构建运行总览数据 (实际应用中从后端获取)
    const overallData = getOverallStatusData(site);

    // 生成总览面板的HTML
    let cardsHtml = '';

    // 1. 站点总状态卡片
    cardsHtml += generateStatusCard({
        title: '站点状态',
        status: overallData.status,
        icon: 'fa-building',
        mainText: overallData.statusText,
        value: '', // 无数值
        isMain: true // 主状态卡片样式稍大
    });

    // 2. 设备在线情况卡片
    cardsHtml += generateStatusCard({
        title: '设备在线情况',
        status: overallData.deviceStatus.offline > 0 ? 'warning' : 'normal',
        icon: 'fa-server',
        mainText: overallData.deviceStatus.statusText,
        value: `${overallData.deviceStatus.online}/${overallData.deviceStatus.total}`,
        valueLabel: '在线率'
    });

    // 3. 根据站点类型生成系统特定卡片
    // 3.1 储能系统卡片 (type = ess 或 multi)
    if (site.type === 'ess' || site.type === 'multi') {
        if (overallData.systems.ess) {
            const essData = overallData.systems.ess;
            const chargingIcon = essData.chargingStatus === 'charging' ? 'fa-arrow-circle-down' : 
                                (essData.chargingStatus === 'discharging' ? 'fa-arrow-circle-up' : 'fa-pause-circle');
            const chargingLabel = essData.chargingStatus === 'charging' ? '充电中' : 
                                 (essData.chargingStatus === 'discharging' ? '放电中' : '待机中');
            
            cardsHtml += generateStatusCard({
                title: '储能系统',
                status: essData.status,
                icon: 'fa-battery-three-quarters',
                mainText: chargingLabel,
                secondaryText: `SOC: ${essData.soc}%`,
                value: essData.powerDisplay,
                valueLabel: '功率'
            });
        }
    }

    // 3.2 充电站系统卡片 (type = ev 或 multi)
    if (site.type === 'ev' || site.type === 'multi') {
        if (overallData.systems.ev) {
            const evData = overallData.systems.ev;
            cardsHtml += generateStatusCard({
                title: '充电系统',
                status: evData.status,
                icon: 'fa-charging-station',
                mainText: `${evData.chargingGuns}/${evData.totalGuns} 枪使用中`,
                value: `${evData.power.toFixed(1)} kW`,
                valueLabel: '当前功率'
            });
        }
    }

    // 3.3 光伏系统卡片 (type = pv 或 multi)
    if (site.type === 'pv' || site.type === 'multi') {
        if (overallData.systems.pv) {
            const pvData = overallData.systems.pv;
            cardsHtml += generateStatusCard({
                title: '光伏系统',
                status: pvData.status,
                icon: 'fa-solar-panel',
                mainText: '发电中',
                value: `${pvData.generationPower.toFixed(1)} kW`,
                valueLabel: '发电功率'
            });
        }
    }

    // 4. 消防状态卡片 (所有站点都有)
    if (overallData.systems.fire) {
        const fireData = overallData.systems.fire;
        cardsHtml += generateStatusCard({
            title: '消防状态',
            status: fireData.status,
            icon: 'fa-fire-extinguisher',
            mainText: fireData.alarmText,
            value: fireData.alarmCount.toString(),
            valueLabel: '告警数'
        });
    }

    // 5. 更新时间 (所有卡片共用)
    const timeString = new Date().toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 填充面板内容
    panel.innerHTML = `
        <h2>运行总览<span class="status-update-time">更新时间: ${timeString}</span></h2>
        <div class="status-cards-container">
            ${cardsHtml}
        </div>
    `;
}

// 辅助函数: 根据站点获取总览状态数据 (实际应用中从后端API获取)
function getOverallStatusData(site) {
    // 如果站点已有overallStatus数据，则直接使用
    if (site.overallStatus) {
        return site.overallStatus;
    }

    // 否则，基于站点其他可用数据构建模拟的总览数据
    
    // 1. 站点总状态 (基于fireAlarms)
    let status = site.fireAlarms > 0 ? 'warning' : 'normal';
    let statusText = site.fireAlarms > 0 ? `${site.fireAlarms}个告警` : '正常运行中';
    
    // 2. 设备在线情况 (模拟)
    const totalDevices = 20; // 模拟值
    const offlineDevices = Math.round(site.todayDowntimeRate * 5); // 基于停机率估算
    const onlineDevices = totalDevices - offlineDevices;
    
    // 3. 系统特定数据 (基于站点类型和现有数据)
    const systems = {};
    
    // 3.1 储能系统
    if (site.type === 'ess' || site.type === 'multi') {
        // 模拟SOC在40-80%之间
        const soc = Math.round(40 + Math.random() * 40);
        // 充放电状态，随机生成
        const states = ['charging', 'discharging', 'idle'];
        const chargingStatus = states[Math.floor(Math.random() * 3)];
        
        // 功率，充电为正，放电为负
        let power = 0;
        if (chargingStatus === 'charging') {
            power = Math.round((100 + Math.random() * 900) * 10) / 10; // 100-1000kW
        } else if (chargingStatus === 'discharging') {
            power = -Math.round((100 + Math.random() * 900) * 10) / 10; // -100至-1000kW
        }
        
        systems.ess = {
            status: 'normal',
            soc: soc,
            chargingStatus: chargingStatus,
            power: power,
            powerDisplay: power >= 0 ? `+${power.toFixed(1)} kW` : `${power.toFixed(1)} kW`
        };
    }
    
    // 3.2 充电系统
    if (site.type === 'ev' || site.type === 'multi') {
        // 使用operatingData中的数据，如果有
        const totalGuns = site.type === 'multi' ? 12 : 30; // 模拟值
        let chargingGuns = 0;
        let power = 0;
        
        if (site.operatingData && site.operatingData.ev) {
            chargingGuns = site.operatingData.ev.chargingGuns;
            power = site.operatingData.ev.totalPower;
        } else {
            // 模拟数据
            chargingGuns = Math.round(totalGuns * 0.3 + Math.random() * totalGuns * 0.4); // 30-70%使用率
            power = chargingGuns * (50 + Math.random() * 20); // 每枪50-70kW
        }
        
        systems.ev = {
            status: 'normal',
            chargingGuns: chargingGuns,
            totalGuns: totalGuns,
            power: power
        };
    }
    
    // 3.3 光伏系统
    if (site.type === 'pv' || site.type === 'multi') {
        // 使用operatingData中的数据，如果有
        let generationPower = 0;
        
        if (site.operatingData && site.operatingData.pv) {
            generationPower = site.operatingData.pv.generationPower;
        } else {
            // 模拟数据：根据站点容量估算
            const maxCapacity = site.type === 'multi' ? 50 : 10000; // kW/kWp
            const timeRatio = getTimeBasedGenerationRatio(); // 基于当前时间的系数 (0-1)
            generationPower = maxCapacity * timeRatio * (0.7 + Math.random() * 0.3); // 考虑随机变化
        }
        
        systems.pv = {
            status: 'normal',
            generationPower: generationPower
        };
    }
    
    // 3.4 消防系统 (所有站点都有)
    systems.fire = {
        status: site.fireAlarms > 0 ? 'warning' : 'normal',
        alarmCount: site.fireAlarms,
        alarmText: site.fireAlarms > 0 ? `消防告警` : '无告警'
    };
    
    // 返回组装好的总览数据
    return {
        status: status,
        statusText: statusText,
        deviceStatus: {
            total: totalDevices,
            online: onlineDevices,
            offline: offlineDevices,
            statusText: offlineDevices > 0 ? `部分离线 ` : `全部在线 `
        },
        systems: systems
    };
}

// 辅助函数: 根据当前时间获取光伏发电比例系数 (0-1)
function getTimeBasedGenerationRatio() {
    const now = new Date();
    const hour = now.getHours();
    
    // 夜晚无发电
    if (hour < 6 || hour > 19) {
        return 0;
    }
    
    // 中午发电最大
    if (hour >= 10 && hour <= 14) {
        return 0.8 + Math.random() * 0.2; // 80-100%
    }
    
    // 早晚发电较少
    if (hour < 10) {
        return (hour - 6) * 0.2; // 6点0%, 逐渐升高
    } else {
        return (19 - hour) * 0.2; // 19点0%，逐渐降低
    }
}

// 辅助函数: 生成状态卡片HTML
function generateStatusCard(options) {
    const { 
        title, status, icon, mainText, secondaryText = '', 
        value = '', valueLabel = '', isMain = false 
    } = options;
    
    // 根据状态确定颜色类
    const statusClass = `status-${status}`; // normal, warning, error
    
    // 卡片尺寸类
    const sizeClass = isMain ? 'status-card-large' : '';
    
    // 如果有值，则显示值和标签
    let valueHtml = '';
    if (value !== '') {
        valueHtml = `
            <div class="status-value">
                <span class="value">${value}</span>
                ${valueLabel ? `<span class="value-label">${valueLabel}</span>` : ''}
            </div>
        `;
    }
    
    // 如果有次要文本，则显示
    let secondaryTextHtml = secondaryText ? `<div class="status-secondary-text">${secondaryText}</div>` : '';
    
    return `
        <div class="status-card ${statusClass} ${sizeClass}">
            <div class="status-header">
                <span class="status-title">${title}</span>
                <span class="status-indicator"></span>
            </div>
            <div class="status-body">
                <div class="status-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="status-content">
                    <div class="status-main-text">${mainText}</div>
                    ${secondaryTextHtml}
                </div>
                ${valueHtml}
            </div>
        </div>
    `;
}

function loadScadaPanel(siteId) {
    console.log(`加载SCADA图板块 for site ${siteId}...`);
    const panel = document.querySelector('.scada-panel');
    if(panel) panel.innerHTML = '<h2>SCADA图</h2><p>加载中...</p>';
}

// 修改视频监控板块，改为单视频自动切换
function loadVideoMonitorPanel(siteId) {
    console.log(`加载视频监控板块 for site ${siteId}...`);
    const panel = document.querySelector('.video-monitor-panel');

    if (!panel) {
        console.error("无法加载视频监控板块：元素未找到。");
        return;
    }

    // 定义所有摄像头数据
    const cameras = [
        { id: 'cam1', name: '大门入口', imgUrl: 'https://picsum.photos/id/1076/400/225' },
        { id: 'cam2', name: '储能区A', imgUrl: 'https://picsum.photos/id/1080/400/225' },
        { id: 'cam3', name: '充电桩', imgUrl: 'https://picsum.photos/id/1015/400/225' },
        { id: 'cam4', name: '储能区B', imgUrl: 'https://picsum.photos/id/1066/400/225' }
    ];

    // 创建HTML结构 - 只有一个大视频区域
    panel.innerHTML = `
        <h2>视频监控<span class="video-controls">
            <button id="prev-camera" title="上一个摄像头"><i class="fas fa-chevron-left"></i></button>
            <span id="camera-indicator">1/4</span>
            <button id="next-camera" title="下一个摄像头"><i class="fas fa-chevron-right"></i></button>
            <button id="toggle-autoswitch" class="active" title="自动切换"><i class="fas fa-sync-alt"></i></button>
        </span></h2>
        <div class="single-video-container">
            <div class="video-card large-video" id="current-video">
                <div class="video-overlay">
                    <div class="camera-name">${cameras[0].name}</div>
                    <div class="video-play-button">
                        <i class="fas fa-play-circle"></i>
                </div>
            </div>
                <img src="${cameras[0].imgUrl}" alt="${cameras[0].name}" class="video-thumbnail">
            </div>
        </div>
    `;

    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .single-video-container {
            width: 100%;
            height: calc(100% - 40px);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }
        .large-video {
            width: 100%;
            height: 100%;
            margin: 0;
        }
        .video-controls {
            font-size: 14px;
            margin-left: 15px;
            display: inline-flex;
            align-items: center;
        }
        .video-controls button {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .video-controls button:hover {
            background-color: rgba(0,0,0,0.1);
        }
        .video-controls button.active {
            color: #49A18D;
        }
        #camera-indicator {
            margin: 0 10px;
            color: #666;
        }
    `;
    document.head.appendChild(style);

    // 当前摄像头索引和自动切换状态
    let currentCameraIndex = 0;
    let autoSwitchEnabled = true;
    let autoSwitchInterval = null;

    // 获取控制元素
    const prevButton = document.getElementById('prev-camera');
    const nextButton = document.getElementById('next-camera');
    const toggleAutoSwitch = document.getElementById('toggle-autoswitch');
    const cameraIndicator = document.getElementById('camera-indicator');
    const videoElement = document.getElementById('current-video');

    // 更新显示的摄像头
    function updateCamera() {
        const camera = cameras[currentCameraIndex];
        
        // 更新摄像头名称、图像和指示器
        document.querySelector('.camera-name').textContent = camera.name;
        document.querySelector('.video-thumbnail').src = camera.imgUrl;
        document.querySelector('.video-thumbnail').alt = camera.name;
        cameraIndicator.textContent = `${currentCameraIndex + 1}/${cameras.length}`;
        
        // 添加切换动画
        videoElement.classList.add('switching');
        setTimeout(() => videoElement.classList.remove('switching'), 500);
    }

    // 开始自动切换
    function startAutoSwitch() {
        if (autoSwitchInterval) clearInterval(autoSwitchInterval);
        
        autoSwitchInterval = setInterval(() => {
            currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
            updateCamera();
        }, 5000); // 每5秒切换一次
    }

    // 停止自动切换
    function stopAutoSwitch() {
        if (autoSwitchInterval) {
            clearInterval(autoSwitchInterval);
            autoSwitchInterval = null;
        }
    }

    // 切换到上一个摄像头
    prevButton.addEventListener('click', () => {
        currentCameraIndex = (currentCameraIndex - 1 + cameras.length) % cameras.length;
        updateCamera();
        
        // 点击手动切换时暂停自动切换
        if (autoSwitchEnabled) {
            stopAutoSwitch();
            startAutoSwitch(); // 重置计时器
        }
    });

    // 切换到下一个摄像头
    nextButton.addEventListener('click', () => {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        updateCamera();
        
        // 点击手动切换时暂停自动切换
        if (autoSwitchEnabled) {
            stopAutoSwitch();
            startAutoSwitch(); // 重置计时器
        }
    });

    // 切换自动轮播
    toggleAutoSwitch.addEventListener('click', () => {
        autoSwitchEnabled = !autoSwitchEnabled;
        toggleAutoSwitch.classList.toggle('active');
        
        if (autoSwitchEnabled) {
            startAutoSwitch();
        } else {
            stopAutoSwitch();
        }
    });

    // 点击视频播放按钮的交互效果
    videoElement.addEventListener('click', function() {
        const overlay = this.querySelector('.video-overlay');
        overlay.classList.toggle('playing');
        
        if (overlay.classList.contains('playing')) {
            overlay.querySelector('.video-play-button').innerHTML = '<i class="fas fa-pause-circle"></i>';
    } else {
            overlay.querySelector('.video-play-button').innerHTML = '<i class="fas fa-play-circle"></i>';
        }
    });

    // 初始启动自动切换
    if (autoSwitchEnabled) {
        startAutoSwitch();
    }

    // 添加动画CSS
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        .video-card.switching {
            animation: fadeSwitch 0.5s ease;
        }
        @keyframes fadeSwitch {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .video-overlay.playing .camera-name {
            background-color: rgba(73, 161, 141, 0.7);
        }
    `;
    document.head.appendChild(animationStyle);
}

function loadDowntimeRatePanel(siteId) {
    console.log(`加载停机率板块 for site ${siteId}...`);
    const panel = document.querySelector('.downtime-rate-panel');
    const site = mockSiteData[siteId];

    if (!panel || !site) {
        console.error("无法加载停机率板块：元素或数据未找到。");
        if(panel) panel.innerHTML = '<h2>非计划停机率</h2><p>加载错误</p>';
        return;
    }

    // 准备基础数据
    const todayHours = site.todayDowntimeHours;
    const cumulativeRate = site.cumulativeDowntimeRate;
    const trendData = site.downtimeTrend;

    // 初始化当前选择的周期
    let currentPeriod = 'daily'; // 默认显示日视图
    
    // 构建内容结构
    let contentHtml = `
        <div class="downtime-info-container">
            <div class="downtime-info-item">
                <i class="fas fa-clock downtime-icon"></i>
                <div class="downtime-info-content">
                    <span class="downtime-label">今日停机时长</span>
                    <span class="downtime-value">${todayHours.toFixed(1)} 小时</span>
                </div>
            </div>
            <div class="downtime-info-item">
                <i class="fas fa-triangle-exclamation downtime-icon"></i>
                <div class="downtime-info-content">
                    <span class="downtime-label">累计停机率</span>
                    <span class="downtime-value">${cumulativeRate.toFixed(1)}%</span>
                </div>
            </div>
        </div>
        
        <div class="downtime-trend-container">
            <div class="trend-header">
                <div class="trend-title">停机率趋势</div>
                <div class="trend-period-selector">
                    <button class="period-btn active" data-period="daily">日</button>
                    <button class="period-btn" data-period="weekly">周</button>
                    <button class="period-btn" data-period="monthly">月</button>
                </div>
            </div>
            <div class="trend-chart-container" id="downtime-trend-chart">
                <!-- 图表将在这里生成 -->
            </div>
        </div>
    `;

    panel.innerHTML = `<h2>非计划停机率</h2>${contentHtml}`;

    // 生成趋势图表
    generateDowntimeTrendChart(site, currentPeriod);
    
    // 添加周期切换按钮的事件监听
    const periodButtons = panel.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新活动按钮样式
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 获取选择的周期并重新生成图表
            const selectedPeriod = btn.dataset.period;
            generateDowntimeTrendChart(site, selectedPeriod);
        });
    });
}

// 生成停机率趋势图表
function generateDowntimeTrendChart(site, period) {
    // 获取对应周期的数据
    const data = site.downtimeTrend[period];
    if (!data || data.length === 0) {
        console.error(`${period}期停机率趋势数据不可用`);
        return;
    }
    
    // 图表配置
    const svgWidth = 280;
    const svgHeight = 180;
    const padding = { top: 20, right: 15, bottom: 30, left: 25 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;
    
    // 找出数据的最大值(为了Y轴刻度)
    const maxValue = Math.max(...data) * 1.2; // 添加20%空间
    
    // 计算X轴和Y轴的刻度
    const xStep = chartWidth / (data.length - 1);
    
    // 生成图表
    let svg = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="trend-chart">`;
    
    // 绘制Y轴
    svg += `<line class="chart-axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}"/>`;
    
    // 绘制X轴
    svg += `<line class="chart-axis" x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"/>`;
    
    // 绘制图表背景网格线
    const gridCount = 4; // 水平网格线数量
    for (let i = 1; i <= gridCount; i++) {
        const y = padding.top + (chartHeight / gridCount) * i;
        svg += `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"/>`;
    }
    
    // 绘制Y轴刻度和标签
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
        const y = padding.top + chartHeight - (chartHeight / yTickCount) * i;
        const value = (maxValue / yTickCount) * i;
        svg += `<line class="chart-tick" x1="${padding.left - 3}" y1="${y}" x2="${padding.left}" y2="${y}"/>`;
        svg += `<text class="chart-label y-label" x="${padding.left - 5}" y="${y}" text-anchor="end">${value.toFixed(1)}%</text>`;
    }
    
    // 绘制X轴标签
    for (let i = 0; i < data.length; i++) {
        const x = padding.left + i * xStep;
        const labelText = getXAxisLabel(period, i, data.length);
        if (i % 2 === 0) { // 隔一个显示一个，避免拥挤
            svg += `<text class="chart-label x-label" x="${x}" y="${padding.top + chartHeight + 15}" text-anchor="middle">${labelText}</text>`;
        }
    }
    
    // 绘制数据点和折线
    let pathPoints = '';
    let barWidth = 0;
    
    // 柱状图模式 - 仅在数据点较少时使用
    if (period === 'monthly' || data.length <= 12) {
        barWidth = Math.min(25, (chartWidth / data.length) * 0.6); // 柱宽为可用宽度的60%，最大25px
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const x = padding.left + i * xStep;
            const barHeight = (value / maxValue) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            
            // 绘制柱子
            svg += `<rect class="chart-bar" x="${x - barWidth/2}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2"></rect>`;
            
            // 需要时在柱子上方添加数值标签
            svg += `<text class="chart-value-label" x="${x}" y="${y - 5}" text-anchor="middle">${value.toFixed(1)}%</text>`;
        }
    } 
    // 折线图模式 - 用于数据点较多的情况
    else {
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const x = padding.left + i * xStep;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            if (i === 0) {
                pathPoints += `M ${x},${y}`;
            } else {
                pathPoints += ` L ${x},${y}`;
            }
            
            // 添加数据点
            svg += `<circle class="chart-point" cx="${x}" cy="${y}" r="3"></circle>`;
        }
        
        // 绘制折线
        svg += `<path class="chart-line" d="${pathPoints}"></path>`;
    }
    
    svg += '</svg>';
    
    // 将SVG插入到页面中
    const chartContainer = document.getElementById('downtime-trend-chart');
    if (chartContainer) {
        chartContainer.innerHTML = svg;
    }
}

// 辅助函数：根据周期生成X轴标签
function getXAxisLabel(period, index, total) {
    switch(period) {
        case 'daily':
            // 最近7天，标签显示为"今天"、"昨天"、"前天"，以及"3天前"等
            const days = ['今天', '昨天', '前天', '3天前', '4天前', '5天前', '6天前'];
            return days[index] || `${index}天前`;
            
        case 'weekly':
            // 最近几周，标签显示为"本周"、"上周"，以及"3周前"等
            const weeks = ['本周', '上周', '前2周', '前3周', '前4周', '前5周', '前6周', '前7周'];
            return weeks[index] || `${index}周前`;
            
        case 'monthly':
            // 最近几个月，标签显示为"本月"、"上月"，以及"3月前"等
            const months = ['本月', '上月', '前2月', '前3月', '前4月', '前5月', '前6月'];
            return months[index] || `${index}月前`;
            
        default:
            return index.toString();
    }
}

// --- 事件监听器添加函数 (占位符) ---
function addEventListeners() {
    console.log("添加事件监听器...");
    // 搜索/切换按钮
    const switchBtn = document.getElementById('site-switch-btn');
    if(switchBtn) switchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('site-search-input');
        alert(`搜索/切换站点: ${searchInput.value || '未输入'} (功能待实现)`);
    });

    // 设备监控按钮
    const monitorBtn = document.getElementById('device-monitor-btn');
    if(monitorBtn) monitorBtn.addEventListener('click', () => {
        alert('云平台同事在开发数字孪生页面，因此该部分功能demo暂不绘制');
    });
}

// --- 模拟站点切换 (示例，后续完善) ---
function switchSite(newSiteId) {
    if (mockSiteData[newSiteId]) {
        currentSiteId = newSiteId;
        console.log(`Switching to site: ${newSiteId}`);
        // 清空现有内容或显示加载状态
        document.querySelectorAll('.grid-item').forEach(item => item.innerHTML = '加载中...');
        // 重新初始化页面内容
        setupPageHeader(currentSiteId);
        loadSiteInfoPanel(currentSiteId);
        loadOperatingOverviewPanel(currentSiteId);
        loadOverallStatusPanel(currentSiteId);
        loadScadaPanel(currentSiteId);
        loadVideoMonitorPanel(currentSiteId);
        loadDowntimeRatePanel(currentSiteId);
    } else {
        alert('找不到该站点！');
    }
}

function loadScadaPanel(siteId) {
    console.log(`加载SCADA图板块 for site ${siteId}...`);
    const panel = document.querySelector('.scada-panel');
    const site = mockSiteData[siteId];

    if (!panel || !site) {
        console.error("无法加载SCADA图板块：元素或数据未找到。");
        if(panel) panel.innerHTML = '<h2>SCADA图</h2><p>加载错误</p>';
        return;
    }

    // SCADA图内容
    panel.innerHTML = `
        <h2>SCADA图<span class="scada-update-time">实时更新中</span></h2>
        <div class="scada-container">
            <svg id="scada-svg" width="100%" height="500" viewBox="0 0 1000 500">
                <!-- 绘制区域将在JS中动态生成 -->
            </svg>
            <div id="scada-controls">
                <button id="scada-zoom-in"><i class="fas fa-plus"></i></button>
                <button id="scada-zoom-out"><i class="fas fa-minus"></i></button>
                <button id="scada-reset"><i class="fas fa-sync-alt"></i></button>
            </div>
        </div>
        <div id="scada-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div id="scada-modal-content"></div>
            </div>
        </div>
    `;

    // 创建并初始化SCADA图
    createScadaElements(site);
    
    // 添加事件监听
    addScadaEventListeners();
    
    // 开始动画
    startScadaAnimations();
}

// 创建SCADA图中的所有元素
function createScadaElements(site) {
    const svg = document.getElementById('scada-svg');
    if (!svg) return;
    
    // 清空现有内容
    svg.innerHTML = '';
    
    // 创建定义区域（用于箭头等重复使用的元素）
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // 电流流动动画的箭头标记
    const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    arrowMarker.setAttribute('id', 'arrow');
    arrowMarker.setAttribute('markerWidth', '10');
    arrowMarker.setAttribute('markerHeight', '10');
    arrowMarker.setAttribute('refX', '0');
    arrowMarker.setAttribute('refY', '3');
    arrowMarker.setAttribute('orient', 'auto');
    arrowMarker.setAttribute('markerUnits', 'strokeWidth');
    
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M0,0 L0,6 L6,3 z');
    arrowPath.setAttribute('fill', '#4a90e2');
    
    arrowMarker.appendChild(arrowPath);
    defs.appendChild(arrowMarker);
    
    // 添加电流流动动画
    const flowAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    flowAnimation.setAttribute('attributeName', 'stroke-dashoffset');
    flowAnimation.setAttribute('values', '24;0');
    flowAnimation.setAttribute('dur', '2s');
    flowAnimation.setAttribute('repeatCount', 'indefinite');
    
    // SVG滤镜 - 发光效果（用于告警状态）
    const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glowFilter.setAttribute('id', 'glow');
    glowFilter.setAttribute('x', '-30%');
    glowFilter.setAttribute('y', '-30%');
    glowFilter.setAttribute('width', '160%');
    glowFilter.setAttribute('height', '160%');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '2.5');
    feGaussianBlur.setAttribute('result', 'blur');
    
    const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix.setAttribute('in', 'blur');
    feColorMatrix.setAttribute('type', 'matrix');
    feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
    feColorMatrix.setAttribute('result', 'glow');
    
    const feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    feBlend.setAttribute('in', 'SourceGraphic');
    feBlend.setAttribute('in2', 'glow');
    feBlend.setAttribute('mode', 'normal');
    
    glowFilter.appendChild(feGaussianBlur);
    glowFilter.appendChild(feColorMatrix);
    glowFilter.appendChild(feBlend);
    defs.appendChild(glowFilter);
    
    svg.appendChild(defs);
    
    // 开始绘制SCADA图元素
    // 1. 外部电网
    drawExternalGrid(svg, flowAnimation);
    
    // 2. 变压器
    drawTransformer(svg, flowAnimation);
    
    // 3. 母线
    drawBusbar(svg, flowAnimation);
    
    // 4. 储能系统
    drawESSystems(svg, flowAnimation);
    
    // 5. 充电桩
    drawChargingStations(svg, flowAnimation);
    
    // 6. 光伏系统
    drawPVSystem(svg, flowAnimation);
    
    // 7. 楼宇用电
    drawBuilding(svg, flowAnimation);
}

// 请完全删除原来的drawExternalGrid函数，替换为以下代码
function drawExternalGrid(svg, flowAnimation) {
    // 创建电网图标组
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'external-grid');
    group.setAttribute('class', 'scada-element normal');
    group.setAttribute('data-type', 'grid');
    
    // 电网六边形背景
    const gridBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gridBg.setAttribute('d', 'M90,70 L115,70 L127,87 L115,104 L90,104 L78,87 Z');
    gridBg.setAttribute('fill', '#1a73e8');
    gridBg.setAttribute('stroke', '#333');
    gridBg.setAttribute('stroke-width', '1');
    
    // 电网图标 - 闪电样式
    const gridIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gridIcon.setAttribute('d', 'M95,75 L110,75 L102,87 L115,87 L90,99 L98,87 L85,87 Z');
    gridIcon.setAttribute('fill', 'white');
    gridIcon.setAttribute('stroke', 'white');
    gridIcon.setAttribute('stroke-width', '1');
    
    // 电网标签
    const gridLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    gridLabel.setAttribute('x', '100');
    gridLabel.setAttribute('y', '125');
    gridLabel.setAttribute('class', 'scada-label');
    gridLabel.setAttribute('text-anchor', 'middle');
    gridLabel.textContent = '外部电网';
    
    // 连接线（至变压器）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', '127');
    connectionLine.setAttribute('y1', '87');
    connectionLine.setAttribute('x2', '200');
    connectionLine.setAttribute('y2', '87');
    connectionLine.setAttribute('class', 'flow-line');
    connectionLine.setAttribute('marker-end', 'url(#arrow)');
    connectionLine.setAttribute('stroke-dasharray', '4');
    
    // 添加流动动画
    const animationClone = flowAnimation.cloneNode(true);
    connectionLine.appendChild(animationClone);
    
    // 将所有元素添加到组
    group.appendChild(gridBg);
    group.appendChild(gridIcon);
    group.appendChild(gridLabel);
    group.appendChild(connectionLine);
    
    svg.appendChild(group);
}

// 绘制变压器
function drawTransformer(svg, flowAnimation) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'transformer');
    group.setAttribute('class', 'scada-element normal');
    group.setAttribute('data-type', 'transformer');
    
    // 变压器图标（两个圆圈）
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '220');
    circle1.setAttribute('cy', '100');
    circle1.setAttribute('r', '20');
    circle1.setAttribute('fill', 'none');
    circle1.setAttribute('stroke', '#34a853');
    circle1.setAttribute('stroke-width', '2');
    
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle2.setAttribute('cx', '260');
    circle2.setAttribute('cy', '100');
    circle2.setAttribute('r', '20');
    circle2.setAttribute('fill', 'none');
    circle2.setAttribute('stroke', '#34a853');
    circle2.setAttribute('stroke-width', '2');
    
    // 变压器标签
    const transformerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    transformerLabel.setAttribute('x', '240');
    transformerLabel.setAttribute('y', '70');
    transformerLabel.setAttribute('class', 'scada-label');
    transformerLabel.setAttribute('text-anchor', 'middle');
    transformerLabel.textContent = '变压器';
    
    // 变压器参数显示
    const transformerParams = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    transformerParams.setAttribute('x', '180');
    transformerParams.setAttribute('y', '130');
    transformerParams.setAttribute('width', '120');
    transformerParams.setAttribute('height', '80');
    
    const paramsDiv = document.createElement('div');
    paramsDiv.className = 'scada-params';
    paramsDiv.innerHTML = `
        <div>容量: 2500kVA</div>
        <div>相电压: 380V</div>
        <div>相电流: 210A</div>
        <div>功率: 1500kW</div>
    `;
    
    transformerParams.appendChild(paramsDiv);
    
    // 连接线（至母线）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', '280');
    connectionLine.setAttribute('y1', '100');
    connectionLine.setAttribute('x2', '320');
    connectionLine.setAttribute('y2', '100');
    connectionLine.setAttribute('class', 'flow-line');
    connectionLine.setAttribute('marker-end', 'url(#arrow)');
    connectionLine.setAttribute('stroke-dasharray', '4');
    
    // 添加流动动画
    const animationClone = flowAnimation.cloneNode(true);
    connectionLine.appendChild(animationClone);
    
    // 将所有元素添加到组
    group.appendChild(circle1);
    group.appendChild(circle2);
    group.appendChild(transformerLabel);
    group.appendChild(transformerParams);
    group.appendChild(connectionLine);
    
    svg.appendChild(group);
}

// 绘制母线
function drawBusbar(svg, flowAnimation) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'busbar');
    group.setAttribute('class', 'scada-element normal');
    
    // 母线主线
    const mainLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mainLine.setAttribute('x1', '320');
    mainLine.setAttribute('y1', '100');
    mainLine.setAttribute('x2', '850');
    mainLine.setAttribute('y2', '100');
    mainLine.setAttribute('stroke', '#34a853');
    mainLine.setAttribute('stroke-width', '6');
    
    // 母线标签
    const busbarLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    busbarLabel.setAttribute('x', '550');
    busbarLabel.setAttribute('y', '80');
    busbarLabel.setAttribute('class', 'scada-label');
    busbarLabel.setAttribute('text-anchor', 'middle');
    busbarLabel.textContent = '母线';
    
    // 添加到组
    group.appendChild(mainLine);
    group.appendChild(busbarLabel);
    
    svg.appendChild(group);
}

// 绘制储能系统
function drawESSystems(svg, flowAnimation) {
    const startX = 350;
    const y = 200;
    const spacing = 120;
    
    // 创建3个储能系统
    for (let i = 0; i < 3; i++) {
        const x = startX + i * spacing;
        const id = `ess-${i+1}`;
        const status = i === 0 ? 'normal' : (i === 1 ? 'warning' : 'error');
        const soc = 70 - i * 10;
        const power = i === 0 ? 200 : (i === 1 ? -150 : 0);
        const mode = i === 0 ? '峰谷套利' : (i === 1 ? '限电模式' : '模式退出');
        
        drawEnergyStorageSystem(svg, x, y, id, status, soc, power, mode, flowAnimation);
    }
}

// 绘制单个储能系统 - 优化图标
function drawEnergyStorageSystem(svg, x, y, id, status, soc, power, mode, flowAnimation) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', `scada-element ${status}`);
    group.setAttribute('data-type', 'ess');
    group.setAttribute('data-status', status);
    group.setAttribute('data-soc', soc);
    group.setAttribute('data-power', power);
    group.setAttribute('data-mode', mode);
    
    // 连接线（从母线到设备或从设备到母线）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', x + 25);
    connectionLine.setAttribute('y1', '100');
    connectionLine.setAttribute('x2', x + 25);
    connectionLine.setAttribute('y2', y - 40);
    connectionLine.setAttribute('class', 'flow-line');
    
    // 根据ID确定电流方向和流动状态
    if (id === 'ess-2') {
        // ESS2: 从储能到母线 (箭头在顶部)
        connectionLine.setAttribute('marker-start', 'url(#arrow)');
    } else if (id === 'ess-3') {
        // ESS3: 无电流流动，不显示箭头和动画
    } else {
        // ESS1和其他: 从母线到储能 (默认，箭头在底部)
        connectionLine.setAttribute('marker-end', 'url(#arrow)');
    }
    
    // 只有非ESS3的设备才添加电流流动动画
    if (id !== 'ess-3') {
        connectionLine.setAttribute('stroke-dasharray', '4');
        const animationClone = flowAnimation.cloneNode(true);
        
        // 对于ESS2，反转动画方向
        if (id === 'ess-2') {
            animationClone.setAttribute('values', '0;24');
        }
        
        connectionLine.appendChild(animationClone);
    }
    
    // 确定状态颜色
    let fillColor = getStatusColor(status);
    
    // 储能容器 - 矩形带圆角
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    container.setAttribute('x', x);
    container.setAttribute('y', y - 30);
    container.setAttribute('width', '50');
    container.setAttribute('height', '30');
    container.setAttribute('rx', '5');
    container.setAttribute('ry', '5');
    container.setAttribute('fill', fillColor);
    container.setAttribute('stroke', '#333');
    container.setAttribute('stroke-width', '1');
    
    // 电池正极头
    const batteryTop = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    batteryTop.setAttribute('x', x + 20);
    batteryTop.setAttribute('y', y - 35);
    batteryTop.setAttribute('width', '10');
    batteryTop.setAttribute('height', '5');
    batteryTop.setAttribute('fill', fillColor);
    batteryTop.setAttribute('stroke', '#333');
    batteryTop.setAttribute('stroke-width', '1');
    
    // SOC电量显示器
    const socWidth = (40 * soc) / 100;
    const socIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    socIndicator.setAttribute('x', x + 5);
    socIndicator.setAttribute('y', y - 25);
    socIndicator.setAttribute('width', socWidth);
    socIndicator.setAttribute('height', '20');
    socIndicator.setAttribute('fill', 'white');
    socIndicator.setAttribute('opacity', '0.7');
    
    // 储能电池图示 - 内部线条
    const batteryLines = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    batteryLines.setAttribute('d', `M${x+15},${y-25} v20 M${x+25},${y-25} v20 M${x+35},${y-25} v20`);
    batteryLines.setAttribute('stroke', '#333');
    batteryLines.setAttribute('stroke-width', '1');
    batteryLines.setAttribute('opacity', '0.5');
    
    // 储能标签
    const essLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    essLabel.setAttribute('x', x + 25);
    essLabel.setAttribute('y', y + 20);
    essLabel.setAttribute('class', 'scada-label');
    essLabel.setAttribute('text-anchor', 'middle');
    essLabel.textContent = `储能系统 ${id.split('-')[1]}`;
    
    // 状态参数
    const powerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    powerText.setAttribute('x', x + 25);
    powerText.setAttribute('y', y + 40);
    powerText.setAttribute('class', 'scada-value');
    powerText.setAttribute('text-anchor', 'middle');
    powerText.textContent = power > 0 ? `充电: ${power}kW` : power < 0 ? `放电: ${Math.abs(power)}kW` : '待机';
    
    const socText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    socText.setAttribute('x', x + 25);
    socText.setAttribute('y', y + 60);
    socText.setAttribute('class', 'scada-value');
    socText.setAttribute('text-anchor', 'middle');
    socText.textContent = `SOC: ${soc}%`;
    
    const modeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    modeText.setAttribute('x', x + 25);
    modeText.setAttribute('y', y + 80);
    modeText.setAttribute('class', 'scada-mode');
    modeText.setAttribute('text-anchor', 'middle');
    modeText.textContent = `模式: ${mode}`;
    
    // 添加所有元素到组
    group.appendChild(connectionLine);
    group.appendChild(container);
    group.appendChild(batteryTop);
    group.appendChild(socIndicator);
    group.appendChild(batteryLines);
    group.appendChild(essLabel);
    group.appendChild(powerText);
    group.appendChild(socText);
    group.appendChild(modeText);
    
    svg.appendChild(group);
}

// 绘制充电桩
function drawChargingStations(svg, flowAnimation) {
    const startX = 320;
    const y = 350;
    const spacing = 120;
    
    // 创建4个充电桩
    for (let i = 0; i < 4; i++) {
        const x = startX + i * spacing;
        const id = `ev-${i+1}`;
        const status = i === 0 ? 'normal' : (i === 2 ? 'warning' : 'normal');
        const power = i === 3 ? 0 : 40 + i * 20;
        
        drawChargingStation(svg, x, y, id, status, power, flowAnimation);
    }
}

// 绘制单个充电桩 - 优化图标
function drawChargingStation(svg, x, y, id, status, power, flowAnimation) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', `scada-element ${status}`);
    group.setAttribute('data-type', 'ev');
    group.setAttribute('data-status', status);
    group.setAttribute('data-power', power);
    
    // 连接线（从母线到设备）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', x + 25);
    connectionLine.setAttribute('y1', '100');
    connectionLine.setAttribute('x2', x + 25);
    connectionLine.setAttribute('y2', y - 90);
    connectionLine.setAttribute('class', 'flow-line');
    connectionLine.setAttribute('marker-end', 'url(#arrow)');
    connectionLine.setAttribute('stroke-dasharray', '4');
    
    // 添加流动动画
    const animationClone = flowAnimation.cloneNode(true);
    connectionLine.appendChild(animationClone);
    
    // 确定状态颜色
    let fillColor = getStatusColor(status);
    
    // 充电桩底座
    const evBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    evBase.setAttribute('x', x + 10);
    evBase.setAttribute('y', y - 10);
    evBase.setAttribute('width', '30');
    evBase.setAttribute('height', '10');
    evBase.setAttribute('fill', '#777');
    evBase.setAttribute('rx', '2');
    evBase.setAttribute('ry', '2');
    
    // 充电桩支柱
    const evPillar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    evPillar.setAttribute('x', x + 20);
    evPillar.setAttribute('y', y - 50);
    evPillar.setAttribute('width', '10');
    evPillar.setAttribute('height', '40');
    evPillar.setAttribute('fill', '#777');
    
    // 充电桩主体
    const evBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    evBody.setAttribute('x', x + 5);
    evBody.setAttribute('y', y - 90);
    evBody.setAttribute('width', '40');
    evBody.setAttribute('height', '40');
    evBody.setAttribute('rx', '5');
    evBody.setAttribute('ry', '5');
    evBody.setAttribute('fill', fillColor);
    evBody.setAttribute('stroke', '#333');
    evBody.setAttribute('stroke-width', '1');
    
    // 充电桩屏幕
    const evScreen = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    evScreen.setAttribute('x', x + 10);
    evScreen.setAttribute('y', y - 85);
    evScreen.setAttribute('width', '30');
    evScreen.setAttribute('height', '20');
    evScreen.setAttribute('fill', '#a0e4fc');
    evScreen.setAttribute('rx', '2');
    evScreen.setAttribute('ry', '2');
    
    // 充电枪
    const evPlugOutlet = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    evPlugOutlet.setAttribute('x', x + 15);
    evPlugOutlet.setAttribute('y', y - 60);
    evPlugOutlet.setAttribute('width', '20');
    evPlugOutlet.setAttribute('height', '10');
    evPlugOutlet.setAttribute('fill', '#333');
    evPlugOutlet.setAttribute('rx', '2');
    evPlugOutlet.setAttribute('ry', '2');
    
    // 充电枪线
    const evPlugCable = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    evPlugCable.setAttribute('d', `M${x+25},${y-60} q10,10 20,-5`);
    evPlugCable.setAttribute('stroke', '#333');
    evPlugCable.setAttribute('stroke-width', '3');
    evPlugCable.setAttribute('fill', 'none');
    
    // 闪电标志
    const evLightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    evLightning.setAttribute('d', `M${x+25},${y-80} l-4,7 h4 l-2,8 l6,-9 h-4 l3,-6 z`);
    evLightning.setAttribute('fill', 'yellow');
    
    // 充电桩标签
    const evLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    evLabel.setAttribute('x', x + 25);
    evLabel.setAttribute('y', y + 30);
    evLabel.setAttribute('class', 'scada-label');
    evLabel.setAttribute('text-anchor', 'middle');
    evLabel.textContent = `充电桩 ${id.split('-')[1]}`;
    
    // 功率参数
    const powerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    powerText.setAttribute('x', x + 25);
    powerText.setAttribute('y', y + 50);
    powerText.setAttribute('class', 'scada-value');
    powerText.setAttribute('text-anchor', 'middle');
    powerText.textContent = power > 0 ? `${power}kW` : '未使用';
    
    // 添加所有元素到组
    group.appendChild(connectionLine);
    group.appendChild(evBase);
    group.appendChild(evPillar);
    group.appendChild(evBody);
    group.appendChild(evScreen);
    group.appendChild(evPlugOutlet);
    group.appendChild(evPlugCable);
    group.appendChild(evLightning);
    group.appendChild(evLabel);
    group.appendChild(powerText);
    
    svg.appendChild(group);
}

// 绘制光伏系统
function drawPVSystem(svg, flowAnimation) {
    const x = 700;
    const y = 200;
    const id = 'pv-1';
    const status = 'normal';
    const power = 45;
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', `scada-element ${status}`);
    group.setAttribute('data-type', 'pv');
    group.setAttribute('data-status', status);
    group.setAttribute('data-power', power);
    
    // 连接线（从母线到设备）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', x + 25);
    connectionLine.setAttribute('y1', '100');
    connectionLine.setAttribute('x2', x + 25);
    connectionLine.setAttribute('y2', y - 30);
    connectionLine.setAttribute('class', 'flow-line');
    connectionLine.setAttribute('marker-end', 'url(#arrow)');
    connectionLine.setAttribute('stroke-dasharray', '4');
    
    // 添加流动动画
    const animationClone = flowAnimation.cloneNode(true);
    connectionLine.appendChild(animationClone);
    
    // 光伏面板图标
    const pvIcon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    pvIcon.setAttribute('x', x);
    pvIcon.setAttribute('y', y - 40);
    pvIcon.setAttribute('width', '50');
    pvIcon.setAttribute('height', '40');
    pvIcon.setAttribute('fill', getStatusColor(status));
    pvIcon.setAttribute('stroke', '#333');
    pvIcon.setAttribute('stroke-width', '1');
    
    // 光伏内部网格
    const pvGrid1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    pvGrid1.setAttribute('x1', x);
    pvGrid1.setAttribute('y1', y - 20);
    pvGrid1.setAttribute('x2', x + 50);
    pvGrid1.setAttribute('y2', y - 20);
    pvGrid1.setAttribute('stroke', '#333');
    pvGrid1.setAttribute('stroke-width', '0.5');
    
    const pvGrid2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    pvGrid2.setAttribute('x1', x + 25);
    pvGrid2.setAttribute('y1', y - 40);
    pvGrid2.setAttribute('x2', x + 25);
    pvGrid2.setAttribute('y2', y);
    pvGrid2.setAttribute('stroke', '#333');
    pvGrid2.setAttribute('stroke-width', '0.5');
    
    // 光伏支架
    const pvStand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pvStand.setAttribute('d', `M${x},${y} h50 l-10,10 h-30 z`);
    pvStand.setAttribute('fill', '#777');
    pvStand.setAttribute('stroke', '#333');
    pvStand.setAttribute('stroke-width', '1');
    
    // 光伏标签
    const pvLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pvLabel.setAttribute('x', x + 25);
    pvLabel.setAttribute('y', y + 30);
    pvLabel.setAttribute('class', 'scada-label');
    pvLabel.setAttribute('text-anchor', 'middle');
    pvLabel.textContent = '光伏系统';
    
    // 功率参数
    const powerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    powerText.setAttribute('x', x + 25);
    powerText.setAttribute('y', y + 50);
    powerText.setAttribute('class', 'scada-value');
    powerText.setAttribute('text-anchor', 'middle');
    powerText.textContent = `发电: ${power}kW`;
    
    // 太阳图标
    const sunIcon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sunIcon.setAttribute('cx', x - 15);
    sunIcon.setAttribute('cy', y - 45);
    sunIcon.setAttribute('r', '10');
    sunIcon.setAttribute('fill', '#FDB813');
    
    // 太阳光线
    for (let i = 0; i < 8; i++) {
        const angle = i * 45 * Math.PI / 180;
        const x1 = x - 15 + Math.cos(angle) * 12;
        const y1 = y - 45 + Math.sin(angle) * 12;
        const x2 = x - 15 + Math.cos(angle) * 18;
        const y2 = y - 45 + Math.sin(angle) * 18;
        
        const sunRay = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        sunRay.setAttribute('x1', x1);
        sunRay.setAttribute('y1', y1);
        sunRay.setAttribute('x2', x2);
        sunRay.setAttribute('y2', y2);
        sunRay.setAttribute('stroke', '#FDB813');
        sunRay.setAttribute('stroke-width', '2');
        
        group.appendChild(sunRay);
    }
    
    // 添加所有元素到组
    group.appendChild(connectionLine);
    group.appendChild(pvStand);
    group.appendChild(pvIcon);
    group.appendChild(pvGrid1);
    group.appendChild(pvGrid2);
    group.appendChild(sunIcon);
    group.appendChild(pvLabel);
    group.appendChild(powerText);
    
    svg.appendChild(group);
}

// 绘制楼宇用电 - 优化图标
function drawBuilding(svg, flowAnimation) {
    const x = 820;
    const y = 200;
    const power = 230;
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'building');
    group.setAttribute('class', 'scada-element normal');
    group.setAttribute('data-type', 'building');
    group.setAttribute('data-power', power);
    
    // 连接线（从母线到设备）
    const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectionLine.setAttribute('x1', x + 25);
    connectionLine.setAttribute('y1', '100');
    connectionLine.setAttribute('x2', x + 25);
    connectionLine.setAttribute('y2', y - 90);
    connectionLine.setAttribute('class', 'flow-line');
    connectionLine.setAttribute('marker-end', 'url(#arrow)');
    connectionLine.setAttribute('stroke-dasharray', '4');
    
    // 添加流动动画
    const animationClone = flowAnimation.cloneNode(true);
    connectionLine.appendChild(animationClone);
    
    // 建筑基底
    const buildingBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    buildingBase.setAttribute('x', x);
    buildingBase.setAttribute('y', y - 10);
    buildingBase.setAttribute('width', '50');
    buildingBase.setAttribute('height', '10');
    buildingBase.setAttribute('fill', '#777');
    
    // 楼宇主体 - 更现代的设计
    const buildingMain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    buildingMain.setAttribute('d', `M${x+5},${y-10} v-60 h40 v60 z`);
    buildingMain.setAttribute('fill', '#4CAF50');
    buildingMain.setAttribute('stroke', '#333');
    buildingMain.setAttribute('stroke-width', '1');
    
    // 楼宇玻璃幕墙效果
    const buildingGlass = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    buildingGlass.setAttribute('d', `M${x+10},${y-15} v-50 h30 v50 z`);
    buildingGlass.setAttribute('fill', '#a0e4fc');
    buildingGlass.setAttribute('opacity', '0.7');
    
    // 玻璃幕墙线条
    const glassLines = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glassLines.setAttribute('d', `M${x+10},${y-35} h30 M${x+25},${y-15} v-50`);
    glassLines.setAttribute('stroke', 'white');
    glassLines.setAttribute('stroke-width', '1');
    glassLines.setAttribute('opacity', '0.5');
    
    // 楼顶设施
    const buildingRoof = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    buildingRoof.setAttribute('d', `M${x+15},${y-70} h20 v-10 h-20 z`);
    buildingRoof.setAttribute('fill', '#555');
    
    // 楼宇门
    const buildingDoor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    buildingDoor.setAttribute('x', x + 20);
    buildingDoor.setAttribute('y', y - 30);
    buildingDoor.setAttribute('width', '10');
    buildingDoor.setAttribute('height', '20');
    buildingDoor.setAttribute('fill', '#333');
    
    // 楼宇标签
    const buildingLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    buildingLabel.setAttribute('x', x + 25);
    buildingLabel.setAttribute('y', y + 20);
    buildingLabel.setAttribute('class', 'scada-label');
    buildingLabel.setAttribute('text-anchor', 'middle');
    buildingLabel.textContent = '楼宇用电';
    
    // 功率参数
    const powerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    powerText.setAttribute('x', x + 25);
    powerText.setAttribute('y', y + 40);
    powerText.setAttribute('class', 'scada-value');
    powerText.setAttribute('text-anchor', 'middle');
    powerText.textContent = `用电: ${power}kW`;
    
    // 添加所有元素到组
    group.appendChild(connectionLine);
    group.appendChild(buildingBase);
    group.appendChild(buildingMain);
    group.appendChild(buildingGlass);
    group.appendChild(glassLines);
    group.appendChild(buildingRoof);
    group.appendChild(buildingDoor);
    group.appendChild(buildingLabel);
    group.appendChild(powerText);
    
    svg.appendChild(group);
}

// 添加事件监听器
function addScadaEventListeners() {
    // 获取模态框和关闭按钮
    const modal = document.getElementById('scada-modal');
    const closeBtn = document.querySelector('.close-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !closeBtn || !modalContent) return;
    
    // 关闭模态框事件
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 点击SCADA元素事件
    const scadaElements = document.querySelectorAll('.scada-element');
    scadaElements.forEach(element => {
        element.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const status = this.getAttribute('data-status');
            const id = this.getAttribute('id');
            
            // 根据元素类型显示不同的控制面板
            switch (type) {
                case 'ess':
                    showESSControlPanel(id, status);
                    break;
                case 'ev':
                    showEVControlPanel(id, status);
                    break;
                case 'pv':
                    showPVControlPanel(id, status);
                    break;
                case 'transformer':
                    showTransformerInfo(id);
                    break;
                case 'grid':
                    showGridInfo(id);
                    break;
                case 'building':
                    showBuildingInfo(id);
                    break;
            }
        });
    });
    
    // 缩放控制按钮事件
    const zoomInBtn = document.getElementById('scada-zoom-in');
    const zoomOutBtn = document.getElementById('scada-zoom-out');
    const resetBtn = document.getElementById('scada-reset');
    
    if (zoomInBtn && zoomOutBtn && resetBtn) {
        let currentScale = 1;
        const scadaSvg = document.getElementById('scada-svg');
        
        zoomInBtn.addEventListener('click', () => {
            currentScale += 0.1;
            applyZoom(scadaSvg, currentScale);
        });
        
        zoomOutBtn.addEventListener('click', () => {
            currentScale = Math.max(0.5, currentScale - 0.1);
            applyZoom(scadaSvg, currentScale);
        });
        
        resetBtn.addEventListener('click', () => {
            currentScale = 1;
            applyZoom(scadaSvg, currentScale);
        });
    }
}

// 应用缩放变换
function applyZoom(element, scale) {
    if (!element) return;
    element.style.transform = `scale(${scale})`;
    element.style.transformOrigin = 'center center';
}

// 开始SCADA动画
function startScadaAnimations() {
    // 更新时间显示
    const updateTimeElement = document.querySelector('.scada-update-time');
    if (updateTimeElement) {
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            updateTimeElement.textContent = `实时更新: ${timeString}`;
        }, 1000);
    }
}

// 辅助函数：根据状态获取对应颜色
function getStatusColor(status) {
    switch (status) {
        case 'normal': return '#4CAF50'; // 绿色
        case 'warning': return '#FFC107'; // 黄色
        case 'error': return '#F44336';   // 红色
        default: return '#4CAF50';        // 默认绿色
    }
}

// 辅助函数：根据SOC获取颜色
function getSOCColor(soc) {
    if (soc >= 60) {
        return '#4CAF50'; // 高电量绿色
    } else if (soc >= 30) {
        return '#FFC107'; // 中电量黄色
    } else {
        return '#F44336'; // 低电量红色
    }
}

// 显示储能系统控制面板 - 修改功率输入方式
function showESSControlPanel(id, status) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    const soc = element.getAttribute('data-soc');
    const power = element.getAttribute('data-power');
    const mode = element.getAttribute('data-mode');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>储能系统控制 - ${id}</h2>
            <div class="device-status ${status}">${status === 'normal' ? '正常' : (status === 'warning' ? '告警' : '故障')}</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">SOC:</span>
                    <span class="status-value">${soc}%</span>
                </div>
                <div class="status-item">
                    <span class="status-label">当前功率:</span>
                    <span class="status-value">${power}kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">运行模式:</span>
                    <span class="status-value">${mode}</span>
                </div>
            </div>
            <div class="control-panel">
                <h3>功率控制</h3>
                <div class="control-item power-input-container">
                    <div class="power-input-group">
                        <label for="power-control">功率设定 (kW):</label>
                        <div class="power-input-wrapper">
                            <input type="number" id="power-control" min="-500" max="500" value="${power}" step="10" class="power-number-input">
                            <span class="power-unit">kW</span>
                        </div>
                    </div>
                    <div class="power-description">
                        <span class="power-hint">提示: 正值表示充电, 负值表示放电, 0表示待机</span>
                        <div class="power-buttons">
                            <button class="power-preset-btn" data-value="-300">放电 300kW</button>
                            <button class="power-preset-btn" data-value="0">待机</button>
                            <button class="power-preset-btn" data-value="300">充电 300kW</button>
                        </div>
                    </div>
                </div>
                <h3>模式选择</h3>
                <div class="mode-buttons">
                    <button class="mode-btn ${mode === '峰谷套利' ? 'active' : ''}" data-mode="峰谷套利">峰谷套利</button>
                    <button class="mode-btn ${mode === '限电模式' ? 'active' : ''}" data-mode="限电模式">限电模式</button>
                    <button class="mode-btn ${mode === '模式退出' ? 'active' : ''}" data-mode="模式退出">模式退出</button>
                </div>
                <div class="submit-controls">
                    <button id="apply-ess-settings" class="primary-btn">应用设置</button>
                    <button id="cancel-ess-settings" class="secondary-btn">取消</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 数字输入框事件处理
    const powerControl = document.getElementById('power-control');
    
    if (powerControl) {
        // 输入限制：确保输入值在有效范围内
        powerControl.addEventListener('change', function() {
            let value = parseInt(this.value) || 0;
            if (value < -500) value = -500;
            if (value > 500) value = 500;
            this.value = value;
        });
    }
    
    // 添加预设功率按钮事件
    const presetButtons = document.querySelectorAll('.power-preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            powerControl.value = value;
        });
    });
    
    // 模式按钮点击
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 应用按钮事件
    const applyBtn = document.getElementById('apply-ess-settings');
    const cancelBtn = document.getElementById('cancel-ess-settings');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            // 获取输入的功率值
            let newPower = parseInt(powerControl.value) || 0;
            // 确保输入值在有效范围内
            if (newPower < -500) newPower = -500;
            if (newPower > 500) newPower = 500;
            
            const activeMode = document.querySelector('.mode-btn.active');
            const newMode = activeMode ? activeMode.getAttribute('data-mode') : mode;
            
            // 更新SVG中的元素属性和显示
            element.setAttribute('data-power', newPower);
            element.setAttribute('data-mode', newMode);
            
            // 更新功率显示
            const powerText = element.querySelector('.scada-value');
            if (powerText) {
                powerText.textContent = newPower > 0 ? `充电: ${newPower}kW` : newPower < 0 ? `放电: ${Math.abs(newPower)}kW` : '待机';
            }
            
            // 更新模式显示
            const modeText = element.querySelector('.scada-mode');
            if (modeText) {
                modeText.textContent = `模式: ${newMode}`;
            }
            
            modal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
}

// 显示充电桩控制面板（继续）
function showEVControlPanel(id, status) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    const power = element.getAttribute('data-power');
    const isEnabled = power > 0 ? true : false;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>充电桩控制 - ${id}</h2>
            <div class="device-status ${status}">${status === 'normal' ? '正常' : (status === 'warning' ? '告警' : '故障')}</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">当前功率:</span>
                    <span class="status-value">${power}kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">状态:</span>
                    <span class="status-value">${isEnabled ? '运行中' : '已断开'}</span>
                </div>
            </div>
            <div class="control-panel">
                <h3>断路器控制</h3>
                <div class="switch-control">
                    <div class="switch ${isEnabled ? 'on' : 'off'}" id="ev-switch">
                        <div class="switch-handle"></div>
                    </div>
                    <span>${isEnabled ? '已闭合' : '已断开'}</span>
                </div>
                <div class="submit-controls">
                    <button id="apply-ev-settings" class="primary-btn">应用设置</button>
                    <button id="cancel-ev-settings" class="secondary-btn">取消</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 开关切换事件
    const evSwitch = document.getElementById('ev-switch');
    if (evSwitch) {
        evSwitch.addEventListener('click', function() {
            this.classList.toggle('on');
            this.classList.toggle('off');
            const isOn = this.classList.contains('on');
            this.nextElementSibling.textContent = isOn ? '已闭合' : '已断开';
        });
    }
    
    // 应用按钮事件
    const applyBtn = document.getElementById('apply-ev-settings');
    const cancelBtn = document.getElementById('cancel-ev-settings');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const isOn = evSwitch.classList.contains('on');
            const newPower = isOn ? 60 : 0; // 模拟功率值
            
            // 更新SVG中的元素属性和显示
            element.setAttribute('data-power', newPower);
            
            // 更新功率显示
            const powerText = element.querySelector('.scada-value');
            if (powerText) {
                powerText.textContent = newPower > 0 ? `${newPower}kW` : '未使用';
            }
            
            modal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
}

// 显示光伏系统控制面板
function showPVControlPanel(id, status) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    const power = element.getAttribute('data-power');
    const isEnabled = power > 0 ? true : false;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>光伏系统控制 - ${id}</h2>
            <div class="device-status ${status}">${status === 'normal' ? '正常' : (status === 'warning' ? '告警' : '故障')}</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">发电功率:</span>
                    <span class="status-value">${power}kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">状态:</span>
                    <span class="status-value">${isEnabled ? '并网发电中' : '已断开'}</span>
                </div>
            </div>
            <div class="control-panel">
                <h3>断路器控制</h3>
                <div class="switch-control">
                    <div class="switch ${isEnabled ? 'on' : 'off'}" id="pv-switch">
                        <div class="switch-handle"></div>
                    </div>
                    <span>${isEnabled ? '已闭合' : '已断开'}</span>
                </div>
                <div class="submit-controls">
                    <button id="apply-pv-settings" class="primary-btn">应用设置</button>
                    <button id="cancel-pv-settings" class="secondary-btn">取消</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 开关切换事件
    const pvSwitch = document.getElementById('pv-switch');
    if (pvSwitch) {
        pvSwitch.addEventListener('click', function() {
            this.classList.toggle('on');
            this.classList.toggle('off');
            const isOn = this.classList.contains('on');
            this.nextElementSibling.textContent = isOn ? '已闭合' : '已断开';
        });
    }
    
    // 应用按钮事件
    const applyBtn = document.getElementById('apply-pv-settings');
    const cancelBtn = document.getElementById('cancel-pv-settings');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const isOn = pvSwitch.classList.contains('on');
            const newPower = isOn ? power : 0; // 保持原功率或设为0
            
            // 更新SVG中的元素属性和显示
            element.setAttribute('data-power', newPower);
            
            // 更新功率显示
            const powerText = element.querySelector('.scada-value');
            if (powerText) {
                powerText.textContent = newPower > 0 ? `发电: ${newPower}kW` : '未发电';
            }
            
            modal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
}

// 显示变压器信息
function showTransformerInfo(id) {
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>变压器详细信息</h2>
            <div class="device-status normal">正常</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">变压器型号:</span>
                    <span class="status-value">SCB13-2500/10</span>
                </div>
                <div class="status-item">
                    <span class="status-label">额定容量:</span>
                    <span class="status-value">2500kVA</span>
                </div>
                <div class="status-item">
                    <span class="status-label">变压比:</span>
                    <span class="status-value">10kV/0.4kV</span>
                </div>
                <div class="status-item">
                    <span class="status-label">相电压:</span>
                    <span class="status-value">A:380V B:382V C:379V</span>
                </div>
                <div class="status-item">
                    <span class="status-label">相电流:</span>
                    <span class="status-value">A:210A B:205A C:215A</span>
                </div>
                <div class="status-item">
                    <span class="status-label">有功功率:</span>
                    <span class="status-value">1500kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">无功功率:</span>
                    <span class="status-value">350kVar</span>
                </div>
                <div class="status-item">
                    <span class="status-label">功率因数:</span>
                    <span class="status-value">0.97</span>
                </div>
                <div class="status-item">
                    <span class="status-label">温度:</span>
                    <span class="status-value">65℃</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 显示电网信息
function showGridInfo(id) {
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>外部电网信息</h2>
            <div class="device-status normal">正常</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">电网名称:</span>
                    <span class="status-value">市政配电网</span>
                </div>
                <div class="status-item">
                    <span class="status-label">电压等级:</span>
                    <span class="status-value">10kV</span>
                </div>
                <div class="status-item">
                    <span class="status-label">当前状态:</span>
                    <span class="status-value">正常供电</span>
                </div>
                <div class="status-item">
                    <span class="status-label">频率:</span>
                    <span class="status-value">49.98Hz</span>
                </div>
                <div class="status-item">
                    <span class="status-label">功率:</span>
                    <span class="status-value">输入1650kW</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 显示楼宇用电信息
function showBuildingInfo(id) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const modal = document.getElementById('scada-modal');
    const modalContent = document.getElementById('scada-modal-content');
    
    if (!modal || !modalContent) return;
    
    const power = element.getAttribute('data-power');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>楼宇用电信息</h2>
            <div class="device-status normal">正常</div>
        </div>
        <div class="modal-body">
            <div class="status-display">
                <div class="status-item">
                    <span class="status-label">建筑名称:</span>
                    <span class="status-value">综合办公楼</span>
                </div>
                <div class="status-item">
                    <span class="status-label">总功率:</span>
                    <span class="status-value">${power}kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">负载分布:</span>
                    <span class="status-value">照明: 45kW, 空调: 120kW, 其他: 65kW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">日用电量:</span>
                    <span class="status-value">3280kWh</span>
                </div>
            </div>
            <div class="building-chart">
                <h3>今日用电曲线</h3>
                <svg width="100%" height="150" viewBox="0 0 400 150">
                    <rect x="0" y="0" width="400" height="150" fill="#f5f5f5"/>
                    <polyline points="0,120 50,100 100,105 150,90 200,60 250,50 300,65 350,80 400,100" 
                              fill="none" stroke="#4990E2" stroke-width="2"/>
                    <line x1="0" y1="140" x2="400" y2="140" stroke="#333" stroke-width="1"/>
                    <line x1="0" y1="0" x2="0" y2="140" stroke="#333" stroke-width="1"/>
                    <text x="0" y="148" font-size="10">0:00</text>
                    <text x="195" y="148" font-size="10">12:00</text>
                    <text x="390" y="148" font-size="10">24:00</text>
                </svg>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 可以在控制台手动调用 switchSite(2) 来测试切换到站点2 