/**
 * 设备监控页面JS
 * 用于实现设备监控页面的交互功能
 */

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化设备树
    initDeviceTree();
    
    // 初始化侧边栏折叠功能
    initSidebarToggle();
    
    // 从URL获取设备ID并显示对应设备
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    if (deviceId) {
        showDeviceContent(deviceId);
    }
    
    // 初始化操作日志模态框
    initOperationLogModal();
});

/**
 * 设备树数据 - 模拟数据
 */
const deviceTreeData = [
    {
        id: 'ems',
        name: 'EMS',
        icon: 'bi-cpu',
        children: []
    },
    {
        id: 'storage1',
        name: '1#储能系统',
        icon: 'bi-battery-half',
        children: [
            {
                id: 'storage1-controller',
                name: '本地控制器',
                icon: 'bi-sliders'
            },
            {
                id: 'storage1-bms',
                name: 'BMS',
                icon: 'bi-battery-charging'
            },
            {
                id: 'storage1-pcs',
                name: 'PCS',
                icon: 'bi-lightning-charge'
            },
            {
                id: 'storage1-thermal',
                name: '热管理',
                icon: 'bi-thermometer-half'
            },
            {
                id: 'storage1-fire',
                name: '消防系统',
                icon: 'bi-fire'
            },
            {
                id: 'storage1-env',
                name: '动环检测',
                icon: 'bi-activity'
            },
            {
                id: 'storage1-electrical',
                name: '电气系统',
                icon: 'bi-plug'
            }
        ]
    },
    {
        id: 'storage2',
        name: '2#储能系统',
        icon: 'bi-battery-half',
        children: [
            {
                id: 'storage2-controller',
                name: '本地控制器',
                icon: 'bi-sliders'
            },
            {
                id: 'storage2-bms',
                name: 'BMS',
                icon: 'bi-battery-charging'
            },
            {
                id: 'storage2-pcs',
                name: 'PCS',
                icon: 'bi-lightning-charge'
            },
            {
                id: 'storage2-thermal',
                name: '热管理',
                icon: 'bi-thermometer-half'
            },
            {
                id: 'storage2-fire',
                name: '消防系统',
                icon: 'bi-fire'
            },
            {
                id: 'storage2-env',
                name: '动环检测',
                icon: 'bi-activity'
            },
            {
                id: 'storage2-electrical',
                name: '电气系统',
                icon: 'bi-plug'
            }
        ]
    },
    {
        id: 'storage3',
        name: '3#储能系统',
        icon: 'bi-battery-half',
        children: [
            {
                id: 'storage3-controller',
                name: '本地控制器',
                icon: 'bi-sliders'
            },
            {
                id: 'storage3-bms',
                name: 'BMS',
                icon: 'bi-battery-charging'
            },
            {
                id: 'storage3-pcs',
                name: 'PCS',
                icon: 'bi-lightning-charge'
            },
            {
                id: 'storage3-thermal',
                name: '热管理',
                icon: 'bi-thermometer-half'
            },
            {
                id: 'storage3-fire',
                name: '消防系统',
                icon: 'bi-fire'
            },
            {
                id: 'storage3-env',
                name: '动环检测',
                icon: 'bi-activity'
            },
            {
                id: 'storage3-electrical',
                name: '电气系统',
                icon: 'bi-plug'
            }
        ]
    }
];

/**
 * 设备状态数据 - 用于记录上次查看的状态
 */
const deviceViewState = {
    // 记录当前查看的设备ID
    currentDeviceId: null,
    // 记录每个设备的标签页状态
    tabState: {},
    // 记录每个电池簇的查看状态
    batteryClusterState: {
        'storage1-bms': '1', // 默认查看1#电池簇
        'storage2-bms': '1',
        'storage3-bms': '1'
    }
};

/**
 * 初始化设备树
 * 生成设备列表树形结构
 */
function initDeviceTree() {
    const deviceTreeElement = document.getElementById('deviceTree');
    if (!deviceTreeElement) return;
    
    // 清空现有内容
    deviceTreeElement.innerHTML = '';
    
    // 创建设备树HTML
    deviceTreeData.forEach(device => {
        const deviceItem = document.createElement('li');
        deviceItem.className = 'device-tree-item';
        
        // 设备父级
        const deviceParent = document.createElement('div');
        deviceParent.className = 'device-tree-parent';
        deviceParent.setAttribute('data-device-id', device.id);
        deviceParent.innerHTML = `
            <i class="bi ${device.icon} device-tree-icon"></i>
            <span>${device.name}</span>
            ${device.children.length > 0 ? '<i class="bi bi-chevron-right device-tree-toggle"></i>' : ''}
        `;
        
        deviceItem.appendChild(deviceParent);
        
        // 添加点击事件 - 展开/收起子设备
        if (device.children.length > 0) {
            deviceParent.addEventListener('click', function(e) {
                const toggle = this.querySelector('.device-tree-toggle');
                const childrenList = this.nextElementSibling;
                
                // 切换展开/收起状态
                toggle.classList.toggle('open');
                childrenList.classList.toggle('open');
                
                // 阻止事件冒泡，防止触发子设备点击
                e.stopPropagation();
            });
        }
        
        // 添加设备点击事件 - 显示设备内容
        deviceParent.addEventListener('click', function() {
            // 移除所有设备项的激活状态
            document.querySelectorAll('.device-tree-parent, .device-tree-child').forEach(item => {
                item.classList.remove('active');
            });
            
            // 激活当前设备项
            this.classList.add('active');
            
            // 显示对应设备内容
            const deviceId = this.getAttribute('data-device-id');
            showDeviceContent(deviceId);
            
            // 更新URL
            updateUrl(deviceId);
        });
        
        // 如果有子设备，创建子设备列表
        if (device.children.length > 0) {
            const childrenList = document.createElement('ul');
            childrenList.className = 'device-tree-children';
            
            device.children.forEach(child => {
                const childItem = document.createElement('li');
                const childLink = document.createElement('div');
                childLink.className = 'device-tree-child';
                childLink.setAttribute('data-device-id', child.id);
                childLink.innerHTML = `
                    <i class="bi ${child.icon} device-tree-icon"></i>
                    <span>${child.name}</span>
                `;
                
                // 添加子设备点击事件
                childLink.addEventListener('click', function(e) {
                    // 移除所有设备项的激活状态
                    document.querySelectorAll('.device-tree-parent, .device-tree-child').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // 激活当前子设备项
                    this.classList.add('active');
                    
                    // 显示对应设备内容
                    const deviceId = this.getAttribute('data-device-id');
                    showDeviceContent(deviceId);
                    
                    // 更新URL
                    updateUrl(deviceId);
                    
                    // 阻止事件冒泡
                    e.stopPropagation();
                });
                
                childItem.appendChild(childLink);
                childrenList.appendChild(childItem);
            });
            
            deviceItem.appendChild(childrenList);
        }
        
        deviceTreeElement.appendChild(deviceItem);
    });
}

/**
 * 初始化侧边栏折叠功能
 */
function initSidebarToggle() {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.device-sidebar');
    
    if (!toggleButton || !sidebar) return;
    
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
}

/**
 * 更新URL，记录当前查看的设备
 * @param {string} deviceId 设备ID
 */
function updateUrl(deviceId) {
    const url = new URL(window.location.href);
    url.searchParams.set('deviceId', deviceId);
    window.history.replaceState({}, '', url);
}

/**
 * 初始化操作日志模态框
 */
