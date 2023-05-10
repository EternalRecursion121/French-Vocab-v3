const input = document.getElementById('attempt_input');
const word_header = document.getElementById('word');
const correct_header = document.getElementById('correct');
const answer = document.getElementById('correct_answer');
const point_tracker = document.getElementById('points');
const streak_tracker = document.getElementById('streak');
const e2f_checkbox = document.getElementById('e2f_switch');
const e2f_label = document.getElementById('e2f_label');
const forgive_accents = document.getElementById('forgive_accents_switch');
const alt_btn = document.getElementById('altBtn');
const lives_container = document.getElementById('lives');
var ans = '';
var score, on_name_submit_button;


function heart_html(type, size){
  switch (type){
    case 0:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="red" class="bi bi-heart" viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
          </svg>\n`;
    case 1:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="red" class="bi bi-heart-half" viewBox="0 0 16 16">
            <path d="M8 2.748v11.047c3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
          </svg>\n`;
    case 2:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="red" class="bi bi-heart-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
          </svg>\n`;
      
  }
}

function lives_html(lives, size){
  return `${heart_html(2, size).repeat(lives/2)}
  ${heart_html(1, size).repeat(lives%2)}
  ${heart_html(0, size).repeat((6-lives)/2)}`;
}

function new_word(){
  socket.emit('word-req', !e2f_checkbox.checked);
}

done_btn.addEventListener('click', new_word);

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

socket.on('correct', (correct, translated, points, streak, multiplier, lives) => {
  alt_btn.disabled = false;
  translated = translated.split('***')
  part1 = translated[0]
  part2 = translated[1] || ''
  alternative_modal_set(word_prev, part1, part2, ans);
  point_tracker.innerHTML = points;
  streak_tracker.innerHTML = `Streak: ${streak} (x${multiplier})`
  answer.innerHTML = 'Answer: ' + part1;
  if (correct){
    correct_header.innerHTML = 'Correct';
  } else {
    correct_header.innerHTML = 'Incorrect';
  }
  alt_btn.innerHTML = "Submit Alternate Translation for<br> <b>"+word_prev+"</b>"
  new_word();
  if (correct && streak % 5){
    lives_container.innerHTML = lives_html(lives, 20);
  } else {
    lives_container.innerHTML = lives_html(lives, 25);
    setTimeout(() => { 
      lives_container.innerHTML = lives_html(lives, 20);
    }, 150);
  }
});


input.addEventListener('keydown', e => {
  if (e.key == 'Enter' && input.value){
    ans = input.value;
    socket.emit('word-submit', ans, forgive_accents_switch.checked);
    input.value = '';
  }
});

socket.on('game_over', (score, rank, until_next_rank=null) => {
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


