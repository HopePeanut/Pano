// 智慧运维系统功能脚本
let map = null; // 高德地图实例
let activeInfoWindow = null; // 当前激活的信息窗口

// 定义全局变量allSites存储站点数据
let allSites = [];

document.addEventListener('DOMContentLoaded', function() {
    // 显示加载指示器
    showLoadingIndicator(true);
    
    // 检查用户登录状态
    checkLoginStatus();
    
    // 更新用户信息
    updateUserInfo();
    
    // 初始化高德地图
    initMap();
    
    // 生成地图站点数据（异步）
    generateMapSites();
    
    // 注册导航事件
    registerNavEvents();
    
    // 注册筛选条件事件
    registerFilterEvents();
    
    // 注册退出登录事件
    registerLogoutEvent();
    
    // 注册全屏功能
    registerFullscreenEvent();
    
    // 显示欢迎消息
    showWelcomeMessage();
    
    // 确保用户下拉菜单可点击
    fixUserDropdownClickable();
    
    // 优化Canvas性能
    optimizeCanvasPerformance();
});

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    // 获取登录状态
    const isLoggedIn = localStorage.getItem('pano_logged_in') === 'true';
    
    if (!isLoggedIn) {
        showTooltip('未登录', '请先登录系统', 'error');
        
        // 延迟后跳转到登录页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

/**
 * 更新用户信息
 */
function updateUserInfo() {
    // 获取存储的用户信息
    const userInfo = JSON.parse(localStorage.getItem('pano_user') || '{}');
    const username = userInfo.username || '未知用户';
    const role = userInfo.role || '普通用户';
    
    // 更新用户名和角色显示
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    
    if (userNameElement) {
        userNameElement.textContent = username;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = role;
    }
}

/**
 * 初始化高德地图
 */
function initMap() {
    try {
        // 创建地图实例
        map = new AMap.Map('gaodeMapContainer', {
            zoom: 5,
            center: [104.297, 35.806], // 中国中心位置
            resizeEnable: true,
            mapStyle: 'amap://styles/whitesmoke'
        });
        
        // 添加地图控件 - 使用插件方式加载控件
        AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], function(){
            // 添加比例尺控件
            var scale = new AMap.Scale();
            map.addControl(scale);
            
            // 添加工具条控件
            var toolBar = new AMap.ToolBar({position: 'RB'});
            map.addControl(toolBar);
        });
        
        // 地图加载完成事件
        map.on('complete', function() {
            console.log('地图加载完成');
        });
    } catch (error) {
        console.error('高德地图加载失败', error);
        showTooltip('地图加载失败', '请检查网络连接或API密钥', 'error');
        // 隐藏加载指示器
        showLoadingIndicator(false);
    }
}

/**
 * 修复用户下拉菜单可点击问题
 */
function fixUserDropdownClickable() {
    const userInfo = document.querySelector('.user-info');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userInfo && userDropdown) {
        // 点击用户信息区域时显示或隐藏下拉菜单
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止冒泡，避免点击后立即被document的点击事件隐藏
            
            // 切换显示状态
            if (userDropdown.style.display === 'block') {
                userDropdown.style.display = 'none';
            } else {
                userDropdown.style.display = 'block';
            }
        });
        
        // 阻止下拉菜单的点击事件冒泡
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // 点击页面其他区域时隐藏下拉菜单
        document.addEventListener('click', function() {
            userDropdown.style.display = 'none';
        });
        
        // 移除原有的hover显示逻辑
        userInfo.classList.remove('hover-dropdown');
    }
}

/**
 * 生成地图站点标记
 * 优化为分步异步处理
 */
function generateMapSites() {
    // 第一步：准备站点数据
    prepareMapSitesData();
    
    // 第二步：异步添加站点到地图
    setTimeout(() => {
        addSitesToMap();
    }, 100);
}

/**
 * 准备站点数据
 */
