/**
 * 消息通知页面功能脚本
 * 实现消息通知的查看、标记已读、删除等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化消息通知页面
    initNotificationsPage();
});

/**
 * 初始化消息通知页面
 * 设置事件监听和加载初始数据
 */
function initNotificationsPage() {
    // 初始化标签页切换
    initTabsSwitch();
    
    // 初始化消息操作
    initNotificationActions();
    
    // 初始化消息筛选
    initNotificationFilters();
    
    // 初始化批量操作
    initBatchOperations();
    
    // 初始化分页
    initPagination();
    
    // 加载消息数据
    loadNotificationsData();
}

/**
 * 初始化标签页切换功能
 */
function initTabsSwitch() {
    const tabButtons = document.querySelectorAll('.notifications-tab-btn');
    const tabContents = document.querySelectorAll('.notifications-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标标签页ID
            const targetId = this.getAttribute('data-target');
            
            // 移除所有活动状态
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 设置当前活动标签页
            this.classList.add('active');
            
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
            
            // 更新消息未读数
            updateUnreadCount();
        });
    });
}

/**
 * 初始化消息操作功能
 */
function initNotificationActions() {
    // 标记为已读按钮
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            const notificationItem = this.closest('.notification-item');
            if (notificationItem) {
                markNotificationAsRead(notificationItem);
            }
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-notification-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            const notificationItem = this.closest('.notification-item');
            if (notificationItem) {
                deleteNotification(notificationItem);
            }
        });
    });
    
    // 点击整个消息项
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            // 对未读消息标记为已读
            if (this.classList.contains('unread')) {
                markNotificationAsRead(this);
            }
            
            // 显示消息详情
            showNotificationDetail(this);
        });
    });
}

/**
 * 初始化消息筛选功能
 */
function initNotificationFilters() {
    // 搜索框事件
    const searchBox = document.getElementById('notification-search');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            filterNotifications();
        });
    }
    
    // 仅显示未读消息复选框
    const unreadOnlyCheckbox = document.getElementById('unread-only');
    if (unreadOnlyCheckbox) {
        unreadOnlyCheckbox.addEventListener('change', function() {
            filterNotifications();
        });
    }
}

/**
 * 筛选消息
 */
function filterNotifications() {
    const searchBox = document.getElementById('notification-search');
    const unreadOnlyCheckbox = document.getElementById('unread-only');
    const searchText = searchBox ? searchBox.value.toLowerCase() : '';
    const unreadOnly = unreadOnlyCheckbox ? unreadOnlyCheckbox.checked : false;
    
    // 获取当前活动标签页中的所有消息
    const activeTab = document.querySelector('.notifications-tab-content.active');
    if (!activeTab) return;
    
    const notificationItems = activeTab.querySelectorAll('.notification-item');
    let matchCount = 0;
    
    notificationItems.forEach(item => {
        const title = item.querySelector('.notification-title').textContent.toLowerCase();
        const content = item.querySelector('.notification-content').textContent.toLowerCase();
        const isUnread = item.classList.contains('unread');
        
        // 检查是否符合搜索条件和未读筛选条件
        const matchesSearch = searchText === '' || title.includes(searchText) || content.includes(searchText);
        const matchesUnreadFilter = !unreadOnly || isUnread;
        
        if (matchesSearch && matchesUnreadFilter) {
            item.style.display = '';
            matchCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 显示无结果提示
    const noResultsElement = activeTab.querySelector('.no-notifications') || 
                           document.createElement('div');
    
    if (matchCount === 0) {
        if (!activeTab.querySelector('.no-notifications')) {
            noResultsElement.className = 'no-notifications';
            noResultsElement.innerHTML = '<i class="bi bi-inbox"></i><div>没有匹配的消息</div>';
            activeTab.appendChild(noResultsElement);
        }
        noResultsElement.style.display = 'flex';
    } else if (activeTab.querySelector('.no-notifications')) {
        noResultsElement.style.display = 'none';
    }
}

/**
 * 初始化批量操作功能
 */
function initBatchOperations() {
    // 全选复选框
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const activeTab = document.querySelector('.notifications-tab-content.active');
            if (!activeTab) return;
            
            const checkboxes = activeTab.querySelectorAll('.notification-checkbox:not(:disabled)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            
            // 更新批量操作按钮状态
            updateBatchActionsState();
        });
    }
    
    // 单个消息复选框事件
    document.querySelectorAll('.notification-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation(); // 防止触发消息项点击事件
            updateBatchActionsState();
        });
        
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发消息项点击事件
        });
    });
    
    // 批量标记已读按钮
    const batchReadBtn = document.getElementById('batch-read-btn');
    if (batchReadBtn) {
        batchReadBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.notifications-tab-content.active');
            if (!activeTab) return;
            
            const selectedItems = activeTab.querySelectorAll('.notification-checkbox:checked');
            if (selectedItems.length === 0) {
                showTooltip('提示', '请先选择消息', 'info');
                return;
            }
            
            // 批量标记已读
            selectedItems.forEach(checkbox => {
                const notificationItem = checkbox.closest('.notification-item');
                if (notificationItem && notificationItem.classList.contains('unread')) {
                    markNotificationAsRead(notificationItem);
                }
                checkbox.checked = false;
            });
            
            // 重置全选复选框
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            
            // 更新批量操作按钮状态
            updateBatchActionsState();
            
            showTooltip('成功', '已将选中消息标记为已读', 'success');
        });
    }
    
    // 批量删除按钮
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.notifications-tab-content.active');
            if (!activeTab) return;
            
            const selectedItems = activeTab.querySelectorAll('.notification-checkbox:checked');
            if (selectedItems.length === 0) {
                showTooltip('提示', '请先选择消息', 'info');
                return;
            }
            
            // 确认删除
            if (confirm(`确定要删除选中的 ${selectedItems.length} 条消息吗？`)) {
                // 批量删除
                selectedItems.forEach(checkbox => {
                    const notificationItem = checkbox.closest('.notification-item');
                    if (notificationItem) {
                        deleteNotification(notificationItem, false); // 不显示单条删除的提示
                    }
                });
                
                // 重置全选复选框
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
                
                // 更新批量操作按钮状态
                updateBatchActionsState();
                
                showTooltip('成功', `已删除 ${selectedItems.length} 条消息`, 'success');
            }
        });
    }
}

