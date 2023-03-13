let showUser = document.querySelectorAll('.difficulties-button');

showUser.forEach(item => {
    item.addEventListener('click', chooseDifficulties)
})

function chooseDifficulties(event) {
    let difficulty = event.target.value;
    window.location.href = "../tetris/tetris.html?difficulty=" + difficulty;
}
