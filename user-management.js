/**
 * 用户管理页面脚本
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏（调用导航栏模板）
    if (typeof initNavbar === 'function') {
        initNavbar('user-management');
    }
    
    // 初始化页面
    initPage();
    
    // 初始化标签页切换
    initTabs();
    
    // 初始化模态框
    initModal();
    
    // 初始化账号管理
    initAccountManagement();
    
    // 初始化角色管理
    initRoleManagement();
});

/**
 * 初始化页面
 */
function initPage() {
    console.log('用户管理页面初始化完成');
}

/**
 * 初始化标签页切换
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const accountFilters = document.getElementById('account-filters');
    const roleFilters = document.getElementById('role-filters');
    const accountSection = document.getElementById('account-section');
    const roleSection = document.getElementById('role-section');
    
    // 为每个标签按钮添加点击事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有标签按钮的active类
            tabBtns.forEach(b => b.classList.remove('active'));
            // 为当前点击的按钮添加active类
            btn.classList.add('active');
            
            // 根据当前标签显示相应内容
            const tabName = btn.getAttribute('data-tab');
            
            if (tabName === 'account') {
                accountFilters.style.display = 'flex';
                roleFilters.style.display = 'none';
                accountSection.style.display = 'block';
                roleSection.style.display = 'none';
            } else if (tabName === 'role') {
                accountFilters.style.display = 'none';
                roleFilters.style.display = 'flex';
                accountSection.style.display = 'none';
                roleSection.style.display = 'block';
            }
        });
    });
}

/**
 * 初始化模态框
 */
function initModal() {
    const modalContainer = document.getElementById('modal-container');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    
    // 关闭模态框
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    
    // 点击模态框外部关闭模态框
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
}

/**
 * 打开模态框
 * @param {string} title - 模态框标题
 * @param {string|HTMLElement} content - 模态框内容(HTML字符串或DOM元素)
 * @param {Function} confirmCallback - 确认按钮回调函数
 */
function openModal(title, content, confirmCallback) {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirm = document.getElementById('modal-confirm');
    
    // 设置模态框标题
    modalTitle.textContent = title;
    
    // 设置模态框内容
    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        modalBody.innerHTML = '';
        modalBody.appendChild(content);
    }
    
    // 设置确认按钮回调
    if (typeof confirmCallback === 'function') {
        modalConfirm.onclick = confirmCallback;
    } else {
        modalConfirm.onclick = closeModal;
    }
    
    // 显示模态框
    modalContainer.classList.remove('modal-hidden');
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.classList.add('modal-hidden');
}

/**
 * 显示消息提示
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型(success, error, warning, info)
 */
function showMessage(message, type = 'info') {
    // 简单的提示实现，可以根据需要扩展为Toast组件
    openModal('系统提示', `<div class="message ${type}">${message}</div>`);
}

// 模拟账号数据
const MOCK_ACCOUNTS = [
    {
        id: 1,
        username: '刘德华',
        department: 'management',
        departmentName: '用户侧交付部',
        bindWechat: true,
        bindEmail: true,
        bindPhone: true,
        roles: ['系统管理员'],
        status: 'active',
        lastLogin: '2023-04-08 14:30:22',
        lastIp: '192.168.1.100'
    },
    {
        id: 2,
        username: '吴彦祖',
        department: 'operation',
        departmentName: '用户侧交付部',
        bindWechat: true,
        bindEmail: true,
        bindPhone: false,
        roles: ['运维人员'],
        status: 'active',
        lastLogin: '2023-04-08 10:15:43',
        lastIp: '192.168.1.101'
    },
    {
        id: 3,
        username: '周润发',
        department: 'tech',
        departmentName: 'EPC部',
        bindWechat: false,
        bindEmail: true,
        bindPhone: true,
        roles: ['技术人员', '站点查看员'],
        status: 'active',
        lastLogin: '2023-04-07 16:45:11',
        lastIp: '192.168.1.102'
    },
    {
        id: 4,
        username: '吴克群',
        department: 'service',
        departmentName: '售后运维部',
        bindWechat: true,
        bindEmail: false,
        bindPhone: true,
        roles: ['客服专员'],
        status: 'inactive',
        lastLogin: '2023-04-05 09:22:58',
        lastIp: '192.168.1.103'
    },
    {
        id: 5,
        username: '林俊杰',
        department: 'management',
        departmentName: '源网侧交付部',
        bindWechat: true,
        bindEmail: true,
        bindPhone: true,
        roles: ['部门管理员'],
        status: 'active',
        lastLogin: '2023-04-07 11:37:04',
        lastIp: '192.168.1.104'
    }
];

// 当前账号页
let currentAccountPage = 1;
// 每页显示数量
const PAGE_SIZE = 10;
// 当前账号筛选条件
let currentAccountFilters = {};

/**
 * 初始化账号管理
 */
function initAccountManagement() {
    // 初始化账号表格
    renderAccountsTable(MOCK_ACCOUNTS);
    
    // 初始化全选功能
    initAccountsSelectAll();
    
    // 初始化分页功能
    updatePagination(MOCK_ACCOUNTS.length);
    
    // 初始化搜索和筛选
    initAccountsFilter();
    
    // 初始化操作按钮
    initAccountActionButtons();
}

/**
 * 渲染账号表格
 * @param {Array} accounts - 账号数据数组
 */
function renderAccountsTable(accounts) {
    const tableBody = document.querySelector('#accounts-table tbody');
    tableBody.innerHTML = '';
    
    // 如果没有数据，显示空状态
    if (accounts.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" style="text-align: center; padding: 20px;">暂无数据</td>`;
        tableBody.appendChild(tr);
        return;
    }
    
    // 计算当前页的账号
    const start = (currentAccountPage - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, accounts.length);
    const currentPageAccounts = accounts.slice(start, end);
    
    // 渲染每一行数据
    currentPageAccounts.forEach(account => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="account-checkbox" data-id="${account.id}"></td>
            <td>${account.username}</td>
            <td>${account.departmentName}</td>
            <td>
                <div class="binding-status">
                    <span class="binding-icon ${account.bindWechat ? 'bound' : 'unbound'}">
                        <i class="fab fa-weixin"></i>
                    </span>
                    <span class="binding-icon ${account.bindEmail ? 'bound' : 'unbound'}">
                        <i class="fas fa-envelope"></i>
                    </span>
                    <span class="binding-icon ${account.bindPhone ? 'bound' : 'unbound'}">
                        <i class="fas fa-phone"></i>
                    </span>
                </div>
            </td>
            <td>
                ${account.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
            </td>
            <td>
                <span class="status-tag ${account.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${account.status === 'active' ? '启用' : '停用'}
                </span>
            </td>
            <td>${account.lastLogin}</td>
            <td>
                <button class="table-action-btn edit-btn" data-id="${account.id}" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="table-action-btn log-btn" data-id="${account.id}" title="修改日志">
                    <i class="fas fa-history"></i>
                </button>
                <button class="table-action-btn delete-btn" data-id="${account.id}" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    // 初始化表格中的操作按钮事件
    initTableActionButtons();
}

/**
 * 初始化表格中的操作按钮事件
 */
function initTableActionButtons() {
    // 获取所有编辑按钮
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            // 根据ID找到账号数据
            const account = MOCK_ACCOUNTS.find(acc => acc.id == accountId);
            editAccount(account);
        });
    });
    
    // 获取所有修改日志按钮
    const logBtns = document.querySelectorAll('.log-btn');
    logBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            // 根据ID找到账号数据
            const account = MOCK_ACCOUNTS.find(acc => acc.id == accountId);
            viewAccountChangeLog(account);
        });
    });
    
    // 获取所有删除按钮
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            // 根据ID找到账号数据
            const account = MOCK_ACCOUNTS.find(acc => acc.id == accountId);
            deleteAccount(account);
        });
    });
}

