const select_all = document.getElementById('select_all');
const section_1 = document.getElementById('section_1');
const section_2 = document.getElementById('section_2');
const done_btn = document.getElementById('done_btn');
const cbs = document.querySelectorAll('input[name="module"]');
const cbs1 = document.querySelectorAll('.section-1');
const cbs2 = document.querySelectorAll('.section-2');
const competitive_switch = document.getElementById('competitiveSwitch');
const competitive_switch_label = document.getElementById('competitiveSwitchLabel');
const competitive_note = document.getElementById('note')
var section = 'none';

function change_competitive_switch() {
  section = 'none';
  if (competitive_switch.checked){
    competitive_note.innerHTML = 'Note: If competitive mode is on, only one section(any of the buttons above) or module can be selected at a time so that only 38 leaderboards need to be stored per gamemode instead of 274877906944'
    let oneChecked = false;
    competitive_switch_label.innerHTML = 'Competitive';
    cbs.forEach((cb) => {
      cb.addEventListener('click', checkbox_change_competitive);
      if (cb.checked){
        if (oneChecked){
          cb.checked = false;
        } else {
          oneChecked = true;
        }
      }
    });

  } else {
    competitive_note.innerHTML = ''
    competitive_switch_label.innerHTML = 'Practice⠀⠀⠀';
    cbs.forEach((cb) => {
      cb.removeEventListener('click', checkbox_change_competitive);
    });
  }
}

select_all.addEventListener('click', () => {
  section = 'all';
  var allChecked = true
  cbs.forEach((cb) => {
    if (!cb.checked){
      cb.checked = true;
      allChecked = false;
    }
  });
  if (allChecked){
    cbs.forEach((cb) => {
      cb.checked = false;
    });
  }
});

section_1.addEventListener('click', () => {
  section = 'section_1';
  var allChecked = true
  cbs1.forEach((cb) => {
    if (!cb.checked){
      cb.checked = true;
      allChecked = false;
    }
  });
  if (allChecked){
    cbs1.forEach((cb) => {
      cb.checked = false;
    });
  }
});

section_2.addEventListener('click', () => {
  section = 'section_2';
  var allChecked = true
  cbs2.forEach((cb) => {
    if (!cb.checked){
      cb.checked = true;
      allChecked = false;
    }
  });
  if (allChecked){
    cbs2.forEach((cb) => {
      cb.checked = false;
    });
  }
});

done_btn.addEventListener('click', () => {
  const cbs = document.querySelectorAll('input[name="module"]');
  const modules = [...cbs].filter(cb => cb.checked).map(cb => parseInt(cb.id));
  console.log(modules);
  if (modules.length > 0) {
    console.log(gamemode)
    socket.emit('gamemode', gamemode, modules, section, competitive); 
    $("#module-select-modal").modal('hide');
  }
});

function checkbox_change_competitive(e) {
  cbs.forEach((cb2) => {
    if (e.target != cb2){
      cb2.checked = false;
    }
  });
}

if (competitive) {
  cbs.forEach((cb) => {
    cb.addEventListener('click', checkbox_change_competitive);
  });
}