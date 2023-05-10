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
var ans = ''

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
  new_word()
}

socket.on('new-word', (word) => {
  word_prev = word.split('***')[0]
  word_header.innerHTML = word_prev;
});

socket.on('correct', (correct, translated, points, streak, multiplier) => {
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
})

input.addEventListener('keydown', e => {
  console.log(e.key);
  if (e.key == 'Enter' && input.value){
    ans = input.value;
    socket.emit('word-submit', ans, forgive_accents_switch.checked);
    input.value = '';
  }
});

socket.emit('skdfjdsks', (1,23,232));
socket.emit('fdsf', (1,23,232));
