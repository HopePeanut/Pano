// 工单管理页面脚本

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavbar();
    // 设置工单系统菜单为活动状态
    setActiveMenuItem();
    // 生成模拟工单数据
    generateTickets();
    // 初始化页面事件
    initPageEvents();
    // 更新统计数据
    updateStats();
});

// 设置活动菜单项
function setActiveMenuItem() {
    // 等待导航栏加载完成
    setTimeout(() => {
        // 设置"运维管理"为活动状态
        const maintenanceMenu = document.getElementById('menu-maintenance');
        if (maintenanceMenu) {
            maintenanceMenu.classList.add('active');
        }
        
        // 设置"工单系统"为活动状态
        const workOrderMenu = document.getElementById('submenu-work-order');
        if (workOrderMenu) {
            workOrderMenu.classList.add('active');
        }
    }, 100);
}

// 模拟工单数据
const ticketData = [];
const siteNames = [
    '北京昌平储能电站', 
    '上海嘉定充电站',
    '深圳宝安光储充电站',
    '广州南沙储能电站',
    '天津滨海充电桩',
    '重庆两江储能电站',
    '杭州西湖充电桩配储',
    '南京江宁光储充配储',
    '成都高新储能电站',
    '武汉光谷充电桩',
    '西安高新充电桩配储',
    '长沙岳麓储能电站'
];

const ticketTypes = ['设备故障', '例行巡检', '系统维护', '设备安装', '紧急抢修'];
const statuses = ['新建', '已受理', '处理中', '已完成', '已关闭'];
const priorities = ['高', '中', '低'];
const weatherIcons = ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌩️'];

