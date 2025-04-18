// 导航栏模板和函数

// 导航栏HTML内容
const navbarHTML = `
<nav class="navbar">
    <div class="navbar-container">
        <div class="navbar-logo">
            <img src="assets/images/logo.png" alt="Logo">
            <h1>智慧运维系统</h1>
        </div>

        <ul class="navbar-menu">
            <!-- 一级菜单：监控中心 -->
            <li class="menu-item" id="menu-monitor">
                <a href="#">监控中心</a>
                <div class="submenu">
                    <a href="dashboard.html" class="submenu-item" id="submenu-site-monitor">站点监控</a>
                    <a href="video-monitor.html" class="submenu-item" id="submenu-video-monitor">视频监控</a>
                </div>
            </li>

            <!-- 一级菜单：运维管理 -->
            <li class="menu-item" id="menu-maintenance">
                <a href="#">运维管理</a>
                <div class="submenu">
                    <a href="dashboard-maintenance.html" class="submenu-item" id="submenu-maintenance-dashboard">运维看板</a>
                    <a href="work-order.html" class="submenu-item" id="submenu-work-order">工单系统</a>
                    <a href="maintenance-tools.html" class="submenu-item" id="submenu-maintenance-tools">维护工具</a>
                </div>
            </li>

            <!-- 一级菜单：数据分析 -->
            <li class="menu-item" id="menu-analysis">
                <a href="#">数据分析</a>
                <div class="submenu">
                    <a href="statistics.html" class="submenu-item" id="submenu-statistics">统计对比</a>
                    <a href="data-query.html" class="submenu-item" id="submenu-data-query">数据查询</a>
                </div>
            </li>

            <!-- 一级菜单：后台管理 -->
            <li class="menu-item" id="menu-admin">
                <a href="#">后台管理</a>
                <div class="submenu">
                    <a href="user-management.html" class="submenu-item" id="submenu-user-management">用户管理</a>
                    <a href="site-config.html" class="submenu-item" id="submenu-site-config">站点管理</a>
                    <a href="template-management.html" class="submenu-item" id="submenu-template-management">模板管理</a>
                </div>
            </li>

            <!-- 一级菜单：个人中心 -->
            <li class="menu-item" id="menu-personal">
                <a href="#">个人中心</a>
                <div class="submenu">
                    <a href="notifications.html" class="submenu-item" id="submenu-notifications">消息通知</a>
                    <a href="profile.html" class="submenu-item" id="submenu-profile">个人信息</a>
                </div>
            </li>
        </ul>

        <div class="navbar-user">
            <div class="user-avatar">
                <img src="assets/images/avatar.jpg" alt="User Avatar">
            </div>
            <span class="user-name">用户</span>
            <a href="javascript:void(0);" onclick="logout();" style="color: var(--light-text); margin-left: 10px; font-size: 0.9rem; text-decoration: none;">退出</a>
        </div>
    </div>
</nav>
`;

// 导航栏样式
const navbarCSS = `
/* 导航栏样式 */
.navbar {
    background-color: var(--primary-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
}

.navbar-logo {
    display: flex;
    align-items: center;
}

.navbar-logo img {
    height: 36px;
    margin-right: 15px;
}

.navbar-logo h1 {
    color: var(--light-text);
    font-size: 1.3rem;
    font-weight: 500;
}

/* 导航菜单 */
.navbar-menu {
    display: flex;
    list-style: none;
    height: 100%;
}

.menu-item {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
}

.menu-item > a {
    color: var(--light-text);
    text-decoration: none;
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.menu-item:hover > a {
    background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active > a {
    background-color: var(--secondary-color);
}

/* 下拉菜单 */
.submenu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    border-radius: 0 0 5px 5px;
    display: none;
    z-index: 101;
}

.menu-item:hover .submenu {
    display: block;
}

.submenu-item {
    padding: 12px 20px;
    display: block;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
}

.submenu-item:hover {
    background-color: var(--light-color);
}

.submenu-item.active {
    background-color: var(--light-color);
    color: var(--primary-color);
    font-weight: 500;
}

/* 用户信息区 */
.navbar-user {
    display: flex;
    align-items: center;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--light-color);
    overflow: hidden;
    margin-right: 10px;
    cursor: pointer;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-name {
    color: var(--light-text);
    margin-right: 15px;
    cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .navbar-container {
        flex-direction: column;
        height: auto;
        padding: 10px;
    }
    
    .navbar-logo {
        margin-bottom: 10px;
    }
    
    .navbar-menu {
        flex-direction: column;
        width: 100%;
    }
    
    .menu-item {
        width: 100%;
    }
    
    .menu-item > a {
        width: 100%;
        padding: 10px;
    }
    
    .submenu {
        position: static;
        width: 100%;
        box-shadow: none;
    }
    
    .navbar-user {
        margin-top: 10px;
    }
}
`;

