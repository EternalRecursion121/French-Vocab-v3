const module_select = document.getElementById('select-module')
const gamemode_select = document.getElementById('select-gamemode')
const tableBody = document.getElementById('tableBody')

function request_leaderboard(){
  socket.emit('leaderboard-req', module_select.value, gamemode_select.value);
}

function convert_time(ms){
  hours = Math.floor(ms/3600000);
  ms %= 3600000;
  mins = Math.floor(ms/60000);
  ms %= 60000;
  seconds = Math.floor(ms/1000);
  ms %= 1000;
  return [hours, mins, seconds, ms];
}

$('.form-select').on('change', request_leaderboard);

socket.on('leaderboard', (leaderboard) => {
  $(tableBody).empty();
  if (leaderboard.length > 0){
    for (entry of leaderboard.reverse().entries()){
      if (gamemode_select.value != 'speedrun'){
        $(tableBody).append(`<tr class="table-dark">
                <th scope="row" class="table-dark">${entry[0]}</th>
                <td class="table-dark">${entry[1][1]}</td>
                <td class="table-dark">${entry[1][0]}</td>
              </tr>`);
      } else {
        let hours, mins, seconds, ms, time_string;
        let score_head = document.getElementById('scoreHead');
        [hours, mins, seconds, ms] = convert_time(time);
        if (hours){
          time_string = `${hours}h ${mins}m ${seconds}s`
        } else {
          time_string = `${mins}m ${seconds}s ${ms}ms`
        }
        score_head.innerHTML = 'Time'
        $(tableBody).append(`<tr class="table-dark">
                <th scope="row" class="table-dark">${entry[0]}</th>
                <td class="table-dark">${entry[1][1]}</td>
                <td class="table-dark">${time_string}</td>
              </tr>`);
      }
    }
  } else {
    $(tableBody).append(`<tr class="table-dark">
              <th colspan="3" scope="row" class="table-dark">Empty Leaderboard</th>
            </tr>`);
  }
});
request_leaderboard();