function prepareMapSitesData() {
    // 模拟站点数据
    allSites = [
        // 正常站点
        {
            id: 1,
            name: '张家口储能电站',
            status: 'normal',
            type: 'type1',
            lng: 114.88,
            lat: 40.83,
            address: '河北省张家口市桥东区',
            systems: {
                energy: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 5,
                    onlineCount: 5
                },
                charging: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0 
                },
                photovoltaic: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                other: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                }
            },
            data: {
                dailyCharge: 125.6, // kWh
                dailyDischarge: 98.3, // kWh
                totalCharge: 1560.8, // kWh
                totalDischarge: 1320.5, // kWh
                efficiency: 92.8, // %
                downtime: 0.5, // %
                // 充电站特有数据
                totalChargers: 0,
                activeChargers: 0
            }
        },
        {
            id: 2,
            name: '太原光储充一体站',
            status: 'normal',
            type: 'type3',
            lng: 112.55,
            lat: 37.87,
            address: '山西省太原市小店区',
            systems: {
                energy: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 4,
                    onlineCount: 4
                },
                charging: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 8,
                    onlineCount: 7
                },
                photovoltaic: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 3,
                    onlineCount: 3
                },
                other: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 2,
                    onlineCount: 2
                }
            },
            data: {
                dailyCharge: 256.3, // kWh
                dailyDischarge: 210.5, // kWh
                totalCharge: 3250.8, // kWh
                totalDischarge: 2980.2, // kWh
                efficiency: 91.5, // %
                downtime: 0.3, // %
                // 充电站特有数据
                totalChargers: 8,
                activeChargers: 3
            }
        },
        // ... 其他正常站点 ...
        {
            id: 3,
            name: '西安充电站',
            status: 'normal',
            type: 'type4',
            lng: 108.94,
            lat: 34.34,
            address: '陕西省西安市雁塔区',
            systems: {
                energy: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                charging: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 12,
                    onlineCount: 12
                },
                photovoltaic: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                other: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                }
            },
            data: {
                dailyCharge: 0, // kWh
                dailyDischarge: 0, // kWh
                totalCharge: 0, // kWh
                totalDischarge: 0, // kWh
                efficiency: 0, // %
                downtime: 0.2, // %
                // 充电站特有数据
                totalChargers: 12,
                activeChargers: 6
            }
        },
        {
            id: 5,
            name: '成都充电桩配储',
            status: 'normal',
            type: 'type2',
            lng: 104.07,
            lat: 30.67,
            address: '四川省成都市武侯区',
            systems: {
                energy: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 3,
                    onlineCount: 2
                },
                charging: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 16,
                    onlineCount: 15
                },
                photovoltaic: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                other: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                }
            },
            data: {
                dailyCharge: 189.2, // kWh
                dailyDischarge: 175.6, // kWh
                totalCharge: 2560.8, // kWh
                totalDischarge: 2350.4, // kWh
                efficiency: 91.8, // %
                downtime: 0.4, // %
                // 充电站特有数据
                totalChargers: 16,
                activeChargers: 9
            }
        },
        
        // 告警站点
        {
            id: 9,
            name: '重庆充电站',
            status: 'warning',
            type: 'type4',
            lng: 106.55,
            lat: 29.56,
            address: '重庆市渝北区',
            systems: {
                energy: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                charging: { 
                    status: 'warning', 
                    alarms: 2, 
                    online: true,
                    totalCount: 20,
                    onlineCount: 18
                },
                photovoltaic: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                other: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                }
            },
            data: {
                dailyCharge: 0, // kWh
                dailyDischarge: 0, // kWh
                totalCharge: 0, // kWh
                totalDischarge: 0, // kWh
                efficiency: 0, // %
                downtime: 1.2, // %
                // 充电站特有数据
                totalChargers: 20,
                activeChargers: 7
            }
        },
        {
            id: 10,
            name: '长沙光储充一体站',
            status: 'warning',
            type: 'type3',
            lng: 112.94,
            lat: 28.23,
            address: '湖南省长沙市岳麓区',
            systems: {
                energy: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 5,
                    onlineCount: 5
                },
                charging: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 10,
                    onlineCount: 8
                },
                photovoltaic: { 
                    status: 'warning', 
                    alarms: 3, 
                    online: true,
                    totalCount: 4,
                    onlineCount: 3
                },
                other: { 
                    status: 'normal', 
                    alarms: 0, 
                    online: true,
                    totalCount: 2,
                    onlineCount: 2
                }
            },
            data: {
                dailyCharge: 178.9, // kWh
                dailyDischarge: 160.3, // kWh
                totalCharge: 4850.6, // kWh
                totalDischarge: 4420.2, // kWh
                efficiency: 90.8, // %
                downtime: 0.7, // %
                // 充电站特有数据
                totalChargers: 10,
                activeChargers: 4
            }
        },
        
        // 故障站点
        {
            id: 11,
            name: '广州储能电站',
            status: 'fault',
            type: 'type1',
            lng: 113.26,
            lat: 23.13,
            address: '广东省广州市天河区',
            systems: {
                energy: { 
                    status: 'fault', 
                    alarms: 5, 
                    online: true,
                    totalCount: 6,
                    onlineCount: 3
                },
                charging: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                photovoltaic: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                },
                other: { 
                    status: 'none', 
                    alarms: 0, 
                    online: false,
                    totalCount: 0,
                    onlineCount: 0
                }
            },
            data: {
                dailyCharge: 56.2, // kWh
                dailyDischarge: 35.8, // kWh
                totalCharge: 2860.4, // kWh
                totalDischarge: 2580.9, // kWh
                efficiency: 85.3, // %
                downtime: 3.2, // %
                // 充电站特有数据
                totalChargers: 0,
                activeChargers: 0
            }
        }
    ];
    
    // 添加告警数据到站点
    processAlarmData();
}

/**
 * 处理告警数据
 */
function processAlarmData() {
    // 为站点生成告警数据
    allSites.forEach(site => {
        // 初始化告警数据数组
        site.alarms = [];
        
        // 根据系统状态生成模拟告警数据
        Object.keys(site.systems).forEach(sysKey => {
            const system = site.systems[sysKey];
            
            // 如果系统有告警
            if (system.alarms > 0) {
                // 系统名称映射
                const sysNameMap = {
                    'energy': '储能系统',
                    'charging': '充电桩系统',
                    'photovoltaic': '光伏系统',
                    'other': '其他系统'
                };
                
                // 告警类型
                const alarmTypes = [
                    '通信中断', '过压告警', '过温告警', '电池SOC低', 
                    '设备离线', '系统故障', '转换效率低', '控制回路异常'
                ];
                
                // 为每个告警生成模拟数据
                for (let i = 0; i < system.alarms; i++) {
                    const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
                    const deviceNo = Math.floor(Math.random() * system.totalCount) + 1;
                    const timestamp = new Date();
                    timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 60));
                    
                    // 创建告警对象
                    const alarm = {
                        id: `ALM-${site.id}-${sysKey}-${i+1}`,
                        system: sysNameMap[sysKey],
                        deviceName: `${sysNameMap[sysKey]}${deviceNo}号设备`,
                        type: alarmType,
                        level: system.status === 'warning' ? '警告' : '紧急',
                        timestamp: timestamp,
                        status: Math.random() > 0.6 ? '已确认' : '未确认'
                    };
                    
                    site.alarms.push(alarm);
                }
            }
        });
    });
}

