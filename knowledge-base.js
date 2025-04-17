// 清安知识库页面脚本

/**
 * 初始化导航栏
 * 设置导航栏的选中状态和交互事件
 */
function initializeNavbar() {
    // 模拟导航栏选中状态
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === '#knowledge-base') {
            link.classList.add('active');
        }
    });
}

// Vue应用 - 知识库系统
new Vue({
    el: '#knowledge-app',
    data: {
        // 智能问答区
        userInput: '',             // 用户输入的问题
        conversation: [],          // 消息记录
        isAssistantTyping: false,  // 是否显示打字中状态
        showTagSelector: false,    // 是否显示标签选择器
        selectedTags: [],          // 已选择的标签
        
        // 标签分类
        deviceTags: ['EMS', 'BMS', 'PCS', '热管理系统', '消防系统'],
        faultTags: ['电压异常', '温度过高', '通信中断', '数据丢失', '过载保护'],
        
        // 知识投喂区
        showUploadModal: false,    // 是否显示上传模态框
        showAddKnowledgeModal: false, // 是否显示手动录入模态框
        uploadedFile: null,        // 已上传的文件
        isDragging: false,         // 是否在拖拽文件
        expandedItems: [],         // 展开的知识条目索引集合
        showHistory: false,        // 历史记录是否显示
        
        // 上传文件相关
        uploadTags: [],
        tagInput: '',
        
        // 手动录入表单
        newKnowledge: {
            title: '',
            content: '',
            tags: []
        },
        knowledgeTagInput: '',
        
        // 模拟数据
        recentKnowledge: [],       // 最近知识条目
        historyKnowledge: []       // 历史知识条目
    },
    computed: {
        isNewKnowledgeValid() {
            return this.newKnowledge.title && this.newKnowledge.content;
        }
    },
    methods: {
        /**
         * 发送消息
         * 将用户输入的问题添加到消息列表，并模拟AI助手的回复
         */
        sendMessage() {
            if (!this.userInput.trim() || this.isAssistantTyping) return;
            
            // 添加用户消息
            this.conversation.push({
                sender: 'user',
                text: this.userInput,
                tags: this.selectedTags,
                time: new Date().toLocaleTimeString()
            });
            
            // 清空输入框并关闭标签选择器
            const userInput = this.userInput;
            this.userInput = '';
            this.showTagSelector = false;
            this.selectedTags = [];
            
            // 滚动到底部
            this.$nextTick(() => {
                this.scrollToBottom();
            });
            
            // 显示打字中状态
            this.isAssistantTyping = true;
            
            // 模拟AI助手回复（延迟显示）
            setTimeout(() => {
                this.isAssistantTyping = false;
                
                // 根据用户输入生成回复
                const reply = this.generateReply(userInput);
                
                this.conversation.push({
                    sender: 'assistant',
                    text: reply.content,
                    tags: reply.tags,
                    sources: reply.sources,
                    time: new Date().toLocaleTimeString()
                });
                
                // 滚动到底部
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }, 1500);
        },
        
        /**
         * 生成回复内容
         * 根据用户输入生成模拟的AI助手回复
         * @param {string} input - 用户输入的问题
         * @returns {Object} - 包含回复内容、标签和来源的对象
         */
        generateReply(input) {
            // 模拟回复集合（用于演示）
            const replies = [
                {
                    keywords: ['变电站', '检修'],
                    content: `<p>变电站设备检修应遵循以下流程：</p>
                    <ol>
                        <li>制定详细的检修计划，包括检修时间、内容和人员安排</li>
                        <li>实施安全措施，确保设备断电并悬挂警示标志</li>
                        <li>按照设备检修规程进行检查和维护</li>
                        <li>完成检修后进行功能测试</li>
                        <li>填写检修记录并归档</li>
                    </ol>
                    <p>在检修过程中需特别注意人身安全和设备安全，务必按照《变电站设备检修安全规程》进行操作。</p>`,
                    tags: ['设备维护', '变电站', '安全规程'],
                    sources: [
                        { title: '变电站设备检修手册', type: 'document' },
                        { title: '变电站安全操作规程', type: 'document' }
                    ]
                },
                {
                    keywords: ['智能电网', '优势'],
                    content: `<p>智能电网相比传统电网具有以下优势：</p>
                    <ul>
                        <li><strong>自愈能力：</strong>能够自动检测、分析并响应电网中的问题</li>
                        <li><strong>提高可靠性：</strong>通过先进的监控和控制系统，减少停电时间和范围</li>
                        <li><strong>提高效率：</strong>优化电力流动，减少线损和能源浪费</li>
                        <li><strong>支持可再生能源接入：</strong>灵活应对分布式能源的并网需求</li>
                        <li><strong>支持需求侧响应：</strong>通过价格信号和负荷管理优化用电行为</li>
                    </ul>
                    <p>根据清安能源研究院的数据，智能电网能够将系统效率提升15-20%，同时减少30%的停电时间。</p>`,
                    tags: ['智能电网', '清洁能源', '电力系统'],
                    sources: [
                        { title: '智能电网白皮书', type: 'document' },
                        { title: '清安能源研究院报告', type: 'research' }
                    ]
                },
                {
                    keywords: ['故障', '诊断', '系统'],
                    content: `<p>清安智能故障诊断系统采用了以下技术：</p>
                    <ol>
                        <li><strong>多源数据融合：</strong>整合设备运行数据、历史故障数据和环境数据</li>
                        <li><strong>深度学习算法：</strong>通过神经网络模型识别复杂故障模式</li>
                        <li><strong>专家系统：</strong>结合领域专家知识构建故障决策树</li>
                        <li><strong>实时监测：</strong>24小时不间断监控设备状态</li>
                    </ol>
                    <p>当系统检测到异常时，会自动分析故障原因并给出处理建议，同时将信息推送给相关人员。</p>
                    <p>根据使用统计，该系统能够提前预警85%的潜在故障，平均减少停机时间4.5小时。</p>`,
                    tags: ['故障检测', '数据分析', '智能系统'],
                    sources: [
                        { title: '清安故障诊断系统使用手册', type: 'manual' },
                        { title: '设备故障案例库', type: 'database' }
                    ]
                },
                {
                    keywords: ['维护', '计划', '周期'],
                    content: `<p>制定设备维护计划需要考虑以下因素：</p>
                    <ul>
                        <li>设备制造商建议的维护周期</li>
                        <li>设备运行环境和负载情况</li>
                        <li>历史故障数据分析结果</li>
                        <li>设备重要性和影响范围</li>
                        <li>维护资源的可用性</li>
                    </ul>
                    <p>对于关键设备，建议采用三级维护策略：</p>
                    <ol>
                        <li><strong>日常巡检：</strong>每周1-2次</li>
                        <li><strong>一级维护：</strong>每月1次，包括基础检查和测试</li>
                        <li><strong>二级维护：</strong>每季度1次，包括详细检查和部件维护</li>
                        <li><strong>三级维护：</strong>每年1次，包括全面检修和性能测试</li>
                    </ol>
                    <p>同时，建议结合预测性维护技术，基于设备实时状态调整维护计划。</p>`,
                    tags: ['设备维护', '维护计划', '预测性维护'],
                    sources: [
                        { title: '设备维护管理手册', type: 'document' },
                        { title: '预测性维护最佳实践', type: 'article' }
                    ]
                },
                {
                    keywords: ['能源', '效率', '提升'],
                    content: `<p>提升能源利用效率的主要方法包括：</p>
                    <ul>
                        <li><strong>设备更新换代：</strong>用高效设备替代老旧低效设备</li>
                        <li><strong>能源管理系统：</strong>实时监控和优化能源使用</li>
                        <li><strong>需求侧响应：</strong>在高峰时段调整负荷，平衡供需</li>
                        <li><strong>余热回收利用：</strong>将生产过程中的废热转化为有用能源</li>
                        <li><strong>分布式能源：</strong>在用能侧就近发电，减少传输损耗</li>
                    </ul>
                    <p>根据清安案例库数据，实施综合能效提升项目平均可降低能耗20-30%，投资回收期一般在2-4年。</p>`,
                    tags: ['能源效率', '节能技术', '能源管理'],
                    sources: [
                        { title: '工业能效提升指南', type: 'guide' },
                        { title: '清安能源管理案例集', type: 'case-study' }
                    ]
                }
            ];
            
            // 默认通用回复
            let defaultReply = {
                content: `<p>感谢您的提问。根据我的知识库，您询问的内容暂时没有特定的匹配信息。</p>
                <p>我可以为您提供以下几个相关方向的参考：</p>
                <ul>
                    <li>查阅《清安能源系统操作手册》获取基础操作指导</li>
                    <li>浏览"清安知识库"中的相关技术文档</li>
                    <li>联系技术支持团队获取专业帮助</li>
                </ul>
                <p>您也可以尝试重新表述问题，或者提供更多细节，以便我能更准确地回答。</p>`,
                tags: ['一般咨询'],
                sources: [
                    { title: '清安知识库', type: 'knowledge-base' }
                ]
            };
            
            // 查找匹配的回复
            for (const reply of replies) {
                if (reply.keywords.some(keyword => input.toLowerCase().includes(keyword.toLowerCase()))) {
                    return reply;
                }
            }
            
            return defaultReply;
        },
        
        /**
         * 渲染Markdown内容
         * @param {string} text - Markdown格式的文本
         * @returns {string} - 渲染后的HTML
         */
        renderMarkdown(text) {
            if(!text) return '';
            return marked.parse(text);
        },
        
        /**
         * 滚动到聊天区域底部
         */
        scrollToBottom() {
            const chatContent = this.$refs.chatContent;
            if (chatContent) {
                chatContent.scrollTop = chatContent.scrollHeight;
            }
        },
        
        /**
         * 清空对话
         */
        clearConversation() {
            this.conversation = [];
            // 添加系统消息
            this.conversation.push({
                sender: 'system',
                text: '对话已清空。您可以开始新的对话。',
                time: new Date().toLocaleTimeString()
            });
        },
        
        /**
         * 切换标签
         * @param {string} tag - 标签名称
         */
        toggleTag(tag) {
            const index = this.selectedTags.indexOf(tag);
            if (index === -1) {
                this.selectedTags.push(tag);
            } else {
                this.selectedTags.splice(index, 1);
            }
        },
        
        /**
         * 触发图片上传点击事件
         */
        triggerImageUpload() {
            this.$refs.imageUpload.click();
        },
        
        /**
         * 处理图片上传
         * @param {Event} event - 文件上传事件对象
         */
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.userInput += `\n[上传的图片]`;
                    // 可以将图片数据保存起来，这里简化处理
                };
                reader.readAsDataURL(file);
            }
        },
        
        /**
         * 获取文件图标
         * @param {string} type - 文件类型
         * @returns {string} - 对应的Font Awesome图标类
         */
        getFileIcon(type) {
            switch (type) {
                case 'pdf':
                    return 'fas fa-file-pdf';
                case 'doc':
                case 'docx':
                    return 'fas fa-file-word';
                case 'md':
                    return 'fas fa-file-alt';
                case 'manual':
                    return 'fas fa-book';
                case 'guide':
                    return 'fas fa-compass';
                case 'article':
                    return 'fas fa-newspaper';
                default:
                    return 'fas fa-file';
            }
        },
        
        /**
         * 获取状态类名
         * @param {string} status - 状态
         * @returns {string} - 对应的CSS类名
         */
        getStatusClass(status) {
            switch (status) {
                case 'completed':
                    return 'status-success';
                case 'processing':
                    return 'status-processing';
                case 'failed':
                    return 'status-failed';
                default:
                    return '';
            }
        },
        
        /**
         * 获取状态文本
         * @param {string} status - 状态
         * @returns {string} - 对应的状态文本
         */
        getStatusText(status) {
            switch (status) {
                case 'completed':
                    return '已完成';
                case 'processing':
                    return '处理中';
                case 'failed':
                    return '失败';
                default:
                    return status;
            }
        },
        
        /**
         * 切换知识条目展开状态
         * @param {number} index - 知识条目索引
         */
        toggleKnowledgeItem(index) {
            if (this.expandedItems.includes(index)) {
                this.expandedItems = this.expandedItems.filter(i => i !== index);
            } else {
                this.expandedItems.push(index);
            }
        },
        
        /**
         * 重新处理知识
         * @param {number} id - 知识条目ID
         */
        reprocessKnowledge(id) {
            // 模拟处理逻辑
            alert('重新处理知识：' + id);
        },
        
        /**
         * 删除知识
         * @param {number} id - 知识条目ID
         */
        deleteKnowledge(id) {
            // 模拟删除逻辑
            if (confirm('确定要删除这条知识吗？')) {
                this.recentKnowledge = this.recentKnowledge.filter(item => item.id !== id);
                this.historyKnowledge = this.historyKnowledge.filter(item => item.id !== id);
            }
        },
        
        /**
         * 触发文件上传
         */
        triggerFileUpload() {
            this.$refs.fileUpload.click();
        },
        
        /**
         * 处理文件选择
         * @param {Event} event - 文件选择事件
         */
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                this.uploadedFile = {
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    type: this.getFileTypeFromName(file.name)
                };
            }
        },
        
        /**
         * 从文件名获取文件类型
         * @param {string} filename - 文件名
         * @returns {string} - 文件类型
         */
        getFileTypeFromName(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            return ext;
        },
        
        /**
         * 格式化文件大小
         * @param {number} bytes - 文件字节大小
         * @returns {string} - 格式化后的文件大小
         */
        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(1) + ' MB';
        },
        
        /**
         * 处理文件拖放
         * @param {Event} event - 拖放事件
         */
        handleFileDrop(event) {
            event.preventDefault();
            this.isDragging = false;
            
            const file = event.dataTransfer.files[0];
            if (file) {
                this.uploadedFile = {
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    type: this.getFileTypeFromName(file.name)
                };
            }
        },
        
        /**
         * 清除已上传文件
         */
        clearUploadedFile() {
            this.uploadedFile = null;
            if (this.$refs.fileUpload) {
                this.$refs.fileUpload.value = '';
            }
        },
        
        /**
         * 添加上传标签
         */
        addUploadTag() {
            if (this.tagInput.trim() && !this.uploadTags.includes(this.tagInput.trim())) {
                this.uploadTags.push(this.tagInput.trim());
                this.tagInput = '';
            }
        },
        
        /**
         * 移除上传标签
         * @param {string} tag - 标签
         */
        removeUploadTag(tag) {
            this.uploadTags = this.uploadTags.filter(t => t !== tag);
        },
        
        /**
         * 上传文档
         */
        uploadDocument() {
            if (!this.uploadedFile) return;
            
            // 模拟上传处理
            const newItem = {
                id: Date.now(),
                title: this.uploadedFile.name,
                type: this.uploadedFile.type,
                size: this.uploadedFile.size,
                status: 'processing',
                time: new Date().toLocaleString(),
                tags: this.uploadTags.length > 0 ? [...this.uploadTags] : ['自动标记']
            };
            
            this.recentKnowledge.unshift(newItem);
            this.showUploadModal = false;
            this.uploadedFile = null;
            this.uploadTags = [];
            
            // 模拟处理完成
            setTimeout(() => {
                const index = this.recentKnowledge.findIndex(item => item.id === newItem.id);
                if (index !== -1) {
                    this.recentKnowledge[index].status = 'completed';
                }
            }, 3000);
        },
        
        /**
         * 添加知识标签
         */
        addKnowledgeTag() {
            if (this.knowledgeTagInput.trim() && !this.newKnowledge.tags.includes(this.knowledgeTagInput.trim())) {
                this.newKnowledge.tags.push(this.knowledgeTagInput.trim());
                this.knowledgeTagInput = '';
            }
        },
        
        /**
         * 移除知识标签
         * @param {string} tag - 标签
         */
        removeKnowledgeTag(tag) {
            this.newKnowledge.tags = this.newKnowledge.tags.filter(t => t !== tag);
        },
        
        /**
         * 添加新知识
         */
        addNewKnowledge() {
            if (!this.isNewKnowledgeValid) return;
            
            const newItem = {
                id: Date.now(),
                title: this.newKnowledge.title,
                description: this.newKnowledge.content.substring(0, 100) + (this.newKnowledge.content.length > 100 ? '...' : ''),
                type: 'manual',
                status: 'completed',
                time: new Date().toLocaleString(),
                tags: this.newKnowledge.tags.length > 0 ? [...this.newKnowledge.tags] : ['手动录入']
            };
            
            this.recentKnowledge.unshift(newItem);
            this.showAddKnowledgeModal = false;
            
            // 重置表单
            this.newKnowledge = {
                title: '',
                content: '',
                tags: []
            };
            this.knowledgeTagInput = '';
        },
        
        /**
         * 初始化示例数据
         */
        initializeExampleData() {
            // 初始化示例对话
            this.conversation = [
                {
                    sender: 'system',
                    text: '欢迎使用清安知识库！您可以向我询问任何关于设备、维护和故障处理的问题。',
                    time: new Date().toLocaleTimeString()
                }
            ];
            
            // 初始化示例知识条目
            const recent = [
                {
                    id: 1,
                    title: '变电站设备检修手册',
                    type: 'pdf',
                    size: '2.5 MB',
                    status: 'completed',
                    time: '2023-05-15 14:30',
                    tags: ['设备维护', '变电站', '安全规程']
                },
                {
                    id: 2,
                    title: '智能电网技术白皮书',
                    type: 'docx',
                    size: '1.8 MB',
                    status: 'completed',
                    time: '2023-05-14 09:15',
                    tags: ['智能电网', '技术报告']
                },
                {
                    id: 3,
                    title: '配电网故障诊断指南',
                    type: 'pdf',
                    size: '3.2 MB',
                    status: 'processing',
                    time: '2023-05-13 16:45',
                    tags: ['故障诊断', '配电网']
                }
            ];
            
            const history = [
                {
                    id: 4,
                    title: '清洁能源发展趋势报告',
                    type: 'pdf',
                    size: '4.1 MB',
                    status: 'completed',
                    time: '2023-04-28 10:20',
                    tags: ['清洁能源', '趋势分析']
                },
                {
                    id: 5,
                    title: '能源管理系统操作手册',
                    type: 'docx',
                    size: '1.4 MB',
                    status: 'completed',
                    time: '2023-04-15 11:30',
                    tags: ['能源管理', '操作手册']
                }
            ];
            
            this.recentKnowledge = recent;
            this.historyKnowledge = history;
        }
    },
    mounted() {
        // 初始化示例数据
        this.initializeExampleData();
        
        // 自动聚焦到输入框
        this.$nextTick(() => {
            if (this.$refs.messageInput) {
                this.$refs.messageInput.focus();
            }
        });
    }
});

// 等待DOM加载完成后初始化导航栏
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
}); 