function initOperationLogModal() {
    const closeBtn = document.getElementById('closeLogModal');
    const modal = document.getElementById('operationLogModal');
    
    if (!closeBtn || !modal) return;
    
    // 关闭模态框
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * 显示操作日志模态框
 */
function showOperationLog() {
    const modal = document.getElementById('operationLogModal');
    
    if (!modal) return;
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 生成模拟日志数据
    generateOperationLog();
}

/**
 * 生成模拟操作日志数据
 */
function generateOperationLog() {
    const logTableBody = document.getElementById('logTableBody');
    
    if (!logTableBody) return;
    
    // 清空现有内容
    logTableBody.innerHTML = '';
    
    // 模拟操作日志数据
    const logs = [
        {
            time: '2023-08-15 14:32:45',
            user: '管理员',
            type: '控制操作',
            content: 'EMS手动启动',
            result: '成功'
        },
        {
            time: '2023-08-15 13:15:22',
            user: '操作员A',
            type: '参数配置',
            content: '修改功率限制参数：5000 -> 4500',
            result: '成功'
        },
        {
            time: '2023-08-14 09:58:11',
            user: '管理员',
            type: '控制操作',
            content: '切换至并网模式',
            result: '成功'
        },
        {
            time: '2023-08-13 16:45:38',
            user: '操作员B',
            type: '参数配置',
            content: '修改调压参数：220 -> 225',
            result: '失败'
        },
        {
            time: '2023-08-12 11:23:56',
            user: '管理员',
            type: '控制操作',
            content: 'BMS强制均衡指令',
            result: '成功'
        }
    ];
    
    // 生成日志表格行
    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.time}</td>
            <td>${log.user}</td>
            <td>${log.type}</td>
            <td>${log.content}</td>
            <td>${log.result === '成功' ? 
                '<span class="status-normal">成功</span>' : 
                '<span class="status-alarm">失败</span>'}</td>
        `;
        logTableBody.appendChild(row);
    });
}

/**
 * 显示设备内容
 * 根据设备ID显示对应的设备内容
 * @param {string} deviceId 设备ID
 */
function showDeviceContent(deviceId) {
    // 更新当前查看的设备ID
    deviceViewState.currentDeviceId = deviceId;
    
    const contentPlaceholder = document.getElementById('deviceContentPlaceholder');
    const contentArea = document.getElementById('deviceContentArea');
    
    if (!contentPlaceholder || !contentArea) return;
    
    // 显示内容区域，隐藏占位符
    contentPlaceholder.style.display = 'none';
    contentArea.style.display = 'block';
    
    // 清空内容区域
    contentArea.innerHTML = '';
    
    // 根据设备ID加载对应内容
    switch (deviceId) {
        case 'ems':
            loadEMSContent(contentArea);
            break;
        case 'storage1-controller':
        case 'storage2-controller':
        case 'storage3-controller':
            loadControllerContent(contentArea, deviceId);
            break;
        case 'storage1-bms':
        case 'storage2-bms':
        case 'storage3-bms':
            loadBMSContent(contentArea, deviceId);
            break;
        default:
            // 其他设备显示开发中提示
            loadDevInProgressContent(contentArea, deviceId);
            break;
    }
}

/**
 * 加载EMS内容
 * @param {HTMLElement} container 内容容器
 */
function loadEMSContent(container) {
    // 获取之前的标签状态，默认为监视
    const activeTab = deviceViewState.tabState['ems'] || 'monitor';
    
    // 创建标签页
    const tabsHTML = `
        <div class="device-tabs">
            <div class="device-tab ${activeTab === 'monitor' ? 'active' : ''}" data-tab="monitor">监视</div>
            <div class="device-tab ${activeTab === 'control' ? 'active' : ''}" data-tab="control">控制</div>
            <div class="device-tab ${activeTab === 'config' ? 'active' : ''}" data-tab="config">参数配置</div>
        </div>
    `;
    
    // 创建内容区域
    const contentHTML = `
        <div class="device-tab-content" id="monitorContent" style="${activeTab === 'monitor' ? '' : 'display: none;'}">
            ${generateEMSMonitorContent()}
        </div>
        <div class="device-tab-content" id="controlContent" style="${activeTab === 'control' ? '' : 'display: none;'}">
            ${generateEMSControlContent()}
        </div>
        <div class="device-tab-content" id="configContent" style="${activeTab === 'config' ? '' : 'display: none;'}">
            ${generateEMSConfigContent()}
        </div>
    `;
    
    // 组合HTML
    container.innerHTML = tabsHTML + contentHTML;
    
    // 添加标签页切换事件
    const tabs = container.querySelectorAll('.device-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 激活当前标签页
            this.classList.add('active');
            
            // 获取标签页名称
            const tabName = this.getAttribute('data-tab');
            
            // 记录标签页状态
            deviceViewState.tabState['ems'] = tabName;
            
            // 显示对应内容
            container.querySelectorAll('.device-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(tabName + 'Content').style.display = 'block';
        });
    });
    
    // 初始化EMS监视图表
    if (activeTab === 'monitor') {
        initEMSCharts();
    }
}

/**
 * 生成EMS监视内容
 * @returns {string} EMS监视内容的HTML
 */
function generateEMSMonitorContent() {
    return `
        <!-- 重要信息卡片 -->
        <div class="info-card-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-power"></i>
                    </div>
                    <h3 class="info-card-title">EMS运行状态</h3>
                </div>
                <div class="info-card-value online">运行中</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-reception-4"></i>
                    </div>
                    <h3 class="info-card-title">在线状态</h3>
                </div>
                <div class="info-card-value online">在线</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <h3 class="info-card-title">告警总数</h3>
                </div>
                <div class="info-card-value">2</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-x-octagon"></i>
                    </div>
                    <h3 class="info-card-title">故障总数</h3>
                </div>
                <div class="info-card-value">0</div>
            </div>
        </div>
        
        <!-- 重要趋势图 -->
        <div class="chart-section">
            <div class="chart-section-title">
                下网功率曲线
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="downstreamPowerChart"></div>
        </div>
        
        <div class="chart-section">
            <div class="chart-section-title">
                并网点功率曲线
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="gridPowerChart"></div>
        </div>
        
        <!-- 遥测点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">遥测点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>点位名称</th>
                        <th>数值</th>
                        <th>单位</th>
                        <th>更新时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>电网电压</td>
                        <td>380.5</td>
                        <td>V</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>电网频率</td>
                        <td>50.02</td>
                        <td>Hz</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>有功功率</td>
                        <td>2150.8</td>
                        <td>kW</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>无功功率</td>
                        <td>126.3</td>
                        <td>kVar</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>系统SOC</td>
                        <td>75.8</td>
                        <td>%</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 状态点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">状态点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>点位名称</th>
                        <th>状态</th>
                        <th>更新时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>系统运行状态</td>
                        <td class="online">运行中</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>PCS联机状态</td>
                        <td class="online">联机</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>BMS联机状态</td>
                        <td class="online">联机</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>运行模式</td>
                        <td>调频模式</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>电网连接状态</td>
                        <td class="online">并网</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 告警点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">告警点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>告警名称</th>
                        <th>告警级别</th>
                        <th>触发时间</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>电网电压偏高</td>
                        <td class="status-warn">警告</td>
                        <td>2023-08-15 14:45:22</td>
                        <td class="status-alarm">未恢复</td>
                    </tr>
                    <tr>
                        <td>通信延迟过高</td>
                        <td class="status-warn">警告</td>
                        <td>2023-08-15 13:12:08</td>
                        <td class="status-alarm">未恢复</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

/**
 * 生成EMS控制内容
 * @returns {string} EMS控制内容的HTML
 */
function generateEMSControlContent() {
    return `
        <div class="control-section">
            <div class="control-cards">
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-power"></i> 系统控制
                    </div>
                    <div class="control-form-group">
                        <label>当前系统状态:</label>
                        <span class="status online">运行中</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('系统启动', '确认启动系统？')">启动</button>
                        <button class="control-btn" onclick="showConfirmDialog('系统停止', '确认停止系统？')">停止</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-sliders"></i> 运行模式控制
                    </div>
                    <div class="control-form-group">
                        <label>当前运行模式:</label>
                        <span class="status">调频模式</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至调峰模式？')">调峰模式</button>
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至调频模式？')">调频模式</button>
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至削峰填谷模式？')">削峰填谷</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-arrow-left-right"></i> 并离网切换
                    </div>
                    <div class="control-form-group">
                        <label>当前电网连接:</label>
                        <span class="status online">并网</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('并网操作', '确认执行并网操作？')">并网</button>
                        <button class="control-btn" onclick="showConfirmDialog('离网操作', '确认执行离网操作？')">离网</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-lightning-charge"></i> 功率控制
                    </div>
                    <div class="control-form-group">
                        <label>当前功率设定:</label>
                        <span class="status">2000 kW</span>
                    </div>
                    <div class="control-form-group">
                        <label for="powerSetting">新功率设定 (kW):</label>
                        <input type="number" id="powerSetting" min="0" max="5000" step="50" value="2000">
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('功率设定', '确认更新功率设定？')">设定</button>
                        <button class="control-btn secondary" onclick="resetPowerSetting()">重置</button>
                    </div>
                </div>
            </div>
            
            <div style="text-align: right; margin-top: 20px;">
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 生成EMS参数配置内容
 * @returns {string} EMS参数配置内容的HTML
 */
function generateEMSConfigContent() {
    return `
        <div class="param-config-form">
            <div class="data-table-section">
                <div class="data-table-section-title">参数配置列表</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>参数名称</th>
                            <th>当前值</th>
                            <th>单位</th>
                            <th>计划修改值</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>最大充电功率</td>
                            <td>2500</td>
                            <td>kW</td>
                            <td>
                                <input type="number" class="param-input" value="2500" min="0" max="5000">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改最大充电功率？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>最大放电功率</td>
                            <td>2500</td>
                            <td>kW</td>
                            <td>
                                <input type="number" class="param-input" value="2500" min="0" max="5000">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改最大放电功率？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>SOC上限</td>
                            <td>95</td>
                            <td>%</td>
                            <td>
                                <input type="number" class="param-input" value="95" min="0" max="100">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改SOC上限？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>SOC下限</td>
                            <td>10</td>
                            <td>%</td>
                            <td>
                                <input type="number" class="param-input" value="10" min="0" max="100">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改SOC下限？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>并网电压阈值</td>
                            <td>380</td>
                            <td>V</td>
                            <td>
                                <input type="number" class="param-input" value="380" min="350" max="430">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改并网电压阈值？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>并网频率阈值</td>
                            <td>50</td>
                            <td>Hz</td>
                            <td>
                                <input type="number" class="param-input" value="50" min="49" max="51" step="0.1">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改并网频率阈值？')">保存</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="param-config-actions">
                <button class="control-btn" onclick="showConfirmDialog('批量保存', '确认保存所有修改参数？')">批量保存</button>
                <button class="control-btn secondary" onclick="resetConfigForm()">重置全部</button>
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 加载本地控制器内容
 * @param {HTMLElement} container 内容容器
 * @param {string} deviceId 设备ID
 */
function loadControllerContent(container, deviceId) {
    // 类似EMS内容的结构，根据设备ID提取储能系统编号
    const systemNumber = deviceId.split('-')[0].replace('storage', '');
    
    // 获取之前的标签状态，默认为监视
    const activeTab = deviceViewState.tabState[deviceId] || 'monitor';
    
    // 创建标签页
    const tabsHTML = `
        <div class="device-tabs">
            <div class="device-tab ${activeTab === 'monitor' ? 'active' : ''}" data-tab="monitor">监视</div>
            <div class="device-tab ${activeTab === 'control' ? 'active' : ''}" data-tab="control">控制</div>
            <div class="device-tab ${activeTab === 'config' ? 'active' : ''}" data-tab="config">参数配置</div>
        </div>
    `;
    
    // 创建内容区域 - 类似EMS但针对本地控制器
    const contentHTML = `
        <div class="device-tab-content" id="monitorContent" style="${activeTab === 'monitor' ? '' : 'display: none;'}">
            ${generateControllerMonitorContent(systemNumber)}
        </div>
        <div class="device-tab-content" id="controlContent" style="${activeTab === 'control' ? '' : 'display: none;'}">
            ${generateControllerControlContent(systemNumber)}
        </div>
        <div class="device-tab-content" id="configContent" style="${activeTab === 'config' ? '' : 'display: none;'}">
            ${generateControllerConfigContent(systemNumber)}
        </div>
    `;
    
    // 组合HTML
    container.innerHTML = tabsHTML + contentHTML;
    
    // 添加标签页切换事件
    const tabs = container.querySelectorAll('.device-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 激活当前标签页
            this.classList.add('active');
            
            // 获取标签页名称
            const tabName = this.getAttribute('data-tab');
            
            // 记录标签页状态
            deviceViewState.tabState[deviceId] = tabName;
            
            // 显示对应内容
            container.querySelectorAll('.device-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(tabName + 'Content').style.display = 'block';
            
            // 如果是监视标签，初始化图表
            if (tabName === 'monitor') {
                initControllerCharts(systemNumber);
            }
        });
    });
    
    // 初始化控制器监视图表
    if (activeTab === 'monitor') {
        initControllerCharts(systemNumber);
    }
}

