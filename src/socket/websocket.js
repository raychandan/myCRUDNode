class WebSockets {
     constructor() {
      this.users = [];
    }
   
    connection(client) {
      // event fired when the chat room is disconnected
      client.on("disconnect", () => {
        console.log("Socket disconnected", this.users)
        this.users = this.users.filter((user) => user.socketId !== client.id);
      });
      // add identity of user mapped to the socket id
      client.on("identity",  (userId) => {
        console.log("identity", userId)
        this.users.push({
          socketId: client.id,
          userId: userId.userId,
        });
        client.join(userId.userId)
        console.log("UserId>>>>>>>", this.users)
      });
    }
}
  
module.exports =  WebSockets;