// 生成随机日期
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 生成随机工单数据
function generateTickets() {
    // 清空原有数据
    ticketData.length = 0;
    
    // 当前日期和30天前的日期
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // 生成50条工单数据
    for (let i = 1; i <= 50; i++) {
        const createdDate = randomDate(thirtyDaysAgo, now);
        const deadlineDays = Math.floor(Math.random() * 7) + 1;
        const deadline = new Date(createdDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
        
        // 是否已逾期
        const isOverdue = deadline < now && Math.random() > 0.05;
        
        // 随机状态
        const statusIndex = Math.floor(Math.random() * statuses.length);
        const status = statuses[statusIndex];
        
        // 工单类型
        const type = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
        
        // 优先级
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        // 随机站点
        const site = siteNames[Math.floor(Math.random() * siteNames.length)];
        
        // 随机天气
        const weather = {
            icon: weatherIcons[Math.floor(Math.random() * weatherIcons.length)],
            temp: Math.floor(Math.random() * 25) + 5, // 5℃ ~ 30℃
            humidity: Math.floor(Math.random() * 50) + 30 // 30% ~ 80%
        };
        
        // 工单标题
        let title = '';
        if (type === '设备故障') {
            const devices = ['逆变器', '变压器', '电池组', '充电桩', '监控设备', '通信设备'];
            const issues = ['告警', '过温', '通信中断', '效率下降', '异常关闭', '连接异常'];
            const device = devices[Math.floor(Math.random() * devices.length)];
            const issue = issues[Math.floor(Math.random() * issues.length)];
            title = `${device}${issue}故障处理`;
        } else if (type === '例行巡检') {
            title = `${site}${Math.ceil(Math.random() * 12)}月例行巡检`;
        } else if (type === '系统维护') {
            const systems = ['监控系统', '数据采集系统', '安防系统', 'EMS系统', '通信系统'];
            const system = systems[Math.floor(Math.random() * systems.length)];
            title = `${system}维护更新`;
        } else if (type === '设备安装') {
            const devices = ['充电桩', '储能系统', '监控设备', '通信设备', '光伏组件'];
            const device = devices[Math.floor(Math.random() * devices.length)];
            title = `新${device}安装调试`;
        } else if (type === '紧急抢修') {
            const issues = ['电网故障', '雷击损坏', '设备起火', '洪水威胁', '电缆损坏'];
            const issue = issues[Math.floor(Math.random() * issues.length)];
            title = `紧急抢修 - ${issue}`;
        }
        
        // 工单编号 格式: GD-年月日-序号
        const year = createdDate.getFullYear().toString().substr(2);
        const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
        const day = createdDate.getDate().toString().padStart(2, '0');
        const ticketId = `GD-${year}${month}${day}-${i.toString().padStart(2, '0')}`;
        
        // 创建工单对象
        const ticket = {
            id: ticketId,
            title: title,
            site: site,
            type: type,
            priority: priority,
            status: status,
            createdDate: createdDate,
            deadline: deadline,
            isOverdue: isOverdue,
            weather: weather,
            description: generateDescription(type, site)
        };
        
        // 添加到工单数据数组
        ticketData.push(ticket);
    }
    
    // 按创建日期降序排序
    ticketData.sort((a, b) => b.createdDate - a.createdDate);
    
    // 显示第一页数据
    displayTickets(1);
}

// 生成随机工单描述
function generateDescription(type, site) {
    if (type === '设备故障') {
        const issues = [
            `${site}的设备发生告警，需要检查排除故障。初步判断可能是温度传感器异常或内部组件故障，需现场勘察确认。`,
            `系统监控显示${site}的设备出现异常，已造成部分功能无法正常运行。请安排技术人员前往处理，避免故障扩大。`,
            `${site}设备运行数据异常，需要现场排查原因。建议携带备用模块，以便及时更换故障部件。`,
            `用户反馈${site}设备使用过程中出现异常，需要现场检查并解决问题。优先确保安全，再进行功能恢复。`
        ];
        return issues[Math.floor(Math.random() * issues.length)];
    } else if (type === '例行巡检') {
        const checks = [
            `按照运维计划，对${site}进行例行巡检，检查设备运行状态、环境情况和安全隐患，完成巡检记录并上传照片。`,
            `${site}的季度巡检工作，需要对所有核心设备进行全面检查，确保运行参数正常，并做好记录。`,
            `执行${site}的安全巡检工作，重点检查防火、防水、防雷等安全措施是否到位，排除安全隐患。`,
            `对${site}进行运行效率评估巡检，分析设备效能数据，提出优化建议，提升系统整体效率。`
        ];
        return checks[Math.floor(Math.random() * checks.length)];
    } else if (type === '系统维护') {
        const maintenance = [
            `${site}的系统需要进行例行维护，包括软件更新、数据备份和系统优化等工作，请提前通知相关人员。`,
            `对${site}的控制系统进行升级维护，需要短暂停机，请协调好时间并做好应急预案。`,
            `${site}系统出现性能下降问题，需要进行全面维护和优化，恢复系统最佳运行状态。`,
            `按照年度计划，对${site}的系统进行全面维护保养，更新关键模块，提升系统稳定性。`
        ];
        return maintenance[Math.floor(Math.random() * maintenance.length)];
    } else if (type === '设备安装') {
        const installations = [
            `在${site}安装新设备，需要进行现场勘测、安装施工和调试。请准备好相关工具和材料，确保安装质量。`,
            `${site}扩容项目设备安装工作，需要与现有系统进行对接，确保新旧设备协同工作。`,
            `为${site}安装新的监控设备，包括摄像头、传感器和数据采集终端，提升现场监控能力。`,
            `${site}新增设备安装任务，需要按照设计图纸进行施工，完成后进行联调测试并提交验收报告。`
        ];
        return installations[Math.floor(Math.random() * installations.length)];
    } else if (type === '紧急抢修') {
        const emergencies = [
            `${site}发生紧急故障，已导致系统部分瘫痪，需要立即前往处理，恢复系统正常运行。`,
            `因恶劣天气影响，${site}设备受损，需要紧急抢修团队前往处理，将损失降到最低。`,
            `${site}发生安全事故，需要紧急处理并评估损失，确保设备和人员安全。`,
            `${site}核心设备突发故障，已影响正常运营，需要立即组织专业技术人员前往抢修。`
        ];
        return emergencies[Math.floor(Math.random() * emergencies.length)];
    } else {
        return `需要对${site}进行工作处理，请安排相关人员按计划执行。`;
    }
}

// 每页显示的工单数量
const ITEMS_PER_PAGE = 9;
let currentPage = 1;

// 根据页码显示工单
function displayTickets(page) {
    const ticketList = document.querySelector('.ticket-list');
    ticketList.innerHTML = '';
    
    // 计算当前页的数据
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, ticketData.length);
    const currentPageData = ticketData.slice(startIndex, endIndex);
    
    // 没有数据的情况
    if (currentPageData.length === 0) {
        ticketList.innerHTML = '<div class="no-data">没有找到符合条件的工单</div>';
        return;
    }
    
    // 创建工单卡片
    for (const ticket of currentPageData) {
        const ticketCard = createTicketCard(ticket);
        ticketList.appendChild(ticketCard);
    }
    
    // 更新分页信息
    updatePagination(page);
}

