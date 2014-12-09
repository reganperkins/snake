var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var snake = require('./snake.js').snake;

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});


snake.snake = {
    session_id: null,
    x: 5,
    y: 5,
};
snake.apples = {};
snake.apples_list = [];


setInterval(function(){
    io.sockets.emit('snake', snake.snake);
}, 150);

setInterval(function(){
    io.sockets.emit('apples', snake.apples);
}, 150);
    

io.on('connection', function(socket){
    socket.public_id = hash(socket.id);
    console.log('connected', socket.id, socket.public_id);
    socket.emit('public_id', socket.public_id);

    if(snake.snake.session_id === null) {
        snake.snake.session_id = socket.public_id;
    } else {
        snake.add_apple(socket.public_id);
    }

    socket.on('key', function(msg){
    });

    socket.on('disconnect', function () {
        console.log('disconnected', socket.id, socket.public_id);
        if(snake.snake && snake.snake.session_id == socket.public_id) {
            // set the snake to the next person
            var next = snake.apples_list[0];
            if(next) {
                snake.snake.session_id = next;

                // remove the apple who became the snake
                snake.remove_apple(next);
                console.log('set the next snake to', next);
            } else {
                snake.snake = null;
                console.log('removed snake');
            }
        } else {
            snake.remove_apple(socket.public_id);
            console.log('removed apple', socket.public_id);
        }
    });

    socket.on('key', function(key){
        if(socket.public_id in snake.apples) {
            var object = snake.apples[socket.public_id];
        } else if(snake.snake.session_id == socket.public_id) {
            var object = snake.snake;
        } else {
            
        }
        if(key == "up") {
            object.y -= 1;
        } else if(key == "down") {
            object.y += 1;
        } else if(key == "left") {
            object.x -= 1;
        } else if(key == "right") {
            object.x += 1;
        }
    });
});

http.listen(8002, function(){
    console.log('listening on *:8002');
});
app.use(express.static(__dirname));


function hash(s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

