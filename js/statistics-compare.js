/**
 * 统计对比页面脚本
 */
document.addEventListener('DOMContentLoaded', function() {
    // 检查Echarts是否可用
    if (typeof echarts === 'undefined') {
        console.error('ECharts 库未加载');
        displayEchartsError();
        return;
    }

    try {
        // 初始化所有图表
        initAllCharts();
        
        // 绑定视图切换按钮事件
        bindToggleViewButtons();
        
        // 绑定筛选事件
        bindFilterActions();
        
        // 绑定导出数据事件
        bindExportButtons();
        
        // 绑定指标切换事件
        bindMetricSelects();
    } catch (error) {
        console.error('初始化图表时出错:', error);
        displayEchartsError();
    }
});

/**
 * 显示图表加载错误提示
 */
function displayEchartsError() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = '<div class="chart-error">图表加载失败，请检查网络连接或刷新页面重试</div>';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.color = '#e74c3c';
        container.style.fontSize = '14px';
        container.style.padding = '20px';
    });
}

/**
 * 初始化所有图表
 */
function initAllCharts() {
    try {
        // 初始化告警图表
        initAlarmChart();
        
        // 初始化告警表格
        initAlarmTable();
        
        // 初始化停机率图表
        initDowntimeChart();
        
        // 初始化系统效率图表
        initEfficiencyChart();
        
        // 初始化收益图表
        initProfitChart();
        
        // 初始化能源生产与消耗图表
        initEnergyChart('production');
        
        // 初始化电池性能图表
        initBatteryChart('soh');
        
        // 初始化系统可靠性图表
        initReliabilityChart('lifetime');
        
        // 初始化时间维度分析图表
        initTimeDimensionChart('seasonal');
        
        // 初始化地理分布图表
        initGeoChart('performance');
    } catch (error) {
        console.error('初始化图表过程中出错:', error);
    }
}

/**
 * 绑定视图切换按钮事件
 */
function bindToggleViewButtons() {
    const toggleButtons = document.querySelectorAll('.toggle-view');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标视图ID
            const targetId = this.getAttribute('data-target');
            
            // 获取卡片容器
            const card = this.closest('.stat-card');
            
            // 获取所有视图容器
            const viewContainers = card.querySelectorAll('.chart-container, .table-container');
            
            // 隐藏所有视图
            viewContainers.forEach(container => {
                container.style.display = 'none';
            });
            
            // 显示目标视图
            document.getElementById(targetId).style.display = 'block';
            
            // 更新按钮状态
            const siblingButtons = card.querySelectorAll('.toggle-view');
            siblingButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // 如果是图表，触发重绘以适应容器大小
            if(targetId.includes('chart')) {
                const chartInstance = echarts.getInstanceByDom(document.getElementById(targetId));
                if(chartInstance) {
                    chartInstance.resize();
                }
            }
        });
    });
}

/**
 * 绑定筛选操作的事件
 */
function bindFilterActions() {
    // 应用筛选按钮
    document.getElementById('apply-filter').addEventListener('click', function() {
        // 在实际应用中，这里会根据筛选条件重新加载数据
        // 在这个原型中，我们只是重新初始化图表
        initAllCharts();
    });
    
    // 重置筛选按钮
    document.getElementById('reset-filter').addEventListener('click', function() {
        // 重置所有筛选条件
        document.getElementById('time-range').value = 'week';
        document.getElementById('site-type').value = 'all';
        document.getElementById('region').value = 'all';
        
        // 重新初始化图表
        initAllCharts();
    });
}

/**
 * 绑定导出数据按钮的事件
 */
function bindExportButtons() {
    const exportButtons = document.querySelectorAll('.export-data');
    
    exportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataSource = this.getAttribute('data-source');
            alert(`导出${dataSource}数据功能将在实际应用中实现`);
        });
    });
}

/**
 * 绑定指标选择下拉框的事件
 */
