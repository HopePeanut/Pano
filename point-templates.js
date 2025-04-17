/**
 * 点表模板管理页面脚本
 * 文件名: point-templates.js
 * 功能描述: 提供点表模板的管理功能，包括导入导出、筛选查询、标签管理等功能
 */

// 当页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化导航栏
    if (typeof initNavbar === 'function') {
        initNavbar('maintenance-tools');
    }
    
    // 初始化页面各模块
    initFilterDropdowns();
    initTableActions();
    initModalDialogs();
    initTagSystem();
    
    // 加载模板数据
    loadTemplateData();
    
    // 绑定筛选区域的折叠/展开功能
    bindFilterToggle();
});

/**
 * 模拟数据 - 在实际应用中会从服务器获取
 * 这里使用模拟数据进行界面展示
 */
const mockTemplates = [
    {
        id: 1,
        name: "储能标准点表-2023版",
        creator: "系统管理员",
        createTime: "2023-07-15 09:30:25",
        itemCount: 156,
        lastUsed: "2023-10-22 15:42:18",
        tags: ["储能-CC00", "储能-LS00"]
    },
    {
        id: 2,
        name: "光伏点表基础版V2.1",
        creator: "交付工程师A",
        createTime: "2023-08-05 14:22:36",
        itemCount: 98,
        lastUsed: "2023-10-20 10:15:42",
        tags: ["光伏基础"]
    },
    {
        id: 3,
        name: "储能系统-PCS点表",
        creator: "交付工程师B",
        createTime: "2023-09-12 16:45:12",
        itemCount: 78,
        lastUsed: "2023-10-18 09:30:15",
        tags: ["储能-LS01", "PCS"]
    },
    {
        id: 4,
        name: "储能-BMS通信点表",
        creator: "系统管理员",
        createTime: "2023-06-20 11:28:35",
        itemCount: 112,
        lastUsed: "2023-10-15 16:22:48",
        tags: ["储能-CC00", "BMS"]
    },
    {
        id: 5,
        name: "电站监控系统标准点表",
        creator: "交付工程师A",
        createTime: "2023-08-28 10:15:47",
        itemCount: 205,
        lastUsed: "2023-10-12 14:40:22",
        tags: ["监控系统"]
    },
    {
        id: 6,
        name: "LS02标准配置点表",
        creator: "交付工程师B",
        createTime: "2023-09-05 15:32:10",
        itemCount: 89,
        lastUsed: "2023-10-10 11:25:33",
        tags: ["储能-LS02"]
    },
    {
        id: 7,
        name: "通用测试点表模板",
        creator: "系统管理员",
        createTime: "2023-07-30 08:45:38",
        itemCount: 45,
        lastUsed: "2023-10-08 09:15:27",
        tags: ["测试专用"]
    },
    {
        id: 8,
        name: "储能CC00-点表",
        creator: "交付工程师A",
        createTime: "2023-08-15 13:50:24",
        itemCount: 68,
        lastUsed: "2023-10-05 16:30:42",
        tags: ["储能-CC00", "储能-LS03"]
    },
    {
        id: 9,
        name: "LS01-扩展模板V1.5",
        creator: "交付工程师B",
        createTime: "2023-09-18 14:20:19",
        itemCount: 132,
        lastUsed: "2023-10-02 10:45:19",
        tags: ["储能-LS01"]
    },
    {
        id: 10,
        name: "电站安全监控点表",
        creator: "系统管理员",
        createTime: "2023-06-10 09:05:32",
        itemCount: 87,
        lastUsed: "2023-09-28 11:38:52",
        tags: ["安全监控"]
    },
    {
        id: 11,
        name: "储能电池舱监控点表",
        creator: "交付工程师A",
        createTime: "2023-08-22 11:10:45",
        itemCount: 76,
        lastUsed: "2023-09-25 15:20:36",
        tags: ["储能-CC00", "电池监控"]
    },
    {
        id: 12,
        name: "调度系统通信点表",
        creator: "交付工程师B",
        createTime: "2023-09-08 15:48:52",
        itemCount: 145,
        lastUsed: "2023-09-20 09:05:14",
        tags: ["调度系统"]
    }
];

// 分页相关变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let filteredTemplates = [];

/**
 * 加载模板数据并更新表格显示
 */