/**
 * 更新批量操作按钮状态
 */
function updateBatchActionsState() {
    const activeTab = document.querySelector('.notifications-tab-content.active');
    if (!activeTab) return;
    
    const selectedItems = activeTab.querySelectorAll('.notification-checkbox:checked');
    const batchReadBtn = document.getElementById('batch-read-btn');
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    
    if (batchReadBtn) {
        batchReadBtn.disabled = selectedItems.length === 0;
    }
    
    if (batchDeleteBtn) {
        batchDeleteBtn.disabled = selectedItems.length === 0;
    }
}

/**
 * 初始化分页功能
 */
function initPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const pageLinks = pagination.querySelectorAll('.page-link');
    const pageInfo = document.querySelector('.page-info');
    
    // 当前页码和总页数
    let currentPage = 1;
    const totalPages = 5; // 示例页数，实际应从后端获取
    
    // 更新页码信息
    if (pageInfo) {
        pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    }
    
    // 页码按钮点击事件
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.getAttribute('data-action');
            
            // 根据操作更新当前页码
            if (action === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (action === 'next' && currentPage < totalPages) {
                currentPage++;
            } else if (action === 'first') {
                currentPage = 1;
            } else if (action === 'last') {
                currentPage = totalPages;
            }
            
            // 更新页码信息
            if (pageInfo) {
                pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
            }
            
            // 禁用/启用上一页和下一页按钮
            pagination.querySelector('[data-action="first"]').disabled = currentPage === 1;
            pagination.querySelector('[data-action="prev"]').disabled = currentPage === 1;
            pagination.querySelector('[data-action="next"]').disabled = currentPage === totalPages;
            pagination.querySelector('[data-action="last"]').disabled = currentPage === totalPages;
            
            // 在实际应用中，这里应该调用API加载对应页的数据
            showTooltip('加载中', `正在加载第 ${currentPage} 页数据...`, 'info');
            
            // 模拟加载数据
            setTimeout(() => {
                // 实际项目中这里应该处理返回的数据并更新页面
                showTooltip('加载成功', `已加载第 ${currentPage} 页数据`, 'success');
            }, 500);
        });
    });
    
    // 初始化分页按钮状态
    pagination.querySelector('[data-action="first"]').disabled = currentPage === 1;
    pagination.querySelector('[data-action="prev"]').disabled = currentPage === 1;
    pagination.querySelector('[data-action="next"]').disabled = currentPage === totalPages;
    pagination.querySelector('[data-action="last"]').disabled = currentPage === totalPages;
}

/**
 * 标记消息为已读
 * @param {HTMLElement} notificationItem 消息项元素
 */
function markNotificationAsRead(notificationItem) {
    if (!notificationItem || !notificationItem.classList.contains('unread')) {
        return;
    }
    
    // 模拟API请求
    const notificationId = notificationItem.getAttribute('data-id');
    
    // 在实际应用中，这里应该调用API标记为已读
    console.log('标记消息为已读:', notificationId);
    
    // 更新UI
    notificationItem.classList.remove('unread');
    const readStatusIcon = notificationItem.querySelector('.notification-status i');
    if (readStatusIcon) {
        readStatusIcon.className = 'bi bi-check-circle';
    }
    
    // 更新按钮状态
    const markReadBtn = notificationItem.querySelector('.mark-read-btn');
    if (markReadBtn) {
        markReadBtn.style.display = 'none';
    }
    
    // 更新未读数量
    updateUnreadCount();
}

