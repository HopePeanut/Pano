/**
 * 设备监控页面脚本 - 修复版本
 */

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 清空设备内容区域
    clearDeviceContent();
    
    // 将页面元素初始化为最小状态
    initMinimalState();
    
    // 初始化设备树导航
    initDeviceTreeNavigation();
    
    // 检查BMS是否被选中，如果是则显示BMS内容
    const activeBMS = document.querySelector('.level-2-item[data-device="system1-bms"].active');
    if (activeBMS) {
        showBMSContent();
    }
});

/**
 * 初始化设备树状导航
 * 重新实现了树状导航的交互逻辑，确保一级和二级菜单的正确交互
 */
function initDeviceTreeNavigation() {
    console.log('初始化设备树状导航');
    
    // 使用更直接的事件绑定方法处理一级菜单点击
    const deviceList = document.querySelector('.device-list');
    
    // 添加点击事件委托到整个设备列表上
    deviceList.addEventListener('click', function(e) {
        // 获取最近的一级菜单标题
        const level1Header = e.target.closest('.level-1-item .level-item-header');
        if (level1Header) {
            // 点击的是一级菜单标题
            handleLevel1Click(level1Header, e);
            return;
        }
        
        // 获取最近的二级菜单项
        const level2Item = e.target.closest('.level-2-item');
        if (level2Item) {
            // 点击的是二级菜单项
            handleLevel2Click(level2Item, e);
            return;
        }
    });
}

/**
 * 处理一级菜单点击
 * @param {HTMLElement} header - 一级菜单标题元素
 * @param {Event} e - 事件对象
 */
