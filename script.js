function validateForm() {

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var phone = document.getElementById("phone").value;
    var address = document.getElementById("address").value;

    if (name == "") {
        alert("Please enter your name");
        return false;
    }

    if (email == "") {
        alert("Please enter your email");
        return false;
    }

    if (password == "") {
        alert("Please enter your password");
        return false;
    }

    if (phone == "") {
        alert("Please enter your phone number");
        return false;
    }

    if (address == "") {
        alert("Please enter your address");
        return false;
    }

    alert("Registration Successful!");
    return true;
}