// 创建工单卡片
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    // 根据优先级设置左边框颜色
    if (ticket.priority === '高') {
        card.style.borderLeftColor = 'var(--danger-color)';
    } else if (ticket.priority === '中') {
        card.style.borderLeftColor = 'var(--warning-color)';
    } else {
        card.style.borderLeftColor = 'var(--tertiary-color)';
    }
    
    // 格式化日期
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // 状态样式类
    let statusClass = '';
    switch (ticket.status) {
        case '新建': statusClass = 'status-new'; break;
        case '已受理': statusClass = 'status-accepted'; break;
        case '处理中': statusClass = 'status-processing'; break;
        case '已完成': statusClass = 'status-completed'; break;
        case '已关闭': statusClass = 'status-closed'; break;
    }
    
    // 构建卡片内容
    card.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-id">${ticket.id}</div>
            <div class="ticket-status ${statusClass}">${ticket.status}</div>
        </div>
        
        <div class="ticket-info">
            <div class="info-item">
                <div class="info-label">所属站点</div>
                <div class="info-value site-value">
                    ${ticket.site}
                    <i class="fas fa-map-marker-alt map-icon" data-site="${ticket.site}"></i>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">工单类型</div>
                <div class="info-value">${ticket.type}</div>
            </div>
            <div class="info-item">
                <div class="info-label">优先级</div>
                <div class="info-value priority-${ticket.priority.toLowerCase()}">
                    ${ticket.priority === '高' ? '<i class="fas fa-fire"></i>' : ''}
                    ${ticket.priority}
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">创建时间</div>
                <div class="info-value">${formatDate(ticket.createdDate)}</div>
            </div>
        </div>
        
        <div class="weather-info">
            <span class="weather-icon">${ticket.weather.icon}</span>
            <span>${ticket.weather.temp}℃</span>
            <span>湿度 ${ticket.weather.humidity}%</span>
        </div>
        
        <div class="deadline-info">
            ${ticket.isOverdue ? '<span class="overdue"><i class="fas fa-exclamation-circle"></i> 已逾期</span>' : ''}
            计划完成：${formatDate(ticket.deadline)}
        </div>
        
        <div class="ticket-actions">
            <button class="action-btn action-view" data-ticket-id="${ticket.id}">查看</button>
            ${ticket.status === '新建' ? `<button class="action-btn action-accept" data-ticket-id="${ticket.id}">受理</button>` : ''}
            ${ticket.status === '处理中' ? `<button class="action-btn action-complete" data-ticket-id="${ticket.id}">完成</button>` : ''}
        </div>
    `;
    
    // 添加点击事件
    card.addEventListener('click', function(e) {
        if (!e.target.matches('.action-btn')) {
            openTicketDetail(ticket);
        }
    });
    
    return card;
}

// 更新分页信息
function updatePagination(page) {
    currentPage = page;
    
    // 计算总页数
    const totalPages = Math.ceil(ticketData.length / ITEMS_PER_PAGE);
    
    // 更新页码显示
    document.getElementById('current-page').textContent = page;
    document.getElementById('total-pages').textContent = totalPages;
    
    // 更新按钮状态
    document.getElementById('prev-page').disabled = page <= 1;
    document.getElementById('next-page').disabled = page >= totalPages;
}

// 更新统计数据
function updateStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 今日新增工单
    const newTickets = ticketData.filter(ticket => ticket.createdDate >= todayStart).length;
    
    // 进行中工单
    const inProgressTickets = ticketData.filter(ticket => 
        ticket.status === '新建' || ticket.status === '已受理' || ticket.status === '处理中'
    ).length;
    
    // 本月完成工单
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedTickets = ticketData.filter(ticket => 
        ticket.status === '已完成' && ticket.createdDate >= monthStart
    ).length;
    
    // 平均响应时间（模拟数据）
    const avgResponseTime = (Math.random() * 3 + 1).toFixed(1) + 'h';
    
    // 更新显示
    document.getElementById('new-tickets').textContent = newTickets;
    document.getElementById('in-progress-tickets').textContent = inProgressTickets;
    document.getElementById('completed-tickets').textContent = completedTickets;
    document.getElementById('avg-response-time').textContent = avgResponseTime;
}

// 初始化页面事件
function initPageEvents() {
    // 分页控制
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            displayTickets(currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(ticketData.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            displayTickets(currentPage + 1);
        }
    });
    
    // 搜索按钮
    document.getElementById('search-btn').addEventListener('click', filterTickets);
    
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetFilters);
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportTickets);
    
    // AI标签点击
    document.querySelectorAll('.ai-tag').forEach(tag => {
        tag.addEventListener('click', handleAiTagClick);
    });
    
    // AI助手图标点击
    document.querySelector('.ai-assistant-icon').addEventListener('click', toggleAiAssistant);
    
    // AI助手关闭按钮
    document.querySelector('.ai-close-btn').addEventListener('click', toggleAiAssistant);
    
    // AI操作按钮
    document.querySelectorAll('.ai-action-btn').forEach(btn => {
        btn.addEventListener('click', handleAiAction);
    });
    
    // AI发送按钮
    document.querySelector('.ai-send-btn').addEventListener('click', sendAiQuestion);
    
    // AI输入框回车事件
    document.querySelector('.ai-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAiQuestion();
        }
    });
    
    // 委托事件：工单卡片上的操作按钮
    document.querySelector('.ticket-list').addEventListener('click', function(e) {
        // 查看按钮
        if (e.target.classList.contains('action-view')) {
            const ticketId = e.target.dataset.ticketId;
            const ticket = ticketData.find(t => t.id === ticketId);
            if (ticket) {
                openTicketDetail(ticket);
            }
        }
        
        // 受理按钮
        if (e.target.classList.contains('action-accept')) {
            e.stopPropagation();
            const ticketId = e.target.dataset.ticketId;
            acceptTicket(ticketId);
        }
        
        // 完成按钮
        if (e.target.classList.contains('action-complete')) {
            e.stopPropagation();
            const ticketId = e.target.dataset.ticketId;
            completeTicket(ticketId);
        }
        
        // 地图图标点击
        if (e.target.classList.contains('map-icon')) {
            e.stopPropagation();
            const siteName = e.target.dataset.site;
            openSiteMap(siteName);
        }
    });
    
    // 详情弹窗中的按钮
    document.getElementById('accept-ticket').addEventListener('click', () => {
        const ticketId = document.getElementById('modal-ticket-id').textContent;
        acceptTicket(ticketId);
        closeModals();
    });
    
    document.getElementById('complete-ticket').addEventListener('click', () => {
        const ticketId = document.getElementById('modal-ticket-id').textContent;
        completeTicket(ticketId);
        closeModals();
    });
    
    // 站点地图按钮
    document.getElementById('show-site-map').addEventListener('click', () => {
        const siteName = document.getElementById('modal-site-name').textContent;
        openSiteMap(siteName);
    });
    
    // 关闭弹窗按钮
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    });
    
    // 图片预览相关
    document.getElementById('preview-close').addEventListener('click', closeImagePreview);
    document.getElementById('preview-prev').addEventListener('click', () => navigatePreview('prev'));
    document.getElementById('preview-next').addEventListener('click', () => navigatePreview('next'));
    
    // 点击图片外部区域关闭预览
    document.getElementById('image-preview-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeImagePreview();
        }
    });
}

// 筛选工单
function filterTickets() {
    const siteFilter = document.getElementById('site-filter').value.toLowerCase();
    const typeFilter = document.getElementById('ticket-type-filter').value;
    
    // 获取所有选中的状态
    const statusFilters = [];
    document.querySelectorAll('input[name="status"]:checked').forEach(checkbox => {
        statusFilters.push(checkbox.value);
    });
    
    // 日期范围
    const dateFrom = new Date(document.getElementById('date-from').value);
    const dateTo = new Date(document.getElementById('date-to').value);
    // 将结束日期设置为当天的最后一毫秒，以便包含整个结束日期
    dateTo.setHours(23, 59, 59, 999);
    
    // 过滤工单
    const filteredTickets = ticketData.filter(ticket => {
        // 站点名称筛选
        if (siteFilter && !ticket.site.toLowerCase().includes(siteFilter)) {
            return false;
        }
        
        // 工单类型筛选
        if (typeFilter && ticket.type !== typeFilter) {
            return false;
        }
        
        // 状态筛选
        if (statusFilters.length > 0 && !statusFilters.includes(ticket.status)) {
            return false;
        }
        
        // 日期范围筛选
        const ticketDate = new Date(ticket.createdDate);
        if (ticketDate < dateFrom || ticketDate > dateTo) {
            return false;
        }
        
        return true;
    });
    
    // 更新全局工单数据
    ticketData.length = 0;
    ticketData.push(...filteredTickets);
    
    // 显示第一页
    displayTickets(1);
    
    // 显示筛选结果
    showNotification(`找到 ${filteredTickets.length} 条工单`);
}

// 重置筛选条件
function resetFilters() {
    document.getElementById('site-filter').value = '';
    document.getElementById('ticket-type-filter').value = '';
    
    // 重置状态复选框
    document.querySelectorAll('input[name="status"]').forEach(checkbox => {
        checkbox.checked = checkbox.value !== '已完成' && checkbox.value !== '已关闭';
    });
    
    // 重置日期范围
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    document.getElementById('date-from').value = formatDateValue(thirtyDaysAgo);
    document.getElementById('date-to').value = formatDateValue(now);
    
    // 重新生成工单数据
    generateTickets();
    
    showNotification('已重置筛选条件');
}

// 格式化日期为input value值
function formatDateValue(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 导出工单数据
function exportTickets() {
    showNotification('工单数据导出成功！');
    
    // 模拟下载CSV文件
    setTimeout(() => {
        const a = document.createElement('a');
        a.href = 'javascript:void(0);';
        a.download = `工单数据-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }, 500);
}

