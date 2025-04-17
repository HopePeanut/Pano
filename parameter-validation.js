/**
 * 参数校验页面脚本
 * 负责处理筛选、表格数据展示、分页、排序、参数校验触发等功能
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initializeNavbar();
    
    // 初始化页面功能
    initializeFilterToggle();
    initializeFilters();
    initializeSorting();
    initializePagination();
    initializeValidationModal();
    initializeSiteDeviceSelectionModal(); // 新增：初始化选择弹窗
    initializeParameterDetailModal(); // 新增：初始化详情弹窗
    
    // 加载模拟数据
    loadMockData();
});

// 全局变量
let allData = []; // 所有数据
let allSites = []; // 所有站点信息
let filteredData = []; // 筛选后的数据
let currentPage = 1; // 当前页码
let pageSize = 10; // 每页显示条数
let sortField = 'time'; // 排序字段
let sortDirection = 'desc'; // 排序方向：asc升序，desc降序
let currentValidationInterval = null; // 用于存储模拟校验的interval ID

// 设备统计数据
let deviceStats = {
    total: 0,
    normal: 0,
    abnormal: 0,
    lastCheckTime: 'N/A', // 初始化为 N/A
    lastUpdateStatus: '尚未更新'
};

/**
 * 初始化导航栏
 */
function initializeNavbar() {
    // 这里应当由navbar-template.js处理
}

/**
 * 初始化筛选条件区域的折叠/展开功能
 */
function initializeFilterToggle() {
    const filterToggle = document.querySelector('.filter-toggle');
    const filterBody = document.querySelector('.filter-body');
    
    if (filterToggle && filterBody) {
        filterToggle.addEventListener('click', function() {
            filterBody.style.display = filterBody.style.display === 'none' ? 'block' : 'none';
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });
    }
}

/**
 * 初始化筛选功能
 */
function initializeFilters() {
    // 获取筛选元素
    const siteSelect = document.getElementById('siteSelect');
    const deviceTypeSelect = document.getElementById('deviceTypeSelect');
    const deviceIdInput = document.getElementById('deviceIdInput');
    const statusSelect = document.getElementById('statusSelect');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const refreshBtn = document.getElementById('refreshBtn');

    // 获取搜索输入框元素
    const siteSearchInput = document.getElementById('siteSearchInput');
    const deviceTypeSearchInput = document.getElementById('deviceTypeSearchInput');
    const statusSearchInput = document.getElementById('statusSearchInput');
    
    searchBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', () => {
        siteSelect.value = '';
        deviceTypeSelect.value = '';
        deviceIdInput.value = '';
        statusSelect.value = '';
        // 清空搜索框并重新过滤选项
        if(siteSearchInput) siteSearchInput.value = '';
        if(deviceTypeSearchInput) deviceTypeSearchInput.value = '';
        if(statusSearchInput) statusSearchInput.value = '';
        filterSelectOptions('siteSearchInput', 'siteSelect');
        filterSelectOptions('deviceTypeSearchInput', 'deviceTypeSelect');
        filterSelectOptions('statusSearchInput', 'statusSelect');
        applyFilters();
    });
    refreshBtn.addEventListener('click', applyFilters);
    
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('pageSizeSelect').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('triggerValidationBtn').addEventListener('click', showSiteDeviceSelectionModal);

    // 添加搜索框输入事件监听器
    if (siteSearchInput) {
        siteSearchInput.addEventListener('input', () => filterSelectOptions('siteSearchInput', 'siteSelect'));
    }
    if (deviceTypeSearchInput) {
        deviceTypeSearchInput.addEventListener('input', () => filterSelectOptions('deviceTypeSearchInput', 'deviceTypeSelect'));
    }
    if (statusSearchInput) {
        statusSearchInput.addEventListener('input', () => filterSelectOptions('statusSearchInput', 'statusSelect'));
    }
}

/**
 * 根据搜索框内容过滤下拉列表选项
 * @param {string} inputId - 搜索输入框的ID
 * @param {string} selectId - 下拉列表的ID
 */
function filterSelectOptions(inputId, selectId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    if (!input || !select) return;

    const filterValue = input.value.toLowerCase();
    const options = select.options;

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        // 保留第一个选项（通常是"全部..."）
        if (option.value === "") {
            option.style.display = "";
            continue;
        }
        
        const optionText = option.textContent.toLowerCase();
        if (optionText.includes(filterValue)) {
            option.style.display = ""; // 显示匹配的选项
        } else {
            option.style.display = "none"; // 隐藏不匹配的选项
        }
    }
}