function bindMetricSelects() {
    // 能源视图类型切换
    document.getElementById('energy-view-type').addEventListener('change', function() {
        initEnergyChart(this.value);
    });
    
    // 电池指标切换
    document.getElementById('battery-metric').addEventListener('change', function() {
        initBatteryChart(this.value);
    });
    
    // 可靠性指标切换
    document.getElementById('reliability-metric').addEventListener('change', function() {
        initReliabilityChart(this.value);
    });
    
    // 时间维度切换
    document.getElementById('time-dimension').addEventListener('change', function() {
        initTimeDimensionChart(this.value);
    });
    
    // 地理指标切换
    document.getElementById('geo-metric').addEventListener('change', function() {
        initGeoChart(this.value);
    });
}

/**
 * 初始化告警图表
 */
function initAlarmChart() {
    const chartDom = document.getElementById('alarm-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    const alarmData = siteNames.map((site, index) => {
        return {
            site: site,
            total: Math.floor(Math.random() * 30) + 5,
            severe: Math.floor(Math.random() * 10),
            general: Math.floor(Math.random() * 20) + 5
        };
    });
    
    // 按告警总数排序
    alarmData.sort((a, b) => b.total - a.total);
    
    // 提取排序后的数据
    const sites = alarmData.map(item => item.site);
    const totalAlarms = alarmData.map(item => item.total);
    const severeAlarms = alarmData.map(item => item.severe);
    const generalAlarms = alarmData.map(item => item.general);
    
    // 设置图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['严重告警', '一般告警']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: sites
        },
        series: [
            {
                name: '严重告警',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: severeAlarms,
                itemStyle: {
                    color: '#e74c3c'
                }
            },
            {
                name: '一般告警',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: generalAlarms,
                itemStyle: {
                    color: '#f39c12'
                }
            }
        ]
    };
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化告警表格
 */
function initAlarmTable() {
    const tableBody = document.querySelector('#alarm-table tbody');
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    const alarmData = siteNames.map((site, index) => {
        const total = Math.floor(Math.random() * 30) + 5;
        const severe = Math.floor(Math.random() * 10);
        return {
            site: site,
            total: total,
            severe: severe,
            general: total - severe,
            duration: Math.floor(Math.random() * 300) + 30 + '分钟'
        };
    });
    
    // 按告警总数排序
    alarmData.sort((a, b) => b.total - a.total);
    
    // 清空表格内容
    tableBody.innerHTML = '';
    
    // 填充表格
    alarmData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.site}</td>
            <td>${item.total}</td>
            <td>${item.severe}</td>
            <td>${item.general}</td>
            <td>${item.duration}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * 初始化停机率图表
 */
function initDowntimeChart() {
    const chartDom = document.getElementById('downtime-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    const downtimeData = siteNames.map((site) => {
        return {
            site: site,
            rate: (Math.random() * 5).toFixed(2)
        };
    });
    
    // 按停机率排序
    downtimeData.sort((a, b) => b.rate - a.rate);
    
    // 提取排序后的数据
    const sites = downtimeData.map(item => item.site);
    const rates = downtimeData.map(item => item.rate);
    
    // 计算平均停机率
    const avgRate = (rates.reduce((sum, rate) => sum + parseFloat(rate), 0) / rates.length).toFixed(2);
    
    // 设置图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sites
        },
        yAxis: {
            type: 'value',
            name: '停机率 (%)',
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                data: rates,
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const value = params.value;
                        if (value > 3) return '#e74c3c';
                        if (value > 1) return '#f39c12';
                        return '#2ecc71';
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}%'
                }
            },
            {
                type: 'line',
                name: '平均停机率',
                data: new Array(sites.length).fill(avgRate),
                markLine: {
                    silent: true,
                    symbol: 'none',
                    label: {
                        formatter: '平均: {c}%',
                        position: 'middle'
                    },
                    lineStyle: {
                        type: 'dashed',
                        color: '#9b59b6'
                    },
                    data: [{
                        yAxis: avgRate
                    }]
                }
            }
        ]
    };
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
    
    // 初始化表格数据
    const tableContainer = document.getElementById('downtime-table');
    tableContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>站点名称</th>
                    <th>非计划停机率</th>
                    <th>停机次数</th>
                    <th>平均恢复时间</th>
                </tr>
            </thead>
            <tbody>
                ${downtimeData.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.site}</td>
                        <td>${item.rate}%</td>
                        <td>${Math.floor(Math.random() * 10) + 1}</td>
                        <td>${Math.floor(Math.random() * 120) + 30}分钟</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * 初始化系统效率图表
 */