function loadTemplateData() {
    // 初始时，过滤后的模板数据就是全部模板
    filteredTemplates = [...mockTemplates];
    
    // 更新总数显示
    document.getElementById('totalTemplates').textContent = filteredTemplates.length;
    document.getElementById('totalRecords').textContent = filteredTemplates.length;
    
    // 计算总页数
    totalPages = Math.ceil(filteredTemplates.length / pageSize);
    document.getElementById('totalPages').textContent = totalPages;
    
    // 渲染当前页的数据
    renderTemplateTable();
    
    // 渲染分页控件
    renderPagination();
}

/**
 * 渲染模板数据表格
 */
function renderTemplateTable() {
    const tableBody = document.getElementById('templateTableBody');
    tableBody.innerHTML = ''; // 清空表格
    
    // 计算当前页的数据范围
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredTemplates.length);
    
    // 如果没有数据，显示空表格提示
    if (filteredTemplates.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="8" class="empty-table">
                <div class="empty-table-content">
                    <i class="fas fa-search"></i>
                    <p>未找到匹配的模板</p>
                    <p class="small">请调整筛选条件后重试</p>
                </div>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // 添加当前页的数据行
    for (let i = startIndex; i < endIndex; i++) {
        const template = filteredTemplates[i];
        const row = document.createElement('tr');
        
        // 构建标签HTML
        const tagsHtml = template.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        row.innerHTML = `
            <td>
                <label class="checkbox-container">
                    <input type="checkbox" class="template-checkbox" data-id="${template.id}">
                    <span class="checkmark"></span>
                </label>
            </td>
            <td>${template.name}</td>
            <td>${template.creator}</td>
            <td>${template.createTime}</td>
            <td>${template.itemCount}</td>
            <td>${template.lastUsed}</td>
            <td>
                <div class="template-tags">
                    ${tagsHtml}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit-btn" data-id="${template.id}" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon export-btn" data-id="${template.id}" title="导出">
                        <i class="fas fa-file-export"></i>
                    </button>
                    <button class="btn-icon copy-btn" data-id="${template.id}" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${template.id}" title="删除">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // 绑定表格行操作事件
    bindTableRowActions();
}

/**
 * 渲染分页控件
 */
function renderPagination() {
    const paginationContainer = document.getElementById('pageNumbers');
    paginationContainer.innerHTML = '';
    
    // 设置当前页显示
    document.getElementById('currentPage').textContent = currentPage;
    
    // 如果总页数少于等于7，直接显示所有页码
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            addPageButton(i, paginationContainer);
        }
    } else {
        // 总页数大于7时，使用省略号策略
        
        // 始终显示第一页
        addPageButton(1, paginationContainer);
        
        // 根据当前页决定中间显示哪些页码
        if (currentPage <= 3) {
            // 当前页靠近开始
            for (let i = 2; i <= 5; i++) {
                addPageButton(i, paginationContainer);
            }
            addEllipsis(paginationContainer);
            addPageButton(totalPages, paginationContainer);
        } else if (currentPage >= totalPages - 2) {
            // 当前页靠近结束
            addEllipsis(paginationContainer);
            for (let i = totalPages - 4; i <= totalPages; i++) {
                addPageButton(i, paginationContainer);
            }
        } else {
            // 当前页在中间
            addEllipsis(paginationContainer);
            addPageButton(currentPage - 1, paginationContainer);
            addPageButton(currentPage, paginationContainer);
            addPageButton(currentPage + 1, paginationContainer);
            addEllipsis(paginationContainer);
            addPageButton(totalPages, paginationContainer);
        }
    }
    
    // 根据当前页设置prev/next按钮状态
    const prevBtn = document.querySelector('.page-btn[data-page="prev"]');
    const nextBtn = document.querySelector('.page-btn[data-page="next"]');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // 绑定页码点击事件
    bindPaginationEvents();
}

/**
 * 添加页码按钮到分页容器
 */
function addPageButton(pageNum, container) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${pageNum === currentPage ? 'active' : ''}`;
    pageBtn.dataset.page = pageNum;
    pageBtn.textContent = pageNum;
    container.appendChild(pageBtn);
}

/**
 * 添加省略号到分页容器
 */
function addEllipsis(container) {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'page-ellipsis';
    ellipsis.textContent = '...';
    container.appendChild(ellipsis);
}

/**
 * 绑定分页控件点击事件
 */
function bindPaginationEvents() {
    // 页码按钮点击事件
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            
            if (page === 'prev') {
                if (currentPage > 1) {
                    currentPage--;
                    renderTemplateTable();
                    renderPagination();
                }
            } else if (page === 'next') {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTemplateTable();
                    renderPagination();
                }
            } else {
                const pageNum = parseInt(page);
                if (pageNum !== currentPage) {
                    currentPage = pageNum;
                    renderTemplateTable();
                    renderPagination();
                }
            }
        });
    });
    
    // 每页显示条数变化事件
    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1; // 重置为第一页
        totalPages = Math.ceil(filteredTemplates.length / pageSize);
        renderTemplateTable();
        renderPagination();
    });
}