/**
 * 应用筛选条件
 */
function applyFilters() {
    const siteValue = document.getElementById('siteSelect').value;
    const deviceTypeValue = document.getElementById('deviceTypeSelect').value;
    const deviceIdValue = document.getElementById('deviceIdInput').value.trim().toLowerCase();
    const statusValue = document.getElementById('statusSelect').value;
    
    filteredData = allData.filter(item => 
        (!siteValue || item.site.id === siteValue) &&
        (!deviceTypeValue || item.deviceType.id === deviceTypeValue) &&
        (!deviceIdValue || item.deviceId.toLowerCase().includes(deviceIdValue)) &&
        (!statusValue || item.status === statusValue)
    );
    
    currentPage = 1;
    sortData();
    renderTable();
    updateStatsDisplay(); // 确保筛选后也更新统计
}

/**
 * 更新统计信息显示
 */
function updateStatsDisplay() {
    // 更新卡片显示 (现在基于 allData 计算)
    deviceStats.total = allData.length;
    deviceStats.normal = allData.filter(item => item.status === 'normal').length;
    deviceStats.abnormal = allData.filter(item => item.status === 'error').length;

    document.getElementById('normalDevices').textContent = deviceStats.normal;
    document.getElementById('abnormalDevices').textContent = deviceStats.abnormal;
    document.getElementById('lastCheckTime').textContent = deviceStats.lastCheckTime;
    document.getElementById('lastUpdateDate').textContent = deviceStats.lastUpdateStatus;
    
    // 更新表格结果计数
    document.getElementById('totalCount').textContent = filteredData.length;
    document.getElementById('errorCount').textContent = filteredData.filter(item => item.status === 'error').length;
}

/**
 * 初始化排序功能
 */
function initializeSorting() {
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const field = this.getAttribute('data-sort');
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            updateSortIndicators();
            sortData();
            renderTable();
        });
    });
}

/**
 * 更新排序指示器
 */
function updateSortIndicators() {
    document.querySelectorAll('th.sortable').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        header.querySelector('i').className = 'fas fa-sort';
    });
    const currentHeader = document.querySelector(`th[data-sort="${sortField}"]`);
    if (currentHeader) {
        currentHeader.classList.add(`sort-${sortDirection}`);
        currentHeader.querySelector('i').className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
    }
}

/**
 * 初始化分页功能
 */
function initializePagination() {
    document.querySelector('.page-btn[data-page="prev"]').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    document.querySelector('.page-btn[data-page="next"]').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
}

/**
 * 初始化校验进度弹窗
 */
function initializeValidationModal() {
    document.getElementById('closeModalBtn').addEventListener('click', hideValidationModal);
    document.getElementById('cancelValidationBtn').addEventListener('click', () => {
        // 如果校验正在进行，停止它
        if (currentValidationInterval) {
            clearInterval(currentValidationInterval);
            currentValidationInterval = null;
        }
        hideValidationModal();
    });
    document.getElementById('confirmBtn').addEventListener('click', hideValidationModal);
}

/**
 * 初始化站点/设备选择弹窗
 */
function initializeSiteDeviceSelectionModal() {
    const modal = document.getElementById('siteDeviceSelectionModal');
    const siteListContainer = document.getElementById('siteSelectionList');
    const deviceListContainer = document.getElementById('deviceSelectionList');

    // 关闭按钮
    document.getElementById('closeSelectionModalBtn').addEventListener('click', hideSiteDeviceSelectionModal);
    // 取消按钮
    document.getElementById('cancelSelectionBtn').addEventListener('click', hideSiteDeviceSelectionModal);
    
    // 全选/清除站点
    document.getElementById('selectAllSitesBtn').addEventListener('click', () => toggleAllCheckboxes(siteListContainer, true));
    document.getElementById('clearAllSitesBtn').addEventListener('click', () => toggleAllCheckboxes(siteListContainer, false));
    
    // 全选/清除设备
    document.getElementById('selectAllDevicesBtn').addEventListener('click', () => toggleAllCheckboxes(deviceListContainer, true));
    document.getElementById('clearAllDevicesBtn').addEventListener('click', () => toggleAllCheckboxes(deviceListContainer, false));

    // 站点列表变化时更新设备列表
    siteListContainer.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateDeviceSelectionList();
        }
    });

    // 设备列表变化时更新计数
    deviceListContainer.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateSelectedDeviceCount();
        }
    });

    // 开始校验按钮
    document.getElementById('startValidationBtn').addEventListener('click', () => {
        const selectedDevices = getSelectedDevices();
        if (selectedDevices.length === 0) {
            alert('请至少选择一个设备进行校验。');
            return;
        }
        hideSiteDeviceSelectionModal();
        // 使用选中的设备启动校验
        showValidationModal(selectedDevices.length);
    });
}

