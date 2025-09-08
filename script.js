document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const orgInput = document.getElementById('orgInput');
    const phoneInput = document.getElementById('phoneInput');
    const signInButton = document.getElementById('signInButton');
    const exportButton = document.getElementById('exportButton');
    const recordList = document.getElementById('recordList');
    const recordsCollection = db.collection('records');

    // 从 Firestore 实时加载并监听记录变化
    recordsCollection.orderBy('time', 'desc').onSnapshot(snapshot => {
        recordList.innerHTML = ''; // 清空现有列表
        snapshot.forEach(doc => {
            const record = doc.data();
            const li = document.createElement('li');
        
            const nameSpan = document.createElement('span');
            nameSpan.className = 'record-name';
            nameSpan.textContent = record.name;

            const orgSpan = document.createElement('span');
            orgSpan.className = 'record-org';
            orgSpan.textContent = record.organization;

            const phoneSpan = document.createElement('span');
            phoneSpan.className = 'record-phone';
            phoneSpan.textContent = record.phone;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'record-time';
            const time = record.time.toDate ? record.time.toDate().toLocaleString('zh-CN') : record.time;
            timeSpan.textContent = time;

            li.appendChild(nameSpan);
            li.appendChild(orgSpan);
            li.appendChild(phoneSpan);
            li.appendChild(timeSpan);
            recordList.appendChild(li);
        });
    });


    // 签到按钮点击事件
    signInButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const organization = orgInput.value.trim();
        const phone = phoneInput.value.trim();

        if (name === '' || organization === '' || phone === '') {
            alert('请填写所有签到信息！');
            return;
        }

        const now = new Date();
        const record = {
            name: name,
            organization: organization,
            phone: phone,
            time: firebase.firestore.Timestamp.fromDate(now) // 使用 Firestore 时间戳
        };

        recordsCollection.add(record).then(() => {
            console.log('签到成功！');
            nameInput.value = '';
            orgInput.value = '';
            phoneInput.value = '';
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
            csvContent += '姓名,单位,手机号,签到时间\n'; // CSV header

            snapshot.forEach(doc => {
                const record = doc.data();
                const time = record.time.toDate ? record.time.toDate().toLocaleString('zh-CN') : record.time;
                csvContent += `${record.name},${record.organization},${record.phone},"${time}"\n`;
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

