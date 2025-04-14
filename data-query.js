// ==================================================
// 全局变量区域
// ==================================================

// 站点信息
let allSites = [
    { value: 'site1', text: '北京昌平储能电站' },
    { value: 'site2', text: '上海嘉定充电站' },
    { value: 'site3', text: '深圳宝安光储充电站' },
    { value: 'site4', text: '广州南沙储能电站' },
    { value: 'site5', text: '天津滨海充电桩' },
    { value: 'site6', text: '杭州西湖储能站' },
    { value: 'site7', text: '南京江北新区充电站' },
    { value: 'site8', text: '成都天府新区储能电站' },
    { value: 'site9', text: '武汉光谷储能站' },
    { value: 'site10', text: '西安高新区充电桩' },
];

// 模拟设备层级数据
const deviceHierarchyData = {
    storage: { // 储能系统
        instances: ['储能系统 #1', '储能系统 #2'],
        components: {
            '储能系统 #1': {
                PCS: ['PCS #1', 'PCS #2'],
                BMS: ['BMS #1'],
                BatteryCluster: ['电池簇 #1', '电池簇 #2', '电池簇 #3']
            },
            '储能系统 #2': {
                PCS: ['PCS #3', 'PCS #4'],
                BMS: ['BMS #2'],
                BatteryCluster: ['电池簇 #4', '电池簇 #5']
            }
        },
        points: {
            'PCS #1': ['有功功率', '无功功率', 'A相电流', 'B相电流', 'C相电流'],
            'PCS #2': ['有功功率', '无功功率', 'A相电流', 'B相电流', 'C相电流'],
            'PCS #3': ['有功功率', '无功功率', 'A相电流', 'B相电流', 'C相电流'],
            'PCS #4': ['有功功率', '无功功率', 'A相电流', 'B相电流', 'C相电流'],
            'BMS #1': ['总电压', '总电流', 'SOC', 'SOH'],
            'BMS #2': ['总电压', '总电流', 'SOC', 'SOH'],
            '电池簇 #1': ['簇电压', '簇电流', '最高单体温度', '最低单体温度'],
            '电池簇 #2': ['簇电压', '簇电流', '最高单体温度', '最低单体温度'],
            '电池簇 #3': ['簇电压', '簇电流', '最高单体温度', '最低单体温度'],
            '电池簇 #4': ['簇电压', '簇电流', '最高单体温度', '最低单体温度'],
            '电池簇 #5': ['簇电压', '簇电流', '最高单体温度', '最低单体温度'],
        }
    },
    charging: { // 充电桩
        instances: ['充电桩群组 A', '充电桩群组 B'],
        components: {
            '充电桩群组 A': {
                Charger: ['充电桩 #1', '充电桩 #2', '充电桩 #3']
            },
            '充电桩群组 B': {
                Charger: ['充电桩 #4', '充电桩 #5']
            }
        },
        points: {
            '充电桩 #1': ['充电功率', '充电电压', '充电电流', '状态'],
            '充电桩 #2': ['充电功率', '充电电压', '充电电流', '状态'],
            '充电桩 #3': ['充电功率', '充电电压', '充电电流', '状态'],
            '充电桩 #4': ['充电功率', '充电电压', '充电电流', '状态'],
            '充电桩 #5': ['充电功率', '充电电压', '充电电流', '状态'],
        }
    },
    pv: { // 光伏系统
        instances: ['光伏阵列 1'],
        components: {
            '光伏阵列 1': {
                Inverter: ['逆变器 #1', '逆变器 #2'],
                CombinerBox: ['汇流箱 #1']
            }
        },
        points: {
            '逆变器 #1': ['直流输入功率', '交流输出功率', '日发电量', '总发电量'],
            '逆变器 #2': ['直流输入功率', '交流输出功率', '日发电量', '总发电量'],
            '汇流箱 #1': ['支路1电流', '支路2电流', '支路3电流', '箱内温度']
        }
    }
};

// 当前选择状态
let selectedSiteValues = [];
let selectedHierarchy = { systemType: null, systemInstances: [], componentTypes: [], componentInstances: [] };
let selectedPoints = [];

// 地图相关变量
let map = null;
let markers = [];

// 图表实例
let chart = null;

// --- 数据对比 (Modal) ---
let currentChartSeries = []; // 存储当前图表中的数据系列
let compareData = null; // 存储对比数据
let isCompareMode = false; // 标记是否处于对比模式

// ==================================================
// 函数定义区域
// ==================================================

// --- 工具函数 ---
function resetAndHideLevel(levelElement, listElement) {
    levelElement.style.display = 'none';
    listElement.innerHTML = '';
}

function populateCheckboxList(listElement, items) {
    listElement.innerHTML = items.map(item => `
        <label>
            <input type="checkbox" value="${item}"> ${item}
        </label>
    `).join('');
}

function getCheckedValues(listElement) {
    return Array.from(listElement.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

function setCheckedValues(listElement, values) {
    Array.from(listElement.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
        checkbox.checked = values.includes(checkbox.value);
    });
}

function formatDateTime(date) {
    return date.toISOString().slice(0, 16);
}

function formatDateTimeForAxis(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day}\n${hours}:${minutes}`;
}

function getIntervalByGranularity(granularity) {
    const intervals = { 'second': 1000, 'minute': 60000, 'hour': 3600000, 'day': 86400000 };
    return intervals[granularity] || intervals['hour']; // 默认小时
}

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
}

function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportTableToCSV() {
    const table = document.querySelector('#table-container table');
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tr'));
    const csv = rows.map(row => {
        return Array.from(row.querySelectorAll('th,td'))
            .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`) // 处理引号
            .join(',');
    }).join('\n');
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); // 添加 BOM
    const url = URL.createObjectURL(blob);
    downloadFile(url, '数据表格.csv');
    URL.revokeObjectURL(url);
}

// --- 筛选区域初始化 ---
function initFilterSection() {
    initSiteSelect();
    initDeviceHierarchy();
    initPointSelect();
    initQueryActions();
    initCollapse();
}

// --- 站点选择 (Modal) ---
function initSiteSelect() {
    const siteSelectTrigger = document.querySelector('.site-select-trigger input');
    const mapSelectBtn = document.querySelector('.map-select-btn');
    
    if (!siteSelectTrigger) {
        console.error("Site select trigger input not found!");
        return;
    }
    if (mapSelectBtn) {
        mapSelectBtn.addEventListener('click', function() {
            console.log("Map select button clicked!");
            showMapModal();
        });
    } else {
         console.warn("Map select button not found!");
    }

    siteSelectTrigger.addEventListener('click', function() {
        console.log("Site select trigger clicked!");
        showSiteSelectModal();
    });
}

