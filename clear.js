const Database = require('@replit/database');
const db = new Database;
const fs = require('fs');

const module_names = JSON.parse(fs.readFileSync('module_names.json'));
const gamemodes = ['speedrun',
                   'survival',
                   'timed']

db.empty().then(() => {
  db.set('alternate_translations', []).then(() => {});
  
  var leaderboard = {}
  
  for (let gamemode of gamemodes){
    let gamemode_leaderboard = {};
    gamemode_leaderboard['all'] = [];
    gamemode_leaderboard['section_1'] = [];
    gamemode_leaderboard['section_2'] = [];
    for (let i in module_names){
      gamemode_leaderboard[i] = [];
    }
    leaderboard[gamemode] = gamemode_leaderboard;
  }
  
  db.set("leaderboard", leaderboard).then(() => {});
});