/**
 * 生成控制器监视内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} 控制器监视内容HTML
 */
function generateControllerMonitorContent(systemNumber) {
    return `
        <!-- 重要信息卡片 -->
        <div class="info-card-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-power"></i>
                    </div>
                    <h3 class="info-card-title">控制器运行状态</h3>
                </div>
                <div class="info-card-value online">运行中</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-reception-4"></i>
                    </div>
                    <h3 class="info-card-title">在线状态</h3>
                </div>
                <div class="info-card-value online">在线</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <h3 class="info-card-title">告警总数</h3>
                </div>
                <div class="info-card-value">1</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-x-octagon"></i>
                    </div>
                    <h3 class="info-card-title">故障总数</h3>
                </div>
                <div class="info-card-value">0</div>
            </div>
        </div>
        
        <!-- 重要趋势图 -->
        <div class="chart-section">
            <div class="chart-section-title">
                ${systemNumber}#储能系统功率曲线
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="systemPowerChart"></div>
        </div>
        
        <!-- 遥测点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">遥测点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>点位名称</th>
                        <th>数值</th>
                        <th>单位</th>
                        <th>更新时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${systemNumber}#系统电压</td>
                        <td>785.5</td>
                        <td>V</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#系统电流</td>
                        <td>258.7</td>
                        <td>A</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#系统功率</td>
                        <td>860.5</td>
                        <td>kW</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#系统SOC</td>
                        <td>78.3</td>
                        <td>%</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 状态点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">状态点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>点位名称</th>
                        <th>状态</th>
                        <th>更新时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${systemNumber}#控制器状态</td>
                        <td class="online">运行中</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#PCS连接状态</td>
                        <td class="online">已连接</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#BMS连接状态</td>
                        <td class="online">已连接</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                    <tr>
                        <td>${systemNumber}#运行模式</td>
                        <td>恒功率模式</td>
                        <td>2023-08-15 15:30:45</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 告警点位信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">告警点位信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>告警名称</th>
                        <th>告警级别</th>
                        <th>触发时间</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${systemNumber}#控制器通信延迟</td>
                        <td class="status-warn">警告</td>
                        <td>2023-08-15 14:12:08</td>
                        <td class="status-alarm">未恢复</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

/**
 * 生成控制器控制内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} 控制器控制内容HTML
 */
function generateControllerControlContent(systemNumber) {
    return `
        <div class="control-section">
            <div class="control-cards">
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-power"></i> ${systemNumber}#系统控制
                    </div>
                    <div class="control-form-group">
                        <label>当前系统状态:</label>
                        <span class="status online">运行中</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('系统启动', '确认启动${systemNumber}#系统？')">启动</button>
                        <button class="control-btn" onclick="showConfirmDialog('系统停止', '确认停止${systemNumber}#系统？')">停止</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-sliders"></i> ${systemNumber}#运行模式控制
                    </div>
                    <div class="control-form-group">
                        <label>当前运行模式:</label>
                        <span class="status">恒功率模式</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至恒功率模式？')">恒功率</button>
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至恒流模式？')">恒流</button>
                        <button class="control-btn" onclick="showConfirmDialog('模式切换', '确认切换至恒压模式？')">恒压</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-lightning-charge"></i> ${systemNumber}#功率控制
                    </div>
                    <div class="control-form-group">
                        <label>当前功率设定:</label>
                        <span class="status">800 kW</span>
                    </div>
                    <div class="control-form-group">
                        <label for="powerSetting${systemNumber}">新功率设定 (kW):</label>
                        <input type="number" id="powerSetting${systemNumber}" min="0" max="1000" step="10" value="800">
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('功率设定', '确认更新${systemNumber}#功率设定？')">设定</button>
                        <button class="control-btn secondary">重置</button>
                    </div>
                </div>
            </div>
            
            <div style="text-align: right; margin-top: 20px;">
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 生成控制器参数配置内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} 控制器参数配置内容HTML
 */
