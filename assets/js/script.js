// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;



// Create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a function to create a task card
function createTaskCard(task) {
  const dueDate = dayjs(task.dueDate);
  const currentDate = dayjs();
  const isOverdue = dueDate.isBefore(currentDate);
  const isNearingDeadline = dueDate.diff(currentDate, 'day') <= 2 && !isOverdue;
  let cardClass = '';

  if (isOverdue) {
    cardClass = 'bg-danger text-black';
  } else if (isNearingDeadline) {
    cardClass = 'bg-warning';
  }

  return `
    <div class="card mb-3 ${cardClass}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  ['todo', 'in-progress', 'done'].forEach(status => {
    $(`#${status}-cards`).empty();
    taskList.filter(task => task.status === status).forEach(task => {
      const taskCard = createTaskCard(task);
      const $taskCard = $(taskCard); // Convert to jQuery object

      // Add class for draggable
      $taskCard.addClass('draggable-task');

      // Append card to lane
      $(`#${status}-cards`).append($taskCard);

      // Make each task card draggable
      $taskCard.draggable({
        revert: 'invalid',
        start: function() {
          $(this).css('z-index', 1000);
        },
        stop: function() {
          $(this).css('z-index', '');
        }
      });
      if (status === 'done') {
        $taskCard.removeClass('bg-danger bg-warning');
      }
    });
  });

  // Make delete buttons functional
  $('.delete-task').click(handleDeleteTask);
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const dueDate = $("#task-due-date").val();

  const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      dueDate: dueDate,
      status: "todo" // Default status
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  renderTaskList();

  const addTaskForm = $("#add-task-form");
  if (addTaskForm.length > 0) {
      addTaskForm[0].reset();
  }

  $("#formModal").modal("hide");
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(_event, ui) {
  const taskId = ui.draggable.data('id');
  const newStatus = $(this).attr('id').replace('-cards', ''); // Extract new status from the ID of the dropped lane
  
  // Update taskList with new status for the dropped task
  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
    return task;
  });

  // Update localStorage with the modified taskList
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Re-render the task list to reflect changes

  renderTaskList();

}


// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  ['#todo-cards', '#in-progress', '#done'].forEach(function (status) {
    $(status).droppable({
      accept: '.draggable-task',
      drop: handleDrop
    });
  });

  $('#add-task-form').submit(handleAddTask);

  $('#task-due-date').datepicker({
    dateFormat: 'yy-mm-dd'
  });
});
