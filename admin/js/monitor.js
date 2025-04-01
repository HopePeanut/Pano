// 监控系统JS
document.addEventListener('DOMContentLoaded', function() {
    console.log('监控系统初始化...');
    
    // 初始化系统选项卡
    initSystemTabs();
    
    // 初始化设备选项卡
    initDeviceTabs();
    
    // 初始化功能选项卡
    initFunctionTabs();
    
    // 加载初始内容
    const defaultSystem = document.querySelector('.system-tabs .tab-item.active').dataset.system;
    const defaultDevice = document.querySelector('.device-tabs .tab-item.active').dataset.device;
    const defaultFunction = document.querySelector('.function-tabs .tab-item.active').dataset.function;
    
    // 加载初始内容
    loadContent(defaultSystem, defaultDevice, defaultFunction);
    
    // 初始化提示框
    initTooltip();
});

/**
 * 初始化系统选项卡
 */
function initSystemTabs() {
    const systemTabs = document.querySelectorAll('.system-tabs .tab-item');
    
    systemTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const system = this.dataset.system;
            
            // 更新选项卡状态
            systemTabs.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // 重新加载当前功能的内容
            const activeDevice = document.querySelector('.device-tabs .tab-item.active').dataset.device;
            const activeFunction = document.querySelector('.function-tabs .tab-item.active').dataset.function;
            
            loadContent(system, activeDevice, activeFunction);
        });
    });
}

/**
 * 初始化设备选项卡
 */
function initDeviceTabs() {
    const deviceTabs = document.querySelectorAll('.device-tabs .tab-item');
    
    deviceTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const device = this.dataset.device;
            
            // 更新选项卡状态
            deviceTabs.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // 重新加载当前功能的内容
            const activeSystem = document.querySelector('.system-tabs .tab-item.active').dataset.system;
            const activeFunction = document.querySelector('.function-tabs .tab-item.active').dataset.function;
            
            loadContent(activeSystem, device, activeFunction);
        });
    });
}

/**
 * 初始化功能选项卡
 */
function initFunctionTabs() {
    const functionTabs = document.querySelectorAll('.function-tabs .tab-item');
    
    functionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const func = this.dataset.function;
            
            // 更新选项卡状态
            functionTabs.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // 重新加载内容
            const activeSystem = document.querySelector('.system-tabs .tab-item.active').dataset.system;
            const activeDevice = document.querySelector('.device-tabs .tab-item.active').dataset.device;
            
            loadContent(activeSystem, activeDevice, func);
        });
    });
}

/**
 * 加载内容
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} func - 功能标识
 */
function loadContent(system, device, func) {
    console.log(`加载内容: ${system} - ${device} - ${func}`);
    
    // 更新设备标题
    updateDeviceTitle(system, device);
    
    // 隐藏所有内容区域
    const contentAreas = document.querySelectorAll('.function-content');
    contentAreas.forEach(area => area.classList.remove('active'));
    
    // 显示对应的内容区域
    const activeContent = document.getElementById(`${func}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // 根据功能加载不同内容
    if (func === 'monitor') {
        loadMonitorContent(system, device);
    } else if (func === 'control') {
        loadControlContent(system, device);
    } else if (func === 'config') {
        loadConfigContent(system, device);
    }
}

/**
 * 更新设备标题
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function updateDeviceTitle(system, device) {
    const deviceTitle = document.getElementById('device-title');
    
    if (deviceTitle) {
        deviceTitle.textContent = getDeviceName(device);
    }
}

/**
 * 获取设备名称
 * @param {string} device - 设备标识
 * @returns {string} 设备名称
 */
function getDeviceName(device) {
    switch (device) {
        case 'local':
            return '本地控制器';
        case 'bms':
            return 'BMS';
        case 'pcs':
            return 'PCS';
        case 'thermal':
            return '热管理系统';
        case 'fire':
            return '消防系统';
        case 'enviro':
            return '环境监测';
        case 'electrical':
            return '电气系统';
        default:
            return '未知设备';
    }
}

/**
 * 加载监控内容
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadMonitorContent(system = 'ems', device = 'local') {
    console.log(`加载 ${system} 的 ${device} 监控内容`);
    
    // 加载重点数据
    loadKeyData(system, device);
    
    // 加载状态点位
    loadStatusPoints(system, device);
    
    // 加载遥测数据
    loadTelemetryData(system, device);
    
    // 加载告警点位
    loadAlarmPoints(system, device);
    
    // 添加刷新事件
    initRefreshButtons();
    
    // 更新最后刷新时间
    updateLastRefreshTime();
}

/**
 * 加载重点数据
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadKeyData(system, device) {
    const keyDataContainer = document.querySelector('.key-data-container');
    
    if (!keyDataContainer) return;
    
    // 清空容器
    keyDataContainer.innerHTML = '';
    
    // 添加标题和刷新按钮
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <h3 class="section-title">
            重点数据
            <button class="refresh-btn" data-section="key"><i class="bi bi-arrow-clockwise"></i></button>
        </h3>
        <div class="last-refresh-time">
            最后刷新: <span id="key-refresh-time">${getCurrentTime()}</span>
        </div>
    `;
    keyDataContainer.appendChild(header);
    
    // 获取重点数据
    const keyData = getKeyData(system, device);
    
    // 创建重点数据卡片容器
    const cardContainer = document.createElement('div');
    cardContainer.className = 'key-data-cards';
    
    // 遍历重点数据并创建卡片
    keyData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'key-data-card';
        
        card.innerHTML = `
            <div class="key-data-name">${item.name}</div>
            <div class="key-data-value">${item.value}<span class="key-data-unit">${item.unit}</span></div>
        `;
        
        cardContainer.appendChild(card);
    });
    
    keyDataContainer.appendChild(cardContainer);
}

