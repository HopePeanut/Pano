/**
 * 监控系统控制和配置页面逻辑
 */

/**
 * 加载控制页面内容
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadControlContent(system = 'ems', device = 'local') {
    console.log(`加载 ${system} 的 ${device} 控制内容`);
    
    const controlContainer = document.querySelector('#control-content .control-points-list');
    
    // 清空容器
    controlContainer.innerHTML = '';
    
    // 添加标题和说明
    const controlHeader = document.querySelector('#control-content h3');
    controlHeader.innerHTML = `控制点位 <button class="refresh-btn"><i class="bi bi-arrow-clockwise"></i></button>`;
    
    // 获取控制点位数据
    const controlPoints = getControlPoints(system, device);
    
    // 遍历控制点位并创建控制项
    controlPoints.forEach(control => {
        const controlItem = document.createElement('div');
        controlItem.className = 'control-item';
        
        // 创建控制点名称
        const controlName = document.createElement('div');
        controlName.className = 'control-name';
        controlName.textContent = control.name;
        controlItem.appendChild(controlName);
        
        // 创建控制值区域
        const controlValue = document.createElement('div');
        controlValue.className = 'control-value';
        
        // 根据控制点类型创建不同的控制元素
        if (control.type === 'button') {
            // 按钮类型
            control.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'control-button';
                button.textContent = option.label;
                button.dataset.value = option.value;
                
                // 添加危险操作的样式
                if (option.value === 'stop' || option.value === 'force-offline' || option.value === 'off-grid') {
                    button.classList.add('danger');
                }
                
                // 添加点击事件
                button.addEventListener('click', function() {
                    handleControlAction(system, device, control.name, option.value);
                });
                
                controlValue.appendChild(button);
            });
        } else if (control.type === 'input') {
            // 输入类型
            const input = document.createElement('input');
            input.className = 'control-input';
            input.type = 'number';
            input.value = control.value;
            input.min = control.min;
            input.max = control.max;
            controlValue.appendChild(input);
            
            // 添加单位
            if (control.unit) {
                const unitSpan = document.createElement('span');
                unitSpan.textContent = control.unit;
                controlValue.appendChild(unitSpan);
            }
            
            // 添加设置按钮
            const setButton = document.createElement('button');
            setButton.className = 'control-button';
            setButton.textContent = '设置';
            setButton.addEventListener('click', function() {
                handleControlAction(system, device, control.name, input.value);
            });
            controlValue.appendChild(setButton);
        } else if (control.type === 'radio') {
            // 单选类型
            const controlOptions = document.createElement('div');
            controlOptions.className = 'control-options';
            
            control.options.forEach(option => {
                const radioContainer = document.createElement('div');
                radioContainer.className = 'control-radio';
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `${device}-${control.name.replace(/\s+/g, '-')}`;
                radio.value = option.value;
                radio.checked = option.checked;
                
                const label = document.createElement('label');
                label.textContent = option.label;
                
                radioContainer.appendChild(radio);
                radioContainer.appendChild(label);
                controlOptions.appendChild(radioContainer);
                
                // 添加点击事件
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        handleControlAction(system, device, control.name, option.value);
                    }
                });
            });
            
            controlValue.appendChild(controlOptions);
        }
        
        controlItem.appendChild(controlValue);
        controlContainer.appendChild(controlItem);
    });
    
    // 添加刷新按钮事件
    const refreshBtn = controlHeader.querySelector('.refresh-btn');
    refreshBtn.addEventListener('click', function() {
        showTooltip('正在刷新控制点位...', 'info');
        setTimeout(() => {
            loadControlContent(system, device);
            showTooltip('控制点位刷新成功', 'success');
        }, 500);
    });
}

/**
 * 处理控制操作
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} controlName - 控制点名称
 * @param {string} value - 控制值
 */