// 打开工单详情
function openTicketDetail(ticket) {
    // 格式化日期
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    // 设置详情内容
    document.getElementById('modal-ticket-title').textContent = ticket.title;
    document.getElementById('modal-ticket-id').textContent = ticket.id;
    document.getElementById('modal-site-name').textContent = ticket.site;
    document.getElementById('modal-ticket-type').textContent = ticket.type;
    
    // 设置优先级样式
    const priorityElement = document.getElementById('modal-priority');
    priorityElement.textContent = ticket.priority;
    priorityElement.className = `detail-value priority-${ticket.priority.toLowerCase()}`;
    
    // 添加火焰图标到高优先级
    if (ticket.priority === '高') {
        priorityElement.innerHTML = '<i class="fas fa-fire"></i> ' + ticket.priority;
    }
    
    document.getElementById('modal-create-time').textContent = formatDate(ticket.createdDate);
    document.getElementById('modal-deadline').textContent = formatDate(ticket.deadline);
    
    // 设置状态样式
    const statusElement = document.getElementById('modal-status');
    statusElement.textContent = ticket.status;
    
    statusElement.className = 'detail-value';
    switch (ticket.status) {
        case '新建': statusElement.classList.add('status-new'); break;
        case '已受理': statusElement.classList.add('status-accepted'); break;
        case '处理中': statusElement.classList.add('status-processing'); break;
        case '已完成': statusElement.classList.add('status-completed'); break;
        case '已关闭': statusElement.classList.add('status-closed'); break;
    }
    
    // 设置工单描述
    document.getElementById('modal-description').textContent = ticket.description;
    
    // 设置天气信息
    document.getElementById('modal-weather').textContent = 
        `${ticket.weather.icon} ${ticket.weather.temp}℃ 湿度${ticket.weather.humidity}%`;
        
    // 设置逾期标记
    const overdueBadge = document.getElementById('overdue-badge');
    if (ticket.isOverdue) {
        overdueBadge.style.display = 'flex';
    } else {
        overdueBadge.style.display = 'none';
    }
    
    // 设置进度步骤
    setProgressSteps(ticket.status);
    
    // 设置图片（随机图片）
    setRandomImages();
    
    // 显示或隐藏操作按钮
    const acceptButton = document.getElementById('accept-ticket');
    const completeButton = document.getElementById('complete-ticket');
    
    acceptButton.style.display = ticket.status === '新建' ? 'block' : 'none';
    completeButton.style.display = ticket.status === '处理中' ? 'block' : 'none';
    
    // 打开弹窗
    document.getElementById('ticket-detail-modal').classList.add('active');
}

