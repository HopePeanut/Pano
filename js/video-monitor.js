/**
 * 视频监控页面的JavaScript逻辑
 * 负责动态生成视频卡片、处理筛选功能、实现视频播放等交互
 */

// 系统总站点数
const TOTAL_SITES = 128;

// 模拟视频监控数据
const videoMonitorData = [
    {
        id: 1,
        title: "清安储能站1号摄像头",
        location: "清安储能站 - 主控室",
        type: "energy-storage",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:30:22",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 2,
        title: "清安储能站2号摄像头",
        location: "清安储能站 - 设备区",
        type: "energy-storage",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:28:45",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 3,
        title: "南海充电站1号摄像头",
        location: "南海充电站 - 围墙外",
        type: "charging",
        region: "south",
        status: "offline",
        updateTime: "2023-08-15 10:15:33",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 4,
        title: "南海充电站2号摄像头",
        location: "南海充电站 - 充电区",
        type: "charging",
        region: "south",
        status: "online",
        updateTime: "2023-08-15 14:31:05",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    },
    {
        id: 5,
        title: "东湖储能站1号摄像头",
        location: "东湖储能站 - 电池仓",
        type: "energy-storage",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:29:17",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 6,
        title: "东湖储能站2号摄像头",
        location: "东湖储能站 - 控制室",
        type: "energy-storage",
        region: "east",
        status: "offline",
        updateTime: "2023-08-15 09:45:12",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 7,
        title: "西区光储充站1号摄像头",
        location: "西区光储充站 - 主入口",
        type: "integrated",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 14:27:39",
        thumbnail: "temp_imgs/storage4.jpg",
        videoSrc: null
    },
    {
        id: 8,
        title: "西区光储充站2号摄像头",
        location: "西区光储充站 - 光伏区",
        type: "integrated",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 14:26:52",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 9,
        title: "北山充电桩配储1号摄像头",
        location: "北山充电桩配储 - 充电区",
        type: "charging-storage",
        region: "north",
        status: "offline",
        updateTime: "2023-08-15 11:20:47",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 10,
        title: "北山充电桩配储2号摄像头",
        location: "北山充电桩配储 - 储能区",
        type: "charging-storage",
        region: "north",
        status: "online",
        updateTime: "2023-08-15 14:30:59",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    },
    {
        id: 11,
        title: "清远储能站1号摄像头",
        location: "清远储能站 - 外围",
        type: "energy-storage",
        region: "north",
        status: "online",
        updateTime: "2023-08-15 14:28:33",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 12,
        title: "清远储能站2号摄像头",
        location: "清远储能站 - 电池区",
        type: "energy-storage",
        region: "north",
        status: "offline",
        updateTime: "2023-08-15 08:15:26",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 13,
        title: "江北储能站1号摄像头",
        location: "江北储能站 - 主控室",
        type: "energy-storage",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:22:10",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 14,
        title: "江北储能站2号摄像头",
        location: "江北储能站 - 电池仓",
        type: "energy-storage",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:20:30",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 15,
        title: "东区充电站1号摄像头",
        location: "东区充电站 - 充电区",
        type: "charging",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 14:25:15",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    },
    {
        id: 16,
        title: "南湖光储充站1号摄像头",
        location: "南湖光储充站 - 光伏区",
        type: "integrated",
        region: "south",
        status: "offline",
        updateTime: "2023-08-15 09:30:42",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 17,
        title: "南湖光储充站2号摄像头",
        location: "南湖光储充站 - 充电区",
        type: "integrated",
        region: "south",
        status: "online",
        updateTime: "2023-08-15 14:18:22",
        thumbnail: "temp_imgs/storage4.jpg",
        videoSrc: null
    },
    {
        id: 18,
        title: "西城充电桩配储1号摄像头",
        location: "西城充电桩配储 - 充电区",
        type: "charging-storage",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 14:12:50",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 19,
        title: "西城充电桩配储2号摄像头",
        location: "西城充电桩配储 - 储能区",
        type: "charging-storage",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 14:10:33",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    },
    {
        id: 20,
        title: "重庆储能站1号摄像头",
        location: "重庆储能站 - 主控室",
        type: "energy-storage",
        region: "west",
        status: "offline",
        updateTime: "2023-08-15 07:45:11",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 21,
        title: "重庆储能站2号摄像头",
        location: "重庆储能站 - 电池仓",
        type: "energy-storage",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 14:05:27",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 22,
        title: "北区充电站1号摄像头",
        location: "北区充电站 - 充电区",
        type: "charging",
        region: "north",
        status: "online",
        updateTime: "2023-08-15 14:01:12",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 23,
        title: "北区充电站2号摄像头",
        location: "北区充电站 - 控制室",
        type: "charging",
        region: "north",
        status: "offline",
        updateTime: "2023-08-15 08:55:33",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 24,
        title: "东湖光储充站1号摄像头",
        location: "东湖光储充站 - 主入口",
        type: "integrated",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 13:58:21",
        thumbnail: "temp_imgs/storage4.jpg",
        videoSrc: null
    },
    {
        id: 25,
        title: "东湖光储充站2号摄像头",
        location: "东湖光储充站 - 光伏区",
        type: "integrated",
        region: "east",
        status: "online",
        updateTime: "2023-08-15 13:55:10",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    },
    {
        id: 26,
        title: "南山充电桩配储1号摄像头",
        location: "南山充电桩配储 - 充电区",
        type: "charging-storage",
        region: "south",
        status: "online",
        updateTime: "2023-08-15 13:50:42",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 27,
        title: "南山充电桩配储2号摄像头",
        location: "南山充电桩配储 - 储能区",
        type: "charging-storage",
        region: "south",
        status: "offline",
        updateTime: "2023-08-15 09:15:23",
        thumbnail: null,
        videoSrc: null
    },
    {
        id: 28,
        title: "中心储能站1号摄像头",
        location: "中心储能站 - 主控室",
        type: "energy-storage",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 13:45:33",
        thumbnail: "temp_imgs/storage1.jpg",
        videoSrc: null
    },
    {
        id: 29,
        title: "中心储能站2号摄像头",
        location: "中心储能站 - 电池仓",
        type: "energy-storage",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 13:42:15",
        thumbnail: "temp_imgs/storage2.jpg",
        videoSrc: null
    },
    {
        id: 30,
        title: "西南充电站1号摄像头",
        location: "西南充电站 - 充电区",
        type: "charging",
        region: "west",
        status: "online",
        updateTime: "2023-08-15 13:40:05",
        thumbnail: "temp_imgs/storage3.jpg",
        videoSrc: null
    }
];

// 当前筛选条件
let currentFilters = {
    siteType: 'all',
    cameraStatus: 'all',
    region: 'all',
    search: ''
};

// 分页配置
let pagination = {
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 1
};

// 防抖函数，避免频繁操作导致的性能问题
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// 记录是否已初始化
let isInitialized = false;

/**
 * 初始化页面
 */
document.addEventListener('DOMContentLoaded', function() {
    // 避免重复初始化
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('初始化视频监控页面');
    
    // 预加载图片，提高响应速度
    preloadImages();
    
    // 生成视频卡片
    renderVideoCards();
    
    // 绑定筛选事件
    bindFilterEvents();
    
    // 绑定分页事件
    bindPaginationEvents();
    
    // 绑定搜索事件
    bindSearchEvent();
    
    // 绑定模态框事件
    bindModalEvents();
    
    // 更新统计信息
    updateStatistics();
    
    // 显示初始加载完成的提示
    showTooltip("初始化完成", "视频监控页面加载完成");
});

/**
 * 预加载图片
 */
function preloadImages() {
    videoMonitorData.forEach(item => {
        if (item.thumbnail) {
            const img = new Image();
            img.src = item.thumbnail;
        }
    });
}

/**
 * 显示提示信息
 */
function showTooltip(title, message) {
    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = tooltip.querySelector('.tooltip-title');
    const tooltipMessage = tooltip.querySelector('.tooltip-message');
    
    tooltipTitle.textContent = title;
    tooltipMessage.textContent = message;
    
    tooltip.classList.add('show');
    
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
}

/**
 * 根据筛选条件渲染视频卡片
 */
function renderVideoCards() {
    console.log('渲染视频卡片，当前筛选条件:', currentFilters);
    
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';
    
    // 应用筛选条件
    const filteredData = videoMonitorData.filter(item => {
        // 站点类型筛选
        if (currentFilters.siteType !== 'all' && item.type !== currentFilters.siteType) {
            return false;
        }
        
        // 摄像头状态筛选
        if (currentFilters.cameraStatus !== 'all' && item.status !== currentFilters.cameraStatus) {
            return false;
        }
        
        // 区域筛选
        if (currentFilters.region !== 'all' && item.region !== currentFilters.region) {
            return false;
        }
        
        // 搜索筛选
        if (currentFilters.search && !item.title.toLowerCase().includes(currentFilters.search.toLowerCase()) && 
            !item.location.toLowerCase().includes(currentFilters.search.toLowerCase())) {
            return false;
        }
        
        return true;
    });
    
    console.log('筛选后数据条数:', filteredData.length);
    
    // 计算分页
    pagination.totalPages = Math.ceil(filteredData.length / pagination.itemsPerPage);
    
    // 如果当前页超出总页数，重置为第一页
    if (pagination.currentPage > pagination.totalPages) {
        pagination.currentPage = 1;
    }
    
    // 计算当前页显示的数据
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = Math.min(startIndex + pagination.itemsPerPage, filteredData.length);
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // 使用DocumentFragment提高性能
    const fragment = document.createDocumentFragment();
    
    // 渲染卡片
    currentPageData.forEach(item => {
        const card = createVideoCard(item);
        fragment.appendChild(card);
    });
    
    // 一次性添加所有DOM元素
    videoContainer.appendChild(fragment);
    
    // 更新分页控件
    updatePagination();
}

/**
 * 创建单个视频卡片
 * @param {Object} item - 视频数据项
 * @returns {HTMLElement} - 视频卡片DOM元素
 */
function createVideoCard(item) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.id = item.id;
    
    // 视频流区域
    const videoFeed = document.createElement('div');
    videoFeed.className = 'video-feed';
    
    // 根据摄像头状态显示不同内容
    if (item.status === 'online') {
        // 创建固定的在线摄像头缩略图
        const img = document.createElement('img');
        
        // 使用上传的真实储能站图片
        if (item.type === 'energy-storage') {
            img.src = 'temp_imgs/storage1.jpg'; // 储能电站图片1
        } else if (item.type === 'charging-storage') {
            img.src = 'temp_imgs/storage3.jpg'; // 充电桩配储图片
        } else if (item.type === 'integrated') {
            img.src = 'temp_imgs/storage4.jpg'; // 光储充一体图片
        } else {
            img.src = 'temp_imgs/storage2.jpg'; // 充电桩图片
        }
        
        img.alt = item.title;
        img.onerror = function() {
            // 图片加载失败时显示占位符
            this.parentNode.innerHTML = `
                <div class="video-placeholder">
                    <i class="fa fa-video"></i>
                    <p>图片加载失败</p>
                </div>
            `;
        };
        
        videoFeed.appendChild(img);
        
        // 添加在线状态标签
        const statusBadge = document.createElement('div');
        statusBadge.className = 'video-status online';
        statusBadge.innerHTML = '<i class="fa fa-circle"></i> 在线';
        videoFeed.appendChild(statusBadge);
    } else {
        // 离线状态显示占位符
        const placeholder = document.createElement('div');
        placeholder.className = 'video-placeholder';
        placeholder.innerHTML = `
            <i class="fa fa-video-slash"></i>
            <p>摄像头离线</p>
        `;
        videoFeed.appendChild(placeholder);
        
        // 添加离线状态标签
        const statusBadge = document.createElement('div');
        statusBadge.className = 'video-status offline';
        statusBadge.innerHTML = '<i class="fa fa-circle"></i> 离线';
        videoFeed.appendChild(statusBadge);
    }
    
    // 视频信息区域
    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';
    
    // 视频标题
    const videoTitle = document.createElement('div');
    videoTitle.className = 'video-title';
    videoTitle.textContent = item.title;
    
    // 视频位置
    const videoLocation = document.createElement('div');
    videoLocation.className = 'video-location';
    videoLocation.textContent = item.location;
    
    // 视频元数据
    const videoMeta = document.createElement('div');
    videoMeta.className = 'video-meta';
    
    const videoTime = document.createElement('div');
    videoTime.className = 'video-time';
    videoTime.innerHTML = `<i class="fa fa-clock"></i> ${item.updateTime}`;
    
    const videoType = document.createElement('div');
    videoType.className = 'video-type';
    
    // 根据站点类型显示不同图标和文本
    let typeIcon, typeText;
    switch (item.type) {
        case 'energy-storage':
            typeIcon = 'fa-battery-three-quarters';
            typeText = '储能电站';
            break;
        case 'charging':
            typeIcon = 'fa-charging-station';
            typeText = '充电桩';
            break;
        case 'charging-storage':
            typeIcon = 'fa-bolt';
            typeText = '充电桩配储';
            break;
        case 'integrated':
            typeIcon = 'fa-solar-panel';
            typeText = '光储充一体';
            break;
        default:
            typeIcon = 'fa-building';
            typeText = '未知';
    }
    
    videoType.innerHTML = `<i class="fa ${typeIcon}"></i> ${typeText}`;
    
    videoMeta.appendChild(videoTime);
    videoMeta.appendChild(videoType);
    
    videoInfo.appendChild(videoTitle);
    videoInfo.appendChild(videoLocation);
    videoInfo.appendChild(videoMeta);
    
    card.appendChild(videoFeed);
    card.appendChild(videoInfo);
    
    // 只有在线的摄像头才能点击查看视频
    if (item.status === 'online') {
        card.addEventListener('click', function() {
            openVideoModal(item);
        });
    }
    
    return card;
}

/**
 * 打开视频模态框
 * @param {Object} item - 视频数据项
 */
function openVideoModal(item) {
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const fullscreenVideo = document.getElementById('fullscreenVideo');
    
    // 设置模态框标题
    modalTitle.textContent = `${item.title} - ${item.location}`;
    
    // 清空之前的内容
    fullscreenVideo.innerHTML = '';
    
    // 判断是否有视频源
    if (item.videoSrc) {
        // 创建视频元素
        const video = document.createElement('video');
        video.id = 'videoPlayer';
        video.controls = true;
        video.autoplay = true;
        
        // 创建视频源
        const source = document.createElement('source');
        source.src = item.videoSrc;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        fullscreenVideo.appendChild(video);
    } else {
        // 没有视频源时显示缩略图
        const imgContainer = document.createElement('div');
        imgContainer.className = 'video-placeholder fullscreen';
        
        const img = document.createElement('img');
        
        // 使用与卡片相同的逻辑选择图片
        if (item.type === 'energy-storage') {
            img.src = 'temp_imgs/storage1.jpg';
        } else if (item.type === 'charging-storage') {
            img.src = 'temp_imgs/storage3.jpg';
        } else if (item.type === 'integrated') {
            img.src = 'temp_imgs/storage4.jpg';
        } else {
            img.src = 'temp_imgs/storage2.jpg';
        }
        
        img.alt = item.title;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        
        img.onerror = function() {
            // 图片加载失败时显示占位符
            this.style.display = 'none';
            imgContainer.innerHTML += `
                <i class="fa fa-video-slash"></i>
                <p>图片加载失败</p>
            `;
        };
        
        const message = document.createElement('p');
        message.textContent = '视频加载中...（演示环境无实时视频）';
        message.style.position = 'absolute';
        message.style.bottom = '30px';
        message.style.left = '0';
        message.style.width = '100%';
        message.style.textAlign = 'center';
        message.style.background = 'rgba(0,0,0,0.5)';
        message.style.padding = '10px 0';
        message.style.margin = '0';
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(message);
        fullscreenVideo.appendChild(imgContainer);
    }
    
    // 显示模态框，使用CSS动画
    modal.style.display = 'block';
    // 触发重绘以应用过渡效果
    modal.offsetHeight;
    modal.classList.add('show');
}

/**
 * 绑定筛选事件
 */
function bindFilterEvents() {
    console.log('绑定筛选事件');
    
    // 站点类型筛选
    const siteTypeOptions = document.querySelectorAll('input[name="siteType"]');
    console.log('找到站点类型选项数量:', siteTypeOptions.length);
    
    siteTypeOptions.forEach(option => {
        // 移除旧的事件监听器，防止重复绑定
        option.removeEventListener('change', onFilterChange);
        option.addEventListener('change', onFilterChange);
    });
    
    // 摄像头状态筛选
    const cameraStatusOptions = document.querySelectorAll('input[name="cameraStatus"]');
    console.log('找到摄像头状态选项数量:', cameraStatusOptions.length);
    
    cameraStatusOptions.forEach(option => {
        // 移除旧的事件监听器，防止重复绑定
        option.removeEventListener('change', onFilterChange);
        option.addEventListener('change', onFilterChange);
    });
    
    // 区域筛选
    const regionOptions = document.querySelectorAll('input[name="region"]');
    console.log('找到区域选项数量:', regionOptions.length);
    
    regionOptions.forEach(option => {
        // 移除旧的事件监听器，防止重复绑定
        option.removeEventListener('change', onFilterChange);
        option.addEventListener('change', onFilterChange);
    });
    
    // 为Label添加点击事件，增强用户体验
    document.querySelectorAll('.filter-option').forEach(label => {
        label.removeEventListener('click', onLabelClick);
        label.addEventListener('click', onLabelClick);
    });
}

/**
 * 筛选选项变化时的处理函数
 */
function onFilterChange() {
    console.log('筛选条件变化:', this.name, this.value);
    
    if (this.checked) {
        // 更新筛选条件
        currentFilters[this.name === 'siteType' ? 'siteType' : 
                        this.name === 'cameraStatus' ? 'cameraStatus' : 'region'] = this.value;
        
        // 更新激活样式
        updateActiveFilterClass(this.name, this);
        
        // 重新渲染卡片
        renderVideoCards();
        
        // 更新统计信息
        updateStatistics();
    }
}

/**
 * 点击标签时触发对应的单选按钮
 */
function onLabelClick(e) {
    // 阻止事件冒泡，防止重复触发
    e.stopPropagation();
    
    // 如果点击的不是label本身，而是其中的input或span，不执行操作
    if (e.target !== this && e.target.tagName !== 'SPAN') {
        return;
    }
    
    const radio = this.querySelector('input[type="radio"]');
    if (radio && !radio.checked) {
        radio.checked = true;
        
        // 手动触发change事件
        const event = new Event('change', { bubbles: true });
        radio.dispatchEvent(event);
    }
}

/**
 * 更新筛选选项的激活样式
 * @param {string} filterName - 筛选名称
 * @param {HTMLElement} activeElement - 当前激活的元素
 */
function updateActiveFilterClass(filterName, activeElement) {
    console.log('更新筛选样式:', filterName);
    
    const options = document.querySelectorAll(`input[name="${filterName}"]`);
    options.forEach(option => {
        const parent = option.closest('.filter-option');
        if (parent) {
            if (option === activeElement) {
                parent.classList.add('active');
            } else {
                parent.classList.remove('active');
            }
        }
    });
}

/**
 * 绑定搜索事件
 */
function bindSearchEvent() {
    const searchInput = document.getElementById('videoSearchInput');
    const searchButton = document.getElementById('videoSearchBtn');
    
    if (!searchInput || !searchButton) {
        console.error('搜索元素未找到');
        return;
    }
    
    // 使用防抖函数优化搜索，避免频繁触发
    const debouncedSearch = debounce(function() {
        currentFilters.search = searchInput.value.trim();
        renderVideoCards();
        updateStatistics();
    }, 300);
    
    // 搜索按钮点击事件
    searchButton.removeEventListener('click', debouncedSearch);
    searchButton.addEventListener('click', debouncedSearch);
    
    // 回车键搜索
    searchInput.removeEventListener('keypress', onSearchKeyPress);
    searchInput.addEventListener('keypress', onSearchKeyPress);
    
    // 输入时实时搜索
    searchInput.removeEventListener('input', debouncedSearch);
    searchInput.addEventListener('input', debouncedSearch);
}

/**
 * 搜索框按键事件处理
 */
function onSearchKeyPress(e) {
    if (e.key === 'Enter') {
        currentFilters.search = this.value.trim();
        renderVideoCards();
        updateStatistics();
        
        // 阻止表单提交
        e.preventDefault();
    }
}

/**
 * 更新统计信息
 */
function updateStatistics() {
    // 筛选数据
    const filteredData = videoMonitorData.filter(item => {
        // 站点类型筛选
        if (currentFilters.siteType !== 'all' && item.type !== currentFilters.siteType) {
            return false;
        }
        
        // 区域筛选
        if (currentFilters.region !== 'all' && item.region !== currentFilters.region) {
            return false;
        }
        
        // 搜索筛选
        if (currentFilters.search && !item.title.toLowerCase().includes(currentFilters.search.toLowerCase()) && 
            !item.location.toLowerCase().includes(currentFilters.search.toLowerCase())) {
            return false;
        }
        
        return true;
    });
    
    // 计算统计数据
    const totalCameras = filteredData.length;
    const onlineCameras = filteredData.filter(item => item.status === 'online').length;
    const offlineCameras = filteredData.filter(item => item.status === 'offline').length;
    
    // 计算覆盖的站点数量（通过位置字段的前缀来区分站点）
    const sites = new Set();
    filteredData.forEach(item => {
        const siteName = item.location.split(' - ')[0];
        sites.add(siteName);
    });
    const coveredSites = sites.size;
    
    // 更新DOM
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = totalCameras;
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = onlineCameras;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = offlineCameras;
    document.querySelector('.stat-item:nth-child(4) .stat-value').textContent = `${coveredSites}/${TOTAL_SITES}`;
}

/**
 * 绑定分页事件
 */
function bindPaginationEvents() {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (!prevPageBtn || !nextPageBtn || !pageNumbers) {
        console.error('分页元素未找到');
        return;
    }
    
    // 移除旧的事件监听器
    prevPageBtn.removeEventListener('click', onPrevPage);
    nextPageBtn.removeEventListener('click', onNextPage);
    pageNumbers.removeEventListener('click', onPageNumberClick);
    
    // 添加新的事件监听器
    prevPageBtn.addEventListener('click', onPrevPage);
    nextPageBtn.addEventListener('click', onNextPage);
    pageNumbers.addEventListener('click', onPageNumberClick);
}

/**
 * 上一页按钮事件处理
 */
function onPrevPage() {
    if (pagination.currentPage > 1) {
        pagination.currentPage--;
        renderVideoCards();
    }
}

/**
 * 下一页按钮事件处理
 */
function onNextPage() {
    if (pagination.currentPage < pagination.totalPages) {
        pagination.currentPage++;
        renderVideoCards();
    }
}

/**
 * 页码点击事件处理
 */
function onPageNumberClick(e) {
    if (e.target.classList.contains('page-number') && !e.target.classList.contains('active')) {
        pagination.currentPage = parseInt(e.target.textContent);
        renderVideoCards();
    }
}

/**
 * 更新分页控件
 */
function updatePagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    // 清空页码
    pageNumbers.innerHTML = '';
    
    // 禁用或启用翻页按钮
    prevPageBtn.disabled = pagination.currentPage === 1;
    nextPageBtn.disabled = pagination.currentPage === pagination.totalPages || pagination.totalPages === 0;
    
    // 如果没有数据，显示一个页码
    if (pagination.totalPages === 0) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number active';
        pageNumber.textContent = '1';
        pageNumbers.appendChild(pageNumber);
        return;
    }
    
    // 确定页码范围
    let startPage = Math.max(1, pagination.currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + 4);
    
    // 调整起始页码，确保显示5个页码（如果总页数足够）
    if (endPage - startPage + 1 < 5 && pagination.totalPages >= 5) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 生成页码
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = i;
        
        if (i === pagination.currentPage) {
            pageNumber.classList.add('active');
        }
        
        pageNumbers.appendChild(pageNumber);
    }
}