function handleControlAction(system, device, controlName, value) {
    console.log(`执行控制操作: ${system} - ${device} - ${controlName} = ${value}`);
    
    // 显示确认对话框
    if (confirm(`确定要将 ${getDeviceName(device)} 的 ${controlName} 设置为 ${value} 吗？`)) {
        showTooltip(`正在执行 ${controlName} 操作...`, 'info');
        
        // 模拟执行控制操作
        setTimeout(() => {
            // 模拟随机成功或失败
            const isSuccess = Math.random() > 0.1;
            
            if (isSuccess) {
                showTooltip(`${controlName} 操作执行成功`, 'success');
            } else {
                showTooltip(`${controlName} 操作执行失败`, 'error');
            }
        }, 1500);
    }
}

/**
 * 加载参数配置页面内容
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 */
function loadConfigContent(system = 'ems', device = 'local') {
    console.log(`加载 ${system} 的 ${device} 参数配置内容`);
    
    const paramListContainer = document.querySelector('.param-list-container');
    
    // 清空容器
    paramListContainer.innerHTML = '';
    
    // 创建两个参数组的列表
    const operationParamList = document.createElement('div');
    operationParamList.className = 'param-list active';
    operationParamList.dataset.paramGroup = 'operation';
    
    const protectionParamList = document.createElement('div');
    protectionParamList.className = 'param-list';
    protectionParamList.dataset.paramGroup = 'protection';
    
    // 加载运行参数
    loadParamList(operationParamList, system, device, 'operation');
    
    // 加载保护参数
    loadParamList(protectionParamList, system, device, 'protection');
    
    // 添加到容器
    paramListContainer.appendChild(operationParamList);
    paramListContainer.appendChild(protectionParamList);
    
    // 确保选项卡显示正确
    const activeGroup = document.querySelector('.param-group-tabs .tab-item.active').dataset.paramGroup;
    
    operationParamList.classList.toggle('active', activeGroup === 'operation');
    protectionParamList.classList.toggle('active', activeGroup === 'protection');
    
    // 添加参数组选项卡切换事件
    initParamGroupTabs();
}

/**
 * 初始化参数组选项卡
 */
function initParamGroupTabs() {
    const tabItems = document.querySelectorAll('.param-group-tabs .tab-item');
    const paramLists = document.querySelectorAll('.param-list');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const paramGroup = this.dataset.paramGroup;
            
            // 更新选项卡状态
            tabItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // 更新参数列表显示
            paramLists.forEach(list => {
                list.classList.toggle('active', list.dataset.paramGroup === paramGroup);
            });
        });
    });
}

/**
 * 加载参数列表
 * @param {HTMLElement} container - 容器元素
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} group - 参数组
 */
function loadParamList(container, system, device, group) {
    // 添加刷新按钮
    const groupHeader = document.createElement('div');
    groupHeader.className = 'param-group-header';
    
    groupHeader.innerHTML = `
        <h3 class="section-title">
            ${group === 'operation' ? '运行参数' : '保护参数'}
            <button class="refresh-btn"><i class="bi bi-arrow-clockwise"></i></button>
        </h3>
    `;
    
    container.appendChild(groupHeader);
    
    // 获取参数数据
    const params = getConfigParams(system, device, group);
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'param-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="param-name">参数名称</th>
            <th class="param-value">当前值</th>
            <th class="param-unit">单位</th>
            <th class="param-range">可调范围</th>
            <th class="param-status">状态</th>
            <th class="param-action">操作</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    // 遍历参数数据并创建行
    params.forEach(param => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="param-name">${param.name}</td>
            <td class="param-value">${param.value}</td>
            <td class="param-unit">${param.unit}</td>
            <td class="param-range">${param.range}</td>
            <td class="param-status">${param.status}</td>
            <td class="param-action">
                <button class="param-edit-btn" data-param-name="${param.name}" data-param-value="${param.value}" data-param-unit="${param.unit}" data-param-range="${param.range}">编辑</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // 添加参数编辑事件
    const editButtons = container.querySelectorAll('.param-edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paramName = this.dataset.paramName;
            const paramValue = this.dataset.paramValue;
            const paramUnit = this.dataset.paramUnit;
            const paramRange = this.dataset.paramRange;
            
            // 创建编辑对话框
            showParamEditDialog(system, device, paramName, paramValue, paramUnit, paramRange);
        });
    });
    
    // 添加刷新按钮事件
    const refreshBtn = groupHeader.querySelector('.refresh-btn');
    refreshBtn.addEventListener('click', function() {
        showTooltip(`正在刷新${group === 'operation' ? '运行' : '保护'}参数...`, 'info');
        setTimeout(() => {
            loadParamList(container, system, device, group);
            showTooltip(`${group === 'operation' ? '运行' : '保护'}参数刷新成功`, 'success');
        }, 500);
    });
}

