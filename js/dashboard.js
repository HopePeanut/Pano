// 系统入口页面功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 更新用户信息
    updateUserInfo();
    
    // 系统卡片增强
    enhanceSystemCards();
    
    // 注册退出登录事件
    registerLogoutEvent();
    
    // 注册用户菜单事件
    registerUserMenuEvents();
    
    // 注册头像点击事件
    registerAvatarClickEvent();
});

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    // 获取登录状态
    const isLoggedIn = localStorage.getItem('pano_logged_in') === 'true';
    
    if (!isLoggedIn) {
        showTooltip('未登录', '请先登录系统', 'error');
        
        // 延迟后跳转到登录页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

/**
 * 更新用户信息
 */
function updateUserInfo() {
    // 获取存储的用户信息
    const userInfo = JSON.parse(localStorage.getItem('pano_user') || '{}');
    const username = userInfo.username || '未知用户';
    const lastLoginTime = userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString() : new Date().toLocaleString();
    
    // 更新用户名显示
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = username;
        userNameElement.setAttribute('title', `上次登录时间: ${lastLoginTime}`);
    }
}

/**
 * 增强系统卡片功能
 */
function enhanceSystemCards() {
    // 选择所有系统卡片
    const systemCards = document.querySelectorAll('.system-card');
    
    // 为每个系统卡片添加增强功能
    systemCards.forEach(card => {
        // 获取系统ID和对应的进入按钮
        const systemId = card.getAttribute('data-system-id');
        const enterBtn = card.querySelector('.enter-btn');
        
        // 鼠标进入卡片效果
        card.addEventListener('mouseenter', () => {
            // 为卡片内的元素添加动画
            const icon = card.querySelector('.system-icon');
            const title = card.querySelector('h3');
            const features = card.querySelectorAll('.system-features span');
            
            if (icon) icon.style.transform = 'scale(1.1) rotate(5deg)';
            if (title) title.style.transform = 'translateX(5px)';
            
            features.forEach((feature, index) => {
                feature.style.transform = 'translateY(-3px)';
                feature.style.transition = `all 0.3s ease ${index * 0.05}s`;
            });
        });
        
        // 鼠标离开卡片效果
        card.addEventListener('mouseleave', () => {
            // 重置动画
            const icon = card.querySelector('.system-icon');
            const title = card.querySelector('h3');
            const features = card.querySelectorAll('.system-features span');
            
            if (icon) icon.style.transform = '';
            if (title) title.style.transform = '';
            
            features.forEach(feature => {
                feature.style.transform = '';
            });
        });
        
        // 卡片点击事件：触发进入系统按钮
        card.addEventListener('click', (e) => {
            // 如果点击的不是按钮本身，则触发按钮点击
            if (!e.target.classList.contains('enter-btn') && enterBtn) {
                // 阻止事件冒泡
                e.preventDefault();
                enterBtn.click();
            }
        });
        
        // 智能运维系统特殊处理
        if (systemId === 'smart-maintenance' && enterBtn) {
            // 每3秒添加一次呼吸动画
            setInterval(() => {
                enterBtn.classList.add('pulse');
                setTimeout(() => {
                    enterBtn.classList.remove('pulse');
                }, 1000);
            }, 3000);
            
            // 添加点击事件
            enterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 检查是否已登录
                if (localStorage.getItem('pano_logged_in') !== 'true') {
                    showTooltip('未登录', '请先登录系统', 'error');
                    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                    return;
                }
                
                // 保存最后选择的系统ID
                localStorage.setItem('pano_last_system', systemId);
                
                // 更改按钮状态
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在进入...';
                this.style.pointerEvents = 'none';
                
                // 显示提示
                showTooltip('正在跳转', '正在进入智慧运维系统，请稍候...', 'success');
                
                // 模拟加载延迟后跳转
                setTimeout(() => {
                    window.location.href = 'maintenance-system.html';
                }, 1500);
            });
        } else if (enterBtn) {
            // 其他系统按钮点击事件
            enterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showTooltip('开发中', '该系统功能正在开发中，敬请期待！');
            });
        }
    });
}

/**
 * 注册退出登录事件
 */
function registerLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 确认是否退出
            if (confirm('确定要退出登录吗？')) {
                // 清除登录状态
                localStorage.removeItem('pano_logged_in');
                
                // 显示提示
                showTooltip('退出成功', '您已成功退出系统', 'success');
                
                // 延迟后跳转到登录页
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
}

/**
 * 注册用户菜单事件
 */
function registerUserMenuEvents() {
    const menuItems = document.querySelectorAll('.user-dropdown a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.getAttribute('data-action');
            
            // 根据不同的操作执行不同的功能
            switch (action) {
                case 'profile':
                    showTooltip('开发中', '个人中心功能正在开发中');
                    break;
                case 'settings':
                    showTooltip('开发中', '系统设置功能正在开发中');
                    break;
                case 'help':
                    showTooltip('开发中', '帮助中心功能正在开发中');
                    break;
                default:
                    // 如果有链接，则跳转
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
            }
        });
    });
}

/**
 * 注册头像点击事件
 */
function registerAvatarClickEvent() {
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            // 显示提示信息
            showTooltip('头像修改', '请通过修改images/avatar.jpg文件更换您的头像', 'success');
        });
    }
}

/**
 * 全局提示框函数
 * @param {string} title - 提示标题
 * @param {string} message - 提示内容
 * @param {string} type - 提示类型（success/error）
 */
function showTooltip(title, message, type = 'success') {
    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = tooltip.querySelector('.tooltip-title');
    const tooltipMessage = tooltip.querySelector('.tooltip-message');
    
    // 设置提示内容
    tooltipTitle.textContent = title || '提示';
    tooltipMessage.textContent = message || '操作成功';
    
    // 设置提示类型
    tooltip.className = 'tooltip';
    tooltip.classList.add(type);
    tooltip.classList.add('show');
    
    // 3秒后自动关闭
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .system-card.active {
        transform: translateY(-5px);
        box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
        border: 1px solid #39B49A;
    }
    
    .enter-btn.loading {
        position: relative;
        color: transparent !important;
        pointer-events: none;
    }
    
    .enter-btn.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* 根据系统类型变化按钮加载颜色 */
    .system-card[data-system-id="energy-planning"] .enter-btn.loading::after {
        border: 2px solid rgba(74, 137, 220, 0.3);
        border-top-color: #4a89dc;
    }
    
    .system-card[data-system-id="delivery-management"] .enter-btn.loading::after {
        border: 2px solid rgba(255, 153, 102, 0.3);
        border-top-color: #ff9966;
    }
    
    .system-card[data-system-id="energy-management"] .enter-btn.loading::after {
        border: 2px solid rgba(54, 185, 204, 0.3);
        border-top-color: #36b9cc;
    }
    
    .system-card[data-system-id="smart-maintenance"] .enter-btn.loading::after {
        border: 2px solid rgba(57, 180, 154, 0.3);
        border-top-color: #39B49A;
    }
    
    .system-card[data-system-id="intelligent-operation"] .enter-btn.loading::after {
        border: 2px solid rgba(153, 102, 204, 0.3);
        border-top-color: #9966cc;
    }
`;
document.head.appendChild(style);

// 显示欢迎消息
setTimeout(() => {
    const userInfo = JSON.parse(localStorage.getItem('pano_user') || '{}');
    showTooltip('欢迎回来', `${userInfo.username || '管理员'}，欢迎使用Pano全栈式综合能源管理平台`, 'success');
}, 1000);