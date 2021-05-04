export default {
    getTodos,
    createTodos,
    updateTodos,
    deleteTodos,
    getFinishedTodos,
    getNotFinishedTodos,
}


export function getTodos(userID) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://koppepan-todo-app-server.herokuapp.com/api/todos/get/${ userID }`);
        xhr.send();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const todos = JSON.parse(xhr.responseText)['results'];
                resolve(todos)
            }
        }
    });
  }

export function deleteTodos(_todo){
    const data = JSON.stringify(
        {
            'id': _todo.id,
            'user_id': _todo.user_id,
            'title': _todo.title,
            'description': _todo.description,
            'finished': _todo.finished,
            'created_at': _todo.created_at,
            'updated_at': _todo.updated_at
        }
    )
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://koppepan-todo-app-server.herokuapp.com/api/todos/delete');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);
}
    
export function createTodos(_todo){
    const data = JSON.stringify(
        {
            'id': _todo.id,
            'user_id': _todo.user_id,
            'title': _todo.title,
            'description': _todo.description,
            'finished': _todo.finished,
            'created_at': _todo.created_at,
            'updated_at': _todo.updated_at
        }
    )
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://koppepan-todo-app-server.herokuapp.com/api/todos/create');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);
}

export function updateTodos(_todo){
    const data = JSON.stringify(
        {
            'id': _todo.id,
            'user_id': _todo.user_id,
            'title': _todo.title,
            'description': _todo.description,
            'finished': _todo.finished,
            'created_at': _todo.created_at,
            'updated_at': getCurrentTime()
        }
    )
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://koppepan-todo-app-server.herokuapp.com/api/todos/update');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);
}


/* Get Fnished Todo From DB */
export function getFinishedTodos(userID){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://koppepan-todo-app-server.herokuapp.com/api/todos/get/finished/${ userID }`);
        xhr.send();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const todos = JSON.parse(xhr.responseText)['results'];
                resolve(todos)
            }
        }
    });
}

export function getNotFinishedTodos(userID){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://koppepan-todo-app-server.herokuapp.com/api/todos/get/not_finished/${ userID }`);
        xhr.send();
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const todos = JSON.parse(xhr.responseText)['results'];
                resolve(todos)
            }
        }
    });
}


function getCurrentTime(){
    /* ToDo作成時間の取得（YY-mm-DDTHH:MM:SSZ） */
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2);
    const month = ("0"+(date.getMonth() + 1)).slice(-2)
    const day = ("0"+date.getDate()).slice(-2)
    const hour = ("0"+date.getHours()).slice(-2)
    const minute = ("0"+date.getMinutes()).slice(-2)
    const secound = ("0"+date.getSeconds()).slice(-2)
    const created_at = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + secound + 'Z';
    console.log(created_at);
    return created_at
}