/**
 * 初始化全选功能
 */
function initAccountsSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all-accounts');
    
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.account-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });
}

/**
 * 更新分页信息
 * @param {number} totalAccounts - 账号总数
 */
function updatePagination(totalAccounts) {
    const totalPages = Math.ceil(totalAccounts / PAGE_SIZE);
    document.getElementById('current-page').textContent = currentAccountPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // 上一页按钮
    const prevPageBtn = document.getElementById('prev-page');
    prevPageBtn.disabled = currentAccountPage <= 1;
    prevPageBtn.addEventListener('click', function() {
        if (currentAccountPage > 1) {
            currentAccountPage--;
            applyAccountsFilter();
        }
    });
    
    // 下一页按钮
    const nextPageBtn = document.getElementById('next-page');
    nextPageBtn.disabled = currentAccountPage >= totalPages;
    nextPageBtn.addEventListener('click', function() {
        if (currentAccountPage < totalPages) {
            currentAccountPage++;
            applyAccountsFilter();
        }
    });
}

/**
 * 初始化账号筛选功能
 */
function initAccountsFilter() {
    const filterApplyBtn = document.getElementById('filter-apply');
    const filterResetBtn = document.getElementById('filter-reset');
    
    // 应用筛选
    filterApplyBtn.addEventListener('click', function() {
        currentAccountPage = 1; // 重置为第一页
        applyAccountsFilter();
    });
    
    // 重置筛选
    filterResetBtn.addEventListener('click', function() {
        document.getElementById('department-filter').value = '';
        document.getElementById('binding-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('search-input').value = '';
        
        currentAccountFilters = {};
        currentAccountPage = 1;
        
        applyAccountsFilter();
    });
    
    // 搜索功能
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', function() {
        currentAccountPage = 1;
        applyAccountsFilter();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentAccountPage = 1;
            applyAccountsFilter();
        }
    });
}

/**
 * 应用账号筛选条件
 */
