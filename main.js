window.onload = function () {
    'use strict';

    // Эта строка пытается найти csInterface в родительском окне (загрузчике)
// и, если не находит, создает новый для отладки в браузере.
const csInterface = window.parent.csInterface || new CSInterface();
    // ВАША ПРАВИЛЬНАЯ ССЫЛКА!
    const scriptURL = 'http://raw.githubusercontent.com/kvmotion/my-ae-scripts/refs/heads/main/main.jsx';
    let scriptContent = '';

    const runBtn = document.getElementById('runScript');
    const refreshBtn = document.getElementById('refreshScript');
    const statusDiv = document.getElementById('status');

    function fetchScript() {
        statusDiv.textContent = 'Загрузка с GitHub...';
        runBtn.disabled = true;
        refreshBtn.disabled = true;

        // Параметр для сброса кэша и заголовки - это всё еще хорошая практика, так что оставим их
        const cacheBustingURL = scriptURL + '?t=' + new Date().getTime();

        fetch(cacheBustingURL, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'Pragma': 'no-cache',
              'Expires': '0',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status + ' ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            scriptContent = data;
            statusDiv.textContent = 'Скрипт успешно загружен!';
            runBtn.disabled = false;
            refreshBtn.disabled = false;
        })
        .catch(error => {
            statusDiv.textContent = 'Ошибка: ' + error.message;
            console.error('Fetch error:', error);
            refreshBtn.disabled = false; // Позволяем попробовать еще раз
        });
    }

    // Кнопка "Выполнить"
    runBtn.addEventListener('click', function () {
        if (scriptContent) {
            csInterface.evalScript(scriptContent);
        } else {
            statusDiv.textContent = 'Скрипт еще не загружен. Нажмите "Обновить".';
        }
    });

    // Кнопка "Обновить"
    refreshBtn.addEventListener('click', function () {
        fetchScript();
    });

    // Первоначальная загрузка при открытии панели
    fetchScript();
};
