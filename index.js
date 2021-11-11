var session = require('express-session')
port = 25567;
const cookie = require("cookie");
const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http); 
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
var logins = require ("./credits");

// Exemplde de credits.js

// module.exports = {
//   host: "92.222.250.141",
//   port: 3306,
//   database: "s7_ftw",
//   user: "u7_UODJ35tmXh",
//   password: "@na72g0TD^aa7uYllW^tX17f",
//   dialect: 'mysql'
// };




const rateLimit = require("express-rate-limit");
var md5 = require('md5');
const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 500 
});

// 500req / 3mins

app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));
app.use(limiter);

const dbU = mysql.createConnection({
  host: logins.host,
  port: logins.port,
  database: logins.database,
  user: logins.user,
  password: logins.password,
  dialect: logins.dialect
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

app.get('/500', (req, res) => {
  res.send("Code d'erreur ACT-0003 ou ACT-0004, rendez-vous sur le support.", 500)
})

app.get('/whyT', (req, res) => {
  res.sendFile(__dirname + '/html/whyT.html')
})

app.post('/authlog', (req, res) => {
  dbU.query("SELECT * FROM \`users\` where \`username\` = ?", [req.body.username] ,function (err, result) {
    if (err) console.log(err) ;
    if(JSON.stringify(result).length > 20) {
      dbU.query(`SELECT * FROM \`users\` where \`username\` = ?`, [req.body.username], function (err, result) {
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
  res.cookie('party', req.query['game'])
  if(req.cookies['username'] == null) {
    res.sendFile(__dirname + '/html/auth.html')
  } else {
    res.redirect('/party/')
  }
})

app.get('/auth2/', (req, res) => {
  // 
  console.log(req.query['game'])
  if(req.query['game'] == undefined) {
    res.sendStatus(418)
  } else {
    res.redirect(`/auth?game=` + req.query['game'])
  }
  // res.cookie('party', 'CEN-001')
  // if(req.cookies['username'] == null) {
  //   res.sendFile(__dirname + '/html/auth.html')
  // } else {
  //   res.redirect('/party/')
  // }

})

app.get('/party', (req, res) => {
  res.sendFile(__dirname + '/html/party.html')
})
app.use('/verify', (req, res) => {
  res.cookie('username', "[J] " + req.body.username)

  res.redirect("/party")
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/html/login.html')
})

app.get('/main', (req, res) => {
  console.log("GET /main args : ", req.query["e"])
  if(req.query["e"] == "launched") {
    res.sendFile(__dirname + '/html/indexErrorLaunched.html', {connect:req.cookies['username']})
  } else {
    res.sendFile(__dirname + '/html/index.html', {connect:req.cookies['username']})
  }
})

app.get('/d', (req, res) => {

})
  

app.use(express.static('style'));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

    console.log("Tryied to loggin : " + usr)
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
  socket.on("a", async () => {
    io.to(cookies['party']).emit('gameAction', "0002", "a/startBip");
    io.to(cookies['party']).emit('GameStatus', 'Début de la partie dans 5');
    await sleep(1000)
    io.to(cookies['party']).emit('GameStatus', 'Début de la partie dans 4');
    await sleep(1000)
    io.to(cookies['party']).emit('GameStatus', 'Début de la partie dans 3');
    await sleep(1000)
    io.to(cookies['party']).emit('GameStatus', 'Début de la partie dans 2');
    await sleep(1000)
    io.to(cookies['party']).emit('GameStatus', 'Début de la partie dans 1');
    await sleep(1000)
    io.to(cookies['party']).emit('GameStatus', 'Début !');
    console.log(cookies['party'] + " has been started.");
    io.to(cookies['party']).emit('gameAction', "0001");
        dbU.query(`UPDATE \`s7_ftw\`.\`data\` SET \`state\`='Launched' WHERE  \`name\`=${cookies['party']};";`, function (err, result) {
          if (err) console.log(err) ;
          // console.log(result.toString())
        });
  });
  socket.on("a1", () => {
    io.to(cookies['party']).emit('gameAction', "0001");
    io.to(cookies['party']).emit('GameStatus', 'Vous êtes sur la CEN-001 selon la bdd\n\nEn attente du chef... (gabidut76)')
  });
  socket.on("getPartys", () => {
    if(partys["nothing"]) {
      socket.emit('listPartys', "Aucune partie en cours :(", "0 / 0", "N/A")
    }
  });
  socket.on('messageParty', (content) => {
    min = 100000
    max = 999999
    console.log(cookies['username'])
    if(cookies['username'] == "undefined" ||cookies['username' == null ]|| cookies['username'] == undefined) {
      socket.emit('e', 500)
    } else {
      if(cookies['rank']) {
        if(cookies['rank'] == 'owner') {
          io.to(cookies['party']).emit('msg', "<span id=\"owner\">👑 </span>" + cookies['username'] + " - " + escape(content), Math.random() * (max - min + 1) + min);
        }
        if(cookies['rank'] == 'moderator') {
          io.to(cookies['party']).emit('msg', "<span id=\"mod\">🛡️ </span>" + cookies['username'] + " - " + escape(content), Math.random() * (max - min + 1) + min);
        }
      } else {
        io.to(cookies['party']).emit('msg', cookies['username'].replace('🛡️', "❌").replace('👑', "❌") + " - " + escape(content), Math.random() * (max - min + 1) + min);
      }
    }

  });
  socket.on('add', () => {
    partys = JSON.parse(`[{"CEN-001":["FindTheWord"]}]`)

    fs.readdir('games', (err, files) => {
      files.forEach(file => {
        // console.log(file);
        var data = fs.readFileSync(`games/${file}`, 'utf8');
        var values = JSON.parse(data.toString());
        console.log(values[0]);
        v = io.in(cookies['party']).allSockets()
        const socketsInARoomInSomeNamespace = io
        .in(values[0]['name'])
        .fetchSockets()
        .then((room) => {
          socket.emit('listPartys', values[0]['name'], `${room.length} / 20`, values[0]['host'])
        });
      });
    });
    
    

  });
  socket.on('GameStatus?', () => {
    //socket.emit('GameStatus', cookies['party'].status)
    dbU.query(`SELECT * FROM \`data\` where \`name\` = "${cookies['party']}";`, function (err, result) {
      if (err) console.log(err) ;
      // console.log(result.toString())
      if(result.toString() == '') {
        socket.emit('e', 500)
      } else {
        socket.emit('GameStatus', Object(result)[0]['state']);

      }
    });


    

  });
  socket.on('GameStatus', (status) => {
    dbU.query(`UPDATE \`data\` SET \`state\` = ? WHERE \`data\`.\`name\` = ?`, [status, cookies['party']], function (err, result) {
      dbU.query(`SELECT * FROM \`data\` where \`name\` = ?`, [cookies['party']],  function (err, result) {
        if (err) console.log(err) ;
        // console.log(result)
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