function initSiteSelectModal() {
    const modal = document.getElementById('site-select-modal');
    if (!modal) return console.error("Site Select Modal element not found");
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    const searchInput = document.getElementById('site-search-input');
    const listContainer = document.getElementById('site-list-container');

    if (!closeBtn || !cancelBtn || !confirmBtn || !searchInput || !listContainer) {
        console.error("One or more elements missing in Site Select Modal");
        return;
    }

    console.log("Initializing Site Select Modal listeners...");

    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => hideSiteSelectModal());
    });

    confirmBtn.addEventListener('click', () => {
        console.log("Site select CONFIRM button clicked!");
        try {
            applySiteSelection();
            hideSiteSelectModal();
            console.log("Site selection applied and modal hidden.");
        } catch (error) {
            console.error("Error during site selection apply/hide:", error);
        }
    });

    searchInput.addEventListener('input', () => {
        renderSiteList(searchInput.value);
    });
    
    // listContainer change listener (optional, for immediate feedback)
    // listContainer.addEventListener('change', (e) => { ... });
}

function showSiteSelectModal() {
    const modal = document.getElementById('site-select-modal');
    if (!modal) return console.error("Cannot show: Site select modal element not found!");
    console.log("Attempting to show site select modal...");
    const searchInput = document.getElementById('site-search-input');
    if (searchInput) searchInput.value = ''; 
    renderSiteList(); 
    modal.classList.add('active');
    console.log("Site select modal should be active now.");
}

function hideSiteSelectModal() {
    const modal = document.getElementById('site-select-modal');
    if (modal) modal.classList.remove('active');
}

function renderSiteList(searchTerm = '') {
    const container = document.getElementById('site-list-container');
    if (!container) return console.error("Cannot render: Site list container not found!");
    console.log(`Rendering site list with search term: '${searchTerm}'`);
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filteredSites = allSites.filter(site => 
        site.text.toLowerCase().includes(lowerSearchTerm)
    );
    
    container.innerHTML = filteredSites.map(site => `
        <div class="modal-list-item">
            <input type="checkbox" id="site-check-${site.value}" value="${site.value}" 
                   ${selectedSiteValues.includes(site.value) ? 'checked' : ''}>
            <label for="site-check-${site.value}">${site.text}</label>
        </div>
    `).join('');
    console.log(`Rendered ${filteredSites.length} site items.`);
}

function applySiteSelection() {
    const container = document.getElementById('site-list-container');
    if (!container) return console.error("Cannot apply selection: Site list container not found!");
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    selectedSiteValues = Array.from(checkboxes).map(cb => cb.value);
    console.log("Applied site selection:", selectedSiteValues);
    updateSelectedSitesDisplay();
}

function updateSelectedSitesDisplay() {
    const displayInput = document.getElementById('selected-sites-display');
    const countSpan = document.getElementById('selected-sites-count');
    if (!displayInput || !countSpan) {
        console.warn("Site display input or count span not found.");
        return;
    }
    const count = selectedSiteValues.length;
    
    if (count === 0) {
        displayInput.placeholder = '点击选择站点';
        displayInput.value = '';
    } else if (count === 1) {
        const site = allSites.find(s => s.value === selectedSiteValues[0]);
        displayInput.value = site ? site.text : '';
        displayInput.placeholder = '点击选择站点';
    } else {
        const selectedNames = selectedSiteValues.map(value => {
            const site = allSites.find(s => s.value === value);
            return site ? site.text : value;
        }).join(', ');
        displayInput.value = selectedNames;
        displayInput.placeholder = '点击选择站点';
    }
    countSpan.textContent = `已选择 ${count} 个站点`;
}

// --- 地图选点 (Modal) ---
function initMapModal() {
    const modal = document.getElementById('map-modal');
    if (!modal) return console.error("Map Modal element not found");
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');

     if (!closeBtn || !cancelBtn || !confirmBtn) {
        console.error("One or more buttons missing in Map Modal");
        return;
    }

    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => hideMapModal());
    });
    
    confirmBtn.addEventListener('click', () => {
        applyMapSelection();
        hideMapModal();
    });
}

function showMapModal() {
    const modal = document.getElementById('map-modal');
    if (!modal) return console.error("Cannot show: Map modal element not found!");
    modal.classList.add('active');
    setTimeout(() => {
        if (!map && typeof AMap !== 'undefined') {
            initMap();
        } else if (typeof AMap === 'undefined'){
            console.error("AMap library not loaded.");
        }
    }, 100);
}

function hideMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) modal.classList.remove('active');
}

function initMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return console.error("Map container element not found!");
    try {
        map = new AMap.Map(mapContainer, {
            zoom: 4,
            center: [116.397428, 39.90923]
        });
    } catch (e) {
         console.error("Error initializing AMap:", e);
         return;
    }
    
    markers = [];
    allSites.forEach((site) => {
        try {
            const marker = new AMap.Marker({
                position: [116.397428 + Math.random() * 20 - 10, 39.90923 + Math.random() * 20 - 10],
                title: site.text,
                map: map,
                extData: { value: site.value, text: site.text, selected: selectedSiteValues.includes(site.value) }
            });
            setMarkerStyle(marker);
            marker.on('click', () => {
                const extData = marker.getExtData();
                extData.selected = !extData.selected;
                marker.setExtData(extData);
                setMarkerStyle(marker);
                updateSelectedSitesListInMap();
            });
            markers.push(marker);
        } catch (e) {
            console.error("Error creating marker for site:", site.text, e);
        }
    });
    updateSelectedSitesListInMap();
}

function setMarkerStyle(marker) {
    try {
        const extData = marker.getExtData();
        const iconUrl = extData.selected 
            ? '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
            : '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png';
        marker.setIcon(iconUrl);
        marker.setOffset(new AMap.Pixel(-13, -30));
    } catch(e){
        console.error("Error setting marker style:", e);
    }
}

function updateSelectedSitesListInMap() {
    const selectedList = document.getElementById('selected-sites-list');
    if (!selectedList) return;
    const currentSelectedSites = markers
        .filter(marker => marker.getExtData()?.selected)
        .map(marker => marker.getExtData());
    
    selectedList.innerHTML = currentSelectedSites.map(site => `
        <div class="selected-site">
            <i class="fas fa-map-marker-alt"></i>
            <span>${site.text}</span>
        </div>
    `).join('');
}