/**
 * 加载遥测数据
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadTelemetryData(system, device) {
    const telemetryContainer = document.querySelector('.telemetry-container');
    
    if (!telemetryContainer) return;
    
    // 清空容器
    telemetryContainer.innerHTML = '';
    
    // 添加标题和刷新按钮
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <h3 class="section-title">
            遥测数据
            <button class="refresh-btn" data-section="telemetry"><i class="bi bi-arrow-clockwise"></i></button>
        </h3>
        <div class="last-refresh-time">
            最后刷新: <span id="telemetry-refresh-time">${getCurrentTime()}</span>
        </div>
    `;
    telemetryContainer.appendChild(header);
    
    // 获取遥测数据
    const telemetryData = getTelemetryData(system, device);
    
    // 创建遥测表格
    const table = document.createElement('table');
    table.className = 'telemetry-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="telemetry-name">测点名称</th>
            <th class="telemetry-value">值</th>
            <th class="telemetry-unit">单位</th>
            <th class="telemetry-time">时间</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    // 遍历遥测数据并创建行
    telemetryData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="telemetry-name">${item.name}</td>
            <td class="telemetry-value">${item.value}</td>
            <td class="telemetry-unit">${item.unit}</td>
            <td class="telemetry-time">${item.time}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    telemetryContainer.appendChild(table);
}

/**
 * 加载状态点位
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadStatusPoints(system, device) {
    const statusContainer = document.querySelector('.status-container');
    
    if (!statusContainer) return;
    
    // 清空容器
    statusContainer.innerHTML = '';
    
    // 添加标题和刷新按钮
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <h3 class="section-title">
            状态点位
            <button class="refresh-btn" data-section="status"><i class="bi bi-arrow-clockwise"></i></button>
        </h3>
        <div class="last-refresh-time">
            最后刷新: <span id="status-refresh-time">${getCurrentTime()}</span>
        </div>
    `;
    statusContainer.appendChild(header);
    
    // 获取状态点位
    const statusPoints = getStatusPoints(system, device);
    
    // 创建状态点位列表
    const statusList = document.createElement('div');
    statusList.className = 'status-list';
    
    // 遍历状态点位并创建列表项
    statusPoints.forEach(point => {
        const statusItem = document.createElement('div');
        statusItem.className = 'status-item';
        
        // 创建状态名称
        const statusName = document.createElement('div');
        statusName.className = 'status-name';
        statusName.textContent = point.name;
        statusItem.appendChild(statusName);
        
        // 创建状态值
        const statusValue = document.createElement('div');
        statusValue.className = `status-value ${point.valueClass || ''}`;
        
        // 添加状态指示器
        const statusIndicator = document.createElement('span');
        statusIndicator.className = `status-indicator ${point.active ? 'active' : 'inactive'}`;
        statusValue.appendChild(statusIndicator);
        
        // 添加状态文本
        const statusText = document.createElement('span');
        statusText.className = 'status-text';
        statusText.textContent = point.value;
        statusValue.appendChild(statusText);
        
        statusItem.appendChild(statusValue);
        statusList.appendChild(statusItem);
    });
    
    statusContainer.appendChild(statusList);
}

/**
 * 加载告警点位
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadAlarmPoints(system, device) {
    const alarmContainer = document.querySelector('.alarm-container');
    
    if (!alarmContainer) return;
    
    // 清空容器
    alarmContainer.innerHTML = '';
    
    // 获取告警点位
    const alarmPoints = getAlarmPoints(system, device);
    
    // 如果没有告警，不显示告警区域
    if (alarmPoints.length === 0) {
        alarmContainer.style.display = 'none';
        return;
    } else {
        alarmContainer.style.display = 'block';
    }
    
    // 添加标题和刷新按钮
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <h3 class="section-title">
            告警点位
            <button class="refresh-btn" data-section="alarm"><i class="bi bi-arrow-clockwise"></i></button>
        </h3>
        <div class="last-refresh-time">
            最后刷新: <span id="alarm-refresh-time">${getCurrentTime()}</span>
        </div>
    `;
    alarmContainer.appendChild(header);
    
    // 创建告警点位列表
    const alarmList = document.createElement('div');
    alarmList.className = 'alarm-list';
    
    // 遍历告警点位并创建列表项
    alarmPoints.forEach(alarm => {
        const alarmItem = document.createElement('div');
        alarmItem.className = `alarm-item level-${alarm.level}`;
        
        // 创建告警名称
        const alarmName = document.createElement('div');
        alarmName.className = 'alarm-name';
        alarmName.textContent = alarm.name;
        alarmItem.appendChild(alarmName);
        
        // 创建告警值
        const alarmValue = document.createElement('div');
        alarmValue.className = 'alarm-value';
        alarmValue.textContent = alarm.value;
        alarmItem.appendChild(alarmValue);
        
        alarmList.appendChild(alarmItem);
    });
    
    alarmContainer.appendChild(alarmList);
}

/**
 * 初始化刷新按钮
 */
