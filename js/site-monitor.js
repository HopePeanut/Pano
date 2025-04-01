// 站点监控页面功能脚本

// 页面全局变量
let allSites = []; // 所有站点数据
let filteredSites = []; // 筛选后的站点数据
let currentPage = 1; // 当前页码
const sitesPerPage = 12; // 每页显示站点数

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 更新用户信息
    updateUserInfo();
    
    // 加载站点数据
    loadSiteData();
    
    // 注册事件
    registerEvents();
    
    // 注册导航事件
    registerNavEvents();
    
    // 注册退出登录事件
    registerLogoutEvent();
    
    // 确保用户下拉菜单可点击
    fixUserDropdownClickable();
});

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    // 获取登录状态
    const isLoggedIn = localStorage.getItem('pano_logged_in') === 'true';
    
    if (!isLoggedIn) {
        // 直接设置登录状态为true，避免重定向
        localStorage.setItem('pano_logged_in', 'true');
        showTooltip('已初始化', '系统已准备就绪', 'success');
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
 * 加载站点数据
 */
function loadSiteData() {
    // 模拟站点数据，实际项目中应该从API获取
    allSites = [
        // 储能电站
        {
            id: 1,
            name: '张家口储能电站',
            type: 'type1',
            typeText: '储能电站',
            status: 'normal',
            statusText: '正常',
            location: '河北省张家口市桥东区',
            capacity: '10MW/20MWh',
            data: {
                dailyCharge: 2563.5, // kWh
                dailyDischarge: 2128.7, // kWh
                alarmCount: 0,
                offlineCount: 0,
                totalDevices: 10
            }
        },
        {
            id: 2,
            name: '呼和浩特储能电站',
            type: 'type1',
            typeText: '储能电站',
            status: 'warning',
            statusText: '告警',
            location: '内蒙古呼和浩特市赛罕区',
            capacity: '5MW/10MWh',
            data: {
                dailyCharge: 1253.8, // kWh
                dailyDischarge: 1105.2, // kWh
                alarmCount: 2,
                offlineCount: 0,
                totalDevices: 6
            }
        },
        {
            id: 3,
            name: '广州储能电站',
            type: 'type1',
            typeText: '储能电站',
            status: 'fault',
            statusText: '故障',
            location: '广东省广州市天河区',
            capacity: '6MW/12MWh',
            data: {
                dailyCharge: 856.3, // kWh
                dailyDischarge: 689.5, // kWh
                alarmCount: 5,
                offlineCount: 2,
                totalDevices: 8
            }
        },
        
        // 充电站
        {
            id: 4,
            name: '西安高新区充电站',
            type: 'type4',
            typeText: '充电站',
            status: 'normal',
            statusText: '正常',
            location: '陕西省西安市高新区',
            data: {
                chargerCount: 12,
                activeChargers: 5,
                dailyCharge: 965.2, // kWh
                alarmCount: 0,
                offlineCount: 0,
                totalDevices: 14
            }
        },
        {
            id: 5,
            name: '北京海淀充电站',
            type: 'type4',
            typeText: '充电站',
            status: 'normal',
            statusText: '正常',
            location: '北京市海淀区中关村',
            data: {
                chargerCount: 20,
                activeChargers: 8,
                dailyCharge: 1862.5, // kWh
                alarmCount: 0,
                offlineCount: 0,
                totalDevices: 24
            }
        },
        {
            id: 6,
            name: '上海浦东充电站',
            type: 'type4',
            typeText: '充电站',
            status: 'warning',
            statusText: '告警',
            location: '上海市浦东新区',
            data: {
                chargerCount: 16,
                activeChargers: 6,
                dailyCharge: 1345.8, // kWh
                alarmCount: 3,
                offlineCount: 1,
                totalDevices: 18
            }
        },
        
        // 充电桩配储
        {
            id: 7,
            name: '深圳南山充电桩配储',
            type: 'type2',
            typeText: '充电桩配储',
            status: 'normal',
            statusText: '正常',
            location: '广东省深圳市南山区',
            capacity: '2MW/4MWh',
            data: {
                // 储能系统数据
                dailyCharge: 653.5, // kWh
                dailyDischarge: 589.7, // kWh
                
                // 充电桩系统数据
                chargerCount: 10,
                activeChargers: 4,
                chargingAmount: 895.3, // kWh
                
                // 设备状态
                alarmCount: 0,
                offlineCount: 0,
                totalDevices: 18
            }
        },
        {
            id: 8,
            name: '成都武侯充电桩配储',
            type: 'type2',
            typeText: '充电桩配储',
            status: 'warning',
            statusText: '告警',
            location: '四川省成都市武侯区',
            capacity: '3MW/6MWh',
            data: {
                // 储能系统数据
                dailyCharge: 856.2, // kWh
                dailyDischarge: 792.1, // kWh
                
                // 充电桩系统数据
                chargerCount: 12,
                activeChargers: 5,
                chargingAmount: 1025.6, // kWh
                
                // 设备状态
                alarmCount: 2,
                offlineCount: 1,
                totalDevices: 20
            }
        },
        
        // 光储充一体
        {
            id: 9,
            name: '杭州光储充一体站',
            type: 'type3',
            typeText: '光储充一体',
            status: 'normal',
            statusText: '正常',
            location: '浙江省杭州市滨江区',
            capacity: '4MW/8MWh',
            data: {
                // 储能系统数据
                dailyCharge: 953.6, // kWh
                dailyDischarge: 875.2, // kWh
                
                // 充电桩系统数据
                chargerCount: 8,
                activeChargers: 3,
                chargingAmount: 756.4, // kWh
                
                // 光伏系统数据
                solarGeneration: 1265.8, // kWh
                
                // 设备状态
                alarmCount: 0,
                offlineCount: 0,
                totalDevices: 25
            }
        },
        {
            id: 10,
            name: '太原光储充一体站',
            type: 'type3',
            typeText: '光储充一体',
            status: 'warning',
            statusText: '告警',
            location: '山西省太原市小店区',
            capacity: '5MW/10MWh',
            data: {
                // 储能系统数据
                dailyCharge: 1053.4, // kWh
                dailyDischarge: 965.7, // kWh
                
                // 充电桩系统数据
                chargerCount: 12,
                activeChargers: 5,
                chargingAmount: 965.3, // kWh
                
                // 光伏系统数据
                solarGeneration: 1465.2, // kWh
                
                // 设备状态
                alarmCount: 3,
                offlineCount: 1,
                totalDevices: 32
            }
        },
        // 停运站点
        {
            id: 11,
            name: '兰州光储充一体站',
            type: 'type3',
            typeText: '光储充一体',
            status: 'offline',
            statusText: '停运',
            location: '甘肃省兰州市城关区',
            capacity: '2MW/4MWh',
            data: {
                // 储能系统数据
                dailyCharge: 0, // kWh
                dailyDischarge: 0, // kWh
                
                // 充电桩系统数据
                chargerCount: 6,
                activeChargers: 0,
                chargingAmount: 0, // kWh
                
                // 光伏系统数据
                solarGeneration: 0, // kWh
                
                // 设备状态
                alarmCount: 0,
                offlineCount: 14,
                totalDevices: 14
            }
        },
        {
            id: 12,
            name: '重庆南岸充电站',
            type: 'type4',
            typeText: '充电站',
            status: 'offline',
            statusText: '未投运',
            location: '重庆市南岸区',
            data: {
                chargerCount: 16,
                activeChargers: 0,
                dailyCharge: 0, // kWh
                alarmCount: 0,
                offlineCount: 16,
                totalDevices: 16
            }
        }
    ];
    
    // 初始筛选结果为所有站点
    filteredSites = [...allSites];
    
    // 更新站点统计
    updateSiteStatistics();
    
    // 显示站点列表
    renderSiteCards();
    
    // 更新分页
    updatePagination();
}

/**
 * 更新站点统计信息
 */
function updateSiteStatistics() {
    const totalSites = allSites.length;
    const normalSites = allSites.filter(site => site.status === 'normal').length;
    const warningSites = allSites.filter(site => site.status === 'warning').length;
    const faultSites = allSites.filter(site => site.status === 'fault').length;
    const offlineSites = allSites.filter(site => site.status === 'offline').length;
    
    // 更新统计数字显示
    document.getElementById('totalSites').textContent = totalSites;
    document.getElementById('normalSites').textContent = normalSites;
    document.getElementById('warningSites').textContent = warningSites;
    document.getElementById('faultSites').textContent = faultSites;
    document.getElementById('offlineSites').textContent = offlineSites;
}

/**
 * 渲染站点卡片
 */
function renderSiteCards() {
    const siteContainer = document.getElementById('siteContainer');
    siteContainer.innerHTML = '';
    
    // 计算当前页的站点
    const startIndex = (currentPage - 1) * sitesPerPage;
    const endIndex = startIndex + sitesPerPage;
    const pageSites = filteredSites.slice(startIndex, endIndex);
    
    // 如果没有站点数据
    if (pageSites.length === 0) {
        siteContainer.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-info-circle"></i>
                <p>没有符合条件的站点数据</p>
            </div>
        `;
        return;
    }
    
    // 创建站点卡片
    pageSites.forEach(site => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
        siteCard.dataset.id = site.id;
        
        // 创建卡片内容
        siteCard.innerHTML = createSiteCardContent(site);
        
        // 添加点击事件（仅为了查看站点详情的点击区域）
        const cardContentArea = siteCard.querySelector('.site-body');
        if (cardContentArea) {
            cardContentArea.addEventListener('click', () => {
                // 可以在此处添加显示站点详情的逻辑
                console.log(`查看站点 ${site.id} 详情`);
            });
        }
        
        // 添加进入站点按钮点击事件
        const enterSiteBtn = siteCard.querySelector('.enter-site-btn');
        if (enterSiteBtn) {
            enterSiteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止冒泡到卡片
                navigateToSiteDetail(site.id);
            });
        }
        
        // 添加到容器
        siteContainer.appendChild(siteCard);
    });
}

/**
 * 创建站点卡片内容
 * @param {Object} site - 站点数据
 * @returns {string} - 卡片HTML内容
 */
function createSiteCardContent(site) {
    // 站点头部信息
    let content = `
        <div class="site-header">
            <div class="site-name">${site.name}</div>
            <div class="site-info">
                <div class="site-type">${site.typeText}</div>
                <div class="site-status ${site.status}">${site.statusText}</div>
            </div>
        </div>
        <div class="site-body">
    `;
    
    // 根据站点类型展示不同内容
    if (site.status === 'offline') {
        // 停运/未投运站点
        content += `
            <div class="site-data-section">
                <div class="data-grid">
                    <div class="data-item full">
                        <div class="data-label">站点状态</div>
                        <div class="data-value">${site.statusText}</div>
                    </div>
                    ${site.capacity ? `
                    <div class="data-item full">
                        <div class="data-label">装机容量</div>
                        <div class="data-value">${site.capacity}</div>
                    </div>
                    ` : ''}
                    <div class="data-item full">
                        <div class="data-label">设备状态</div>
                        <div class="data-value warning">${site.data.offlineCount}/${site.data.totalDevices} 离线</div>
                    </div>
                </div>
            </div>
        `;
    } else if (site.type === 'type1') {
        // 储能电站
        content += `
            <div class="site-data-section">
                <div class="data-grid">
                    <div class="data-item full">
                        <div class="data-label">装机容量</div>
                        <div class="data-value">${site.capacity}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日放电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyDischarge)}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">告警数量</div>
                        <div class="data-value ${site.data.alarmCount > 0 ? 'warning' : ''}">${site.data.alarmCount}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">设备状态</div>
                        <div class="data-value ${site.data.offlineCount > 0 ? 'warning' : 'online'}">${site.data.offlineCount > 0 ? site.data.offlineCount + '离线' : '全部在线'}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (site.type === 'type4') {
        // 充电站
        content += `
            <div class="site-data-section">
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">充电桩数量</div>
                        <div class="data-value">${site.data.chargerCount}个</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">当前使用</div>
                        <div class="data-value">${site.data.activeChargers}个</div>
                    </div>
                    <div class="data-item full">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">告警数量</div>
                        <div class="data-value ${site.data.alarmCount > 0 ? 'warning' : ''}">${site.data.alarmCount}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">设备状态</div>
                        <div class="data-value ${site.data.offlineCount > 0 ? 'warning' : 'online'}">${site.data.offlineCount > 0 ? site.data.offlineCount + '离线' : '全部在线'}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (site.type === 'type2') {
        // 充电桩配储
        content += `
            <div class="site-data-section">
                <div class="section-title energy">储能系统</div>
                <div class="data-grid">
                    <div class="data-item full">
                        <div class="data-label">装机容量</div>
                        <div class="data-value">${site.capacity}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日放电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyDischarge)}</div>
                    </div>
                </div>
            </div>
            
            <div class="site-data-section">
                <div class="section-title charging">充电桩系统</div>
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">充电桩数量</div>
                        <div class="data-value">${site.data.chargerCount}个</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">当前使用</div>
                        <div class="data-value">${site.data.activeChargers}个</div>
                    </div>
                    <div class="data-item full">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.chargingAmount)}</div>
                    </div>
                </div>
            </div>
            
            <div class="site-data-section">
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">告警数量</div>
                        <div class="data-value ${site.data.alarmCount > 0 ? 'warning' : ''}">${site.data.alarmCount}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">设备状态</div>
                        <div class="data-value ${site.data.offlineCount > 0 ? 'warning' : 'online'}">${site.data.offlineCount > 0 ? site.data.offlineCount + '离线' : '全部在线'}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (site.type === 'type3') {
        // 光储充一体
        content += `
            <div class="site-data-section">
                <div class="section-title energy">储能系统</div>
                <div class="data-grid">
                    <div class="data-item full">
                        <div class="data-label">装机容量</div>
                        <div class="data-value">${site.capacity}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyCharge)}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">今日放电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.dailyDischarge)}</div>
                    </div>
                </div>
            </div>
            
            <div class="site-data-section">
                <div class="section-title charging">充电桩系统</div>
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">充电桩数量</div>
                        <div class="data-value">${site.data.chargerCount}个</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">当前使用</div>
                        <div class="data-value">${site.data.activeChargers}个</div>
                    </div>
                    <div class="data-item full">
                        <div class="data-label">今日充电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.chargingAmount)}</div>
                    </div>
                </div>
            </div>
            
            <div class="site-data-section">
                <div class="section-title photovoltaic">光伏系统</div>
                <div class="data-grid">
                    <div class="data-item full">
                        <div class="data-label">今日发电量</div>
                        <div class="data-value">${formatEnergyValue(site.data.solarGeneration)}</div>
                    </div>
                </div>
            </div>
            
            <div class="site-data-section">
                <div class="data-grid">
                    <div class="data-item">
                        <div class="data-label">告警数量</div>
                        <div class="data-value ${site.data.alarmCount > 0 ? 'warning' : ''}">${site.data.alarmCount}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">设备状态</div>
                        <div class="data-value ${site.data.offlineCount > 0 ? 'warning' : 'online'}">${site.data.offlineCount > 0 ? site.data.offlineCount + '离线' : '全部在线'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 站点底部信息
    content += `
        </div>
        <div class="site-footer">
            <div class="site-location">
                <i class="fas fa-map-marker-alt"></i>
                ${site.location}
            </div>
            <button class="enter-site-btn" title="进入站点">
                进入站点
            </button>
        </div>
    `;
    
    return content;
}

/**
 * 能源数据单位格式化
 * @param {number} value - 能源数值（kWh）
 * @returns {string} - 格式化后的字符串
 */
function formatEnergyValue(value) {
    if (value === 0) return '0';
    if (value >= 1000) {
        return (value / 1000).toFixed(2) + ' MWh';
    } else {
        return value.toFixed(1) + ' kWh';
    }
}

/**
 * 更新分页控件
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredSites.length / sitesPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // 清空页码
    pageNumbers.innerHTML = '';
    
    // 如果总页数小于等于1，隐藏分页控件
    if (totalPages <= 1) {
        document.getElementById('pagination').style.display = 'none';
        return;
    } else {
        document.getElementById('pagination').style.display = 'flex';
    }
    
    // 生成页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = 'page-number';
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            renderSiteCards();
            updatePagination();
        });
        pageNumbers.appendChild(pageNumber);
    }
    
    // 更新前后按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // 添加前后按钮事件
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderSiteCards();
            updatePagination();
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderSiteCards();
            updatePagination();
        }
    };
}

/**
 * 注册事件处理
 */
function registerEvents() {
    // 站点搜索事件
    const searchInput = document.getElementById('siteSearchInput');
    const searchBtn = document.getElementById('siteSearchBtn');
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        filterSites();
    });
    
    // 输入框回车事件
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterSites();
        }
    });
    
    // 类型筛选点击事件
    const typeFilterOptions = document.querySelectorAll('#typeFilter .filter-option');
    
    typeFilterOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除其他选项的激活状态
            typeFilterOptions.forEach(op => op.classList.remove('active'));
            // 添加当前选项的激活状态
            option.classList.add('active');
            // 选中对应的radio
            const radio = option.querySelector('input');
            radio.checked = true;
            // 应用筛选
            filterSites();
        });
    });
    
    // 统计数据点击筛选
    const statItems = document.querySelectorAll('.site-statistics .stat-item');
    
    statItems.forEach(item => {
        item.addEventListener('click', function() {
            const status = this.dataset.status;
            
            // 移除所有激活状态
            statItems.forEach(i => i.classList.remove('active'));
            
            // 如果点击的是已经选中的项，则恢复到全部状态
            if (this.classList.contains('active') && status !== 'all') {
                document.querySelector('.stat-item[data-status="all"]').classList.add('active');
                filterSitesByStatus('all');
            } else {
                // 添加当前项的激活状态
                this.classList.add('active');
                filterSitesByStatus(status);
            }
        });
    });
    
    // 默认激活"全部"统计项
    document.querySelector('.stat-item[data-status="all"]').classList.add('active');
}

/**
 * 根据状态筛选站点数据
 * @param {string} status - 站点状态
 */
function filterSitesByStatus(status) {
    // 如果是全部，则应用当前搜索条件和类型筛选
    if (status === 'all') {
        filterSites();
        return;
    }
    
    // 获取搜索文本
    const searchText = document.getElementById('siteSearchInput').value.trim().toLowerCase();
    
    // 获取选中的类型筛选
    const selectedType = document.querySelector('#typeFilter .filter-option.active').dataset.value;
    
    // 应用筛选
    filteredSites = allSites.filter(site => {
        // 搜索文本筛选
        const matchesSearch = searchText === '' || 
            site.name.toLowerCase().includes(searchText) || 
            site.location.toLowerCase().includes(searchText);
        
        // 类型筛选
        const matchesType = selectedType === 'all' || site.type === selectedType;
        
        // 状态筛选
        const matchesStatus = site.status === status;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // 重置当前页为第一页
    currentPage = 1;
    
    // 更新站点卡片显示
    renderSiteCards();
    
    // 更新分页
    updatePagination();
    
    // 显示筛选结果提示
    showTooltip('筛选已应用', `共找到 ${filteredSites.length} 个符合条件的站点`);
}

/**
 * 筛选站点数据
 */
function filterSites() {
    // 获取搜索文本
    const searchText = document.getElementById('siteSearchInput').value.trim().toLowerCase();
    
    // 获取选中的类型筛选
    const selectedType = document.querySelector('#typeFilter .filter-option.active').dataset.value;
    
    // 获取选中的状态筛选（从统计项获取）
    const activeStatItem = document.querySelector('.stat-item.active');
    const selectedStatus = activeStatItem ? activeStatItem.dataset.status : 'all';
    
    // 应用筛选
    filteredSites = allSites.filter(site => {
        // 搜索文本筛选
        const matchesSearch = searchText === '' || 
            site.name.toLowerCase().includes(searchText) || 
            site.location.toLowerCase().includes(searchText);
        
        // 类型筛选
        const matchesType = selectedType === 'all' || site.type === selectedType;
        
        // 状态筛选
        const matchesStatus = selectedStatus === 'all' || site.status === selectedStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // 重置当前页为第一页
    currentPage = 1;
    
    // 更新站点卡片显示
    renderSiteCards();
    
    // 更新分页
    updatePagination();
    
    // 显示筛选结果提示
    showTooltip('筛选已应用', `共找到 ${filteredSites.length} 个符合条件的站点`);
}

/**
 * 导航到站点详情页面
 * @param {string} siteId - 站点ID
 */
function navigateToSiteDetail(siteId) {
    // 获取站点信息
    const site = findSiteById(siteId);
    
    // 保存选中的站点ID，以便在站点详情页使用
    localStorage.setItem('selectedSiteId', siteId);
    
    // 判断站点类型，只有储能电站可以进入详情页
    if (site.type === 'type1') { // type1 是储能电站类型
        // 显示提示消息
        showTooltip(`正在进入${site.name}详情页...`);
        
        // 延迟跳转，给提示消息显示的时间
        setTimeout(function() {
            window.location.href = 'site-detail.html';
        }, 800);
    } else {
        // 对于其他类型的站点，显示待开发中的提示
        showTooltip('提示', `${site.typeText}站点首页待开发中`, 'warning');
    }
}

/**
 * 显示全局提示框
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
            
            // 移除所有激活状态
            subNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // 添加当前项的激活状态
            item.classList.add('active');
            
            // 获取链接地址
            const href = item.getAttribute('href');
            
            // 如果是有效链接，则跳转
            if (href && href !== '#' && !href.startsWith('#')) {
                window.location.href = href;
            } else {
                showTooltip('开发中', '该功能正在开发中，敬请期待！');
            }
        });
    });
}

/**
 * 注册退出登录事件
 */
function registerLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
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
 * 根据ID查找站点
 * @param {number|string} siteId - 站点ID
 * @returns {Object} - 站点对象
 */
function findSiteById(siteId) {
    siteId = parseInt(siteId, 10);
    return allSites.find(site => site.id === siteId) || null;
}