function initEfficiencyChart() {
    const chartDom = document.getElementById('efficiency-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    const efficiencyData = siteNames.map((site) => {
        return {
            site: site,
            efficiency: (Math.random() * 20 + 75).toFixed(1)
        };
    });
    
    // 按效率排序
    efficiencyData.sort((a, b) => b.efficiency - a.efficiency);
    
    // 提取排序后的数据
    const sites = efficiencyData.map(item => item.site);
    const efficiencies = efficiencyData.map(item => item.efficiency);
    
    // 计算平均效率
    const avgEfficiency = (efficiencies.reduce((sum, eff) => sum + parseFloat(eff), 0) / efficiencies.length).toFixed(1);
    
    // 设置图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sites
        },
        yAxis: {
            type: 'value',
            name: '系统效率 (%)',
            min: 70,
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                data: efficiencies,
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const value = params.value;
                        if (value > 90) return '#2ecc71';
                        if (value > 80) return '#3498db';
                        return '#f39c12';
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}%'
                }
            },
            {
                type: 'line',
                name: '平均效率',
                data: new Array(sites.length).fill(avgEfficiency),
                markLine: {
                    silent: true,
                    symbol: 'none',
                    label: {
                        formatter: '平均: {c}%',
                        position: 'middle'
                    },
                    lineStyle: {
                        type: 'dashed',
                        color: '#9b59b6'
                    },
                    data: [{
                        yAxis: avgEfficiency
                    }]
                }
            }
        ]
    };
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
    
    // 初始化表格数据
    const tableContainer = document.getElementById('efficiency-table');
    tableContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>站点名称</th>
                    <th>系统效率</th>
                    <th>转换效率</th>
                    <th>传输效率</th>
                </tr>
            </thead>
            <tbody>
                ${efficiencyData.map((item, index) => {
                    const conversionEff = (Math.random() * 10 + 85).toFixed(1);
                    const transmissionEff = (Math.random() * 10 + 85).toFixed(1);
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.site}</td>
                            <td>${item.efficiency}%</td>
                            <td>${conversionEff}%</td>
                            <td>${transmissionEff}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * 初始化收益图表
 */
function initProfitChart() {
    const chartDom = document.getElementById('profit-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    const profitData = siteNames.map((site, index) => {
        const profit = (Math.random() * 50 + 50).toFixed(1);
        const target = (Math.random() * 20 + 90).toFixed(1);
        return {
            site: site,
            profit: profit,
            target: target,
            completion: ((profit / target) * 100).toFixed(1)
        };
    });
    
    // 按收益排序
    profitData.sort((a, b) => b.profit - a.profit);
    
    // 提取排序后的数据
    const sites = profitData.map(item => item.site);
    const profits = profitData.map(item => item.profit);
    const targets = profitData.map(item => item.target);
    
    // 设置图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['实际收益', '目标收益']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sites
        },
        yAxis: {
            type: 'value',
            name: '收益 (万元)'
        },
        series: [
            {
                name: '实际收益',
                type: 'bar',
                data: profits,
                itemStyle: {
                    color: '#3498db'
                },
                label: {
                    show: true,
                    position: 'top'
                }
            },
            {
                name: '目标收益',
                type: 'line',
                data: targets,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#e74c3c'
                },
                lineStyle: {
                    width: 2,
                    type: 'dashed'
                }
            }
        ]
    };
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
    
    // 初始化表格数据
    const tableContainer = document.getElementById('profit-table');
    tableContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>站点名称</th>
                    <th>实际收益(万元)</th>
                    <th>目标收益(万元)</th>
                    <th>完成率</th>
                </tr>
            </thead>
            <tbody>
                ${profitData.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.site}</td>
                        <td>${item.profit}</td>
                        <td>${item.target}</td>
                        <td>${item.completion}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * 初始化能源生产与消耗图表
 * @param {string} type - 图表类型: 'production', 'consumption', 'self-sufficiency', 'peak-valley'
 */