/**
 * 删除消息
 * @param {HTMLElement} notificationItem 消息项元素
 * @param {boolean} showConfirm 是否显示确认提示
 */
function deleteNotification(notificationItem, showConfirm = true) {
    if (!notificationItem) {
        return;
    }
    
    const notificationId = notificationItem.getAttribute('data-id');
    
    // 如果需要确认
    if (showConfirm && !confirm('确定要删除此消息吗？')) {
        return;
    }
    
    // 在实际应用中，这里应该调用API删除消息
    console.log('删除消息:', notificationId);
    
    // 渐变删除动画
    notificationItem.style.opacity = '0';
    notificationItem.style.maxHeight = '0';
    notificationItem.style.margin = '0';
    notificationItem.style.padding = '0';
    notificationItem.style.borderWidth = '0';
    
    // 移除元素
    setTimeout(() => {
        notificationItem.remove();
        
        // 检查列表是否为空
        const activeTab = document.querySelector('.notifications-tab-content.active');
        if (activeTab) {
            const visibleItems = activeTab.querySelectorAll('.notification-item[style*="display: none"]');
            if (visibleItems.length === 0) {
                // 创建并显示无消息提示
                const noNotifications = activeTab.querySelector('.no-notifications') || 
                                      document.createElement('div');
                noNotifications.className = 'no-notifications';
                noNotifications.innerHTML = '<i class="bi bi-inbox"></i><div>没有消息</div>';
                activeTab.appendChild(noNotifications);
                noNotifications.style.display = 'flex';
            }
        }
        
        // 更新未读数量
        updateUnreadCount();
    }, 300);
}

/**
 * 显示消息详情
 * @param {HTMLElement} notificationItem 消息项元素
 */
function showNotificationDetail(notificationItem) {
    const notificationId = notificationItem.getAttribute('data-id');
    const title = notificationItem.querySelector('.notification-title').textContent;
    const content = notificationItem.querySelector('.notification-content').textContent;
    
    // 在实际应用中，这里应该调用API获取完整消息内容
    console.log('查看消息详情:', notificationId);
    
    // 这里可以实现弹窗显示详情或页面跳转
    // 简单示例：创建模态窗口
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close-btn"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body">
                ${content}
                <div class="notification-detail-content">
                    <p>这是消息的详细内容，在实际应用中应从后端API获取。</p>
                    <p>消息ID: ${notificationId}</p>
                    <p>创建时间: 2023-06-15 14:30</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary modal-close-btn">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 关闭按钮事件
    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.remove();
            document.body.style.overflow = '';
        });
    });
    
    // 点击遮罩层关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

/**
 * 更新未读消息数量
 */
function updateUnreadCount() {
    // 获取所有未读消息
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    const unreadCount = unreadItems.length;
    
    // 更新标签页上的未读数量
    const systemUnreadCountElem = document.querySelector('#system-tab-btn .badge');
    const businessUnreadCountElem = document.querySelector('#business-tab-btn .badge');
    
    // 统计各类型未读消息
    let systemUnreadCount = 0;
    let businessUnreadCount = 0;
    
    unreadItems.forEach(item => {
        const tabId = item.closest('.notifications-tab-content').id;
        if (tabId === 'system-notifications') {
            systemUnreadCount++;
        } else if (tabId === 'business-notifications') {
            businessUnreadCount++;
        }
    });
    
    // 更新显示
    if (systemUnreadCountElem) {
        systemUnreadCountElem.textContent = systemUnreadCount;
        systemUnreadCountElem.style.display = systemUnreadCount > 0 ? 'flex' : 'none';
    }
    
    if (businessUnreadCountElem) {
        businessUnreadCountElem.textContent = businessUnreadCount;
        businessUnreadCountElem.style.display = businessUnreadCount > 0 ? 'flex' : 'none';
    }
    
    // 更新页面标题中的未读数量
    const headerTitle = document.querySelector('.notifications-header-title');
    if (headerTitle) {
        if (unreadCount > 0) {
            headerTitle.innerHTML = `消息通知 <span class="badge">${unreadCount}</span>`;
        } else {
            headerTitle.innerHTML = '消息通知';
        }
    }
    
    // 更新导航栏中的未读数量
    const navBadge = document.querySelector('#navbarDropdownMessages .badge');
    if (navBadge) {
        navBadge.textContent = unreadCount;
        navBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

/**
 * 加载消息数据
 * 在实际项目中，这里会从后端API获取数据
 */
function loadNotificationsData() {
    // 这里模拟从服务器加载数据
    // 实际项目中应该是异步获取数据并填充列表
    
    // 假设数据已加载，这里不做任何实际操作
    console.log('消息数据已加载');
} 