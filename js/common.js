/**
 * Pano全栈式综合能源管理平台通用功能模块
 * 用于处理所有页面通用的组件和功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 加载通用组件
    loadCommonComponents();
    
    // 初始化通用功能
    initCommonFeatures();
    
    // 添加菜单下拉功能
    setupNavDropdowns();
    
    // 更新用户信息
    updateUserInfo();
    
    // 监听暗黑模式切换
    setupDarkModeToggle();
});

/**
 * 加载通用组件
 * 加载页面中所有需要复用的组件
 */
function loadCommonComponents() {
    // 加载导航栏
    loadNavbar();
}

/**
 * 初始化通用功能
 * 设置通用事件监听和功能
 */
function initCommonFeatures() {
    // 初始化导航功能
    initNavigation();
    
    // 注册退出登录事件
    registerLogoutEvent();
    
    // 初始化用户下拉菜单
    initUserDropdown();
}

/**
 * 加载导航栏
 * 将导航栏组件加载到带有data-component="navbar"属性的元素中
 */
function loadNavbar() {
    const navbarContainers = document.querySelectorAll('[data-component="navbar"]');
    
    if (navbarContainers.length === 0) return;
    
    // 获取当前页面文件名，用于高亮对应导航项
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 检测是否在admin子目录下
    const isInAdminDir = window.location.pathname.includes('/admin/');
    
    // 根据目录层级确定资源路径前缀
    const pathPrefix = isInAdminDir ? '../' : '';
    
    // 导航栏HTML模板
    const navbarHTML = `
    <div class="header-left">
        <div class="logo">
            <img src="${pathPrefix}images/logo-color.png" alt="QAES Logo">
        </div>
        <div class="system-title">
            <span class="platform-name">Pano全栈式综合能源管理平台</span>
            <span class="system-name">智慧运维系统</span>
        </div>
    </div>
    
    <div class="main-nav">
        <ul>
            <li class="nav-item" data-module="monitoring" data-page="maintenance-system.html,site-monitor.html,site-detail.html,video-monitor.html,alarm-log.html">
                <a href="${pathPrefix}maintenance-system.html">监控中心</a>
            </li>
            <li class="nav-item" data-module="maintenance" data-page="">
                <a href="#">运维管理</a>
            </li>
            <li class="nav-item" data-module="data-analysis" data-page="">
                <a href="#">数据分析</a>
            </li>
            <li class="nav-item" data-module="admin" data-page="">
                <a href="#">后台管理</a>
            </li>
            <li class="nav-item" data-module="personal" data-page="notifications.html,personal-info.html">
                <a href="#">个人中心</a>
            </li>
        </ul>
        
        <!-- 二级导航区域 -->
        <div class="sub-nav-container">
            <div class="sub-nav" data-for="monitoring">
                <a href="${pathPrefix}maintenance-system.html" data-page="maintenance-system.html">GIS地图</a>
                <a href="${pathPrefix}site-monitor.html" data-page="site-monitor.html">站点监控</a>
                <a href="${pathPrefix}video-monitor.html" data-page="video-monitor.html">视频监控</a>
                <a href="${pathPrefix}alarm-log.html" data-page="alarm-log.html">告警与日志</a>
            </div>
            <div class="sub-nav" data-for="maintenance">
                <a href="#maintenance-dashboard">运维看板</a>
                <a href="#work-orders">工单管理</a>
                <a href="#maintenance-tools">维护工具</a>
            </div>
            <div class="sub-nav" data-for="data-analysis">
                <a href="${pathPrefix}statistics-compare.html">统计对比</a>
                <a href="#data-query">数据查询</a>
            </div>
            <div class="sub-nav" data-for="admin">
                <a href="#site-config">站点配置</a>
                <a href="#template-management">模版管理</a>
            </div>
            <div class="sub-nav" data-for="personal">
                <a href="${pathPrefix}notifications.html" data-page="notifications.html">消息通知</a>
                <a href="${pathPrefix}personal-info.html" data-page="personal-info.html">个人信息</a>
            </div>
        </div>
    </div>
    
    <div class="header-right">
        <div class="user-info">
            <div class="user-avatar">
                <img src="${pathPrefix}images/avatar.jpg" alt="User Avatar">
            </div>
            <div class="user-details">
                <span class="user-name">用户名</span>
                <span class="user-role">管理员</span>
            </div>
            <div class="user-dropdown">
                <a href="${pathPrefix}notifications.html"><i class="fas fa-bell"></i> 消息通知</a>
                <a href="${pathPrefix}personal-info.html"><i class="fas fa-user-circle"></i> 个人信息</a>
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
            </div>
        </div>
    </div>
    `;
    
    // 将导航栏HTML插入到所有导航容器中
    navbarContainers.forEach(container => {
        container.innerHTML = navbarHTML;
    });
}