function applyMapSelection() {
    selectedSiteValues = markers
        .filter(marker => marker.getExtData()?.selected)
        .map(marker => marker.getExtData().value);
    updateSelectedSitesDisplay();
}

// --- 设备层级选择 ---
function initDeviceHierarchy() {
    const systemTypeSelect = document.getElementById('system-type-select');
    const systemInstanceLevel = document.getElementById('system-instance-level');
    const systemInstanceList = document.getElementById('system-instance-list');
    const componentTypeLevel = document.getElementById('component-type-level');
    const componentTypeList = document.getElementById('component-type-list');
    const componentInstanceLevel = document.getElementById('component-instance-level');
    const componentInstanceList = document.getElementById('component-instance-list');
    const pointList = document.getElementById('point-list');
    const pointPlaceholder = document.querySelector('.point-list-placeholder');

    if (!systemTypeSelect || !systemInstanceLevel || !systemInstanceList || !componentTypeLevel || !componentTypeList || !componentInstanceLevel || !componentInstanceList || !pointList || !pointPlaceholder) {
        console.error("One or more elements missing for Device Hierarchy");
        return;
    }

    systemTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        selectedHierarchy.systemType = selectedType;
        selectedHierarchy.systemInstances = [];
        selectedHierarchy.componentTypes = [];
        selectedHierarchy.componentInstances = [];
        selectedPoints = [];

        resetAndHideLevel(systemInstanceLevel, systemInstanceList);
        resetAndHideLevel(componentTypeLevel, componentTypeList);
        resetAndHideLevel(componentInstanceLevel, componentInstanceList);
        pointList.innerHTML = '';
        pointPlaceholder.style.display = 'block';

        if (selectedType && deviceHierarchyData[selectedType]) {
            const instances = deviceHierarchyData[selectedType].instances || [];
            populateCheckboxList(systemInstanceList, instances);
            systemInstanceLevel.style.display = instances.length > 0 ? 'flex' : 'none';
        } else {
            systemInstanceLevel.style.display = 'none';
        }
    });

    systemInstanceList.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            selectedHierarchy.systemInstances = getCheckedValues(systemInstanceList);
            selectedHierarchy.componentTypes = [];
            selectedHierarchy.componentInstances = [];
            selectedPoints = [];
            resetAndHideLevel(componentTypeLevel, componentTypeList);
            resetAndHideLevel(componentInstanceLevel, componentInstanceList);
            pointList.innerHTML = '';
            pointPlaceholder.style.display = 'block';

            if (selectedHierarchy.systemInstances.length > 0) {
                const allComponentTypes = new Set();
                selectedHierarchy.systemInstances.forEach(instance => {
                    const components = deviceHierarchyData[selectedHierarchy.systemType]?.components?.[instance] || {};
                    Object.keys(components).forEach(type => allComponentTypes.add(type));
                });
                populateCheckboxList(componentTypeList, Array.from(allComponentTypes));
                componentTypeLevel.style.display = allComponentTypes.size > 0 ? 'flex' : 'none';
            } else {
                componentTypeLevel.style.display = 'none';
            }
        }
    });

    componentTypeList.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            selectedHierarchy.componentTypes = getCheckedValues(componentTypeList);
            selectedHierarchy.componentInstances = [];
            selectedPoints = [];
            resetAndHideLevel(componentInstanceLevel, componentInstanceList);
            pointList.innerHTML = '';
            pointPlaceholder.style.display = 'block';

            if (selectedHierarchy.componentTypes.length > 0) {
                const allComponentInstances = new Set();
                selectedHierarchy.systemInstances.forEach(sysInstance => {
                    selectedHierarchy.componentTypes.forEach(compType => {
                        const instances = deviceHierarchyData[selectedHierarchy.systemType]?.components?.[sysInstance]?.[compType] || [];
                        instances.forEach(inst => allComponentInstances.add(inst));
                    });
                });
                populateCheckboxList(componentInstanceList, Array.from(allComponentInstances));
                componentInstanceLevel.style.display = allComponentInstances.size > 0 ? 'flex' : 'none';
            } else {
                componentInstanceLevel.style.display = 'none';
            }
        }
    });
    
    componentInstanceList.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            console.log("Component instance selection changed!");
            selectedHierarchy.componentInstances = getCheckedValues(componentInstanceList);
            selectedPoints = [];
            const pointList = document.getElementById('point-list');
            const pointPlaceholder = document.querySelector('.point-list-placeholder');
            if(pointList) pointList.innerHTML = '';
            
            if (selectedHierarchy.componentInstances.length > 0) {
                if(pointPlaceholder) pointPlaceholder.style.display = 'none';
                console.log("Calling loadPointsForSelectedInstances...");
                loadPointsForSelectedInstances();
            } else {
                 if(pointPlaceholder) pointPlaceholder.style.display = 'block';
                 console.log("No component instances selected, showing placeholder.");
            }
        }
    });
}

function loadPointsForSelectedInstances() {
    const pointListContainer = document.getElementById('point-list');
    if (!pointListContainer) return console.error("Point list container (#point-list) not found!");
    
    console.log("Loading points for instances:", selectedHierarchy.componentInstances);
    
    pointListContainer.innerHTML = '';
    const systemType = selectedHierarchy.systemType;

    if (!systemType || !deviceHierarchyData[systemType]) {
        console.warn("System type not selected or invalid for loading points.");
        pointListContainer.innerHTML = '<p class="point-list-placeholder">无效的系统类型，无法加载点位。</p>';
        return;
    }

    const pointData = deviceHierarchyData[systemType].points || {};
    console.log(`Points data for system type '${systemType}':`, pointData);
    
    let pointsLoaded = false;
    selectedHierarchy.componentInstances.forEach(instance => {
        const points = pointData[instance] || [];
        console.log(`Points found for instance '${instance}':`, points);
        if (points.length > 0) {
            pointsLoaded = true;
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'point-category';
            categoryDiv.innerHTML = `
                <div class="category-header">
                    <input type="checkbox" class="category-check" data-instance="${instance}"> 
                    ${instance} (全选/反选)
                </div>
                <div class="point-items">
                    ${points.map(point => `
                        <label>
                            <input type="checkbox" value="${instance}::${point}" name="point-checkbox-${instance}"> 
                            ${point}
                        </label>
                    `).join('')}
                </div>
            `;
            pointListContainer.appendChild(categoryDiv);
        }
    });
    
    if (!pointsLoaded) {
        pointListContainer.innerHTML = '<p class="point-list-placeholder">未找到所选部件实例的点位信息。</p>';
    }
    
    console.log("loadPointsForSelectedInstances finished.");
}

