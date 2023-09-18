const formatTime = require('date-format');

const createMessage=(messageText,username,id)=>{
  return {
    messageText,
    username,
    id,
      createdAt:formatTime('dd/MM/yyyy - hh:mm:ss',  new Date())
  }
}
module.exports={
    createMessage
}