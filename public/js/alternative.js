const word_p = document.getElementById('word_thing');
const translations = document.getElementById('translations');
const word_input = document.getElementById('wordInput');
const submit_btn = document.getElementById('altSubmitBtn');

function alternative_modal_set(word_prev, part1, part2, ans){
  word_p.innerHTML = 'Submit an alternative translation for <b>' + word_prev + '</b> to be reviewed. Thanks for helping.';
  if (part2){
    part2 = ', ' + part2
  }
  translations.innerHTML = 'Current Translations: ' + part1 + part2;
  word_input.value = ans;

  submit_btn.onclick = () => {
    if (word_input.value){
      console.log(word_prev)
      socket.emit('alt-translation', word_prev, word_input.value);
      console.log('submitted')
    }
  };
}