// --- 点位选择 ---
function initPointSelect() {
    const searchInput = document.getElementById('point-search');
    const pointListContainer = document.getElementById('point-list');
    if (!searchInput || !pointListContainer) return console.error("Point select elements missing");

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const labels = pointListContainer.querySelectorAll('.point-items label');
        labels.forEach(label => {
            const pointName = label.textContent.trim().toLowerCase();
            label.style.display = pointName.includes(searchTerm) ? 'flex' : 'none';
        });
    });
    
    pointListContainer.addEventListener('change', function(e) {
        const target = e.target;
        if (target.classList.contains('category-check')) {
            const instance = target.dataset.instance;
            const relatedCheckboxes = pointListContainer.querySelectorAll(`input[name="point-checkbox-${instance}"]`);
            relatedCheckboxes.forEach(cb => cb.checked = target.checked);
        }
        updateSelectedPoints();
    });
}

function updateSelectedPoints() {
    const container = document.getElementById('point-list');
    if (!container) return;
    selectedPoints = Array.from(container.querySelectorAll('.point-items input[type="checkbox"]:checked')).map(cb => cb.value);
    console.log("Selected points:", selectedPoints);
}

// --- 查询与重置 ---
function initQueryActions() {
    const resetBtn = document.getElementById('reset-filter');
    const queryBtn = document.getElementById('execute-query');
    if (!resetBtn || !queryBtn) return console.error("Query/Reset buttons not found");
    
    resetBtn.addEventListener('click', function() {
        selectedSiteValues = [];
        updateSelectedSitesDisplay();
        const systemTypeSelect = document.getElementById('system-type-select');
        if (systemTypeSelect) systemTypeSelect.value = '';
        selectedHierarchy = { systemType: null, systemInstances: [], componentTypes: [], componentInstances: [] };
        resetAndHideLevel(document.getElementById('system-instance-level'), document.getElementById('system-instance-list'));
        resetAndHideLevel(document.getElementById('component-type-level'), document.getElementById('component-type-list'));
        resetAndHideLevel(document.getElementById('component-instance-level'), document.getElementById('component-instance-list'));
        selectedPoints = [];
        const pointList = document.getElementById('point-list');
        if (pointList) pointList.innerHTML = '';
        const pointPlaceholder = document.querySelector('.point-list-placeholder');
        if(pointPlaceholder) pointPlaceholder.style.display = 'block';
        const pointSearch = document.getElementById('point-search');
        if(pointSearch) pointSearch.value = '';
        const timeGranularity = document.getElementById('time-granularity');
        if(timeGranularity) timeGranularity.value = 'hour';
        setDefaultTimeRange();
        document.querySelectorAll('.metrics-select input').forEach(checkbox => {
            checkbox.checked = checkbox.value === 'raw';
        });
        console.log('Filters reset, default metric set to raw');
    });
    
    queryBtn.addEventListener('click', function() {
        executeQuery();
    });
}

function executeQuery() {
    showLoading();
    const queryParams = {
        sites: selectedSiteValues,
        points: selectedPoints, 
        timeGranularity: document.getElementById('time-granularity')?.value || 'hour',
        timeStart: document.getElementById('time-start')?.value || '',
        timeEnd: document.getElementById('time-end')?.value || '',
        metrics: Array.from(document.querySelectorAll('.metrics-select input:checked')).map(cb => cb.value)
    };
    
    console.log('Executing query with params:', queryParams);
    if (queryParams.sites.length === 0) {
        alert('请至少选择一个站点！');
        hideLoading();
        return;
    }
    if (queryParams.points.length === 0) {
        alert('请至少选择一个点位！');
        hideLoading();
        return;
    }
    
    setTimeout(() => {
        const mockData = generateMockData(queryParams);
        updateDataView(mockData);
        hideLoading();
    }, 500); // Reduced timeout for faster feedback
}

function generateMockData(params) {
    const data = [];
    const startTime = new Date(params.timeStart || Date.now() - 86400000);
    const endTime = new Date(params.timeEnd || Date.now());
    const interval = getIntervalByGranularity(params.timeGranularity);
    const siteDetails = allSites.filter(s => params.sites.includes(s.value));
    const calculateDiff = params.metrics.includes('diff');

    if (startTime >= endTime) {
        console.warn("Start time is after end time. No data generated.");
        return [];
    }
    
    for (let time = startTime; time <= endTime; time = new Date(time.getTime() + interval)) {
        siteDetails.forEach(site => {
            params.points.forEach(pointValue => {
                const [deviceInstance, pointName] = pointValue.split('::');
                if (deviceInstance && pointName) {
                    let value = Math.random() * 100;
                    let metricType = params.metrics.length === 1 ? params.metrics[0] : 'mixed'; // 简化标记

                    // 简化模拟：如果选中了差值，我们返回一个特殊值或标记
                    // 注意：这里没有真正计算差值，只是模拟返回结果
                    if (calculateDiff) {
                       // 方案A: 返回一个固定范围的随机值表示差值
                       value = Math.random() * 20 - 10; // 模拟差值可能为负
                       metricType = 'diff'; 
                       // 方案B: 或者只在最后一个时间点为每个点位返回差值？ (更复杂)
                    }
                    
                    // 如果只选了采集值，则返回原始随机值
                    if (params.metrics.includes('raw') && !calculateDiff) {
                         metricType = 'raw';
                    } // 其他指标（max, min, avg）在此模拟中未区分处理
                    
                    data.push({
                        time: time.toISOString(),
                        site: site.text,
                        device: deviceInstance,
                        point: pointName,
                        value: value,
                        metric: metricType // 添加一个字段标记指标类型
                    });
                }
            });
        });
        if (interval <= 0) break;
        if (data.length > 5000) {
            console.warn("Generated data limit (5000) reached.");
            break; 
        }
    }
    console.log("Generated mock data:", data.length, "rows");
    return data;
}