/**
 * 分批异步添加站点到地图
 */
function addSitesToMap() {
    if (!map) {
        // 如果地图未加载，使用备用方案
        addSitesToBackupContainer();
        return;
    }
    
    // 分批处理站点标记，避免一次性处理过多
    const batchSize = 3; // 每批处理的站点数量
    let currentIndex = 0;
    
    function addSitesBatch() {
        if (currentIndex >= allSites.length) {
            // 所有站点添加完成
            // 修改停机率比较说明
            updateSiteStatistics();
            
            // 隐藏加载指示器
            showLoadingIndicator(false);
            return;
        }
        
        // 处理当前批次的站点
        const endIndex = Math.min(currentIndex + batchSize, allSites.length);
        for (let i = currentIndex; i < endIndex; i++) {
            addSingleSiteToMap(allSites[i]);
        }
        
        // 更新索引，准备下一批
        currentIndex = endIndex;
        
        // 使用requestAnimationFrame继续下一批
        requestAnimationFrame(addSitesBatch);
    }
    
    // 开始批量添加
    addSitesBatch();
}

/**
 * 添加单个站点到地图
 */
function addSingleSiteToMap(site) {
    // 创建标记容器
    const markerContainer = document.createElement('div');
    markerContainer.className = `site-marker ${site.status}`;
    markerContainer.dataset.id = site.id;
    markerContainer.dataset.name = site.name;
    markerContainer.dataset.status = site.status;
    markerContainer.dataset.type = site.type;
    
    // 添加站点名称标签
    const siteNameLabel = document.createElement('div');
    siteNameLabel.className = 'site-name';
    siteNameLabel.textContent = site.name;
    markerContainer.appendChild(siteNameLabel);
    
    // 创建高德地图标记
    const marker = new AMap.Marker({
        position: [site.lng, site.lat],
        content: markerContainer,
        anchor: 'center',
        offset: new AMap.Pixel(0, 0),
        zIndex: 100
    });
    
    // 添加点击事件
    marker.on('click', function() {
        showSiteDetailInfo(site);
    });
    
    // 添加到地图
    marker.setMap(map);
}

/**
 * 备用方案：添加站点到备用容器
 */
function addSitesToBackupContainer() {
    // 获取站点标记容器
    const siteMarkersContainer = document.querySelector('.site-markers');
    
    // 清空容器
    if (siteMarkersContainer) {
        siteMarkersContainer.innerHTML = '';
        
        // 分批处理站点标记，避免一次性处理过多
        const batchSize = 3; // 每批处理的站点数量
        let currentIndex = 0;
        
        function addSitesBatch() {
            if (currentIndex >= allSites.length) {
                // 所有站点添加完成
                // 修改停机率比较说明
                updateSiteStatistics();
                
                // 隐藏加载指示器
                showLoadingIndicator(false);
                return;
            }
            
            // 处理当前批次的站点
            const endIndex = Math.min(currentIndex + batchSize, allSites.length);
            for (let i = currentIndex; i < endIndex; i++) {
                const site = allSites[i];
                
                // 模拟位置（百分比）
                const x = ((site.lng - 100) / 20) * 100;
                const y = ((50 - site.lat) / 20) * 100;
                
                // 创建站点标记元素
                const siteMarker = document.createElement('div');
                siteMarker.className = `site-marker ${site.status}`;
                siteMarker.dataset.id = site.id;
                siteMarker.dataset.name = site.name;
                siteMarker.dataset.status = site.status;
                siteMarker.dataset.type = site.type;
                
                // 添加站点名称标签
                const siteNameLabel = document.createElement('div');
                siteNameLabel.className = 'site-name';
                siteNameLabel.textContent = site.name;
                siteMarker.appendChild(siteNameLabel);
                
                // 设置位置（百分比）
                siteMarker.style.left = `${x}%`;
                siteMarker.style.top = `${y}%`;
                
                // 添加点击事件
                siteMarker.addEventListener('click', function() {
                    showSiteDetailInfo(site);
                });
                
                // 添加到容器
                siteMarkersContainer.appendChild(siteMarker);
            }
            
            // 更新索引，准备下一批
            currentIndex = endIndex;
            
            // 使用requestAnimationFrame继续下一批
            requestAnimationFrame(addSitesBatch);
        }
        
        // 开始批量添加
        addSitesBatch();
    }
}

/**
 * 更新站点统计信息
 */
function updateSiteStatistics() {
    // 修改停机率比较说明
    const downtimeCard = document.querySelector('.summary-card:last-child');
    if (downtimeCard) {
        const comparisonElem = downtimeCard.querySelector('.card-comparison');
        if (comparisonElem) {
            comparisonElem.innerHTML = `同比 <i class="fas fa-arrow-down"></i> 0.3%`;
        }
    }
}

/**
 * 显示简单站点信息提示
 * @param {Object} site - 站点数据
 */
