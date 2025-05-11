document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.Telegram === 'undefined' || typeof window.Telegram.WebApp === 'undefined') {
        console.error("Telegram WebApp API не найдено!");
        document.getElementById('status-message').textContent = 'Ошибка: Приложение должно быть открыто внутри Telegram.';
        return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready(); // Сообщаем Telegram, что WebApp загрузился
    tg.expand(); // Растягиваем WebApp на весь экран

    // Элементы DOM
    const asksTableBody = document.getElementById('asks-table-body');
    const bidsTableBody = document.getElementById('bids-table-body');
    const lastTradePriceContainer = document.getElementById('last-trade-price-container');
    const refreshButton = document.getElementById('refresh-button');
    // const sendDataButton = document.getElementById('send-data-button');
    const userInfoBlock = document.getElementById('user-info-block');
    const statusMessage = document.getElementById('status-message');
    const headerTitle = document.getElementById('header-title');

    // Демо-данные (в реальном приложении они будут приходить с сервера/API)
    let demoAsks = [ { price: 1.6550, amount: 50.0 }, { price: 1.6500, amount: 100.0 }, { price: 1.6600, amount: 250.5 } ];
    let demoBids = [ { price: 1.6400, amount: 75.0 }, { price: 1.6350, amount: 120.25 }, { price: 1.6300, amount: 30.0 } ];
    let demoLastPrice = 1.6425;

    function displayStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? 'var(--color-asks)' : 'var(--tg-hint-color)';
    }

    function renderOrderBook(asks, bids, lastPrice) {
        asksTableBody.innerHTML = '';
        bidsTableBody.innerHTML = '';

        // Сортируем: аски по возрастанию цены, биды по убыванию
        const sortedAsks = [...asks].sort((a, b) => a.price - b.price);
        const sortedBids = [...bids].sort((a, b) => b.price - a.price);

        // Отображаем аски (лучшие 5, самые низкие цены сверху)
        sortedAsks.slice(0, 5).reverse().forEach(order => addRowToTable(asksTableBody, order, 'ask'));
        if (sortedAsks.length === 0) asksTableBody.innerHTML = '<tr><td colspan="3" class="placeholder">Нет заявок</td></tr>';

        lastTradePriceContainer.textContent = lastPrice > 0 ? `⚡️ ${lastPrice.toFixed(4)} USDT` : '---';

        // Отображаем биды (лучшие 5, самые высокие цены сверху)
        sortedBids.slice(0, 5).forEach(order => addRowToTable(bidsTableBody, order, 'bid'));
        if (sortedBids.length === 0) bidsTableBody.innerHTML = '<tr><td colspan="3" class="placeholder">Нет заявок</td></tr>';
    }

    function addRowToTable(tableBody, order, type) {
        const row = tableBody.insertRow();
        row.insertCell().textContent = order.price.toFixed(4);
        row.insertCell().textContent = order.amount.toFixed(2);
        row.insertCell().textContent = (order.price * order.amount).toFixed(2);
    }

    function simulateDataUpdate() {
        headerTitle.textContent = "Обновление...";
        refreshButton.disabled = true;
        displayStatus("Загрузка данных...");

        setTimeout(() => {
            // Имитация изменения данных
            demoAsks.forEach(a => { a.amount += (Math.random()-0.5)*5; a.price += (Math.random()-0.5)*0.002 });
            demoBids.forEach(b => { b.amount += (Math.random()-0.5)*5; b.price += (Math.random()-0.5)*0.002 });
            demoAsks = demoAsks.filter(a => a.amount > 1); // Убираем слишком маленькие
            demoBids = demoBids.filter(b => b.amount > 1);
             if (demoBids.length > 0 && demoAsks.length > 0) {
                 demoLastPrice = (demoBids[0].price + demoAsks[0].price) / 2 + (Math.random() - 0.5) * 0.005;
            }


            renderOrderBook(demoAsks, demoBids, demoLastPrice);
            headerTitle.textContent = "Биржевой стакан";
            refreshButton.disabled = false;
            displayStatus("Данные обновлены.", false);
            tg.HapticFeedback.notificationOccurred('success');
        }, 800);
    }

    // Инициализация
    renderOrderBook(demoAsks, demoBids, demoLastPrice);
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userInfoBlock.textContent = `Привет, ${user.first_name}! (ID: ${user.id})`;
    } else {
        userInfoBlock.textContent = "Пользователь не определен.";
    }

    // Кнопки
    refreshButton.addEventListener('click', simulateDataUpdate);

    /* // Пример отправки данных боту
    if (sendDataButton) {
        sendDataButton.addEventListener('click', function() {
            const dataPayload = { message: "Привет от WebApp!", timestamp: new Date().toISOString() };
            tg.sendData(JSON.stringify(dataPayload));
            // После tg.sendData() WebApp может быть закрыт, если это настроено в боте или если это MainButton
        });
    }
    */

    // Настройка главной кнопки Telegram (если нужна)
    // tg.MainButton.setText("Закрыть стакан");
    // tg.MainButton.onClick(() => tg.close());
    // tg.MainButton.show();

    // Показать кнопку "Назад" (если есть куда возвращаться)
    // tg.BackButton.show();
    // tg.BackButton.onClick(() => tg.close()); // или другое действие

    // Обработка изменения темы
    tg.onEvent('themeChanged', function() {
        document.body.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
        document.body.style.setProperty('--tg-text-color', tg.themeParams.text_color);
        // ... и так далее для других CSS переменных, если вы их используете напрямую
    });
});