// --- 折叠功能 ---
function initCollapse() {
    const collapseBtn = document.getElementById('collapse-filter');
    // 确保按钮存在
    if (!collapseBtn) {
        console.warn("Collapse button not found.");
        return;
    }
    const filterContent = document.querySelector('.filter-content');
    // 确保内容区域存在
    if (!filterContent) {
        console.warn("Filter content area not found.");
        return;
    }
    
    collapseBtn.addEventListener('click', function() {
        const isCollapsed = filterContent.style.display === 'none';
        filterContent.style.display = isCollapsed ? '' : 'none';
        // 确保按钮内有图标元素
        const icon = this.querySelector('i');
        if (icon) {
             icon.className = isCollapsed ? 
                'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    });
}

// --- 数据展示 (图表/表格) ---
function initDataView() {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer && typeof echarts !== 'undefined') {
        chart = echarts.init(chartContainer);
        initViewTabs();
        initChartTypeSwitch();
        initExport();
    } else if (typeof echarts === 'undefined') {
         console.error("ECharts library not loaded.");
    } else {
         console.error("Chart container not found.");
    }
}

function initViewTabs() {
    const tabs = document.querySelectorAll('.view-tab');
    const chartContainer = document.getElementById('chart-container');
    const tableContainer = document.getElementById('table-container');
    if (!chartContainer || !tableContainer) return console.error("Chart or Table container not found");

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const view = this.dataset.view;
            chartContainer.style.display = view === 'chart' ? '' : 'none';
            tableContainer.style.display = view === 'table' ? '' : 'none';
            if (view === 'chart' && chart) {
                try { chart.resize(); } catch(e) { console.error("Error resizing chart:", e); }
            }
        });
    });
    // Default to chart view
    if(tabs.length > 0 && !document.querySelector('.view-tab.active')) {
        tabs[0].click();
    }
}

function initChartTypeSwitch() {
    const chartTypeBtns = document.querySelectorAll('.btn-chart-type');
    chartTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            updateChartType(type);
        });
    });
}

function updateChartType(type) {
    if (!chart) return;
    try {
        const option = chart.getOption();
        if (option && option.series) {
             option.series.forEach(series => { series.type = type; });
             chart.setOption(option, true); // Use true to avoid merging issues
        } else {
             console.warn("Could not get chart option to update type.");
        }
    } catch(e) {
         console.error("Error updating chart type:", e);
    }
}

function initExport() {
    const exportBtn = document.querySelector('.btn-export');
    if (!exportBtn) return console.warn("Export button not found");
    exportBtn.addEventListener('click', function() {
        const activeViewTab = document.querySelector('.view-tab.active');
        if (!activeViewTab) return;
        const activeView = activeViewTab.dataset.view;
        if (activeView === 'chart') {
            if (chart) {
                try {
                    const url = chart.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' });
                    downloadFile(url, '数据图表.png');
                } catch(e) {
                    console.error("Error exporting chart:", e);
                    alert("导出图表失败。");
                }
            } else {
                 alert("图表实例未初始化。");
            }
        } else {
            exportTableToCSV();
        }
    });
}

function updateDataView(data) {
    if (!data) data = []; // Ensure data is an array
    updateChart(data);
    updateTable(data);
}

function updateChart(data) {
    if (!chart) return console.error("Chart not initialized");
    if (!data || data.length === 0) {
        try {
             chart.setOption({
                title: { text: '无符合条件的数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 16 } },
                xAxis: {}, // Clear axes
                yAxis: {},
                series: []
            }, true);
        } catch(e) { console.error("Error clearing chart:", e); }
        return;
    }
    
    try {
        const times = [...new Set(data.map(item => item.time))].sort((a, b) => new Date(a) - new Date(b));
        const series = [];
        const legend = [];
        const pointGroups = {};
        data.forEach(item => {
            // 加上指标类型区分，如果存在的话
            let key = `${item.site} - ${item.device} - ${item.point}`;
            if (item.metric && item.metric !== 'mixed' && item.metric !== 'raw') {
                key += ` (${item.metric})`; // 例如: Site A - PCS #1 - 有功功率 (avg)
            }
            if (!pointGroups[key]) {
                pointGroups[key] = {
                    name: key, type: 'line', data: new Array(times.length).fill(null),
                    site: item.site, device: item.device, point: item.point, metric: item.metric
                };
                legend.push(key);
            }
            const timeIndex = times.indexOf(item.time);
            if(timeIndex !== -1) {
                pointGroups[key].data[timeIndex] = item.value != null ? Number(item.value.toFixed(2)) : null;
            }
        });
        series.push(...Object.values(pointGroups));
        
        const currentOption = chart.getOption();
        const currentChartType = currentOption?.series?.[0]?.type || 'line';
        series.forEach(s => { s.type = currentChartType; s.showSymbol = false; s.smooth = true; }); // Style series

        const option = {
            title: { text: '数据趋势图', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: legend, type: 'scroll', bottom: 10, padding: [20, 10, 5, 10] },
            grid: { left: '5%', right: '5%', bottom: '20%', containLabel: true },
            xAxis: { type: 'category', data: times.map(t => formatDateTimeForAxis(new Date(t))), axisLabel: { rotate: 0, interval: 'auto' } },
            yAxis: { type: 'value', scale: true }, // Added scale: true
            dataZoom: [{ type: 'slider', start: 0, end: 100 }, { type: 'inside', start: 0, end: 100 }],
            series: series
        };
        chart.setOption(option, true);
        chart.resize();
    } catch (e) {
        console.error("Error updating chart:", e);
        // Optionally show error message to user
         try { chart.setOption({ title: { text: '加载图表出错', left: 'center', top: 'center' }, series: [] }, true); } catch {} 
    }
}

function updateTable(data) {
    const tbody = document.getElementById('data-table-body');
    const theadRow = document.querySelector('#table-container thead tr');
    if (!tbody || !theadRow) return console.error("Table body or head row not found");

    // 动态添加/移除表头
    let metricHeader = theadRow.querySelector('th.metric-col');
    const showMetricCol = data.some(item => item.metric && item.metric !== 'raw'); // 是否需要显示指标列
    if (showMetricCol && !metricHeader) {
        metricHeader = document.createElement('th');
        metricHeader.className = 'metric-col';
        metricHeader.textContent = '指标';
        theadRow.appendChild(metricHeader);
    } else if (!showMetricCol && metricHeader) {
        theadRow.removeChild(metricHeader);
    }

    tbody.innerHTML = data.map(item => {
        const metricCell = showMetricCol 
            ? `<td class="metric-col">${item.metric || 'raw'}</td>` 
            : '';
        return `
        <tr>
            <td>${item.time ? new Date(item.time).toLocaleString() : '-'}</td>
            <td>${item.site || '-'}</td>
            <td>${item.device || '-'}</td> 
            <td>${item.point || '-'}</td> 
            <td>${item.value != null ? item.value.toFixed(2) : '-'}</td> 
            ${metricCell} 
        </tr>
    `}).join('');
    
    const itemsPerPage = 20;
    const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 1;
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    if (currentPageEl) currentPageEl.textContent = '1';
    if (totalPagesEl) totalPagesEl.textContent = totalPages > 0 ? totalPages : 1;
}

// --- 方案保存 (Modal) ---
function initSaveSchemeModal() {
    const saveBtn = document.getElementById('save-filter');
    const modal = document.getElementById('save-scheme-modal');
    if (!saveBtn || !modal) return console.warn("Save scheme button or modal not found");
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    if (!closeBtn || !cancelBtn || !confirmBtn) return console.error("Buttons missing in Save Scheme Modal");
    
    saveBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('scheme-name');
        const descInput = document.getElementById('scheme-description');
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        modal.classList.add('active');
    });
    
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    
    confirmBtn.addEventListener('click', () => {
        if (saveQueryScheme()) {
            modal.classList.remove('active');
        }
    });
}

