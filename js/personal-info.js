/**
 * 个人信息页面功能脚本
 * 实现个人基本信息的查看和编辑、密码修改、头像上传等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化个人信息页面
    initPersonalInfoPage();
});

/**
 * 初始化个人信息页面
 * 设置事件监听和加载初始数据
 */
function initPersonalInfoPage() {
    // 初始化基本信息编辑功能
    initBasicInfoEdit();
    
    // 初始化密码修改功能
    initPasswordEdit();
    
    // 初始化头像上传功能
    initAvatarUpload();
    
    // 初始化账号绑定功能
    initAccountBinding();
    
    // 初始化返回顶部按钮
    initBackToTop();
    
    // 初始化页内导航
    initPageNavigation();
    
    // 加载用户信息
    loadUserInfo();
}

/**
 * 初始化基本信息编辑功能
 */
function initBasicInfoEdit() {
    const editToggle = document.getElementById('basicInfoEditToggle');
    const cancelBtn = document.getElementById('basicInfoCancelBtn');
    const saveBtn = document.getElementById('basicInfoSaveBtn');
    const formButtons = document.querySelector('#basicInfoForm .form-buttons');
    const formInputs = document.querySelectorAll('#basicInfoForm .form-input');
    const mobileInput = document.getElementById('mobile');
    const verificationSpan = document.querySelector('.input-verification');
    
    // 原始表单数据，用于取消时恢复
    let originalFormData = {};
    
    // 点击编辑按钮
    if (editToggle) {
        editToggle.addEventListener('click', function() {
            // 保存原始数据
            formInputs.forEach(input => {
                originalFormData[input.id] = input.value;
            });
            
            // 启用表单输入
            formInputs.forEach(input => {
                // 保持用户名字段禁用（通常用户名不允许修改）
                if (input.id !== 'username') {
                    input.disabled = false;
                }
            });
            
            // 显示手机验证码按钮
            if (verificationSpan && mobileInput && !mobileInput.disabled) {
                verificationSpan.style.display = 'block';
            }
            
            // 显示表单按钮
            formButtons.style.display = 'flex';
            
            // 隐藏编辑按钮
            this.style.display = 'none';
        });
    }
    
    // 点击取消按钮
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // 恢复原始数据
            for (const id in originalFormData) {
                const input = document.getElementById(id);
                if (input) {
                    input.value = originalFormData[id];
                }
            }
            
            // 禁用表单输入
            formInputs.forEach(input => {
                input.disabled = true;
            });
            
            // 隐藏手机验证码按钮
            if (verificationSpan) {
                verificationSpan.style.display = 'none';
            }
            
            // 隐藏表单按钮
            formButtons.style.display = 'none';
            
            // 显示编辑按钮
            if (editToggle) {
                editToggle.style.display = 'flex';
            }
        });
    }
    
    // 发送验证码按钮点击事件
    const verificationBtn = document.querySelector('.verification-btn');
    if (verificationBtn) {
        verificationBtn.addEventListener('click', function() {
            const mobile = mobileInput ? mobileInput.value : '';
            if (mobile && /^1[3-9]\d{9}$/.test(mobile)) {
                // 模拟发送验证码
                this.disabled = true;
                let countdown = 60;
                this.textContent = `${countdown}秒后重新发送`;
                
                const timer = setInterval(() => {
                    countdown--;
                    this.textContent = `${countdown}秒后重新发送`;
                    
                    if (countdown <= 0) {
                        clearInterval(timer);
                        this.disabled = false;
                        this.textContent = '发送验证码';
                    }
                }, 1000);
                
                showTooltip('发送成功', '验证码已发送至您的手机', 'success');
            } else {
                showTooltip('发送失败', '请输入有效的手机号码', 'error');
            }
        });
    }
    
    // 保存表单数据
    const basicInfoForm = document.getElementById('basicInfoForm');
    if (basicInfoForm) {
        basicInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单验证
            if (!validateBasicInfoForm()) {
                return;
            }
            
            // 收集表单数据
            const formData = {
                realName: document.getElementById('realName').value,
                position: document.getElementById('position').value,
                department: document.getElementById('department').value,
                mobile: document.getElementById('mobile').value,
                email: document.getElementById('email').value
            };
            
            // 显示提交中状态
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 保存中...';
            
            // 模拟API提交
            setTimeout(() => {
                // 恢复按钮状态
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="bi bi-check2"></i> 保存';
                
                // 禁用表单输入
                formInputs.forEach(input => {
                    input.disabled = true;
                });
                
                // 隐藏手机验证码按钮
                if (verificationSpan) {
                    verificationSpan.style.display = 'none';
                }
                
                // 隐藏表单按钮
                formButtons.style.display = 'none';
                
                // 显示编辑按钮
                if (editToggle) {
                    editToggle.style.display = 'flex';
                }
                
                // 更新头像区域的用户名称
                document.querySelector('.avatar-name').textContent = formData.realName;
                
                // 显示成功提示
                showTooltip('修改成功', '个人信息已更新', 'success');
                
                console.log('保存基本信息:', formData);
            }, 1000);
        });
    }
}

