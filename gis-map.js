// 假设已有地图初始化函数
function initializeGisMap() {
    // 地图初始化逻辑...
    
    // 添加站点标记和双击事件
    addSiteMarkersWithEvents();
}

// 添加站点标记和双击事件
function addSiteMarkersWithEvents() {
    // 假设sites是站点数据数组
    sites.forEach(site => {
        // 创建站点标记
        const marker = createSiteMarker(site);
        
        // 添加双击事件
        marker.on('dblclick', function() {
            navigateToSiteHomepage(site.id);
        });
        
        // 添加标记到地图
        marker.addTo(map);
    });
}

// 跳转到站点首页的函数
function navigateToSiteHomepage(siteId) {
    window.location.href = `site-homepage.html?siteId=${siteId}`;
}

// 假设有个函数来创建站点标记
function createSiteMarker(site) {
    // 此处代码根据具体使用的地图库不同而不同
    // 如果使用Leaflet:
    const marker = L.marker([site.latitude, site.longitude], {
        title: site.name,
        siteId: site.id
    });
    
    // 或者使用百度地图:
    // const marker = new BMap.Marker(new BMap.Point(site.longitude, site.latitude));
    // marker.siteId = site.id;
    // marker.addEventListener('dblclick', function() {
    //     navigateToSiteHomepage(this.siteId);
    // });
    
    return marker;
} 