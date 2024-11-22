async function validateEORI() {
    const eoriNumber = document.getElementById('eoriInput').value.trim();
    const validateBtn = document.getElementById('validateBtn');
    const resultArea = document.getElementById('resultArea');

    if (!eoriNumber) {
        alert('请输入 EORI 号码');
        return;
    }

    // 显示加载状态
    validateBtn.disabled = true;
    validateBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        验证中...
    `;

    try {
        const response = await fetch('/api/validate-eori', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eori: eoriNumber })
        });

        const data = await response.json();

        if (response.ok) {
            // 显示结果区域
            resultArea.classList.remove('hidden');
            
            // 更新结果显示
            document.getElementById('eoriNumber').textContent = data.eori || '-';
            document.getElementById('status').textContent = getStatusText(data.status);
            document.getElementById('name').textContent = data.name || '-';
            document.getElementById('address').textContent = 
                [data.street, data.address].filter(Boolean).join(', ') || '-';
            document.getElementById('postalCode').textContent = data.postalCode || '-';
            document.getElementById('city').textContent = data.city || '-';
            document.getElementById('country').textContent = data.country || '-';

            // 设置状态样式
            const statusText = document.getElementById('statusText');
            if (data.status === 1) {
                statusText.className = 'text-green-600 font-semibold';
                statusText.textContent = '✓ EORI 号码有效';
            } else {
                statusText.className = 'text-red-600 font-semibold';
                statusText.textContent = '✗ EORI 号码无效';
            }

            // 添加复制按钮
            addCopyButtons();
        } else {
            throw new Error(data.error || '验证失败');
        }

    } catch (error) {
        console.error('验证失败:', error);
        alert(error.message || '验证失败，请稍后重试');
    } finally {
        validateBtn.disabled = false;
        validateBtn.innerHTML = '验证';
    }
}

// 状态文本转换
function getStatusText(status) {
    switch (status) {
        case 1:
            return '有效';
        case 0:
            return '无效';
        default:
            return '未知';
    }
}

// 添加复制功能
function addCopyButtons() {
    const fields = ['eoriNumber', 'name', 'address', 'postalCode', 'city', 'country'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        const text = element.textContent;
        addCopyButton(element, text);
    });
}

function addCopyButton(element, text) {
    const existingButton = element.querySelector('button');
    if (existingButton) {
        existingButton.remove();
    }

    const button = document.createElement('button');
    button.className = 'ml-2 text-blue-600 hover:text-blue-800';
    button.innerHTML = '<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
    button.onclick = async () => {
        await navigator.clipboard.writeText(text);
        showSuccess('已复制到剪贴板');
    };
    element.appendChild(button);
}

// 提示信息
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded transform transition-transform duration-300 ease-in-out z-50';
    successDiv.innerHTML = `
        <strong class="font-bold">成功！</strong>
        <span class="block sm:inline">${message}</span>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.style.transform = 'translateX(120%)', 2500);
    setTimeout(() => successDiv.remove(), 3000);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'eoriInput') {
        validateEORI();
    }
});