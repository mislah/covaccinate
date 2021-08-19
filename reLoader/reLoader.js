if (window.location == "https://selfregistration.cowin.gov.in/") {
    document.getElementById("mat-input-0").value = "9999999999"; //Phone Number
    document.getElementById("mat-input-0").dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementsByClassName("login-btn")[0].click();
}
a = setInterval(function () {
    if (window.location.href == "https://selfregistration.cowin.gov.in/dashboard") {
        window.setTimeout(a => { window.location = "https://selfregistration.cowin.gov.in/" }, 900000);
        clearInterval(a);
    }
}, 500);