/**
 * 验证基本信息表单
 * @returns {boolean} 验证是否通过
 */
function validateBasicInfoForm() {
    // 获取必填字段
    const realName = document.getElementById('realName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // 验证姓名
    if (!realName) {
        showTooltip('验证失败', '请输入姓名', 'error');
        return false;
    }
    
    // 验证手机号
    if (!mobile) {
        showTooltip('验证失败', '请输入手机号码', 'error');
        return false;
    }
    
    // 简单的手机号格式验证（中国大陆手机号）
    if (!/^1[3-9]\d{9}$/.test(mobile)) {
        showTooltip('验证失败', '请输入有效的手机号码', 'error');
        return false;
    }
    
    // 验证邮箱
    if (!email) {
        showTooltip('验证失败', '请输入邮箱地址', 'error');
        return false;
    }
    
    // 简单的邮箱格式验证
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showTooltip('验证失败', '请输入有效的邮箱地址', 'error');
        return false;
    }
    
    return true;
}

/**
 * 初始化密码修改功能
 */
function initPasswordEdit() {
    const editToggle = document.getElementById('securityEditToggle');
    const cancelBtn = document.getElementById('securityCancelBtn');
    const saveBtn = document.getElementById('securitySaveBtn');
    const securityForm = document.getElementById('securityForm');
    const securitySummary = document.querySelector('.security-summary');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthValue = passwordStrength ? passwordStrength.querySelector('.strength-value') : null;
    const strengthText = passwordStrength ? passwordStrength.querySelector('.strength-text') : null;
    
    // 初始化密码切换显示功能
    initPasswordToggle();
    
    // 点击编辑按钮
    if (editToggle) {
        editToggle.addEventListener('click', function() {
            // 显示修改密码表单
            if (securityForm) {
                securityForm.style.display = 'block';
            }
            
            // 隐藏安全信息摘要
            if (securitySummary) {
                securitySummary.style.display = 'none';
            }
            
            // 隐藏编辑按钮
            this.style.display = 'none';
        });
    }
    
    // 点击取消按钮
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // 重置表单
            if (securityForm) {
                securityForm.reset();
                securityForm.style.display = 'none';
            }
            
            // 显示安全信息摘要
            if (securitySummary) {
                securitySummary.style.display = 'flex';
            }
            
            // 显示编辑按钮
            if (editToggle) {
                editToggle.style.display = 'flex';
            }
            
            // 重置密码强度
            if (strengthValue) {
                strengthValue.style.width = '0%';
                strengthValue.className = 'strength-value';
            }
            if (strengthText) {
                strengthText.textContent = '密码强度：弱';
            }
        });
    }
    
    // 监听密码输入，实时更新密码强度
    if (newPasswordInput && strengthValue && strengthText) {
        newPasswordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            
            // 更新密码强度UI
            strengthValue.style.width = strength.percent + '%';
            strengthValue.className = 'strength-value ' + strength.level;
            strengthText.textContent = '密码强度：' + strength.text;
            
            // 检查两次密码输入是否一致
            if (confirmPasswordInput && confirmPasswordInput.value) {
                if (this.value !== confirmPasswordInput.value) {
                    confirmPasswordInput.classList.add('input-error');
                } else {
                    confirmPasswordInput.classList.remove('input-error');
                }
            }
        });
    }
    
    // 监听确认密码输入
    if (confirmPasswordInput && newPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== newPasswordInput.value) {
                this.classList.add('input-error');
            } else {
                this.classList.remove('input-error');
            }
        });
    }
    
    // 提交密码修改
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单验证
            if (!validatePasswordForm()) {
                return;
            }
            
            // 显示提交中状态
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 保存中...';
            }
            
            // 模拟API提交
            setTimeout(() => {
                // 恢复按钮状态
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="bi bi-check2"></i> 保存';
                }
                
                // 隐藏表单并重置
                securityForm.reset();
                securityForm.style.display = 'none';
                
                // 显示安全信息摘要
                if (securitySummary) {
                    securitySummary.style.display = 'flex';
                    
                    // 更新密码修改时间
                    const passwordTimeElem = securitySummary.querySelector('.security-item-desc');
                    if (passwordTimeElem) {
                        const now = new Date();
                        const dateStr = now.getFullYear() + '-' + 
                                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                      String(now.getDate()).padStart(2, '0');
                        passwordTimeElem.textContent = `上次修改时间：${dateStr}`;
                    }
                }
                
                // 显示编辑按钮
                if (editToggle) {
                    editToggle.style.display = 'flex';
                }
                
                // 重置密码强度
                if (strengthValue) {
                    strengthValue.style.width = '0%';
                    strengthValue.className = 'strength-value';
                }
                if (strengthText) {
                    strengthText.textContent = '密码强度：弱';
                }
                
                // 显示成功提示
                showTooltip('修改成功', '密码已更新，下次登录请使用新密码', 'success');
            }, 1000);
        });
    }
}

