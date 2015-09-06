$(document).ready(function(){
  
  var socket = io();
  var $messageForm = $('#send-message');
  var $messageBox = $('#message');
  var $chat = $('#chat')
  
  // Post a message
  $messageForm.submit(function(e){
    e.preventDefault();
    // send event to the server
    var timestamp = new Date();
    socket.emit('send message', {msg: $messageBox.val(), timestamp: timestamp});
    $messageBox.val(' '); // clear the message
  });

  // Display all messages
  socket.on('loadmsg', function(data){
    displayMsg(data);
  });

  socket.on('new message', function(data){
    displayMsg(data);
  });

  function displayMsg(data) {
    $chat.append('<div class="chat-content"><div class="chat-header row">' + '<div class="col-md-5"><b>'+data.nick +'</b></div><div class="col-md-7"><div class="pull-right">'+ formatDate(data.timestamp)+'</div></div></div>' +
      '<div class="chat-body">' + data.msg +  '</div></div>')
  }

  // name Form
  var $nameForm = $('#setName');
  var $nameError = $('#nameError');
  var $nameBox = $('#nickname');

  $nameForm.submit(function(e){
    e.preventDefault();
    socket.emit('new user', $nameBox.val(), function(data){
      if (data) {
        $('.nameWrap').hide();
        $('.contentWrap').show();
      } else {
        $nameError.html('<p class="bg-danger text-danger">That username is already taken. Try again</p>')
      }
    });
    $nameBox.val(' ');
  });

  

  // get usernames from the server
  var $users = $('#users');
  socket.on('usernames', function(data){
    var html = '';
    for(var i=0; i<data.length; i++) {
      html += data[i]  + '<br/>';
    }
    $users.html(html);
  });

  // Format Date
  function formatDate(dateObj) {
    var d = new Date(dateObj);
    var date = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    var hours = d.getHours();
    var minutes = d.getMinutes().toString();

    return month + "/" + date + "/" + year+ " - " + hours + ":" + (minutes.length === 1 ? '0'+minutes : minutes);
  }

  
});



