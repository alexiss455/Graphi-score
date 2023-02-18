var navMenu = document.querySelector(".menu");
var nav11= document.querySelector(".navigation");
var navClose = document.querySelector(".close");

var icons = document.querySelector(".bx-search");

var searchBar = document.querySelector(".input-search");
var closeBar = document.querySelector(".x-Close");

if(navMenu){
navMenu.addEventListener("click", function(){
nav11.classList.add('show')
});
}
if(navClose){
navClose.addEventListener("click", function(){
    nav11.classList.remove('show')  
});
}
if(icons){
icons.addEventListener("click", function(){
searchBar.classList.add("show-bar");
});
}
if(closeBar){
closeBar.addEventListener("click", function(){
searchBar.classList.remove("show-bar");
});
}

try {
var errnav = document.querySelector(".error");
var err_close = document.querySelector(".error_close");

err_close.addEventListener("click",function(){
 errnav.classList.add("error__close");
});
} catch (error) {
    
}