/**
 * 初始化密码显示切换功能
 */
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const inputId = this.getAttribute('data-for');
            const input = document.getElementById(inputId);
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('bi-eye-slash');
                    this.classList.add('bi-eye');
                } else {
                    input.type = 'password';
                    this.classList.remove('bi-eye');
                    this.classList.add('bi-eye-slash');
                }
            }
        });
    });
}

/**
 * 检查密码强度
 * @param {string} password - 密码
 * @returns {Object} 包含密码强度等级、百分比和文本描述
 */
function checkPasswordStrength(password) {
    if (!password) {
        return { level: '', percent: 0, text: '弱' };
    }
    
    let score = 0;
    
    // 长度检查
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // 包含小写字母
    if (/[a-z]/.test(password)) score += 10;
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 15;
    
    // 包含数字
    if (/[0-9]/.test(password)) score += 15;
    
    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    // 字符种类多样性
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 10); // 最多加10分
    
    // 确定强度等级
    let level = '';
    let text = '';
    
    if (score < 40) {
        level = '';
        text = '弱';
    } else if (score < 70) {
        level = 'medium';
        text = '中';
    } else {
        level = 'strong';
        text = '强';
    }
    
    return {
        level: level,
        percent: score,
        text: text
    };
}

/**
 * 验证密码修改表单
 * @returns {boolean} 验证是否通过
 */
function validatePasswordForm() {
    // 获取表单字段
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证当前密码
    if (!currentPassword) {
        showTooltip('验证失败', '请输入当前密码', 'error');
        return false;
    }
    
    // 验证新密码
    if (!newPassword) {
        showTooltip('验证失败', '请输入新密码', 'error');
        return false;
    }
    
    // 验证新密码强度（至少8位，包含字母和数字）
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        showTooltip('验证失败', '新密码至少8位，且必须包含字母和数字', 'error');
        return false;
    }
    
    // 验证确认密码
    if (newPassword !== confirmPassword) {
        showTooltip('验证失败', '两次输入的密码不一致', 'error');
        return false;
    }
    
    return true;
}

/**
 * 初始化头像上传功能
 */
function initAvatarUpload() {
    const avatarEdit = document.getElementById('avatarEdit');
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarImage = document.querySelector('.avatar-image');
    
    // 点击更换头像
    if (avatarEdit && avatarUpload) {
        avatarEdit.addEventListener('click', function() {
            avatarUpload.click();
        });
    }
    
    // 处理文件上传
    if (avatarUpload && avatarImage) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // 验证文件类型
                if (!file.type.startsWith('image/')) {
                    showTooltip('上传失败', '请选择图片文件', 'error');
                    return;
                }
                
                // 验证文件大小（最大2MB）
                if (file.size > 2 * 1024 * 1024) {
                    showTooltip('上传失败', '图片大小不能超过2MB', 'error');
                    return;
                }
                
                // 预览图片
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
                
                // 模拟上传过程
                showTooltip('上传中', '头像上传中，请稍候...', 'info');
                
                // 模拟API上传
                setTimeout(() => {
                    showTooltip('上传成功', '头像已更新', 'success');
                    
                    // 在实际项目中，这里应该发送文件到服务器
                    console.log('上传头像文件:', file.name);
                }, 1500);
            }
        });
    }
}

