document.addEventListener('DOMContentLoaded', () => {
  // Obtener referencias a los elementos del DOM
  const newTodoInput = document.getElementById('new-todo');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const filterAll = document.getElementById('filter-all');
  const filterActive = document.getElementById('filter-active');
  const filterCompleted = document.getElementById('filter-completed');
  const clearCompleted = document.getElementById('clear-completed');
  const toggleThemeButton = document.getElementById('toggle-theme');

  // Inicializar variables
  let todos = JSON.parse(localStorage.getItem('todos')) || []; // Obtener las tareas de localStorage
  let filter = 'all'; // Filtro actual
  let dragSrcEl = null; // Elemento arrastrado

  // Actualizar la lista de tareas en el DOM
  function updateTodoList() {
    todoList.innerHTML = ''; // Limpiar la lista de tareas
    const filteredTodos = todos.filter(todo => {
      if (filter === 'all') return true; // Mostrar todas las tareas
      if (filter === 'active') return !todo.completed; // Mostrar solo las tareas activas
      if (filter === 'completed') return todo.completed; // Mostrar solo las tareas completadas
    });

    // Añadir las tareas filtradas al DOM
    filteredTodos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-2 mb-2 bg-gray-700 rounded-lg';
      li.draggable = true; // Hacer que los elementos sean arrastrables
      li.innerHTML = `
        <label class="flex items-center space-x-2">
          <input type="checkbox" class="form-checkbox text-purple-600" ${todo.completed ? 'checked' : ''} data-index="${index}">
          <span class="${todo.completed ? 'line-through' : ''}">${todo.text}</span>
        </label>
        <button class="delete-todo" data-index="${index}">✕</button>
      `;
      addDragAndDropHandlers(li, index); // Añadir manejadores de eventos de arrastrar y soltar
      todoList.appendChild(li); // Añadir el elemento a la lista
    });

    // Actualizar el contador de tareas restantes
    itemsLeft.textContent = `${todos.filter(todo => !todo.completed).length} items left`;

    // Guardar las tareas en localStorage
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Añadir manejadores de eventos de arrastrar y soltar
  function addDragAndDropHandlers(element, index) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragend', handleDragEnd);
  }

  // Manejador de inicio de arrastre
  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('opacity-50');
  }

  // Manejador de arrastre sobre un elemento
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Permitir el drop
    }
    e.dataTransfer.dropEffect = 'move'; // Indicar el tipo de operación de arrastre
    return false;
  }

  // Manejador de drop
  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // Prevenir la acción por defecto
    }
    if (dragSrcEl !== this) {
      const srcIndex = [...todoList.children].indexOf(dragSrcEl); // Índice del elemento arrastrado
      const destIndex = [...todoList.children].indexOf(this); // Índice del elemento destino
      // Mover el elemento arrastrado a la posición del elemento destino
      todos.splice(destIndex, 0, todos.splice(srcIndex, 1)[0]);
      updateTodoList(); // Actualizar la lista de tareas
    }
    return false;
  }

  // Manejador de fin de arrastre
  function handleDragEnd() {
    this.classList.remove('opacity-50');
  }

  // Añadir una nueva tarea
  function addTodo() {
    const text = newTodoInput.value.trim();
    if (text !== '') {
      todos.push({ text, completed: false }); // Añadir la tarea a la lista
      newTodoInput.value = ''; // Limpiar el campo de entrada
      updateTodoList(); // Actualizar la lista de tareas
    }
  }

  // Alternar el estado de completado de una tarea
  function toggleTodoCompleted(index) {
    todos[index].completed = !todos[index].completed;
    updateTodoList(); // Actualizar la lista de tareas
  }

  // Eliminar una tarea
  function deleteTodo(index) {
    todos.splice(index, 1); // Eliminar la tarea de la lista
    updateTodoList(); // Actualizar la lista de tareas
  }

  // Limpiar todas las tareas completadas
  function clearCompletedTodos() {
    todos = todos.filter(todo => !todo.completed); // Filtrar solo las tareas no completadas
    updateTodoList(); // Actualizar la lista de tareas
  }

  // Establecer el filtro actual
  function setFilter(newFilter) {
    filter = newFilter;
    updateTodoList(); // Actualizar la lista de tareas
  }

  // Alternar el modo de tema
  function toggleThemeMode() {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
      toggleThemeButton.textContent = '☀';
    } else {
      toggleThemeButton.textContent = '🌙';
    }
  }

  // Añadir los manejadores de eventos
  newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  todoList.addEventListener('change', (e) => {
    if (e.target.matches('.form-checkbox')) {
      const index = e.target.getAttribute('data-index');
      toggleTodoCompleted(index);
    }
  });

  todoList.addEventListener('click', (e) => {
    if (e.target.matches('.delete-todo')) {
      const index = e.target.getAttribute('data-index');
      deleteTodo(index);
    }
  });

  filterAll.addEventListener('click', () => setFilter('all'));
  filterActive.addEventListener('click', () => setFilter('active'));
  filterCompleted.addEventListener('click', () => setFilter('completed'));
  clearCompleted.addEventListener('click', clearCompletedTodos);
  toggleThemeButton.addEventListener('click', toggleThemeMode);

  // Render inicial
  updateTodoList();
});