// 设置进度步骤
function setProgressSteps(status) {
    const steps = document.querySelectorAll('.progress-step');
    // 重置所有步骤
    steps.forEach(step => {
        step.classList.remove('completed', 'active');
    });
    
    // 根据状态设置步骤样式
    switch (status) {
        case '新建':
            steps[0].classList.add('active');
            break;
        case '已受理':
            steps[0].classList.add('completed');
            steps[1].classList.add('active');
            break;
        case '处理中':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
            break;
        case '已完成':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('completed');
            steps[3].classList.add('active');
            break;
        case '已关闭':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('completed');
            steps[3].classList.add('completed');
            steps[4].classList.add('active');
            break;
    }
}

// 设置随机图片
function setRandomImages() {
    const imageContainer = document.getElementById('modal-images');
    imageContainer.innerHTML = '';
    
    // 设置3~5张随机图片
    const imageCount = Math.floor(Math.random() * 3) + 3;
    
    // 存储图片URL数组，用于预览功能
    window.galleryImages = [];
    
    for (let i = 1; i <= imageCount; i++) {
        // 随机图片编号（1~20）
        const imageNum = Math.floor(Math.random() * 20) + 101;
        const imageUrl = `https://picsum.photos/id/${imageNum}/600/400`;
        
        // 将图片URL添加到数组
        window.galleryImages.push(imageUrl);
        
        const galleryImage = document.createElement('div');
        galleryImage.className = 'gallery-image';
        galleryImage.dataset.index = i - 1; // 用于识别图片索引
        
        // 使用随机图片
        galleryImage.innerHTML = `<img src="${imageUrl}" alt="现场图片${i}">`;
        
        // 添加点击事件，打开预览
        galleryImage.addEventListener('click', function() {
            openImagePreview(parseInt(this.dataset.index));
        });
        
        imageContainer.appendChild(galleryImage);
    }
}