/**
 * 初始化账号绑定功能
 */
function initAccountBinding() {
    // 微信解绑按钮
    const wechatUnbindBtn = document.getElementById('wechatUnbind');
    if (wechatUnbindBtn) {
        wechatUnbindBtn.addEventListener('click', function() {
            // 确认解绑
            if (confirm('确定要解除微信绑定吗？')) {
                // 模拟API解绑
                showTooltip('处理中', '正在解除微信绑定...', 'info');
                
                setTimeout(() => {
                    // 获取微信绑定项
                    const bindingItem = this.closest('.binding-item');
                    if (bindingItem) {
                        const statusSpan = bindingItem.querySelector('.binding-status-text');
                        const accountSpan = bindingItem.querySelector('.binding-account');
                        
                        if (statusSpan) {
                            statusSpan.textContent = '未绑定';
                            statusSpan.classList.remove('bound');
                            statusSpan.classList.add('unbound');
                        }
                        
                        if (accountSpan) {
                            accountSpan.textContent = '';
                        }
                        
                        // 修改按钮文本和样式
                        this.textContent = '绑定微信';
                        this.classList.remove('unbind');
                        
                        // 修改事件处理
                        this.removeEventListener('click', arguments.callee);
                        this.addEventListener('click', function() {
                            showTooltip('提示', '请扫描二维码绑定微信', 'info');
                            // 这里可以显示二维码弹窗等
                        });
                    }
                    
                    showTooltip('解绑成功', '已解除微信绑定', 'success');
                }, 1000);
            }
        });
    }
    
    // 修改手机/邮箱按钮
    const modifyBtns = document.querySelectorAll('.binding-btn.modify');
    modifyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bindingItem = this.closest('.binding-item');
            const bindingType = bindingItem.querySelector('.binding-item-title').textContent;
            
            showTooltip('提示', `${bindingType}修改功能即将上线`, 'info');
        });
    });
}

/**
 * 加载用户信息
 * 在实际项目中，这里会从后端API获取数据
 */
function loadUserInfo() {
    // 这里模拟从服务器加载数据
    // 实际项目中应该是异步获取数据并填充表单
    
    // 假设数据已加载，这里不做任何实际操作
    console.log('用户信息已加载');
}

/**
 * 初始化返回顶部按钮
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    const container = document.querySelector('.personal-info-container');
    
    if (backToTopBtn && container) {
        // 监听容器滚动事件
        container.addEventListener('scroll', function() {
            // 当滚动超过300px时显示按钮
            if (container.scrollTop > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', function() {
            // 平滑滚动到顶部
            container.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * 初始化页内导航
 */
function initPageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const container = document.querySelector('.personal-info-container');
    const sections = document.querySelectorAll('.info-section[id]');
    
    if (navLinks.length && container && sections.length) {
        // 点击导航链接滚动到对应部分
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // 计算目标位置，考虑顶部固定元素的高度
                    const headerHeight = document.querySelector('.personal-info-header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 10;
                    
                    // 平滑滚动到目标位置
                    container.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // 显示目标部分，隐藏其他部分
                    sections.forEach(section => {
                        if (section.id === targetId) {
                            section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    });

                    // 更新导航链接活动状态
                    navLinks.forEach(navLink => {
                        if (navLink.getAttribute('href').substring(1) === targetId) {
                            navLink.classList.add('active');
                        } else {
                            navLink.classList.remove('active');
                        }
                    });
                }
            });
        });
        
        // 监听滚动事件，更新当前活动的导航项
        container.addEventListener('scroll', function() {
            // 获取当前滚动位置
            const scrollPosition = container.scrollTop;
            const headerHeight = document.querySelector('.personal-info-header').offsetHeight;
            
            // 确定当前可见的部分
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 20;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSectionId = section.id;
                }
            });
            
            // 更新导航激活状态
            navLinks.forEach(link => {
                const linkTarget = link.getAttribute('href').substring(1);
                
                if (linkTarget === currentSectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        });
        
        // 初始触发一次滚动事件，设置初始活动状态
        container.dispatchEvent(new Event('scroll'));

        // 默认显示第一个部分，隐藏其他部分
        if (sections.length > 0) {
            const firstSection = sections[0];
            sections.forEach(section => {
                if (section.id === firstSection.id) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    }
} 