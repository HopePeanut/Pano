/**
 * 维护工具页面脚本
 * 负责处理维护工具页面的交互逻辑和功能动作
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initializeNavbar();
    
    // 初始化工具卡片交互
    initializeToolCards();
    
    // 检查是否有新功能更新
    checkForUpdates();
});

/**
 * 初始化导航栏
 * 注入导航栏HTML并设置当前活动菜单项
 */
function initializeNavbar() {
    // 注入导航栏
    document.getElementById('navbar-container').innerHTML = navbarHTML;
    
    // 初始化导航栏功能
    initNavbar();
    
    // 设置活动菜单项
    const maintenanceMenu = document.getElementById('menu-maintenance');
    const toolsSubmenu = document.getElementById('submenu-maintenance-tools');
    
    if (maintenanceMenu) {
        maintenanceMenu.classList.add('active');
    }
    
    if (toolsSubmenu) {
        toolsSubmenu.classList.add('active');
    }
}

/**
 * 初始化工具卡片交互
 * 为每个工具卡片添加点击事件并处理交互逻辑
 */
function initializeToolCards() {
    // 获取所有工具卡片和按钮
    const toolCards = document.querySelectorAll('.tool-card');
    const toolButtons = document.querySelectorAll('.tool-button');
    
    // 为卡片添加点击事件
    toolCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮，则不处理（由按钮自己的事件处理）
            if (e.target.classList.contains('tool-button')) {
                return;
            }
            
            // 获取当前卡片的按钮并模拟点击
            const button = this.querySelector('.tool-button');
            if (button) {
                button.click();
            }
        });
    });
    
    // 为按钮添加点击事件
    toolButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 阻止事件冒泡，避免触发卡片的点击事件
            e.stopPropagation();
            
            // 获取当前卡片和标题
            const toolCard = this.closest('.tool-card');
            const toolTitle = toolCard.querySelector('.tool-title').textContent;
            
            // 根据工具类型执行对应操作
            handleToolAction(toolTitle);
        });
    });
}

/**
 * 处理工具操作
 * 根据不同的工具类型执行相应的操作
 * @param {string} toolName - 工具名称
 */
function handleToolAction(toolName) {
    // 根据工具名称执行对应操作
    switch(toolName) {
        case '远程OTA升级':
            // 跳转到OTA升级页面
            window.location.href = 'ota-upgrade.html';
            break;
        case '清安知识库':
            // 跳转到知识库页面，因为已经在HTML中添加了<a>标签，这里的跳转可以注释掉或移除
            // window.location.href = 'knowledge-base.html'; 
            break;
        case '参数校验':
            // alert(`即将进入"${toolName}"功能，该功能支持设备参数校准和调整。`);
            // 跳转到参数校验页面，因为已经在HTML中添加了<a>标签，这里的跳转可以注释掉或移除
            // window.location.href = 'parameter-validation.html';
            break;
        case '智能诊断':
            alert(`即将进入"${toolName}"功能，该功能提供AI辅助的系统诊断服务。`);
            // TODO: 实现跳转到智能诊断页面
            // window.location.href = 'ai-diagnosis.html';
            break;
        case '运维报表':
            alert(`即将进入"${toolName}"功能，该功能支持生成各类运维数据报表。`);
            // TODO: 实现跳转到运维报表页面
            // window.location.href = 'maintenance-reports.html';
            break;
        default:
            alert(`即将进入"${toolName}"功能，该功能正在开发中。`);
            break;
    }
}

/**
 * 检查功能更新
 * 模拟检查是否有新功能上线或更新
 */
function checkForUpdates() {
    // 这里仅为演示，实际应该通过API获取更新信息
    // 模拟异步获取更新数据
    setTimeout(() => {
        // 假设有一个新功能正在开发中
        const hasNewFeature = true;
        
        if (hasNewFeature) {
            // 更新"敬请期待"区域的提示信息
            const comingSoon = document.querySelector('.coming-soon');
            if (comingSoon) {
                const notification = document.createElement('div');
                notification.className = 'update-notification';
                notification.innerHTML = `
                    <span class="badge new-badge">新功能开发中</span>
                    <p>设备批量配置工具将于下月上线，敬请期待！</p>
                `;
                
                // 添加到现有内容之后
                comingSoon.appendChild(notification);
                
                // 添加新功能徽章样式
                const style = document.createElement('style');
                style.textContent = `
                    .update-notification {
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px dashed var(--primary-color);
                    }
                    .new-badge {
                        background-color: var(--primary-color);
                        color: white;
                        border-radius: 12px;
                        padding: 3px 8px;
                        font-size: 0.75rem;
                        display: inline-block;
                        margin-bottom: 8px;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, 1500);
} 