/**
 * 全选/取消全选指定容器内的复选框
 * @param {HTMLElement} container - 包含复选框的容器
 * @param {boolean} checked - 是否选中
 */
function toggleAllCheckboxes(container, checked) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked !== checked) {
           checkbox.checked = checked;
           // 手动触发change事件以确保相关逻辑（如更新设备列表或计数）被执行
           checkbox.dispatchEvent(new Event('change', { bubbles: true })); 
        }
    });
}

/**
 * 更新选择弹窗中的设备列表
 */
function updateDeviceSelectionList() {
    const siteListContainer = document.getElementById('siteSelectionList');
    const deviceListContainer = document.getElementById('deviceSelectionList');
    const selectedSiteCheckboxes = siteListContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedSiteIds = Array.from(selectedSiteCheckboxes).map(cb => cb.value);

    deviceListContainer.innerHTML = ''; // 清空现有设备列表

    if (selectedSiteIds.length === 0) {
        deviceListContainer.innerHTML = '<p class="placeholder-text">请先选择站点以加载设备列表</p>';
        updateSelectedDeviceCount();
        return;
    }

    const devicesToShow = allData.filter(device => selectedSiteIds.includes(device.site.id));

    if (devicesToShow.length === 0) {
        deviceListContainer.innerHTML = '<p class="placeholder-text">所选站点下无设备</p>';
    } else {
        devicesToShow.forEach(device => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            const checkboxId = `device-checkbox-${device.id}`;
            div.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${device.id}" data-device-id="${device.deviceId}">
                <label for="${checkboxId}">${device.deviceId} (${device.deviceType.name})</label>
            `;
            deviceListContainer.appendChild(div);
        });
    }
    updateSelectedDeviceCount(); // 更新计数
}

/**
 * 获取当前选中的设备ID列表
 * @returns {Array<string>} 返回选中的设备记录ID列表
 */
function getSelectedDevices() {
    const deviceListContainer = document.getElementById('deviceSelectionList');
    const selectedDeviceCheckboxes = deviceListContainer.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(selectedDeviceCheckboxes).map(cb => cb.value);
}

/**
 * 更新已选设备计数显示
 */
function updateSelectedDeviceCount() {
    const count = document.getElementById('deviceSelectionList').querySelectorAll('input[type="checkbox"]:checked').length;
    document.getElementById('selectedDeviceCount').textContent = count;
}

/**
 * 显示站点/设备选择弹窗
 */
function showSiteDeviceSelectionModal() {
    const modal = document.getElementById('siteDeviceSelectionModal');
    const siteListContainer = document.getElementById('siteSelectionList');
    siteListContainer.innerHTML = ''; // 清空旧列表

    // 动态生成站点列表
    if (allSites.length > 0) {
        allSites.forEach(site => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            const checkboxId = `site-checkbox-${site.id}`;
            div.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${site.id}">
                <label for="${checkboxId}">${site.name}</label>
            `;
            siteListContainer.appendChild(div);
        });
    } else {
        siteListContainer.innerHTML = '<p class="placeholder-text">无可用站点信息</p>';
    }

    // 重置设备列表和计数
    document.getElementById('deviceSelectionList').innerHTML = '<p class="placeholder-text">请先选择站点以加载设备列表</p>';
    updateSelectedDeviceCount();

    modal.classList.add('show');
}

/**
 * 隐藏站点/设备选择弹窗
 */
function hideSiteDeviceSelectionModal() {
    const modal = document.getElementById('siteDeviceSelectionModal');
    modal.classList.remove('show');
}


/**
 * 显示校验进度弹窗
 * @param {number} totalToValidate - 需要校验的设备总数
 */