function generateControllerConfigContent(systemNumber) {
    return `
        <div class="param-config-form">
            <div class="data-table-section">
                <div class="data-table-section-title">${systemNumber}#参数配置列表</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>参数名称</th>
                            <th>当前值</th>
                            <th>单位</th>
                            <th>计划修改值</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${systemNumber}#最大功率</td>
                            <td>1000</td>
                            <td>kW</td>
                            <td>
                                <input type="number" class="param-input" value="1000" min="0" max="2000">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改${systemNumber}#最大功率？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>${systemNumber}#电池SOC上限</td>
                            <td>95</td>
                            <td>%</td>
                            <td>
                                <input type="number" class="param-input" value="95" min="0" max="100">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改${systemNumber}#SOC上限？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>${systemNumber}#电池SOC下限</td>
                            <td>10</td>
                            <td>%</td>
                            <td>
                                <input type="number" class="param-input" value="10" min="0" max="100">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改${systemNumber}#SOC下限？')">保存</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="param-config-actions">
                <button class="control-btn" onclick="showConfirmDialog('批量保存', '确认保存所有修改参数？')">批量保存</button>
                <button class="control-btn secondary">重置全部</button>
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 加载BMS内容
 * @param {HTMLElement} container 内容容器
 * @param {string} deviceId 设备ID
 */
function loadBMSContent(container, deviceId) {
    // 提取储能系统编号
    const systemNumber = deviceId.split('-')[0].replace('storage', '');
    
    // 获取之前的标签状态，默认为监视
    const activeTab = deviceViewState.tabState[deviceId] || 'monitor';
    
    // 创建标签页
    const tabsHTML = `
        <div class="device-tabs">
            <div class="device-tab ${activeTab === 'monitor' ? 'active' : ''}" data-tab="monitor">监视</div>
            <div class="device-tab ${activeTab === 'control' ? 'active' : ''}" data-tab="control">控制</div>
            <div class="device-tab ${activeTab === 'config' ? 'active' : ''}" data-tab="config">参数配置</div>
        </div>
    `;
    
    // 获取电池簇查看状态，默认为显示电池堆
    const clusterState = deviceViewState.batteryClusterState[deviceId] || 'heap';
    
    // 创建内容区域
    const contentHTML = `
        <div class="device-tab-content" id="monitorContent" style="${activeTab === 'monitor' ? '' : 'display: none;'}">
            ${clusterState === 'heap' ? 
                generateBMSHeapContent(systemNumber) : 
                generateBMSClusterContent(systemNumber, clusterState)}
        </div>
        <div class="device-tab-content" id="controlContent" style="${activeTab === 'control' ? '' : 'display: none;'}">
            ${generateBMSControlContent(systemNumber)}
        </div>
        <div class="device-tab-content" id="configContent" style="${activeTab === 'config' ? '' : 'display: none;'}">
            ${generateBMSConfigContent(systemNumber)}
        </div>
    `;
    
    // 组合HTML
    container.innerHTML = tabsHTML + contentHTML;
    
    // 添加标签页切换事件
    const tabs = container.querySelectorAll('.device-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 激活当前标签页
            this.classList.add('active');
            
            // 获取标签页名称
            const tabName = this.getAttribute('data-tab');
            
            // 记录标签页状态
            deviceViewState.tabState[deviceId] = tabName;
            
            // 显示对应内容
            container.querySelectorAll('.device-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(tabName + 'Content').style.display = 'block';
            
            // 如果是监视标签，初始化图表
            if (tabName === 'monitor') {
                initBMSCharts(systemNumber, clusterState);
            }
        });
    });
    
    // 添加电池簇切换事件
    if (activeTab === 'monitor') {
        // 初始化电池簇切换按钮
        const clusterBtns = container.querySelectorAll('.cluster-switch-btn');
        if (clusterBtns.length > 0) {
            clusterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // 获取簇ID
                    const clusterId = this.getAttribute('data-cluster-id');
                    
                    // 更新簇状态
                    deviceViewState.batteryClusterState[deviceId] = clusterId;
                    
                    // 重新加载BMS内容
                    loadBMSContent(container, deviceId);
                });
            });
        }
        
        // 初始化图表
        initBMSCharts(systemNumber, clusterState);
    }
}

/**
 * 生成BMS电池堆内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} BMS电池堆内容HTML
 */
function generateBMSHeapContent(systemNumber) {
    return `
        <div class="info-card-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-reception-4"></i>
                    </div>
                    <h3 class="info-card-title">在线状态</h3>
                </div>
                <div class="info-card-value online">在线</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <h3 class="info-card-title">告警状态</h3>
                </div>
                <div class="info-card-value">正常</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-plug"></i>
                    </div>
                    <h3 class="info-card-title">接触器状态</h3>
                </div>
                <div class="info-card-value online">闭合</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-battery-charging"></i>
                    </div>
                    <h3 class="info-card-title">充放电状态</h3>
                </div>
                <div class="info-card-value">充电</div>
            </div>
        </div>
        
        <!-- 电池堆信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">电池堆信息</div>
            <table class="data-table">
                <tbody>
                    <tr>
                        <td width="25%">电池容量 (kWh)</td>
                        <td width="25%">221</td>
                        <td width="25%">电池类型</td>
                        <td width="25%">磷酸铁锂</td>
                    </tr>
                    <tr>
                        <td>电池簇数量</td>
                        <td>3</td>
                        <td>单体数目</td>
                        <td>156</td>
                    </tr>
                    <tr>
                        <td>日充电电量 (kWh)</td>
                        <td>120.5</td>
                        <td>日放电电量 (kWh)</td>
                        <td>105.3</td>
                    </tr>
                    <tr>
                        <td>累计充电电量 (MWh)</td>
                        <td>350.8</td>
                        <td>累计放电电量 (MWh)</td>
                        <td>318.4</td>
                    </tr>
                    <tr>
                        <td>电池总电流 (A)</td>
                        <td>142.6</td>
                        <td>电池堆绝缘电阻 (MΩ)</td>
                        <td>5.2</td>
                    </tr>
                    <tr>
                        <td>单体最高电压 (mV)</td>
                        <td>3452</td>
                        <td>单体最低电压 (mV)</td>
                        <td>3412</td>
                    </tr>
                    <tr>
                        <td>单体最高电压簇号</td>
                        <td>1#簇</td>
                        <td>单体最低电压簇号</td>
                        <td>3#簇</td>
                    </tr>
                    <tr>
                        <td>单体最高温度 (℃)</td>
                        <td>32.5</td>
                        <td>单体最低温度 (℃)</td>
                        <td>28.2</td>
                    </tr>
                    <tr>
                        <td>最高温度簇号</td>
                        <td>2#簇</td>
                        <td>最低温度簇号</td>
                        <td>1#簇</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 电池簇信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">电池簇信息</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>电池簇</th>
                        <th>簇电压 (V)</th>
                        <th>簇电流 (A)</th>
                        <th>簇SOC (%)</th>
                        <th>单体最高电压 (mV)</th>
                        <th>单体最低电压 (mV)</th>
                        <th>单体最高温度 (℃)</th>
                        <th>单体最低温度 (℃)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><a href="#" class="cluster-link" data-cluster-id="1">1#电池簇</a></td>
                        <td>124.6</td>
                        <td>47.5</td>
                        <td>78.2</td>
                        <td>3452</td>
                        <td>3422</td>
                        <td>31.2</td>
                        <td>28.2</td>
                    </tr>
                    <tr>
                        <td><a href="#" class="cluster-link" data-cluster-id="2">2#电池簇</a></td>
                        <td>125.2</td>
                        <td>48.3</td>
                        <td>77.8</td>
                        <td>3448</td>
                        <td>3418</td>
                        <td>32.5</td>
                        <td>28.8</td>
                    </tr>
                    <tr>
                        <td><a href="#" class="cluster-link" data-cluster-id="3">3#电池簇</a></td>
                        <td>124.8</td>
                        <td>46.8</td>
                        <td>78.5</td>
                        <td>3445</td>
                        <td>3412</td>
                        <td>31.8</td>
                        <td>28.5</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 运行数据图表 -->
        <div class="chart-section">
            <div class="chart-section-title">
                电池堆运行数据
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="batteryHeapChart"></div>
        </div>
        
        <!-- 簇电压/SOC图表 -->
        <div class="chart-section">
            <div class="chart-section-title">
                电池簇电压/SOC对比
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="batteryClusterCompareChart"></div>
        </div>
        
        <!-- 电池簇切换按钮 -->
        <div class="battery-cluster-switcher">
            <button class="cluster-switch-btn active" data-cluster-id="heap">电池堆</button>
            <button class="cluster-switch-btn" data-cluster-id="1">1#电池簇</button>
            <button class="cluster-switch-btn" data-cluster-id="2">2#电池簇</button>
            <button class="cluster-switch-btn" data-cluster-id="3">3#电池簇</button>
        </div>
    `;
}

/**
 * 生成BMS电池簇内容
 * @param {string} systemNumber 储能系统编号
 * @param {string} clusterId 电池簇ID
 * @returns {string} BMS电池簇内容HTML
 */
function generateBMSClusterContent(systemNumber, clusterId) {
    return `
        <!-- 电池簇切换 -->
        <div class="battery-cluster-switcher">
            <button class="cluster-switch-btn" data-cluster-id="heap">电池堆</button>
            <button class="cluster-switch-btn ${clusterId === '1' ? 'active' : ''}" data-cluster-id="1">1#电池簇</button>
            <button class="cluster-switch-btn ${clusterId === '2' ? 'active' : ''}" data-cluster-id="2">2#电池簇</button>
            <button class="cluster-switch-btn ${clusterId === '3' ? 'active' : ''}" data-cluster-id="3">3#电池簇</button>
        </div>
        
        <!-- 重要信息 -->
        <div class="info-card-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-reception-4"></i>
                    </div>
                    <h3 class="info-card-title">在线状态</h3>
                </div>
                <div class="info-card-value online">在线</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-battery-charging"></i>
                    </div>
                    <h3 class="info-card-title">充放电状态</h3>
                </div>
                <div class="info-card-value">充电</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <h3 class="info-card-title">告警状态</h3>
                </div>
                <div class="info-card-value">无</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-lightning-charge"></i>
                    </div>
                    <h3 class="info-card-title">总电压</h3>
                </div>
                <div class="info-card-value">124.6 V</div>
            </div>
        </div>
        
        <div class="info-card-grid">
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-lightning"></i>
                    </div>
                    <h3 class="info-card-title">总电流</h3>
                </div>
                <div class="info-card-value">47.5 A</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-thermometer-half"></i>
                    </div>
                    <h3 class="info-card-title">平均温度</h3>
                </div>
                <div class="info-card-value">29.8 ℃</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-pie-chart"></i>
                    </div>
                    <h3 class="info-card-title">SOC</h3>
                </div>
                <div class="info-card-value">78.2 %</div>
            </div>
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <h3 class="info-card-title">绝缘电阻</h3>
                </div>
                <div class="info-card-value">5.2 MΩ</div>
            </div>
        </div>
        
        <!-- 充放电信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">充放电信息</div>
            <table class="data-table">
                <tbody>
                    <tr>
                        <td width="25%">日充电量</td>
                        <td width="25%">42.3 kWh</td>
                        <td width="25%">日放电量</td>
                        <td width="25%">38.1 kWh</td>
                    </tr>
                    <tr>
                        <td>累计充电电量</td>
                        <td>118.6 MWh</td>
                        <td>累计放电电量</td>
                        <td>108.2 MWh</td>
                    </tr>
                    <tr>
                        <td>可充电电量</td>
                        <td>48.2 kWh</td>
                        <td>可放电电量</td>
                        <td>172.8 kWh</td>
                    </tr>
                    <tr>
                        <td>最大充电电流</td>
                        <td>120 A</td>
                        <td>最大放电电流</td>
                        <td>120 A</td>
                    </tr>
                    <tr>
                        <td>最大充电功率</td>
                        <td>850 kW</td>
                        <td>最大放电功率</td>
                        <td>850 kW</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 单体信息 -->
        <div class="data-table-section">
            <div class="data-table-section-title">单体极值信息</div>
            <table class="data-table">
                <tbody>
                    <tr>
                        <td width="25%">最高电芯温度</td>
                        <td width="25%" class="status-alarm">31.2 ℃</td>
                        <td width="25%">最高温度单体号</td>
                        <td width="25%">12</td>
                    </tr>
                    <tr>
                        <td>最低电芯温度</td>
                        <td class="status-warn">28.2 ℃</td>
                        <td>最低温度单体号</td>
                        <td>48</td>
                    </tr>
                    <tr>
                        <td>最高电芯电压</td>
                        <td class="status-alarm">3452 mV</td>
                        <td>最高电压单体号</td>
                        <td>5</td>
                    </tr>
                    <tr>
                        <td>最低电芯电压</td>
                        <td class="status-warn">3422 mV</td>
                        <td>最低电压单体号</td>
                        <td>32</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 单体电芯示意图 -->
        <div class="data-table-section">
            <div class="data-table-section-title">单体电芯信息</div>
            <div class="battery-chart-legend">
                <div class="legend-item">
                    <span class="legend-color highest-voltage"></span>
                    <span>最高电压</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color lowest-voltage"></span>
                    <span>最低电压</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color highest-temp"></span>
                    <span>最高温度</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color lowest-temp"></span>
                    <span>最低温度</span>
                </div>
            </div>
            
            <div class="battery-cells-grid">
                ${generateBatteryCells(52, clusterId)}
            </div>
        </div>
        
        <!-- 单体柱状图 -->
        <div class="chart-section">
            <div class="chart-section-title">
                单体电压柱状图
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="cellVoltageChart"></div>
        </div>
        
        <div class="chart-section">
            <div class="chart-section-title">
                单体温度柱状图
                <div class="chart-section-actions">
                    <button class="chart-action-btn"><i class="bi bi-zoom-in"></i> 放大</button>
                    <button class="chart-action-btn"><i class="bi bi-download"></i> 导出</button>
                </div>
            </div>
            <div class="chart-container" id="cellTempChart"></div>
        </div>
    `;
}

/**
 * 生成电池单体单元格HTML
 * @param {number} count 单体数量
 * @param {string} clusterId 电池簇ID
 * @returns {string} 电池单体单元格HTML
 */
function generateBatteryCells(count, clusterId) {
    let html = '';
    
    // 根据电池簇ID设置不同的最高/最低值单体号
    let highestVoltageCell, lowestVoltageCell, highestTempCell, lowestTempCell;
    
    switch(clusterId) {
        case '1':
            highestVoltageCell = 5;
            lowestVoltageCell = 32;
            highestTempCell = 12;
            lowestTempCell = 48;
            break;
        case '2':
            highestVoltageCell = 8;
            lowestVoltageCell = 28;
            highestTempCell = 15;
            lowestTempCell = 42;
            break;
        case '3':
            highestVoltageCell = 3;
            lowestVoltageCell = 36;
            highestTempCell = 10;
            lowestTempCell = 45;
            break;
        default:
            highestVoltageCell = 5;
            lowestVoltageCell = 32;
            highestTempCell = 12;
            lowestTempCell = 48;
    }
    
    for (let i = 1; i <= count; i++) {
        // 生成随机的但固定的电压和温度值
        const seed = i * 10 + parseInt(clusterId);
        let voltage = 3420 + (seed % 40);
        let temp = 28 + (seed % 5);
        
        // 设置极值单体
        if (i === highestVoltageCell) {
            voltage = 3452;
            html += `
                <div class="battery-cell highest-voltage">
                    <div class="battery-cell-id">${i}#单体</div>
                    <div class="battery-cell-value">${voltage} mV</div>
                    <div class="battery-cell-value">${temp.toFixed(1)} ℃</div>
                </div>
            `;
        } else if (i === lowestVoltageCell) {
            voltage = 3412;
            html += `
                <div class="battery-cell lowest-voltage">
                    <div class="battery-cell-id">${i}#单体</div>
                    <div class="battery-cell-value">${voltage} mV</div>
                    <div class="battery-cell-value">${temp.toFixed(1)} ℃</div>
                </div>
            `;
        } else if (i === highestTempCell) {
            temp = 32.5;
            html += `
                <div class="battery-cell highest-temp">
                    <div class="battery-cell-id">${i}#单体</div>
                    <div class="battery-cell-value">${voltage} mV</div>
                    <div class="battery-cell-value">${temp.toFixed(1)} ℃</div>
                </div>
            `;
        } else if (i === lowestTempCell) {
            temp = 28.2;
            html += `
                <div class="battery-cell lowest-temp">
                    <div class="battery-cell-id">${i}#单体</div>
                    <div class="battery-cell-value">${voltage} mV</div>
                    <div class="battery-cell-value">${temp.toFixed(1)} ℃</div>
                </div>
            `;
        } else {
            html += `
                <div class="battery-cell">
                    <div class="battery-cell-id">${i}#单体</div>
                    <div class="battery-cell-value">${voltage} mV</div>
                    <div class="battery-cell-value">${temp.toFixed(1)} ℃</div>
                </div>
            `;
        }
    }
    
    return html;
}

/**
 * 生成BMS控制内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} BMS控制内容HTML
 */
function generateBMSControlContent(systemNumber) {
    return `
        <div class="control-section">
            <div class="control-cards">
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-battery-charging"></i> ${systemNumber}#均衡控制
                    </div>
                    <div class="control-form-group">
                        <label>当前均衡状态:</label>
                        <span class="status">未均衡</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('均衡控制', '确认启动${systemNumber}#电池强制均衡？')">启动强制均衡</button>
                        <button class="control-btn" onclick="showConfirmDialog('均衡控制', '确认停止${systemNumber}#电池均衡？')">停止均衡</button>
                    </div>
                </div>
                
                <div class="control-card">
                    <div class="control-card-title">
                        <i class="bi bi-plug"></i> ${systemNumber}#接触器控制
                    </div>
                    <div class="control-form-group">
                        <label>当前接触器状态:</label>
                        <span class="status online">闭合</span>
                    </div>
                    <div class="control-action-btns">
                        <button class="control-btn" onclick="showConfirmDialog('接触器控制', '确认闭合${systemNumber}#电池接触器？')">闭合</button>
                        <button class="control-btn" onclick="showConfirmDialog('接触器控制', '确认断开${systemNumber}#电池接触器？')">断开</button>
                    </div>
                </div>
            </div>
            
            <div style="text-align: right; margin-top: 20px;">
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 生成BMS参数配置内容
 * @param {string} systemNumber 储能系统编号
 * @returns {string} BMS参数配置内容HTML
 */
function generateBMSConfigContent(systemNumber) {
    return `
        <div class="param-config-form">
            <div class="data-table-section">
                <div class="data-table-section-title">${systemNumber}#BMS参数配置列表</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>参数名称</th>
                            <th>当前值</th>
                            <th>单位</th>
                            <th>计划修改值</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>过压保护阈值</td>
                            <td>3650</td>
                            <td>mV</td>
                            <td>
                                <input type="number" class="param-input" value="3650" min="3300" max="3700">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改过压保护阈值？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>欠压保护阈值</td>
                            <td>2800</td>
                            <td>mV</td>
                            <td>
                                <input type="number" class="param-input" value="2800" min="2700" max="3300">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改欠压保护阈值？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>过温保护阈值</td>
                            <td>45</td>
                            <td>℃</td>
                            <td>
                                <input type="number" class="param-input" value="45" min="30" max="60">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改过温保护阈值？')">保存</button>
                            </td>
                        </tr>
                        <tr>
                            <td>低温保护阈值</td>
                            <td>-10</td>
                            <td>℃</td>
                            <td>
                                <input type="number" class="param-input" value="-10" min="-20" max="10">
                            </td>
                            <td>
                                <button class="control-btn" onclick="showConfirmDialog('参数修改', '确认修改低温保护阈值？')">保存</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="param-config-actions">
                <button class="control-btn" onclick="showConfirmDialog('批量保存', '确认保存所有修改参数？')">批量保存</button>
                <button class="control-btn secondary" onclick="resetBMSConfigForm()">重置全部</button>
                <button class="control-btn" onclick="showOperationLog()">
                    <i class="bi bi-clock-history"></i> 操作日志
                </button>
            </div>
        </div>
    `;
}

/**
 * 加载开发中提示内容
 * @param {HTMLElement} container 内容容器
 * @param {string} deviceId 设备ID
 */
function loadDevInProgressContent(container, deviceId) {
    // 从设备ID提取设备名称
    const deviceName = getDeviceNameById(deviceId);
    
    // 创建开发中提示
    container.innerHTML = `
        <div class="device-content-placeholder">
            <div class="empty-state">
                <i class="bi bi-tools"></i>
                <p>${deviceName} 页面正在开发中，敬请等候...</p>
            </div>
        </div>
    `;
}

/**
 * 根据设备ID获取设备名称
 * @param {string} deviceId 设备ID
 * @returns {string} 设备名称
 */
function getDeviceNameById(deviceId) {
    // 遍历设备树找到匹配的设备
    for (const device of deviceTreeData) {
        if (device.id === deviceId) {
            return device.name;
        }
        
        // 检查子设备
        if (device.children && device.children.length > 0) {
            for (const child of device.children) {
                if (child.id === deviceId) {
                    return `${device.name} - ${child.name}`;
                }
            }
        }
    }
    
    return '未知设备';
}

/**
 * 显示确认对话框
 * @param {string} title 对话框标题
 * @param {string} message 对话框消息
 */
function showConfirmDialog(title, message) {
    // 在实际应用中应该显示确认对话框
    // 这里简化为直接显示提示信息
    showTooltip(title, '操作已确认：' + message, 'success');
}

/**
 * 显示全局提示信息
 * @param {string} title 提示标题
 * @param {string} message 提示消息
 * @param {string} type 提示类型 (success, info, warning, error)
 */
function showTooltip(title, message, type = 'info') {
    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = document.querySelector('.tooltip-title');
    const tooltipMessage = document.querySelector('.tooltip-message');
    
    if (!tooltip || !tooltipTitle || !tooltipMessage) return;
    
    // 设置类型样式
    tooltip.className = 'tooltip';
    tooltip.classList.add('tooltip-' + type);
    
    // 设置内容
    tooltipTitle.textContent = title;
    tooltipMessage.textContent = message;
    
    // 显示提示
    tooltip.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 3000);
}

