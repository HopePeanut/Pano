// 站点监控系统主JavaScript文件

// 当文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化设备导航
    initDeviceNav();
    
    // 初始化站点搜索功能
    initSiteSearch();
    
    // 初始化储能系统标签页
    initSystemTabs();
    
    // 初始化图表
    initCharts();
    
    // 绑定刷新按钮事件
    initRefreshButtons();
    
    // 初始化显示更多按钮
    initShowMoreButtons();
});

/**
 * 站点管理系统JS
 */

/**
 * 当前系统和设备
 */
let currentSystem = 'ems';
let currentDevice = 'local';
let currentFunction = 'monitor'; // 当前功能：monitor, control, config

/**
 * 初始化系统导航
 */
function initSystemNav() {
    $('.system-nav-item').on('click', function() {
        const system = $(this).data('system');
        $('.system-nav-item').removeClass('active');
        $(this).addClass('active');
        currentSystem = system;
        
        // 显示相应的设备导航
        showDeviceNav(system);
        
        // 更新面包屑
        updateBreadcrumb();
        
        // 加载系统内容
        if (system === 'ems') {
            loadEmsContent();
        } else {
            // 重置为本地控制器
            currentDevice = 'local';
            $('.device-nav-item').removeClass('active');
            $('.device-nav-item[data-device="local"]').addClass('active');
            loadDeviceContent(currentDevice);
        }
    });
}

/**
 * 显示设备导航
 */
function showDeviceNav(system) {
    if (system === 'ems') {
        // EMS没有设备导航
        $('.device-nav').hide();
    } else {
        // 显示设备导航
        $('.device-nav').show();
        $('.device-nav-item').removeClass('active');
        $('.device-nav-item[data-device="local"]').addClass('active');
    }
}

/**
 * 初始化设备导航
 */
function initDeviceNav() {
    $('.device-nav-item').on('click', function() {
        const device = $(this).data('device');
        $('.device-nav-item').removeClass('active');
        $(this).addClass('active');
        currentDevice = device;
        
        // 更新面包屑
        updateBreadcrumb();
        
        // 加载设备内容
        loadDeviceContent(device);
    });
}

/**
 * 初始化功能导航
 */
function initFunctionNav() {
    $('.function-nav-item').on('click', function() {
        const func = $(this).data('function');
        $('.function-nav-item').removeClass('active');
        $(this).addClass('active');
        currentFunction = func;
        
        // 更新面包屑
        updateBreadcrumb();
        
        // 根据当前功能加载相应内容
        if (currentSystem === 'ems') {
            loadEmsContent();
        } else {
            loadDeviceContent(currentDevice);
        }
    });
}

/**
 * 更新面包屑
 */
function updateBreadcrumb() {
    const systemName = getSystemName(currentSystem);
    let breadcrumb = '';
    
    if (currentSystem === 'ems') {
        if (currentFunction === 'monitor') {
            breadcrumb = `${systemName} > 监视`;
        } else if (currentFunction === 'control') {
            breadcrumb = `${systemName} > 控制`;
        } else if (currentFunction === 'config') {
            breadcrumb = `${systemName} > 参数配置`;
        }
    } else {
        const deviceName = getDeviceName(currentDevice);
        if (currentFunction === 'monitor') {
            breadcrumb = `${systemName} > ${deviceName} > 监视`;
        } else if (currentFunction === 'control') {
            breadcrumb = `${systemName} > ${deviceName} > 控制`;
        } else if (currentFunction === 'config') {
            breadcrumb = `${systemName} > ${deviceName} > 参数配置`;
        }
    }
    
    $('.breadcrumb').text(breadcrumb);
}

/**
 * 获取系统名称
 */
function getSystemName(system) {
    switch (system) {
        case 'ems':
            return 'EMS';
        case 'ese1':
            return '1#储能系统';
        case 'ese2':
            return '2#储能系统';
        case 'ese3':
            return '3#储能系统';
        default:
            return '储能系统';
    }
}

/**
 * 获取设备名称
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
            return '动环监控';
        case 'electrical':
            return '电气系统';
        default:
            return '设备';
    }
}

/**
 * 加载EMS内容
 */
