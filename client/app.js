import api from './api.js'

// Initialize app
function init(profile){
    const userId = profile.userId
    initHtml(profile);
    initToDos(userId)
    initStorage(userId);
}

/* Initialize HTML */
function initHtml(profile){
    'use strict';
    {
        $('.header').children('div').html(`What's up ${ profile.displayName }`)
        if(profile.pictureUrl){
            $('.image').attr('src', profile.pictureUrl)
        }
        const open = document.getElementById('add_button');
        const save = document.getElementById('save');
        const modal = document.getElementById('modal');
        const mask = document.getElementById('mask');
        
        open.addEventListener('click', function () {
            $('#todo_title').val('');
            $('#todo_description').val('');
            $('#todo_id').val('');
            modal.classList.remove('hidden');
            mask.classList.remove('hidden');
        });
        
        save.addEventListener('click', function () {
            modal.classList.add('hidden');
            mask.classList.add('hidden');
            const title = $('#todo_title').val();
            const description = $('#todo_description').val();
            const id = $('#todo_id').val();
            console.log(id, title, description)
            if (title){
                if(id){
                    liff.getProfile().then(({ userId }) => {
                        const _todo = getTodoFromStorage(id)
                        _todo.title = title;
                        _todo.description = description;
                        _todo.updated_at = getCurrentTime();
                        /* Update ToDo */
                        //const _todo = new todo(id, userId, title, description, false, getCurrentTime(), '');
                        _update(_todo);
                        /* Update HTML */ 
                        $(`.${ id }.title`).html(title);
                        $(`.${ id }.description`).html(description);
                        $('#todo_id').val('');
                    })
                }else{
                    liff.getProfile().then(({ userId }) => {
                        /* Save New Todo */
                        const _todo = new todo(getUniqueID(), userId, title, description, false, getCurrentTime(), '');
                        _save(_todo);
                        /* Add New Todo to HTML */
                        addToDo(_todo);
                    })
                }
            }
            
        });
        mask.addEventListener('click', function () {
            modal.classList.add('hidden');
            mask.classList.add('hidden');
            $('.task_content').addClass('hidden');
        });
    }
}

/* Initialize ToDo in HTML */
async function initToDos(userID){
    // const todos = await api.getTodos(userID)
    // for (const todo of todos){
    //     addToDo(todo)
    // }
    const notFinishedTodos = await api.getNotFinishedTodos(userID)
    if(notFinishedTodos){
        for (const todo of notFinishedTodos){
            addToDo(todo)
        }
    }
    const finishedTodos = await api.getFinishedTodos(userID)
    if(finishedTodos){
        for (const todo of finishedTodos){
            addToDo(todo)
        }
    }
    
}

/* Initialize Session Storage */
async function initStorage(userID){
    const todos = await api.getTodos(userID)
    for (const todo of todos){
        const storage = sessionStorage;
        storage[todo.id] = JSON.stringify(
            {
                'id': todo.id,
                'user_id':todo.user_id,
                'title': todo.title,
                'description': todo.description,
                'finished': todo.finished,
                'created_at': todo.created_at,
                'updated_at': todo.updated_at
            }
        )
    }
    return todos
};

/* Save */
function _save(_todo){
    /* SessionStorageへSave */
    saveToDotoStorage(_todo)   
    /* DbへSave*/
    api.createTodos(_todo)
}

/* Update */
function _update(_todo){
    /* SessionStorageへSave */
    saveToDotoStorage(_todo);
    /* DbへSave*/
    api.updateTodos(_todo)
}

/* Delete */
function _delete(_todo){
    api.deleteTodos(_todo)
    sessionStorage.removeItem(_todo.id);
}

/* Add Todo */
export function addToDo(_todo){
    // Add todo div 
    $('.task_list').append(`<div id='${ _todo.id }' class='task'>\
                                <div class='title_part'>\
                                    <div class='checkbox'><input id='ch_${ _todo.id }' type='checkbox'><label for='ch_${ _todo.id }' class='checkbox'></label> </div>\
                                    <div class='${ _todo.id } title'>${ _todo.title }</div>\
                                    <div class='setting'>\
                                        <label for='setting_${ _todo.id }' class='setting'><span></span></label>\
                                        <div class='task_content hidden'>\
                                            <ul>\
                                                <li><i class='fas fa-tag'></i><div>Tag</div></li>\
                                                <li class='delete'><i class='far fa-trash-alt'></i><div>Delete</div></li>\
                                            </ul>\
                                        </div>\
                                    </div>
                                </div>\
                                <div class="${ _todo.id } description">${ _todo.description }</div>\
                            </div>`);
    // Checkbox or Not Checked
    if (_todo.finished === true){
        $(`#${_todo.id}`).find('input').prop('checked', true);
        $(`#${_todo.id}`).addClass('checked');
    }

    const  el = document.getElementById('task_list');
    Sortable.create(el);
    
    // Add Process with Event on Todo
    $(`.${_todo.id}`).on('click', function event(){
        const storage = sessionStorage;
        const data = JSON.parse(storage[_todo.id]);
        $('#todo_id').val(data.id);
        $('#todo_title').val(data.title);
        $('#todo_description').val(data.description);
        modal.classList.remove('hidden');
        mask.classList.remove('hidden');
    })
    $('.checkbox').change(function(){
        const id = $(this).parent().parent().attr('id');
        const _todo = getTodoFromStorage(id);
        _todo.finished = $(this).children('input').prop('checked');
        if(_todo.finished === true){
            $(`#${_todo.id}`).addClass('checked')
        }else{
            $(`#${_todo.id}`).removeClass('checked')
        }
        _update(_todo);
    })
    $('.setting').click(function (){
        mask.classList.remove('hidden');
        $(this).children('div').removeClass("hidden");
    })
    $('.delete').click(function (){
        const id = $(this).parent().parent().parent().parent().parent().attr('id');
        const _todo = getTodoFromStorage(id);
        _delete(_todo);
        $(this).parent().parent().parent().parent().parent().remove()
        mask.classList.add('hidden');
    })
}



class todo {
    constructor(id, user_id, title, description, finished, created_at, updated_at){
        this.id = id;
        this.user_id = user_id;
        this.title =title;
        this.description = description;
        this.finished = finished;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

function saveToDotoStorage(_todo){
    const storage = sessionStorage;
    storage[_todo.id] = JSON.stringify(
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
}


function getUniqueID(myStrong){
    /* ToDoのIDを作成 */
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
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


function getTodoFromStorage(id){
    const storage = sessionStorage;
    const _todo = JSON.parse(storage[id]);
    return _todo

}

function countTodo(){
    return $(".task_list > div").length
}


export default{
    init
}