function applyAccountsFilter() {
    // 获取筛选值
    const departmentFilter = document.getElementById('department-filter').value;
    const bindingFilter = document.getElementById('binding-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    
    // 更新当前筛选条件
    currentAccountFilters = {
        department: departmentFilter,
        binding: bindingFilter,
        status: statusFilter,
        search: searchValue
    };
    
    // 应用筛选
    let filteredAccounts = MOCK_ACCOUNTS;
    
    // 部门筛选
    if (departmentFilter) {
        filteredAccounts = filteredAccounts.filter(account => account.department === departmentFilter);
    }
    
    // 绑定状态筛选
    if (bindingFilter) {
        if (bindingFilter === 'wechat-bound') {
            filteredAccounts = filteredAccounts.filter(account => account.bindWechat);
        } else if (bindingFilter === 'wechat-unbound') {
            filteredAccounts = filteredAccounts.filter(account => !account.bindWechat);
        } else if (bindingFilter === 'email-bound') {
            filteredAccounts = filteredAccounts.filter(account => account.bindEmail);
        } else if (bindingFilter === 'email-unbound') {
            filteredAccounts = filteredAccounts.filter(account => !account.bindEmail);
        } else if (bindingFilter === 'phone-bound') {
            filteredAccounts = filteredAccounts.filter(account => account.bindPhone);
        } else if (bindingFilter === 'phone-unbound') {
            filteredAccounts = filteredAccounts.filter(account => !account.bindPhone);
        }
    }
    
    // 账号状态筛选
    if (statusFilter) {
        filteredAccounts = filteredAccounts.filter(account => account.status === statusFilter);
    }
    
    // 搜索筛选
    if (searchValue) {
        filteredAccounts = filteredAccounts.filter(account => 
            account.username.toLowerCase().includes(searchValue) || 
            account.departmentName.toLowerCase().includes(searchValue) ||
            account.roles.some(role => role.toLowerCase().includes(searchValue))
        );
    }
    
    // 更新表格和分页
    renderAccountsTable(filteredAccounts);
    updatePagination(filteredAccounts.length);
}

/**
 * 初始化账号管理操作按钮
 */
function initAccountActionButtons() {
    // 新增账号按钮
    const addAccountBtn = document.getElementById('add-account');
    addAccountBtn.addEventListener('click', function() {
        addNewAccount();
    });
    
    // 批量停用按钮
    const batchDisableBtn = document.getElementById('batch-disable');
    batchDisableBtn.addEventListener('click', function() {
        batchDisableAccounts();
    });
    
    // 批量分配角色按钮
    const batchAssignRoleBtn = document.getElementById('batch-assign-role');
    batchAssignRoleBtn.addEventListener('click', function() {
        batchAssignRoles();
    });
    
    // 导出数据按钮
    const exportAccountsBtn = document.getElementById('export-accounts');
    exportAccountsBtn.addEventListener('click', function() {
        exportAccountsData();
    });
}

/**
 * 添加新账号
 */
function addNewAccount() {
    const formHtml = `
        <div class="form-group">
            <label for="account-username">账号名称</label>
            <input type="text" id="account-username" class="form-control" placeholder="请输入账号名称">
        </div>
        <div class="form-group">
            <label for="account-password">初始密码</label>
            <input type="password" id="account-password" class="form-control" placeholder="请输入初始密码">
        </div>
        <div class="form-group">
            <label for="account-department">所在部门</label>
            <select id="account-department" class="form-control">
                <option value="">请选择部门</option>
                <option value="management">用户侧交付部</option>
                <option value="operation">源网侧交付部</option>
                <option value="tech">售后运维部</option>
                <option value="service">EPC部</option>
            </select>
        </div>
        <div class="form-group">
            <label for="account-role">绑定角色</label>
            <select id="account-role" class="form-control" multiple>
                <option value="系统管理员">系统管理员</option>
                <option value="部门管理员">部门管理员</option>
                <option value="运维人员">运维人员</option>
                <option value="技术人员">技术人员</option>
                <option value="客服专员">客服专员</option>
                <option value="站点查看员">站点查看员</option>
            </select>
        </div>
        <div class="form-group">
            <label>账号状态</label>
            <div>
                <label style="display: inline-block; margin-right: 15px;">
                    <input type="radio" name="account-status" value="active" checked> 启用
                </label>
                <label style="display: inline-block;">
                    <input type="radio" name="account-status" value="inactive"> 停用
                </label>
            </div>
        </div>
    `;
    
    openModal('新增账号', formHtml, function() {
        // 这里只是演示，实际应该保存数据
        showMessage('账号添加成功', 'success');
        closeModal();
    });
}

/**
 * 编辑账号
 * @param {Object} account - 账号数据
 */
function editAccount(account) {
    const formHtml = `
        <div class="form-group">
            <label for="edit-username">账号名称</label>
            <input type="text" id="edit-username" class="form-control" value="${account.username}">
        </div>
        <div class="form-group">
            <label for="edit-department">所在部门</label>
            <select id="edit-department" class="form-control">
                <option value="management" ${account.department === 'management' ? 'selected' : ''}>用户侧交付部</option>
                <option value="operation" ${account.department === 'operation' ? 'selected' : ''}>源网侧交付部</option>
                <option value="tech" ${account.department === 'tech' ? 'selected' : ''}>售后运维部</option>
                <option value="service" ${account.department === 'service' ? 'selected' : ''}>EPC部</option>
            </select>
        </div>
        <div class="form-group">
            <label for="edit-role">绑定角色</label>
            <select id="edit-role" class="form-control" multiple>
                <option value="系统管理员" ${account.roles.includes('系统管理员') ? 'selected' : ''}>系统管理员</option>
                <option value="部门管理员" ${account.roles.includes('部门管理员') ? 'selected' : ''}>部门管理员</option>
                <option value="运维人员" ${account.roles.includes('运维人员') ? 'selected' : ''}>运维人员</option>
                <option value="技术人员" ${account.roles.includes('技术人员') ? 'selected' : ''}>技术人员</option>
                <option value="客服专员" ${account.roles.includes('客服专员') ? 'selected' : ''}>客服专员</option>
                <option value="站点查看员" ${account.roles.includes('站点查看员') ? 'selected' : ''}>站点查看员</option>
            </select>
            <div class="form-text" style="font-size: 12px; color: #666; margin-top: 5px;">按住Ctrl键可多选</div>
        </div>
        <div class="form-group">
            <label>绑定状态</label>
            <div style="display: flex; gap: 15px;">
                <label>
                    <input type="checkbox" id="edit-wechat" ${account.bindWechat ? 'checked' : ''}> 微信
                </label>
                <label>
                    <input type="checkbox" id="edit-email" ${account.bindEmail ? 'checked' : ''}> 邮箱
                </label>
                <label>
                    <input type="checkbox" id="edit-phone" ${account.bindPhone ? 'checked' : ''}> 电话
                </label>
            </div>
        </div>
        <div class="form-group">
            <label>账号状态</label>
            <div>
                <label style="display: inline-block; margin-right: 15px;">
                    <input type="radio" name="edit-status" value="active" ${account.status === 'active' ? 'checked' : ''}> 启用
                </label>
                <label style="display: inline-block;">
                    <input type="radio" name="edit-status" value="inactive" ${account.status === 'inactive' ? 'checked' : ''}> 停用
                </label>
            </div>
        </div>
    `;
    
    openModal('编辑账号', formHtml, function() {
        // 获取编辑后的数据
        const newUsername = document.getElementById('edit-username').value;
        const newDepartment = document.getElementById('edit-department').value;
        const newDepartmentName = document.getElementById('edit-department').options[document.getElementById('edit-department').selectedIndex].text;
        const newRoles = Array.from(document.getElementById('edit-role').selectedOptions).map(option => option.value);
        const newBindWechat = document.getElementById('edit-wechat').checked;
        const newBindEmail = document.getElementById('edit-email').checked;
        const newBindPhone = document.getElementById('edit-phone').checked;
        const newStatus = document.querySelector('input[name="edit-status"]:checked').value;
        
        // 记录变更
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;
        
        // 检查是否有变更，并记录变更日志
        if (!account.changeLogs) {
            account.changeLogs = [];
        }
        
        // 检查角色变更
        if (JSON.stringify(account.roles) !== JSON.stringify(newRoles)) {
            account.changeLogs.push({
                time: formattedDate,
                user: '当前用户', // 实际应用中应当使用登录用户的信息
                action: '修改角色权限',
                details: `从 [${account.roles.join(', ')}] 修改为 [${newRoles.join(', ')}]`
            });
        }
        
        // 检查部门变更
        if (account.department !== newDepartment) {
            account.changeLogs.push({
                time: formattedDate,
                user: '当前用户',
                action: '修改部门',
                details: `从 [${account.departmentName}] 修改为 [${newDepartmentName}]`
            });
        }
        
        // 检查状态变更
        if (account.status !== newStatus) {
            account.changeLogs.push({
                time: formattedDate,
                user: '当前用户',
                action: '修改账号状态',
                details: `从 [${account.status === 'active' ? '启用' : '停用'}] 修改为 [${newStatus === 'active' ? '启用' : '停用'}]`
            });
        }
        
        // 更新账号信息
        account.username = newUsername;
        account.department = newDepartment;
        account.departmentName = newDepartmentName;
        account.roles = newRoles;
        account.bindWechat = newBindWechat;
        account.bindEmail = newBindEmail;
        account.bindPhone = newBindPhone;
        account.status = newStatus;
        
        // 重新渲染账号表格
        renderAccountsTable(MOCK_ACCOUNTS);
        
        showMessage('账号更新成功', 'success');
        closeModal();
    });
}

/**
 * 删除账号
 * @param {Object} account - 账号数据
 */
function deleteAccount(account) {
    openModal('删除账号', `<p>确定要删除账号 "${account.username}" 吗？此操作不可恢复。</p>`, function() {
        showMessage('账号删除成功', 'success');
        closeModal();
    });
}

/**
 * 批量停用账号
 */
function batchDisableAccounts() {
    const selectedCheckboxes = document.querySelectorAll('.account-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showMessage('请先选择要停用的账号', 'warning');
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    openModal('批量停用账号', `<p>确定要停用选中的 ${selectedIds.length} 个账号吗？</p>`, function() {
        showMessage('已成功停用所选账号', 'success');
        closeModal();
    });
}

/**
 * 批量分配角色
 */
function batchAssignRoles() {
    const selectedCheckboxes = document.querySelectorAll('.account-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showMessage('请先选择要分配角色的账号', 'warning');
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    const formHtml = `
        <p>为 ${selectedIds.length} 个所选账号分配角色：</p>
        <div class="form-group" style="margin-top: 15px;">
            <select id="batch-role" class="form-control" multiple>
                <option value="系统管理员">系统管理员</option>
                <option value="部门管理员">部门管理员</option>
                <option value="运维人员">运维人员</option>
                <option value="技术人员">技术人员</option>
                <option value="客服专员">客服专员</option>
                <option value="站点查看员">站点查看员</option>
            </select>
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="remove-existing"> 移除已有角色
            </label>
        </div>
    `;
    
    openModal('批量分配角色', formHtml, function() {
        showMessage('角色分配成功', 'success');
        closeModal();
    });
}

/**
 * 导出账号数据
 */
function exportAccountsData() {
    showMessage('账号数据导出成功，已保存到您的下载文件夹', 'success');
}

/**
 * 查看账号修改日志
 * @param {Object} account - 账号数据
 */
function viewAccountChangeLog(account) {
    // 获取账号的实际变更日志
    const logs = account.changeLogs || [];
    
    // 如果没有日志，显示提示信息
    let logsContent = '';
    if (logs.length === 0) {
        logsContent = '<tr><td colspan="4" style="text-align: center; padding: 20px;">暂无修改记录</td></tr>';
    } else {
        logsContent = logs.map(log => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.time}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.user}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.action}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.details}</td>
            </tr>
        `).join('');
    }
    
    const logsHtml = `
        <div style="margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px; color: var(--secondary-color);">${account.username} 账号修改日志</h4>
            <p style="color: #666;">记录了账号信息的变更历史，包括角色权限、账号状态、部门等变更记录</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">时间</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">操作人</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">操作类型</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">变更详情</th>
                </tr>
            </thead>
            <tbody>
                ${logsContent}
            </tbody>
        </table>
    `;
    
    openModal(`账号修改日志 - ${account.username}`, logsHtml);
}

// 为模拟账号数据添加变更日志字段
MOCK_ACCOUNTS.forEach(account => {
    // 初始化变更日志
    if (!account.changeLogs) {
        account.changeLogs = [
            {
                time: '2023-04-01 10:25:36',
                user: 'admin',
                action: '创建账号',
                details: `初始角色: ${account.roles.join(', ')}`
            }
        ];
        
        // 为系统管理员添加更多示例日志
        if (account.username === 'admin') {
            account.changeLogs.push(
                {
                    time: '2023-04-02 14:30:22',
                    user: 'system',
                    action: '系统初始化',
                    details: '设置为系统超级管理员'
                },
                {
                    time: '2023-04-05 09:15:43',
                    user: 'admin',
                    action: '修改账号权限',
                    details: '添加全部站点访问权限'
                }
            );
        }
    }
});

// 模拟角色数据
const MOCK_ROLES = [
    {
        id: 1,
        name: '系统管理员',
        userCount: 1,
        sitePermission: 'all',
        pagePermissions: {
            'monitor': ['view', 'operate', 'config'],
            'maintenance': ['view', 'operate', 'config'],
            'analysis': ['view', 'operate', 'config'],
            'admin': ['view', 'operate', 'config']
        }
    },
    {
        id: 2,
        name: '运维人员',
        userCount: 5,
        sitePermission: 'specific',
        pagePermissions: {
            'monitor': ['view', 'operate'],
            'maintenance': ['view', 'operate'],
            'analysis': [],
            'admin': []
        }
    },
    {
        id: 3,
        name: '技术人员',
        userCount: 8,
        sitePermission: 'specific',
        pagePermissions: {
            'monitor': ['view', 'operate'],
            'maintenance': ['view', 'operate'],
            'analysis': ['view'],
            'admin': []
        }
    },
    {
        id: 4,
        name: '站点查看员',
        userCount: 12,
        sitePermission: 'specific',
        pagePermissions: {
            'monitor': ['view'],
            'maintenance': [],
            'analysis': [],
            'admin': []
        }
    },
    {
        id: 5,
        name: '部门管理员',
        userCount: 3,
        sitePermission: 'all',
        pagePermissions: {
            'monitor': ['view', 'operate', 'config'],
            'maintenance': ['view', 'operate', 'config'],
            'analysis': ['view', 'operate'],
            'admin': []
        }
    },
    {
        id: 6,
        name: '客服专员',
        userCount: 6,
        sitePermission: 'deny',
        pagePermissions: {
            'monitor': [],
            'maintenance': [],
            'analysis': ['view'],
            'admin': []
        }
    }
];

/**
 * 初始化角色管理
 */
function initRoleManagement() {
    // 渲染角色卡片
    renderRoleCards();
    
    // 初始化角色操作按钮
    initRoleActionButtons();
    
    // 初始化角色筛选
    initRoleFilter();
}

/**
 * 渲染角色卡片
 * @param {Array} roles - 角色数据，不传则使用所有角色
 */
function renderRoleCards(roles = MOCK_ROLES) {
    const rolesContainer = document.querySelector('.roles-container');
    rolesContainer.innerHTML = '';
    
    // 如果没有数据，显示空状态
    if (roles.length === 0) {
        rolesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">暂无角色数据</p>';
        return;
    }
    
    // 页面权限映射
    const pagePermissionMap = {
        'monitor': '监控中心',
        'maintenance': '运维管理',
        'analysis': '数据分析',
        'admin': '后台管理'
    };
    
    // 操作权限映射
    const actionPermissionMap = {
        'view': '查看',
        'operate': '操作',
        'config': '配置'
    };
    
    // 渲染每个角色卡片
    roles.forEach(role => {
        // 生成页面权限展示
        const pagePermissionsHtml = Object.keys(role.pagePermissions || {})
            .filter(page => role.pagePermissions[page] && role.pagePermissions[page].length > 0)
            .map(page => {
                const actions = role.pagePermissions[page]
                    .map(action => actionPermissionMap[action])
                    .join('、');
                return `${pagePermissionMap[page]}(${actions})`;
            })
            .join(' ');
        
        const roleCard = document.createElement('div');
        roleCard.className = 'role-card';
        roleCard.innerHTML = `
            <div class="role-card-header">
                <h3 class="role-card-title">${role.name}</h3>
                <div class="role-card-users">当前使用人数: ${role.userCount}</div>
            </div>
            <div class="role-card-body">
                <div class="role-permission-item">
                    <div class="role-permission-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="role-permission-text">
                        站点权限: ${
                            role.sitePermission === 'all' ? '全部站点' : 
                            role.sitePermission === 'specific' ? '指定站点' : 
                            '禁止访问站点'
                        }
                    </div>
                </div>
                <div class="role-permission-item">
                    <div class="role-permission-icon">
                        <i class="fas fa-th-large"></i>
                    </div>
                    <div class="role-permission-text">
                        页面权限: ${pagePermissionsHtml || '无'}
                    </div>
                </div>
            </div>
            <div class="role-card-footer">
                <button class="role-card-action" data-action="edit" data-id="${role.id}">编辑</button>
                <button class="role-card-action" data-action="preview" data-id="${role.id}">权限预览</button>
                <button class="role-card-action" data-action="log" data-id="${role.id}">变更日志</button>
                <button class="role-card-action" data-action="copy" data-id="${role.id}">复制角色</button>
            </div>
        `;
        rolesContainer.appendChild(roleCard);
    });
    
    // 添加角色卡片操作事件
    initRoleCardActions();
}

/**
 * 初始化角色卡片操作事件
 */
function initRoleCardActions() {
    const actionButtons = document.querySelectorAll('.role-card-action');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const roleId = this.getAttribute('data-id');
            const role = MOCK_ROLES.find(r => r.id == roleId);
            
            switch (action) {
                case 'edit':
                    editRole(role);
                    break;
                case 'preview':
                    previewRolePermissions(role);
                    break;
                case 'log':
                    viewRoleChangeLog(role);
                    break;
                case 'copy':
                    copyRole(role);
                    break;
            }
        });
    });
}

/**
 * 初始化角色操作按钮
 */
function initRoleActionButtons() {
    // 新增角色按钮
    const addRoleBtn = document.getElementById('add-role');
    addRoleBtn.addEventListener('click', function() {
        addNewRole();
    });
    
    // 导出角色按钮
    const exportRolesBtn = document.getElementById('export-roles');
    exportRolesBtn.addEventListener('click', function() {
        exportRolesData();
    });
}

/**
 * 初始化角色筛选功能
 */
function initRoleFilter() {
    const roleFilterApplyBtn = document.getElementById('role-filter-apply');
    const roleFilterResetBtn = document.getElementById('role-filter-reset');
    const permissionFilter = document.getElementById('permission-filter');
    const searchInput = document.getElementById('search-input');
    
    // 应用筛选
    roleFilterApplyBtn.addEventListener('click', function() {
        applyRoleFilter();
    });
    
    // 重置筛选
    roleFilterResetBtn.addEventListener('click', function() {
        permissionFilter.value = '';
        searchInput.value = '';
        applyRoleFilter();
    });
    
    // 搜索功能
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', function() {
        applyRoleFilter();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyRoleFilter();
        }
    });
}

/**
 * 应用角色筛选条件
 */
function applyRoleFilter() {
    const permissionFilter = document.getElementById('permission-filter').value;
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    
    let filteredRoles = MOCK_ROLES;
    
    // 权限类型筛选
    if (permissionFilter) {
        filteredRoles = filteredRoles.filter(role => role.pagePermissions[permissionFilter] && role.pagePermissions[permissionFilter].length > 0);
    }
    
    // 搜索筛选
    if (searchValue) {
        filteredRoles = filteredRoles.filter(role => 
            role.name.toLowerCase().includes(searchValue)
        );
    }
    
    // 更新角色卡片
    renderRoleCards(filteredRoles);
}

/**
 * 添加新角色
 */
function addNewRole() {
    // 模拟站点数据
    const mockSites = [
        { id: 1, name: '金华电器储能电站', region: '用户侧储能' },
        { id: 2, name: '成都鑫众泰储能电站', region: '用户侧储能' },
        { id: 3, name: '南京清研院储能电站', region: '用户侧储能' },
        { id: 4, name: '广东中建储能电站', region: '工商业储能' },
        { id: 5, name: '西藏林芝储能电站', region: '台区配储' },
        { id: 6, name: '惠州新能源充电站', region: '充电设施' },
        { id: 7, name: '西安光储一体化电站', region: '光储一体' },
        { id: 8, name: '长春智慧微电网', region: '微电网' }
    ];
    
    const formHtml = `
        <div class="form-group">
            <label for="role-name">角色名称</label>
            <input type="text" id="role-name" class="form-control" placeholder="请输入角色名称">
        </div>
        
        <div class="form-group">
            <label>站点权限</label>
            <div class="permission-options" style="display: flex; gap: 20px; margin-top: 5px;">
                <div>
                    <input type="radio" name="site-permission" id="new-all-sites" value="all" checked>
                    <label for="new-all-sites">全部站点</label>
                </div>
                <div>
                    <input type="radio" name="site-permission" id="new-specific-sites" value="specific">
                    <label for="new-specific-sites">指定站点</label>
                </div>
                <div>
                    <input type="radio" name="site-permission" id="new-deny-sites" value="deny">
                    <label for="new-deny-sites">禁止访问站点</label>
                </div>
            </div>
        </div>
        
        <!-- 站点列表，默认隐藏 -->
        <div id="new-site-list-container" class="form-group" style="display: none; margin-top: 10px; margin-left: 20px;">
            <div class="permission-tree" style="max-height: 200px; overflow-y: auto;">
                ${mockSites.map(site => `
                    <div class="tree-item" style="margin-bottom: 8px;">
                        <input type="checkbox" class="site-checkbox" id="new-site-${site.id}" data-site-id="${site.id}">
                        <label for="new-site-${site.id}">${site.name} <span style="color: #666; font-size: 12px;">(${site.region})</span></label>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="form-group">
            <label>页面权限</label>
            <div class="permission-matrix" style="margin-top: 15px; border: 1px solid #eee; border-radius: 5px; padding: 15px;">
                <!-- 监控中心权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="new-page-monitor" class="page-checkbox" data-page="monitor">
                        <label for="new-page-monitor" style="margin-left: 5px; font-weight: 600;">监控中心</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="new-monitor-view" class="action-checkbox" data-page="monitor" data-action="view" disabled>
                            <label for="new-monitor-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-monitor-operate" class="action-checkbox" data-page="monitor" data-action="operate" disabled>
                            <label for="new-monitor-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-monitor-config" class="action-checkbox" data-page="monitor" data-action="config" disabled>
                            <label for="new-monitor-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 运维管理权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="new-page-maintenance" class="page-checkbox" data-page="maintenance">
                        <label for="new-page-maintenance" style="margin-left: 5px; font-weight: 600;">运维管理</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="new-maintenance-view" class="action-checkbox" data-page="maintenance" data-action="view" disabled>
                            <label for="new-maintenance-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-maintenance-operate" class="action-checkbox" data-page="maintenance" data-action="operate" disabled>
                            <label for="new-maintenance-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-maintenance-config" class="action-checkbox" data-page="maintenance" data-action="config" disabled>
                            <label for="new-maintenance-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 数据分析权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="new-page-analysis" class="page-checkbox" data-page="analysis">
                        <label for="new-page-analysis" style="margin-left: 5px; font-weight: 600;">数据分析</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="new-analysis-view" class="action-checkbox" data-page="analysis" data-action="view" disabled>
                            <label for="new-analysis-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-analysis-operate" class="action-checkbox" data-page="analysis" data-action="operate" disabled>
                            <label for="new-analysis-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-analysis-config" class="action-checkbox" data-page="analysis" data-action="config" disabled>
                            <label for="new-analysis-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 后台管理权限 -->
                <div class="page-permission-section">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="new-page-admin" class="page-checkbox" data-page="admin">
                        <label for="new-page-admin" style="margin-left: 5px; font-weight: 600;">后台管理</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="new-admin-view" class="action-checkbox" data-page="admin" data-action="view" disabled>
                            <label for="new-admin-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-admin-operate" class="action-checkbox" data-page="admin" data-action="operate" disabled>
                            <label for="new-admin-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="new-admin-config" class="action-checkbox" data-page="admin" data-action="config" disabled>
                            <label for="new-admin-config">配置</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('新增角色', formHtml, function() {
        // DEMO示例，直接在控制台输出收集的数据
        const roleName = document.getElementById('role-name').value;
        if (!roleName) {
            showMessage('请输入角色名称', 'warning');
            return;
        }
        
        const sitePermission = document.querySelector('input[name="site-permission"]:checked').value;
        
        // 如果选择了指定站点或禁止访问站点，则获取选中的站点ID
        let selectedSiteIds = [];
        if (sitePermission !== 'all') {
            selectedSiteIds = Array.from(document.querySelectorAll('.site-checkbox:checked'))
                                  .map(checkbox => parseInt(checkbox.getAttribute('data-site-id')));
            
            if (selectedSiteIds.length === 0) {
                showMessage(`请至少选择一个${sitePermission === 'specific' ? '可访问' : '禁止访问'}的站点`, 'warning');
                return;
            }
        }
        
        // 获取页面和操作权限
        const pagePermissions = {};
        const pages = ['monitor', 'maintenance', 'analysis', 'admin'];
        
        pages.forEach(page => {
            pagePermissions[page] = [];
            const actions = ['view', 'operate', 'config'];
            
            if (document.getElementById(`new-page-${page}`).checked) {
                actions.forEach(action => {
                    if (document.getElementById(`new-${page}-${action}`).checked) {
                        pagePermissions[page].push(action);
                    }
                });
            }
        });
        
        // 打印收集的数据（仅用于DEMO演示）
        console.log('新增角色数据:', {
            name: roleName,
            sitePermission: sitePermission,
            selectedSites: selectedSiteIds,
            pagePermissions: pagePermissions
        });
        
        // 添加到模拟数据（仅用于DEMO演示）
        const newId = Math.max(...MOCK_ROLES.map(r => r.id)) + 1;
        MOCK_ROLES.push({
            id: newId,
            name: roleName,
            userCount: 0,
            sitePermission: sitePermission,
            pagePermissions: pagePermissions
        });
        
        // 重新渲染角色卡片
        renderRoleCards();
        
        showMessage('角色添加成功', 'success');
        closeModal();
    });
    
    // 添加事件监听器（必须在模态框打开后添加）
    setTimeout(() => {
        // 处理站点权限切换
        const sitePermissionRadios = document.querySelectorAll('input[name="site-permission"]');
        const siteListContainer = document.getElementById('new-site-list-container');
        
        sitePermissionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'all') {
                    siteListContainer.style.display = 'none';
                } else {
                    siteListContainer.style.display = 'block';
                }
            });
        });
        
        // 处理页面权限与操作权限联动
        const pageCheckboxes = document.querySelectorAll('.page-checkbox');
        
        pageCheckboxes.forEach(checkbox => {
            const page = checkbox.getAttribute('data-page');
            const actionCheckboxes = document.querySelectorAll(`.action-checkbox[data-page="${page}"]`);
            
            // 页面复选框变化时，联动操作复选框
            checkbox.addEventListener('change', function() {
                actionCheckboxes.forEach(actionCheckbox => {
                    actionCheckbox.disabled = !this.checked;
                    if (!this.checked) {
                        actionCheckbox.checked = false;
                    }
                });
            });
            
            // 操作复选框变化时，如果有任意操作被选中，则页面复选框自动选中
            actionCheckboxes.forEach(actionCheckbox => {
                actionCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        checkbox.checked = true;
                    } else {
                        // 检查是否所有操作复选框都未选中
                        const allUnchecked = Array.from(actionCheckboxes).every(cb => !cb.checked);
                        if (allUnchecked) {
                            checkbox.checked = false;
                        }
                    }
                });
            });
        });
    }, 100);
}

/**
 * 编辑角色
 * @param {Object} role - 角色数据
 */
function editRole(role) {
    // 模拟站点数据
    const mockSites = [
        { id: 1, name: '金华电器储能电站', region: '用户侧储能' },
        { id: 2, name: '成都鑫众泰储能电站', region: '用户侧储能' },
        { id: 3, name: '南京清研院储能电站', region: '用户侧储能' },
        { id: 4, name: '广东中建储能电站', region: '工商业储能' },
        { id: 5, name: '西藏林芝储能电站', region: '台区配储' },
        { id: 6, name: '惠州新能源充电站', region: '充电设施' },
        { id: 7, name: '西安光储一体化电站', region: '光储一体' },
        { id: 8, name: '长春智慧微电网', region: '微电网' }
    ];
    
    // 模拟该角色已选择的站点（在实际应用中应从后端获取）
    const selectedSites = role.sitePermission === 'specific' ? [1, 2, 4] : 
                        role.sitePermission === 'deny' ? [3, 6] : [];
    
    const formHtml = `
        <div class="form-group">
            <label for="edit-role-name">角色名称</label>
            <input type="text" id="edit-role-name" class="form-control" value="${role.name}">
        </div>
        
        <div class="form-group">
            <label>站点权限</label>
            <div class="permission-options" style="display: flex; gap: 20px; margin-top: 5px;">
                <div>
                    <input type="radio" name="edit-site-permission" id="all-sites" value="all" ${role.sitePermission === 'all' ? 'checked' : ''}>
                    <label for="all-sites">全部站点</label>
                </div>
                <div>
                    <input type="radio" name="edit-site-permission" id="specific-sites" value="specific" ${role.sitePermission === 'specific' ? 'checked' : ''}>
                    <label for="specific-sites">指定站点</label>
                </div>
                <div>
                    <input type="radio" name="edit-site-permission" id="deny-sites" value="deny" ${role.sitePermission === 'deny' ? 'checked' : ''}>
                    <label for="deny-sites">禁止访问站点</label>
                </div>
            </div>
        </div>
        
        <!-- 站点列表，仅在选择"指定站点"或"禁止访问站点"时显示 -->
        <div id="site-list-container" class="form-group" style="display: ${role.sitePermission !== 'all' ? 'block' : 'none'}; margin-top: 10px; margin-left: 20px;">
            <div class="permission-tree" style="max-height: 200px; overflow-y: auto;">
                ${mockSites.map(site => `
                    <div class="tree-item" style="margin-bottom: 8px;">
                        <input type="checkbox" class="site-checkbox" id="site-${site.id}" data-site-id="${site.id}" 
                            ${selectedSites.includes(site.id) ? 'checked' : ''}>
                        <label for="site-${site.id}">${site.name} <span style="color: #666; font-size: 12px;">(${site.region})</span></label>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="form-group">
            <label>页面权限</label>
            <div class="permission-matrix" style="margin-top: 15px; border: 1px solid #eee; border-radius: 5px; padding: 15px;">
                <!-- 监控中心权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="edit-page-monitor" class="page-checkbox" data-page="monitor" 
                            ${(role.pagePermissions.monitor && role.pagePermissions.monitor.length > 0) ? 'checked' : ''}>
                        <label for="edit-page-monitor" style="margin-left: 5px; font-weight: 600;">监控中心</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="edit-monitor-view" class="action-checkbox" data-page="monitor" data-action="view"
                                ${(role.pagePermissions.monitor && role.pagePermissions.monitor.includes('view')) ? 'checked' : ''}>
                            <label for="edit-monitor-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-monitor-operate" class="action-checkbox" data-page="monitor" data-action="operate"
                                ${(role.pagePermissions.monitor && role.pagePermissions.monitor.includes('operate')) ? 'checked' : ''}>
                            <label for="edit-monitor-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-monitor-config" class="action-checkbox" data-page="monitor" data-action="config"
                                ${(role.pagePermissions.monitor && role.pagePermissions.monitor.includes('config')) ? 'checked' : ''}>
                            <label for="edit-monitor-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 运维管理权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="edit-page-maintenance" class="page-checkbox" data-page="maintenance"
                            ${(role.pagePermissions.maintenance && role.pagePermissions.maintenance.length > 0) ? 'checked' : ''}>
                        <label for="edit-page-maintenance" style="margin-left: 5px; font-weight: 600;">运维管理</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="edit-maintenance-view" class="action-checkbox" data-page="maintenance" data-action="view"
                                ${(role.pagePermissions.maintenance && role.pagePermissions.maintenance.includes('view')) ? 'checked' : ''}>
                            <label for="edit-maintenance-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-maintenance-operate" class="action-checkbox" data-page="maintenance" data-action="operate"
                                ${(role.pagePermissions.maintenance && role.pagePermissions.maintenance.includes('operate')) ? 'checked' : ''}>
                            <label for="edit-maintenance-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-maintenance-config" class="action-checkbox" data-page="maintenance" data-action="config"
                                ${(role.pagePermissions.maintenance && role.pagePermissions.maintenance.includes('config')) ? 'checked' : ''}>
                            <label for="edit-maintenance-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 数据分析权限 -->
                <div class="page-permission-section" style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="edit-page-analysis" class="page-checkbox" data-page="analysis"
                            ${(role.pagePermissions.analysis && role.pagePermissions.analysis.length > 0) ? 'checked' : ''}>
                        <label for="edit-page-analysis" style="margin-left: 5px; font-weight: 600;">数据分析</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="edit-analysis-view" class="action-checkbox" data-page="analysis" data-action="view"
                                ${(role.pagePermissions.analysis && role.pagePermissions.analysis.includes('view')) ? 'checked' : ''}>
                            <label for="edit-analysis-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-analysis-operate" class="action-checkbox" data-page="analysis" data-action="operate"
                                ${(role.pagePermissions.analysis && role.pagePermissions.analysis.includes('operate')) ? 'checked' : ''}>
                            <label for="edit-analysis-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-analysis-config" class="action-checkbox" data-page="analysis" data-action="config"
                                ${(role.pagePermissions.analysis && role.pagePermissions.analysis.includes('config')) ? 'checked' : ''}>
                            <label for="edit-analysis-config">配置</label>
                        </div>
                    </div>
                </div>
                
                <!-- 后台管理权限 -->
                <div class="page-permission-section">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" id="edit-page-admin" class="page-checkbox" data-page="admin"
                            ${(role.pagePermissions.admin && role.pagePermissions.admin.length > 0) ? 'checked' : ''}>
                        <label for="edit-page-admin" style="margin-left: 5px; font-weight: 600;">后台管理</label>
                    </div>
                    <div class="actions-container" style="display: flex; gap: 20px; margin-left: 25px;">
                        <div>
                            <input type="checkbox" id="edit-admin-view" class="action-checkbox" data-page="admin" data-action="view"
                                ${(role.pagePermissions.admin && role.pagePermissions.admin.includes('view')) ? 'checked' : ''}>
                            <label for="edit-admin-view">查看</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-admin-operate" class="action-checkbox" data-page="admin" data-action="operate"
                                ${(role.pagePermissions.admin && role.pagePermissions.admin.includes('operate')) ? 'checked' : ''}>
                            <label for="edit-admin-operate">操作</label>
                        </div>
                        <div>
                            <input type="checkbox" id="edit-admin-config" class="action-checkbox" data-page="admin" data-action="config"
                                ${(role.pagePermissions.admin && role.pagePermissions.admin.includes('config')) ? 'checked' : ''}>
                            <label for="edit-admin-config">配置</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑角色', formHtml, function() {
        // DEMO示例，直接在控制台输出收集的数据
        const newRoleName = document.getElementById('edit-role-name').value;
        const newSitePermission = document.querySelector('input[name="edit-site-permission"]:checked').value;
        
        // 如果选择了指定站点或禁止访问站点，则获取选中的站点ID
        let selectedSiteIds = [];
        if (newSitePermission !== 'all') {
            selectedSiteIds = Array.from(document.querySelectorAll('.site-checkbox:checked'))
                                  .map(checkbox => parseInt(checkbox.getAttribute('data-site-id')));
        }
        
        // 获取页面和操作权限
        const pagePermissions = {};
        const pages = ['monitor', 'maintenance', 'analysis', 'admin'];
        
        pages.forEach(page => {
            pagePermissions[page] = [];
            const actions = ['view', 'operate', 'config'];
            
            if (document.getElementById(`edit-page-${page}`).checked) {
                actions.forEach(action => {
                    if (document.getElementById(`edit-${page}-${action}`).checked) {
                        pagePermissions[page].push(action);
                    }
                });
            }
        });
        
        // 打印收集的数据（仅用于DEMO演示）
        console.log('角色更新数据:', {
            name: newRoleName,
            sitePermission: newSitePermission,
            selectedSites: selectedSiteIds,
            pagePermissions: pagePermissions
        });
        
        // 更新页面上的角色数据（仅用于DEMO演示）
        const updatedRole = MOCK_ROLES.find(r => r.id === role.id);
        if (updatedRole) {
            updatedRole.name = newRoleName;
            updatedRole.sitePermission = newSitePermission;
            updatedRole.pagePermissions = pagePermissions;
            
            // 重新渲染角色卡片
            renderRoleCards();
        }
        
        showMessage('角色更新成功', 'success');
        closeModal();
    });
    
    // 添加站点权限选项的事件监听器（必须在模态框打开后添加）
    setTimeout(() => {
        // 处理站点权限切换
        const sitePermissionRadios = document.querySelectorAll('input[name="edit-site-permission"]');
        const siteListContainer = document.getElementById('site-list-container');
        
        sitePermissionRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'all') {
                    siteListContainer.style.display = 'none';
                } else {
                    siteListContainer.style.display = 'block';
                }
            });
        });
        
        // 处理页面权限与操作权限联动
        const pageCheckboxes = document.querySelectorAll('.page-checkbox');
        
        pageCheckboxes.forEach(checkbox => {
            const page = checkbox.getAttribute('data-page');
            const actionCheckboxes = document.querySelectorAll(`.action-checkbox[data-page="${page}"]`);
            
            // 页面复选框变化时，联动操作复选框
            checkbox.addEventListener('change', function() {
                actionCheckboxes.forEach(actionCheckbox => {
                    actionCheckbox.disabled = !this.checked;
                    if (!this.checked) {
                        actionCheckbox.checked = false;
                    }
                });
            });
            
            // 初始化状态
            const isPageChecked = checkbox.checked;
            actionCheckboxes.forEach(actionCheckbox => {
                actionCheckbox.disabled = !isPageChecked;
            });
            
            // 操作复选框变化时，如果有任意操作被选中，则页面复选框自动选中
            actionCheckboxes.forEach(actionCheckbox => {
                actionCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        checkbox.checked = true;
                    } else {
                        // 检查是否所有操作复选框都未选中
                        const allUnchecked = Array.from(actionCheckboxes).every(cb => !cb.checked);
                        if (allUnchecked) {
                            checkbox.checked = false;
                        }
                    }
                });
            });
        });
    }, 100);
}

/**
 * 预览角色权限
 * @param {Object} role 角色对象
 */
function previewRolePermissions(role) {
    // 模拟站点数据
    const mockSites = [
        { id: 1, name: '金华电器储能电站', region: '用户侧储能' },
        { id: 2, name: '成都鑫众泰储能电站', region: '用户侧储能' },
        { id: 3, name: '南京清研院储能电站', region: '用户侧储能' },
        { id: 4, name: '广东中建储能电站', region: '工商业储能' },
        { id: 5, name: '西藏林芝储能电站', region: '台区配储' },
        { id: 6, name: '惠州新能源充电站', region: '充电设施' },
        { id: 7, name: '西安光储一体化电站', region: '光储一体' },
        { id: 8, name: '长春智慧微电网', region: '微电网' }
    ];
    
    // 页面权限映射
    const pagePermissionMap = {
        'monitor': '监控中心',
        'maintenance': '运维管理',
        'analysis': '数据分析',
        'admin': '后台管理'
    };
    
    // 操作权限映射
    const actionPermissionMap = {
        'view': '查看',
        'operate': '操作',
        'config': '配置'
    };
    
    // 站点权限类型显示
    let sitePermissionText = '';
    if (role.sitePermission === 'all') {
        sitePermissionText = '全部站点';
    } else if (role.sitePermission === 'specific') {
        sitePermissionText = '指定站点';
    } else if (role.sitePermission === 'deny') {
        sitePermissionText = '禁止访问站点';
    }
    
    // 模拟站点访问权限列表
    const roleSpecificSites = role.selectedSites || [1, 3, 5]; // 假设这些是已选站点
    
    // 构建页面权限内容
    let pagePermissionsContent = '';
    
    Object.keys(role.pagePermissions || {}).forEach(page => {
        if (role.pagePermissions[page] && role.pagePermissions[page].length > 0) {
            const pageName = pagePermissionMap[page] || page;
            const actions = role.pagePermissions[page]
                .map(action => actionPermissionMap[action])
                .join('、');
                
            pagePermissionsContent += `
                <div class="permission-item">
                    <div class="page-name">${pageName}</div>
                    <div class="actions-list">
                        ${role.pagePermissions[page].map(action => 
                            `<div class="permission-tag">${actionPermissionMap[action]}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    if (!pagePermissionsContent) {
        pagePermissionsContent = '<span class="no-permission">无页面权限</span>';
    }
    
    // 构建权限预览内容
    const permissionSummary = `
        <div class="permission-preview">
            <div class="preview-section">
                <h5>基本信息</h5>
                <div class="preview-item">
                    <span class="preview-label">角色名称：</span>
                    <span class="preview-value">${role.name}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">用户数量：</span>
                    <span class="preview-value">${role.userCount}人</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>站点权限</h5>
                <div class="preview-item">
                    <span class="preview-label">权限类型：</span>
                    <span class="preview-value">${sitePermissionText}</span>
                </div>
                ${role.sitePermission !== 'all' ? `
                <div class="preview-item">
                    <span class="preview-label">${role.sitePermission === 'specific' ? '可访问站点' : '禁止访问站点'}：</span>
                    <div class="preview-value site-list">
                        ${mockSites.filter(site => roleSpecificSites.includes(site.id))
                            .map(site => `<div class="site-tag">${site.name} <span class="site-region">(${site.region})</span></div>`)
                            .join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="preview-section">
                <h5>页面与操作权限</h5>
                <div class="page-permissions-container">
                    ${pagePermissionsContent}
                </div>
            </div>
        </div>
    `;
    
    // 添加预览样式
    const previewStyles = `
        <style>
            .permission-preview {
                font-size: 14px;
            }
            .preview-section {
                margin-bottom: 20px;
            }
            .preview-section h5 {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #1e8e3e;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 5px;
            }
            .preview-item {
                margin-bottom: 8px;
                display: flex;
            }
            .preview-label {
                font-weight: 500;
                color: #666;
                min-width: 100px;
            }
            .preview-value {
                flex: 1;
            }
            .site-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .site-tag {
                background-color: #f0f8f1;
                border: 1px solid #d8ebd9;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 13px;
            }
            .site-region {
                color: #666;
                font-size: 12px;
            }
            .page-permissions-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .permission-item {
                border: 1px solid #e0e0e0;
                border-radius: 5px;
                padding: 10px 15px;
                background-color: #fafafa;
            }
            .page-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }
            .actions-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .permission-tag {
                background-color: #e6f4ea;
                color: #1e8e3e;
                border-radius: 4px;
                padding: 4px 10px;
                font-size: 13px;
            }
            .no-permission {
                color: #999;
                font-style: italic;
            }
        </style>
    `;
    
    openModal(`角色权限预览 - ${role.name}`, previewStyles + permissionSummary);
}

/**
 * 查看角色变更日志
 * @param {Object} role - 角色数据
 */
function viewRoleChangeLog(role) {
    // 模拟角色变更日志数据
    const logs = [
        { time: '2023-04-08 15:30:45', user: 'admin', action: '创建角色' },
        { time: '2023-04-10 09:12:33', user: 'admin', action: '修改了页面权限' },
        { time: '2023-04-15 16:45:21', user: 'manager1', action: '添加了操作权限' }
    ];
    
    const logsHtml = `
        <div style="margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px; color: var(--secondary-color);">${role.name} 变更日志</h4>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">时间</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">操作人</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">操作内容</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.time}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.user}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.action}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    openModal('变更日志', logsHtml);
}

/**
 * 复制角色
 * @param {Object} role - 角色数据
 */
function copyRole(role) {
    const formHtml = `
        <p>您正在基于角色 "${role.name}" 创建新角色：</p>
        <div class="form-group" style="margin-top: 15px;">
            <label for="copy-role-name">新角色名称</label>
            <input type="text" id="copy-role-name" class="form-control" value="${role.name}-副本">
        </div>
    `;
    
    openModal('复制角色', formHtml, function() {
        showMessage('角色复制成功', 'success');
        closeModal();
    });
}

/**
 * 导出角色数据
 */
function exportRolesData() {
    showMessage('角色数据导出成功，已保存到您的下载文件夹', 'success');
} 