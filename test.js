const Database = require("@replit/database")
const db = new Database()

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

async function jeff(){
  leaderboard = await db.get("leaderboard");
  let score_leaderboard = leaderboard['speedrun'][4].map((x) => x[0]);
  console.log(score_leaderboard)
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

jeff()