/**
 * 绑定表格行的操作事件
 */
function bindTableRowActions() {
    // 编辑按钮点击事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = parseInt(btn.dataset.id);
            openEditTemplateModal(templateId);
        });
    });
    
    // 导出按钮点击事件
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = parseInt(btn.dataset.id);
            exportTemplate(templateId);
        });
    });
    
    // 复制按钮点击事件
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = parseInt(btn.dataset.id);
            duplicateTemplate(templateId);
        });
    });
    
    // 删除按钮点击事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = parseInt(btn.dataset.id);
            confirmDeleteTemplate(templateId);
        });
    });
    
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        document.querySelectorAll('.template-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        // 根据是否有选中项，控制批量操作按钮状态
        toggleBatchActions();
    });
    
    // 单个复选框点击事件
    document.querySelectorAll('.template-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 检查是否所有复选框都被选中
            const allChecked = [...document.querySelectorAll('.template-checkbox')]
                .every(cb => cb.checked);
            
            // 更新全选复选框状态
            document.getElementById('selectAll').checked = allChecked;
            
            // 根据是否有选中项，控制批量操作按钮状态
            toggleBatchActions();
        });
    });
}

/**
 * 根据选中项状态切换批量操作按钮的可用性
 */
function toggleBatchActions() {
    const hasCheckedItems = [...document.querySelectorAll('.template-checkbox')]
        .some(cb => cb.checked);
    
    document.getElementById('batchExportBtn').disabled = !hasCheckedItems;
    document.getElementById('batchDeleteBtn').disabled = !hasCheckedItems;
}

/**
 * 初始化筛选区域下拉菜单
 */
function initFilterDropdowns() {
    // 标签筛选下拉菜单
    const tagSelect = document.getElementById('tagSelect');
    const tagDropdown = document.getElementById('tagDropdown');
    const tagInput = document.getElementById('tagInput');
    
    // 点击标签选择器显示/隐藏下拉菜单
    tagSelect.addEventListener('click', (e) => {
        if (e.target.id !== 'tagInput') {
            tagDropdown.style.display = tagDropdown.style.display === 'block' ? 'none' : 'block';
        }
    });
    
    // 点击其他区域关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!tagSelect.contains(e.target) && !tagDropdown.contains(e.target)) {
            tagDropdown.style.display = 'none';
        }
    });
    
    // 标签选项点击事件
    document.querySelectorAll('.tag-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            
            if (value === 'custom') {
                // 自定义标签输入
                tagInput.focus();
                tagInput.value = '';
                tagInput.placeholder = '输入新标签并按回车';
            } else {
                // 添加预设标签
                addFilterTag(value);
                tagInput.value = '';
            }
        });
    });
    
    // 输入框回车添加自定义标签
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && tagInput.value.trim() !== '') {
            addFilterTag(tagInput.value.trim());
            tagInput.value = '';
            e.preventDefault();
        }
    });
    
    // 绑定筛选表单提交事件
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    
    // 绑定重置筛选事件
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
}

/**
 * 添加筛选标签
 */
