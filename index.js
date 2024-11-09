 // 从本地存储获取玩家信息

 const playerInfo = JSON.parse(localStorage.getItem('playerInfo')) || {
    id: null,
    nickname: null,
    gameHistory: []
};

// 创建游戏历史容器并添加到页面

const historyContainer = document.createElement('div');
historyContainer.classList.add('history-container');
document.body.appendChild(historyContainer);


playerInfo.gameHistory.forEach((game, index) => {
    const historyItem = document.createElement('p');
    historyItem.classList.add('history-item');
    historyItem.textContent = `游戏 ${index + 1} - ${game.date}: ${game.result}`;
    historyContainer.appendChild(historyItem);
});

let dataCache;

async function loadData() {
    if (!dataCache) {
        const response = await fetch('data.txt');
        if (!response.ok) {
            throw new Error('无法加载数据文件。');
        }
        const data = await response.text();
        dataCache = data.split('\n');
    }
    return dataCache;
}

class TreasureMap {
    static async asgetInitialClue() {
        const data = await loadData();
        const caveInfo = data.find(line => line.startsWith('洞穴'));
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(  (caveInfo || '')+"在神秘的洞穴中找到了第一个线索...");
            }, 4000);
        });
    }

    static async asdecodeAncientScript(clue) {
        const data = await loadData();
        const castleInfo = data.find(line => line.startsWith('城堡'));
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!clue) {
                    reject("没有线索可以解码!");
                }
                resolve( "解码成功!宝藏在一座古老的城堡中..."+(castleInfo || '') );
            }, 6000);
        });
    }

    static async searchCastle(location) {
        const data1 = await loadData();
        const guardInfo = data1.find(line => line.startsWith('城堡守卫'));
        const data2 = await loadData();
        const treasureInfo = data2.find(line => line.startsWith('宝箱'));
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const random = Math.random();
                if (random < 0.4) {
                    reject( (guardInfo || '')+"糟糕!遇到了城堡守卫，被抓住..." );
                }
                resolve("找到了一个华丽的箱子..."+(treasureInfo || ''));
            }, 6000);
        });
    }

    static openTreasureBox() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("太棒了!任务成功！你找到了传奇宝藏!");
            }, 5000);
        });
    }
}

async function findTreasureWithPromises(button) {
    button.disabled = true;
    document.querySelectorAll('.result').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
        el.parentElement.querySelector('img').classList.add('hidden');
    });
    let originalBackground = document.body.style.backgroundImage;
    try {
        const clue = await TreasureMap.asgetInitialClue();
        showResult('#result1', clue);

        const location = await TreasureMap.asdecodeAncientScript(clue);
        if (location.includes("城堡")) {
            document.body.style.backgroundImage = "url('古老城堡.png')";
        }
        showResult('#result1', location);
        const box = await TreasureMap.searchCastle(location);
        showResult('#result2', box);
        document.querySelector('#result2').parentElement.querySelector('img').classList.remove('hidden');
        const treasure = await TreasureMap.openTreasureBox();
        showResult('#result2', treasure);
        document.getElementById('successAudio').play();

        // 存储游戏历史
        playerInfo.gameHistory.push({
            date: new Date().toLocaleString(),
            result: '成功找到宝藏'
        });
        localStorage.setItem('playerInfo', JSON.stringify(playerInfo));


    } catch (error) {
        showResult('#result3', "任务失败: " + error);
        document.querySelector('#result3').parentElement.querySelector('img').classList.remove('hidden');
        document.getElementById('failAudio').play();

        // 存储游戏历史
        playerInfo.gameHistory.push({
            date: new Date().toLocaleString(),
            result: '任务失败，原因：遇到城堡守卫' 
        });
        localStorage.setItem('playerInfo', JSON.stringify(playerInfo));

    } finally {
        setTimeout(() => {
            button.disabled = false;
            document.querySelectorAll('.result').forEach(el => {
                el.textContent = '';
                el.classList.add('hidden');
                el.parentElement.querySelector('img').classList.add('hidden');
            });
            document.querySelector('.container2 img').classList.add('hidden');
            document.querySelector('.container3 img').classList.add('hidden');
            document.body.style.backgroundImage = originalBackground;
        }, 9000);

    }
}

function showResult(selector, text) {
    const el = document.querySelector(selector);
    el.textContent = text;
    setTimeout(() => {
        el.classList.remove('hidden');
        el.parentElement.querySelector('img').classList.remove('hidden');
    }, 50);
}