function initEnergyChart(type) {
    const chartDom = document.getElementById('energy-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    
    let option = {};
    
    switch(type) {
        case 'production':
            // 发电量数据
            const productionData = siteNames.map(() => ({
                solar: Math.floor(Math.random() * 2000) + 1000,
                wind: Math.floor(Math.random() * 1000) + 500,
                storage: Math.floor(Math.random() * 800) + 200
            }));
            
            option = {
                title: {
                    text: '各站点发电量分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['光伏发电', '风能发电', '储能放电'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '发电量 (kWh)'
                },
                series: [
                    {
                        name: '光伏发电',
                        type: 'bar',
                        stack: 'total',
                        data: productionData.map(item => item.solar),
                        itemStyle: {
                            color: '#f39c12'
                        }
                    },
                    {
                        name: '风能发电',
                        type: 'bar',
                        stack: 'total',
                        data: productionData.map(item => item.wind),
                        itemStyle: {
                            color: '#3498db'
                        }
                    },
                    {
                        name: '储能放电',
                        type: 'bar',
                        stack: 'total',
                        data: productionData.map(item => item.storage),
                        itemStyle: {
                            color: '#2ecc71'
                        }
                    }
                ]
            };
            break;
            
        case 'consumption':
            // 用电量数据
            const consumptionData = siteNames.map(() => ({
                peak: Math.floor(Math.random() * 2000) + 1000,
                normal: Math.floor(Math.random() * 1500) + 800,
                valley: Math.floor(Math.random() * 1000) + 300
            }));
            
            option = {
                title: {
                    text: '各站点用电量分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['峰时用电', '平时用电', '谷时用电'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '用电量 (kWh)'
                },
                series: [
                    {
                        name: '峰时用电',
                        type: 'bar',
                        stack: 'total',
                        data: consumptionData.map(item => item.peak),
                        itemStyle: {
                            color: '#e74c3c'
                        }
                    },
                    {
                        name: '平时用电',
                        type: 'bar',
                        stack: 'total',
                        data: consumptionData.map(item => item.normal),
                        itemStyle: {
                            color: '#f39c12'
                        }
                    },
                    {
                        name: '谷时用电',
                        type: 'bar',
                        stack: 'total',
                        data: consumptionData.map(item => item.valley),
                        itemStyle: {
                            color: '#2ecc71'
                        }
                    }
                ]
            };
            break;
            
        case 'self-sufficiency':
            // 自给率数据
            const sufficiencyData = siteNames.map(() => ({
                rate: (Math.random() * 70 + 30).toFixed(1)
            }));
            
            // 按自给率排序
            sufficiencyData.sort((a, b) => b.rate - a.rate);
            
            option = {
                title: {
                    text: '各站点能源自给率',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '自给率 (%)',
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        type: 'bar',
                        data: sufficiencyData.map(item => item.rate),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value > 80) return '#2ecc71';
                                if (value > 50) return '#3498db';
                                return '#f39c12';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        }
                    }
                ]
            };
            break;
            
        case 'peak-valley':
            // 峰谷用电对比数据
            const peakValleyData = siteNames.map(() => ({
                ratio: (Math.random() * 3 + 1.5).toFixed(2)
            }));
            
            // 按峰谷比排序
            peakValleyData.sort((a, b) => a.ratio - b.ratio);
            
            option = {
                title: {
                    text: '各站点峰谷用电比例',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '峰谷比'
                },
                series: [
                    {
                        type: 'bar',
                        data: peakValleyData.map(item => item.ratio),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value < 2) return '#2ecc71';
                                if (value < 3) return '#f39c12';
                                return '#e74c3c';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top'
                        }
                    }
                ]
            };
            break;
    }
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化电池性能图表
 * @param {string} metric - 指标类型: 'soh', 'cycles', 'efficiency'
 */