function loadEmsContent() {
    // 根据当前功能加载相应内容
    if (currentFunction === 'monitor') {
        loadEmsMonitorContent();
    } else if (currentFunction === 'control') {
        loadEmsControlContent();
    } else if (currentFunction === 'config') {
        loadEmsConfigContent();
    }
}

/**
 * 加载EMS监视内容
 */
function loadEmsMonitorContent() {
    // 隐藏其他内容区域
    $('.control-page, .config-page').hide();
    $('.monitor-page').show();
    
    // 使用monitor-data.js中的数据生成函数
    displayKeyData('ems', 'local');
    displayStatusPoints('ems', 'local');
    displayTelemetryData('ems', 'local');
    displayAlarmPoints('ems', 'local');
}

/**
 * 加载EMS控制内容
 */
function loadEmsControlContent() {
    // 隐藏其他内容区域
    $('.monitor-page, .config-page').hide();
    $('.control-page').show();
    
    // 加载控制点位
    displayControlPoints('ems', 'local');
}

/**
 * 加载EMS参数配置内容
 */
function loadEmsConfigContent() {
    // 隐藏其他内容区域
    $('.monitor-page, .control-page').hide();
    $('.config-page').show();
    
    // 加载配置参数
    displayConfigParams('ems', 'local');
}

/**
 * 加载设备内容
 */
function loadDeviceContent(device) {
    // 根据当前功能加载相应内容
    if (currentFunction === 'monitor') {
        loadDeviceMonitorContent(device);
    } else if (currentFunction === 'control') {
        loadDeviceControlContent(device);
    } else if (currentFunction === 'config') {
        loadDeviceConfigContent(device);
    }
}

/**
 * 加载设备监视内容
 */
function loadDeviceMonitorContent(device) {
    // 隐藏其他内容区域
    $('.control-page, .config-page').hide();
    $('.monitor-page').show();
    
    // 使用monitor-data.js中的数据生成函数
    displayKeyData(currentSystem, device);
    displayStatusPoints(currentSystem, device);
    displayTelemetryData(currentSystem, device);
    displayAlarmPoints(currentSystem, device);
}

/**
 * 加载设备控制内容
 */
function loadDeviceControlContent(device) {
    // 隐藏其他内容区域
    $('.monitor-page, .config-page').hide();
    $('.control-page').show();
    
    // 加载控制点位
    displayControlPoints(currentSystem, device);
}

/**
 * 加载设备参数配置内容
 */
function loadDeviceConfigContent(device) {
    // 隐藏其他内容区域
    $('.monitor-page, .control-page').hide();
    $('.config-page').show();
    
    // 加载配置参数组
    $('.param-group-item').removeClass('active');
    $('.param-group-item[data-group="operation"]').addClass('active');
    
    // 加载配置参数
    displayConfigParams(currentSystem, device, 'operation');
    
    // 初始化参数组切换
    initParamGroupNavigation();
}

/**
 * 初始化参数组导航
 */
function initParamGroupNavigation() {
    $('.param-group-item').off('click').on('click', function() {
        const group = $(this).data('group');
        $('.param-group-item').removeClass('active');
        $(this).addClass('active');
        
        // 加载配置参数
        displayConfigParams(currentSystem, currentDevice, group);
    });
}

/**
 * 显示重点数据
 */
function displayKeyData(system, device) {
    const keyData = getKeyData(system, device);
    const $keyDataContainer = $('.key-data-list');
    
    // 清空现有内容
    $keyDataContainer.empty();
    
    // 添加新的重点数据
    keyData.forEach(item => {
        const $keyDataItem = $(`
            <div class="key-data-item">
                <div class="key-data-name">${item.name}</div>
                <div class="key-data-value">${item.value}</div>
                <div class="key-data-unit">${item.unit}</div>
            </div>
        `);
        $keyDataContainer.append($keyDataItem);
    });
    
    // 更新刷新时间
    const currentTime = new Date().toLocaleTimeString();
    $('.key-data-refresh-time').text(`最后更新: ${currentTime}`);
}

