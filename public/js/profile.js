var navform = document.querySelector(".profile-nav-settings");
var navProf = document.querySelector(".account-login-navs");

try {
  navProf.addEventListener('click', function() {
    if (window.innerWidth >= 1100) {
      if (navform.style.display === "block") {
        navform.style.display = "none";
        navProf.classList.remove("outline_off");
      } else {
        navform.style.display = "block";
        navProf.classList.add("outline_off");
      }
    }
  });
} catch (error) {

}