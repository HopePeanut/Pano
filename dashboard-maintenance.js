/**
 * dashboard-maintenance.js
 * 智慧运维系统 - 运维看板页面脚本
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavbar();
    
    // 初始化所有图表
    initCharts();
    
    // 添加窗口大小调整监听器
    window.addEventListener('resize', function() {
        // 获取所有ECharts实例并调整大小
        const charts = document.querySelectorAll('[id$="-chart"]');
        charts.forEach(chart => {
            const chartInstance = echarts.getInstanceByDom(chart);
            if (chartInstance) {
                chartInstance.resize();
            }
        });
    });
    
    // 初始化卡片放大功能
    initExpandButtons();
});

// 初始化所有图表
function initCharts() {
    // 渲染各个图表
    renderIssuesCountChart();
    renderSiteStatusChart();
    renderIssueTypeChart();
    renderUnplannedDowntimeChart();
    renderMonthlyIssuesChart();
    renderWeeklyDowntimeChart();
    renderCostAnalysisChart();
    renderWeeklyDowntimeDurationChart();
}

// 渲染售后问题数量图表
function renderIssuesCountChart() {
    const chartDom = document.getElementById('issues-count-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '5%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['已完成', '进行中'],
            axisLabel: {
                rotate: 0,
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            nameTextStyle: {
                padding: [0, 0, 0, 30]
            }
        },
        series: [
            {
                type: 'bar',
                data: [
                    {
                        value: 119,
                        itemStyle: {
                            color: '#A5DEDA'
                        }
                    },
                    {
                        value: 15,
                        itemStyle: {
                            color: '#E57373'
                        }
                    }
                ],
                barWidth: '40%',
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 14,
                    color: '#333'
                }
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染当前电站运行状态图表
function renderSiteStatusChart() {
    const chartDom = document.getElementById('site-status-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '5%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            max: 60
        },
        yAxis: {
            type: 'category',
            data: ['异常运行项目', '异常停运项目', '正常停运站点', '正常运行站点'],
            axisLabel: {
                color: '#666'
            }
        },
        series: [
            {
                type: 'bar',
                data: [
                    {
                        value: 9,
                        itemStyle: { color: '#4CAF50' }
                    },
                    {
                        value: 1,
                        itemStyle: { color: '#F44336' }
                    },
                    {
                        value: 37,
                        itemStyle: { color: '#2196F3' }
                    },
                    {
                        value: 54,
                        itemStyle: { color: '#49A18D' }
                    }
                ],
                label: {
                    show: true,
                    position: 'right',
                    fontSize: 14,
                    color: '#333'
                }
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染售后问题类型图表
function renderIssueTypeChart() {
    const chartDom = document.getElementById('issue-type-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '5%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['EMS', 'PCS', 'BMS', '热管理', '消防', '动环电气', '网络', '其他'],
            axisLabel: {
                interval: 0,
                rotate: 0,
                color: '#666'
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                type: 'bar',
                data: [100, 40, 120, 130, 15, 8, 12, 55],
                itemStyle: {
                    color: function(params) {
                        const colorList = [
                            '#49A18D', '#2196F3', '#4CAF50', 
                            '#FFC107', '#9C27B0', '#FF5722',
                            '#795548', '#607D8B'
                        ];
                        return colorList[params.dataIndex];
                    }
                },
                barWidth: '60%'
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染近3月非计划停机小时对比图表
function renderUnplannedDowntimeChart() {
    const chartDom = document.getElementById('unplanned-downtime-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: '5%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            max: 300
        },
        yAxis: {
            type: 'category',
            data: ['1月', '2月', '3月'],
            axisLabel: {
                color: '#666'
            }
        },
        series: [
            {
                type: 'bar',
                data: [
                    {
                        value: 89,
                        itemStyle: { color: '#4CAF50' }
                    },
                    {
                        value: 250,
                        itemStyle: { color: '#2196F3' }
                    },
                    {
                        value: 209,
                        itemStyle: { color: '#49A18D' }
                    }
                ],
                label: {
                    show: true,
                    position: 'right',
                    fontSize: 14,
                    color: '#333'
                },
                barWidth: '40%'
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染月度异常数量趋势图表
function renderMonthlyIssuesChart() {
    const chartDom = document.getElementById('monthly-issues-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['10/24', '11/24', '12/24', '1/25', '2/25', '3/25'],
            axisLabel: {
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '异常数量',
            nameTextStyle: {
                padding: [0, 0, 0, 30]
            }
        },
        series: [
            {
                type: 'line',
                data: [27, 43, 37, 31, 31, 72],
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: '#49A18D'
                },
                lineStyle: {
                    width: 3,
                    color: '#49A18D'
                },
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' }
                    ]
                }
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染本周停机时长及停机率图表
function renderWeeklyDowntimeDurationChart() {
    const chartDom = document.getElementById('weekly-downtime-duration-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 修改数据 - 使用周一至周日作为横坐标
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const downtimeHours = [8.5, 4.2, 7.8, 5.6, 3.2, 1.5, 3.8];  // 每天的停机时长
    const downtimeRates = [1.77, 0.88, 1.63, 1.17, 0.67, 0.31, 0.79]; // 每天的停机率(%)
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                const downtimeIndex = params[0].dataIndex;
                const rateIndex = params[1].dataIndex;
                return `${params[0].name}<br/>
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>
                        停机时长: ${downtimeHours[downtimeIndex]}小时<br/>
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[1].color};"></span>
                        停机率: ${downtimeRates[rateIndex]}%`;
            }
        },
        legend: {
            data: ['停机时长(小时)', '停机率(%)'],
            top: '2%',
            textStyle: {
                fontSize: 12
            }
        },
        grid: {
            top: '20%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: weekdays,  // 修改为周一至周日
                axisLabel: {
                    interval: 0,
                    fontSize: 11,
                    color: '#666'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '停机时长(小时)',
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#49A18D'
                    }
                },
                axisLabel: {
                    formatter: '{value}',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                }
            },
            {
                type: 'value',
                name: '停机率(%)',
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#F39C12'
                    }
                },
                axisLabel: {
                    formatter: '{value}%',
                    fontSize: 10
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '停机时长(小时)',
                type: 'bar',
                barWidth: '20px',
                itemStyle: {
                    color: '#49A18D'
                },
                data: downtimeHours
            },
            {
                name: '停机率(%)',
                type: 'line',
                yAxisIndex: 1,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#F39C12'
                },
                lineStyle: {
                    width: 2,
                    color: '#F39C12'
                },
                data: downtimeRates
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染本周非计划停机站点图表 (原7天非计划停机)
function renderWeeklyDowntimeChart() {
    const chartDom = document.getElementById('weekly-downtime-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 修改数据 - 使用站点名称作为横坐标，停机时长和停机率作为纵坐标
    const siteNames = ['清安储能站', '南沙储能站', '天河充电站', '黄埔光伏站', '白云储能站'];
    const downtimeHours = [12.5, 8.3, 4.2, 7.8, 3.5]; // 停机时长(小时)
    const downtimeRates = [2.6, 1.7, 0.9, 1.6, 0.7]; // 停机率(%)
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                const hourIndex = params[0].dataIndex;
                const rateIndex = params[1].dataIndex;
                return `${params[0].name}<br/>
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>
                        停机时长: ${downtimeHours[hourIndex]}小时<br/>
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[1].color};"></span>
                        停机率: ${downtimeRates[rateIndex]}%`;
            }
        },
        legend: {
            data: ['停机时长(小时)', '停机率(%)'],
            top: '2%',
            textStyle: {
                fontSize: 12
            }
        },
        grid: {
            top: '20%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: siteNames,
            axisLabel: {
                interval: 0,
                rotate: 30,
                color: '#666',
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '停机时长(小时)',
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#E74C3C'
                    }
                },
                axisLabel: {
                    formatter: '{value}',
                    fontSize: 10
                }
            },
            {
                type: 'value',
                name: '停机率(%)',
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#F39C12'
                    }
                },
                axisLabel: {
                    formatter: '{value}%',
                    fontSize: 10
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '停机时长(小时)',
                type: 'bar',
                data: downtimeHours,
                barWidth: '20px',
                itemStyle: {
                    color: '#E74C3C'
                }
            },
            {
                name: '停机率(%)',
                type: 'line',
                yAxisIndex: 1,
                symbol: 'circle',
                symbolSize: 6,
                data: downtimeRates,
                itemStyle: {
                    color: '#F39C12'
                },
                lineStyle: {
                    width: 2,
                    color: '#F39C12'
                }
            }
        ]
    };
    
    myChart.setOption(option);
}

// 渲染售后成本费用统计图表
function renderCostAnalysisChart() {
    const chartDom = document.getElementById('cost-analysis-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['成本费用', '维护损失'],
            right: '5%',
            top: '2%',
            textStyle: {
                fontSize: 12
            },
            itemWidth: 12,
            itemHeight: 8
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月'],
            axisLabel: {
                color: '#666',
                fontSize: 10,
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            name: '金额（元）',
            nameTextStyle: {
                padding: [0, 0, 0, 30],
                fontSize: 10
            },
            axisLabel: {
                fontSize: 10
            }
        },
        series: [
            {
                name: '成本费用',
                type: 'bar',
                data: [17632, 5054, 4221, 0],
                itemStyle: {
                    color: '#49A18D'
                },
                barGap: 0,
                barWidth: '12px'
            },
            {
                name: '维护损失',
                type: 'bar',
                data: [9219, 7041, 18759, 0],
                itemStyle: {
                    color: '#FFB74D'
                },
                barWidth: '12px'
            }
        ]
    };
    
    myChart.setOption(option);
}

// 初始化卡片放大按钮功能
function initExpandButtons() {
    // 获取模态框元素
    const expandModal = document.getElementById('expand-modal');
    const expandedChartContainer = document.getElementById('expanded-chart-container');
    const expandModalTitle = document.getElementById('expand-modal-title');
    const closeExpandModalBtn = document.querySelector('.close-expand-modal');
    
    // 为所有放大按钮绑定点击事件
    document.querySelectorAll('.btn-expand').forEach(btn => {
        btn.addEventListener('click', function() {
            // 获取当前卡片信息
            const card = this.closest('.stats-card');
            const cardId = card.id;
            const cardTitle = card.querySelector('.card-header h3').innerHTML;
            const chartContainer = card.querySelector('.chart-container');
            const countDisplay = card.querySelector('.count-display');
            
            // 设置模态框标题
            expandModalTitle.innerHTML = cardTitle;
            
            // 清空扩展图表容器
            expandedChartContainer.innerHTML = '';
            
            // 创建放大后的内容
            if (chartContainer) {
                // 如果是图表卡片
                const chartId = chartContainer.id;
                const expandedChartId = 'expanded-' + chartId;
                
                // 创建新的图表容器
                const newChartDiv = document.createElement('div');
                newChartDiv.id = expandedChartId;
                newChartDiv.style.width = '100%';
                newChartDiv.style.height = '100%';
                expandedChartContainer.appendChild(newChartDiv);
                
                // 复制图表到放大视图
                const originalChart = echarts.getInstanceByDom(chartContainer);
                if (originalChart) {
                    const option = originalChart.getOption();
                    setTimeout(() => {
                        const expandedChart = echarts.init(newChartDiv);
                        // 增强图表选项，使其在大屏上显示更多细节
                        enhanceChartOption(option, cardId);
                        expandedChart.setOption(option);
                    }, 100);
                }
            } else if (countDisplay) {
                // 如果是数字指标卡片
                const expandedCountDisplay = countDisplay.cloneNode(true);
                expandedCountDisplay.classList.add('expanded-count-display');
                expandedChartContainer.appendChild(expandedCountDisplay);
            }
            
            // 显示模态框
            expandModal.classList.add('active');
        });
    });
    
    // 关闭模态框的点击事件
    closeExpandModalBtn.addEventListener('click', function() {
        expandModal.classList.remove('active');
    });
    
    // 点击模态框背景关闭模态框
    expandModal.addEventListener('click', function(e) {
        if (e.target === expandModal) {
            expandModal.classList.remove('active');
        }
    });
    
    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && expandModal.classList.contains('active')) {
            expandModal.classList.remove('active');
        }
    });
}

// 增强图表选项，使其在大屏上显示更多细节
function enhanceChartOption(option, cardId) {
    // 增加字体大小
    if (option.title && option.title.textStyle) {
        option.title.textStyle.fontSize = 18;
    }
    
    if (option.legend && option.legend.textStyle) {
        option.legend.textStyle.fontSize = 14;
    }
    
    // 如果有X轴标签，增加大小并减少旋转角度
    if (option.xAxis) {
        const xAxis = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis];
        xAxis.forEach(axis => {
            if (axis.axisLabel) {
                axis.axisLabel.fontSize = 14;
                if (axis.axisLabel.rotate && axis.axisLabel.rotate > 0) {
                    axis.axisLabel.rotate = Math.max(0, axis.axisLabel.rotate - 15);
                }
            }
        });
    }
    
    // 如果有Y轴标签，增加大小
    if (option.yAxis) {
        const yAxis = Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis];
        yAxis.forEach(axis => {
            if (axis.axisLabel) {
                axis.axisLabel.fontSize = 14;
            }
            if (axis.nameTextStyle) {
                axis.nameTextStyle.fontSize = 14;
                axis.nameTextStyle.padding = [0, 0, 0, 50]; // 增加名称与轴的距离
            }
        });
    }
    
    // 增加标签大小和可见性
    if (option.series) {
        option.series.forEach(series => {
            if (series.label) {
                series.label.show = true;
                series.label.fontSize = 14;
            }
            
            // 增加柱状图宽度
            if (series.type === 'bar') {
                if (series.barWidth && parseInt(series.barWidth) < 30) {
                    series.barWidth = '30px';
                }
            }
            
            // 增加折线图的线宽
            if (series.type === 'line') {
                if (series.lineStyle) {
                    series.lineStyle.width = 3;
                }
                if (series.symbolSize) {
                    series.symbolSize = Math.max(8, series.symbolSize);
                } else {
                    series.symbolSize = 8;
                }
            }
        });
    }
    
    // 针对特定卡片的自定义增强
    switch (cardId) {
        case 'weekly-downtime-duration-card':
            if (option.grid) {
                option.grid.top = '15%';
                option.grid.bottom = '10%';
            }
            break;
        case 'cost-analysis-card':
            if (option.grid) {
                option.grid.top = '15%';
                option.grid.bottom = '10%';
            }
            break;
    }
    
    return option;
} 