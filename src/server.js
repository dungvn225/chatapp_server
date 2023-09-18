

const express =require('express');
const path =require('path')
const app =express();
const http = require('http');
const Filter = require('bad-words')
const {createMessage} =require('./utils/createMessage')
const {getUserList,addUser,removeUser} =require('./utils/users')
const cors=require('cors')


app.use(cors({
  origin:process.env.SERVER_URL,
  methods:['GET','DELETE','PUT','POST'],
 
}))


const server = http.createServer(app);
const socketio=require('socket.io');
const io=socketio(server)
 

io.on('connection', (socket) => {
  
  socket.on('join room from client to server',({room,username})=>{
  
    socket.join(room) 
     
   socket.emit('send welcome message from server to client',createMessage(`Welcome to room ${room}`,username,socket.id))  
   socket.broadcast.to(room).emit('send join message from server to client',createMessage(`${username} just joined the room`));
   socket.on('send message from client to server',(messageText,callback)=>{ 
    const filter = new Filter();
   
     if(filter.isProfane(messageText)){ 
      return callback('Messages cannot contain inappropriate words!') 
     }
      
      
     io.to(room).emit('send message from server to client',createMessage(messageText,username,socket.id)) 
     callback();
    })
   
    socket.on('share location from client to server',({latitude,longitude})=>{
        const linkLocation=`https://www.google.com/maps?q=${latitude},${longitude}`;
        io.to(room).emit('share location from server to client',createMessage(linkLocation,username,socket.id)) 
    })

    const newUser= {
      id:socket.id,
      username:username,
      room
  }
    addUser(newUser)
  io.to(room).emit('send userList from server to client',getUserList(room));
  socket.on('disconnect', () => { 
    io.to(room).emit(`message just left the room`,createMessage(`${username} just left the room`));
    removeUser(socket.id) 
    io.to(room).emit('send userList from server to client',getUserList(room)); 
    
  }); 
  })


});

const port =process.env.PORT || 8080
server.listen(port,()=>{
  console.log(`app run on http://localhost:${port}`) 
})

