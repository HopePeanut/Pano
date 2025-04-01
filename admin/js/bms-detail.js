// BMS详情页面JavaScript文件

// 当文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initBMSCharts();
    
    // 绑定刷新按钮事件
    initRefreshButton();
    
    // 绑定控制按钮事件
    initControlButtons();
    
    // 绑定查看选择器事件
    initSelectors();
});

/**
 * 初始化BMS图表
 */
function initBMSCharts() {
    // 初始化电芯电压分布图表
    initCellVoltageChart();
    
    // 初始化电芯温度分布图表
    initCellTemperatureChart();
}

/**
 * 初始化电芯电压分布图表
 */
function initCellVoltageChart() {
    const chartDom = document.getElementById('cellVoltageChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const cellCount = 208; // 4个Pack，每个Pack 52个电芯
    const voltageData = [];
    
    let maxVoltage = 3.42;
    let minVoltage = 3.38;
    let maxIndex = Math.floor(Math.random() * cellCount);
    let minIndex = Math.floor(Math.random() * cellCount);
    
    for (let i = 0; i < cellCount; i++) {
        let voltage;
        if (i === maxIndex) {
            voltage = maxVoltage;
        } else if (i === minIndex) {
            voltage = minVoltage;
        } else {
            // 随机电压在3.38-3.42V之间
            voltage = 3.38 + Math.random() * 0.04;
        }
        voltageData.push({
            value: voltage.toFixed(3),
            itemStyle: {
                color: i === maxIndex ? '#e74c3c' : (i === minIndex ? '#3498db' : '#2ecc71')
            }
        });
    }
    
    const option = {
        title: {
            text: '电芯电压分布 (V)',
            left: 'center',
            textStyle: {
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                return `电芯 ${params[0].dataIndex + 1}：${params[0].value} V`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '60px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Array.from({length: cellCount}, (_, i) => i + 1),
            name: '电芯编号',
            axisLabel: {
                interval: Math.floor(cellCount / 10)
            }
        },
        yAxis: {
            type: 'value',
            name: '电压 (V)',
            min: 3.37,
            max: 3.43
        },
        series: [
            {
                name: '电压',
                type: 'bar',
                data: voltageData,
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' }
                    ]
                },
                markLine: {
                    data: [
                        { type: 'average', name: '平均值' }
                    ]
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化电芯温度分布图表
 */
function initCellTemperatureChart() {
    const chartDom = document.getElementById('cellTemperatureChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // 生成模拟数据
    const cellCount = 208; // 4个Pack，每个Pack 52个电芯
    const temperatureData = [];
    
    let maxTemp = 32.6;
    let minTemp = 25.3;
    let maxIndex = Math.floor(Math.random() * cellCount);
    let minIndex = Math.floor(Math.random() * cellCount);
    
    for (let i = 0; i < cellCount; i++) {
        let temp;
        if (i === maxIndex) {
            temp = maxTemp;
        } else if (i === minIndex) {
            temp = minTemp;
        } else {
            // 随机温度在25.3-32.6℃之间
            temp = 25.3 + Math.random() * 7.3;
        }
        temperatureData.push({
            value: temp.toFixed(1),
            itemStyle: {
                color: i === maxIndex ? '#e74c3c' : (i === minIndex ? '#3498db' : '#f39c12')
            }
        });
    }
    
    const option = {
        title: {
            text: '电芯温度分布 (°C)',
            left: 'center',
            textStyle: {
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                return `电芯 ${params[0].dataIndex + 1}：${params[0].value} °C`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '60px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: Array.from({length: cellCount}, (_, i) => i + 1),
            name: '电芯编号',
            axisLabel: {
                interval: Math.floor(cellCount / 10)
            }
        },
        yAxis: {
            type: 'value',
            name: '温度 (°C)',
            min: 24,
            max: 34
        },
        series: [
            {
                name: '温度',
                type: 'bar',
                data: temperatureData,
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' }
                    ]
                },
                markLine: {
                    data: [
                        { type: 'average', name: '平均值' }
                    ]
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 初始化刷新按钮
 */
function initRefreshButton() {
    const refreshBtn = document.querySelector('.refresh-btn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // 视觉反馈
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 刷新中...';
            this.disabled = true;
            
            // 模拟刷新操作
            setTimeout(() => {
                // 重新初始化图表
                initBMSCharts();
                
                // 更新最后更新时间
                const now = new Date();
                const timeString = now.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                
                const timeDisplay = document.querySelector('.last-update span');
                if (timeDisplay) {
                    timeDisplay.textContent = `最后更新: ${timeString}`;
                }
                
                // 恢复按钮状态
                this.innerHTML = '<i class="fas fa-sync-alt"></i> 刷新';
                this.disabled = false;
                
                // 模拟随机数据变化
                updateRandomValues();
            }, 1500);
        });
    }
}

/**
 * 初始化控制按钮
 */
function initControlButtons() {
    const controlBtns = document.querySelectorAll('.control-btn:not(:disabled)');
    
    controlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            
            // 显示确认对话框
            if (confirm(`确定要执行"${action}"操作吗？`)) {
                // 视觉反馈
                const icon = this.querySelector('i');
                const originalIcon = icon.className;
                icon.className = 'fas fa-spinner fa-spin';
                this.disabled = true;
                
                // 模拟操作
                setTimeout(() => {
                    // 恢复按钮状态
                    icon.className = originalIcon;
                    this.disabled = false;
                    
                    // 显示提示消息
                    showToast(`${action}操作已执行`);
                }, 2000);
            }
        });
    });
}

/**
 * 初始化选择器事件
 */
function initSelectors() {
    // 电池包选择器
    const packSelector = document.getElementById('packSelector');
    if (packSelector) {
        packSelector.addEventListener('change', function() {
            // 模拟筛选效果
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chart-loading';
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
            
            const chartContainer = document.querySelector('.vis-charts');
            if (chartContainer) {
                chartContainer.appendChild(loadingDiv);
                
                setTimeout(() => {
                    // 重新初始化图表
                    initBMSCharts();
                    
                    // 移除加载效果
                    chartContainer.removeChild(loadingDiv);
                    
                    // 更新标题
                    const selectedPack = this.options[this.selectedIndex].text;
                    const voltageChart = document.getElementById('cellVoltageChart');
                    const tempChart = document.getElementById('cellTemperatureChart');
                    
                    if (voltageChart) {
                        const chart = echarts.getInstanceByDom(voltageChart);
                        const option = chart.getOption();
                        option.title[0].text = `${selectedPack} 电芯电压分布 (V)`;
                        chart.setOption(option);
                    }
                    
                    if (tempChart) {
                        const chart = echarts.getInstanceByDom(tempChart);
                        const option = chart.getOption();
                        option.title[0].text = `${selectedPack} 电芯温度分布 (°C)`;
                        chart.setOption(option);
                    }
                }, 1000);
            }
        });
    }
    
    // 可视化类型选择器
    const visType = document.getElementById('visType');
    if (visType) {
        visType.addEventListener('change', function() {
            const selectedType = this.value;
            const voltageChart = document.getElementById('cellVoltageChart');
            const tempChart = document.getElementById('cellTemperatureChart');
            
            if (selectedType === 'voltage') {
                voltageChart.style.display = 'block';
                tempChart.style.display = 'none';
            } else {
                voltageChart.style.display = 'none';
                tempChart.style.display = 'block';
            }
        });
    }
    
    // 参数分组选择器
    const paramsGroup = document.getElementById('paramsGroup');
    if (paramsGroup) {
        paramsGroup.addEventListener('change', function() {
            const selectedGroup = this.value;
            const rows = document.querySelectorAll('.params-table tbody tr');
            
            // 简单模拟筛选效果
            if (selectedGroup === 'all') {
                rows.forEach(row => {
                    row.style.display = '';
                });
            } else {
                rows.forEach((row, index) => {
                    // 模拟不同参数组，每3行属于一个组
                    const group = Math.floor(index / 3) % 4;
                    if (
                        (selectedGroup === 'status' && group === 0) ||
                        (selectedGroup === 'electrical' && group === 1) ||
                        (selectedGroup === 'thermal' && group === 2) ||
                        (selectedGroup === 'limits' && group === 3)
                    ) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    }
}

/**
 * 更新随机数值
 */
function updateRandomValues() {
    // 更新核心信息卡片
    updateInfoCards();
    
    // 更新限值信息
    updateLimitsInfo();
    
    // 更新使用信息
    updateUsageInfo();
    
    // 更新参数表格
    updateParamsTable();
}

/**
 * 更新信息卡片
 */
function updateInfoCards() {
    const infoValues = document.querySelectorAll('.core-info-card .info-value');
    
    // 随机更新SOC
    const socValue = infoValues[3];
    if (socValue) {
        const currentSoc = parseFloat(socValue.textContent);
        const newSoc = Math.max(0, Math.min(100, currentSoc + (Math.random() - 0.5) * 2)).toFixed(1);
        socValue.textContent = newSoc + '%';
    }
    
    // 随机更新电压
    const voltageValue = infoValues[4];
    if (voltageValue) {
        const currentVoltage = parseFloat(voltageValue.textContent);
        const newVoltage = (currentVoltage + (Math.random() - 0.5) * 2).toFixed(1);
        voltageValue.textContent = newVoltage + ' V';
    }
    
    // 随机更新电流
    const currentValue = infoValues[5];
    if (currentValue) {
        const currentCurrent = parseFloat(currentValue.textContent);
        const newCurrent = (currentCurrent + (Math.random() - 0.5) * 5).toFixed(1);
        currentValue.textContent = newCurrent + ' A';
    }
    
    // 随机更新温度
    const tempValue = infoValues[6];
    if (tempValue) {
        const currentTemp = parseFloat(tempValue.textContent);
        const newTemp = (currentTemp + (Math.random() - 0.5) * 0.5).toFixed(1);
        tempValue.textContent = newTemp + ' °C';
    }
}

/**
 * 更新限值信息
 */
function updateLimitsInfo() {
    const limitsValues = document.querySelectorAll('.limits-item .limits-value');
    
    // 随机更新最高温度
    const maxTempValue = limitsValues[0];
    if (maxTempValue) {
        const currentTemp = parseFloat(maxTempValue.textContent);
        const newTemp = (currentTemp + (Math.random() - 0.4) * 0.4).toFixed(1);
        maxTempValue.textContent = newTemp + ' °C';
    }
    
    // 随机更新最低温度
    const minTempValue = limitsValues[1];
    if (minTempValue) {
        const currentTemp = parseFloat(minTempValue.textContent);
        const newTemp = (currentTemp + (Math.random() - 0.6) * 0.3).toFixed(1);
        minTempValue.textContent = newTemp + ' °C';
    }
    
    // 随机更新最高电压
    const maxVoltageValue = limitsValues[2];
    if (maxVoltageValue) {
        const currentVoltage = parseFloat(maxVoltageValue.textContent);
        const newVoltage = (currentVoltage + (Math.random() - 0.4) * 0.02).toFixed(2);
        maxVoltageValue.textContent = newVoltage + ' V';
    }
    
    // 随机更新最低电压
    const minVoltageValue = limitsValues[3];
    if (minVoltageValue) {
        const currentVoltage = parseFloat(minVoltageValue.textContent);
        const newVoltage = (currentVoltage + (Math.random() - 0.6) * 0.01).toFixed(2);
        minVoltageValue.textContent = newVoltage + ' V';
    }
}

/**
 * 更新使用信息
 */
function updateUsageInfo() {
    const usageValues = document.querySelectorAll('.usage-item .usage-value');
    
    // 随机更新今日充电量
    const chargeValue = usageValues[0];
    if (chargeValue) {
        const currentCharge = parseFloat(chargeValue.textContent);
        const newCharge = (currentCharge + Math.random() * 2).toFixed(1);
        chargeValue.textContent = newCharge + ' kWh';
    }
    
    // 随机更新今日放电量
    const dischargeValue = usageValues[1];
    if (dischargeValue) {
        const currentDischarge = parseFloat(dischargeValue.textContent);
        const newDischarge = (currentDischarge + Math.random() * 1).toFixed(1);
        dischargeValue.textContent = newDischarge + ' kWh';
    }
    
    // 随机更新可充电电量
    const availableChargeValue = usageValues[2];
    if (availableChargeValue) {
        const currentAvailable = parseFloat(availableChargeValue.textContent);
        const newAvailable = (currentAvailable - Math.random() * 0.5).toFixed(1);
        availableChargeValue.textContent = newAvailable + ' kWh';
    }
    
    // 随机更新可放电电量
    const availableDischargeValue = usageValues[3];
    if (availableDischargeValue) {
        const currentAvailable = parseFloat(availableDischargeValue.textContent);
        const newAvailable = (currentAvailable - Math.random() * 1).toFixed(1);
        availableDischargeValue.textContent = newAvailable + ' kWh';
    }
}

/**
 * 更新参数表格
 */
function updateParamsTable() {
    const rows = document.querySelectorAll('.params-table tbody tr');
    
    rows.forEach(row => {
        // 获取数值单元格
        const valueCell = row.querySelector('td:nth-child(2)');
        const statusCell = row.querySelector('td:nth-child(5)');
        
        if (valueCell) {
            // 获取当前值
            const currentValue = parseFloat(valueCell.textContent);
            
            // 根据参数类型不同，随机变化值
            const paramName = row.querySelector('td:first-child').textContent;
            let newValue = currentValue;
            
            if (paramName.includes('温度')) {
                newValue = (currentValue + (Math.random() - 0.5) * 0.5).toFixed(1);
            } else if (paramName.includes('电压')) {
                newValue = (currentValue + (Math.random() - 0.5) * 0.02).toFixed(2);
            } else if (paramName.includes('电流')) {
                newValue = (currentValue + (Math.random() - 0.5) * 5).toFixed(1);
            } else if (paramName.includes('SOC')) {
                newValue = (currentValue + (Math.random() - 0.5) * 0.5).toFixed(1);
            } else if (paramName.includes('功率')) {
                newValue = (currentValue + (Math.random() - 0.5) * 3).toFixed(2);
            } else {
                newValue = (currentValue + (Math.random() - 0.5) * 0.3).toFixed(2);
            }
            
            // 更新值
            valueCell.textContent = newValue;
            
            // 更新更新时间
            const timeCell = row.querySelector('td:nth-child(4)');
            if (timeCell) {
                const now = new Date();
                timeCell.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                                       now.getMinutes().toString().padStart(2, '0') + ':' + 
                                       now.getSeconds().toString().padStart(2, '0');
            }
            
            // 随机更新状态
            if (statusCell && Math.random() > 0.9) {
                const statusText = statusCell.textContent;
                if (statusText === '正常') {
                    statusCell.textContent = '告警';
                    statusCell.className = 'status warning';
                } else {
                    statusCell.textContent = '正常';
                    statusCell.className = 'status normal';
                }
            }
        }
    });
}

/**
 * 显示提示消息
 * @param {string} message - 提示消息
 */
function showToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // 添加样式
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 渐入
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // 定时消失
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
} 