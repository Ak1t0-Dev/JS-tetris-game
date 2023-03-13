let showUser = document.querySelector('#show-user');
let difficulties = document.querySelectorAll('.difficulties-button');

difficulties.forEach(item => {
    item.addEventListener('click', chooseDifficulties)
})

showUser.innerHTML = "Hi! " + JSON.parse(localStorage.getItem('loginUser')).nickname;


function chooseDifficulties(event) {
    let difficulty = event.target.value;
    window.location.href = "../tetris/tetris.html?difficulty=" + difficulty;
}
