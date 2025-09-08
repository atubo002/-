document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const signInButton = document.getElementById('signInButton');
    const exportButton = document.getElementById('exportButton');
    const recordList = document.getElementById('recordList');
    const recordsCollection = db.collection('records');

    // 将记录添加到列表
    const addRecordToList = (record) => {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'record-name';
        nameSpan.textContent = record.name;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'record-time';
        // Firestore 时间戳需要转换
        const time = record.time.toDate ? record.time.toDate().toLocaleString('zh-CN') : record.time;
        timeSpan.textContent = time;

        li.appendChild(nameSpan);
        li.appendChild(timeSpan);
        // 将新记录添加到列表顶部
        recordList.prepend(li);
    };

    // 从 Firestore 实时加载并监听记录变化
    recordsCollection.orderBy('time', 'desc').onSnapshot(snapshot => {
        recordList.innerHTML = ''; // 清空现有列表
        snapshot.forEach(doc => {
            const record = doc.data();
            const li = document.createElement('li');
        
            const nameSpan = document.createElement('span');
            nameSpan.className = 'record-name';
            nameSpan.textContent = record.name;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'record-time';
            const time = record.time.toDate ? record.time.toDate().toLocaleString('zh-CN') : record.time;
            timeSpan.textContent = time;

            li.appendChild(nameSpan);
            li.appendChild(timeSpan);
            recordList.appendChild(li);
        });
    });


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
            time: firebase.firestore.Timestamp.fromDate(now) // 使用 Firestore 时间戳
        };

        recordsCollection.add(record).then(() => {
            console.log('签到成功！');
            nameInput.value = '';
        }).catch(error => {
            console.error('签到失败: ', error);
            alert('签到失败，请检查网络或稍后重试。');
        });
    });

    // 导出为 CSV
    exportButton.addEventListener('click', () => {
        recordsCollection.orderBy('time', 'asc').get().then(snapshot => {
            if (snapshot.empty) {
                alert('没有签到记录可导出。');
                return;
            }

            let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // 添加 BOM 以支持 Excel
            csvContent += '姓名,签到时间\n'; // CSV header

            snapshot.forEach(doc => {
                const record = doc.data();
                const time = record.time.toDate ? record.time.toDate().toLocaleString('zh-CN') : record.time;
                csvContent += `${record.name},"${time}"\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'signin_records.csv');
            document.body.appendChild(link);

            link.click();
            document.body.removeChild(link);

        }).catch(error => {
            console.error("导出失败: ", error);
            alert('导出失败，请稍后重试。');
        });
    });
});

