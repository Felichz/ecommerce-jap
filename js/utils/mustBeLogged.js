firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location = 'login.html';
    }
});
