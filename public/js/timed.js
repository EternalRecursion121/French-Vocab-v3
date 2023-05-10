const input = document.getElementById('attempt_input');
const word_header = document.getElementById('word');
const correct_header = document.getElementById('correct');
const answer = document.getElementById('correct_answer');
const streak_tracker = document.getElementById('streak');
const e2f_checkbox = document.getElementById('e2f_switch');
const e2f_label = document.getElementById('e2f_label');
const forgive_accents = document.getElementById('forgive_accents_switch');
const alt_btn = document.getElementById('altBtn');
const timer = document.getElementById('time');
const point_tracker = document.getElementById('points');
var ans = '';
var score, on_name_submit_button, end, interval;

function start() {
  new_word();
  end = Date.now() + 120000;
  id = interval = setInterval(() => {
    let mins, seconds;
    [mins, seconds] = convert_time(end - Date.now());
    if (mins){
      timer.innerHTML = `${mins}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timer.innerHTML = `${Math.ceil(seconds.toString().padStart(2, '0'))}`;
    }
    if (seconds < 0) {
      clearInterval(id);
    }
  }, 200);
  input.readOnly = false;
}


function countdown(){
  for (let i=0;i < 3;i++){
    setTimeout(() => {
      timer.innerHTML = 3-i;
      if (i==2){
        setTimeout(start, 1000);
      }
    }, i*1000);
  }
}

done_btn.addEventListener('click', countdown);


function convert_time(ms){
  seconds = Math.ceil(ms/1000);
  mins = Math.floor(seconds/60);
  seconds %= 60;
  return [mins, seconds]
}

function new_word(){
  socket.emit('word-req', !e2f_checkbox.checked);
}

function change_checkbox() {
  console.log('JEFFF')
  if (e2f_checkbox.checked){
    console.log('checked')
    e2f_label.innerHTML = 'French to English';
  } else {
    console.log('not checked')
    e2f_label.innerHTML = 'English to French';
  }
}

socket.on('new-word', (word) => {
  word_prev = word.split('***')[0]
  word_header.innerHTML = word_prev;
});

done_btn.addEventListener('click', countdown);

socket.on('correct', (correct, translated, points, streak, multiplier) => {
  alt_btn.disabled = false;
  translated = translated.split('***')
  part1 = translated[0]
  part2 = translated[1] || ''
  alternative_modal_set(word_prev, part1, part2, ans);
  console.log(points)
  point_tracker.innerHTML = points;
  streak_tracker.innerHTML = `Streak: ${streak} (x${multiplier})`;
  answer.innerHTML = 'Answer: ' + part1;
  if (correct){
    correct_header.innerHTML = 'Correct';
  } else {
    correct_header.innerHTML = 'Incorrect';
    end -= 5000;
    timer.style.color = "red";
    timer.className = "text-danger";
    setTimeout(() => {
      timer.className = "text-light";
    }, 200);
  }
  alt_btn.innerHTML = "Submit Alternate Translation for<br> <b>"+word_prev+"</b>"
  new_word();
});


input.addEventListener('keydown', e => {
  if (e.key == 'Enter' && input.value){
    ans = input.value;
    socket.emit('word-submit', ans, forgive_accents_switch.checked);
    input.value = '';
  }
});

socket.on('game_over', (score, rank, until_next_rank=null) => {
  clearInterval(interval);
  let game_over_p = document.getElementById('gameOverP');
  let competitive_switch = document.getElementById('competitiveSwitch');
  if (competitive_switch.checked){
    if (rank){
      if (rank == 1){
        game_over_p.innerHTML = `Congratulations, you have come <b>rank ${rank}</b> on the leaderboard with a score of <b>${score}</b>!`
      } else {
        game_over_p.innerHTML = `Congratulations, you have come <b>rank ${rank}</b> on the leaderboard with a score of <b>${score}</b>!<br>You only needed <b>${until_next_rank} more points to get to rank ${rank-1}`
      }
    } else {
      $('#nameInputDiv').hide();
      $('#submit-score-btn').hide();
      game_over_p.innerHTML = `Unfortunately you didn't make it on the leaderboard. You only needed <b>${until_next_rank}</b> more points to make it to 10th place`
    }
  } else {
    $('#nameInputDiv').hide();
    $('#submit-score-btn').hide();
    game_over_p.innerHTML = `Finished with a score of ${score}`;
  }
  $('#submit-score-btn').click(name_submit_button);
  $('#game-over-modal').modal('show');
});

function name_submit_button(){
  let name = $('#nameBox').prop("value");
  if (name){
    socket.emit('leaderboard-entry', name);
    $('#nameBox').prop('disabled', true);
    $('#submit-score-btn').prop('disabled', true);
  }
}
