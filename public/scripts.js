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
    validateBtn.innerHTML = '验证中...';

    try {
        const response = await fetch('http://localhost:3000/api/validate-eori', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eori: eoriNumber })
        });

        const data = await response.json();

        if (response.ok) {
            // 显示结果
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