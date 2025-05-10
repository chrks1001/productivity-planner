document.addEventListener('DOMContentLoaded', function() {
	    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const currentDateElement = document.getElementById('current-date');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const categorySelect = document.getElementById('category-select');
    const deadlineInput = document.getElementById('deadline-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const pointsCount = document.getElementById('points-count');
    const dailyQuote = document.getElementById('daily-quote');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarDays = document.getElementById('calendar-days');
    const resetPointsBtn = document.getElementById('reset-points-btn');
	const selectAllTasks = document.getElementById('select-all-tasks');
	const deleteSelectedTasks = document.getElementById('delete-selected-tasks');
    const deadlineNotifications = document.getElementById('deadline-notifications');
	const today = new Date().toISOString().split('T')[0];
	const weeklyProgressChartCanvas = document.getElementById('weekly-progress-chart');
	// App State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let points = parseInt(localStorage.getItem('points')) || 0;
    let currentFilter = 'all';
    let selectedDate = new Date();
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
	

    // Motivational quotes
    const quotes = [
        {
            text: "Найкращий спосіб почати робити – перестати говорити і почати діяти.",
            author: "Уолт Дісней"
        },
        {
            text: "Успіх – це сума маленьких зусиль, що повторюються з дня на день.",
            author: "Роберт Колльєр"
        },
        {
            text: "Не відкладай на завтра те, що можна зробити сьогодні.",
            author: "Бенджамін Франклін"
        },
        {
            text: "Твій час обмежений, не витрачай його, живучи чужим життям.",
            author: "Стів Джобс"
        },
        {
            text: "Єдиний спосіб зробити чудову роботу – любити те, що ти робиш.",
            author: "Стів Джобс"
        }
    ];

    // Initialize
    updateDateDisplay();
    renderTasks();
    updateProgress();
    updatePointsDisplay();
    showDailyQuote();
    renderCalendar();
    checkDeadlines();
    setupDataButtons();
    initDarkMode();

    // Check deadlines every minute
    setInterval(checkDeadlines, 60000);

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
	
	// Select all tasks functionality
	selectAllTasks.addEventListener('change', function() {
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
	});
	
	 // Delete selected tasks functionality
	
	deleteSelectedTasks.addEventListener('click', function() {
        const selectedTaskIds = [];
        const taskCheckboxes = document.querySelectorAll('.task-checkbox:checked');

        taskCheckboxes.forEach(checkbox => {
            selectedTaskIds.push(parseInt(checkbox.dataset.id));
        });

        if (selectedTaskIds.length > 0 && confirm('Ви впевнені, що хочете видалити вибрані задачі?')) {
            tasks = tasks.filter(task => !selectedTaskIds.includes(task.id));
            saveTasks();
            renderTasks();
            updateProgress();
            renderCalendar();
            selectAllTasks.checked = false; // Reset selection
        }
    });
	
	// Calendar navigation
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
	resetPointsBtn.addEventListener('click', resetPoints);


    // Main Functions
	function resetPoints() {
    if (confirm('Ви впевнені, що хочете обнулити всі бали?')) {
        points = 0;
        localStorage.setItem('points', points);
        updatePointsDisplay();
        showNotification('Лічильник балів обнулено!');
    }
}
	
    function updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = selectedDate.toLocaleDateString('uk-UA', options);
    }

    function showDailyQuote() {
        const today = new Date().toDateString();
        const lastQuoteDate = localStorage.getItem('lastQuoteDate');
        let quoteIndex = parseInt(localStorage.getItem('quoteIndex'));
        
        if (lastQuoteDate !== today || isNaN(quoteIndex)) {
            quoteIndex = Math.floor(Math.random() * quotes.length);
            localStorage.setItem('quoteIndex', quoteIndex);
            localStorage.setItem('lastQuoteDate', today);
        }
        
        const quote = quotes[quoteIndex];
        dailyQuote.querySelector('.quote-text').textContent = quote.text;
        dailyQuote.querySelector('.quote-author').textContent = `— ${quote.author}`;
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;
        
        const deadline = deadlineInput.value ? new Date(deadlineInput.value) : null;
        const taskDateInput = document.getElementById('deadline-input'); // Додайте це поле
		const taskDate = taskDateInput.value ? new Date(taskDateInput.value) : selectedDate;
		
        const newTask = {
            id: Date.now(),
            text,
            category: categorySelect.value,
            completed: false,
            createdAt: new Date().toISOString(),
            deadline: deadline ? deadline.toISOString() : null,
            date: formatDate(taskDate),
			subtasks: [] // Додаємо масив для підзадач
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateProgress();
        renderCalendar();
        
        taskInput.value = '';
        deadlineInput.value = '';
        taskInput.focus();
        
		resetPointsBtn.addEventListener('click', resetPoints);  // Новий обробник
		
        // Add animation
        const firstTask = taskList.firstChild;
        if (firstTask) {
            firstTask.classList.add('new-task');
            setTimeout(() => firstTask.classList.remove('new-task'), 500);
        }
        
       // checkAchievements();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks.filter(task => task.date === formatDate(selectedDate));
        
        if (currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <span class="material-icons">check_box</span>
                <p>Немає задач на обраний день</p>
            `;
            taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.category}`;
            if (task.completed) li.classList.add('completed');
            li.draggable = true; // Додаємо можливість перетягування
			li.dataset.id = task.id; // Зберігаємо ID задачі
			
			
            const now = new Date();
            const deadline = task.deadline ? new Date(task.deadline) : null;
            const isOverdue = deadline && !task.completed && deadline < now;
            
            if (isOverdue) {
                li.classList.add('urgent');
            }
            
            const deadlineText = deadline ? 
                `<div class="task-deadline ${isOverdue ? 'overdue' : ''}">
                    <span class="material-icons">schedule</span>
                    ${formatDate(deadline, true)}
                </div>` : '';
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-meta">
                        <span class="task-category">${getCategoryName(task.category)}</span>
                        ${deadlineText}
                    </div>
                </div>
                <button class="task-delete" data-id="${task.id}">
                    <span class="material-icons">delete</span>
                </button>
				    <button class="task-add-subtask" data-id="${task.id}">
                    <span class="material-icons">add_task</span>
                </button>

            `;
            
            taskList.appendChild(li);	
			
			// Add subtasks functionality
            //const addSubtaskBtn = li.querySelector('.task-add-subtask');
            //addSubtaskBtn.addEventListener('click', () => addSubtask(task.id));

            renderSubtasks(li, task); // Render subtasks
			
			li.addEventListener('dragstart', handleDragStart);
			li.addEventListener('dragover', handleDragOver);
			li.addEventListener('drop', handleDrop);
			li.addEventListener('dragend', handleDragEnd);
            
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', toggleTask);
            
            const deleteBtn = li.querySelector('.task-delete');
            deleteBtn.addEventListener('click', deleteTask);
        });
    }
	

    function renderSubtasks(taskElement, task) {
        const subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'subtasks';
		if (task.subtasks.length > 0) {
			const subtasksProgress = document.createElement('div');
			subtasksProgress.className = 'subtasks-progress';

			const progressBar = document.createElement('progress');
			progressBar.max = task.subtasks.length;
			progressBar.value = task.subtasks.filter(subtask => subtask.completed).length;

			const progressText = document.createElement('span');
			progressText.textContent = `${progressBar.value}/${progressBar.max} підзадач виконано`;

			subtasksProgress.appendChild(progressBar);
			subtasksProgress.appendChild(progressText);
			subtasksContainer.appendChild(subtasksProgress);
		}
        const subtaskList = document.createElement('ul');
        subtaskList.className = 'subtask-list';

        task.subtasks.forEach(subtask => {
            const subtaskItem = document.createElement('li');
            subtaskItem.className = 'subtask-item';
            subtaskItem.innerHTML = `
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <span>${subtask.text}</span>
                <button class="subtask-delete">
                    <span class="material-icons">delete</span>
                </button>
            `;

            const subtaskCheckbox = subtaskItem.querySelector('.subtask-checkbox');
            subtaskCheckbox.addEventListener('change', () => toggleSubtask(task.id, subtask.id));

            const subtaskDeleteBtn = subtaskItem.querySelector('.subtask-delete');
            subtaskDeleteBtn.addEventListener('click', () => deleteSubtask(task.id, subtask.id));

            subtaskList.appendChild(subtaskItem);
        });

        const addSubtaskInput = document.createElement('input');
        addSubtaskInput.type = 'text';
        addSubtaskInput.className = 'subtask-input';
        addSubtaskInput.placeholder = 'Додати підзадачу';
        addSubtaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addSubtask(task.id, addSubtaskInput.value);
                addSubtaskInput.value = '';
            }
        });
		
    subtasksContainer.appendChild(subtaskList);
    subtasksContainer.appendChild(addSubtaskInput);
    taskElement.appendChild(subtasksContainer);
    }

    function addSubtask(taskId, text = '') {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;

        if (text === '') {
            text = prompt('Введіть назву підзадачі:');
            if (!text || text.trim() === '') return;
        }

        const newSubtask = {
            id: Date.now(),
            text,
            completed: false
        };

        task.subtasks.push(newSubtask);
        saveTasks();
        renderTasks(); // Re-render all tasks to update subtask display
    }

    function toggleSubtask(taskId, subtaskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;

        const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
        if (!subtask) return;

        subtask.completed = !subtask.completed;
        saveTasks();
        renderTasks(); // Re-render all tasks to update subtask display
    }

    function deleteSubtask(taskId, subtaskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;

        task.subtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
        saveTasks();
        renderTasks(); // Re-render all tasks to update subtask display
    }
	
	// Додайте ці нові функції для обробки Drag and Drop
	let draggedItem = null;

	function handleDragStart(e) {
		draggedItem = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
		setTimeout(() => this.classList.add('dragging'), 0);
	}

	function handleDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		const afterElement = getDragAfterElement(taskList, e.clientY);
		const currentElement = document.querySelector('.dragging');
		
		if (afterElement == null) {
			taskList.appendChild(draggedItem);
		} else {
			taskList.insertBefore(draggedItem, afterElement);
		}
	}
	function handleDrop(e) {
    e.preventDefault();
    return false;
}

	function handleDragEnd() {
		this.classList.remove('dragging');
		updateTaskOrder();
	}

	function getDragAfterElement(container, y) {
		const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
		
		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY }).element;
	}

	function updateTaskOrder() {
		const newOrder = Array.from(taskList.children).map(item => parseInt(item.dataset.id));
		tasks.sort((a, b) => {
			return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
		});
		saveTasks();
	}

    function toggleTask(e) {
        const taskId = parseInt(e.target.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        const wasCompleted = task.completed;
        task.completed = !task.completed;
		
        const today = formatDate(new Date());
        if (task.completed && !wasCompleted) {
            const now = new Date();
            const deadline = task.deadline ? new Date(task.deadline) : null;
            
            if (deadline && now <= deadline) {
                addPoints(10);
            } else {
                addPoints(5);
            }
            
            checkDailyStreak();
        }
        
        saveTasks();
        renderTasks();
        updateProgress();
		
// Оновлюємо прогрес лише якщо задача на сьогодні
		if (task.date === today) {
        updateProgress();
    }
        renderCalendar();
        checkAchievements();
		
		// Update "select all" checkbox
        const allTasks = document.querySelectorAll('.task-checkbox');
        const allChecked = Array.from(allTasks).every(checkbox => checkbox.checked);
        selectAllTasks.checked = allChecked;
    }

    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('button').dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateProgress();
        renderCalendar();
    }

    function updateProgress() {
        const dateTasks = tasks.filter(task => task.date === today);
        
        if (dateTasks.length === 0) {
            progressText.textContent = '0%';
            progressFill.style.width = '0%';
            return;
        }
        
        const completedCount = dateTasks.filter(task => task.completed).length;
        const progress = Math.round((completedCount / dateTasks.length) * 100);
        progressText.textContent = `${progress}%`;
        progressFill.style.width = `${progress}%`;
        
        if (progress < 30) {
            progressFill.style.background = 'linear-gradient(90deg, #ff7675, #d63031)';
        } else if (progress < 70) {
            progressFill.style.background = 'linear-gradient(90deg, #fdcb6e, #e17055)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary-light), var(--primary))';
        }
    }

    // Points System
    function addPoints(amount) {
        points += amount;
        localStorage.setItem('points', points);
        updatePointsDisplay();
        
        const pointsElement = document.createElement('div');
        pointsElement.className = 'points-animation';
        pointsElement.textContent = `+${amount}`;
        pointsElement.style.color = amount >= 10 ? '#00b894' : '#fdcb6e';
        pointsCount.parentNode.appendChild(pointsElement);
        
        setTimeout(() => {
            pointsElement.style.transform = 'translateY(-20px)';
            pointsElement.style.opacity = '0';
            setTimeout(() => pointsElement.remove(), 500);
        }, 100);
    }

    function updatePointsDisplay() {
        pointsCount.textContent = points;
    }

    function checkDailyStreak() {
        const today = new Date().toDateString();
        const lastCompletion = localStorage.getItem('lastCompletion');
        
        if (lastCompletion === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastCompletion === yesterday.toDateString()) {
            const streak = parseInt(localStorage.getItem('streak')) || 0;
            localStorage.setItem('streak', streak + 1);
            
            if (streak > 0) {
                addPoints(streak * 2);
                showNotification(`Чудова робота! Серія: ${streak + 1} днів (+${streak * 2} бонусних балів)`);
            }
        } else {
            localStorage.setItem('streak', 1);
        }
        
        localStorage.setItem('lastCompletion', today);
        checkDailyPoints();
    }

    function checkDailyPoints() {
        const today = new Date().toDateString();
        const lastPointsDate = localStorage.getItem('lastPointsDate');

        if (lastPointsDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayTasks = tasks.filter(task => 
                task.date === formatDate(yesterday) && !task.completed
            );

            if (yesterdayTasks.length === 0) {
                addPoints(15);
                showNotification("Чудова робота! Ви виконали всі задачі вчора (+15 балів)");
            }

            localStorage.setItem('lastPointsDate', today);
        }
    }

    // Deadlines System
	function checkDeadlines() {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		deadlineNotifications.innerHTML = ''; // Очищаємо попередні сповіщення

		tasks.forEach(task => {
			if (task.deadline && !task.completed) {
				const deadline = new Date(task.deadline);

				if (deadline < now) {
					const hoursLeft = Math.floor((now - deadline) / (1000 * 60 * 60));
					const notificationElement = document.createElement('div');
					notificationElement.className = 'deadline-notification';
					notificationElement.classList.add('urgent');
					notificationElement.innerHTML = `
						<span class="material-icons">alarm</span>
						<span class="urgent">Прострочено: "${task.text}" на ${hoursLeft} год</span>
					`;
					deadlineNotifications.appendChild(notificationElement);
				} else if (deadline < tomorrow) {
					const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60));
					const notificationElement = document.createElement('div');
					notificationElement.className = 'deadline-notification';
					notificationElement.innerHTML = `
						<span class="material-icons">alarm</span>
						<span>Дедлайн "${task.text}" через ${hoursLeft} год</span>
					`;
					deadlineNotifications.appendChild(notificationElement);
				}
			}
		});

    if (deadlineNotifications.children.length === 0) {
        deadlineNotifications.innerHTML = '<p>Немає термінових задач.</p>';
    }
}

    // Achievements System
    function checkAchievements() {
        const achievements = {
            firstTask: {
                earned: localStorage.getItem('achievementFirstTask') === 'true',
                check: () => tasks.length > 0,
                points: 10,
                message: "Перша задача! (+10 балів)"
            },
            fiveTasks: {
                earned: localStorage.getItem('achievementFiveTasks') === 'true',
                check: () => tasks.length >= 5,
                points: 20,
                message: "5 задач створено! (+20 балів)"
            },
            weekStreak: {
                earned: localStorage.getItem('achievementWeekStreak') === 'true',
                check: () => parseInt(localStorage.getItem('streak')) >= 7,
                points: 50,
                message: "Тижнева серія! (+50 балів)"
            },
			allCategories: {
            earned: localStorage.getItem('achievementAllCategories') === 'true',
            check: () => {
                const categories = new Set(tasks.map(task => task.category));
                return categories.size >= 5; // Всі 5 категорій
            },
            points: 30,
            message: "Різноманітність! (+30 балів)"
			},
			perfectDay: {
				earned: localStorage.getItem('achievementPerfectDay') === 'true',
				check: () => {
                const today = formatDate(new Date());
                const todayTasks = tasks.filter(task => task.date === today);
                return todayTasks.length > 0 && todayTasks.every(task => task.completed);
				},
				points: 25,
				message: "Ідеальний день! (+25 балів)"
			}
				
		};

        for (const [key, achievement] of Object.entries(achievements)) {
            if (!achievement.earned && achievement.check()) {
                addPoints(achievement.points);
                showNotification(achievement.message);
                localStorage.setItem(`achievement${key.charAt(0).toUpperCase() + key.slice(1)}`, 'true');
            }
        }
    }


	
    // Calendar System
    function renderCalendar() {
        calendarDays.innerHTML = '';
        
        const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 
                          'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const tasksByDate = {};
        tasks.forEach(task => {
            const date = task.date.split('-').slice(0, 3).join('-');
            if (!tasksByDate[date]) {
                tasksByDate[date] = [];
            }
            tasksByDate[date].push(task);
        });
        
        for (let i = 0; i < startingDay; i++) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'calendar-day';
            calendarDays.appendChild(emptyElement);
        }
        
        const today = new Date();
        const selectedFormatted = formatDate(selectedDate);
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const formattedDate = formatDate(date);
            const dayTasks = tasksByDate[formattedDate] || [];
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            if (formattedDate === selectedFormatted) {
                dayElement.classList.add('selected');
            }
            
            if (date.getDay() === 0 || date.getDay() === 6) {
                dayElement.classList.add('weekend');
            }
            
          if (dayTasks.length > 0) {
                dayElement.classList.add('has-tasks');
                const firstTaskCategory = dayTasks[0].category;
                dayElement.classList.add(firstTaskCategory);
            }
            
            dayElement.addEventListener('click', () => {
                selectedDate = date;
                updateDateDisplay();
                renderTasks();
                updateProgress();
                renderCalendar();
            });
            
            calendarDays.appendChild(dayElement);
        }
    }

    // Helper Functions
    function formatDate(date, time = false) {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        if (time) {
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        }
        
        return `${year}-${month}-${day}`;
    }

    function getCategoryName(category) {
        const names = {
            work: 'Робота',
            study: 'Навчання',
            health: 'Здоров\'я',
            personal: 'Особисте',
            other: 'Інше'
        };
        return names[category] || category;
    }

    function showNotification(message) {
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Data Export/Import
    function exportData() {
        const data = {
            tasks: tasks,
            points: points,
            lastCompletion: localStorage.getItem('lastCompletion'),
            streak: localStorage.getItem('streak')
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Замінити поточні дані імпортованими?')) {
                    tasks = data.tasks || [];
                    points = data.points || 0;
                    localStorage.setItem('lastCompletion', data.lastCompletion || '');
                    localStorage.setItem('streak', data.streak || '0');
                    
                    saveTasks();
                    updatePointsDisplay();
                    renderTasks();
                    updateProgress();
                    renderCalendar();
                    
                    showNotification('Дані успішно імпортовано!');
                }
            } catch (error) {
                alert('Помилка при імпорті файлу');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    function setupDataButtons() {
        const buttonsHTML = `
            <div class="data-buttons">
                <button id="export-btn" class="data-btn">
                    <span class="material-icons">save_alt</span> Експорт
                </button>
                <label for="import-input" class="data-btn">
                    <span class="material-icons">publish</span> Імпорт
                    <input type="file" id="import-input" accept=".json" style="display: none;">
                </label>
            </div>
        `;
        
        document.querySelector('.app-container').insertAdjacentHTML('beforeend', buttonsHTML);
        
        document.getElementById('export-btn').addEventListener('click', exportData);
        document.getElementById('import-input').addEventListener('change', importData);
    }

    // Dark Mode
    function initDarkMode() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
        
        const darkModeBtn = document.createElement('button');
        darkModeBtn.id = 'dark-mode-btn';
        darkModeBtn.innerHTML = '<span class="material-icons">brightness_4</span>';
        darkModeBtn.addEventListener('click', toggleDarkMode);
        document.querySelector('.header').appendChild(darkModeBtn);
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
		// Функція для відображення статистики
	function renderCategoryStats() {
		const categoryStats = document.getElementById('category-stats');
		if (!categoryStats) return;

		const stats = {
			work: { completed: 0, total: 0 },
			study: { completed: 0, total: 0 },
			health: { completed: 0, total: 0 },
			personal: { completed: 0, total: 0 },
			other: { completed: 0, total: 0 }
		};

		tasks.forEach(task => {
			stats[task.category].total++;
			if (task.completed) stats[task.category].completed++;
		});

		categoryStats.innerHTML = Object.entries(stats).map(([category, data]) => `
			<div class="category-stat-item ${category}">
				<h3>
					<span class="task-category">${getCategoryName(category)}</span>
				</h3>
				<div class="stat-progress">
					<progress value="${data.completed}" max="${data.total}"></progress>
					<div class="stat-numbers">
						<span>${data.completed} з ${data.total}</span>
						<span>${data.total ? Math.round((data.completed / data.total) * 100) : 0}%</span>
					</div>
				</div>
			</div>
		`).join('');
	}

	// Функція для відображення досягнень
	function renderAchievements() {
		const achievementsGrid = document.getElementById('achievements-grid');
		if (!achievementsGrid) return;

		const achievementsList = {
			firstTask: {
				title: "Перша задача",
				description: "Створіть свою першу задачу",
				points: 10
			},
			fiveTasks: {
				title: "П'ять задач",
				description: "Створіть 5 задач",
				points: 20
			},
			weekStreak: {
				title: "Тижнева серія",
				description: "Виконуйте задачі 7 днів поспіль",
				points: 50
			},
			allCategories: {
				title: "Різноманітність",
				description: "Створіть задачі у всіх категоріях",
				points: 30
			},
			perfectDay: {
				title: "Ідеальний день",
				description: "Виконайте всі задачі за один день",
				points: 25
			}
		};

		achievementsGrid.innerHTML = Object.entries(achievementsList).map(([key, achievement]) => {
			const earned = localStorage.getItem(`achievement${key.charAt(0).toUpperCase() + key.slice(1)}`) === 'true';
			return `
				<div class="achievement-card ${earned ? 'earned' : ''}">
					<h3>
						<span class="material-icons">${earned ? 'emoji_events' : 'lock'}</span>
						${achievement.title}
					</h3>
					<p>${achievement.description}</p>
					<div class="achievement-points">
						<span class="material-icons">military_tech</span>
						<span>${achievement.points} балів</span>
					</div>
				</div>
			`;
		}).join('');
	}

	// Перевірка чи ми на сторінці досягнень
	if (window.location.pathname.includes('achievements.html')) {
		document.addEventListener('DOMContentLoaded', function() {
			renderCategoryStats();
			renderAchievements();
			initDarkMode();
		});
	}
});