function handleLevel1Click(header, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const parentItem = header.closest('.level-1-item');
    const systemId = parentItem.dataset.system;
    console.log('点击一级菜单:', systemId);
    
    // 处理EMS特殊情况
    if (systemId === 'ems') {
        // 清除所有已选中状态
        clearAllSelections();
        
        // 设置EMS为选中状态
        parentItem.classList.add('active');
        
        // 显示EMS内容
        showEMSContent();
        return;
    }
    
    // 切换展开/折叠图标
    const expandIcon = header.querySelector('i:first-child');
    if (expandIcon) {
        console.log('切换前图标类名:', expandIcon.className);
        const isExpanded = expandIcon.classList.contains('bi-dash');
        
        // 切换图标
        if (isExpanded) {
            expandIcon.classList.remove('bi-dash');
            expandIcon.classList.add('bi-plus');
        } else {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
        console.log('切换后图标类名:', expandIcon.className);
    } else {
        console.warn('未找到展开/折叠图标');
    }
    
    // 获取二级菜单容器
    const subMenuContainer = parentItem.querySelector('.level-2-container');
    if (subMenuContainer) {
        // 切换显示/隐藏状态
        const isVisible = subMenuContainer.style.display === 'block';
        const newDisplay = isVisible ? 'none' : 'block';
        console.log(`切换子菜单显示: ${isVisible ? '隐藏' : '显示'}`);
        subMenuContainer.style.display = newDisplay;
    } else {
        console.error('未找到子菜单容器');
    }
}

/**
 * 处理二级菜单点击
 * @param {HTMLElement} item - 二级菜单项元素
 * @param {Event} e - 事件对象
 */
function handleLevel2Click(item, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const deviceId = item.dataset.device;
    console.log('点击二级菜单:', deviceId);
    
    // 清除所有已选中状态
    clearAllSelections();
    
    // 设置当前二级菜单为选中状态
    item.classList.add('active');
    
    // 确保父级一级菜单保持展开状态
    const parentItem = item.closest('.level-1-item');
    if (parentItem) {
        const subMenuContainer = parentItem.querySelector('.level-2-container');
        if (subMenuContainer) {
            subMenuContainer.style.display = 'block';
        }
        
        // 确保展开图标状态正确
        const expandIcon = parentItem.querySelector('.level-item-header i:first-child');
        if (expandIcon) {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
    }
    
    // 显示对应设备内容
    if (deviceId === 'system1-bms') {
        showBMSContent();
    } else if (deviceId === 'system1-local-controller') {
        // 本地控制器内容
        showDeviceContent(deviceId, true);
    } else {
        showDeviceContent(deviceId);
    }
}

/**
 * 清除所有已选中状态
 */
function clearAllSelections() {
    document.querySelectorAll('.level-1-item, .level-2-item').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * 初始化页面
 */
function initPage() {
    console.log('初始化页面');
    
    // 加载导航组件
    loadNavComponents();
    
    // 初始化站点切换器
    initSiteSwitcher();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化设备树交互
    initDeviceTreeInteractions();
    
    // 初始化功能标签页切换
    initFunctionTabs();
    
    // 初始化子设备标签页
    initSubDeviceTabs();
    
    // 确保设备内容区域为空(默认状态)
    clearDeviceContent();
    
    // 初始化状态信息面板
    initStatusInfoPanel();
    
    // 设置自动刷新
    setAutoRefresh();
}

/**
 * 显示设备内容
 * @param {string} deviceId - 设备ID
 * @param {boolean} isController - 是否是本地控制器
 */
function showDeviceContent(deviceId, isController = false) {
    console.log('显示设备内容:', deviceId);
    
    // 清空设备内容区域
    const deviceContent = document.getElementById('device-content');
    const deviceHeader = document.getElementById('device-header');
    
    if (!deviceContent || !deviceHeader) {
        console.error('找不到设备内容区域或标题区域');
        return;
    }
    
    // 更新设备UI
    updateDeviceUI(deviceId);
    
    // 如果是本地控制器，显示特殊内容
    if (isController || deviceId.includes('controller')) {
        // 设置设备标题
        deviceHeader.innerHTML = `
            <div class="device-title">
                <i class="bi bi-hdd-rack-fill"></i>
                <span>本地控制器</span>
            </div>
            <div class="device-actions">
                <button class="refresh-btn">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>刷新</span>
                </button>
            </div>
        `;
        
        // 创建本地控制器内容的HTML结构
        let controllerContentHtml = `
            <div class="controller-tabs">
                <div class="controller-tab-items">
                    <div class="tab-item active">监视</div>
                    <div class="tab-item">控制</div>
                    <div class="tab-item">参数配置</div>
                </div>
            </div>
            
            <div class="controller-content">
                <!-- 默认显示监视内容 -->
                <div class="controller-monitor-content">
                    <div class="section-title">
                        <i class="bi bi-display"></i>
                        系统监控
                    </div>
                    
                    <!-- 状态卡片 -->
                    <div class="status-card-row">
                        <div class="status-card online">
                            <div class="status-title">系统状态</div>
                            <div class="status-value">正常运行</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">通信状态</div>
                            <div class="status-value">通信正常</div>
                        </div>
                        <div class="status-card closed">
                            <div class="status-title">CPU利用率</div>
                            <div class="status-value">32%</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">内存使用</div>
                            <div class="status-value">1.2GB/4GB</div>
                        </div>
                    </div>
                    
                    <!-- 系统信息 -->
                    <div class="data-section">
                        <div class="section-title">系统信息</div>
                        <table class="data-table">
                            <tr>
                                <td>软件版本</td>
                                <td>V2.5.7</td>
                                <td>运行时间</td>
                                <td>345天12小时</td>
                                <td>磁盘空间</td>
                                <td>47.5GB/128GB</td>
                            </tr>
                            <tr>
                                <td>IP地址</td>
                                <td>192.168.1.100</td>
                                <td>MAC地址</td>
                                <td>00:1B:44:11:3A:B7</td>
                                <td>上次重启</td>
                                <td>2023-05-12 08:30:15</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- 模块状态 -->
                    <div class="data-section">
                        <div class="section-title">模块状态</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>模块名称</th>
                                    <th>状态</th>
                                    <th>最后通信</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>数据采集模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:22</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>通信管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:25</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>控制策略模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:20</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>告警管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:18</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 性能监控 -->
                    <div class="data-section">
                        <div class="section-title">性能监控</div>
                        <div class="performance-charts">
                            <div class="chart-placeholder">CPU利用率图表</div>
                            <div class="chart-placeholder">内存使用图表</div>
                            <div class="chart-placeholder">网络流量图表</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 设置设备内容
        deviceContent.innerHTML = controllerContentHtml;
        
        // 添加标签页切换事件
        const tabItems = deviceContent.querySelectorAll('.controller-tab-items .tab-item');
        
        tabItems.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // 移除所有标签的激活状态
                tabItems.forEach(t => t.classList.remove('active'));
                
                // 添加当前标签的激活状态
                this.classList.add('active');
                
                // 获取控制器内容区域
                const controllerContent = deviceContent.querySelector('.controller-content');
                
                // 根据标签索引显示不同内容
                if (index === 0) {
                    // 监视（重新创建监视内容）
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = controllerContentHtml;
                    const monitorContent = tempDiv.querySelector('.controller-monitor-content');
                    controllerContent.innerHTML = monitorContent ? monitorContent.outerHTML : '';
                } else if (index === 1) {
                    // 控制
                    showControllerControlContent(controllerContent);
                } else if (index === 2) {
                    // 参数配置
                    showControllerConfigContent(controllerContent);
                }
            });
        });
        
        // 添加刷新按钮事件
        const refreshBtn = deviceHeader.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                showDeviceContent(deviceId, true);
                showTooltip('数据已刷新', 'success');
            });
        }
        
        return;
    }
    
    // 常规设备内容
    // 显示加载状态
    showLoadingState();
    
    // 模拟加载延迟
    setTimeout(() => {
        // 获取设备数据
        const deviceData = getDeviceData(deviceId);
        
        // 更新设备界面
        updateDeviceInterface(deviceData);
        
        // 隐藏加载状态
        hideLoadingState();
        
        // 更新刷新时间
        updateRefreshTime();
        
        // 添加刷新按钮事件
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDeviceData(deviceId, true);
            });
        }
    }, 500);
}

/**
 * 显示本地控制器控制内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerControlContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器控制内容');
    
    // 设置控制内容
    const controlHTML = `
        <div class="controller-control-content">
            <div class="section-title">
                <i class="bi bi-sliders"></i>
                控制面板
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">系统控制</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">系统模式:</span>
                            <div class="control-action">
                                <select class="mode-select">
                                    <option value="auto">自动模式</option>
                                    <option value="manual">手动模式</option>
                                    <option value="standby">待机模式</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">系统状态:</span>
                            <div class="control-action">
                                <button class="action-btn start-btn">启动</button>
                                <button class="action-btn stop-btn">停止</button>
                                <button class="action-btn reset-btn">重置</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">通信设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">通信模式:</span>
                            <div class="control-action">
                                <select class="comm-select">
                                    <option value="4g">4G网络</option>
                                    <option value="ethernet">有线网络</option>
                                    <option value="wifi">WiFi网络</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">心跳间隔:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="300"> 秒
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">数据采集设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">采集周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="5" min="1" max="60"> 秒
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">上报周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="3600"> 秒
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">系统维护</div>
                    <div class="control-body">
                        <div class="control-row">
                            <button class="maintenance-btn">系统升级</button>
                            <button class="maintenance-btn">配置导出</button>
                            <button class="maintenance-btn">日志下载</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = controlHTML;
}

/**
 * 显示本地控制器参数配置内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerConfigContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器参数配置内容');
    
    // 设置参数配置内容
    const configHTML = `
        <div class="controller-config-content">
            <div class="section-title">
                <i class="bi bi-gear"></i>
                参数配置
            </div>
            
            <div class="config-tabs">
                <div class="config-tab active">系统参数</div>
                <div class="config-tab">通信参数</div>
                <div class="config-tab">控制参数</div>
                <div class="config-tab">告警参数</div>
            </div>
            
            <div class="config-panel active">
                <div class="config-card">
                    <div class="config-header">基本参数</div>
                    <div class="config-body">
                        <table class="config-table">
                            <tr>
                                <td>设备ID</td>
                                <td><input type="text" class="config-input" value="LC-2023-1015-0023"></td>
                                <td>设备名称</td>
                                <td><input type="text" class="config-input" value="本地控制器1"></td>
                            </tr>
                            <tr>
                                <td>时区设置</td>
                                <td>
                                    <select class="config-select">
                                        <option value="GMT+8">GMT+8 (北京时间)</option>
                                        <option value="GMT+0">GMT+0</option>
                                        <option value="GMT-5">GMT-5</option>
                                    </select>
                                </td>
                                <td>系统语言</td>
                                <td>
                                    <select class="config-select">
                                        <option value="zh-CN">简体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>数据保存天数</td>
                                <td><input type="number" class="config-input" value="90" min="1" max="365"></td>
                                <td>日志级别</td>
                                <td>
                                    <select class="config-select">
                                        <option value="error">错误</option>
                                        <option value="warning">警告</option>
                                        <option value="info" selected>信息</option>
                                        <option value="debug">调试</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                        <div class="config-buttons">
                            <button class="save-btn">保存</button>
                            <button class="default-btn">恢复默认</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = configHTML;
    
    // 添加配置标签页切换事件
    const configTabs = container.querySelectorAll('.config-tab');
    const configPanels = container.querySelectorAll('.config-panel');
    
    configTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的活动状态
            configTabs.forEach(t => t.classList.remove('active'));
            configPanels.forEach(p => p.classList.remove('active'));
            
            // 添加当前标签页的活动状态
            this.classList.add('active');
            if (configPanels[index]) {
                configPanels[index].classList.add('active');
            }
        });
    });
} 
 * 设备监控页面脚本 - 修复版本
 */

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 清空设备内容区域
    clearDeviceContent();
    
    // 将页面元素初始化为最小状态
    initMinimalState();
    
    // 初始化设备树导航
    initDeviceTreeNavigation();
    
    // 检查BMS是否被选中，如果是则显示BMS内容
    const activeBMS = document.querySelector('.level-2-item[data-device="system1-bms"].active');
    if (activeBMS) {
        showBMSContent();
    }
});

/**
 * 初始化设备树状导航
 * 重新实现了树状导航的交互逻辑，确保一级和二级菜单的正确交互
 */
function initDeviceTreeNavigation() {
    console.log('初始化设备树状导航');
    
    // 使用更直接的事件绑定方法处理一级菜单点击
    const deviceList = document.querySelector('.device-list');
    
    // 添加点击事件委托到整个设备列表上
    deviceList.addEventListener('click', function(e) {
        // 获取最近的一级菜单标题
        const level1Header = e.target.closest('.level-1-item .level-item-header');
        if (level1Header) {
            // 点击的是一级菜单标题
            handleLevel1Click(level1Header, e);
            return;
        }
        
        // 获取最近的二级菜单项
        const level2Item = e.target.closest('.level-2-item');
        if (level2Item) {
            // 点击的是二级菜单项
            handleLevel2Click(level2Item, e);
            return;
        }
    });
}

/**
 * 处理一级菜单点击
 * @param {HTMLElement} header - 一级菜单标题元素
 * @param {Event} e - 事件对象
 */
function handleLevel1Click(header, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const parentItem = header.closest('.level-1-item');
    const systemId = parentItem.dataset.system;
    console.log('点击一级菜单:', systemId);
    
    // 处理EMS特殊情况
    if (systemId === 'ems') {
        // 清除所有已选中状态
        clearAllSelections();
        
        // 设置EMS为选中状态
        parentItem.classList.add('active');
        
        // 显示EMS内容
        showEMSContent();
        return;
    }
    
    // 切换展开/折叠图标
    const expandIcon = header.querySelector('i:first-child');
    if (expandIcon) {
        console.log('切换前图标类名:', expandIcon.className);
        const isExpanded = expandIcon.classList.contains('bi-dash');
        
        // 切换图标
        if (isExpanded) {
            expandIcon.classList.remove('bi-dash');
            expandIcon.classList.add('bi-plus');
        } else {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
        console.log('切换后图标类名:', expandIcon.className);
    } else {
        console.warn('未找到展开/折叠图标');
    }
    
    // 获取二级菜单容器
    const subMenuContainer = parentItem.querySelector('.level-2-container');
    if (subMenuContainer) {
        // 切换显示/隐藏状态
        const isVisible = subMenuContainer.style.display === 'block';
        const newDisplay = isVisible ? 'none' : 'block';
        console.log(`切换子菜单显示: ${isVisible ? '隐藏' : '显示'}`);
        subMenuContainer.style.display = newDisplay;
    } else {
        console.error('未找到子菜单容器');
    }
}

/**
 * 处理二级菜单点击
 * @param {HTMLElement} item - 二级菜单项元素
 * @param {Event} e - 事件对象
 */
function handleLevel2Click(item, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const deviceId = item.dataset.device;
    console.log('点击二级菜单:', deviceId);
    
    // 清除所有已选中状态
    clearAllSelections();
    
    // 设置当前二级菜单为选中状态
    item.classList.add('active');
    
    // 确保父级一级菜单保持展开状态
    const parentItem = item.closest('.level-1-item');
    if (parentItem) {
        const subMenuContainer = parentItem.querySelector('.level-2-container');
        if (subMenuContainer) {
            subMenuContainer.style.display = 'block';
        }
        
        // 确保展开图标状态正确
        const expandIcon = parentItem.querySelector('.level-item-header i:first-child');
        if (expandIcon) {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
    }
    
    // 显示对应设备内容
    if (deviceId === 'system1-bms') {
        showBMSContent();
    } else if (deviceId === 'system1-local-controller') {
        // 本地控制器内容
        showDeviceContent(deviceId, true);
    } else {
        showDeviceContent(deviceId);
    }
}

/**
 * 清除所有已选中状态
 */
function clearAllSelections() {
    document.querySelectorAll('.level-1-item, .level-2-item').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * 初始化页面
 */
function initPage() {
    console.log('初始化页面');
    
    // 加载导航组件
    loadNavComponents();
    
    // 初始化站点切换器
    initSiteSwitcher();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化设备树交互
    initDeviceTreeInteractions();
    
    // 初始化功能标签页切换
    initFunctionTabs();
    
    // 初始化子设备标签页
    initSubDeviceTabs();
    
    // 确保设备内容区域为空(默认状态)
    clearDeviceContent();
    
    // 初始化状态信息面板
    initStatusInfoPanel();
    
    // 设置自动刷新
    setAutoRefresh();
}

/**
 * 显示设备内容
 * @param {string} deviceId - 设备ID
 * @param {boolean} isController - 是否是本地控制器
 */
function showDeviceContent(deviceId, isController = false) {
    console.log('显示设备内容:', deviceId);
    
    // 清空设备内容区域
    const deviceContent = document.getElementById('device-content');
    const deviceHeader = document.getElementById('device-header');
    
    if (!deviceContent || !deviceHeader) {
        console.error('找不到设备内容区域或标题区域');
        return;
    }
    
    // 更新设备UI
    updateDeviceUI(deviceId);
    
    // 如果是本地控制器，显示特殊内容
    if (isController || deviceId.includes('controller')) {
        // 设置设备标题
        deviceHeader.innerHTML = `
            <div class="device-title">
                <i class="bi bi-hdd-rack-fill"></i>
                <span>本地控制器</span>
            </div>
            <div class="device-actions">
                <button class="refresh-btn">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>刷新</span>
                </button>
            </div>
        `;
        
        // 创建本地控制器内容的HTML结构
        let controllerContentHtml = `
            <div class="controller-tabs">
                <div class="controller-tab-items">
                    <div class="tab-item active">监视</div>
                    <div class="tab-item">控制</div>
                    <div class="tab-item">参数配置</div>
                </div>
            </div>
            
            <div class="controller-content">
                <!-- 默认显示监视内容 -->
                <div class="controller-monitor-content">
                    <div class="section-title">
                        <i class="bi bi-display"></i>
                        系统监控
                    </div>
                    
                    <!-- 状态卡片 -->
                    <div class="status-card-row">
                        <div class="status-card online">
                            <div class="status-title">系统状态</div>
                            <div class="status-value">正常运行</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">通信状态</div>
                            <div class="status-value">通信正常</div>
                        </div>
                        <div class="status-card closed">
                            <div class="status-title">CPU利用率</div>
                            <div class="status-value">32%</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">内存使用</div>
                            <div class="status-value">1.2GB/4GB</div>
                        </div>
                    </div>
                    
                    <!-- 系统信息 -->
                    <div class="data-section">
                        <div class="section-title">系统信息</div>
                        <table class="data-table">
                            <tr>
                                <td>软件版本</td>
                                <td>V2.5.7</td>
                                <td>运行时间</td>
                                <td>345天12小时</td>
                                <td>磁盘空间</td>
                                <td>47.5GB/128GB</td>
                            </tr>
                            <tr>
                                <td>IP地址</td>
                                <td>192.168.1.100</td>
                                <td>MAC地址</td>
                                <td>00:1B:44:11:3A:B7</td>
                                <td>上次重启</td>
                                <td>2023-05-12 08:30:15</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- 模块状态 -->
                    <div class="data-section">
                        <div class="section-title">模块状态</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>模块名称</th>
                                    <th>状态</th>
                                    <th>最后通信</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>数据采集模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:22</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>通信管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:25</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>控制策略模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:20</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>告警管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:18</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 性能监控 -->
                    <div class="data-section">
                        <div class="section-title">性能监控</div>
                        <div class="performance-charts">
                            <div class="chart-placeholder">CPU利用率图表</div>
                            <div class="chart-placeholder">内存使用图表</div>
                            <div class="chart-placeholder">网络流量图表</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 设置设备内容
        deviceContent.innerHTML = controllerContentHtml;
        
        // 添加标签页切换事件
        const tabItems = deviceContent.querySelectorAll('.controller-tab-items .tab-item');
        
        tabItems.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // 移除所有标签的激活状态
                tabItems.forEach(t => t.classList.remove('active'));
                
                // 添加当前标签的激活状态
                this.classList.add('active');
                
                // 获取控制器内容区域
                const controllerContent = deviceContent.querySelector('.controller-content');
                
                // 根据标签索引显示不同内容
                if (index === 0) {
                    // 监视（重新创建监视内容）
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = controllerContentHtml;
                    const monitorContent = tempDiv.querySelector('.controller-monitor-content');
                    controllerContent.innerHTML = monitorContent ? monitorContent.outerHTML : '';
                } else if (index === 1) {
                    // 控制
                    showControllerControlContent(controllerContent);
                } else if (index === 2) {
                    // 参数配置
                    showControllerConfigContent(controllerContent);
                }
            });
        });
        
        // 添加刷新按钮事件
        const refreshBtn = deviceHeader.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                showDeviceContent(deviceId, true);
                showTooltip('数据已刷新', 'success');
            });
        }
        
        return;
    }
    
    // 常规设备内容
    // 显示加载状态
    showLoadingState();
    
    // 模拟加载延迟
    setTimeout(() => {
        // 获取设备数据
        const deviceData = getDeviceData(deviceId);
        
        // 更新设备界面
        updateDeviceInterface(deviceData);
        
        // 隐藏加载状态
        hideLoadingState();
        
        // 更新刷新时间
        updateRefreshTime();
        
        // 添加刷新按钮事件
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDeviceData(deviceId, true);
            });
        }
    }, 500);
}

/**
 * 显示本地控制器控制内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerControlContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器控制内容');
    
    // 设置控制内容
    const controlHTML = `
        <div class="controller-control-content">
            <div class="section-title">
                <i class="bi bi-sliders"></i>
                控制面板
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">系统控制</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">系统模式:</span>
                            <div class="control-action">
                                <select class="mode-select">
                                    <option value="auto">自动模式</option>
                                    <option value="manual">手动模式</option>
                                    <option value="standby">待机模式</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">系统状态:</span>
                            <div class="control-action">
                                <button class="action-btn start-btn">启动</button>
                                <button class="action-btn stop-btn">停止</button>
                                <button class="action-btn reset-btn">重置</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">通信设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">通信模式:</span>
                            <div class="control-action">
                                <select class="comm-select">
                                    <option value="4g">4G网络</option>
                                    <option value="ethernet">有线网络</option>
                                    <option value="wifi">WiFi网络</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">心跳间隔:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="300"> 秒
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">数据采集设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">采集周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="5" min="1" max="60"> 秒
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">上报周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="3600"> 秒
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">系统维护</div>
                    <div class="control-body">
                        <div class="control-row">
                            <button class="maintenance-btn">系统升级</button>
                            <button class="maintenance-btn">配置导出</button>
                            <button class="maintenance-btn">日志下载</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = controlHTML;
}

/**
 * 显示本地控制器参数配置内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerConfigContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器参数配置内容');
    
    // 设置参数配置内容
    const configHTML = `
        <div class="controller-config-content">
            <div class="section-title">
                <i class="bi bi-gear"></i>
                参数配置
            </div>
            
            <div class="config-tabs">
                <div class="config-tab active">系统参数</div>
                <div class="config-tab">通信参数</div>
                <div class="config-tab">控制参数</div>
                <div class="config-tab">告警参数</div>
            </div>
            
            <div class="config-panel active">
                <div class="config-card">
                    <div class="config-header">基本参数</div>
                    <div class="config-body">
                        <table class="config-table">
                            <tr>
                                <td>设备ID</td>
                                <td><input type="text" class="config-input" value="LC-2023-1015-0023"></td>
                                <td>设备名称</td>
                                <td><input type="text" class="config-input" value="本地控制器1"></td>
                            </tr>
                            <tr>
                                <td>时区设置</td>
                                <td>
                                    <select class="config-select">
                                        <option value="GMT+8">GMT+8 (北京时间)</option>
                                        <option value="GMT+0">GMT+0</option>
                                        <option value="GMT-5">GMT-5</option>
                                    </select>
                                </td>
                                <td>系统语言</td>
                                <td>
                                    <select class="config-select">
                                        <option value="zh-CN">简体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>数据保存天数</td>
                                <td><input type="number" class="config-input" value="90" min="1" max="365"></td>
                                <td>日志级别</td>
                                <td>
                                    <select class="config-select">
                                        <option value="error">错误</option>
                                        <option value="warning">警告</option>
                                        <option value="info" selected>信息</option>
                                        <option value="debug">调试</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                        <div class="config-buttons">
                            <button class="save-btn">保存</button>
                            <button class="default-btn">恢复默认</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = configHTML;
    
    // 添加配置标签页切换事件
    const configTabs = container.querySelectorAll('.config-tab');
    const configPanels = container.querySelectorAll('.config-panel');
    
    configTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的活动状态
            configTabs.forEach(t => t.classList.remove('active'));
            configPanels.forEach(p => p.classList.remove('active'));
            
            // 添加当前标签页的活动状态
            this.classList.add('active');
            if (configPanels[index]) {
                configPanels[index].classList.add('active');
            }
        });
    });
} 
 * 设备监控页面脚本 - 修复版本
 */

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 清空设备内容区域
    clearDeviceContent();
    
    // 将页面元素初始化为最小状态
    initMinimalState();
    
    // 初始化设备树导航
    initDeviceTreeNavigation();
    
    // 检查BMS是否被选中，如果是则显示BMS内容
    const activeBMS = document.querySelector('.level-2-item[data-device="system1-bms"].active');
    if (activeBMS) {
        showBMSContent();
    }
});

/**
 * 初始化设备树状导航
 * 重新实现了树状导航的交互逻辑，确保一级和二级菜单的正确交互
 */
function initDeviceTreeNavigation() {
    console.log('初始化设备树状导航');
    
    // 使用更直接的事件绑定方法处理一级菜单点击
    const deviceList = document.querySelector('.device-list');
    
    // 添加点击事件委托到整个设备列表上
    deviceList.addEventListener('click', function(e) {
        // 获取最近的一级菜单标题
        const level1Header = e.target.closest('.level-1-item .level-item-header');
        if (level1Header) {
            // 点击的是一级菜单标题
            handleLevel1Click(level1Header, e);
            return;
        }
        
        // 获取最近的二级菜单项
        const level2Item = e.target.closest('.level-2-item');
        if (level2Item) {
            // 点击的是二级菜单项
            handleLevel2Click(level2Item, e);
            return;
        }
    });
}

/**
 * 处理一级菜单点击
 * @param {HTMLElement} header - 一级菜单标题元素
 * @param {Event} e - 事件对象
 */
function handleLevel1Click(header, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const parentItem = header.closest('.level-1-item');
    const systemId = parentItem.dataset.system;
    console.log('点击一级菜单:', systemId);
    
    // 处理EMS特殊情况
    if (systemId === 'ems') {
        // 清除所有已选中状态
        clearAllSelections();
        
        // 设置EMS为选中状态
        parentItem.classList.add('active');
        
        // 显示EMS内容
        showEMSContent();
        return;
    }
    
    // 切换展开/折叠图标
    const expandIcon = header.querySelector('i:first-child');
    if (expandIcon) {
        console.log('切换前图标类名:', expandIcon.className);
        const isExpanded = expandIcon.classList.contains('bi-dash');
        
        // 切换图标
        if (isExpanded) {
            expandIcon.classList.remove('bi-dash');
            expandIcon.classList.add('bi-plus');
        } else {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
        console.log('切换后图标类名:', expandIcon.className);
    } else {
        console.warn('未找到展开/折叠图标');
    }
    
    // 获取二级菜单容器
    const subMenuContainer = parentItem.querySelector('.level-2-container');
    if (subMenuContainer) {
        // 切换显示/隐藏状态
        const isVisible = subMenuContainer.style.display === 'block';
        const newDisplay = isVisible ? 'none' : 'block';
        console.log(`切换子菜单显示: ${isVisible ? '隐藏' : '显示'}`);
        subMenuContainer.style.display = newDisplay;
    } else {
        console.error('未找到子菜单容器');
    }
}

/**
 * 处理二级菜单点击
 * @param {HTMLElement} item - 二级菜单项元素
 * @param {Event} e - 事件对象
 */
function handleLevel2Click(item, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const deviceId = item.dataset.device;
    console.log('点击二级菜单:', deviceId);
    
    // 清除所有已选中状态
    clearAllSelections();
    
    // 设置当前二级菜单为选中状态
    item.classList.add('active');
    
    // 确保父级一级菜单保持展开状态
    const parentItem = item.closest('.level-1-item');
    if (parentItem) {
        const subMenuContainer = parentItem.querySelector('.level-2-container');
        if (subMenuContainer) {
            subMenuContainer.style.display = 'block';
        }
        
        // 确保展开图标状态正确
        const expandIcon = parentItem.querySelector('.level-item-header i:first-child');
        if (expandIcon) {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
    }
    
    // 显示对应设备内容
    if (deviceId === 'system1-bms') {
        showBMSContent();
    } else if (deviceId === 'system1-local-controller') {
        // 本地控制器内容
        showDeviceContent(deviceId, true);
    } else {
        showDeviceContent(deviceId);
    }
}

/**
 * 清除所有已选中状态
 */
function clearAllSelections() {
    document.querySelectorAll('.level-1-item, .level-2-item').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * 初始化页面
 */
function initPage() {
    console.log('初始化页面');
    
    // 加载导航组件
    loadNavComponents();
    
    // 初始化站点切换器
    initSiteSwitcher();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化设备树交互
    initDeviceTreeInteractions();
    
    // 初始化功能标签页切换
    initFunctionTabs();
    
    // 初始化子设备标签页
    initSubDeviceTabs();
    
    // 确保设备内容区域为空(默认状态)
    clearDeviceContent();
    
    // 初始化状态信息面板
    initStatusInfoPanel();
    
    // 设置自动刷新
    setAutoRefresh();
}

/**
 * 显示设备内容
 * @param {string} deviceId - 设备ID
 * @param {boolean} isController - 是否是本地控制器
 */
function showDeviceContent(deviceId, isController = false) {
    console.log('显示设备内容:', deviceId);
    
    // 清空设备内容区域
    const deviceContent = document.getElementById('device-content');
    const deviceHeader = document.getElementById('device-header');
    
    if (!deviceContent || !deviceHeader) {
        console.error('找不到设备内容区域或标题区域');
        return;
    }
    
    // 更新设备UI
    updateDeviceUI(deviceId);
    
    // 如果是本地控制器，显示特殊内容
    if (isController || deviceId.includes('controller')) {
        // 设置设备标题
        deviceHeader.innerHTML = `
            <div class="device-title">
                <i class="bi bi-hdd-rack-fill"></i>
                <span>本地控制器</span>
            </div>
            <div class="device-actions">
                <button class="refresh-btn">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>刷新</span>
                </button>
            </div>
        `;
        
        // 创建本地控制器内容的HTML结构
        let controllerContentHtml = `
            <div class="controller-tabs">
                <div class="controller-tab-items">
                    <div class="tab-item active">监视</div>
                    <div class="tab-item">控制</div>
                    <div class="tab-item">参数配置</div>
                </div>
            </div>
            
            <div class="controller-content">
                <!-- 默认显示监视内容 -->
                <div class="controller-monitor-content">
                    <div class="section-title">
                        <i class="bi bi-display"></i>
                        系统监控
                    </div>
                    
                    <!-- 状态卡片 -->
                    <div class="status-card-row">
                        <div class="status-card online">
                            <div class="status-title">系统状态</div>
                            <div class="status-value">正常运行</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">通信状态</div>
                            <div class="status-value">通信正常</div>
                        </div>
                        <div class="status-card closed">
                            <div class="status-title">CPU利用率</div>
                            <div class="status-value">32%</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">内存使用</div>
                            <div class="status-value">1.2GB/4GB</div>
                        </div>
                    </div>
                    
                    <!-- 系统信息 -->
                    <div class="data-section">
                        <div class="section-title">系统信息</div>
                        <table class="data-table">
                            <tr>
                                <td>软件版本</td>
                                <td>V2.5.7</td>
                                <td>运行时间</td>
                                <td>345天12小时</td>
                                <td>磁盘空间</td>
                                <td>47.5GB/128GB</td>
                            </tr>
                            <tr>
                                <td>IP地址</td>
                                <td>192.168.1.100</td>
                                <td>MAC地址</td>
                                <td>00:1B:44:11:3A:B7</td>
                                <td>上次重启</td>
                                <td>2023-05-12 08:30:15</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- 模块状态 -->
                    <div class="data-section">
                        <div class="section-title">模块状态</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>模块名称</th>
                                    <th>状态</th>
                                    <th>最后通信</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>数据采集模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:22</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>通信管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:25</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>控制策略模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:20</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>告警管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:18</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 性能监控 -->
                    <div class="data-section">
                        <div class="section-title">性能监控</div>
                        <div class="performance-charts">
                            <div class="chart-placeholder">CPU利用率图表</div>
                            <div class="chart-placeholder">内存使用图表</div>
                            <div class="chart-placeholder">网络流量图表</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 设置设备内容
        deviceContent.innerHTML = controllerContentHtml;
        
        // 添加标签页切换事件
        const tabItems = deviceContent.querySelectorAll('.controller-tab-items .tab-item');
        
        tabItems.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // 移除所有标签的激活状态
                tabItems.forEach(t => t.classList.remove('active'));
                
                // 添加当前标签的激活状态
                this.classList.add('active');
                
                // 获取控制器内容区域
                const controllerContent = deviceContent.querySelector('.controller-content');
                
                // 根据标签索引显示不同内容
                if (index === 0) {
                    // 监视（重新创建监视内容）
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = controllerContentHtml;
                    const monitorContent = tempDiv.querySelector('.controller-monitor-content');
                    controllerContent.innerHTML = monitorContent ? monitorContent.outerHTML : '';
                } else if (index === 1) {
                    // 控制
                    showControllerControlContent(controllerContent);
                } else if (index === 2) {
                    // 参数配置
                    showControllerConfigContent(controllerContent);
                }
            });
        });
        
        // 添加刷新按钮事件
        const refreshBtn = deviceHeader.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                showDeviceContent(deviceId, true);
                showTooltip('数据已刷新', 'success');
            });
        }
        
        return;
    }
    
    // 常规设备内容
    // 显示加载状态
    showLoadingState();
    
    // 模拟加载延迟
    setTimeout(() => {
        // 获取设备数据
        const deviceData = getDeviceData(deviceId);
        
        // 更新设备界面
        updateDeviceInterface(deviceData);
        
        // 隐藏加载状态
        hideLoadingState();
        
        // 更新刷新时间
        updateRefreshTime();
        
        // 添加刷新按钮事件
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDeviceData(deviceId, true);
            });
        }
    }, 500);
}

/**
 * 显示本地控制器控制内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerControlContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器控制内容');
    
    // 设置控制内容
    const controlHTML = `
        <div class="controller-control-content">
            <div class="section-title">
                <i class="bi bi-sliders"></i>
                控制面板
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">系统控制</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">系统模式:</span>
                            <div class="control-action">
                                <select class="mode-select">
                                    <option value="auto">自动模式</option>
                                    <option value="manual">手动模式</option>
                                    <option value="standby">待机模式</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">系统状态:</span>
                            <div class="control-action">
                                <button class="action-btn start-btn">启动</button>
                                <button class="action-btn stop-btn">停止</button>
                                <button class="action-btn reset-btn">重置</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">通信设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">通信模式:</span>
                            <div class="control-action">
                                <select class="comm-select">
                                    <option value="4g">4G网络</option>
                                    <option value="ethernet">有线网络</option>
                                    <option value="wifi">WiFi网络</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">心跳间隔:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="300"> 秒
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">数据采集设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">采集周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="5" min="1" max="60"> 秒
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">上报周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="3600"> 秒
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">系统维护</div>
                    <div class="control-body">
                        <div class="control-row">
                            <button class="maintenance-btn">系统升级</button>
                            <button class="maintenance-btn">配置导出</button>
                            <button class="maintenance-btn">日志下载</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = controlHTML;
}

/**
 * 显示本地控制器参数配置内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerConfigContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器参数配置内容');
    
    // 设置参数配置内容
    const configHTML = `
        <div class="controller-config-content">
            <div class="section-title">
                <i class="bi bi-gear"></i>
                参数配置
            </div>
            
            <div class="config-tabs">
                <div class="config-tab active">系统参数</div>
                <div class="config-tab">通信参数</div>
                <div class="config-tab">控制参数</div>
                <div class="config-tab">告警参数</div>
            </div>
            
            <div class="config-panel active">
                <div class="config-card">
                    <div class="config-header">基本参数</div>
                    <div class="config-body">
                        <table class="config-table">
                            <tr>
                                <td>设备ID</td>
                                <td><input type="text" class="config-input" value="LC-2023-1015-0023"></td>
                                <td>设备名称</td>
                                <td><input type="text" class="config-input" value="本地控制器1"></td>
                            </tr>
                            <tr>
                                <td>时区设置</td>
                                <td>
                                    <select class="config-select">
                                        <option value="GMT+8">GMT+8 (北京时间)</option>
                                        <option value="GMT+0">GMT+0</option>
                                        <option value="GMT-5">GMT-5</option>
                                    </select>
                                </td>
                                <td>系统语言</td>
                                <td>
                                    <select class="config-select">
                                        <option value="zh-CN">简体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>数据保存天数</td>
                                <td><input type="number" class="config-input" value="90" min="1" max="365"></td>
                                <td>日志级别</td>
                                <td>
                                    <select class="config-select">
                                        <option value="error">错误</option>
                                        <option value="warning">警告</option>
                                        <option value="info" selected>信息</option>
                                        <option value="debug">调试</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                        <div class="config-buttons">
                            <button class="save-btn">保存</button>
                            <button class="default-btn">恢复默认</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = configHTML;
    
    // 添加配置标签页切换事件
    const configTabs = container.querySelectorAll('.config-tab');
    const configPanels = container.querySelectorAll('.config-panel');
    
    configTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的活动状态
            configTabs.forEach(t => t.classList.remove('active'));
            configPanels.forEach(p => p.classList.remove('active'));
            
            // 添加当前标签页的活动状态
            this.classList.add('active');
            if (configPanels[index]) {
                configPanels[index].classList.add('active');
            }
        });
    });
} 
 * 设备监控页面脚本 - 修复版本
 */

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 清空设备内容区域
    clearDeviceContent();
    
    // 将页面元素初始化为最小状态
    initMinimalState();
    
    // 初始化设备树导航
    initDeviceTreeNavigation();
    
    // 检查BMS是否被选中，如果是则显示BMS内容
    const activeBMS = document.querySelector('.level-2-item[data-device="system1-bms"].active');
    if (activeBMS) {
        showBMSContent();
    }
});

/**
 * 初始化设备树状导航
 * 重新实现了树状导航的交互逻辑，确保一级和二级菜单的正确交互
 */
function initDeviceTreeNavigation() {
    console.log('初始化设备树状导航');
    
    // 使用更直接的事件绑定方法处理一级菜单点击
    const deviceList = document.querySelector('.device-list');
    
    // 添加点击事件委托到整个设备列表上
    deviceList.addEventListener('click', function(e) {
        // 获取最近的一级菜单标题
        const level1Header = e.target.closest('.level-1-item .level-item-header');
        if (level1Header) {
            // 点击的是一级菜单标题
            handleLevel1Click(level1Header, e);
            return;
        }
        
        // 获取最近的二级菜单项
        const level2Item = e.target.closest('.level-2-item');
        if (level2Item) {
            // 点击的是二级菜单项
            handleLevel2Click(level2Item, e);
            return;
        }
    });
}

/**
 * 处理一级菜单点击
 * @param {HTMLElement} header - 一级菜单标题元素
 * @param {Event} e - 事件对象
 */
function handleLevel1Click(header, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const parentItem = header.closest('.level-1-item');
    const systemId = parentItem.dataset.system;
    console.log('点击一级菜单:', systemId);
    
    // 处理EMS特殊情况
    if (systemId === 'ems') {
        // 清除所有已选中状态
        clearAllSelections();
        
        // 设置EMS为选中状态
        parentItem.classList.add('active');
        
        // 显示EMS内容
        showEMSContent();
        return;
    }
    
    // 切换展开/折叠图标
    const expandIcon = header.querySelector('i:first-child');
    if (expandIcon) {
        console.log('切换前图标类名:', expandIcon.className);
        const isExpanded = expandIcon.classList.contains('bi-dash');
        
        // 切换图标
        if (isExpanded) {
            expandIcon.classList.remove('bi-dash');
            expandIcon.classList.add('bi-plus');
        } else {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
        console.log('切换后图标类名:', expandIcon.className);
    } else {
        console.warn('未找到展开/折叠图标');
    }
    
    // 获取二级菜单容器
    const subMenuContainer = parentItem.querySelector('.level-2-container');
    if (subMenuContainer) {
        // 切换显示/隐藏状态
        const isVisible = subMenuContainer.style.display === 'block';
        const newDisplay = isVisible ? 'none' : 'block';
        console.log(`切换子菜单显示: ${isVisible ? '隐藏' : '显示'}`);
        subMenuContainer.style.display = newDisplay;
    } else {
        console.error('未找到子菜单容器');
    }
}

/**
 * 处理二级菜单点击
 * @param {HTMLElement} item - 二级菜单项元素
 * @param {Event} e - 事件对象
 */
function handleLevel2Click(item, e) {
    e.stopPropagation(); // 防止事件冒泡
    
    const deviceId = item.dataset.device;
    console.log('点击二级菜单:', deviceId);
    
    // 清除所有已选中状态
    clearAllSelections();
    
    // 设置当前二级菜单为选中状态
    item.classList.add('active');
    
    // 确保父级一级菜单保持展开状态
    const parentItem = item.closest('.level-1-item');
    if (parentItem) {
        const subMenuContainer = parentItem.querySelector('.level-2-container');
        if (subMenuContainer) {
            subMenuContainer.style.display = 'block';
        }
        
        // 确保展开图标状态正确
        const expandIcon = parentItem.querySelector('.level-item-header i:first-child');
        if (expandIcon) {
            expandIcon.classList.remove('bi-plus');
            expandIcon.classList.add('bi-dash');
        }
    }
    
    // 显示对应设备内容
    if (deviceId === 'system1-bms') {
        showBMSContent();
    } else if (deviceId === 'system1-local-controller') {
        // 本地控制器内容
        showDeviceContent(deviceId, true);
    } else {
        showDeviceContent(deviceId);
    }
}

/**
 * 清除所有已选中状态
 */
function clearAllSelections() {
    document.querySelectorAll('.level-1-item, .level-2-item').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * 初始化页面
 */
function initPage() {
    console.log('初始化页面');
    
    // 加载导航组件
    loadNavComponents();
    
    // 初始化站点切换器
    initSiteSwitcher();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化设备树交互
    initDeviceTreeInteractions();
    
    // 初始化功能标签页切换
    initFunctionTabs();
    
    // 初始化子设备标签页
    initSubDeviceTabs();
    
    // 确保设备内容区域为空(默认状态)
    clearDeviceContent();
    
    // 初始化状态信息面板
    initStatusInfoPanel();
    
    // 设置自动刷新
    setAutoRefresh();
}

/**
 * 显示设备内容
 * @param {string} deviceId - 设备ID
 * @param {boolean} isController - 是否是本地控制器
 */
function showDeviceContent(deviceId, isController = false) {
    console.log('显示设备内容:', deviceId);
    
    // 清空设备内容区域
    const deviceContent = document.getElementById('device-content');
    const deviceHeader = document.getElementById('device-header');
    
    if (!deviceContent || !deviceHeader) {
        console.error('找不到设备内容区域或标题区域');
        return;
    }
    
    // 更新设备UI
    updateDeviceUI(deviceId);
    
    // 如果是本地控制器，显示特殊内容
    if (isController || deviceId.includes('controller')) {
        // 设置设备标题
        deviceHeader.innerHTML = `
            <div class="device-title">
                <i class="bi bi-hdd-rack-fill"></i>
                <span>本地控制器</span>
            </div>
            <div class="device-actions">
                <button class="refresh-btn">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>刷新</span>
                </button>
            </div>
        `;
        
        // 创建本地控制器内容的HTML结构
        let controllerContentHtml = `
            <div class="controller-tabs">
                <div class="controller-tab-items">
                    <div class="tab-item active">监视</div>
                    <div class="tab-item">控制</div>
                    <div class="tab-item">参数配置</div>
                </div>
            </div>
            
            <div class="controller-content">
                <!-- 默认显示监视内容 -->
                <div class="controller-monitor-content">
                    <div class="section-title">
                        <i class="bi bi-display"></i>
                        系统监控
                    </div>
                    
                    <!-- 状态卡片 -->
                    <div class="status-card-row">
                        <div class="status-card online">
                            <div class="status-title">系统状态</div>
                            <div class="status-value">正常运行</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">通信状态</div>
                            <div class="status-value">通信正常</div>
                        </div>
                        <div class="status-card closed">
                            <div class="status-title">CPU利用率</div>
                            <div class="status-value">32%</div>
                        </div>
                        <div class="status-card normal">
                            <div class="status-title">内存使用</div>
                            <div class="status-value">1.2GB/4GB</div>
                        </div>
                    </div>
                    
                    <!-- 系统信息 -->
                    <div class="data-section">
                        <div class="section-title">系统信息</div>
                        <table class="data-table">
                            <tr>
                                <td>软件版本</td>
                                <td>V2.5.7</td>
                                <td>运行时间</td>
                                <td>345天12小时</td>
                                <td>磁盘空间</td>
                                <td>47.5GB/128GB</td>
                            </tr>
                            <tr>
                                <td>IP地址</td>
                                <td>192.168.1.100</td>
                                <td>MAC地址</td>
                                <td>00:1B:44:11:3A:B7</td>
                                <td>上次重启</td>
                                <td>2023-05-12 08:30:15</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- 模块状态 -->
                    <div class="data-section">
                        <div class="section-title">模块状态</div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>模块名称</th>
                                    <th>状态</th>
                                    <th>最后通信</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>数据采集模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:22</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>通信管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:25</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>控制策略模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:20</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                                <tr>
                                    <td>告警管理模块</td>
                                    <td class="status-normal">正常</td>
                                    <td>2023-11-15 14:30:18</td>
                                    <td><button class="small-btn">查看</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 性能监控 -->
                    <div class="data-section">
                        <div class="section-title">性能监控</div>
                        <div class="performance-charts">
                            <div class="chart-placeholder">CPU利用率图表</div>
                            <div class="chart-placeholder">内存使用图表</div>
                            <div class="chart-placeholder">网络流量图表</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 设置设备内容
        deviceContent.innerHTML = controllerContentHtml;
        
        // 添加标签页切换事件
        const tabItems = deviceContent.querySelectorAll('.controller-tab-items .tab-item');
        
        tabItems.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // 移除所有标签的激活状态
                tabItems.forEach(t => t.classList.remove('active'));
                
                // 添加当前标签的激活状态
                this.classList.add('active');
                
                // 获取控制器内容区域
                const controllerContent = deviceContent.querySelector('.controller-content');
                
                // 根据标签索引显示不同内容
                if (index === 0) {
                    // 监视（重新创建监视内容）
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = controllerContentHtml;
                    const monitorContent = tempDiv.querySelector('.controller-monitor-content');
                    controllerContent.innerHTML = monitorContent ? monitorContent.outerHTML : '';
                } else if (index === 1) {
                    // 控制
                    showControllerControlContent(controllerContent);
                } else if (index === 2) {
                    // 参数配置
                    showControllerConfigContent(controllerContent);
                }
            });
        });
        
        // 添加刷新按钮事件
        const refreshBtn = deviceHeader.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                showDeviceContent(deviceId, true);
                showTooltip('数据已刷新', 'success');
            });
        }
        
        return;
    }
    
    // 常规设备内容
    // 显示加载状态
    showLoadingState();
    
    // 模拟加载延迟
    setTimeout(() => {
        // 获取设备数据
        const deviceData = getDeviceData(deviceId);
        
        // 更新设备界面
        updateDeviceInterface(deviceData);
        
        // 隐藏加载状态
        hideLoadingState();
        
        // 更新刷新时间
        updateRefreshTime();
        
        // 添加刷新按钮事件
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDeviceData(deviceId, true);
            });
        }
    }, 500);
}

/**
 * 显示本地控制器控制内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerControlContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器控制内容');
    
    // 设置控制内容
    const controlHTML = `
        <div class="controller-control-content">
            <div class="section-title">
                <i class="bi bi-sliders"></i>
                控制面板
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">系统控制</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">系统模式:</span>
                            <div class="control-action">
                                <select class="mode-select">
                                    <option value="auto">自动模式</option>
                                    <option value="manual">手动模式</option>
                                    <option value="standby">待机模式</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">系统状态:</span>
                            <div class="control-action">
                                <button class="action-btn start-btn">启动</button>
                                <button class="action-btn stop-btn">停止</button>
                                <button class="action-btn reset-btn">重置</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">通信设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">通信模式:</span>
                            <div class="control-action">
                                <select class="comm-select">
                                    <option value="4g">4G网络</option>
                                    <option value="ethernet">有线网络</option>
                                    <option value="wifi">WiFi网络</option>
                                </select>
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">心跳间隔:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="300"> 秒
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="control-card-row">
                <div class="control-card">
                    <div class="control-header">数据采集设置</div>
                    <div class="control-body">
                        <div class="control-row">
                            <span class="control-label">采集周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="5" min="1" max="60"> 秒
                            </div>
                        </div>
                        <div class="control-row">
                            <span class="control-label">上报周期:</span>
                            <div class="control-action">
                                <input type="number" class="param-input" value="60" min="10" max="3600"> 秒
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-header">系统维护</div>
                    <div class="control-body">
                        <div class="control-row">
                            <button class="maintenance-btn">系统升级</button>
                            <button class="maintenance-btn">配置导出</button>
                            <button class="maintenance-btn">日志下载</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = controlHTML;
}

/**
 * 显示本地控制器参数配置内容
 * @param {HTMLElement} container - 容器元素
 */
function showControllerConfigContent(container) {
    if (!container) {
        container = document.getElementById('device-content');
    }
    
    console.log('显示本地控制器参数配置内容');
    
    // 设置参数配置内容
    const configHTML = `
        <div class="controller-config-content">
            <div class="section-title">
                <i class="bi bi-gear"></i>
                参数配置
            </div>
            
            <div class="config-tabs">
                <div class="config-tab active">系统参数</div>
                <div class="config-tab">通信参数</div>
                <div class="config-tab">控制参数</div>
                <div class="config-tab">告警参数</div>
            </div>
            
            <div class="config-panel active">
                <div class="config-card">
                    <div class="config-header">基本参数</div>
                    <div class="config-body">
                        <table class="config-table">
                            <tr>
                                <td>设备ID</td>
                                <td><input type="text" class="config-input" value="LC-2023-1015-0023"></td>
                                <td>设备名称</td>
                                <td><input type="text" class="config-input" value="本地控制器1"></td>
                            </tr>
                            <tr>
                                <td>时区设置</td>
                                <td>
                                    <select class="config-select">
                                        <option value="GMT+8">GMT+8 (北京时间)</option>
                                        <option value="GMT+0">GMT+0</option>
                                        <option value="GMT-5">GMT-5</option>
                                    </select>
                                </td>
                                <td>系统语言</td>
                                <td>
                                    <select class="config-select">
                                        <option value="zh-CN">简体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>数据保存天数</td>
                                <td><input type="number" class="config-input" value="90" min="1" max="365"></td>
                                <td>日志级别</td>
                                <td>
                                    <select class="config-select">
                                        <option value="error">错误</option>
                                        <option value="warning">警告</option>
                                        <option value="info" selected>信息</option>
                                        <option value="debug">调试</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                        <div class="config-buttons">
                            <button class="save-btn">保存</button>
                            <button class="default-btn">恢复默认</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新当前内容区域
    container.innerHTML = configHTML;
    
    // 添加配置标签页切换事件
    const configTabs = container.querySelectorAll('.config-tab');
    const configPanels = container.querySelectorAll('.config-panel');
    
    configTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的活动状态
            configTabs.forEach(t => t.classList.remove('active'));
            configPanels.forEach(p => p.classList.remove('active'));
            
            // 添加当前标签页的活动状态
            this.classList.add('active');
            if (configPanels[index]) {
                configPanels[index].classList.add('active');
            }
        });
    });
} 
 
 