/**
 * 初始化EMS图表
 */
function initEMSCharts() {
    // 初始化下网功率曲线图
    initDownstreamPowerChart();
    
    // 初始化并网点功率曲线图
    initGridPowerChart();
}

/**
 * 初始化下网功率曲线图
 */
function initDownstreamPowerChart() {
    const chartElement = document.getElementById('downstreamPowerChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成模拟数据
    const timeData = generateTimeData(24);
    const powerData = generateRandomData(24, 1500, 3000);
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c} kW'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeData,
            boundaryGap: false,
            axisLabel: {
                formatter: '{value}:00'
            }
        },
        yAxis: {
            type: 'value',
            name: '功率 (kW)',
            axisLabel: {
                formatter: '{value} kW'
            }
        },
        series: [
            {
                name: '下网功率',
                type: 'line',
                data: powerData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 3,
                    color: '#1890ff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(24, 144, 255, 0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(24, 144, 255, 0.1)'
                        }
                    ])
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化并网点功率曲线图
 */
function initGridPowerChart() {
    const chartElement = document.getElementById('gridPowerChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成模拟数据
    const timeData = generateTimeData(24);
    const powerData = generateRandomData(24, 1200, 2800);
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c} kW'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeData,
            boundaryGap: false,
            axisLabel: {
                formatter: '{value}:00'
            }
        },
        yAxis: {
            type: 'value',
            name: '功率 (kW)',
            axisLabel: {
                formatter: '{value} kW'
            }
        },
        series: [
            {
                name: '并网点功率',
                type: 'line',
                data: powerData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 3,
                    color: '#52c41a'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(82, 196, 26, 0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(82, 196, 26, 0.1)'
                        }
                    ])
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化控制器图表
 * @param {string} systemNumber 储能系统编号
 */
