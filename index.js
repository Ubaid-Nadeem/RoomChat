
const mongoose = require('mongoose');
const express = require("express");
const cors = require("cors")
const bodyparser = require("body-parser");
const http = require('http').createServer();
const app = express();


app.use(bodyparser.json({ limit: "5000kb" }));
app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors());
const { Server } = require("socket.io");

const io = new Server();


app.set('port', process.env.PORT || 300);
const server = app.listen(app.get('port'), () => {
    console.log(`server listen ${server.address().port}`);
});

io.attach(server)


mongoose.connect('mongodb+srv://ubaidnadeem:ubaid12345@testdb.pnswp.mongodb.net/NEW_DB?retryWrites=true&w=majority');

let db = mongoose.connection;
let Room = []




db.on('error', function (error) {
    console.log(error)
})
db.on('open', function () {
    console.log('Connected to MOngoDB');
});







io.on('connection', (socket) => {
    console.log('connected');

    socket.on('create_room', ({ RoomName, Name, ID }) => {
        socket.join(ID);
        Room.push({ Name, RoomName, ID, Member: 1 })
        // console.log(Room);
    })


    socket.emit('getRooms', Room);


    socket.on("message", (data) => {
        // console.log(data)
        socket.to(data.room).emit('get_message', data);

    })


    socket.on("join_request", ({ room, name }) => {
        // console.log(room, name);
        let checker = false

        if (Room.length == 0) {
            socket.emit('joinRequest_reject', { status: false })
        }

        function check(room) {
            Room.forEach((data, index) => {
                // console.log(data)
                if (data.ID == room) {
                    // console.log(room)
                    socket.emit('joinRequest_status', { status: true, data: data })
                    socket.join(room);
                    // data.Member = data.Member++
                    // socket.to(room).emit('Members', data.Member)
                    checker = true
                    let newMember = {
                        message: `${name} joined a Room`,
                        author: name,
                        room: room,
                        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                        status: 'joined'
                    }
                    socket.to(room).emit('joinNewMember',newMember);
                }
                if (++index == Room.length && checker == false) {
                    // console.log('done')
                    socket.emit('joinRequest_reject', { status: false })
                }
            })
        }
        check(room)
    })

    socket.on("connectRoom", (data) => {
        socket.emit('ConnectRoom', data);
    })

});

// http.listen(PORT);