// 打开图片预览
function openImagePreview(index) {
    const modal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    
    // 设置当前预览图片索引
    window.currentPreviewIndex = index;
    
    // 设置图片源
    previewImage.src = window.galleryImages[index];
    
    // 显示弹窗
    modal.classList.add('active');
    
    // 添加键盘事件
    document.addEventListener('keydown', handlePreviewKeyDown);
}

// 关闭图片预览
function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    modal.classList.remove('active');
    
    // 移除键盘事件
    document.removeEventListener('keydown', handlePreviewKeyDown);
}

// 图片预览键盘事件处理
function handlePreviewKeyDown(e) {
    if (e.key === 'Escape') {
        closeImagePreview();
    } else if (e.key === 'ArrowLeft') {
        navigatePreview('prev');
    } else if (e.key === 'ArrowRight') {
        navigatePreview('next');
    }
}

// 预览图片导航
function navigatePreview(direction) {
    if (!window.galleryImages || window.galleryImages.length === 0) return;
    
    const totalImages = window.galleryImages.length;
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = (window.currentPreviewIndex - 1 + totalImages) % totalImages;
    } else {
        newIndex = (window.currentPreviewIndex + 1) % totalImages;
    }
    
    window.currentPreviewIndex = newIndex;
    
    // 更新图片
    document.getElementById('preview-image').src = window.galleryImages[newIndex];
}