/**
 * 显示状态点位
 */
function displayStatusPoints(system, device) {
    const statusPoints = getStatusPoints(system, device);
    const $statusContainer = $('.status-points-list');
    
    // 清空现有内容
    $statusContainer.empty();
    
    // 添加新的状态点位
    statusPoints.forEach(item => {
        const $statusItem = $(`
            <div class="status-point-item ${item.active ? 'active' : ''}">
                <div class="status-point-name">${item.name}</div>
                <div class="status-point-value ${item.valueClass}">${item.value}</div>
            </div>
        `);
        $statusContainer.append($statusItem);
    });
    
    // 更新刷新时间
    const currentTime = new Date().toLocaleTimeString();
    $('.status-points-refresh-time').text(`最后更新: ${currentTime}`);
}

/**
 * 显示遥测数据
 */
function displayTelemetryData(system, device) {
    const telemetryData = getTelemetryData(system, device);
    const $telemetryContainer = $('.telemetry-data-table tbody');
    
    // 清空现有内容
    $telemetryContainer.empty();
    
    // 添加新的遥测数据
    telemetryData.forEach(item => {
        const $row = $(`
            <tr>
                <td>${item.name}</td>
                <td>${item.value}</td>
                <td>${item.unit}</td>
                <td>${item.time}</td>
            </tr>
        `);
        $telemetryContainer.append($row);
    });
    
    // 更新刷新时间
    const currentTime = new Date().toLocaleTimeString();
    $('.telemetry-data-refresh-time').text(`最后更新: ${currentTime}`);
}

/**
 * 显示告警点位
 */
function displayAlarmPoints(system, device) {
    const alarmPoints = getAlarmPoints(system, device);
    const $alarmContainer = $('.alarm-points-list');
    
    // 清空现有内容
    $alarmContainer.empty();
    
    if (alarmPoints.length === 0) {
        $alarmContainer.html('<div class="no-alarm">当前无告警</div>');
    } else {
        // 添加新的告警点位
        alarmPoints.forEach(item => {
            let levelClass = '';
            if (item.level === 1) levelClass = 'info';
            else if (item.level === 2) levelClass = 'warning';
            else if (item.level === 3) levelClass = 'danger';
            
            const $alarmItem = $(`
                <div class="alarm-point-item level-${levelClass}">
                    <div class="alarm-point-name">${item.name}</div>
                    <div class="alarm-point-value">${item.value}</div>
                </div>
            `);
            $alarmContainer.append($alarmItem);
        });
    }
    
    // 更新刷新时间
    const currentTime = new Date().toLocaleTimeString();
    $('.alarm-points-refresh-time').text(`最后更新: ${currentTime}`);
}

/**
 * 显示控制点位
 */