function showSiteInfo(site) {
    let statusText = '正常';
    let statusClass = 'success';
    
    if (site.status === 'warning') {
        statusText = '告警';
        statusClass = 'warning';
    } else if (site.status === 'fault') {
        statusText = '故障';
        statusClass = 'error';
    }
    
    let typeText = '';
    if (site.type === 'type1') {
        typeText = '储能电站';
    } else if (site.type === 'type2') {
        typeText = '充电桩配储';
    } else if (site.type === 'type3') {
        typeText = '光储充一体';
    } else if (site.type === 'type4') {
        typeText = '充电站';
    }
    
    // 显示站点信息提示
    showTooltip(
        `站点信息: ${site.name}`,
        `站点ID: ${site.id}<br>站点类型: ${typeText}<br>当前状态: <span class="status-${site.status}">${statusText}</span>`,
        statusClass
    );
}

/**
 * 显示站点详细信息
 * @param {Object} site - 站点详细数据
 */
function showSiteDetailInfo(site) {
    // 如果有已经打开的信息窗口，先关闭
    if (activeInfoWindow) {
        activeInfoWindow.close();
    }
    
    // 获取站点类型文字及颜色
    let typeText = '';
    let typeColor = '';
    if (site.type === 'type1') {
        typeText = '储能电站';
        typeColor = '#3498db'; // 蓝色
    } else if (site.type === 'type2') {
        typeText = '充电桩配储';
        typeColor = '#9b59b6'; // 紫色
    } else if (site.type === 'type3') {
        typeText = '光储充一体';
        typeColor = '#2ecc71'; // 绿色
    } else if (site.type === 'type4') {
        typeText = '充电站';
        typeColor = '#e67e22'; // 橙色
    }
    
    // 获取状态对应的文字和样式
    let statusText = '正常';
    let statusClass = 'status-normal';
    
    if (site.status === 'warning') {
        statusText = '告警';
        statusClass = 'status-warning';
    } else if (site.status === 'fault') {
        statusText = '故障';
        statusClass = 'status-fault';
    }
    
    // 创建系统状态HTML
    const getSystemStatusHTML = (system, name) => {
        if (system.status === 'none') return ''; // 如果系统不存在，不显示
        
        let statusClass = 'status-normal';
        let statusText = '正常';
        
        if (system.status === 'warning') {
            statusClass = 'status-warning';
            statusText = '告警';
        } else if (system.status === 'fault') {
            statusClass = 'status-fault';
            statusText = '故障';
        }
        
        const onlineStatusText = system.onlineCount === system.totalCount ? 
            `<span class="status-normal">全部在线</span>` : 
            `<span class="status-warning">${system.onlineCount}/${system.totalCount} 在线</span>`;
            
        const alarmText = system.alarms > 0 ? `<span class="status-warning">${system.alarms}个告警</span>` : '无告警';
        
        return `
            <div class="system-item">
                <div class="system-name">${name}</div>
                <div class="system-status">
                    <span class="${statusClass}">${statusText}</span>
                    <span class="separator">|</span>
                    ${onlineStatusText}
                    <span class="separator">|</span>
                    ${alarmText}
                </div>
            </div>
        `;
    };
    
    // 创建能源数据HTML，处理单位转换
    const formatEnergyValue = (value) => {
        if (value === 0) return '0';
        if (value >= 1000) {
            return (value / 1000).toFixed(2) + ' MWh';
        } else {
            return value.toFixed(1) + ' kWh';
        }
    };
    
    // 创建告警信息HTML
    let alarmHTML = '';
    if (site.alarms && site.alarms.length > 0) {
        alarmHTML = `
            <div class="alarm-info-panel">
                <div class="alarm-info-header">
                    <span class="alarm-info-title">告警信息 (${site.alarms.length}条)</span>
                    <span class="alarm-info-toggle">展开 <i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="alarm-list">
                    ${site.alarms.map(alarm => {
                        const levelClass = alarm.level === '紧急' ? 'alarm-urgent' : 'alarm-warning';
                        const confirmClass = alarm.status === '已确认' ? 'alarm-confirmed' : '';
                        return `
                            <div class="alarm-item ${levelClass} ${confirmClass}">
                                <div class="alarm-header">
                                    <div class="alarm-title">${alarm.type}</div>
                                    <div class="alarm-level">${alarm.level}</div>
                                </div>
                                <div class="alarm-details">
                                    <div class="alarm-device">${alarm.deviceName}</div>
                                    <div class="alarm-time">${alarm.timestamp.toLocaleString()}</div>
                                </div>
                                <div class="alarm-status">${alarm.status}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // 根据站点类型创建运行数据HTML
    let operationDataHTML = '';
    
    if (site.type === 'type4') {
        // 充电站类型的运行数据
        operationDataHTML = `
            <div class="data-item wide">
                <div class="data-label">总充电桩数</div>
                <div class="data-value">${site.data.totalChargers}个</div>
            </div>
            <div class="data-item wide">
                <div class="data-label">当前使用桩数</div>
                <div class="data-value">${site.data.activeChargers}个</div>
            </div>
            <div class="data-item wide">
                <div class="data-label">今日充电量</div>
                <div class="data-value">${formatEnergyValue(site.systems.charging.totalCount > 0 ? site.data.totalCharge : 0)}</div>
            </div>
        `;
    } else if (site.type === 'type1') {
        // 储能电站类型的运行数据
        operationDataHTML = `
            <div class="data-item">
                <div class="data-label">今日充电</div>
                <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">今日放电</div>
                <div class="data-value">${formatEnergyValue(site.data.dailyDischarge)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">累计充电</div>
                <div class="data-value">${formatEnergyValue(site.data.totalCharge)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">累计放电</div>
                <div class="data-value">${formatEnergyValue(site.data.totalDischarge)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">系统效率</div>
                <div class="data-value">${site.data.efficiency.toFixed(1)}%</div>
            </div>
            <div class="data-item">
                <div class="data-label">非计划停机率</div>
                <div class="data-value">${site.data.downtime.toFixed(1)}%</div>
            </div>
        `;
    } else {
        // 混合类型站点（充电桩配储、光储充一体）的运行数据
        let energyDataItems = '';
        let chargingDataItems = '';
        let photovoltaicDataItems = '';
        
        // 包含储能系统数据
        if (site.systems.energy.totalCount > 0) {
            energyDataItems = `
                <div class="data-section">
                    <div class="data-section-title">储能系统数据</div>
                    <div class="data-section-content">
                        <div class="data-item">
                            <div class="data-label">今日充电</div>
                            <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">今日放电</div>
                            <div class="data-value">${formatEnergyValue(site.data.dailyDischarge)}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">系统效率</div>
                            <div class="data-value">${site.data.efficiency.toFixed(1)}%</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">非计划停机率</div>
                            <div class="data-value">${site.data.downtime.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 包含充电桩系统数据
        if (site.systems.charging.totalCount > 0) {
            chargingDataItems = `
                <div class="data-section">
                    <div class="data-section-title">充电桩系统数据</div>
                    <div class="data-section-content">
                        <div class="data-item">
                            <div class="data-label">总充电桩数</div>
                            <div class="data-value">${site.data.totalChargers}个</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">当前使用桩数</div>
                            <div class="data-value">${site.data.activeChargers}个</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">今日充电量</div>
                            <div class="data-value">${formatEnergyValue(site.data.totalCharge)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 包含光伏系统数据
        if (site.systems.photovoltaic.totalCount > 0) {
            // 为光伏系统添加模拟数据
            const solarData = {
                dailyGeneration: Math.round(Math.random() * 200 + 50), // 50-250 kWh
                totalGeneration: Math.round(Math.random() * 10000 + 2000) // 2000-12000 kWh
            };
            
            photovoltaicDataItems = `
                <div class="data-section">
                    <div class="data-section-title photovoltaic">光伏系统数据</div>
                    <div class="data-section-content">
                        <div class="data-item">
                            <div class="data-label">今日发电量</div>
                            <div class="data-value">${formatEnergyValue(solarData.dailyGeneration)}</div>
                        </div>
                        <div class="data-item">
                            <div class="data-label">累计发电量</div>
                            <div class="data-value">${formatEnergyValue(solarData.totalGeneration)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        operationDataHTML = energyDataItems + chargingDataItems + photovoltaicDataItems;
    }

    // 创建系统状态面板HTML
    const systemStatusHTML = `
        <div class="info-panel">
            <div class="info-panel-header">
                <span class="info-panel-title">系统状态</span>
                <span class="info-panel-toggle" data-panel="system-status">展开 <i class="fas fa-chevron-down"></i></span>
            </div>
            <div class="info-panel-body" id="system-status-panel">
                <div class="systems-container">
                    ${getSystemStatusHTML(site.systems.energy, '储能系统')}
                    ${getSystemStatusHTML(site.systems.charging, '充电桩系统')}
                    ${getSystemStatusHTML(site.systems.photovoltaic, '光伏系统')}
                    ${getSystemStatusHTML(site.systems.other, '其他系统')}
                </div>
                ${alarmHTML}
            </div>
        </div>
    `;
    
    // 创建运行数据面板HTML
    const operationDataPanelHTML = `
        <div class="info-panel">
            <div class="info-panel-header">
                <span class="info-panel-title">运行数据</span>
                <span class="info-panel-toggle" data-panel="operation-data">展开 <i class="fas fa-chevron-down"></i></span>
            </div>
            <div class="info-panel-body" id="operation-data-panel">
                <div class="data-container">
                    ${operationDataHTML}
                </div>
            </div>
        </div>
    `;
    
    // 创建信息窗口内容
    const content = `
        <div class="site-info-window">
            <div class="info-header">
                <h3>${site.name}</h3>
                <div class="site-info-type" style="color:${typeColor};">${typeText}</div>
                <div class="site-info-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="info-section">
                <div class="info-value">${site.address}</div>
            </div>
            
            ${systemStatusHTML}
            ${operationDataPanelHTML}
            
            <div class="info-footer">
                <button class="info-btn scada-btn" onclick="showSiteScada(${JSON.stringify(site).replace(/"/g, '&quot;')})">SCADA</button>
                <button class="info-btn monitor-btn" onclick="goToSiteDetail(${site.id}); return false;">进入站点</button>
            </div>
        </div>
    `;
    
    // 创建信息窗口
    if (map) {
        const infoWindow = new AMap.InfoWindow({
            content: content,
            anchor: 'middle-left',
            offset: new AMap.Pixel(15, 0),
            closeWhenClickMap: true
        });
        
        // 在点击位置打开信息窗口
        infoWindow.open(map, [site.lng, site.lat]);
        
        // 保存当前窗口引用
        activeInfoWindow = infoWindow;
        
        // 在信息窗口打开后注册按钮事件
        infoWindow.on('open', () => {
            // 注册面板展开/折叠事件
            const panelToggles = document.querySelectorAll('.info-panel-toggle');
            
            panelToggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const panelId = toggle.getAttribute('data-panel');
                    const panelBody = document.getElementById(panelId + '-panel');
                    
                    if (panelBody) {
                        // 切换面板显示状态
                        if (panelBody.style.display === 'none' || !panelBody.style.display) {
                            panelBody.style.display = 'block';
                            toggle.innerHTML = '收起 <i class="fas fa-chevron-up"></i>';
                        } else {
                            panelBody.style.display = 'none';
                            toggle.innerHTML = '展开 <i class="fas fa-chevron-down"></i>';
                        }
                    }
                });
                
                // 默认折叠面板
                const panelId = toggle.getAttribute('data-panel');
                const panelBody = document.getElementById(panelId + '-panel');
                if (panelBody) {
                    panelBody.style.display = 'none';
                }
            });
            
            // 注册告警信息展开/折叠事件
            const alarmToggle = document.querySelector('.alarm-info-toggle');
            const alarmList = document.querySelector('.alarm-list');
            
            if (alarmToggle && alarmList) {
                alarmToggle.addEventListener('click', () => {
                    // 切换告警列表显示状态
                    if (alarmList.style.display === 'none' || !alarmList.style.display) {
                        alarmList.style.display = 'block';
                        alarmToggle.innerHTML = '收起 <i class="fas fa-chevron-up"></i>';
                    } else {
                        alarmList.style.display = 'none';
                        alarmToggle.innerHTML = '展开 <i class="fas fa-chevron-down"></i>';
                    }
                });
                
                // 默认折叠告警列表
                alarmList.style.display = 'none';
            }
        });
    } else {
        // 备用方案，直接显示提示框
        showTooltip(
            `${site.name}详情`,
            `<div style="max-height: 300px; overflow-y: auto;">${content}</div>`,
            site.status === 'normal' ? 'success' : (site.status === 'warning' ? 'warning' : 'error')
        );
    }
}

/**
 * 显示站点SCADA图
 * @param {Object} site - 站点数据
 */
window.showSiteScada = function(site) {
    try {
        console.log('显示站点SCADA图', site.name, site.type);
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // 根据站点类型选择合适的SCADA图
        let scadaImageSrc = 'images/scada/default.png'; // 默认图片
        
        // 尝试根据站点类型设置图片路径
        if (site.type === 'type1') {
            scadaImageSrc = 'images/scada/energy-storage.png';
        } else if (site.type === 'type2') {
            scadaImageSrc = 'images/scada/charging-storage.png';
        } else if (site.type === 'type3') {
            scadaImageSrc = 'images/scada/integrated.png';
        } else if (site.type === 'type4') {
            scadaImageSrc = 'images/scada/charging.png';
        }
        
        // 获取当前时间作为最新更新时间
        const now = new Date();
        const updateTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // 创建模态内容
        modal.innerHTML = `
            <div class="modal-content scada-modal">
                <div class="modal-header">
                    <h3>${site.name} - SCADA系统图</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="scada-view">
                        <div class="scada-update-time">最新更新时间：${updateTime}</div>
                        <img src="${scadaImageSrc}" alt="SCADA图" onerror="this.src='images/scada/default.png'">
                    </div>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 显示动画
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // 绑定关闭按钮事件
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                // 移除模态框
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
        }
        
        // 点击外部区域关闭模态框
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                // 移除模态框
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    } catch (error) {
        console.error("显示SCADA图时出错:", error);
        alert('无法显示SCADA图: ' + error.message);
    }
};

