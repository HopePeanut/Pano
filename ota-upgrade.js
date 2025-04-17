/**
 * 远程OTA升级页面脚本
 * 使用Vue.js实现页面交互逻辑和功能
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initializeNavbar();
});

/**
 * 初始化导航栏
 * 注入导航栏HTML并设置当前活动菜单项
 */
function initializeNavbar() {
    // 注入导航栏
    document.getElementById('navbar-container').innerHTML = navbarHTML;
    
    // 初始化导航栏功能
    initNavbar();
    
    // 设置活动菜单项
    const maintenanceMenu = document.getElementById('menu-maintenance');
    const toolsSubmenu = document.getElementById('submenu-maintenance-tools');
    
    if (maintenanceMenu) {
        maintenanceMenu.classList.add('active');
    }
    
    if (toolsSubmenu) {
        toolsSubmenu.classList.add('active');
    }
}

// 模拟数据 - 站点列表
const mockSites = [
    { id: 'site001', name: '清安站点A' },
    { id: 'site002', name: '清安站点B' },
    { id: 'site003', name: '清安站点C' },
    { id: 'site004', name: '清安站点D' },
    { id: 'site005', name: '清安站点E' },
    { id: 'site006', name: '清安站点F' },
    { id: 'site007', name: '清安站点G' },
    { id: 'site008', name: '清安站点H' }
];

// 模拟数据 - 设备类型
const mockDeviceTypes = [
    { id: 'ems', name: 'EMS1.5' },
    { id: 'bms', name: 'EMS2.0' },
    { id: 'pcs', name: 'BMS1.0' },
    { id: 'thermal', name: 'BMS2.0' },
    { id: 'scada', name: '盛宏PCS' }
];

// 模拟数据 - 固件版本
const mockFirmwareVersions = [
    { id: 'fw001', name: 'EMS1.5', version: 'L2-B12-V2.3.1', deviceType: 'ems', isLatest: true },
    { id: 'fw002', name: 'EMS1.5', version: 'L2-B12-V2.2.5', deviceType: 'ems', isLatest: false },
    { id: 'fw003', name: 'BMS1.0', version: 'L2-B12-V1.8.3', deviceType: 'bms', isLatest: true },
    { id: 'fw004', name: 'BMS1.0', version: 'L2-B12-V1.7.9', deviceType: 'bms', isLatest: false },
    { id: 'fw005', name: 'BMS1.0', version: 'L2-B12-V3.0.2', deviceType: 'pcs', isLatest: true },
    { id: 'fw006', name: 'BMS2.0', version: 'L2-B12-V2.9.8', deviceType: 'pcs', isLatest: false },
    { id: 'fw007', name: 'BMS2.0', version: 'L2-B12-V1.5.4', deviceType: 'thermal', isLatest: true },
    { id: 'fw008', name: 'BMS2.0', version: 'L2-B12-V1.4.7', deviceType: 'thermal', isLatest: false },
    { id: 'fw009', name: '盛宏PCS', version: 'V2.1.3', deviceType: 'scada', isLatest: true },
    { id: 'fw010', name: '盛宏PCS', version: 'V2.0.9', deviceType: 'scada', isLatest: false }
];

// 模拟数据 - 设备列表
const mockDevices = [];