function saveQueryScheme() {
    const nameInput = document.getElementById('scheme-name');
    const descriptionInput = document.getElementById('scheme-description');
    if (!nameInput) return false; // Should not happen if modal is correct
    const name = nameInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    
    if (!name) {
        alert('请输入方案名称！');
        nameInput.focus();
        return false;
    }
    
    const scheme = {
        name, description,
        conditions: {
            sites: selectedSiteValues,
            hierarchy: JSON.parse(JSON.stringify(selectedHierarchy)), // Deep copy hierarchy
            points: selectedPoints,
            timeGranularity: document.getElementById('time-granularity')?.value || 'hour',
            timeStart: document.getElementById('time-start')?.value || '',
            timeEnd: document.getElementById('time-end')?.value || '',
            metrics: Array.from(document.querySelectorAll('.metrics-select input:checked')).map(cb => cb.value)
        }
    };
    
    const schemes = JSON.parse(localStorage.getItem('querySchemes') || '[]');
    if (schemes.some(s => s.name === name)) {
        alert('方案名称已存在，请使用其他名称！');
        nameInput.focus();
        return false;
    }
    
    schemes.push(scheme);
    localStorage.setItem('querySchemes', JSON.stringify(schemes));
    
    const schemeModal = document.getElementById('scheme-select-modal');
    if (schemeModal && schemeModal.classList.contains('active')) {
        renderSchemeList();
    }
    
    console.log('方案已保存:', scheme);
    alert('方案保存成功！');
    return true;
}

// --- 方案选择 (Modal) ---
function initSchemeSelectModal() {
    const modal = document.getElementById('scheme-select-modal');
    const selectBtn = document.getElementById('select-scheme-btn');
    if (!modal || !selectBtn) return console.warn("Select scheme button or modal not found");
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const searchInput = document.getElementById('scheme-search-input');
    const listContainer = document.getElementById('scheme-list-container');
    if (!closeBtn || !cancelBtn || !searchInput || !listContainer) return console.error("Elements missing in Select Scheme Modal");

    selectBtn.addEventListener('click', () => showSchemeSelectModal());
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => hideSchemeSelectModal());
    });
    searchInput.addEventListener('input', () => {
        renderSchemeList(searchInput.value);
    });
    listContainer.addEventListener('click', (e) => {
        if (e.target.matches('.action-button[data-scheme-name]')) {
            const schemeName = e.target.dataset.schemeName;
            applyScheme(schemeName);
            hideSchemeSelectModal();
        }
    });
}

function showSchemeSelectModal() {
    const modal = document.getElementById('scheme-select-modal');
    if (!modal) return;
    const searchInput = document.getElementById('scheme-search-input');
    if (searchInput) searchInput.value = '';
    renderSchemeList();
    modal.classList.add('active');
}

function hideSchemeSelectModal() {
    const modal = document.getElementById('scheme-select-modal');
    if (modal) modal.classList.remove('active');
}

function renderSchemeList(searchTerm = '') {
    const container = document.getElementById('scheme-list-container');
    if (!container) return;
    const schemes = JSON.parse(localStorage.getItem('querySchemes') || '[]');
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredSchemes = schemes.filter(scheme => 
        scheme.name.toLowerCase().includes(lowerSearchTerm)
    );
    
    if (filteredSchemes.length === 0) {
        // 区分是否有搜索词，显示不同的提示信息
        if (searchTerm) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">没有找到匹配的方案</p>';
        } else if (schemes.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">您还没有保存任何查询方案</p>';
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">没有找到匹配的方案</p>';
        }
    } else {
        container.innerHTML = filteredSchemes.map(scheme => `
            <div class="modal-list-item">
                <label title="${scheme.description || ''}">${scheme.name}</label>
                <button class="action-button" data-scheme-name="${scheme.name}">应用</button>
            </div>
        `).join('');
    }
}