function displayControlPoints(system, device) {
    const controlPoints = getControlPoints(system, device);
    const $controlContainer = $('.control-points-list');
    
    // 清空现有内容
    $controlContainer.empty();
    
    // 添加新的控制点位
    controlPoints.forEach(item => {
        let controlHtml = '';
        
        if (item.type === 'button') {
            // 按钮类型
            controlHtml = `
                <div class="control-point-item">
                    <div class="control-point-name">${item.name}</div>
                    <div class="control-point-value">
                        <div class="btn-group">
                            ${item.options.map(option => `
                                <button class="btn btn-outline-primary control-btn" data-value="${option.value}">${option.label}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (item.type === 'radio') {
            // 单选类型
            controlHtml = `
                <div class="control-point-item">
                    <div class="control-point-name">${item.name}</div>
                    <div class="control-point-value">
                        ${item.options.map(option => `
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="${item.name}" id="${option.value}" 
                                    value="${option.value}" ${option.checked ? 'checked' : ''}>
                                <label class="form-check-label" for="${option.value}">${option.label}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (item.type === 'input') {
            // 输入类型
            controlHtml = `
                <div class="control-point-item">
                    <div class="control-point-name">${item.name}</div>
                    <div class="control-point-value">
                        <div class="input-group">
                            <input type="number" class="form-control" value="${item.value}" 
                                min="${item.min}" max="${item.max}">
                            <div class="input-group-append">
                                <span class="input-group-text">${item.unit}</span>
                            </div>
                            <button class="btn btn-primary set-value-btn">设置</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        $controlContainer.append(controlHtml);
    });
    
    // 绑定控制按钮事件
    bindControlEvents();
}

/**
 * 绑定控制按钮事件
 */
function bindControlEvents() {
    // 按钮控制
    $('.control-btn').off('click').on('click', function() {
        const value = $(this).data('value');
        const name = $(this).closest('.control-point-item').find('.control-point-name').text();
        
        showTooltip(`正在执行命令: ${name} - ${$(this).text()}`);
        
        // 模拟命令执行延迟
        setTimeout(() => {
            showTooltip(`命令已执行: ${name} - ${$(this).text()}`, 'success');
        }, 1000);
    });
    
    // 设置值按钮
    $('.set-value-btn').off('click').on('click', function() {
        const name = $(this).closest('.control-point-item').find('.control-point-name').text();
        const value = $(this).closest('.input-group').find('input').val();
        const unit = $(this).closest('.input-group').find('.input-group-text').text();
        
        showTooltip(`正在设置: ${name} = ${value}${unit}`);
        
        // 模拟命令执行延迟
        setTimeout(() => {
            showTooltip(`设置成功: ${name} = ${value}${unit}`, 'success');
        }, 1000);
    });
    
    // 单选按钮
    $('input[type="radio"]').off('change').on('change', function() {
        const name = $(this).closest('.control-point-item').find('.control-point-name').text();
        const value = $(this).closest('.form-check').find('label').text();
        
        showTooltip(`正在设置: ${name} = ${value}`);
        
        // 模拟命令执行延迟
        setTimeout(() => {
            showTooltip(`设置成功: ${name} = ${value}`, 'success');
        }, 1000);
    });
}

/**
 * 显示提示信息
 */
function showTooltip(message, type = 'info') {
    const $tooltip = $('.tooltip-message');
    $tooltip.text(message).removeClass().addClass(`tooltip-message ${type}`).show();
    
    // 3秒后自动隐藏
    setTimeout(() => {
        $tooltip.fadeOut();
    }, 3000);
}

/**
 * 显示配置参数
 */
function displayConfigParams(system, device, group = 'operation') {
    const configParams = getConfigParams(system, device, group);
    const $configContainer = $('.config-params-table tbody');
    
    // 清空现有内容
    $configContainer.empty();
    
    // 添加新的配置参数
    configParams.forEach(item => {
        const $row = $(`
            <tr>
                <td>${item.name}</td>
                <td>
                    <div class="input-group">
                        <input type="text" class="form-control" value="${item.value}">
                        <div class="input-group-append">
                            <span class="input-group-text">${item.unit}</span>
                        </div>
                    </div>
                </td>
                <td>${item.range}</td>
                <td>${item.status}</td>
                <td>
                    <button class="btn btn-sm btn-primary config-set-btn">设置</button>
                </td>
            </tr>
        `);
        $configContainer.append($row);
    });
    
    // 绑定设置按钮事件
    bindConfigEvents();
}

/**
 * 绑定配置按钮事件
 */
function bindConfigEvents() {
    $('.config-set-btn').off('click').on('click', function() {
        const $row = $(this).closest('tr');
        const name = $row.find('td:first-child').text();
        const value = $row.find('input').val();
        const unit = $row.find('.input-group-text').text();
        
        showTooltip(`正在设置参数: ${name} = ${value}${unit}`);
        
        // 模拟命令执行延迟
        setTimeout(() => {
            showTooltip(`参数设置成功: ${name} = ${value}${unit}`, 'success');
        }, 1000);
    });
}

/**
 * 初始化刷新按钮
 */
function initRefreshButtons() {
    // 重点数据刷新
    $('.key-data-refresh').on('click', function() {
        displayKeyData(currentSystem, currentDevice);
    });
    
    // 状态点位刷新
    $('.status-points-refresh').on('click', function() {
        displayStatusPoints(currentSystem, currentDevice);
    });
    
    // 遥测数据刷新
    $('.telemetry-data-refresh').on('click', function() {
        displayTelemetryData(currentSystem, currentDevice);
    });
    
    // 告警点位刷新
    $('.alarm-points-refresh').on('click', function() {
        displayAlarmPoints(currentSystem, currentDevice);
    });
}

/**
 * 站点搜索
 */
function initSiteSearch() {
    $('#site-search-btn').on('click', function() {
        const searchText = $('#site-search-input').val().trim();
        if (searchText) {
            // 模拟搜索操作
            showTooltip(`正在搜索站点: ${searchText}`);
            
            // 这里应该是实际的站点搜索逻辑
            // 为了演示，我们假设搜索成功并跳转
            setTimeout(() => {
                showTooltip(`已找到站点: ${searchText}，正在跳转...`, 'success');
                
                // 延迟后模拟跳转
                setTimeout(() => {
                    // 更新当前站点显示
                    $('.current-station-name').text(searchText);
                    // 默认选中EMS
                    $('.system-nav-item[data-system="ems"]').click();
                }, 1000);
            }, 1000);
        } else {
            showTooltip('请输入站点名称或编号', 'warning');
        }
    });
    
    // 回车键搜索
    $('#site-search-input').on('keypress', function(e) {
        if (e.which === 13) {
            $('#site-search-btn').click();
        }
    });
}

/**
 * 初始化页面
 */
$(document).ready(function() {
    // 初始化站点搜索
    initSiteSearch();
    
    // 初始化导航
    initSystemNav();
    initDeviceNav();
    initFunctionNav();
    
    // 初始化刷新按钮
    initRefreshButtons();
    
    // 默认选中第一个系统和设备
    $('.system-nav-item[data-system="ems"]').addClass('active');
    currentSystem = 'ems';
    
    // 默认选中监视功能
    $('.function-nav-item[data-function="monitor"]').addClass('active');
    
    // 更新面包屑
    updateBreadcrumb();
    
    // 默认加载EMS内容
    loadEmsContent();
    
    // 添加提示消息容器
    if ($('.tooltip-message').length === 0) {
        $('body').append('<div class="tooltip-message"></div>');
    }
});

/**
 * 初始化储能系统标签页
 */
function initSystemTabs() {
    const systemTabs = document.querySelectorAll('.system-tab');
    
    systemTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 如果点击添加按钮，显示添加系统的表单或弹窗
            if (this.getAttribute('data-system') === 'add') {
                showAddSystemDialog();
                return;
            }
            
            // 更新活动状态
            document.querySelectorAll('.system-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // 获取系统ID
            const systemId = this.getAttribute('data-system');
            
            // 更新内容显示
            document.querySelectorAll('.system-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`${systemId}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 更新面包屑
            updateBreadcrumb();
        });
    });
}

/**
 * 显示添加系统的弹窗
 */
function showAddSystemDialog() {
    // 模拟弹窗，实际项目中可以使用模态框或其他UI组件
    const systemName = prompt('请输入新储能系统的名称:');
    
    if (systemName && systemName.trim() !== '') {
        // 计算新系统的编号
        const systemTabs = document.querySelectorAll('.system-tab:not([data-system="add"]):not([data-system="ems"])');
        const newIndex = systemTabs.length + 1;
        
        // 创建新的标签页
        const newTab = document.createElement('div');
        newTab.className = 'system-tab';
        newTab.setAttribute('data-system', `system${newIndex}`);
        newTab.textContent = `${newIndex}#${systemName}`;
        
        // 获取添加按钮，并在其前面插入新标签页
        const addButton = document.querySelector('.system-tab[data-system="add"]');
        addButton.parentNode.insertBefore(newTab, addButton);
        
        // 创建新的内容区域
        const newContent = document.createElement('div');
        newContent.className = 'system-content';
        newContent.id = `system${newIndex}-content`;
        
        // 添加占位内容
        newContent.innerHTML = `
            <div class="placeholder-content">
                <h2>${newIndex}#${systemName} - 本地控制器</h2>
                <p>该储能系统内容正在加载中...</p>
            </div>
        `;
        
        // 添加到内容容器
        const contentContainer = document.querySelector('.content-container');
        contentContainer.appendChild(newContent);
        
        // 绑定点击事件
        newTab.addEventListener('click', function() {
            document.querySelectorAll('.system-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.system-content').forEach(content => {
                content.classList.remove('active');
            });
            
            document.getElementById(`system${newIndex}-content`).classList.add('active');
            
            updateBreadcrumb();
        });
        
        // 显示提示
        showToast(`已添加${newIndex}#${systemName}系统`);
    }
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
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 渐入
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // 定时消失
    setTimeout(() => {
        toast.style.opacity = '0';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * 加载内容区域
 */
function loadContent(contentType) {
    const contentContainer = document.querySelector('.content-container');
    
    // 根据内容类型加载不同内容
    if (contentType.includes('系统监控')) {
        // 已经是默认的系统概览内容
        activateSystemTab('ems');
    } else if (contentType.includes('系统配置')) {
        activateSystemTab('ems');
        // 替换内容
        const emsContent = document.getElementById('ems-content');
        if (emsContent) {
            emsContent.innerHTML = '<div class="placeholder-content"><h2>系统配置</h2><p>系统配置内容正在开发中...</p></div>';
        }
    } else if (contentType.includes('热管理') || contentType.includes('空调') || contentType.includes('液冷')) {
        showContentPlaceholder('热管理监控内容正在开发中...');
    } else if (contentType.includes('消防')) {
        showContentPlaceholder('消防系统监控内容正在开发中...');
    } else if (contentType.includes('电气') || contentType.includes('配电')) {
        showContentPlaceholder('电气系统监控内容正在开发中...');
    } else if (contentType.includes('动环')) {
        showContentPlaceholder('动环监测内容正在开发中...');
    } else {
        showContentPlaceholder('此功能正在开发中...');
    }
}

/**
 * 激活指定的系统标签页
 * @param {string} systemId - 系统ID
 */
function activateSystemTab(systemId) {
    // 更新标签页
    document.querySelectorAll('.system-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.querySelector(`.system-tab[data-system="${systemId}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 更新内容
    document.querySelectorAll('.system-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(`${systemId}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

/**
 * 显示占位内容
 * @param {string} message - 显示的消息
 */
function showContentPlaceholder(message) {
    // 获取当前激活的系统标签
    const activeSystem = document.querySelector('.system-tab.active').getAttribute('data-system');
    const contentElement = document.getElementById(`${activeSystem}-content`);
    
    if (contentElement) {
        contentElement.innerHTML = `<div class="placeholder-content"><h2>${message}</h2></div>`;
    }
}

/**
 * 加载BMS内容
 * @param {string} deviceName - 设备名称
 */
function loadBMSContent(deviceName) {
    // 更新面包屑
    updateBreadcrumb(deviceName);
    
    // 获取当前激活的系统标签
    const activeSystem = document.querySelector('.system-tab.active').getAttribute('data-system');
    const contentElement = document.getElementById(`${activeSystem}-content`);
    
    if (!contentElement) return;
    
    // 显示加载状态
    contentElement.innerHTML = `<div class="loading">加载${deviceName}数据中...</div>`;
    
    // 模拟异步加载
    setTimeout(() => {
        // 实际项目中，这里应该是AJAX请求后端API获取数据
        fetch('bms-detail.html')
            .then(response => response.text())
            .then(html => {
                // 提取需要的内容部分
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bmsContent = doc.querySelector('.bms-detail-container').innerHTML;
                
                // 更新内容
                contentElement.innerHTML = bmsContent;
                
                // 更新标题
                const header = contentElement.querySelector('.bms-detail-header h2');
                if (header) {
                    header.innerHTML = `<i class="fas fa-battery-three-quarters"></i> ${deviceName} 详细信息`;
                }
                
                // 初始化图表
                const scriptElement = document.createElement('script');
                scriptElement.src = 'js/bms-detail.js';
                document.body.appendChild(scriptElement);
            })
            .catch(error => {
                console.error('加载BMS内容失败:', error);
                contentElement.innerHTML = `<div class="error">加载失败，请重试</div>`;
            });
    }, 500);
}

/**
 * 加载PCS内容
 * @param {string} deviceName - 设备名称
 */
function loadPCSContent(deviceName) {
    // 更新面包屑
    updateBreadcrumb(deviceName);
    
    // 获取当前激活的系统标签
    const activeSystem = document.querySelector('.system-tab.active').getAttribute('data-system');
    const contentElement = document.getElementById(`${activeSystem}-content`);
    
    if (!contentElement) return;
    
    // 更新内容
    contentElement.innerHTML = `<div class="pcs-detail-container">
        <div class="pcs-detail-header">
            <h2><i class="fas fa-bolt"></i> ${deviceName} 详细信息</h2>
            <div class="last-update">
                <span>最后更新: 2025/03/27 15:38:26</span>
                <button class="refresh-btn"><i class="fas fa-sync-alt"></i> 刷新</button>
            </div>
        </div>
        <div class="placeholder-content">PCS监控内容正在开发中...</div>
    </div>`;
}

/**
 * 加载本地控制器内容
 * @param {string} contentName - 内容名称
 * @param {string} systemId - 系统ID
 */
function loadControllerContent(contentName, systemId) {
    // 更新面包屑
    updateBreadcrumb(contentName);
    
    // 只有EMS系统时，我们不需要做任何处理
    if (systemId === 'ems') return;
    
    // 获取当前系统的内容元素
    const contentElement = document.getElementById(`${systemId}-content`);
    
    if (!contentElement) return;
    
    // 根据内容类型加载不同内容
    if (contentName.includes('系统状态')) {
        // 已经是默认的本地控制器内容，不需要修改
    } else if (contentName.includes('参数配置')) {
        contentElement.innerHTML = `<div class="placeholder-content"><h2>${systemId.replace('system', '')}#储能系统 - 参数配置</h2><p>参数配置内容正在开发中...</p></div>`;
    } else if (contentName.includes('历史数据')) {
        contentElement.innerHTML = `<div class="placeholder-content"><h2>${systemId.replace('system', '')}#储能系统 - 历史数据</h2><p>历史数据内容正在开发中...</p></div>`;
    }
}

/**
 * 初始化显示更多按钮
 */
function initShowMoreButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('show-more-btn') || e.target.closest('.show-more-btn')) {
            const btn = e.target.classList.contains('show-more-btn') ? e.target : e.target.closest('.show-more-btn');
            const tableContainer = btn.closest('.data-table-container');
            const table = tableContainer.querySelector('table');
            
            if (table) {
                // 模拟加载更多数据
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
                
                setTimeout(() => {
                    // 在实际项目中，这里应该是从服务器获取更多数据
                    const tbody = table.querySelector('tbody');
                    
                    // 添加更多行（示例数据）
                    for (let i = 0; i < 5; i++) {
                        const newRow = document.createElement('tr');
                        
                        if (table.querySelectorAll('th').length === 6) {
                            // 遥测数据表
                            newRow.innerHTML = `
                                <td>附加参数 ${i + 1}</td>
                                <td>${(Math.random() * 100).toFixed(2)}</td>
                                <td>单位</td>
                                <td>0~100</td>
                                <td><span class="status normal">正常</span></td>
                                <td>15:40:12</td>
                            `;
                        } else {
                            // 遥信数据表
                            newRow.innerHTML = `
                                <td>附加状态 ${i + 1}</td>
                                <td>正常</td>
                                <td>状态量</td>
                                <td>15:40:12</td>
                            `;
                        }
                        
                        tbody.appendChild(newRow);
                    }
                    
                    // 更新按钮文本
                    btn.innerHTML = '显示全部参数 <i class="fas fa-chevron-down"></i>';
                    
                    // 为了演示，让按钮点击第二次时收起多余的行
                    btn.setAttribute('data-expanded', 'true');
                }, 500);
            }
        }
    });
}

/**
 * 初始化图表
 */
function initCharts() {
    // 初始化功率曲线图表
    const powerChartEl = document.getElementById('powerChart');
    if (powerChartEl) {
        const powerChart = echarts.init(powerChartEl);
        const now = new Date();
        const timeData = [];
        const powerData = [];
        
        // 生成过去24小时的模拟数据
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now - i * 3600 * 1000);
            timeData.push(`${time.getHours()}:00`);
            
            // 模拟功率数据，负值表示放电，正值表示充电
            const basePower = i < 12 ? -1.5 : 2.0; // 白天放电，晚上充电
            const randomFactor = (Math.random() - 0.5) * 0.5;
            powerData.push((basePower + randomFactor).toFixed(2));
        }
        
        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const value = params[0].value;
                    const sign = value >= 0 ? '+' : '';
                    return `${params[0].name}<br/>${sign}${value} MW`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: timeData,
                axisLabel: {
                    interval: 2
                }
            },
            yAxis: {
                type: 'value',
                name: '功率 (MW)',
                axisLabel: {
                    formatter: '{value} MW'
                }
            },
            series: [{
                name: '功率',
                type: 'line',
                smooth: true,
                data: powerData,
                markLine: {
                    silent: true,
                    lineStyle: {
                        color: '#999'
                    },
                    data: [{
                        yAxis: 0
                    }]
                },
                itemStyle: {
                    color: function(params) {
                        return params.value >= 0 ? '#2ecc71' : '#e74c3c';
                    }
                },
                areaStyle: {
                    color: function(params) {
                        // 充电（正值）为绿色，放电（负值）为红色
                        return new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: params.value >= 0 ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)'
                        }, {
                            offset: 1,
                            color: params.value >= 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'
                        }]);
                    }
                }
            }]
        };
        
        powerChart.setOption(option);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            powerChart.resize();
        });
    }
    
    // 初始化SOC分布图表
    const socChartEl = document.getElementById('socChart');
    if (socChartEl) {
        const socChart = echarts.init(socChartEl);
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}% ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                data: ['90-100%', '80-90%', '70-80%', '60-70%', '0-60%']
            },
            series: [{
                name: 'SOC分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [{
                    value: 10,
                    name: '90-100%',
                    itemStyle: { color: '#27ae60' }
                }, {
                    value: 50,
                    name: '80-90%',
                    itemStyle: { color: '#2ecc71' }
                }, {
                    value: 30,
                    name: '70-80%',
                    itemStyle: { color: '#f39c12' }
                }, {
                    value: 7,
                    name: '60-70%',
                    itemStyle: { color: '#e67e22' }
                }, {
                    value: 3,
                    name: '0-60%',
                    itemStyle: { color: '#e74c3c' }
                }]
            }]
        };
        
        socChart.setOption(option);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            socChart.resize();
        });
    }
    
    // 初始化系统状态统计图表
    const systemStatusChartEl = document.getElementById('systemStatusChart');
    if (systemStatusChartEl) {
        const systemStatusChart = echarts.init(systemStatusChartEl);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['运行中', '待机', '离线']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: ['BMS', 'PCS', '热管理', '消防', '电气', '动环']
            },
            series: [{
                name: '运行中',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    position: 'insideRight'
                },
                emphasis: {
                    focus: 'series'
                },
                data: [12, 7, 4, 2, 5, 3],
                itemStyle: {
                    color: '#2ecc71'
                }
            }, {
                name: '待机',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    position: 'insideRight'
                },
                emphasis: {
                    focus: 'series'
                },
                data: [2, 1, 1, 0, 1, 0],
                itemStyle: {
                    color: '#f39c12'
                }
            }, {
                name: '离线',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    position: 'insideRight'
                },
                emphasis: {
                    focus: 'series'
                },
                data: [0, 1, 0, 0, 0, 1],
                itemStyle: {
                    color: '#e74c3c'
                }
            }]
        };
        
        systemStatusChart.setOption(option);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            systemStatusChart.resize();
        });
    }
} 