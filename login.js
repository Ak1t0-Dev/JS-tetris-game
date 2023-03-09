// ---------------------------------------------------------------------- //
// switch tabs and contents
// ---------------------------------------------------------------------- //
$('.tab').on('click', function () {
    $('.tab, .tab-content').removeClass('active');

    $(this).addClass('active');

    let index = $('.tab').index(this);
    $('.tab-content').eq(index).addClass('active');
});

// ---------------------------------------------------------------------- //
// login
// ---------------------------------------------------------------------- //
$("#login").submit(function (event) {
    event.preventDefault();

    // initialize error messages
    $("#login-email-error").text("");
    $("#login-password-error").text("");

    let email = $("#login-email").val();
    let password = $("#login-password").val();

    // there's no password confitm in login so give a password as a third parameter 
    if (!validate("#login", email, password, password)) {
        return;
    }

    let storageUsers = localStorage.getItem('tetrisUsers');

    if (!storageUsers) {
        $("#login-email-error").text("An email address or a password is incorrect.");
    } else {
        let parsedStorageUsers = JSON.parse(storageUsers);
        for (let i = 0; i < parsedStorageUsers.length; i++) {
            if (parsedStorageUsers[i].email === email && parsedStorageUsers[i].password === password) {
                return;
            }
        }
        $("#login-email-error").text("An email address or a password is incorrect.");
    }

});

// ---------------------------------------------------------------------- //
// register
// ---------------------------------------------------------------------- //
$("#register").submit(function (event) {
    event.preventDefault();

    // initialize error messages
    $("#register-email-error").text("");
    $("#register-password-error").text("");
    $("#password-confirm-error").text("");

    let email = $("#register-email").val();
    let password = $("#register-password").val();
    let passwordConfirm = $("#password-confirm").val();

    if (!validate("#register", email, password, passwordConfirm)) {
        return;
    }

    // store a user information to a local storage
    // get user information from a user form
    nickname = $('#register-nickname').val();
    email = $('#register-email').val();
    password = $('#register-password').val();
    let user = { nickname: nickname, email: email, password: password };
    let usersArr = [];
    let storageUsers = localStorage.getItem('tetrisUsers');

    if (!storageUsers) {
        usersArr.push(user);
        localStorage.setItem('tetrisUsers', JSON.stringify(usersArr));
    } else {
        let parsedStorageUsers = JSON.parse(storageUsers);
        for (let i = 0; i < parsedStorageUsers.length; i++) {
            if (parsedStorageUsers[i].email === email) {
                $("#register-email-error").text("The email has already been registered. Try another email address.");
                return;
            }
        }
        parsedStorageUsers.push(user);
        localStorage.setItem('tetrisUsers', JSON.stringify(parsedStorageUsers));
    }

});

// ---------------------------------------------------------------------- //
// validate checks for user information
// ---------------------------------------------------------------------- //
function validate(status, email, password, passwordConfirm) {
    let boolean = true;
    // an email check
    if (!validateEmail(email)) {
        $(status + "-email-error").text("Enter a valid email address.");
        boolean = false;
    }

    //  an password check
    if (password.length < 8) {
        $(status + "-password-error").text(
            "Enter a password which is bigger than 8 characters."
        );
        boolean = false;
    }

    //  an password check
    if (password !== passwordConfirm) {
        $("#password-confirm-error").text(
            "Passwords do not match."
        );
        boolean = false;
    }

    return boolean;
}

// an email check
function validateEmail(email) {
    let regex = /\S+@\S+\.\S+/;
    return regex.test(email);
}

// create object and add to session storage
function createObj(id, value) {
    const obj = {};
    obj[value] = 1;
    sessionStorage.setItem(id, JSON.stringify(obj));
}

// add a property to the object and add to session storage
function addObj(id, value) {
    let obj = sessionStorage.getItem(id);
    obj = JSON.parse(obj);
    if (obj.hasOwnProperty(value)) {
        obj[value] = parseInt(obj[value]) + 1;
    } else {
        obj[value] = 1;
    }
    sessionStorage.setItem(id, JSON.stringify(obj));
}