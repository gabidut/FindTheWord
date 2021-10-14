var session = require('express-session')
port = 25567;
const cookie = require("cookie");
const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http); 
const cookieParser = require('cookie-parser');
const mysql = require('mysql');

const dbU = mysql.createConnection({

  host: "149.91.91.92",
  port: 3306,
  database: "gabidut76_ftw",
  user: "ftw_admin",
  password: "~Bhl28x7",
  dialect: 'mysql'
});

dbU.connect(function(err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
});

app.use(cookieParser());
app.engine('html', require('ejs').renderFile);

http.listen(25567)
app.use(express.urlencoded());
app.use(express.json()); 
var partys = JSON.parse(`{"nothing":"nothing"}`);

app.get('/', (req, res) => {
    return res.redirect('main');
})

app.get('/whyT', (req, res) => {
  res.sendFile(__dirname + '/html/whyT.html')
  
})

app.post('/authlog', (req, res) => {
  dbU.query(`SELECT * FROM \`users\` where \`username\` = "${dbU.escape(req.body.username)}";`, function (err, result) {
    if (err) console.log(err) ;
    if(JSON.stringify(result).length > 20) {
      dbU.query(`SELECT * FROM \`users\` where \`username\` = "${dbU.escape(req.body.username)}";`, function (err, result) {
        if(Object(result)[0]["password"] == req.body.password) {
          res.cookie('username', req.body.username)
          res.cookie('rank', Object(result)[0]["rank"])
          res.redirect("main")
          console.log("ok")
        }
      });
    } else {
      console.log("refused.")
      res.sendStatus(403)
    }
    
  });
  // res.sendFile(__dirname + '/html/authlog.html')
})
app.get('/auth', (req, res) => {
  res.sendFile(__dirname + '/html/auth.html')
})

app.get('/auth/CEN-001', (req, res) => {
  res.cookie('party', 'CEN-001')
  if(req.cookies['username'] == null) {
    res.sendFile(__dirname + '/html/auth.html')
  } else {
    res.redirect('/party/')
  }

})

app.get('/party', (req, res) => {
  res.sendFile(__dirname + '/html/party.html')
})
app.use('/verify', (req, res) => {
  res.cookie('username', "[J] " + req.body.username)

  res.redirect("/main")
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/html/login.html')
})

app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/html/index.html', {connect:req.cookies['username']})
})

app.get('/d', (req, res) => {

})
  

app.use(express.static('style'));


// io.on('add', socket => {
//     console.log("oké")
//     socket.emit('listPartys', "Aucune partie en cours :(", "0 / 0", "N/A")
// })

rooms = {};
io.on('connection', (socket) => {
  const cookies = cookie.parse(socket.request.headers.cookie || "");
  socket.on("connectMe", () => {
    if(cookies['party'] == null) {
      socket.emit('connected', "Impossible de vous connecter.")
    } else {
      socket.join(cookies['party']);
      socket.emit('connected', "Vous êtes connecté à la partie :" + cookies['party'])
    }
  });
  socket.on("connectMe", () => {
    if(cookies['party'] == null) {
      socket.emit('connected', "Impossible de vous connecter.")
    } else {
      socket.join(cookies['party']);
      socket.emit('connected', "Vous êtes connecté à la partie :" + cookies['party'])
    }
  });
  socket.on("checkLog", (usr, passwd) => {

    console.log("Tryied to loggin : " + usr + " " + passwd)
  });
  socket.on("party?", () => {
    if(cookies['party'] == null) {
      socket.emit('party!', "Error no party...")
    } else {
      socket.emit('party!', cookies['party'])
    }
  });
  socket.on("login?", () => {
    if(cookies['username'] == null) {
      socket.emit('login!', "Se connecter", "login")
    } else {
      socket.emit('login!', cookies['username'], "whyT")
    }
  });
  socket.on("getPartys", () => {
    if(partys["nothing"]) {
      socket.emit('listPartys', "Aucune partie en cours :(", "0 / 0", "N/A")
    }
  });
  socket.on('messageParty', (content) => {
    min = 100000
    max = 999999
    if(cookies['rank']) {
      if(cookies['rank'] == 'owner') {
        io.to(cookies['party']).emit('msg', "<span id=\"owner\">👑 </span>" + cookies['username'] + " - " + content, Math.random() * (max - min + 1) + min);
      }
      if(cookies['rank'] == 'moderator') {
        io.to(cookies['party']).emit('msg', "<span id=\"mod\">🛡️ </span>" + cookies['username'] + " - " + content, Math.random() * (max - min + 1) + min);
      }
    } else {
      io.to(cookies['party']).emit('msg', cookies['username'].replace('🛡️', "❌").replace('👑', "❌") + " - " + content, Math.random() * (max - min + 1) + min);
    }
  });
  socket.on('add', () => {
    partys = JSON.parse(`[{"CEN-001":["FindTheWord"]}]`)
    
    v = io.in(cookies['party']).allSockets()
    const socketsInARoomInSomeNamespace = io
    .in(cookies['party'])
    .fetchSockets()
    .then((room) => {
      socket.emit('listPartys', partys, `${room.length} / 20`, Object.keys(partys)[1])
    });
  });
  socket.on('GameStatus?', () => {
    //socket.emit('GameStatus', cookies['party'].status)
    dbU.query(`SELECT * FROM \`data\` where \`name\` = "${cookies['party']}";`, function (err, result) {
      if (err) console.log(err) ;
      socket.emit('GameStatus', Object(result)[0]['state']);
    });


    

  });
  socket.on('GameStatus', (status) => {
    dbU.query(`UPDATE \`data\` SET \`state\` = '${dbU.escape(status)}' WHERE \`data\`.\`name\` = '${cookies['party']}';`, function (err, result) {
      dbU.query(`SELECT * FROM \`data\` where \`name\` = "${dbU.escape(cookies['party'])}";`, function (err, result) {
        if (err) console.log(err) ;
        if(!Object(result)[0]['state']) {
          socket.emit('GameStatus', 'mmmh un erreur est survenue..');
          io.to(cookies['party']).emit('GameStatus', 'mmmh un erreur est survenue..');
        } else {
          console.log(Object(result)[0]['state'])
          socket.emit('GameStatus', Object(result)[0]['state'])
          io.to(cookies['party']).emit('GameStatus', Object(result)[0]['state']);
        }
      });
      if (err) console.log(err) ;
    });
    // io.to(cookies['party']).emit('msg', cookies['username'] + " - " + content);
  });
  socket.on('nPlayer?', () => {
      v = io.in(cookies['party']).allSockets()
      const socketsInARoomInSomeNamespace = io
      .in(cookies['party'])
      .fetchSockets()
      .then((room) => {
        socket.emit('nPlayer!', room.length);
        socket.to(cookies['player']).emit('nPlayer!', room.length);
      });
  });
  socket.on("disconnect", () => {
  });
  socket.on('disconnecting', () => {
      const clientsInRoom = io.in(cookies['party']).allSockets()
      socket.emit('test', clientsInRoom)
      // Promise.all([clientsInRoom]).then(v => {
      //   v.forEach(v2 => {
      //     console.log(v2)
      //   })
      // })
    });

});


function findClientsSocketByRoomId(roomId) {
  var res = []
  , room = io.sockets.adapter.rooms[roomId];
  if (room) {
      for (var id in room) {
      res.push(io.sockets.adapter.nsp.connected[id]);
      }
  }
  return res;
  }