// 初始化导航栏
function initNavbar() {
    // 向页面添加导航栏样式
    if (!document.getElementById('navbar-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'navbar-styles';
        styleElement.textContent = navbarCSS;
        document.head.appendChild(styleElement);
    }
    
    // 插入导航栏HTML
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
        
        // 设置当前页面的菜单项激活状态
        setActiveMenuItem();
        
        // 设置用户信息
        updateUserInfo();
    }
}

// 设置当前页面对应的菜单激活状态
function setActiveMenuItem() {
    // 获取当前页面的文件名
    const currentPage = window.location.pathname.split('/').pop();
    
    // 清除所有激活状态
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 根据当前页面设置激活状态
    switch(currentPage) {
        case 'dashboard.html':
            document.getElementById('menu-monitor').classList.add('active');
            document.getElementById('submenu-site-monitor').classList.add('active');
            break;
        case 'video-monitor.html':
            document.getElementById('menu-monitor').classList.add('active');
            document.getElementById('submenu-video-monitor').classList.add('active');
            break;
        case 'dashboard-maintenance.html':
            document.getElementById('menu-maintenance').classList.add('active');
            document.getElementById('submenu-maintenance-dashboard').classList.add('active');
            break;
        case 'work-order.html':
            document.getElementById('menu-maintenance').classList.add('active');
            document.getElementById('submenu-work-order').classList.add('active');
            break;
        case 'maintenance-tools.html':
            document.getElementById('menu-maintenance').classList.add('active');
            document.getElementById('submenu-maintenance-tools').classList.add('active');
            break;
        case 'statistics.html':
            document.getElementById('menu-analysis').classList.add('active');
            document.getElementById('submenu-statistics').classList.add('active');
            break;
        case 'data-query.html':
            document.getElementById('menu-analysis').classList.add('active');
            document.getElementById('submenu-data-query').classList.add('active');
            break;
        case 'user-management.html':
            document.getElementById('menu-admin').classList.add('active');
            document.getElementById('submenu-user-management').classList.add('active');
            break;
        case 'site-config.html':
            document.getElementById('menu-admin').classList.add('active');
            document.getElementById('submenu-site-config').classList.add('active');
            break;
        case 'template-management.html':
            document.getElementById('menu-admin').classList.add('active');
            document.getElementById('submenu-template-management').classList.add('active');
            break;
        case 'notifications.html':
            document.getElementById('menu-personal').classList.add('active');
            document.getElementById('submenu-notifications').classList.add('active');
            break;
        case 'profile.html':
            document.getElementById('menu-personal').classList.add('active');
            document.getElementById('submenu-profile').classList.add('active');
            break;
        default:
            // 默认不设置激活状态
            break;
    }
}

// 更新用户信息
function updateUserInfo() {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            userNameElement.textContent = currentUser;
        }
    }
}

// 登出函数
function logout() {
    // 清除登录信息
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

// 页面加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', initNavbar);