function initRefreshButtons() {
    const refreshButtons = document.querySelectorAll('.refresh-btn');
    
    refreshButtons.forEach(button => {
        // 移除已有的事件监听器
        const clone = button.cloneNode(true);
        button.parentNode.replaceChild(clone, button);
        
        // 添加新的事件监听器
        clone.addEventListener('click', function() {
            const section = this.dataset.section;
            const activeSystem = document.querySelector('.system-tabs .tab-item.active').dataset.system;
            const activeDevice = document.querySelector('.device-tabs .tab-item.active').dataset.device;
            
            // 添加旋转效果
            this.classList.add('rotating');
            
            // 显示刷新中提示
            showTooltip(`正在刷新${getSectionName(section)}...`, 'info');
            
            // 模拟刷新延迟
            setTimeout(() => {
                // 根据区域刷新不同内容
                if (section === 'key') {
                    loadKeyData(activeSystem, activeDevice);
                } else if (section === 'telemetry') {
                    loadTelemetryData(activeSystem, activeDevice);
                } else if (section === 'status') {
                    loadStatusPoints(activeSystem, activeDevice);
                } else if (section === 'alarm') {
                    loadAlarmPoints(activeSystem, activeDevice);
                } else if (section === 'all') {
                    loadMonitorContent(activeSystem, activeDevice);
                }
                
                // 移除旋转效果
                this.classList.remove('rotating');
                
                // 更新刷新时间
                updateRefreshTime(section);
                
                // 显示刷新成功提示
                showTooltip(`${getSectionName(section)}刷新成功`, 'success');
            }, 500);
        });
    });
}

/**
 * 获取区域名称
 * @param {string} section - 区域标识
 * @returns {string} 区域名称
 */
function getSectionName(section) {
    switch (section) {
        case 'key':
            return '重点数据';
        case 'telemetry':
            return '遥测数据';
        case 'status':
            return '状态点位';
        case 'alarm':
            return '告警点位';
        case 'all':
            return '所有数据';
        default:
            return '数据';
    }
}

/**
 * 更新刷新时间
 * @param {string} section - 区域标识
 */
function updateRefreshTime(section) {
    const currentTime = getCurrentTime();
    
    if (section === 'key' || section === 'all') {
        const keyRefreshTime = document.getElementById('key-refresh-time');
        if (keyRefreshTime) {
            keyRefreshTime.textContent = currentTime;
        }
    }
    
    if (section === 'telemetry' || section === 'all') {
        const telemetryRefreshTime = document.getElementById('telemetry-refresh-time');
        if (telemetryRefreshTime) {
            telemetryRefreshTime.textContent = currentTime;
        }
    }
    
    if (section === 'status' || section === 'all') {
        const statusRefreshTime = document.getElementById('status-refresh-time');
        if (statusRefreshTime) {
            statusRefreshTime.textContent = currentTime;
        }
    }
    
    if (section === 'alarm' || section === 'all') {
        const alarmRefreshTime = document.getElementById('alarm-refresh-time');
        if (alarmRefreshTime) {
            alarmRefreshTime.textContent = currentTime;
        }
    }
}

/**
 * 更新最后刷新时间
 */
function updateLastRefreshTime() {
    const currentTime = getCurrentTime();
    
    const telemetryRefreshTime = document.getElementById('telemetry-refresh-time');
    if (telemetryRefreshTime) {
        telemetryRefreshTime.textContent = currentTime;
    }
    
    const statusRefreshTime = document.getElementById('status-refresh-time');
    if (statusRefreshTime) {
        statusRefreshTime.textContent = currentTime;
    }
    
    const alarmRefreshTime = document.getElementById('alarm-refresh-time');
    if (alarmRefreshTime) {
        alarmRefreshTime.textContent = currentTime;
    }
}

/**
 * 获取当前时间
 * @returns {string} 当前时间字符串
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

/**
 * 初始化提示框
 */
function initTooltip() {
    // 创建提示框元素
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
}

/**
 * 显示提示框
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型 (info, success, error)
 */
function showTooltip(message, type = 'info') {
    const tooltip = document.getElementById('tooltip');
    
    if (!tooltip) return;
    
    // 设置提示框内容和类型
    tooltip.textContent = message;
    tooltip.className = `tooltip ${type}`;
    
    // 显示提示框
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    
    // 自动隐藏提示框
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 500);
    }, 2000);
} 