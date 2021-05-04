/* 1. expressモジュールをロードし、インスタンス化してappに代入。*/
require('date-utils');
const bodyParser = require('body-parser')
const { Pool } = require('pg');
var express = require("express");
var app = express();
const cors = require('cors')

app.use(cors())



/* 2. listen()メソッドを実行して3000番ポートで待ち受け。*/
var server = app.listen(process.env.PORT || 3000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

/* 3. PostgreDB起動 */
//オレオレ証明書を許可
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//Client定義
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});


/* API */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/api/todos/create', cors(), async (req, res) => {
    console.log(req.body)
    const id = getUniqueID()
    const now = new Date()
    const created_at = now.toFormat('YY-MM-DDTHH:MI:SSZ')
    const todo = {
        'id': req.body.id,
        'user_id': req.body.user_id,
        'title': req.body.title,
        'description': req.body.description,
        'finished': false,
        'created_at': created_at,
        'updated_at': '',
    }
    const query = {
        'text': 'INSERT INTO t_todo VALUES($1, $2, $3, $4, $5, $6, $7)',
        'values': [todo.id, todo.user_id, todo.title, todo.description, todo.finished, todo.created_at, todo.updated_at]
    }
    /* dbへ登録 */
    try {
        const client = await pool.connect()
        const result = await client.query(query);
        const results = { 'results': (result) ? result.rows : null};
        console.log(results[0])
        res.json(results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(req.body);
      console.log(req.body)
});

app.post('/api/todos/update', cors(), async (req, res) => {
    todo = {
        'id': req.body['id'],
        'user_id': req.body['user_id'],
        'title': req.body['title'],
        'description': req.body['description'],
        'finished': req.body['finished'],
        'created_at': req.body['created_at'],
        'updated_at': req.body['updated_at'],
    }
    const query = `UPDATE t_todo SET (title, description, finished, created_at, updated_at) = ('${ todo.title }', '${ todo.description }', '${ todo.finished }', '${ todo.created_at }', '${ todo.updated_at }') WHERE id = '${todo.id}' AND user_id = '${todo.user_id}'`
    try {
        const client = await pool.connect()
        const result = await client.query(query);
        const results = { 'results': (result) ? result.rows : null};
        console.log(results[0])
        res.json(results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(req.body);
      console.log(req.body)
});

app.post('/api/todos/delete', cors(), async (req, res) => {
  todo = {
      'id': req.body['id'],
      'user_id': req.body['user_id'],
      'title': req.body['title'],
      'description': req.body['description'],
      'finished': req.body['finished'],
      'created_at': req.body['created_at'],
      'updated_at': req.body['updated_at'],
  }
  const query = `DELETE FROM t_todo WHERE id = '${ todo.id }' AND user_id = '${ todo.user_id }'`
  try {
      const client = await pool.connect()
      const result = await client.query(query);
      const results = { 'results': (result) ? result.rows : null};
      console.log(results[0])
      res.json(results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
    res.send(req.body);
    console.log(req.body)
});

app.get('/api/todos/get/finished/*', async (req, res) => {
  try{
    console.log(req.params)
    const userID = req.params[0].split('/');
    const client = await pool.connect()
    const result = await client.query(`SELECT * FROM t_todo WHERE user_id = '${ userID }' AND finished = TRUE`);
    const results = { 'results': (result) ? result.rows : null};
    console.log(results[0])
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

app.get('/api/todos/get/not_finished/*', async (req, res) => {
  try{
    console.log(req.params)
    const userID = req.params[0].split('/');
    const client = await pool.connect()
    const result = await client.query(`SELECT * FROM t_todo WHERE user_id = '${ userID }' AND finished = FALSE`);
    const results = { 'results': (result) ? result.rows : null};
    console.log(results[0])
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})


app.get('/api/todos/get/*', async (req, res) => {
  try {
    console.log(req.params)
    const userID = req.params[0].split('/');
    const client = await pool.connect()
    const result = await client.query(`SELECT * FROM t_todo WHERE user_id = '${ userID }'`);
    const results = { 'results': (result) ? result.rows : null};
    console.log(results[0])
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})


function getUniqueID(){
    const crypto = require('crypto')
    const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const N=16
    return Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('')
   }