function applyScheme(schemeName) {
    const schemes = JSON.parse(localStorage.getItem('querySchemes') || '[]');
    const scheme = schemes.find(s => s.name === schemeName);
    if (!scheme || !scheme.conditions) return console.error("Scheme not found or invalid:", schemeName);
    
    const { conditions } = scheme;
    console.log("Applying scheme:", schemeName, conditions);

    // --- Restore Non-Hierarchical Fields First ---
    selectedSiteValues = conditions.sites || [];
    updateSelectedSitesDisplay();
    const timeGranularity = document.getElementById('time-granularity');
    if(timeGranularity) timeGranularity.value = conditions.timeGranularity || 'hour';
    const timeStart = document.getElementById('time-start');
    if(timeStart) timeStart.value = conditions.timeStart || '';
    const timeEnd = document.getElementById('time-end');
    if(timeEnd) timeEnd.value = conditions.timeEnd || '';
    if (!conditions.timeStart || !conditions.timeEnd) {
        setDefaultTimeRange();
    }
    document.querySelectorAll('.metrics-select input').forEach(checkbox => {
        checkbox.checked = (conditions.metrics || ['avg']).includes(checkbox.value);
    });

    // --- Restore Hierarchy --- 
    selectedHierarchy = conditions.hierarchy ? JSON.parse(JSON.stringify(conditions.hierarchy)) : { systemType: null, systemInstances: [], componentTypes: [], componentInstances: [] }; // Deep copy or default
    selectedPoints = conditions.points || [];

    const systemTypeSelect = document.getElementById('system-type-select');
    if (!systemTypeSelect) return console.error("System type select not found during scheme apply");
    systemTypeSelect.value = selectedHierarchy.systemType || '';
    
    // --- Trigger changes with delays to allow DOM updates --- 
    // Wrap in a function to manage the cascading timeouts
    const restoreHierarchyLevels = (level = 1) => {
        switch (level) {
            case 1: // System Instances
                systemTypeSelect.dispatchEvent(new Event('change'));
                setTimeout(() => {
                    if (selectedHierarchy.systemInstances?.length > 0) {
                        const list = document.getElementById('system-instance-list');
                        if (list) {
                            setCheckedValues(list, selectedHierarchy.systemInstances);
                            list.dispatchEvent(new Event('change', { bubbles: true })); // Trigger next level
                        }
                    }
                    restoreHierarchyLevels(2);
                }, 50); // Delay for DOM update
                break;
            case 2: // Component Types
                 setTimeout(() => {
                    if (selectedHierarchy.componentTypes?.length > 0) {
                        const list = document.getElementById('component-type-list');
                        if (list) {
                             setCheckedValues(list, selectedHierarchy.componentTypes);
                             list.dispatchEvent(new Event('change', { bubbles: true })); // Trigger next level
                        }
                    }
                     restoreHierarchyLevels(3);
                 }, 100);
                 break;
            case 3: // Component Instances
                 setTimeout(() => {
                    if (selectedHierarchy.componentInstances?.length > 0) {
                        const list = document.getElementById('component-instance-list');
                        if (list) {
                            setCheckedValues(list, selectedHierarchy.componentInstances);
                            list.dispatchEvent(new Event('change', { bubbles: true })); // Trigger point loading
                        }
                    }
                     restoreHierarchyLevels(4);
                 }, 150);
                 break;
            case 4: // Points
                setTimeout(() => {
                    const pointListContainer = document.getElementById('point-list');
                    if (pointListContainer) {
                        // Check if points are loaded before setting values
                        if (pointListContainer.querySelector('.point-items input')) {
                             setCheckedValues(pointListContainer, selectedPoints);
                             // Update category headers
                             pointListContainer.querySelectorAll('.category-check').forEach(headerCheckbox => {
                                 const instance = headerCheckbox.dataset.instance;
                                 const relatedCheckboxes = pointListContainer.querySelectorAll(`input[name="point-checkbox-${instance}"]`);
                                 if(relatedCheckboxes.length > 0) { // Only if checkboxes exist
                                     headerCheckbox.checked = Array.from(relatedCheckboxes).every(cb => cb.checked);
                                 }
                             });
                             updateSelectedPoints();
                             console.log('Scheme applied successfully.');
                        } else {
                            // Points haven't loaded yet, maybe retry or log warning
                            console.warn("Points not loaded when trying to apply scheme selection.");
                            // Attempt to set points anyway, might work if load is slightly delayed
                             setCheckedValues(pointListContainer, selectedPoints);
                              updateSelectedPoints();
                        }
                    } else {
                         console.error("Point list container not found during scheme apply");
                    }
                }, 250); // Increased delay for points
                 break;
        }
    };

    restoreHierarchyLevels(); // Start the cascade
}

// --- 其他 ---
function setDefaultTimeRange() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startEl = document.getElementById('time-start');
    const endEl = document.getElementById('time-end');
    if(startEl) startEl.value = formatDateTime(yesterday);
    if(endEl) endEl.value = formatDateTime(now);
}

// --- 数据对比 (Modal) ---
function initDataCompareModal() {
    console.log("Initializing data compare modal...");
    const modal = document.getElementById('data-compare-modal');
    const compareBtn = document.querySelector('.btn-compare');
    if (!modal || !compareBtn) {
        console.error("Data compare modal or button not found");
        return;
    }

    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    
    if (!closeBtn || !cancelBtn || !confirmBtn) {
        console.error("Buttons missing in Data Compare Modal");
        return;
    }

    // 点击对比按钮打开模态框
    compareBtn.addEventListener('click', function() {
        // 检查是否有数据可以对比
        if (!chart || !chart.getOption().series || chart.getOption().series.length === 0) {
            alert('请先查询数据，再进行对比操作！');
            return;
        }
        showDataCompareModal();
    });
    
    // 关闭模态框
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => hideDataCompareModal());
    });
    
    // 应用对比设置
    confirmBtn.addEventListener('click', () => {
        applyDataCompare();
        hideDataCompareModal();
    });
    
    // 初始化时间范围
    setDefaultCompareTimeRange();
}

function showDataCompareModal() {
    const modal = document.getElementById('data-compare-modal');
    if (!modal) return;
    
    // 获取当前图表中的数据系列
    try {
        const option = chart.getOption();
        if (option && option.series) {
            currentChartSeries = option.series;
            renderSeriesList();
        }
    } catch(e) {
        console.error("Error getting chart series:", e);
    }
    
    modal.classList.add('active');
}

function hideDataCompareModal() {
    const modal = document.getElementById('data-compare-modal');
    if (modal) modal.classList.remove('active');
}

function renderSeriesList() {
    const container = document.getElementById('compare-series-list');
    if (!container) return;
    
    if (!currentChartSeries || currentChartSeries.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 10px; color: #999;">暂无可对比的数据系列</p>';
        return;
    }
    
    container.innerHTML = currentChartSeries.map((series, index) => {
        const color = series.itemStyle?.color || chart.getVisual({seriesIndex: index}).color || '#ccc';
        return `
            <div class="series-item">
                <div class="series-color" style="background-color: ${color};"></div>
                <div class="series-name">${series.name || `系列 ${index+1}`}</div>
                <label style="margin-left: auto;">
                    <input type="checkbox" value="${index}" class="series-checkbox" ${isCompareMode ? (compareData?.includes(index) ? 'checked' : '') : 'checked'}>
                </label>
            </div>
        `;
    }).join('');
}

function setDefaultCompareTimeRange() {
    const now = new Date();
    const aWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startEl = document.getElementById('compare-time-start');
    const endEl = document.getElementById('compare-time-end');
    if(startEl) startEl.value = formatDateTime(aWeekAgo);
    if(endEl) endEl.value = formatDateTime(now);
}

