async function validateEORI() {
    const eoriNumber = document.getElementById('eoriInput').value.trim();
    const validateBtn = document.getElementById('validateBtn');
    const resultArea = document.getElementById('resultArea');

    if (!eoriNumber) {
        alert('请输入 EORI 号码');
        return;
    }

    validateBtn.disabled = true;
    validateBtn.innerHTML = '验证中...';

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
            resultArea.classList.remove('hidden');
            
            document.getElementById('eoriNumber').textContent = data.eori || '-';
            document.getElementById('status').textContent = getStatusText(data.status);
            document.getElementById('name').textContent = data.name || '-';
            document.getElementById('address').textContent = 
                [data.street, data.address].filter(Boolean).join(', ') || '-';
            document.getElementById('postalCode').textContent = data.postalCode || '-';
            document.getElementById('city').textContent = data.city || '-';
            document.getElementById('country').textContent = data.country || '-';

            const statusText = document.getElementById('statusText');
            if (data.status === 1 || data.statusDescr === 'Valid') {
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
    if (status === 1 || status === '1') {
        return '有效';
    } else if (status === 0 || status === '0') {
        return '无效';
    }
    return '未知';
}