function showValidationModal(totalToValidate) {
    const modal = document.getElementById('validationModal');
    modal.classList.add('show');
    
    // 重置进度显示
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0';
    document.getElementById('validatedCount').textContent = '0';
    document.getElementById('totalToValidate').textContent = totalToValidate; // 使用传入的数量
    document.getElementById('remainingTime').textContent = '计算中...';
    
    const resultDiv = document.getElementById('validationResult');
    resultDiv.classList.remove('show');
    resultDiv.innerHTML = '';
    document.getElementById('confirmBtn').disabled = true;
    
    // 模拟校验进度
    simulateValidationProgress(totalToValidate);
}

/**
 * 隐藏校验进度弹窗
 */
function hideValidationModal() {
    const modal = document.getElementById('validationModal');
    modal.classList.remove('show');
    // 确保停止任何正在运行的模拟校验
    if (currentValidationInterval) {
        clearInterval(currentValidationInterval);
        currentValidationInterval = null;
    }
}

/**
 * 模拟校验进度
 * @param {number} totalItems - 需要校验的设备总数
 */
function simulateValidationProgress(totalItems) {
    let progress = 0;
    let validatedItemsCount = 0;
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const validatedCount = document.getElementById('validatedCount');
    const remainingTime = document.getElementById('remainingTime');
    const resultDiv = document.getElementById('validationResult');
    const confirmBtn = document.getElementById('confirmBtn');
    
    // 更新全局统计中的校验时间
    const now = new Date();
    deviceStats.lastCheckTime = formatDateTime(now.toISOString());
    deviceStats.lastUpdateStatus = '刚刚更新';
    
    // 清除可能存在的旧interval
    if (currentValidationInterval) {
        clearInterval(currentValidationInterval);
    }

    // 模拟进度
    currentValidationInterval = setInterval(() => {
        // 每次增加一点进度，更平滑
        const increment = Math.random() * (totalItems > 0 ? (100 / totalItems) * 0.5 : 5) + 1;
        progress += increment;
        validatedItemsCount = Math.min(Math.round(totalItems * progress / 100), totalItems);

        if (progress >= 100) {
            progress = 100;
            validatedItemsCount = totalItems;
            clearInterval(currentValidationInterval);
            currentValidationInterval = null;
            
            // 校验完成后显示结果
            // 注意：这里的异常设备数仍然使用全局统计，理想情况下应该基于本次校验结果更新
            resultDiv.innerHTML = `
                <h4>校验完成</h4>
                <p>共校验 ${totalItems} 台设备，发现 ${deviceStats.abnormal} 台异常设备。</p>
                <p>校验时间：${deviceStats.lastCheckTime}</p>
            `;
            resultDiv.classList.add('show');
            confirmBtn.disabled = false;
            
            // 更新页面上的统计卡片和表格（模拟数据已更新状态）
            // 在实际应用中，这里可能需要重新获取数据
            updateStatsDisplay(); 
            applyFilters(); // 重新应用筛选并渲染表格

        }
        
        // 更新进度显示
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = Math.round(progress);
        validatedCount.textContent = validatedItemsCount;
        
        // 估算剩余时间
        const remainingProgress = 100 - progress;
        // 假设每次interval大约校验 increment / (100/totalItems) 个设备，耗时200ms
        let estimatedRemainingMs = 0;
        if (increment > 0 && totalItems > 0) {
            const itemsPerIncrement = increment / (100 / totalItems);
            const incrementsRemaining = remainingProgress / increment;
            estimatedRemainingMs = incrementsRemaining * 200; // 假设每次interval 200ms
        }
        const remainingSecs = Math.round(estimatedRemainingMs / 1000);
        
        if (progress < 100 && remainingSecs > 0) {
            remainingTime.textContent = `约 ${remainingSecs} 秒`;
        } else if (progress < 100) {
             remainingTime.textContent = `即将完成...`;
        } else {
            remainingTime.textContent = '已完成';
        }
    }, 200); // 每200ms更新一次进度
}

/**
 * 根据当前排序设置对数据进行排序
 */
