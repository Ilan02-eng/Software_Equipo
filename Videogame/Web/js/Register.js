//Register for Catharsis
const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    if(
        username === "" ||
        name === "" ||
        lastname === "" ||
        gender === "" ||
        age === "" ||
        password === ""
    ){
        message.textContent = "Please complete all fields.";
        return;
    }

    message.textContent = "Account created successfully.";
});