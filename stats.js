document.addEventListener('DOMContentLoaded', function () {
    // Фіктивна статистика за категоріями
    const categoryStatsData = {
        work: 12,
        study: 20,
        health: 8,
        personal: 15,
        other: 5
    };

    const categoryNames = {
        work: 'Робота',
        study: 'Навчання',
        health: 'Здоров’я',
        personal: 'Особисте',
        other: 'Інше'
    };

    // ⬅️ Важливо: оголошення контейнера та перевірка наявності
    const categoryStatsContainer = document.getElementById('category-stats');
    if (categoryStatsContainer) {
        for (const [key, value] of Object.entries(categoryStatsData)) {
            const block = document.createElement('div');
            block.className = 'category-stat';
            block.classList.add(key); // ⬅️ додаємо назву категорії як CSS-клас

            block.innerHTML = `
                <span class="material-icons">label</span>
                <strong>${categoryNames[key]}</strong>
                <span>${value} задач</span>
            `;

            categoryStatsContainer.appendChild(block);
        }
    }


    // Фіктивні досягнення
    const achievements = [
        {
            title: "Перша задача",
            description: "Створено першу задачу",
            icon: "check_circle",
            unlocked: true
        },
        {
            title: "5 задач",
            description: "Створено 5 задач",
            icon: "star",
            unlocked: true
        },
        {
            title: "7 днів підряд",
            description: "Завершено задачі 7 днів поспіль",
            icon: "calendar_month",
            unlocked: false
        },
        {
            title: "Чистий день",
            description: "Всі задачі виконано в один день",
            icon: "event_available",
            unlocked: true
        },
        {
            title: "Залізна дисципліна",
            description: "Виконано 30 задач",
            icon: "fitness_center",
            unlocked: false
        }
    ];

    // Перевірка наявності контейнера
    const achievementsGrid = document.getElementById('achievements-grid');
    if (achievementsGrid) {
        achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            if (!achievement.unlocked) card.classList.add('locked');
            card.innerHTML = `
                <span class="material-icons">${achievement.icon}</span>
                <div>
                    <strong>${achievement.title}</strong>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievementsGrid.appendChild(card);
        });
    }


    // Перевірка наявності canvas та обробка помилок Chart
    const ctx = document.getElementById('weekly-chart');
    if (ctx) {
        try {
            const productivityChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
                    datasets: [{
                        label: 'Завершено задач',
                        data: [3, 5, 4, 6, 2, 7, 1], // фіктивні числа
                        backgroundColor: '#42a5f5'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Помилка при створенні графіка:", error);
        }
    }
	// Продуктивність за місяць (лінійний графік)
const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
const monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
        labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`), // 1–30
        datasets: [{
            label: 'Виконано задач',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5) + 1),
            fill: false,
            borderColor: '#66bb6a',
            tension: 0.3,
            pointRadius: 3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});

});