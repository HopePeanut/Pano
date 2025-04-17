/**
 * 标签管理功能
 * 用于站点管理页面的标签管理功能
 */

// 等待文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 先加载标签管理HTML内容
    loadTagManagementHTML().then(() => {
        // 加载完成后初始化功能
        initTagManagement();
    });
});

/**
 * 加载标签管理HTML
 * @returns {Promise} 加载完成的Promise
 */
function loadTagManagementHTML() {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (document.getElementById('tag-management-modal')) {
            resolve();
            return;
        }

        // 创建容器
        const tagContainer = document.createElement('div');
        tagContainer.id = 'tag-management-container';
        
        // 加载HTML
        fetch('tag-management.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法加载标签管理HTML');
                }
                return response.text();
            })
            .then(html => {
                tagContainer.innerHTML = html;
                document.body.appendChild(tagContainer);
                resolve();
            })
            .catch(error => {
                console.error('加载标签管理HTML失败:', error);
                reject(error);
            });
    });
}

/**
 * 初始化标签管理功能
 */
function initTagManagement() {
    // 获取DOM元素
    const tagManageBtn = document.querySelector('.tag-manage-btn');
    const tagModal = document.getElementById('tag-management-modal');
    const closeTagModal = document.querySelector('.close-tag-modal');
    const addTagBtn = document.getElementById('add-tag-btn');
    const editTagModal = document.getElementById('edit-tag-modal');
    const closeEditTag = document.querySelector('.close-edit-tag');
    const cancelTagEdit = document.getElementById('cancel-tag-edit');
    const confirmTagEdit = document.getElementById('confirm-tag-edit');
    
    // 打开标签管理模态框
    if (tagManageBtn && tagModal) {
        tagManageBtn.addEventListener('click', function() {
            tagModal.style.display = 'block';
        });
    }
    
    // 关闭标签管理模态框
    if (closeTagModal && tagModal) {
        closeTagModal.addEventListener('click', function() {
            tagModal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (tagModal && event.target === tagModal) {
            tagModal.style.display = 'none';
        }
        if (editTagModal && event.target === editTagModal) {
            editTagModal.style.display = 'none';
        }
    });
    
    // 打开新增标签模态框
    if (addTagBtn && editTagModal) {
        addTagBtn.addEventListener('click', function() {
            const editTitle = document.querySelector('.edit-tag-title');
            if (editTitle) editTitle.textContent = '新增标签';
            
            const tagInput = document.getElementById('tag-name');
            if (tagInput) tagInput.value = '';
            
            const colorBox = document.querySelector('.color-box');
            const colorValue = document.querySelector('.color-value');
            if (colorBox) colorBox.style.backgroundColor = '#7DBE1C';
            if (colorValue) colorValue.textContent = '#7DBE1C';
            
            editTagModal.style.display = 'block';
        });
    }
    
    // 打开编辑标签模态框
    const tagEditBtns = document.querySelectorAll('.tag-edit-btn');
    if (tagEditBtns.length > 0 && editTagModal) {
        tagEditBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const tagName = row.cells[1].textContent;
                
                const editTitle = document.querySelector('.edit-tag-title');
                if (editTitle) editTitle.textContent = '编辑标签';
                
                const tagInput = document.getElementById('tag-name');
                if (tagInput) tagInput.value = tagName;
                
                editTagModal.style.display = 'block';
            });
        });
    }
    
    // 关闭编辑标签模态框
    if (closeEditTag && editTagModal) {
        closeEditTag.addEventListener('click', function() {
            editTagModal.style.display = 'none';
        });
    }
    
    if (cancelTagEdit && editTagModal) {
        cancelTagEdit.addEventListener('click', function() {
            editTagModal.style.display = 'none';
        });
    }
    
    // 保存标签信息
    if (confirmTagEdit && editTagModal) {
        confirmTagEdit.addEventListener('click', function() {
            const tagName = document.getElementById('tag-name');
            if (tagName && !tagName.value.trim()) {
                alert('标签名不能为空！');
                return;
            }
            
            alert('标签保存成功！');
            editTagModal.style.display = 'none';
            // 可以在此处添加刷新标签列表的逻辑
        });
    }
    
    // 删除标签
    const tagDeleteBtns = document.querySelectorAll('.tag-delete-btn');
    if (tagDeleteBtns.length > 0) {
        tagDeleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const tagName = row.cells[1].textContent;
                
                if (confirm(`确定要删除"${tagName}"标签吗？`)) {
                    alert(`标签"${tagName}"已删除`);
                    // 在实际应用中可以从表格中移除该行
                    // row.remove();
                }
            });
        });
    }
} 