/**
 * 导航到站点详情页面
 * @param {string} siteId - 站点ID
 */
function navigateToSiteMonitor(siteId) {
    try {
        // 打印调试信息
        console.log(`准备跳转到站点详情页，站点ID: ${siteId}`);
        
        // 获取站点信息
        const site = allSites.find(s => s.id == siteId);
        if (!site) {
            console.error(`未找到ID为${siteId}的站点`);
            alert(`错误: 未找到ID为${siteId}的站点信息`);
            return;
        }
        
        // 保存选中的站点ID到本地存储
        console.log(`将站点ID ${siteId} 保存到localStorage`);
        localStorage.setItem('selectedSiteId', siteId);
        
        // 显示简单的提示框
        alert(`正在进入${site.name}详情页...`);
        
        // 使用硬编码方式跳转
        console.log(`开始跳转到site-detail.html`);
        document.location.href = 'site-detail.html';
        
        return false; // 阻止可能的默认行为
    } catch (error) {
        // 捕获并记录任何可能的错误
        console.error('站点跳转过程中发生错误:', error);
        alert(`错误: 跳转过程中发生错误: ${error.message}`);
    }
}

/**
 * 注册导航事件
 */
function registerNavEvents() {
    // 主导航点击事件
    const mainNavItems = document.querySelectorAll('.main-nav > ul > li');
    const subNavContainer = document.querySelector('.sub-nav-container');
    const subNavs = document.querySelectorAll('.sub-nav');
    
    // 初始隐藏二级导航
    if (subNavContainer) {
        subNavContainer.style.display = 'none';
    }
    
    mainNavItems.forEach(item => {
        const link = item.querySelector('a');
        const moduleId = item.dataset.module;
        
        // 鼠标移入显示二级导航
        item.addEventListener('mouseenter', function() {
            // 显示二级导航容器
            if (subNavContainer) {
                // 隐藏所有二级导航
                subNavs.forEach(nav => {
                    nav.classList.remove('active');
                });
                
                // 显示当前模块的二级导航
                const currentSubNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
                if (currentSubNav) {
                    subNavContainer.style.display = 'block';
                    currentSubNav.classList.add('active');
                }
            }
        });
        
        // 点击一级导航
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有激活状态
            mainNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // 添加当前项的激活状态
            item.classList.add('active');
            
            // 如果不是监控中心，显示开发中提示
            if (moduleId !== 'monitoring') {
                showTooltip('开发中', '该功能正在开发中，敬请期待！');
            }
        });
    });
    
    // 当鼠标离开导航区域时隐藏二级导航
    const mainNav = document.querySelector('.main-nav');
    if (mainNav && subNavContainer) {
        mainNav.addEventListener('mouseleave', function() {
            subNavContainer.style.display = 'none';
        });
        
        // 当鼠标在二级导航上时，保持显示
        subNavContainer.addEventListener('mouseenter', function() {
            subNavContainer.style.display = 'block';
        });
        
        subNavContainer.addEventListener('mouseleave', function() {
            subNavContainer.style.display = 'none';
        });
    }
    
    // 二级导航点击事件
    const subNavItems = document.querySelectorAll('.sub-nav a');
    
    subNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取链接地址
            const href = item.getAttribute('href');
            
            // 如果是有效链接，则直接跳转
            if (href && href !== '#' && !href.startsWith('#')) {
                window.location.href = href;
                return; // 直接返回，不再执行后面的代码
            }
            
            // 移除所有激活状态（仅对无效链接执行）
            subNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // 添加当前项的激活状态（仅对无效链接执行）
            item.classList.add('active');
            
            // 显示开发中提示（仅对无效链接执行）
            showTooltip('开发中', '该功能正在开发中，敬请期待！');
        });
    });
}