function initBatteryChart(metric) {
    const chartDom = document.getElementById('battery-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    
    let option = {};
    
    switch(metric) {
        case 'soh':
            // 电池健康度数据
            const sohData = siteNames.map(() => ({
                soh: (Math.random() * 20 + 80).toFixed(1)
            }));
            
            // 按电池健康度排序
            sohData.sort((a, b) => b.soh - a.soh);
            
            option = {
                title: {
                    text: '各站点电池健康度(SOH)对比',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '健康度 (%)',
                    min: 75,
                    max: 105,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        type: 'bar',
                        data: sohData.map(item => item.soh),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value > 95) return '#2ecc71';
                                if (value > 85) return '#3498db';
                                return '#f39c12';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        }
                    },
                    {
                        type: 'line',
                        name: '设计阈值',
                        data: new Array(siteNames.length).fill(80),
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            label: {
                                formatter: '阈值: 80%',
                                position: 'middle'
                            },
                            lineStyle: {
                                type: 'dashed',
                                color: '#e74c3c'
                            },
                            data: [{
                                yAxis: 80
                            }]
                        }
                    }
                ]
            };
            break;
            
        case 'cycles':
            // 循环次数数据
            const cyclesData = siteNames.map(() => ({
                cycles: Math.floor(Math.random() * 200) + 300
            }));
            
            // 按循环次数排序
            cyclesData.sort((a, b) => b.cycles - a.cycles);
            
            option = {
                title: {
                    text: '各站点电池循环次数对比',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '循环次数'
                },
                series: [
                    {
                        type: 'bar',
                        data: cyclesData.map(item => item.cycles),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value > 450) return '#e74c3c';
                                if (value > 350) return '#f39c12';
                                return '#3498db';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top'
                        }
                    },
                    {
                        type: 'line',
                        name: '设计循环次数',
                        data: new Array(siteNames.length).fill(500),
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            label: {
                                formatter: '设计: 500次',
                                position: 'middle'
                            },
                            lineStyle: {
                                type: 'dashed',
                                color: '#e74c3c'
                            },
                            data: [{
                                yAxis: 500
                            }]
                        }
                    }
                ]
            };
            break;
            
        case 'efficiency':
            // 充放电效率数据
            const efficiencyData = siteNames.map(() => ({
                charge: (Math.random() * 10 + 88).toFixed(1),
                discharge: (Math.random() * 10 + 88).toFixed(1)
            }));
            
            option = {
                title: {
                    text: '各站点电池充放电效率对比',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['充电效率', '放电效率'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '效率 (%)',
                    min: 85,
                    max: 100,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        name: '充电效率',
                        type: 'bar',
                        data: efficiencyData.map(item => item.charge),
                        itemStyle: {
                            color: '#3498db'
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        }
                    },
                    {
                        name: '放电效率',
                        type: 'bar',
                        data: efficiencyData.map(item => item.discharge),
                        itemStyle: {
                            color: '#2ecc71'
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        }
                    }
                ]
            };
            break;
    }
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化系统可靠性图表
 * @param {string} metric - 指标类型: 'lifetime', 'mttr', 'response'
 */