/**
 * 初始化导航功能
 * 设置导航事件监听和激活当前页面对应的导航项
 */
function initNavigation() {
    // 获取当前页面URL
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // 检查是否为admin页面
    const isAdminPage = currentPath.includes('/admin/');
    
    // 激活主导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // 特殊处理admin页面 - 如果是admin下的页面，应该激活监控中心
        if (isAdminPage) {
            if (item.getAttribute('data-module') === 'monitoring') {
                item.classList.add('active');
                
                // 显示对应的二级导航
                const moduleId = item.getAttribute('data-module');
                const subNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
                if (subNav) {
                    subNav.classList.add('active');
                    
                    // 二级导航容器默认隐藏
                    const subNavContainer = document.querySelector('.sub-nav-container');
                    if (subNavContainer) {
                        subNavContainer.style.display = 'none';
                    }
                }
            }
        } else {
            // 正常检查页面匹配
            const pages = item.getAttribute('data-page').split(',');
            if (pages.includes(currentPage)) {
                item.classList.add('active');
                
                // 显示对应的二级导航
                const moduleId = item.getAttribute('data-module');
                const subNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
                if (subNav) {
                    subNav.classList.add('active');
                    
                    // 二级导航容器默认隐藏
                    const subNavContainer = document.querySelector('.sub-nav-container');
                    if (subNavContainer) {
                        subNavContainer.style.display = 'none';
                    }
                }
            }
        }
        
        // 点击主导航时显示对应的二级导航
        item.addEventListener('click', function(e) {
            // 如果点击的是链接，不阻止默认行为
            if (e.target.tagName === 'A' && e.target.getAttribute('href') !== '#') {
                return;
            }
            
            e.preventDefault();
            
            // 移除所有激活状态
            navItems.forEach(navItem => navItem.classList.remove('active'));
            document.querySelectorAll('.sub-nav').forEach(nav => nav.classList.remove('active'));
            
            // 激活当前项
            this.classList.add('active');
            
            // 显示对应的二级导航
            const moduleId = this.getAttribute('data-module');
            const subNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
            if (subNav) {
                subNav.classList.add('active');
                
                // 点击时仍显示二级导航容器
                const subNavContainer = document.querySelector('.sub-nav-container');
                if (subNavContainer) {
                    subNavContainer.style.display = 'block';
                }
            }
        });
        
        // 添加悬停效果 - 鼠标悬停在主导航项上时显示对应的二级导航
        item.addEventListener('mouseenter', function() {
            // 获取当前模块ID
            const moduleId = this.getAttribute('data-module');
            
            // 隐藏所有二级导航
            document.querySelectorAll('.sub-nav').forEach(nav => {
                nav.style.display = 'none';
            });
            
            // 显示对应的二级导航
            const subNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
            if (subNav) {
                subNav.style.display = 'flex';
                
                // 显示二级导航容器
                const subNavContainer = document.querySelector('.sub-nav-container');
                if (subNavContainer) {
                    subNavContainer.style.display = 'block';
                }
            }
        });
    });
    
    // 二级导航容器的鼠标离开事件
    const subNavContainer = document.querySelector('.sub-nav-container');
    if (subNavContainer) {
        subNavContainer.addEventListener('mouseleave', function() {
            // 确保鼠标完全离开后再隐藏二级菜单
            setTimeout(() => {
                // 如果鼠标不在主导航或二级导航容器上，则隐藏
                if (!isMouseOverElement('.main-nav') && !isMouseOverElement('.sub-nav-container')) {
                    this.style.display = 'none';
                    
                    // 隐藏所有非活动二级导航
                    document.querySelectorAll('.sub-nav').forEach(nav => {
                        if (!nav.classList.contains('active')) {
                            nav.style.display = 'none';
                        }
                    });
                    
                    // 只显示活动导航项对应的二级导航
                    const activeNavItem = document.querySelector('.nav-item.active');
                    if (activeNavItem) {
                        const moduleId = activeNavItem.getAttribute('data-module');
                        const activeSubNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
                        if (activeSubNav) {
                            activeSubNav.style.display = 'flex';
                        }
                    }
                }
            }, 50);
        });
    }
    
    // 主导航区域的鼠标离开事件
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
        mainNav.addEventListener('mouseleave', function() {
            // 短暂延迟，确保鼠标确实离开了导航区域
            setTimeout(() => {
                // 如果鼠标不在主导航或二级导航容器上，则隐藏二级导航
                if (!isMouseOverElement('.main-nav') && !isMouseOverElement('.sub-nav-container')) {
                    const subNavContainer = document.querySelector('.sub-nav-container');
                    if (subNavContainer) {
                        subNavContainer.style.display = 'none';
                    }
                    
                    // 隐藏所有非活动二级导航
                    document.querySelectorAll('.sub-nav').forEach(nav => {
                        if (!nav.classList.contains('active')) {
                            nav.style.display = 'none';
                        }
                    });
                    
                    // 只显示活动导航项对应的二级导航
                    const activeNavItem = document.querySelector('.nav-item.active');
                    if (activeNavItem) {
                        const moduleId = activeNavItem.getAttribute('data-module');
                        const activeSubNav = document.querySelector(`.sub-nav[data-for="${moduleId}"]`);
                        if (activeSubNav) {
                            activeSubNav.style.display = 'flex';
                        }
                    }
                }
            }, 50);
        });
    }
    
    // 激活二级导航
    const subNavLinks = document.querySelectorAll('.sub-nav a');
    subNavLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
        
        // 点击二级导航时激活对应项
        link.addEventListener('click', function(e) {
            // 如果链接指向的不是#，不阻止默认行为
            if (this.getAttribute('href') !== '#') {
                return;
            }
            
            e.preventDefault();
            
            // 移除所有激活状态
            subNavLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // 激活当前项
            this.classList.add('active');
        });
    });
}