/**
 * 显示参数编辑对话框
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} paramName - 参数名称
 * @param {string} paramValue - 参数当前值
 * @param {string} paramUnit - 参数单位
 * @param {string} paramRange - 参数可调范围
 */
function showParamEditDialog(system, device, paramName, paramValue, paramUnit, paramRange) {
    // 检查是否已存在对话框
    let dialog = document.getElementById('param-edit-dialog');
    
    if (!dialog) {
        // 创建对话框
        dialog = document.createElement('div');
        dialog.id = 'param-edit-dialog';
        dialog.className = 'modal';
        
        document.body.appendChild(dialog);
    }
    
    // 设置对话框内容
    dialog.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>编辑参数</h3>
                <span class="close-btn" id="close-param-dialog">&times;</span>
            </div>
            <div class="modal-body">
                <div class="param-edit-form">
                    <div class="form-group">
                        <label>参数名称:</label>
                        <span id="edit-param-name">${paramName}</span>
                    </div>
                    <div class="form-group">
                        <label>当前值:</label>
                        <span>${paramValue} ${paramUnit}</span>
                    </div>
                    <div class="form-group">
                        <label>可调范围:</label>
                        <span>${paramRange} ${paramUnit}</span>
                    </div>
                    <div class="form-group">
                        <label>新值:</label>
                        <input type="text" id="edit-param-value" value="${paramValue}">
                        <span>${paramUnit}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-param-edit" class="control-button">取消</button>
                <button id="save-param-edit" class="control-button">保存</button>
            </div>
        </div>
    `;
    
    // 显示对话框
    dialog.style.display = 'block';
    
    // 添加关闭事件
    const closeBtn = document.getElementById('close-param-dialog');
    const cancelBtn = document.getElementById('cancel-param-edit');
    const saveBtn = document.getElementById('save-param-edit');
    
    closeBtn.addEventListener('click', function() {
        dialog.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', function() {
        dialog.style.display = 'none';
    });
    
    saveBtn.addEventListener('click', function() {
        const newValue = document.getElementById('edit-param-value').value;
        
        // 验证输入
        if (!newValue) {
            alert('请输入有效值');
            return;
        }
        
        // 保存参数
        saveParameter(system, device, paramName, newValue);
        
        // 关闭对话框
        dialog.style.display = 'none';
    });
    
    // 点击对话框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === dialog) {
            dialog.style.display = 'none';
        }
    });
}

/**
 * 保存参数
 * @param {string} system - 系统标识
 * @param {string} device - 设备标识
 * @param {string} paramName - 参数名称
 * @param {string} value - 参数新值
 */
function saveParameter(system, device, paramName, value) {
    console.log(`保存参数: ${system} - ${device} - ${paramName} = ${value}`);
    
    showTooltip(`正在保存 ${paramName} 参数...`, 'info');
    
    // 模拟保存参数
    setTimeout(() => {
        // 模拟随机成功或失败
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            showTooltip(`${paramName} 参数保存成功`, 'success');
            
            // 重新加载参数配置
            const activeGroup = document.querySelector('.param-group-tabs .tab-item.active').dataset.paramGroup;
            const activeSystem = document.querySelector('.system-tabs .tab-item.active').dataset.system;
            const activeDevice = document.querySelector('.device-tabs .tab-item.active').dataset.device;
            
            loadConfigContent(activeSystem, activeDevice);
        } else {
            showTooltip(`${paramName} 参数保存失败`, 'error');
        }
    }, 1500);
} 