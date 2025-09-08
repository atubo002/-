document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const signInButton = document.getElementById('signInButton');
    const exportButton = document.getElementById('exportButton');
    const recordList = document.getElementById('recordList');

    // 从 localStorage 加载记录
    const loadRecords = () => {
        const records = JSON.parse(localStorage.getItem('signInRecords')) || [];
        recordList.innerHTML = '';
        records.forEach(record => {
            addRecordToList(record);
        });
    };

    // 将记录添加到列表
    const addRecordToList = (record) => {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'record-name';
        nameSpan.textContent = record.name;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'record-time';
        timeSpan.textContent = record.time;

        li.appendChild(nameSpan);
        li.appendChild(timeSpan);
        recordList.appendChild(li);
    };

    // 签到按钮点击事件
    signInButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name === '') {
            alert('请输入您的姓名！');
            return;
        }

        const now = new Date();
        const record = {
            name: name,
            time: now.toLocaleString('zh-CN')
        };

        const records = JSON.parse(localStorage.getItem('signInRecords')) || [];
        records.push(record);
        localStorage.setItem('signInRecords', JSON.stringify(records));

        addRecordToList(record);
        nameInput.value = '';
    });

    // 导出为 CSV
    exportButton.addEventListener('click', () => {
        const records = JSON.parse(localStorage.getItem('signInRecords')) || [];
        if (records.length === 0) {
            alert('没有签到记录可导出。');
            return;
        }

        let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // 添加 BOM 以支持 Excel
        csvContent += '姓名,签到时间\n'; // CSV header

        records.forEach(record => {
            csvContent += `${record.name},"${record.time}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'signin_records.csv');
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    });

    // 初始加载
    loadRecords();
});