/**
 * 检查鼠标是否在指定元素上
 * @param {string} selector - 元素选择器
 * @returns {boolean} - 如果鼠标在元素上则返回true
 */
function isMouseOverElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return false;
    
    // 使用自定义的函数来获取鼠标位置，而不依赖全局event对象
    const mousePosition = getMousePosition();
    if (!mousePosition) return false;
    
    const rect = element.getBoundingClientRect();
    
    return (
        mousePosition.x >= rect.left &&
        mousePosition.x <= rect.right &&
        mousePosition.y >= rect.top &&
        mousePosition.y <= rect.bottom
    );
}

/**
 * 获取当前鼠标位置
 * @returns {Object|null} - 包含x和y坐标的对象，如果无法获取则返回null
 */
let currentMousePosition = { x: 0, y: 0 };

// 全局鼠标移动事件监听器，持续更新鼠标位置
document.addEventListener('mousemove', function(e) {
    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;
});

function getMousePosition() {
    return currentMousePosition;
}

/**
 * 初始化用户下拉菜单
 */
function initUserDropdown() {
    const userInfo = document.querySelector('.user-info');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userInfo && userDropdown) {
        // 点击用户信息区域时显示或隐藏下拉菜单
        userInfo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换下拉菜单的可见性
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // 添加鼠标悬停事件
        userInfo.addEventListener('mouseenter', function() {
            userDropdown.style.display = 'block';
        });
        
        userInfo.addEventListener('mouseleave', function(e) {
            // 检查鼠标是否移到了下拉菜单上
            const rect = userDropdown.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            // 如果鼠标不在下拉菜单范围内，则隐藏下拉菜单
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                userDropdown.style.display = 'none';
            }
        });
        
        // 为下拉菜单添加鼠标离开事件
        userDropdown.addEventListener('mouseleave', function() {
            userDropdown.style.display = 'none';
        });
        
        // 阻止下拉菜单的点击事件冒泡
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // 点击页面其他区域时隐藏下拉菜单
        document.addEventListener('click', function() {
            userDropdown.style.display = 'none';
        });
    }
}