function initControllerCharts(systemNumber) {
    // 初始化系统功率曲线图
    initSystemPowerChart(systemNumber);
}

/**
 * 初始化系统功率曲线图
 * @param {string} systemNumber 储能系统编号
 */
function initSystemPowerChart(systemNumber) {
    const chartElement = document.getElementById('systemPowerChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成模拟数据
    const timeData = generateTimeData(24);
    const powerData = generateRandomData(24, 500, 1000);
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c} kW'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeData,
            boundaryGap: false,
            axisLabel: {
                formatter: '{value}:00'
            }
        },
        yAxis: {
            type: 'value',
            name: '功率 (kW)',
            axisLabel: {
                formatter: '{value} kW'
            }
        },
        series: [
            {
                name: `${systemNumber}#系统功率`,
                type: 'line',
                data: powerData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 3,
                    color: '#722ed1'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(114, 46, 209, 0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(114, 46, 209, 0.1)'
                        }
                    ])
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化BMS图表
 * @param {string} systemNumber 储能系统编号
 * @param {string} clusterState 电池簇状态
 */
function initBMSCharts(systemNumber, clusterState) {
    if (clusterState === 'heap') {
        // 电池堆页面
        initBatteryHeapChart();
        initBatteryClusterCompareChart();
    } else {
        // 电池簇页面
        initCellVoltageChart(clusterState);
        initCellTempChart(clusterState);
    }
}

