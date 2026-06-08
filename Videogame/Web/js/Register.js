// Register for Catharsis

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const gender = document.getElementById("gender").value;
    const age = parseInt(document.getElementById("age").value);
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if(
        username === "" ||
        name === "" ||
        lastname === "" ||
        gender === "" ||
        password === "" ||
        isNaN(age)
    ){
        message.textContent = "Please complete everything";
        return;
    }

    if(age <= 13){
        message.textContent = "You must be older than 13 to create an account.";
        return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    message.textContent = "Account was created!";
});