function initReliabilityChart(metric) {
    const chartDom = document.getElementById('reliability-chart');
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点', 
                      '成都站点', '南京站点', '武汉站点', '天津站点', '长沙站点'];
    
    let option = {};
    
    switch(metric) {
        case 'lifetime':
            // 设备剩余寿命数据
            const lifetimeData = siteNames.map(() => ({
                years: (Math.random() * 5 + 3).toFixed(1)
            }));
            
            // 按剩余寿命排序
            lifetimeData.sort((a, b) => a.years - b.years);
            
            option = {
                title: {
                    text: '各站点设备剩余寿命预测',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}年'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'value',
                    name: '剩余年限',
                    axisLabel: {
                        formatter: '{value}年'
                    }
                },
                yAxis: {
                    type: 'category',
                    data: siteNames
                },
                series: [
                    {
                        type: 'bar',
                        data: lifetimeData.map(item => item.years),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value < 4) return '#e74c3c';
                                if (value < 6) return '#f39c12';
                                return '#2ecc71';
                            }
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{c}年'
                        }
                    }
                ]
            };
            break;
            
        case 'mttr':
            // 故障恢复时间数据
            const mttrData = siteNames.map(() => ({
                hours: (Math.random() * 24 + 2).toFixed(1)
            }));
            
            // 按恢复时间排序
            mttrData.sort((a, b) => a.hours - b.hours);
            
            option = {
                title: {
                    text: '各站点平均故障恢复时间',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}小时'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'value',
                    name: '恢复时间(小时)',
                    axisLabel: {
                        formatter: '{value}小时'
                    }
                },
                yAxis: {
                    type: 'category',
                    data: siteNames
                },
                series: [
                    {
                        type: 'bar',
                        data: mttrData.map(item => item.hours),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value < 8) return '#2ecc71';
                                if (value < 16) return '#f39c12';
                                return '#e74c3c';
                            }
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{c}小时'
                        }
                    },
                    {
                        type: 'line',
                        name: '服务等级目标',
                        data: new Array(siteNames.length).fill(12),
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            label: {
                                formatter: 'SLA: 12小时',
                                position: 'middle'
                            },
                            lineStyle: {
                                type: 'dashed',
                                color: '#9b59b6'
                            },
                            data: [{
                                xAxis: 12
                            }]
                        }
                    }
                ]
            };
            break;
            
        case 'response':
            // 维护响应速度数据
            const responseData = siteNames.map(() => ({
                minutes: Math.floor(Math.random() * 90) + 30
            }));
            
            // 按响应速度排序
            responseData.sort((a, b) => a.minutes - b.minutes);
            
            option = {
                title: {
                    text: '各站点维护响应速度',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}分钟'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'value',
                    name: '响应时间(分钟)',
                    axisLabel: {
                        formatter: '{value}分钟'
                    }
                },
                yAxis: {
                    type: 'category',
                    data: siteNames
                },
                series: [
                    {
                        type: 'bar',
                        data: responseData.map(item => item.minutes),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                if (value < 60) return '#2ecc71';
                                if (value < 90) return '#f39c12';
                                return '#e74c3c';
                            }
                        },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: '{c}分钟'
                        }
                    },
                    {
                        type: 'line',
                        name: '服务响应目标',
                        data: new Array(siteNames.length).fill(60),
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            label: {
                                formatter: '目标: 60分钟',
                                position: 'middle'
                            },
                            lineStyle: {
                                type: 'dashed',
                                color: '#9b59b6'
                            },
                            data: [{
                                xAxis: 60
                            }]
                        }
                    }
                ]
            };
            break;
    }
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化时间维度分析图表
 * @param {string} dimension - 时间维度类型: 'seasonal', 'weekday', 'year-on-year'
 */