/**
 * 绑定模态框事件
 */
function bindModalEvents() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('closeModal');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // 关闭模态框
    closeBtn.addEventListener('click', closeVideoModal);
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeVideoModal();
        }
    });
    
    // 播放按钮
    playBtn.addEventListener('click', function() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.play();
        }
    });
    
    // 暂停按钮
    pauseBtn.addEventListener('click', function() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.pause();
        }
    });
    
    // 静音按钮
    muteBtn.addEventListener('click', function() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.muted = !videoPlayer.muted;
            
            // 更新图标
            if (videoPlayer.muted) {
                this.querySelector('i').className = 'fa fa-volume-mute';
            } else {
                this.querySelector('i').className = 'fa fa-volume-up';
            }
        }
    });
    
    // 全屏按钮
    fullscreenBtn.addEventListener('click', function() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
                videoPlayer.msRequestFullscreen();
            }
        }
    });
}

/**
 * 关闭视频模态框
 */
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 停止视频播放
    if (videoPlayer) {
        videoPlayer.pause();
    }
    
    // 使用CSS动画
    modal.classList.remove('show');
    
    // 等待动画完成后隐藏
    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }, 300);
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    // 移除所有事件监听器
    document.querySelectorAll('input[name="siteType"]').forEach(option => {
        option.removeEventListener('change', onFilterChange);
    });
    
    document.querySelectorAll('input[name="cameraStatus"]').forEach(option => {
        option.removeEventListener('change', onFilterChange);
    });
    
    document.querySelectorAll('input[name="region"]').forEach(option => {
        option.removeEventListener('change', onFilterChange);
    });
    
    document.querySelectorAll('.filter-option').forEach(label => {
        label.removeEventListener('click', onLabelClick);
    });
    
    // 清理其他资源
    isInitialized = false;
}); 