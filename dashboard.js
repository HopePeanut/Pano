// 在dashboard.html中添加以下代码（在loadSiteCards函数中的card.addEventListener后添加）:

// 为"进入站点"按钮添加单独的点击事件
const siteBtn = card.querySelector('.site-btn');
if (siteBtn) {
    siteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡到卡片
        // 跳转到站点首页
        window.location.href = `site-homepage.html?siteId=${site.id}`;
    });
} 