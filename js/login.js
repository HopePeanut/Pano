// 登录页面功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 密码显示/隐藏切换
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.querySelector('.login-btn');
    const rememberCheckbox = document.getElementById('remember');
    const loginForm = document.querySelector('.login-form');
    const wechatLogin = document.getElementById('wechat-login');
    const mobileLogin = document.getElementById('mobile-login');
    const registerLink = document.getElementById('register-link');
    const forgotPassword = document.getElementById('forgot-password');
    const loginTooltip = document.getElementById('login-tooltip');

    // 显示提示框函数
    function showLoginTooltip(title, message, type = 'success') {
        const tooltipTitle = loginTooltip.querySelector('.login-tooltip-title');
        const tooltipMessage = loginTooltip.querySelector('.login-tooltip-message');
        
        tooltipTitle.textContent = title;
        tooltipMessage.textContent = message;
        
        loginTooltip.className = 'login-tooltip';
        loginTooltip.classList.add(type);
        loginTooltip.classList.add('show');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            loginTooltip.classList.remove('show');
        }, 3000);
    }

    // 输入框获取焦点效果
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // 检查初始值
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // 密码可见性切换
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 更改图标
            if (type === 'password') {
                togglePassword.style.backgroundImage = "url('../images/eye-close.svg')";
            } else {
                togglePassword.style.backgroundImage = "url('../images/eye-open.svg')";
            }
            
            // 添加动画效果
            togglePassword.classList.add('active');
            setTimeout(() => {
                togglePassword.classList.remove('active');
            }, 300);
        });
    }

    // 记住账号功能
    if (rememberCheckbox && usernameInput) {
        // 检查是否有保存的用户名
        const savedUsername = localStorage.getItem('pano_username');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberCheckbox.checked = true;
            usernameInput.parentElement.classList.add('focused');
        }

        // 保存用户名到本地存储
        rememberCheckbox.addEventListener('change', function() {
            if (!this.checked) {
                localStorage.removeItem('pano_username');
            }
        });
    }

    // 输入验证函数
    function validateInput(input, errorMsg) {
        if (!input.value.trim()) {
            showError(input, errorMsg);
            return false;
        }
        removeError(input);
        return true;
    }

    // 显示错误消息
    function showError(input, message) {
        removeError(input); // 先移除已有的错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        input.parentElement.appendChild(errorDiv);
        input.parentElement.classList.add('error');
        
        // 动画效果
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }

    // 移除错误消息
    function removeError(input) {
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            input.parentElement.removeChild(errorDiv);
            input.parentElement.classList.remove('error');
        }
    }

    // 创建加载动画
    function createLoadingAnimation() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        
        loadingOverlay.appendChild(spinner);
        document.body.appendChild(loadingOverlay);
        
        return loadingOverlay;
    }

    // 登录按钮点击事件
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 验证用户名和密码
            const isUsernameValid = validateInput(usernameInput, '请输入用户名');
            const isPasswordValid = validateInput(passwordInput, '请输入密码');
            
            if (!isUsernameValid || !isPasswordValid) {
                return;
            }
            
            // 记住账号
            if (rememberCheckbox.checked) {
                localStorage.setItem('pano_username', usernameInput.value.trim());
            }
            
            // 禁用登录按钮，显示加载状态
            loginBtn.disabled = true;
            loginBtn.textContent = '登录中...';
            loginBtn.classList.add('loading');
            
            // 创建全屏加载动画
            const loadingOverlay = createLoadingAnimation();
            
            // 模拟登录请求
            console.log('登录请求:', {
                username: usernameInput.value.trim(), 
                password: passwordInput.value.trim()
            });
            
            // 这里应该有实际的登录API调用
            // 成功后跳转到系统入口页面
            setTimeout(function() {
                // 保存登录状态
                localStorage.setItem('pano_logged_in', 'true');
                localStorage.setItem('pano_user', JSON.stringify({
                    username: usernameInput.value.trim(),
                    role: '管理员',
                    lastLogin: new Date().toISOString()
                }));
                
                // 跳转到主页
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
    
    // 微信登录点击事件
    if (wechatLogin) {
        wechatLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginTooltip('功能提示', '微信登录功能正在开发中，敬请期待！', 'error');
        });
    }
    
    // 手机登录点击事件
    if (mobileLogin) {
        mobileLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginTooltip('功能提示', '手机登录功能正在开发中，敬请期待！', 'error');
        });
    }
    
    // 立即注册点击事件
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginTooltip('功能提示', '注册功能正在开发中，敬请期待！', 'error');
        });
    }
    
    // 忘记密码点击事件
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginTooltip('功能提示', '密码找回功能正在开发中，敬请期待！', 'error');
        });
    }
    
    // 添加回车键登录功能
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) {
            loginBtn.click();
        }
    });
    
    // 适配移动设备的特殊处理
    function checkMobile() {
        const loginContainer = document.querySelector('.login-container');
        if (window.innerWidth <= 768) {
            loginContainer.classList.add('mobile');
        } else {
            loginContainer.classList.remove('mobile');
        }
    }
    
    // 初始检查并添加窗口尺寸变化监听
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .form-group.focused label {
            transform: translateY(-20px);
            font-size: 12px;
            color: #39B49A;
        }
        
        .form-group.error input {
            border-color: #e74a3b;
        }
        
        .error-message {
            color: #e74a3b;
            font-size: 12px;
            margin-top: 5px;
            animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        .toggle-password.active {
            transform: scale(1.2);
        }
        
        .login-btn.loading {
            background-image: linear-gradient(45deg, #39B49A 25%, #2FA084 25%, #2FA084 50%, #39B49A 50%, #39B49A 75%, #2FA084 75%, #2FA084 100%);
            background-size: 20px 20px;
            animation: moveStripes 1s linear infinite;
        }
        
        @keyframes moveStripes {
            0% { background-position: 0 0; }
            100% { background-position: 20px 0; }
        }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(57, 180, 154, 0.3);
            border-radius: 50%;
            border-top-color: #39B49A;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .login-container.mobile .login-box {
            height: auto;
            max-height: none;
        }
    `;
    document.head.appendChild(style);
}); 