/**
 * 注册筛选条件事件
 */
function registerFilterEvents() {
    // 获取筛选选项
    const filterOptions = document.querySelectorAll('.filter-option input');
    
    filterOptions.forEach(option => {
        option.addEventListener('change', function() {
            const filterGroup = this.closest('.filter-group');
            const filterType = filterGroup.querySelector('.filter-title').textContent.includes('状态') 
                ? 'status' 
                : 'type';
            
            const value = this.value;
            const isChecked = this.checked;
            
            // 处理全选逻辑
            if (value === 'all') {
                // 如果选中全部，取消其他选项
                if (isChecked) {
                    const siblingOptions = this.closest('.filter-options').querySelectorAll('input:not([value="all"])');
                    siblingOptions.forEach(opt => {
                        opt.checked = false;
                    });
                }
            } else {
                // 如果选中非全部选项，取消全部选项
                const allOption = this.closest('.filter-options').querySelector('input[value="all"]');
                if (isChecked && allOption.checked) {
                    allOption.checked = false;
                }
                
                // 如果没有任何选项被选中，自动选中全部
                const checkedOptions = this.closest('.filter-options').querySelectorAll('input:checked');
                if (checkedOptions.length === 0) {
                    allOption.checked = true;
                }
            }
            
            // 应用筛选
            applyFilters();
        });
    });
}

