const Database = require('@replit/database');
const db = new Database();

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function chooseI(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return [choices[index], index];
}

function is_correct(forgive_accents, attempt, translated){
  try{
    translated = translated.normalize("NFD").toLowerCase().replace('***', ';').match(/[\da-z\p{Diacritic};,\s\/()]/gu).join('')
    attempt = attempt.normalize("NFD").toLowerCase().match(/[\da-z\p{Diacritic}\s]/gu).join('')
    if (forgive_accents){
      translated = translated.replace(/\p{Diacritic}/gu, '')
      attempt = attempt.replace(/\p{Diacritic}/gu, '')
    }
    var re = /(?<=;|^|,).*?(?=;|$|,)/g;
    var possibilities = translated.matchAll(re);
    for (let possible of possibilities){
      possible = possible[0];
      switch (attempt.trim()) {
        case possible.trim():
        case possible.replace(/\/[a-z]+/g, '').trim():
        case possible.replace(/[a-z]+\//g,'').trim():
        case possible.replace(/[()]/g, '').trim():
        case possible.replace(/\(.*\)/g, '').trim():
          return true
      }
      var possible_no_spaces = possible.replace(/\s/g, '');
      switch (attempt.replace(/\s/g, '')){
        case possible_no_spaces:
        case possible_no_spaces.replace(/\(.*\)/g, ''):
        case possible_no_spaces.replace(/\/[a-z]+/g, ''):
        case possible_no_spaces.replace(/[a-z]+\//g,''):
        case possible.replace(/[()]/g, '').trim():
        case possible.replace(/\(.*\)/g, '').trim():
          return true
      }
    }
  } catch (err){
    console.log(err);
    return false
  }
  var re = new RegExp('^|\/' + attempt + '$|\/')
  return (translated == "lequel/laquelle/lesquels/lesquelles" && translated.match(re))
}

function add_to_leaderboard(gamemode, module, new_entry){
  db.get("leaderboard").then(leaderboard => {
    let module_leaderboard = leaderboard[gamemode][module];
    module_leaderboard.push(new_entry);
    if (gamemode == 'speedrun'){
      module_leaderboard.sort((a, b) => b[0] - a[0]);
    } else {
      module_leaderboard.sort((a, b) => a[0] - b[0]);
    }
    if (module_leaderboard.length > 10){
      if (module_leaderboard[0] == new_entry){
        return
      }
      module_leaderboard.shift();
    }
    leaderboard[gamemode][module] = module_leaderboard;
    db.set("leaderboard", leaderboard).then(() => {
      console.log('done');
    });
  });
}

async function find_rank(gamemode, module, score){
  leaderboard = await db.get("leaderboard");
  let score_leaderboard = leaderboard[gamemode][module].map((x) => x[0]);
  score_leaderboard.push(score);
  if (gamemode == 'speedrun'){
      score_leaderboard.sort((a, b) => b[0] - a[0]);
    } else {
      score_leaderboard.sort((a, b) => a[0] - b[0]);
    }
  let index = score_leaderboard.indexOf(score);
  let rank = score_leaderboard.length-index
  if (rank <= 10){
    if (rank == 1){
      return [rank];
    }
    return [rank, score_leaderboard[index+1]-score];
  }
  return [false, score_leaderboard[index+1]-score];
}

console.log(is_correct(true, 'boucher', 'boucher/bouchère (m/f)'))

module.exports = {
  choose:choose,
  chooseI:chooseI,
  is_correct:is_correct,
  add_to_leaderboard:add_to_leaderboard,
  find_rank:find_rank
}
