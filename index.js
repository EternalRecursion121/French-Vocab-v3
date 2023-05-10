const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const Database = require('@replit/database');
const db = new Database();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const session = require('express-session');
const f = require('./functions');
const fs = require('fs');
//https://www.youtube.com/watch?v=X5hrUGFhsXo

let rawdata = fs.readFileSync('vocab.json');
var vocab = JSON.parse(rawdata);

rawdata = fs.readFileSync('module_names.json');

const stream = fs.createWriteStream("user_logs.txt", {flags:'a'});

const point_value = 50;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({ secret: process.env['session_secret'], secure: true }))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index.html', {})
});

app.get('/play/:gamemode', (req, res) => {
  switch (req.params.gamemode) {
    default:
    case 'default':
      res.render('default_play.html');
      break;
    case 'adaptive':
      res.render('adaptive.html');
      break;
    case 'pvp':
      res.render('pvp.html');
      break;
    case 'pvp2':
      res.render('pvp.html');
      break;
    case 'survival':
      res.render('survival.html');
      break;
    case 'speedrun':
      res.render('speedrun.html');
      break;
    case 'timed':
      res.render('timed.html');
      break;
  }
});

app.get('/leaderboard', (req, res) => {
  res.render('leaderboard.html')
});

io.on('connection', socket => {
  var player
  console.log('User Connected');
  session['socket_id'] = socket.id;

  socket.on('test', () => {
    console.log("TEST");
    socket.emit('test');
  });
  
  socket.on('alt-translation', async (word, alt) => {
    console.log('Alternate Translation: ' + [word, alt].toString());
    db.get("alternate_translations").then(async alts => {
      alts.push([word, alt]);
      db.set("alternate_translations", alts).then(() => {
        console.log('Done');
      });
    });
  });

  socket.on('leaderboard-req', async (module, gamemode) => {
    let leaderboard = await db.get("leaderboard");
    console.log(leaderboard[gamemode][module]);
    socket.emit('leaderboard', leaderboard[gamemode][module]);
  });


  socket.on('gamemode', (gamemode, modules, section, competitive) => {
    var words = modules.map(i => vocab[i]).flat();
    stream.write(`Playing ${gamemode} at ${new Date().toGMTString()}\n`);
    switch (gamemode) {
      case 'default':
        var points = 0;
        var streak = 0;
        var multiplier = 1;
        socket.on('word-req', (e2f) => {
          console.log('word requested')
          var word = f.choose(words);
          var to_translate = word['French']
          var translated = word['English']
          if (e2f) {
            [to_translate, translated] = [translated, to_translate];
          }
          console.log(translated);
          socket.emit('new-word', to_translate);
          socket.once('word-submit', (word, forgive_accents) => {
            correct = f.is_correct(forgive_accents, word, translated);
            if (correct) {
              streak++;
              points += multiplier * point_value
            } else {
              streak = 0;
            }
            multiplier = Math.round(10 + streak * 2) / 10;
            console.log(points, multiplier)
            socket.emit('correct', correct, translated, points, streak, multiplier);
          });
        });
        break;
      case 'pvp':
        players[player] = socket.id;
        var points = 0;
        var streak = 0;
        var multiplier = 1;
        socket.on('word-req', (e2f) => {
          console.log('word requested')
          var word = f.choose(words);
          var to_translate = word['French'];
          var translated = word['English'];
          if (e2f) {
            [to_translate, translated] = [translated, to_translate];
          }
          console.log(translated);
          socket.emit('new-word', to_translate);
          socket.once('word-submit', (word, forgive_accents) => {
            correct = f.is_correct(forgive_accents, word, translated);
            if (correct) {
              streak++;
              points += multiplier * point_value;
            } else {
              streak = 0;
            }
            multiplier = Math.round(10 + streak * 2) / 10;
            socket.emit('correct', correct, translated, points, streak, multiplier);
            socket.to(players[1-player]).emit("opponent_score", points);
          });
        });
        break;
      case 'survival':
        var words = modules.flatMap(i => vocab[i]);
        var points = 0;
        var streak = 0;
        var multiplier = 1;
        var lives = 6;
        socket.on('word-req', (e2f) => {
          console.log('word requested')
          var word = f.choose(words);
          var to_translate = word['French']
          var translated = word['English']
          if (e2f) {
            [to_translate, translated] = [translated, to_translate];
          }
          console.log(translated);
          socket.emit('new-word', to_translate);
          socket.once('word-submit', async (word, forgive_accents) => {
            correct = f.is_correct(forgive_accents, word, translated);
            if (correct) {
              streak++;
              points += multiplier * point_value
              if (!(streak % 5) && lives < 6){
                lives++;
              }
            } else {
              if (!(--lives)){
                socket.removeAllListeners(['word-req']);
                if (competitive){
                  let module = (section == 'none') ? modules[0] : section;
                  let ranking_results = await f.find_rank('survival', module, points);
                  socket.emit('game_over', points, ...ranking_results);
                  if (ranking_results[0]){
                    socket.once('leaderboard-entry', (name => {
                      if (section == 'none'){
                        f.add_to_leaderboard('survival', module, [points, name]);
                      } else {
                        f.add_to_leaderboard('survival', section, [points, name]);
                      }
                    }));
                  }
                } else {
                  socket.emit('game_over', points, false, false);
                }
              }
              streak = 0;
            }
          multiplier = Math.round(10 + streak * 2) / 10;
          socket.emit('correct', correct, translated, points, streak, multiplier, lives);
          });
        });
        break;
      case 'speedrun':
        var words = modules.flatMap(i => vocab[i]);
        var start_length = words.length;
        var start, on_word_req;
        var streak = 0;
        on_word_req = (e2f) => {
          let word, index;
          [word, index] = f.chooseI(words);
          var to_translate = word['French']
          var translated = word['English']
          if (e2f) {
            [to_translate, translated] = [translated, to_translate];
          }
          console.log(translated);
          socket.emit('new-word', to_translate, start_length-words.length, start_length);
          socket.once('word-submit', async (word, forgive_accents) => {
            correct = f.is_correct(forgive_accents, word, translated);
            if (correct) {
              words.splice(index, 1);
              streak++;
              if (words.length == 0){
                console.log("END")
                socket.removeAllListeners(['word-req']);
                let elapsed = Date.now() - start;
                if (competitive){
                  let module = (section == 'none') ? modules[0] : section;
                  console.log(module)
                  let ranking_results = await f.find_rank('speedrun', module, elapsed);
                  socket.emit('game_over', elapsed, ...ranking_results);
                  if (ranking_results[0]){
                    socket.once('leaderboard-entry', (name => {
                      if (section == 'none'){
                        f.add_to_leaderboard('speedrun', module, [elapsed, name]);
                      } else {
                        f.add_to_leaderboard('speedrun', section, [elapsed, name]);  
                      }
                    }));
                  }
                } else {
                  socket.emit('game_over', elapsed, false, false);
                }
              }
            } else {
              start -= 5000;
              streak = 0;
            }
            socket.emit('correct', correct, translated, points, streak);
          });
        }
        socket.once('word-req', (e2f) => {
          start = Date.now();
          on_word_req(e2f);
          socket.on('word-req', on_word_req)
        });
        break;
      case 'timed':
        var words = modules.flatMap(i => vocab[i]);
        var end, interval, game_over_check, on_word_req;
        var streak = 0;
        var points = 0;
        var streak = 0;
        var multiplier = 1;
        console.log(1)
        game_over_check = async (end) => {
          if (Date.now() >= end){
            socket.removeAllListeners(['word-req']);
            if (competitive){
              let module = (section == 'none') ? modules[0] : section;
              let ranking_results = await f.find_rank('timed', module, points);
              socket.emit('game_over', points, ...ranking_results);
              if (ranking_results[0]){
                socket.once('leaderboard-entry', (name => {
                  if (section == 'none'){
                    f.add_to_leaderboard('timed', module, [points, name]);
                  } else {
                    f.add_to_leaderboard('timed', section, [points, name]);
                  }
                }));
              }
            } else {
              socket.emit('game_over', points, false, false);
            }
            clearInterval(interval);
          }
        }
        on_word_req = (e2f) => {
          console.log(2)
          let word, index;
          [word, index] = f.chooseI(words);
          var to_translate = word['French']
          var translated = word['English']
          if (e2f) {
            [to_translate, translated] = [translated, to_translate];
          }
          console.log(translated);
          socket.emit('new-word', to_translate);
          socket.once('word-submit', (word, forgive_accents) => {
            console.log("time left", (end - Date.now()) / 1000);
            correct = f.is_correct(forgive_accents, word, translated);
            if (correct) {
              streak++;
              points += multiplier * point_value;
            } else {
              end -= 5000;
              streak = 0;
              clearInterval(interval);
              interval = setInterval(game_over_check, 10, end);
            }
            multiplier = Math.round(10 + streak * 2) / 10;
            socket.emit('correct', correct, translated, points, streak, multiplier);
          });
        }
        socket.once('word-req', (e2f) => {
          console.log(3)
          end = Date.now() + 120000;
          interval = setInterval(game_over_check, 10, end);
          on_word_req(e2f);
          socket.on('word-req', on_word_req);
        });
        break;
    }
  });
  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

server.listen(3000, () => {
  console.log('server started');
});
