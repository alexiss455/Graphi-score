var navMenu = document.querySelector(".menu");
var nav11 = document.querySelector(".navigation");
var navClose = document.querySelector(".close");

var icons = document.querySelector(".bx-search");

var searchBar = document.querySelector(".input-search");
var closeBar = document.querySelector(".x-Close");

if (navMenu) {
  navMenu.addEventListener("click", function () {
    nav11.classList.add("show");
  });
}
if (navClose) {
  navClose.addEventListener("click", function () {
    nav11.classList.remove("show");
  });
}
if (icons) {
  icons.addEventListener("click", function () {
    searchBar.classList.add("show-bar");
  });
}
if (closeBar) {
  closeBar.addEventListener("click", function () {
    searchBar.classList.remove("show-bar");
  });
}

try {
    // star rating
    var star_1 = document.querySelector("#rate-1");
    var star_2 = document.querySelector("#rate-2");
    var star_3 = document.querySelector("#rate-3");
    var star_4 = document.querySelector("#rate-4");
    var star_5 = document.querySelector("#rate-5");
    var text_star_descricption = document.querySelector(".rate-description");
    star_1.addEventListener("click", function () {
      text_star_descricption.innerHTML = "I dont like it 🤕";
    });
    star_2.addEventListener("click", function () {
      text_star_descricption.innerHTML = "I just hate it 😑";
    });
    star_3.addEventListener("click", function () {
      text_star_descricption.innerHTML = "It is awesome 😯";
    });
    star_4.addEventListener("click", function () {
      text_star_descricption.innerHTML = "I just like it 🤗";
    });
    star_5.addEventListener("click", function () {
      text_star_descricption.innerHTML = "I love it 🤩";
    });
  
    //  view input show
     const viewResult = document.getElementById("search-results-review");
     const inputview = document.getElementById("search-product-review"); 
     inputview.addEventListener("click", async function(){
      
       if(viewResult === "block"){ 
         viewResult.style.display = "none"
       }else{
         viewResult.style.display = "block"  
       }
     });   

     // In this code, the document object is listened for a click event.
     // If the click event's target is not inside the search input box or the search results box,
     // then the search results box is hidden using the viewResult.style.display = "none"; line.
     document.addEventListener("click", function(event) {
       if (!inputview.contains(event.target) &&  !viewResult.contains(event.target)) {
         viewResult.style.display = "none";
       }
     });
  } catch (error) {
  }