/**
 * 注册退出登录事件
 */
function registerLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清除登录状态
            localStorage.removeItem('pano_logged_in');
            localStorage.removeItem('pano_user');
            
            // 显示退出提示
            if (typeof showTooltip === 'function') {
                showTooltip('退出成功', '正在返回登录页面...', 'success');
            }
            
            // 延迟跳转到登录页
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

/**
 * 更新用户信息
 * 从localStorage获取并显示当前登录用户信息
 */
function updateUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('pano_user') || '{}');
    const username = userInfo.username || '未知用户';
    const role = userInfo.role || '普通用户';
    
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
 * 显示提示信息
 * @param {string} title - 提示标题
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型 (success, warning, error, info)
 */
function showTooltip(title, message, type = 'info') {
    const tooltip = document.getElementById('tooltip');
    
    if (!tooltip) return;
    
    const tooltipTitle = tooltip.querySelector('.tooltip-title');
    const tooltipMessage = tooltip.querySelector('.tooltip-message');
    
    // 设置提示内容
    tooltipTitle.textContent = title;
    tooltipMessage.textContent = message;
    
    // 移除所有类型类
    tooltip.classList.remove('success', 'warning', 'error', 'info');
    
    // 添加当前类型类
    tooltip.classList.add(type);
    
    // 显示提示
    tooltip.style.display = 'block';
    
    // 自动隐藏
    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 3000);
}

/**
 * 设置导航下拉菜单
 */
function setupNavDropdowns() {
    const navItems = document.querySelectorAll('.nav-item.has-dropdown');
    
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('.nav-dropdown').classList.add('show');
        });
        
        item.addEventListener('mouseleave', function() {
            this.querySelector('.nav-dropdown').classList.remove('show');
        });
    });
    
    // 如果页面中有监控中心菜单项，添加下拉菜单
    const monitorNav = document.querySelector('.nav-item[href="index.html"]');
    if (monitorNav) {
        createMonitorDropdown(monitorNav);
    }
    
    // 如果页面中有数据分析菜单项，添加下拉菜单
    const dataAnalysisNav = document.querySelector('.nav-item[href="data-analysis.html"]');
    if (dataAnalysisNav) {
        createDataAnalysisDropdown(dataAnalysisNav);
    }
}

/**
 * 为监控中心添加下拉菜单
 */
function createMonitorDropdown(navItem) {
    navItem.classList.add('has-dropdown');
    
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';
    
    dropdown.innerHTML = `
        <a href="site-monitor.html" class="dropdown-item">站点监控</a>
        <a href="device-monitor.html" class="dropdown-item">设备监控</a>
        <a href="alarm-monitor.html" class="dropdown-item">告警监控</a>
    `;
    
    navItem.appendChild(dropdown);
}

/**
 * 为数据分析添加下拉菜单
 */
function createDataAnalysisDropdown(navItem) {
    navItem.classList.add('has-dropdown');
    
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';
    
    dropdown.innerHTML = `
        <a href="data-dashboard.html" class="dropdown-item">数据看板</a>
        <a href="statistics-compare.html" class="dropdown-item">统计对比</a>
        <a href="energy-analysis.html" class="dropdown-item">能源分析</a>
        <a href="report-generation.html" class="dropdown-item">报表生成</a>
    `;
    
    navItem.appendChild(dropdown);
}

/**
 * 设置暗黑模式切换
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) {
        // 检查本地存储中的主题设置
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 根据存储的设置应用主题
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            darkModeToggle.checked = true;
        }
        
        // 监听切换事件
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
} 