function applyDataCompare() {
    const selectedSeries = [];
    const checkboxes = document.querySelectorAll('#compare-series-list .series-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请至少选择一个数据系列进行对比！');
        return;
    }
    
    Array.from(checkboxes).forEach(checkbox => {
        selectedSeries.push(parseInt(checkbox.value));
    });
    
    const compareType = document.getElementById('compare-type').value;
    const compareTimeStart = document.getElementById('compare-time-start').value;
    const compareTimeEnd = document.getElementById('compare-time-end').value;
    
    // 标记对比模式
    isCompareMode = true;
    compareData = selectedSeries;
    
    // 根据对比类型进行不同的处理
    switch(compareType) {
        case 'overlay':
            applyOverlayCompare(selectedSeries);
            break;
        case 'side-by-side':
            applySideBySideCompare(selectedSeries);
            break;
        case 'percentage':
            applyPercentageCompare(selectedSeries);
            break;
        case 'difference':
            applyDifferenceCompare(selectedSeries);
            break;
        default:
            applyOverlayCompare(selectedSeries);
    }
    
    // 将对比按钮设置为激活状态
    const compareBtn = document.querySelector('.btn-compare');
    if (compareBtn) compareBtn.classList.add('active');
}

function applyOverlayCompare(selectedSeries) {
    if (!chart) return;
    try {
        const option = chart.getOption();
        if (!option || !option.series) return;
        
        // 过滤只保留选中的系列
        const filteredSeries = [];
        selectedSeries.forEach(index => {
            if (option.series[index]) {
                filteredSeries.push(option.series[index]);
            }
        });
        
        option.series = filteredSeries;
        chart.setOption(option, true);
    } catch(e) {
        console.error("Error applying overlay compare:", e);
    }
}

function applySideBySideCompare(selectedSeries) {
    if (!chart) return;
    try {
        const option = chart.getOption();
        if (!option || !option.series) return;
        
        // 将所有选中的系列变为柱状图并设置为并排显示
        const filteredSeries = [];
        selectedSeries.forEach(index => {
            if (option.series[index]) {
                const series = {...option.series[index]};
                series.type = 'bar';
                filteredSeries.push(series);
            }
        });
        
        option.series = filteredSeries;
        chart.setOption(option, true);
    } catch(e) {
        console.error("Error applying side by side compare:", e);
    }
}

function applyPercentageCompare(selectedSeries) {
    if (!chart) return;
    try {
        const option = chart.getOption();
        if (!option || !option.series) return;
        
        // 计算百分比
        const filteredSeries = [];
        let totalSeries = null;
        
        // 先找出第一个选中的系列作为基准
        if (selectedSeries.length > 0 && option.series[selectedSeries[0]]) {
            totalSeries = option.series[selectedSeries[0]];
            
            // 添加基准系列
            filteredSeries.push({
                ...totalSeries,
                name: `${totalSeries.name || '系列1'} (基准)`
            });
            
            // 计算其他系列相对于基准系列的百分比
            for (let i = 1; i < selectedSeries.length; i++) {
                const index = selectedSeries[i];
                if (option.series[index]) {
                    const series = {...option.series[index]};
                    const percentData = series.data.map((value, idx) => {
                        const baseValue = totalSeries.data[idx];
                        if (baseValue !== 0 && baseValue != null) {
                            return (value / baseValue) * 100;
                        }
                        return 0;
                    });
                    
                    series.data = percentData;
                    series.name = `${series.name || `系列${i+1}`} (占比%)`;
                    filteredSeries.push(series);
                }
            }
            
            option.series = filteredSeries;
            
            // 添加百分比的Y轴
            if (!option.yAxis) {
                option.yAxis = { type: 'value' };
            }
            if (Array.isArray(option.yAxis)) {
                option.yAxis[0].name = '百分比 (%)';
            } else {
                option.yAxis.name = '百分比 (%)';
            }
            
            chart.setOption(option, true);
        }
    } catch(e) {
        console.error("Error applying percentage compare:", e);
    }
}

function applyDifferenceCompare(selectedSeries) {
    if (!chart) return;
    try {
        const option = chart.getOption();
        if (!option || !option.series || selectedSeries.length < 2) return;
        
        // 使用第一个选中的系列作为基准
        const baseSeries = option.series[selectedSeries[0]];
        const filteredSeries = [{
            ...baseSeries,
            name: `${baseSeries.name || '系列1'} (基准)`
        }];
        
        // 计算其他系列与基准系列的差值
        for (let i = 1; i < selectedSeries.length; i++) {
            const index = selectedSeries[i];
            if (option.series[index]) {
                const series = {...option.series[index]};
                const diffData = series.data.map((value, idx) => {
                    const baseValue = baseSeries.data[idx];
                    return value - baseValue;
                });
                
                series.data = diffData;
                series.name = `${series.name || `系列${i+1}`} (差值)`;
                filteredSeries.push(series);
            }
        }
        
        option.series = filteredSeries;
        chart.setOption(option, true);
    } catch(e) {
        console.error("Error applying difference compare:", e);
    }
}

// 扩展initDataView函数，增加对比模式的取消
function initChartControls() {
    const compareBtn = document.querySelector('.btn-compare');
    if (!compareBtn) return;
    
    compareBtn.addEventListener('dblclick', function() {
        // 双击取消对比模式
        if (isCompareMode) {
            isCompareMode = false;
            compareData = null;
            this.classList.remove('active');
            
            // 重新执行上一次查询
            executeQuery();
        }
    });
}

// --- 帮助模态框 ---
function initHelpModal() {
    const helpBtn = document.querySelector('.btn-help');
    const modal = document.getElementById('help-modal');
    if (!helpBtn || !modal) return console.error("Help button or modal not found");
    
    const closeBtn = modal.querySelector('.close-modal');
    const closeModalBtn = modal.querySelector('.btn-close');
    if (!closeBtn || !closeModalBtn) return console.error("Close buttons missing in Help Modal");
    
    helpBtn.addEventListener('click', () => showHelpModal());
    [closeBtn, closeModalBtn].forEach(btn => {
        btn.addEventListener('click', () => hideHelpModal());
    });
}

function showHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.classList.add('active');
}

function hideHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.classList.remove('active');
}

// ==================================================
// DOMContentLoaded - 初始化执行
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed. Initializing...");
    try {
        // 确保所有初始化函数都已定义
        initFilterSection();
        initMapModal();
        initDataView();
        initSaveSchemeModal();
        initSiteSelectModal();
        initSchemeSelectModal();
        initDataCompareModal(); // 添加数据对比初始化
        initChartControls(); // 添加图表控制初始化
        initHelpModal(); // 添加帮助模态框初始化
        
        setDefaultTimeRange();
        console.log("Initialization complete.");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});