/**
 * 初始化电池堆运行数据图表
 */
function initBatteryHeapChart() {
    const chartElement = document.getElementById('batteryHeapChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成模拟数据
    const timeData = generateTimeData(24);
    const socData = generateRandomData(24, 70, 85);
    const voltageData = generateRandomData(24, 370, 380);
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const time = params[0].axisValue;
                let result = `${time}:00<br />`;
                
                params.forEach(param => {
                    if (param.seriesName === '堆SOC') {
                        result += `${param.seriesName}: ${param.value}%<br />`;
                    } else if (param.seriesName === '堆电压') {
                        result += `${param.seriesName}: ${param.value}V<br />`;
                    }
                });
                
                return result;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            data: ['堆SOC', '堆电压'],
            right: 10,
            top: 10
        },
        xAxis: {
            type: 'category',
            data: timeData,
            boundaryGap: false,
            axisLabel: {
                formatter: '{value}:00'
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'SOC (%)',
                min: 0,
                max: 100,
                position: 'left',
                axisLabel: {
                    formatter: '{value}%'
                }
            },
            {
                type: 'value',
                name: '电压 (V)',
                min: 360,
                max: 390,
                position: 'right',
                axisLabel: {
                    formatter: '{value}V'
                }
            }
        ],
        series: [
            {
                name: '堆SOC',
                type: 'line',
                data: socData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 3,
                    color: '#1890ff'
                }
            },
            {
                name: '堆电压',
                type: 'line',
                yAxisIndex: 1,
                data: voltageData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    width: 3,
                    color: '#f5222d'
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化电池簇电压/SOC对比图表
 */
function initBatteryClusterCompareChart() {
    const chartElement = document.getElementById('batteryClusterCompareChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['簇电压', '簇SOC'],
            right: 10,
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['1#电池簇', '2#电池簇', '3#电池簇']
        },
        yAxis: [
            {
                type: 'value',
                name: '电压 (V)',
                min: 120,
                max: 130,
                position: 'left',
                axisLabel: {
                    formatter: '{value}V'
                }
            },
            {
                type: 'value',
                name: 'SOC (%)',
                min: 0,
                max: 100,
                position: 'right',
                axisLabel: {
                    formatter: '{value}%'
                }
            }
        ],
        series: [
            {
                name: '簇电压',
                type: 'bar',
                data: [124.6, 125.2, 124.8],
                barWidth: '30%',
                itemStyle: {
                    color: '#1890ff'
                }
            },
            {
                name: '簇SOC',
                type: 'bar',
                yAxisIndex: 1,
                data: [78.2, 77.8, 78.5],
                barWidth: '30%',
                itemStyle: {
                    color: '#52c41a'
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化单体电压柱状图
 * @param {string} clusterId 电池簇ID
 */
function initCellVoltageChart(clusterId) {
    const chartElement = document.getElementById('cellVoltageChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成单体号数据
    const cellIds = [];
    for (let i = 1; i <= 52; i++) {
        cellIds.push(i + '#');
    }
    
    // 生成单体电压数据，并设置特殊值
    let voltageData = [];
    let markPointData = [];
    
    // 根据电池簇ID设置不同的最高/最低值单体号
    let highestVoltageCell, lowestVoltageCell;
    
    switch(clusterId) {
        case '1':
            highestVoltageCell = 5;
            lowestVoltageCell = 32;
            break;
        case '2':
            highestVoltageCell = 8;
            lowestVoltageCell = 28;
            break;
        case '3':
            highestVoltageCell = 3;
            lowestVoltageCell = 36;
            break;
        default:
            highestVoltageCell = 5;
            lowestVoltageCell = 32;
    }
    
    // 生成电压数据
    for (let i = 1; i <= 52; i++) {
        // 生成随机的但固定的电压值
        const seed = i * 10 + parseInt(clusterId);
        let voltage = 3420 + (seed % 40);
        
        // 设置极值电压
        if (i === highestVoltageCell) {
            voltage = 3452;
            markPointData.push({
                value: voltage,
                xAxis: i - 1,
                yAxis: voltage,
                itemStyle: {
                    color: '#f5222d'
                }
            });
        } else if (i === lowestVoltageCell) {
            voltage = 3412;
            markPointData.push({
                value: voltage,
                xAxis: i - 1,
                yAxis: voltage,
                itemStyle: {
                    color: '#2f54eb'
                }
            });
        }
        
        voltageData.push(voltage);
    }
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b} 单体<br />电压: {c} mV'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            data: ['单体电压'],
            right: 10,
            top: 10
        },
        xAxis: {
            type: 'category',
            data: cellIds,
            axisLabel: {
                interval: 4,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '电压 (mV)',
            min: 3400,
            max: 3460,
            axisLabel: {
                formatter: '{value} mV'
            }
        },
        series: [
            {
                name: '单体电压',
                type: 'bar',
                data: voltageData,
                barWidth: '60%',
                itemStyle: {
                    color: function(params) {
                        // 根据索引设置颜色
                        if (params.dataIndex === highestVoltageCell - 1) {
                            return '#f5222d'; // 最高电压红色
                        } else if (params.dataIndex === lowestVoltageCell - 1) {
                            return '#2f54eb'; // 最低电压蓝色
                        } else {
                            return '#1890ff'; // 默认蓝色
                        }
                    }
                },
                markPoint: {
                    symbolSize: 42,
                    data: [
                        { type: 'max', name: '最高电压' },
                        { type: 'min', name: '最低电压' }
                    ],
                    label: {
                        formatter: function(param) {
                            return param.name + ': ' + param.value + ' mV';
                        }
                    }
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 初始化单体温度柱状图
 * @param {string} clusterId 电池簇ID
 */
function initCellTempChart(clusterId) {
    const chartElement = document.getElementById('cellTempChart');
    if (!chartElement) return;
    
    // 创建图表实例
    const chart = echarts.init(chartElement);
    
    // 生成单体号数据
    const cellIds = [];
    for (let i = 1; i <= 52; i++) {
        cellIds.push(i + '#');
    }
    
    // 生成单体温度数据，并设置特殊值
    let tempData = [];
    let markPointData = [];
    
    // 根据电池簇ID设置不同的最高/最低值单体号
    let highestTempCell, lowestTempCell;
    
    switch(clusterId) {
        case '1':
            highestTempCell = 12;
            lowestTempCell = 48;
            break;
        case '2':
            highestTempCell = 15;
            lowestTempCell = 42;
            break;
        case '3':
            highestTempCell = 10;
            lowestTempCell = 45;
            break;
        default:
            highestTempCell = 12;
            lowestTempCell = 48;
    }
    
    // 生成温度数据
    for (let i = 1; i <= 52; i++) {
        // 生成随机的但固定的温度值
        const seed = i * 10 + parseInt(clusterId);
        let temp = 28 + (seed % 5) / 10;
        
        // 设置极值温度
        if (i === highestTempCell) {
            temp = 32.5;
            markPointData.push({
                value: temp,
                xAxis: i - 1,
                yAxis: temp,
                itemStyle: {
                    color: '#f5222d'
                }
            });
        } else if (i === lowestTempCell) {
            temp = 28.2;
            markPointData.push({
                value: temp,
                xAxis: i - 1,
                yAxis: temp,
                itemStyle: {
                    color: '#2f54eb'
                }
            });
        }
        
        tempData.push(temp);
    }
    
    // 图表配置
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b} 单体<br />温度: {c} ℃'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            data: ['单体温度'],
            right: 10,
            top: 10
        },
        xAxis: {
            type: 'category',
            data: cellIds,
            axisLabel: {
                interval: 4,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '温度 (℃)',
            min: 27,
            max: 33,
            axisLabel: {
                formatter: '{value} ℃'
            }
        },
        series: [
            {
                name: '单体温度',
                type: 'bar',
                data: tempData,
                barWidth: '60%',
                itemStyle: {
                    color: function(params) {
                        // 根据索引设置颜色
                        if (params.dataIndex === highestTempCell - 1) {
                            return '#f5222d'; // 最高温度红色
                        } else if (params.dataIndex === lowestTempCell - 1) {
                            return '#2f54eb'; // 最低温度蓝色
                        } else {
                            return '#fa8c16'; // 默认橙色
                        }
                    }
                },
                markPoint: {
                    symbolSize: 42,
                    data: [
                        { type: 'max', name: '最高温度' },
                        { type: 'min', name: '最低温度' }
                    ],
                    label: {
                        formatter: function(param) {
                            return param.name + ': ' + param.value + ' ℃';
                        }
                    }
                }
            }
        ]
    };
    
    // 设置图表配置项并渲染
    chart.setOption(option);
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

/**
 * 生成时间数据
 * @param {number} count 数据点数量
 * @returns {Array<string>} 时间数据数组
 */
function generateTimeData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(i);
    }
    return data;
}

/**
 * 生成随机数据
 * @param {number} count 数据点数量
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {Array<number>} 随机数据数组
 */
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        // 使用正弦波生成看起来更真实的数据
        const value = min + (max - min) * (0.5 + 0.4 * Math.sin(i / count * Math.PI * 2) + 0.1 * Math.random());
        data.push(Math.round(value * 10) / 10); // 保留一位小数
    }
    return data;
} 