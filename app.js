var express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  path = require('path'),
  sqlite3 = require('sqlite3').verbose(),
  db = new sqlite3.Database('chat.db'),
  users = {};

// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='chat'",
       function(err, rows) {
  if(err !== null) {
    console.log(err);
  }
  else if(rows === undefined) {
    db.run('CREATE TABLE messages (nick VARCHAR(255), msg TEXT, timestamp TEXT)', function(err) {
      if(err !== null) {
        console.log(err);
      }
      else {
        console.log("Table 'messages' initialized.");
      }
    });
  }
  else {
    console.log("Table 'messages' already initialized.");
  }
});

// Store chat messages into database
var storeMsg = function(message){
  var stmt = db.prepare('INSERT INTO messages VALUES(?, ?, ?)');
  stmt.run(message.nick, message.msg, message.timestamp);
  stmt.finalize();
}

app.get('/', function(req,res){
  app.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, 'index.html'));;
});

io.on('connection', function(socket){

  db.each('SELECT nick, msg, timestamp FROM messages LIMIT 10', function (err, row) {
    //console.log(row);
    if(err) throw err;
    socket.emit('loadmsg', row);
  });

  socket.on('new user', function(data, callback){
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }

  });

  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(message) {
    console.log('message: ' + message.msg + " date: " + message.timestamp);
    message.nick = socket.nickname
    storeMsg(message);
    io.sockets.emit('new message', {msg: message.msg, nick: message.nick, timestamp: message.timestamp}); // send message to everyone including me (except me use socket.broadcast.edmit)
  });

  socket.on('disconnect', function(data){
    if (!socket.nickname) return;
    delete users[socket.nickname];
    console.log(socket.nickname + " has left the chat room")
    updateNicknames();
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});