/**
 * 应用筛选条件
 */
function applyFilters() {
    // 获取状态筛选条件
    const statusFilters = Array.from(document.querySelectorAll('.filter-group:nth-child(1) input:checked'))
        .map(input => input.value);
    
    // 获取类型筛选条件
    const typeFilters = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input:checked'))
        .map(input => input.value);
    
    // 高德地图筛选
    if (map) {
        // 获取所有标记并应用筛选
        const markers = map.getAllOverlays('marker');
        let visibleCount = 0;
        
        markers.forEach(marker => {
            const markerContent = marker.getContent();
            if (markerContent && markerContent.dataset) {
                const status = markerContent.dataset.status;
                const type = markerContent.dataset.type;
                
                // 检查是否应该显示此站点
                const statusMatch = statusFilters.includes('all') || statusFilters.includes(status);
                const typeMatch = typeFilters.includes('all') || typeFilters.includes(type);
                
                // 设置标记可见性
                if (statusMatch && typeMatch) {
                    marker.show();
                    visibleCount++;
                } else {
                    marker.hide();
                }
            }
        });
        
        // 如果过滤后没有可见的标记，显示警告
        if (visibleCount === 0 && markers.length > 0) {
            showTooltip('筛选结果为空', '当前筛选条件下没有匹配的站点，请调整筛选条件', 'warning');
        } else {
            // 显示筛选应用提示
            showTooltip('筛选已应用', `地图站点已根据筛选条件更新，显示${visibleCount}个站点`);
        }
    } else {
        // 备用方案：使用DOM元素筛选
        const siteMarkers = document.querySelectorAll('.site-marker');
        let visibleCount = 0;
        
        // 应用筛选
        siteMarkers.forEach(marker => {
            const status = marker.dataset.status;
            const type = marker.dataset.type;
            
            // 检查是否应该显示此站点
            const statusMatch = statusFilters.includes('all') || statusFilters.includes(status);
            const typeMatch = typeFilters.includes('all') || typeFilters.includes(type);
            
            // 设置站点可见性
            if (statusMatch && typeMatch) {
                marker.style.display = 'flex';
                visibleCount++;
            } else {
                marker.style.display = 'none';
            }
        });
        
        // 如果过滤后没有可见的标记，显示警告
        if (visibleCount === 0 && siteMarkers.length > 0) {
            showTooltip('筛选结果为空', '当前筛选条件下没有匹配的站点，请调整筛选条件', 'warning');
        } else {
            // 显示筛选应用提示
            showTooltip('筛选已应用', `地图站点已根据筛选条件更新，显示${visibleCount}个站点`);
        }
    }
}

/**
 * 注册全屏功能
 */
