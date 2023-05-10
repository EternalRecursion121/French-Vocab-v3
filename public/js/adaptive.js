const input = document.querySelector('input');
const word_header = document.getElementById('word');
const correct_header = document.getElementById('correct');
const answer = document.getElementById('correct_answer');
const point_tracker = document.getElementById('points');
const streak_tracker = document.getElementById('streak');
var e2f = false;


function new_word(e2f){
  socket.emit('word-req', e2f);
}

done_btn.addEventListener('click', new_word);

socket.on('new-word', (word) => {
    console.log(word);
    word_header.innerHTML = word;
  });

socket.on('correct', (correct, translated, points, streak, multiplier) => {
  point_tracker.innerHTML = points;
  streak_tracker.innerHTML = `Streak: ${streak} (x${multiplier})`
  answer.innerHTML = 'Answer: ' + translated;
  if (correct){
    correct_header.innerHTML = 'Correct';
  } else {
    correct_header.innerHTML = 'Incorrect';
  }
  new_word(e2f);
})

socket.emit('gamemode', 'default');
new_word(e2f);

input.addEventListener('keydown', e => {
  if (e.key == 'Enter' && input.value){
    socket.emit('word-submit', input.value, false);
    input.value = '';
  }
});