// 受理工单
function acceptTicket(ticketId) {
    const ticket = ticketData.find(t => t.id === ticketId);
    if (ticket && ticket.status === '新建') {
        ticket.status = '已受理';
        
        // 更新卡片显示
        displayTickets(currentPage);
        
        // 显示通知
        showNotification(`工单 ${ticketId} 已受理`);
    }
}

// 完成工单
function completeTicket(ticketId) {
    const ticket = ticketData.find(t => t.id === ticketId);
    if (ticket && ticket.status === '处理中') {
        ticket.status = '已完成';
        
        // 更新卡片显示
        displayTickets(currentPage);
        
        // 显示通知
        showNotification(`工单 ${ticketId} 已完成`);
    }
}

// 打开站点地图
function openSiteMap(siteName) {
    document.getElementById('site-map-modal').classList.add('active');
    
    // 初始化地图
    setTimeout(() => {
        initMap(siteName);
    }, 100);
}

// 初始化地图
function initMap(siteName) {
    const mapContainer = document.getElementById('site-map-container');
    
    // 随机生成站点坐标（北京周边）
    const randomLng = 116.3 + Math.random() * 0.5; // 经度范围：116.3 ~ 116.8
    const randomLat = 39.9 + Math.random() * 0.3;  // 纬度范围：39.9 ~ 40.2
    
    // 创建地图实例
    const map = new AMap.Map(mapContainer, {
        zoom: 13,
        center: [randomLng, randomLat]
    });
    
    // 创建标记
    const marker = new AMap.Marker({
        position: new AMap.LngLat(randomLng, randomLat),
        title: siteName
    });
    
    // 将标记添加到地图
    map.add(marker);
    
    // 信息窗口
    const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding: 10px;"><h4>${siteName}</h4><p>地址：北京市某区某街道</p></div>`,
        offset: new AMap.Pixel(0, -30)
    });
    
    infoWindow.open(map, marker.getPosition());
}

// 关闭所有弹窗
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// 显示通知
function showNotification(message) {
    // 检查是否已有通知元素
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: rgba(73, 161, 141, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 1200;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                font-size: 14px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 设置消息内容
    notification.textContent = message;
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }, 10);
}

// AI助手相关功能
function toggleAiAssistant() {
    document.querySelector('.ai-assistant').classList.toggle('active');
}

