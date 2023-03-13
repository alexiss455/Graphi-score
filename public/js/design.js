var navMenu = document.querySelector(".menu");
var nav11 = document.querySelector(".navigation");
var navClose = document.querySelector(".close");

var icons = document.querySelector(".bx-search-alt-2");
var searchBar = document.querySelector(".search_user");

if (navMenu) {
  navMenu.addEventListener("click", function () {
    console.log("click")
    nav11.classList.add("show");
  });
}
if (navClose) {
  navClose.addEventListener("click", function () {
    console.log("click2")
    nav11.classList.remove("show");
  });
}

if (icons) {
  icons.addEventListener("click", function () {

    if(searchBar.style.display === "block"){
      searchBar.style.display = "none"
    }else{
      searchBar.style.display = "block"
    }
  
  });
}

if (window.innerWidth <= 500) {
  document.addEventListener("click", function(event) {
    if (!icons.contains(event.target) && !searchBar.contains(event.target)) {
      searchBar.style.display = "none";
    }
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
      inputview.value = "";
       if(viewResult === "block"){ 
         viewResult.style.display = "none"
       }else{
         viewResult.style.display = "block"
       }
     });   
    //  In this code, the document object is listened for a click event.
    //  If the click event's target is not inside the search input box or the search results box,
    //  then the search results box is hidden using the viewResult.style.display = "none"; line.
     document.addEventListener("click", function(event) {
       if (!inputview.contains(event.target) &&  !viewResult.contains(event.target)) {
         viewResult.style.display = "none";
         var aa = inputview.placeholder;
         inputview.value = aa
       }
     });
  } catch (error) {
  }

  var file_input = document.querySelector(".file-input") 
  var preview_image = document.querySelector("#preview-image")
  var hidden_file = document.querySelector(".hide_file")

  var uploadLink = document.querySelector(".upload_image_link");
  var upload_image = document.querySelector(".upload_image");
  var accout_op = document.querySelector(".accont_settings")
  const body = document.querySelector('body');
try {

  uploadLink.addEventListener("click", function(){ 
    var display = getComputedStyle(upload_image).getPropertyValue("display");
    file_input.value = "";
    if(display === "none"){ 
      accout_op.style.display = "block"
      upload_image.style.display = "block";
      file_input.focus()
      body.style.overflow = 'hidden';
    } else {
      upload_image.style.display = "none";  
      body.style.overflow = 'auto';
    }
  });

document.addEventListener("click", function(event) {
  if (!uploadLink.contains(event.target) &&  !upload_image.contains(event.target)) {
    upload_image.style.display = "none";
    accout_op.style.display = "none"
    body.style.overflow = 'auto';
  }
});
var imgs_upload = document.querySelector("#preview-image")
document.querySelector(".btn_upload_img").addEventListener("click", async function(){
  try {
    const response = await fetch(file_input.value);

    if (response.ok) {
      if(file_input.value == ''){
        console.log("hello")
        imgs_upload.setAttribute("src", "/img/My_project1.png")
        toastr.options.positionClass = "toast-bottom-right";
        toastr.error("Url is Invalid! 😭");
      }else{
        const val = file_input.value; 
        hidden_file.value = val;
        preview_image.src = val;
        upload_image.style.display = "none";
        accout_op.style.display = "none"
        body.style.overflow = 'auto';
      }
    }else {
        toastr.options.positionClass = "toast-bottom-right";
        toastr.error("Url is Invalid! 😭");
        accout_op.style.display = "none"
        upload_image.style.display = "none";
        imgs_upload.setAttribute("src", "/img/My_project1.png")
        body.style.overflow = 'auto';
    }
  } catch (error) {
  }


});

} catch (error) {
}

