try {
  var navform = document.querySelector(".profile-nav-settings");
  var navProf = document.querySelector(".account-login-navs");  
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

  document.addEventListener("click", function(event) {
    if (!navProf.contains(event.target) && !navform.contains(event.target)) {
      navform.style.display = "none";
    }
  });
} catch (error) {
}