// 生成随机设备数据
function generateMockDevices() {
    for (let i = 1; i <= 50; i++) {
        const siteIndex = Math.floor(Math.random() * mockSites.length);
        const site = mockSites[siteIndex];
        const deviceTypeIndex = Math.floor(Math.random() * mockDeviceTypes.length);
        const deviceType = mockDeviceTypes[deviceTypeIndex];
        
        // 该设备类型可用的固件
        const availableFirmware = mockFirmwareVersions.filter(fw => fw.deviceType === deviceType.id);
        const latestFirmware = availableFirmware.find(fw => fw.isLatest);
        const oldFirmware = availableFirmware.find(fw => !fw.isLatest);
        
        // 随机设置设备状态
        const statusOptions = ['online', 'offline', 'idle'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        mockDevices.push({
            id: `DEV${i.toString().padStart(4, '0')}`,
            siteId: site.id,
            siteName: site.name,
            deviceTypeId: deviceType.id,
            deviceTypeName: deviceType.name,
            currentVersion: (Math.random() > 0.3) ? oldFirmware.version : latestFirmware.version,
            targetVersion: '',
            connectionStatus: randomStatus
        });
    }
}

// 模拟数据 - 升级任务
const mockUpgradeTasks = [
    {
        id: 'TASK20230501001',
        createdTime: '2023-05-01 09:15:32',
        creator: '管理员',
        status: 'completed',
        siteCount: 3,
        deviceCount: 12,
        successCount: 10,
        failCount: 2,
        pendingCount: 0
    },
    {
        id: 'TASK20230510002',
        createdTime: '2023-05-10 14:22:18',
        creator: '管理员',
        status: 'in_progress',
        siteCount: 2,
        deviceCount: 8,
        successCount: 3,
        failCount: 1,
        pendingCount: 4
    },
    {
        id: 'TASK20230515003',
        createdTime: '2023-05-15 11:05:44',
        creator: '运维人员A',
        status: 'failed',
        siteCount: 1,
        deviceCount: 5,
        successCount: 2,
        failCount: 3,
        pendingCount: 0
    },
    {
        id: 'TASK20230520004',
        createdTime: '2023-05-20 16:30:27',
        creator: '运维人员B',
        status: 'scheduled',
        scheduledTime: '2023-05-25 03:00:00',
        siteCount: 4,
        deviceCount: 15,
        successCount: 0,
        failCount: 0,
        pendingCount: 15
    }
];

// 初始化设备数据
generateMockDevices();

// 创建Vue应用
new Vue({
    el: '#ota-app',
    data: {
        // 数据源
        sites: mockSites,
        deviceTypes: mockDeviceTypes,
        firmwareVersions: mockFirmwareVersions,
        devices: mockDevices,
        upgradeTasks: mockUpgradeTasks,
        
        // 站点选择
        selectedSites: [],
        siteSearchText: '',
        
        // 设备类型选择
        selectedDeviceTypes: [],
        
        // 固件版本选择
        selectedFirmware: '',
        
        // 升级策略
        upgradeStrategy: 'immediate',
        scheduledTime: '',
        batchInterval: 2,
        batchSize: 5,
        
        // 升级说明
        upgradeNotes: '',
        
        // 设备筛选和分页
        deviceSearchText: '',
        currentPage: 1,
        pageSize: 10,
        selectedDevices: [],
        
        // 任务Tab状态
        taskTabs: [
            { id: 'all', name: '全部任务' },
            { id: 'in_progress', name: '执行中' },
            { id: 'completed', name: '已完成' },
            { id: 'failed', name: '失败' },
            { id: 'scheduled', name: '已计划' }
        ],
        currentTab: 'all',
        
        // UI状态
        dropdowns: {
            sites: false,
            deviceTypes: false
        },
        showConfirmModal: false
    },
    computed: {
        // 过滤后的站点列表
        filteredSites() {
            if (!this.siteSearchText) {
                return this.sites;
            }
            const searchText = this.siteSearchText.toLowerCase();
            return this.sites.filter(site => site.name.toLowerCase().includes(searchText));
        },
        
        // 选中站点的名称列表
        selectedSiteNames() {
            return this.selectedSites.map(siteId => {
                const site = this.sites.find(s => s.id === siteId);
                return site ? site.name : siteId;
            });
        },
        
        // 选中设备类型的名称列表
        selectedDeviceTypeNames() {
            return this.selectedDeviceTypes.map(typeId => {
                const type = this.deviceTypes.find(t => t.id === typeId);
                return type ? type.name : typeId;
            });
        },
        
        // 选中固件的名称
        selectedFirmwareName() {
            if (!this.selectedFirmware) return '未选择';
            const firmware = this.firmwareVersions.find(fw => fw.id === this.selectedFirmware);
            return firmware ? `${firmware.name} (${firmware.version})` : this.selectedFirmware;
        },
        
        // 过滤后的设备列表
        filteredDevices() {
            // 如果没有选择站点或设备类型，返回空数组
            if (this.selectedSites.length === 0 || this.selectedDeviceTypes.length === 0) {
                return [];
            }
            
            // 筛选设备
            let filtered = this.devices.filter(device => 
                this.selectedSites.includes(device.siteId) && 
                this.selectedDeviceTypes.includes(device.deviceTypeId)
            );
            
            // 搜索关键字过滤
            if (this.deviceSearchText) {
                const searchText = this.deviceSearchText.toLowerCase();
                filtered = filtered.filter(device => 
                    device.id.toLowerCase().includes(searchText) || 
                    device.siteName.toLowerCase().includes(searchText) ||
                    device.deviceTypeName.toLowerCase().includes(searchText)
                );
            }
            
            return filtered;
        },
        
        // 当前页设备列表
        paginatedDevices() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredDevices.slice(start, end);
        },
        
        // 总页数
        totalPages() {
            return Math.ceil(this.filteredDevices.length / this.pageSize);
        },
        
        // 当前Tab过滤后的任务列表
        filteredTasks() {
            if (this.currentTab === 'all') {
                return this.upgradeTasks;
            }
            return this.upgradeTasks.filter(task => task.status === this.currentTab);
        },
        
        // 表单是否有效
        isFormValid() {
            return this.selectedSites.length > 0 && 
                   this.selectedDeviceTypes.length > 0 && 
                   this.selectedFirmware && 
                   this.selectedDevices.length > 0;
        },
        
        // 升级策略文本
        getStrategyText() {
            switch(this.upgradeStrategy) {
                case 'immediate':
                    return '立即执行';
                case 'scheduled':
                    return `定时任务 (${this.scheduledTime})`;
                case 'batch':
                    return `分批升级 (每批${this.batchSize}台设备，间隔${this.batchInterval}小时)`;
                default:
                    return '未知策略';
            }
        }
    },
    methods: {
        // 切换下拉菜单状态
        toggleDropdown(type) {
            // 关闭其他下拉菜单
            Object.keys(this.dropdowns).forEach(key => {
                if (key !== type) this.dropdowns[key] = false;
            });
            
            // 切换当前下拉菜单
            this.dropdowns[type] = !this.dropdowns[type];
        },
        
        // 全选/取消全选站点
        toggleAllSites() {
            if (this.selectedSites.length === this.filteredSites.length) {
                this.selectedSites = [];
            } else {
                this.selectedSites = this.filteredSites.map(site => site.id);
            }
        },
        
        // 全选/取消全选设备类型
        toggleAllDeviceTypes() {
            if (this.selectedDeviceTypes.length === this.deviceTypes.length) {
                this.selectedDeviceTypes = [];
            } else {
                this.selectedDeviceTypes = this.deviceTypes.map(type => type.id);
            }
        },
        
        // 全选/取消全选设备
        toggleAllDevices() {
            const availableDevices = this.filteredDevices.filter(device => device.connectionStatus !== 'offline');
            
            if (this.selectedDevices.length === availableDevices.length && availableDevices.length > 0) {
                this.selectedDevices = [];
            } else {
                this.selectedDevices = availableDevices.map(device => device.id);
            }
        },
        
        // 获取设备的兼容固件
        compatibleFirmware(device) {
            return this.firmwareVersions.filter(firmware => firmware.deviceType === device.deviceTypeId);
        },
        
        // 移除设备
        removeDevice(deviceId) {
            const index = this.selectedDevices.indexOf(deviceId);
            if (index > -1) {
                this.selectedDevices.splice(index, 1);
            }
        },
        
        // 获取连接状态样式类
        getStatusClass(status) {
            switch(status) {
                case 'online': return 'status-online';
                case 'offline': return 'status-offline';
                case 'idle': return 'status-idle';
                default: return '';
            }
        },
        
        // 获取连接状态文本
        getStatusText(status) {
            switch(status) {
                case 'online': return '在线';
                case 'offline': return '离线';
                case 'idle': return '空闲';
                default: return '未知';
            }
        },
        
        // 换页
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        
        // 获取任务数量
        getTaskCount(tabId) {
            if (tabId === 'all') {
                return this.upgradeTasks.length;
            }
            return this.upgradeTasks.filter(task => task.status === tabId).length;
        },
        
        // 获取标签页名称
        getTabName(tabId) {
            const tab = this.taskTabs.find(t => t.id === tabId);
            return tab ? tab.name : '';
        },
        
        // 获取进度百分比
        getProgressPercentage(task) {
            if (task.deviceCount === 0) return 0;
            return Math.round(((task.successCount + task.failCount) / task.deviceCount) * 100);
        },
        
        // 获取成功百分比
        getSuccessPercentage(task) {
            if (task.deviceCount === 0) return 0;
            return (task.successCount / task.deviceCount) * 100;
        },
        
        // 获取失败百分比
        getFailPercentage(task) {
            if (task.deviceCount === 0) return 0;
            return (task.failCount / task.deviceCount) * 100;
        },
        
        // 获取未响应百分比
        getPendingPercentage(task) {
            if (task.deviceCount === 0) return 0;
            return (task.pendingCount / task.deviceCount) * 100;
        },
        
        // 查看任务详情
        viewTaskDetail(taskId) {
            alert(`查看任务详情: ${taskId}`);
        },
        
        // 停止任务
        stopTask(taskId) {
            if (confirm(`确定要停止任务 ${taskId} 吗？`)) {
                // 在实际应用中，这里应该调用API来停止任务
                alert(`任务 ${taskId} 已停止`);
                
                // 更新任务状态（模拟）
                const taskIndex = this.upgradeTasks.findIndex(task => task.id === taskId);
                if (taskIndex > -1) {
                    this.upgradeTasks[taskIndex].status = 'failed';
                }
            }
        },
        
        // 导出任务报告
        exportTaskReport(taskId) {
            alert(`导出任务报告: ${taskId}`);
        },
        
        // 提交升级任务
        submitUpgradeTask() {
            // 表单验证
            if (!this.isFormValid) {
                alert('请完善表单信息');
                return;
            }
            
            // 显示确认模态框
            this.showConfirmModal = true;
        },
        
        // 确认升级
        confirmUpgrade() {
            // 关闭模态框
            this.showConfirmModal = false;
            
            // 生成新任务ID
            const now = new Date();
            const taskId = `TASK${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${this.upgradeTasks.length + 1}`;
            
            // 创建新任务（实际应用中应调用API）
            const newTask = {
                id: taskId,
                createdTime: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
                creator: '当前用户',
                status: this.upgradeStrategy === 'scheduled' ? 'scheduled' : 'in_progress',
                siteCount: this.selectedSites.length,
                deviceCount: this.selectedDevices.length,
                successCount: 0,
                failCount: 0,
                pendingCount: this.selectedDevices.length
            };
            
            // 添加计划执行时间（如果是定时任务）
            if (this.upgradeStrategy === 'scheduled') {
                newTask.scheduledTime = this.scheduledTime;
            }
            
            // 添加到任务列表
            this.upgradeTasks.unshift(newTask);
            
            // 切换到相应的任务标签页
            this.currentTab = newTask.status;
            
            // 提示用户
            alert(`升级任务已创建，任务ID: ${taskId}`);
            
            // 重置表单（实际应用可能需要保留部分状态）
            this.resetForm();
        },
        
        // 重置表单
        resetForm() {
            this.selectedDevices = [];
            this.upgradeNotes = '';
            this.currentPage = 1;
        }
    },
    mounted() {
        // 关闭点击外部区域时关闭下拉菜单
        document.addEventListener('click', (event) => {
            const isDropdownClick = event.target.closest('.multi-select');
            if (!isDropdownClick) {
                Object.keys(this.dropdowns).forEach(key => {
                    this.dropdowns[key] = false;
                });
            }
        });
    }
}); 