function registerFullscreenEvent() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const mapContainer = document.querySelector('.gis-map-container');
    
    if (fullscreenBtn && mapContainer) {
        fullscreenBtn.addEventListener('click', function() {
            if (document.fullscreenElement) {
                // 当前已是全屏状态，退出全屏
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                // 进入全屏模式
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                } else if (mapContainer.webkitRequestFullscreen) {
                    mapContainer.webkitRequestFullscreen();
                } else if (mapContainer.mozRequestFullScreen) {
                    mapContainer.mozRequestFullScreen();
                } else if (mapContainer.msRequestFullscreen) {
                    mapContainer.msRequestFullscreen();
                } else {
                    // 备用方法：CSS全屏
                    document.body.classList.add('map-fullscreen-mode');
                    mapContainer.classList.add('fullscreen');
                }
            }
            
            // 更改图标
            updateFullscreenButtonIcon();
            
            // 调整地图大小
            if (map) {
                setTimeout(() => {
                    map.resize();
                }, 300);
            }
        });
        
        // 监听全屏状态变化
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        
        function handleFullscreenChange() {
            updateFullscreenButtonIcon();
            
            if (!document.fullscreenElement && 
                !document.webkitFullscreenElement && 
                !document.mozFullScreenElement && 
                !document.msFullscreenElement) {
                // 已退出全屏
                document.body.classList.remove('map-fullscreen-mode');
                mapContainer.classList.remove('fullscreen');
                
                // 调整地图大小
                if (map) {
                    setTimeout(() => {
                        map.resize();
                    }, 300);
                }
            }
        }
        
        function updateFullscreenButtonIcon() {
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement ||
                document.body.classList.contains('map-fullscreen-mode')) {
                // 全屏状态 - 显示压缩图标
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                // 非全屏状态 - 显示扩展图标
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }
}

/**
 * 注册退出登录事件
 */
function registerLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 确认是否退出
            if (confirm('确定要退出登录吗？')) {
                // 清除登录状态
                localStorage.removeItem('pano_logged_in');
                
                // 显示提示
                showTooltip('退出成功', '您已成功退出系统', 'success');
                
                // 延迟后跳转到登录页
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
}

/**
 * 显示欢迎消息
 */
function showWelcomeMessage() {
    const userInfo = JSON.parse(localStorage.getItem('pano_user') || '{}');
    const username = userInfo.username || '管理员';
    
    setTimeout(() => {
        showTooltip('欢迎使用', `${username}，欢迎使用智慧运维系统`, 'success');
    }, 1000);
}

/**
 * 全局提示框函数
 * @param {string} title - 提示标题
 * @param {string} message - 提示内容
 * @param {string} type - 提示类型（success/error/warning）
 */
function showTooltip(title, message, type = 'success') {
    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = tooltip.querySelector('.tooltip-title');
    const tooltipMessage = tooltip.querySelector('.tooltip-message');
    
    // 设置提示内容
    tooltipTitle.textContent = title || '提示';
    tooltipMessage.innerHTML = message || '操作成功';
    
    // 设置提示类型
    tooltip.className = 'tooltip';
    tooltip.classList.add(type);
    tooltip.classList.add('show');
    
    // 3秒后自动关闭
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
}

/**
 * 显示加载指示器
 * @param {boolean} show - 是否显示加载指示器
 */
function showLoadingIndicator(show) {
    let loadingEl = document.getElementById('mapLoadingIndicator');
    
    if (!loadingEl && show) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'mapLoadingIndicator';
        loadingEl.className = 'loading-indicator';
        loadingEl.innerHTML = '<div class="spinner"></div><div>加载中...</div>';
        document.querySelector('.gis-map-container').appendChild(loadingEl);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 1000;
            }
            .spinner {
                width: 30px;
                height: 30px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            @keyframes spin {
                to {transform: rotate(360deg);}
            }
        `;
        document.head.appendChild(style);
    }
    
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

/**
 * 优化Canvas性能
 */
function optimizeCanvasPerformance() {
    // 查找所有Canvas元素
    const canvasElements = document.querySelectorAll('canvas');
    
    canvasElements.forEach(canvas => {
        // 为Canvas添加willReadFrequently属性
        // 注意：必须在首次获取上下文时设置
        const originalContext = canvas.getContext('2d');
        if (originalContext) {
            // 尝试重新获取上下文，添加willReadFrequently属性
            try {
                // 在某些浏览器中可能不支持重新获取
                const optimizedContext = canvas.getContext('2d', { willReadFrequently: true });
            } catch (e) {
                console.log('无法重新配置Canvas上下文，将在下次渲染时优化');
            }
        }
    });
    
    // 添加MutationObserver以监控新添加的Canvas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    // 检查添加的节点是否是Canvas
                    if (node.nodeName === 'CANVAS') {
                        // 使用willReadFrequently获取上下文
                        node.getContext('2d', { willReadFrequently: true });
                    }
                    
                    // 检查添加的节点内部是否包含Canvas
                    if (node.querySelectorAll) {
                        const canvases = node.querySelectorAll('canvas');
                        canvases.forEach(canvas => {
                            canvas.getContext('2d', { willReadFrequently: true });
                        });
                    }
                });
            }
        });
    });
    
    // 开始观察文档变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 全局函数，用于信息窗口内的链接调用
window.goToSiteDetail = function(siteId) {
    try {
        console.log("直接调用goToSiteDetail函数，ID:", siteId);
        // 保存站点ID到本地存储
        localStorage.setItem('selectedSiteId', siteId);
        // 直接跳转到站点详情页
        window.location.href = 'site-detail.html';
        return false;
    } catch (error) {
        console.error("跳转错误:", error);
        alert("跳转过程中发生错误: " + error.message);
    }
}; 