function initTimeDimensionChart(dimension) {
    const chartDom = document.getElementById('time-dimension-chart');
    const myChart = echarts.init(chartDom);
    
    const siteNames = ['北京站点', '上海站点', '广州站点', '深圳站点', '杭州站点'];
    let option = {};
    
    switch(dimension) {
        case 'seasonal':
            // 季节性能差异数据
            const seasonalData = siteNames.map(() => ({
                spring: (Math.random() * 20 + 70).toFixed(1),
                summer: (Math.random() * 20 + 70).toFixed(1),
                autumn: (Math.random() * 20 + 70).toFixed(1),
                winter: (Math.random() * 20 + 70).toFixed(1)
            }));
            
            option = {
                title: {
                    text: '季节性能差异分析',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach(param => {
                            result += param.marker + param.seriesName + ': ' + param.value + '%<br/>';
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['春季', '夏季', '秋季', '冬季'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '系统效率 (%)',
                    min: 65,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        name: '春季',
                        type: 'bar',
                        data: seasonalData.map(item => item.spring),
                        itemStyle: {
                            color: '#2ecc71'
                        }
                    },
                    {
                        name: '夏季',
                        type: 'bar',
                        data: seasonalData.map(item => item.summer),
                        itemStyle: {
                            color: '#e74c3c'
                        }
                    },
                    {
                        name: '秋季',
                        type: 'bar',
                        data: seasonalData.map(item => item.autumn),
                        itemStyle: {
                            color: '#f39c12'
                        }
                    },
                    {
                        name: '冬季',
                        type: 'bar',
                        data: seasonalData.map(item => item.winter),
                        itemStyle: {
                            color: '#3498db'
                        }
                    }
                ]
            };
            break;
            
        case 'weekday':
            // 工作日/周末表现数据
            const weekdayData = {
                weekday: [88.5, 90.2, 85.7, 92.1, 87.3],
                weekend: [75.8, 78.4, 72.1, 81.5, 76.9]
            };
            
            option = {
                title: {
                    text: '工作日/周末表现对比',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach(param => {
                            result += param.marker + param.seriesName + ': ' + param.value + '%<br/>';
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['工作日', '周末'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '系统效率 (%)',
                    min: 70,
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        name: '工作日',
                        type: 'line',
                        data: weekdayData.weekday,
                        symbol: 'circle',
                        symbolSize: 8,
                        itemStyle: {
                            color: '#3498db'
                        },
                        lineStyle: {
                            width: 3
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        }
                    },
                    {
                        name: '周末',
                        type: 'line',
                        data: weekdayData.weekend,
                        symbol: 'circle',
                        symbolSize: 8,
                        itemStyle: {
                            color: '#f39c12'
                        },
                        lineStyle: {
                            width: 3
                        },
                        label: {
                            show: true,
                            position: 'bottom',
                            formatter: '{c}%'
                        }
                    }
                ]
            };
            break;
            
        case 'year-on-year':
            // 同比/环比增长数据
            const growthData = siteNames.map(() => ({
                yoy: (Math.random() * 30 - 10).toFixed(1),
                mom: (Math.random() * 20 - 5).toFixed(1)
            }));
            
            option = {
                title: {
                    text: '同比/环比增长分析',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach(param => {
                            const value = param.value > 0 ? '+' + param.value + '%' : param.value + '%';
                            result += param.marker + param.seriesName + ': ' + value + '<br/>';
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['同比增长', '环比增长'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: siteNames
                },
                yAxis: {
                    type: 'value',
                    name: '增长率 (%)',
                    axisLabel: {
                        formatter: '{value}%'
                    }
                },
                series: [
                    {
                        name: '同比增长',
                        type: 'bar',
                        data: growthData.map(item => item.yoy),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                return value >= 0 ? '#2ecc71' : '#e74c3c';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: function(params) {
                                return params.value > 0 ? '+' + params.value + '%' : params.value + '%';
                            }
                        }
                    },
                    {
                        name: '环比增长',
                        type: 'bar',
                        data: growthData.map(item => item.mom),
                        itemStyle: {
                            color: function(params) {
                                const value = params.value;
                                return value >= 0 ? '#3498db' : '#f39c12';
                            }
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: function(params) {
                                return params.value > 0 ? '+' + params.value + '%' : params.value + '%';
                            }
                        }
                    }
                ]
            };
            break;
    }
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化地理分布图表
 * @param {string} metric - 地理指标类型: 'performance', 'climate', 'cluster'
 */
function initGeoChart(metric) {
    const chartDom = document.getElementById('geo-chart');
    const myChart = echarts.init(chartDom);
    
    // 模拟数据
    const geoData = [
        {name: '北京', value: Math.floor(Math.random() * 100)},
        {name: '天津', value: Math.floor(Math.random() * 100)},
        {name: '上海', value: Math.floor(Math.random() * 100)},
        {name: '重庆', value: Math.floor(Math.random() * 100)},
        {name: '河北', value: Math.floor(Math.random() * 100)},
        {name: '河南', value: Math.floor(Math.random() * 100)},
        {name: '云南', value: Math.floor(Math.random() * 100)},
        {name: '辽宁', value: Math.floor(Math.random() * 100)},
        {name: '黑龙江', value: Math.floor(Math.random() * 100)},
        {name: '湖南', value: Math.floor(Math.random() * 100)},
        {name: '安徽', value: Math.floor(Math.random() * 100)},
        {name: '山东', value: Math.floor(Math.random() * 100)},
        {name: '江苏', value: Math.floor(Math.random() * 100)},
        {name: '浙江', value: Math.floor(Math.random() * 100)},
        {name: '江西', value: Math.floor(Math.random() * 100)},
        {name: '湖北', value: Math.floor(Math.random() * 100)},
        {name: '广西', value: Math.floor(Math.random() * 100)},
        {name: '甘肃', value: Math.floor(Math.random() * 100)},
        {name: '山西', value: Math.floor(Math.random() * 100)},
        {name: '陕西', value: Math.floor(Math.random() * 100)},
        {name: '吉林', value: Math.floor(Math.random() * 100)},
        {name: '福建', value: Math.floor(Math.random() * 100)},
        {name: '贵州', value: Math.floor(Math.random() * 100)},
        {name: '广东', value: Math.floor(Math.random() * 100)},
        {name: '青海', value: Math.floor(Math.random() * 100)},
        {name: '四川', value: Math.floor(Math.random() * 100)},
        {name: '宁夏', value: Math.floor(Math.random() * 100)},
        {name: '海南', value: Math.floor(Math.random() * 100)},
        {name: '台湾', value: Math.floor(Math.random() * 100)},
        {name: '香港', value: Math.floor(Math.random() * 100)},
        {name: '澳门', value: Math.floor(Math.random() * 100)},
        {name: '内蒙古', value: Math.floor(Math.random() * 100)},
        {name: '新疆', value: Math.floor(Math.random() * 100)},
        {name: '西藏', value: Math.floor(Math.random() * 100)}
    ];
    
    let option = {};
    let title = '';
    let valueUnit = '';
    
    switch(metric) {
        case 'performance':
            title = '各地区站点性能热图';
            valueUnit = '分';
            break;
        case 'climate':
            title = '气候影响分析';
            valueUnit = '%';
            break;
        case 'cluster':
            title = '区域集群效益分析';
            valueUnit = '万元';
            break;
    }
    
    option = {
        title: {
            text: title,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                return params.name + ': ' + params.value + valueUnit;
            }
        },
        visualMap: {
            min: 0,
            max: 100,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
                color: ['#e0f7fa', '#4fc3f7', '#0288d1', '#01579b']
            }
        },
        series: [
            {
                name: metric,
                type: 'map',
                map: 'china',
                roam: true,
                emphasis: {
                    label: {
                        show: true
                    }
                },
                data: geoData
            }
        ]
    };
    
    // 设置图表选项
    myChart.setOption(option);
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', function() {
        myChart.resize();
    });
} 