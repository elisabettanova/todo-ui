// Views (Presentation logic)
window.addEventListener('load', function (event) {
  let taskInput = document.getElementById('taskInput');
  let taskButton = document.getElementById('taskButton');
  let tasksListDiv = document.getElementById('tasksList');
  let loadingOverlay = document.getElementById('loadingOverlay');

  // View Functions

  function showOverlay() {
    loadingOverlay.classList.remove('hide');
  }

  function hideOverlay() {
    loadingOverlay.classList.add('hide');
  }

  function taskObjectToTaskView(taskObject) {
    /*
    We will get this:
    {
      id: 15,
      title: 'prepare class',
      status: false,
    }

    We create this:
    <li class="task" data-id="15">
       <span contenteditable class="task-text">prepare class</span>
       <a href="#">Delete</a>
       <input type="checkbox" class="done-checkbox" />
    </li>
    */

    let taskListItem = document.createElement('li');
    taskListItem.classList.add('task');
    taskListItem.dataset.id = taskObject.id;

    let taskTextSpan = document.createElement('span');
    taskTextSpan.classList.add('task-text');
    taskTextSpan.innerHTML = taskObject.title;

    // READ WHAT I DO HERE
    /* Using content editable and blur events I am sending update data to server */
    taskTextSpan.setAttribute('contenteditable', "true");
    taskTextSpan.addEventListener('blur', function (event) {
      if (event.target.innerHTML !== taskObject.title) {
        updateTask(taskObject.id, event.target.innerHTML, taskObject.status)
      }
    })
    /*
    * End contenteditable
    * Source: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content
    */

    taskListItem.append(taskTextSpan);

    // delete link
    let taskDeleteLink = document.createElement('a');
    taskDeleteLink.setAttribute('href', '#')
    taskDeleteLink.setAttribute('class', 'task-delete')
    taskDeleteLink.innerHTML = "Delete";
    taskDeleteLink.addEventListener('click', function (event) {
      deleteTask(taskObject.id);
    })


    // if we have time, htmleditable
    taskListItem.append(taskDeleteLink);

    let doneCheckbox = document.createElement('input');
    doneCheckbox.setAttribute('type', 'checkbox')
    doneCheckbox.setAttribute('class', 'done-checkbox')
    doneCheckbox.checked = taskObject.status;


    if (taskObject.status) {
      taskListItem.classList.add('done');
    } else {
      taskListItem.classList.remove('done');
    }
    doneCheckbox.addEventListener('change', function (event) {
      let checked = event.target.checked;
      let id = parseInt(event.target.parentNode.dataset.id);

      if (checked) {
        updateTask(id, taskObject.title, checked)
        event.target.parentNode.classList.add('done')
      }

      if (!checked) {
        updateTask(id, taskObject.title, checked)
        event.target.parentNode.classList.remove('done')
      }
    })

    taskListItem.append(doneCheckbox);

    return taskListItem;
  }

  function tasksArrayToTaskList(arrayOfTaskObjects) {
    let tasksList = document.createElement('ul');
    for (let taskObject of arrayOfTaskObjects) {
      let taskView = taskObjectToTaskView(taskObject);
      tasksList.append(taskView);
    }
    return tasksList;
  }


  // Server Functions

  function render() {
    showOverlay()
    fetch('http://localhost:3000/tasks/').then(function (response) {
      return response.json();
    }).then(function (data) {
      // Load the data first
      let newTasksList = tasksArrayToTaskList(data);
      tasksListDiv.innerHTML = "";
      tasksListDiv.append(newTasksList);
      hideOverlay();
    })
  }

  function updateTask(id, taskString, status) {
    let existingTaskObject = {
      title: taskString,
      status: status
    }
    showOverlay()
    fetch('http://localhost:3000/tasks/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(existingTaskObject)
    }).then(function (response) {
      if (response.ok) {
        render();
      } else {
        return Promise.reject('something went wrong');
      }
    }).catch(function (error) {
      console.log(error);
    })
  }


  function newTask(taskString) {
    let newTaskObject = {
      "title": taskString,
      "status": false
    }
    console.log(JSON.stringify(newTaskObject))
    showOverlay()
    fetch('http://localhost:3000/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTaskObject)
    }).then(function (response) {
      if (response.ok) {
        render();
      } else {
        return Promise.reject('something went wrong');
      }
    }).catch(function (error) {
      console.log(error);
    })
  }

  function deleteTask(id) {
    showOverlay()
    fetch('http://localhost:3000/tasks/' + id, {
      method: 'DELETE'
    }).then(function (response) {
      if (response.ok) {
        render();
      } else {
        return Promise.reject('something went wrong');
      }
    }).catch(function (error) {
      console.log(error);
    })
  }


  taskButton.addEventListener('click', function (event) {
    let taskString = taskInput.value;
    if (taskInput.value !== "") {
      console.log(taskString)
      newTask(taskString);
    }
  })


  showOverlay();

  render();

  /*
  setTimeout(function () {
    showOverlay();
  }, 1000)

  setTimeout(function () {
    hideOverlay();
  }, 4000)
  */
})