// 处理AI操作
function handleAiAction(e) {
    const action = e.target.dataset.action;
    let aiResponse = '';
    
    if (action === 'summarize') {
        // 随机生成今日新增工单数量
        const newTicketsCount = Math.floor(Math.random() * 10) + 5;
        aiResponse = `今日新增${newTicketsCount}条工单，其中高优先级${Math.floor(Math.random() * newTicketsCount)}条，设备故障类占比${Math.floor(Math.random() * 60) + 20}%。建议优先处理昌平储能电站的逆变器告警，已超过3小时未响应。`;
    } else if (action === 'similar') {
        aiResponse = `查询到3条相似历史工单：
        1. #GD-220315-05：同类型设备出现过相似故障，原因是传感器误报。
        2. #GD-221102-11：确认是内部风扇故障，更换后解决问题。
        3. #GD-230728-08：由于灰尘积累导致散热不良，清理后恢复正常。`;
    } else if (action === 'suggest') {
        aiResponse = `当前有5条工单需要优先处理：
        1. 昌平储能电站逆变器过温告警（高优先级，已逾期）
        2. 宝安光储充电站电池组异常（高优先级，24小时内）
        3. 滨海充电桩通信中断（中优先级，已逾期）
        4. 南沙储能电站EMS系统维护（中优先级，48小时内）
        5. 西湖充电桩配储设备安装（低优先级，72小时内）`;
    }
    
    if (aiResponse) {
        // 添加AI回复
        addAiMessage(aiResponse);
    }
}

// 发送AI问题
function sendAiQuestion() {
    const inputField = document.querySelector('.ai-input');
    const question = inputField.value.trim();
    
    if (question) {
        // 随机生成AI回复
        const responses = [
            "根据分析，当前工单处理效率相比上周提升了12%，建议继续保持当前工作安排。",
            "已找到相关工单历史记录，显示此类问题通常在2-3小时内可以解决，主要原因是传感器数据异常。",
            "您关注的设备已连续工作超过2000小时，建议安排例行检修，避免潜在故障风险。",
            "系统预测下周工单量将增加约20%，主要集中在设备故障和例行巡检类型，建议提前做好人员调配。",
            "根据历史数据，该站点每月例行巡检工单平均完成时间为4.5小时，当前处理进度正常。"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // 添加AI回复
        addAiMessage(randomResponse);
        
        // 清空输入框
        inputField.value = '';
    }
}

// 添加AI消息
function addAiMessage(message) {
    const aiContent = document.querySelector('.ai-assistant-content');
    
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-assistant-message';
    messageDiv.textContent = message;
    
    // 添加到内容区域
    aiContent.insertBefore(messageDiv, document.querySelector('.ai-quick-actions'));
    
    // 滚动到底部
    aiContent.scrollTop = aiContent.scrollHeight;
}

// 处理AI标签点击
function handleAiTagClick(e) {
    const tagText = e.target.textContent;
    
    // 根据标签文本设置筛选条件
    if (tagText === '今日逾期工单') {
        document.getElementById('date-from').value = formatDateValue(new Date());
        document.getElementById('date-to').value = formatDateValue(new Date());
        
        // 勾选所有状态
        document.querySelectorAll('input[name="status"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // 筛选逾期工单
        ticketData.forEach(ticket => {
            ticket.isOverdue = true;
        });
        
    } else if (tagText === '高优先级未处理') {
        // 取消勾选已完成和已关闭
        document.querySelectorAll('input[name="status"]').forEach(checkbox => {
            if (checkbox.value === '已完成' || checkbox.value === '已关闭') {
                checkbox.checked = false;
            } else {
                checkbox.checked = true;
            }
        });
        
        // 筛选高优先级工单
        ticketData.forEach(ticket => {
            ticket.priority = '高';
        });
        
    } else if (tagText === '昌平储能站工单') {
        document.getElementById('site-filter').value = '昌平储能电站';
    } else if (tagText === '设备故障工单') {
        document.getElementById('ticket-type-filter').value = '设备故障';
    }
    
    // 执行筛选
    filterTickets();
} 