function addFilterTag(tagText) {
    const selectedTags = document.getElementById('selectedTags');
    
    // 检查标签是否已存在
    const existingTags = [...selectedTags.querySelectorAll('.selected-tag')];
    if (existingTags.some(tag => tag.dataset.value === tagText)) {
        return; // 标签已存在，不重复添加
    }
    
    // 创建标签元素
    const tagElement = document.createElement('div');
    tagElement.className = 'selected-tag';
    tagElement.dataset.value = tagText;
    tagElement.innerHTML = `
        ${tagText}
        <button class="remove-tag">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 绑定删除标签事件
    tagElement.querySelector('.remove-tag').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTags.removeChild(tagElement);
    });
    
    // 添加到已选标签容器
    selectedTags.appendChild(tagElement);
}

/**
 * 应用筛选条件
 */
function applyFilters() {
    // 获取筛选条件
    const nameFilter = document.getElementById('nameFilter').value.toLowerCase();
    const creatorFilter = document.getElementById('creatorFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // 获取已选标签
    const selectedTagElements = document.querySelectorAll('#selectedTags .selected-tag');
    const tagFilters = Array.from(selectedTagElements).map(tag => tag.dataset.value);
    
    // 筛选数据
    filteredTemplates = mockTemplates.filter(template => {
        // 模板名称筛选
        if (nameFilter && !template.name.toLowerCase().includes(nameFilter)) {
            return false;
        }
        
        // 创建人筛选
        if (creatorFilter && template.creator !== creatorFilter) {
            return false;
        }
        
        // 创建时间范围筛选
        if (startDate) {
            const templateDate = new Date(template.createTime);
            const filterStartDate = new Date(startDate);
            if (templateDate < filterStartDate) {
                return false;
            }
        }
        
        if (endDate) {
            const templateDate = new Date(template.createTime);
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59); // 设置为当天结束时间
            if (templateDate > filterEndDate) {
                return false;
            }
        }
        
        // 标签筛选
        if (tagFilters.length > 0) {
            const templateTags = template.tags || [];
            // 检查模板是否包含所有选中的标签
            return tagFilters.every(tag => templateTags.includes(tag));
        }
        
        return true;
    });
    
    // 更新数据显示
    currentPage = 1;
    totalPages = Math.ceil(filteredTemplates.length / pageSize);
    
    // 更新总数显示
    document.getElementById('totalTemplates').textContent = filteredTemplates.length;
    document.getElementById('totalRecords').textContent = filteredTemplates.length;
    document.getElementById('totalPages').textContent = totalPages || 1;
    
    // 重新渲染表格和分页
    renderTemplateTable();
    renderPagination();
}

/**
 * 重置筛选条件
 */
function resetFilters() {
    // 清空筛选表单
    document.getElementById('nameFilter').value = '';
    document.getElementById('creatorFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    // 清空已选标签
    document.getElementById('selectedTags').innerHTML = '';
    
    // 重置筛选后的数据
    filteredTemplates = [...mockTemplates];
    currentPage = 1;
    totalPages = Math.ceil(filteredTemplates.length / pageSize);
    
    // 更新总数显示
    document.getElementById('totalTemplates').textContent = filteredTemplates.length;
    document.getElementById('totalRecords').textContent = filteredTemplates.length;
    document.getElementById('totalPages').textContent = totalPages;
    
    // 重新渲染表格和分页
    renderTemplateTable();
    renderPagination();
}

/**
 * 绑定筛选区域的折叠/展开功能
 */
function bindFilterToggle() {
    const filterHeader = document.querySelector('.filter-header');
    const filterBody = document.querySelector('.filter-body');
    const filterToggle = document.querySelector('.filter-toggle i');
    
    filterHeader.addEventListener('click', () => {
        const isCollapsed = filterBody.style.display === 'none';
        
        if (isCollapsed) {
            filterBody.style.display = 'block';
            filterToggle.className = 'fas fa-chevron-up';
        } else {
            filterBody.style.display = 'none';
            filterToggle.className = 'fas fa-chevron-down';
        }
    });
}

/**
 * 初始化表格操作功能
 */
function initTableActions() {
    // 表格排序功能
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.dataset.sort;
            sortTemplateTable(sortKey);
        });
    });
    
    // 批量导出按钮点击事件
    document.getElementById('batchExportBtn').addEventListener('click', batchExportTemplates);
    
    // 批量删除按钮点击事件
    document.getElementById('batchDeleteBtn').addEventListener('click', confirmBatchDelete);
}

/**
 * 对模板表格进行排序
 */
function sortTemplateTable(sortKey) {
    // 获取当前排序方向
    const currentSortTh = document.querySelector(`th[data-sort="${sortKey}"]`);
    const icons = currentSortTh.querySelectorAll('i');
    let sortDirection = 'asc';
    
    // 如果当前已经是升序，则改为降序
    if (icons[0].className.includes('fa-sort-up')) {
        sortDirection = 'desc';
    }
    
    // 重置所有排序图标
    document.querySelectorAll('th.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    // 设置当前排序图标
    icons[0].className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
    
    // 根据排序键和方向对表格数据进行排序
    filteredTemplates.sort((a, b) => {
        let valueA, valueB;
        
        // 根据不同的排序键获取对应的值
        switch (sortKey) {
            case 'name':
                valueA = a.name;
                valueB = b.name;
                break;
            case 'creator':
                valueA = a.creator;
                valueB = b.creator;
                break;
            case 'createTime':
                valueA = new Date(a.createTime);
                valueB = new Date(b.createTime);
                break;
            case 'itemCount':
                valueA = a.itemCount;
                valueB = b.itemCount;
                break;
            case 'lastUsed':
                valueA = new Date(a.lastUsed);
                valueB = new Date(b.lastUsed);
                break;
            default:
                return 0;
        }
        
        // 比较值并按照排序方向返回结果
        if (valueA < valueB) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // 重新渲染表格
    renderTemplateTable();
}

/**
 * 初始化各种模态框
 */
function initModalDialogs() {
    // 导入模态框相关操作
    const importModal = document.getElementById('importModal');
    const closeImportModalBtn = document.getElementById('closeImportModalBtn');
    const importBtn = document.getElementById('importBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const autoGenerateTemplate = document.getElementById('autoGenerateTemplate');
    const templateNameInput = document.getElementById('templateNameInput');
    const createBtn = document.getElementById('createBtn');
    
    // 打开导入模态框
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            importModal.style.display = 'block';
        });
    }
    
    // 关闭导入模态框
    if (closeImportModalBtn) {
        closeImportModalBtn.addEventListener('click', () => {
            importModal.style.display = 'none';
        });
    }
    
    // 点击上传区域触发文件选择
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // 文件拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                handleFileUpload(file);
            }
        });
    }
    
    // 文件选择变化
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                handleFileUpload(file);
            }
        });
    }
    
    // 删除已选文件
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
            if (uploadArea) uploadArea.style.display = 'block';
            if (fileInfo) fileInfo.style.display = 'none';
        });
    }
    
    // 自动生成模板名称选项变化
    if (autoGenerateTemplate && templateNameInput) {
        autoGenerateTemplate.addEventListener('change', () => {
            templateNameInput.style.display = autoGenerateTemplate.checked ? 'none' : 'block';
        });
    }
    
    // 为导入模态框中的"确认导入"按钮添加事件
    const confirmImportBtn = document.querySelector('#importModal .modal-footer .btn-primary');
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            processImportFile();
        });
    }
    
    // 为创建/编辑模板按钮绑定事件
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            openEditTemplateModal(); // 不传ID表示创建新模板
        });
    }
    
    // 绑定点击模态框背景关闭模态框
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

/**
 * 处理文件上传逻辑
 */
function handleFileUpload(file) {
    // 检查文件类型
    const validExts = ['.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExts.includes(fileExt)) {
        showToast('请上传Excel文件（.xlsx或.xls格式）', 'error');
        return;
    }
    
    // 显示文件信息
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    
    // 如果选择了自动生成模板名，生成一个基于文件名的模板名
    if (document.getElementById('autoGenerateTemplate').checked) {
        let templateName = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
        document.getElementById('templateName').value = templateName;
    }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 处理点表导入
 */
function processImportFile() {
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput.files.length) {
        showToast('请先选择要导入的文件', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    const templateName = document.getElementById('autoGenerateTemplate').checked ? 
        file.name.replace(/\.[^/.]+$/, "") : 
        document.getElementById('templateName').value.trim();
    
    if (!templateName) {
        showToast('请输入模板名称', 'warning');
        return;
    }
    
    // 显示加载中提示
    showLoadingToast('正在导入点表...');
    
    // 模拟文件上传和处理过程
    setTimeout(() => {
        // 模拟新增一个模板
        const newTemplate = {
            id: mockTemplates.length + 1,
            name: templateName,
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN'),
            itemCount: Math.floor(Math.random() * 100) + 50, // 随机点数
            lastUsed: '尚未使用',
            tags: []
        };
        
        // 获取已选标签
        const selectedTags = document.querySelectorAll('#importSelectedTags .selected-tag');
        if (selectedTags.length > 0) {
            newTemplate.tags = Array.from(selectedTags).map(tag => tag.dataset.value);
        }
        
        // 添加到模板列表
        mockTemplates.unshift(newTemplate);
        filteredTemplates = [...mockTemplates];
        
        // 更新总数和页码
        totalPages = Math.ceil(filteredTemplates.length / pageSize);
        currentPage = 1;
        
        // 重新渲染表格
        renderTemplateTable();
        renderPagination();
        
        // 关闭模态框并重置
        document.getElementById('importModal').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('importSelectedTags').innerHTML = '';
        
        // 显示成功提示
        showToast('点表导入成功', 'success');
    }, 1500);
}

/**
 * 导出模板
 */
function exportTemplate(templateId) {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
        showLoadingToast(`正在导出模板: ${template.name}`);
        
        // 模拟导出过程
        setTimeout(() => {
            showToast('模板导出成功', 'success');
        }, 1000);
    }
}

/**
 * 批量导出模板
 */
function batchExportTemplates() {
    const selectedCheckboxes = document.querySelectorAll('.template-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showToast('请选择要导出的模板', 'warning');
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
    
    showLoadingToast(`正在导出${selectedIds.length}个模板...`);
    
    // 模拟导出过程
    setTimeout(() => {
        showToast(`已成功导出${selectedIds.length}个模板`, 'success');
    }, 1500);
}

/**
 * 复制模板
 */
function duplicateTemplate(templateId) {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
        const newTemplate = {
            ...template,
            id: mockTemplates.length + 1,
            name: `${template.name} - 副本`,
            createTime: new Date().toLocaleString('zh-CN'),
            lastUsed: '尚未使用'
        };
        
        // 添加到模板列表
        mockTemplates.unshift(newTemplate);
        filteredTemplates = [...mockTemplates];
        
        // 更新总数和页码
        totalPages = Math.ceil(filteredTemplates.length / pageSize);
        currentPage = 1;
        
        // 重新渲染表格
        renderTemplateTable();
        renderPagination();
        
        showToast('模板复制成功', 'success');
    }
}

/**
 * 确认删除模板
 */
function confirmDeleteTemplate(templateId) {
    if (confirm('确定要删除这个模板吗？此操作无法撤销。')) {
        // 从模板列表中移除
        const index = mockTemplates.findIndex(t => t.id === templateId);
        if (index !== -1) {
            mockTemplates.splice(index, 1);
            filteredTemplates = [...mockTemplates];
            
            // 如果当前页没有数据了，且不是第一页，回到上一页
            if (currentPage > 1 && (currentPage - 1) * pageSize >= filteredTemplates.length) {
                currentPage--;
            }
            
            // 更新总数和页码
            totalPages = Math.ceil(filteredTemplates.length / pageSize);
            
            // 重新渲染表格
            renderTemplateTable();
            renderPagination();
            
            showToast('模板已成功删除', 'success');
        }
    }
}

/**
 * 确认批量删除
 */
function confirmBatchDelete() {
    const selectedCheckboxes = document.querySelectorAll('.template-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showToast('请选择要删除的模板', 'warning');
        return;
    }
    
    if (confirm(`确定要删除选中的${selectedCheckboxes.length}个模板吗？此操作无法撤销。`)) {
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
        
        // 从模板列表中移除选中项
        mockTemplates = mockTemplates.filter(t => !selectedIds.includes(t.id));
        filteredTemplates = [...mockTemplates];
        
        // 如果当前页没有数据了，且不是第一页，回到上一页
        if (currentPage > 1 && (currentPage - 1) * pageSize >= filteredTemplates.length) {
            currentPage--;
        }
        
        // 更新总数和页码
        totalPages = Math.ceil(filteredTemplates.length / pageSize);
        
        // 重新渲染表格
        renderTemplateTable();
        renderPagination();
        
        showToast(`已成功删除${selectedIds.length}个模板`, 'success');
    }
}

/**
 * 打开编辑模板模态框
 */
function openEditTemplateModal(templateId) {
    // TODO: 实现编辑模板模态框
    if (templateId) {
        const template = mockTemplates.find(t => t.id === templateId);
        if (template) {
            showToast(`编辑模板: ${template.name}`, 'info');
        }
    } else {
        showToast('创建新模板', 'info');
    }
}

/**
 * 初始化标签管理系统
 */
function initTagSystem() {
    // 标签系统相关初始化
    // TODO: 完善标签系统功能
}

/**
 * 显示消息提示
 */
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 设置图标
    let icon = 'info-circle';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        case 'warning':
            icon = 'exclamation-circle';
            break;
    }
    
    // 设置内容
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-content">${message}</div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示提示
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 绑定关闭按钮
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        closeToast(toast);
    });
    
    // 自动关闭
    setTimeout(() => {
        closeToast(toast);
    }, 3000);
}

/**
 * 显示加载中提示
 */
function showLoadingToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-loading';
    
    // 设置内容
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div class="toast-content">${message}</div>
    `;
    
    // 添加ID便于后续关闭
    toast.id = 'loadingToast';
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示提示
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    return toast;
}

/**
 * 关闭提示
 */
function closeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 300);
} 