function sortData() {
    filteredData.sort((a, b) => {
        let valA, valB;
        switch (sortField) {
            case 'site': valA = a.site.name; valB = b.site.name; break;
            case 'type': valA = a.deviceType.name; valB = b.deviceType.name; break;
            case 'id': valA = a.deviceId; valB = b.deviceId; break;
            case 'template': valA = a.template; valB = b.template; break;
            case 'status': valA = a.status; valB = b.status; break;
            case 'time': 
                valA = new Date(a.time).getTime(); 
                valB = new Date(b.time).getTime(); 
                break;
            default: valA = a[sortField]; valB = b[sortField];
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * 渲染表格数据
 */
function renderTable() {
    const tableBody = document.getElementById('resultTableBody');
    const noDataTip = document.getElementById('noDataTip');
    const currentPageElem = document.getElementById('currentPage');
    const totalPagesElem = document.getElementById('totalPages');
    const totalRecordsElem = document.getElementById('totalRecords');
    const pageNumbersContainer = document.getElementById('pageNumbers');
    
    document.getElementById('totalCount').textContent = filteredData.length;
    document.getElementById('errorCount').textContent = filteredData.filter(item => item.status === 'error').length;
    
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = 1;
    
    currentPageElem.textContent = currentPage;
    totalPagesElem.textContent = totalPages;
    totalRecordsElem.textContent = filteredData.length;
    
    generatePaginationButtons(totalPages, pageNumbersContainer);
    
    document.querySelector('.page-btn[data-page="prev"]').disabled = currentPage === 1;
    document.querySelector('.page-btn[data-page="next"]').disabled = currentPage === totalPages;
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        noDataTip.style.display = 'flex';
        document.querySelector('.result-table-wrapper').style.display = 'none';
        return;
    } else {
        noDataTip.style.display = 'none';
        document.querySelector('.result-table-wrapper').style.display = 'block';
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    currentPageData.forEach(item => {
        const row = document.createElement('tr');
        if (item.status === 'error') row.classList.add('error-row');
        row.innerHTML = `
            <td>${item.site.name}</td>
            <td>${item.deviceType.name}</td>
            <td>${item.deviceId}</td>
            <td>${item.template}</td>
            <td><span class="status-badge ${getStatusClass(item.status)}">${getStatusText(item.status)}</span></td>
            <td>${formatDateTime(item.time)}</td>
            <td><button class="action-btn" data-id="${item.id}"><i class="fas fa-eye"></i> 查看详情</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            viewDetails(this.getAttribute('data-id'));
        });
    });
}

/**
 * 生成分页按钮
 */
function generatePaginationButtons(totalPages, container) {
    container.innerHTML = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number${i === currentPage ? ' active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', function() {
            currentPage = i;
            renderTable();
        });
        container.appendChild(pageBtn);
    }
}

/**
 * 初始化参数详情弹窗
 */
function initializeParameterDetailModal() {
    const modal = document.getElementById('parameterDetailModal');
    const showAllCheckbox = document.getElementById('showAllParamsCheckbox');

    document.getElementById('closeDetailModalBtn').addEventListener('click', hideParameterDetailModal);
    document.getElementById('closeDetailModalFooterBtn').addEventListener('click', hideParameterDetailModal);

    // 处理"显示所有参数"复选框的变化
    showAllCheckbox.addEventListener('change', function() {
        const comparisonBody = document.getElementById('parameterComparisonBody');
        const matchedRows = comparisonBody.querySelectorAll('tr.match');
        matchedRows.forEach(row => {
            row.classList.toggle('hidden-by-default', !this.checked);
        });
    });
}

/**
 * 显示参数详情弹窗
 * @param {string} recordId - 被点击行的记录ID
 */
function showParameterDetailModal(recordId) {
    const record = allData.find(item => item.id === recordId);
    if (!record) {
        console.error('未找到记录:', recordId);
        alert('无法加载参数详情。');
        return;
    }

    const modal = document.getElementById('parameterDetailModal');
    const deviceIdSpan = document.getElementById('detailDeviceID');
    const comparisonBody = document.getElementById('parameterComparisonBody');
    const showAllCheckbox = document.getElementById('showAllParamsCheckbox');
    const noDataTip = document.getElementById('noComparisonDataTip');

    deviceIdSpan.textContent = record.deviceId; // 显示设备ID
    comparisonBody.innerHTML = ''; // 清空旧内容
    showAllCheckbox.checked = false; // 默认不显示所有参数
    noDataTip.style.display = 'none'; // 隐藏无数据提示

    // 生成模拟对比数据
    const comparisonData = generateMockComparisonData(record);

    if (comparisonData.length === 0) {
        noDataTip.textContent = '该设备没有可对比的参数。';
        noDataTip.style.display = 'flex';
        modal.classList.add('show');
        return;
    }

    let hasMismatch = false;
    comparisonData.forEach(param => {
        const row = document.createElement('tr');
        row.classList.add(param.status === 'mismatch' ? 'mismatch' : 'match');
        if (param.status === 'match') {
            row.classList.add('hidden-by-default'); // 默认隐藏匹配项
        } else {
            hasMismatch = true;
        }

        row.innerHTML = `
            <td>${param.name}</td>
            <td>${param.expected}</td>
            <td>${param.actual}</td>
            <td>
                <span class="status-${param.status}">
                    ${param.status === 'mismatch' ? '不匹配' : '匹配'}
                </span>
            </td>
        `;
        comparisonBody.appendChild(row);
    });

    // 如果没有任何不匹配项，且复选框未选中，显示提示
    if (!hasMismatch && !showAllCheckbox.checked) {
        noDataTip.textContent = '未发现参数差异。勾选上方选项可查看所有参数。';
        noDataTip.style.display = 'flex';
    } else {
         noDataTip.style.display = 'none';
    }

    modal.classList.add('show');
}

/**
 * 隐藏参数详情弹窗
 */
function hideParameterDetailModal() {
    const modal = document.getElementById('parameterDetailModal');
    modal.classList.remove('show');
}

/**
 * 生成模拟参数对比数据
 * @param {object} record - 设备记录对象
 * @returns {Array} - 参数对比结果数组
 */
function generateMockComparisonData(record) {
    const params = [];
    const numParams = Math.floor(Math.random() * 15) + 5; // 随机生成5-20个参数
    const hasError = record.status === 'error'; // 设备本身是否异常

    const commonParams = [
        '额定电压', '额定电流', '最大充电功率', '最大放电功率', 
        '通信协议版本', '软件版本号', '硬件版本号', '过压保护阈值',
        '欠压保护阈值', '过流保护阈值', '过温保护阈值'
    ];
    const storageParams = ['电池簇容量', 'SOC上限', 'SOC下限', '单体最高允许电压', '单体最低允许电压'];
    const chargerParams = ['充电模式', '最大输出电流', '充电枪数量', '计费模型ID', '心跳间隔'];

    let availableParams = [...commonParams];
    if (record.deviceType.id === 'storage') {
        availableParams = availableParams.concat(storageParams);
    } else {
        availableParams = availableParams.concat(chargerParams);
    }

    for (let i = 0; i < numParams && i < availableParams.length; i++) {
        const paramName = availableParams[i];
        let expectedValue, actualValue, status;
        
        // 模拟一些常见的值
        let baseValue;
        if (paramName.includes('电压')) baseValue = Math.random() > 0.5 ? '380V' : '750V';
        else if (paramName.includes('电流')) baseValue = `${Math.floor(Math.random() * 100) + 50}A`;
        else if (paramName.includes('功率')) baseValue = `${Math.floor(Math.random() * 200) + 100}kW`;
        else if (paramName.includes('版本')) baseValue = `V${Math.floor(Math.random()*3)+1}.${Math.floor(Math.random()*5)}.${Math.floor(Math.random()*10)}`;
        else if (paramName.includes('SOC')) baseValue = `${Math.floor(Math.random() * 10) + (paramName.includes('上限') ? 90 : 10)}%`;
        else baseValue = (Math.random() + 1).toString(36).substring(7).toUpperCase(); // 随机字符串
        
        expectedValue = baseValue;

        // 如果设备是异常状态，有更高概率产生不匹配参数
        // 否则，只有较小概率产生不匹配
        const mismatchProbability = hasError ? 0.4 : 0.1;
        if (Math.random() < mismatchProbability) {
            status = 'mismatch';
            // 随机生成一个不同的实际值
            if (paramName.includes('电压')) actualValue = Math.random() > 0.5 ? '400V' : '700V';
            else if (paramName.includes('SOC')) actualValue = `${parseInt(baseValue) + (Math.random() > 0.5 ? 5 : -5)}%`;
            else actualValue = (Math.random() + 1).toString(36).substring(6).toUpperCase();
        } else {
            status = 'match';
            actualValue = expectedValue;
        }

        params.push({
            name: paramName,
            expected: expectedValue,
            actual: actualValue,
            status: status
        });
    }
    return params;
}

/**
 * 查看详情 (更新此函数)
 * @param {string} id - 记录ID
 */
function viewDetails(id) {
    // alert(`将跳转到ID为 ${id} 的详细参数比对明细页面`); // 注释掉旧的alert
    // window.location.href = `parameter-detail.html?id=${id}`; // 注释掉跳转
    showParameterDetailModal(id); // 调用显示新详情弹窗的函数
}

/**
 * 导出到CSV
 */
function exportToCSV() {
    if (!confirm(`确定要导出当前${filteredData.length}条记录吗？`)) return;
    
    let csvContent = "站点名称,设备类型,设备编号,使用模板,校验状态,最近校验时间\n";
    filteredData.forEach(item => {
        csvContent += `"${item.site.name}","${item.deviceType.name}","${item.deviceId}","${item.template}","${getStatusText(item.status)}","${formatDateTime(item.time)}"\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // 添加BOM头解决Excel中文乱码
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `参数校验结果_${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 根据状态获取对应的CSS类名
 */
function getStatusClass(status) {
    return status === 'normal' ? 'status-normal' : (status === 'error' ? 'status-error' : '');
}

/**
 * 根据状态获取显示文本
 */
function getStatusText(status) {
    return status === 'normal' ? '正常' : (status === 'error' ? '异常' : '未知');
}

/**
 * 格式化日期为YYYY-MM-DD格式
 */
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间为YYYY-MM-DD HH:MM:SS格式
 */
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr || dateTimeStr === 'N/A') return 'N/A'; // 处理初始值
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date)) return '无效日期'; // 处理无效日期
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return '格式化错误';
    }
}

/**
 * 加载模拟数据
 */
function loadMockData() {
    // 站点列表
    allSites = [
        { id: 'site1', name: '清安储能电站A区' },
        { id: 'site2', name: '清安储能电站B区' },
        { id: 'site3', name: '沿海风电储能站' },
        { id: 'site4', name: '城市快充站东区' },
        { id: 'site5', name: '高速公路充电站' }
    ];
    
    const deviceTypes = [
        { id: 'storage', name: '储能柜' },
        { id: 'charger', name: '充电桩' }
    ];
    
    const templates = [
        '储能柜模版L2-B12V1.0',
        '储能柜模版L3-A10V2.1',
        '充电桩模版V2.0',
        '充电桩模版V2.3',
        '储能柜模版S系列V1.5'
    ];
    
    const statuses = ['normal', 'normal', 'normal', 'normal', 'error'];
    
    allData = [];
    for (let i = 1; i <= 50; i++) {
        const site = allSites[Math.floor(Math.random() * allSites.length)];
        const deviceType = site.name.includes('充电') ? 
            deviceTypes.find(dt => dt.id === 'charger') : 
            deviceTypes.find(dt => dt.id === 'storage');
        
        let templateOptions = templates.filter(t => 
            (deviceType.id === 'storage' && t.includes('储能柜')) || 
            (deviceType.id === 'charger' && t.includes('充电桩'))
        );
        if (templateOptions.length === 0) {
             // 如果没有匹配的模板，提供一个默认值或跳过？这里简单用第一个模板
             templateOptions = [templates[0]];
        }
        const template = templateOptions[Math.floor(Math.random() * templateOptions.length)];
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));
        
        const prefix = deviceType.id === 'storage' ? 'SB' : 'CD';
        const deviceId = `${prefix}-${site.id.slice(-1)}-${Math.floor(1000 + Math.random() * 9000)}`; // 简化编号
        
        const item = {
            id: `record-${i}`,
            site: site,
            deviceType: deviceType,
            deviceId: deviceId,
            template: template,
            status: status,
            time: date.toISOString()
        };
        allData.push(item);
    }
    
    filteredData = [...allData];
    sortData();
    updateSiteSelect(allSites); // 确保筛选框也被更新
    renderTable();
    updateStatsDisplay();
}

/**
 * 更新站点选择框选项 (主筛选区域)
 */
function updateSiteSelect(sites) {
    const siteSelect = document.getElementById('siteSelect');
    if (!siteSelect) return;
    
    const currentVal = siteSelect.value;
    siteSelect.innerHTML = '<option value="">全部站点</option>'; 
    
    sites.forEach(site => {
        const option = document.createElement('option');
        option.value = site.id;
        option.textContent = site.name;
        siteSelect.appendChild(option);
    });
    
    if (sites.some(s => s.id === currentVal)) {
       siteSelect.value = currentVal; 
    }

    // 更新站点列表后，如果搜索框有内容，需要重新应用过滤
    filterSelectOptions('siteSearchInput', 'siteSelect');
} 