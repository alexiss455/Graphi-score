const h1Text = document.querySelector(".text_Name");
const reviewPic = document.querySelector(".review-pic");
const rating = document.querySelector(".ratings");
const reviews = document.querySelector(".reviews");
const avrg = document.querySelector(".arverage");
const viewResult = document.getElementById("search-results-review");
const inputView = document.getElementById("search-product-review");
const avg = document.querySelector(".review_average_star");
const updateSearchResults = async (query) => {
  try {
    const response = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: query }),
    });
    const data = await response.json();
    const products = data.products;
    viewResult.innerHTML = "";
    products.forEach((product) => {
      const p = document.createElement("p");
      p.textContent = product.productName;
      p.addEventListener("click", async () => {
        h1Text.innerHTML = product.productName;
        reviewPic.setAttribute("alt", product.productName);
        reviewPic.setAttribute( "src", product.productImage);
        inputView.setAttribute("placeholder", product.productName);
        inputView.value = product.productName;
        viewResult.style.display = "none";

        const usersWhoRated = await fetch(
          `/usersWhoRated?prodReview=${product._id}`
        );
        const ratingData = await usersWhoRated.json();
        avrg.innerHTML = ratingData.avgRating;
        rating.innerHTML = ratingData.rateCount + " Ratings";
        reviews.innerHTML = ratingData.reviewCount + " Reviews";

        try {
          avg.style.display = "block";
        } catch (error) {}
        document.querySelector(".rating-upper").style.width =
          (parseFloat(avrg.textContent) === 5
            ? 100
            : parseFloat(avrg.textContent) * 20) + "%";
      });

      viewResult.appendChild(p);
    });
  } catch (err) {
    console.error(err);
  }
};

try {
  inputView.addEventListener("click", async () => {
    await updateSearchResults("");
  });

  inputView.addEventListener("input", async (event) => {

    const query = event.target.value.trim();
    if (query) {
      viewResult.style.display = "block";
      await updateSearchResults(query);
    } else {
      viewResult.style.display = "none";
    }
  });
  
} catch (error) {}

try {
  // homecontent star Average
  document.querySelectorAll(".product-rating").forEach((productRating) => {
    productRating.querySelector(".rating-upper").style.width =
      (parseFloat(productRating.querySelector("#p").textContent) === 5
        ? 100
        : parseFloat(productRating.querySelector("#p").textContent) * 20) + "%";
  });

  // graphiscore_ID Average
  document.querySelector(".rating-upper").style.width =
    (parseFloat(document.querySelector(".average-value").textContent) === 5
      ? 100
      : parseFloat(document.querySelector(".average-value").textContent) * 20) +
    "%";

  // COMMENT STAR AVERAGE
  document.querySelectorAll("#comment_rate").forEach((productRatings) => {
    productRatings.querySelector(".rating-upper").style.width =
      (parseFloat(productRatings.querySelector("#accout-rated").textContent) ===
      5
        ? 100
        : parseFloat(
            productRatings.querySelector("#accout-rated").textContent
          ) * 20) + "%";
  });
} catch (error) {}
try {
  // display star on ejs file
  document.querySelector(".rating-upper").style.width =
    (parseFloat(document.getElementById("average").textContent) === 5
      ? 100
      : parseFloat(document.getElementById("average").textContent) * 20) + "%";
} catch (error) {}
try {
  document
    .querySelectorAll(".profile_activity_average")
    .forEach((productRating) => {
      productRating.querySelector(".rating-upper").style.width =
        (parseFloat(
          productRating.querySelector("#profile_average").textContent
        ) === 5
          ? 100
          : parseFloat(
              productRating.querySelector("#profile_average").textContent
            ) * 20) + "%";
    });
} catch (error) {}







var searchUsers = document.querySelector(".input-searchs");
var search_Result_main = document.querySelector(".search_user_result");

searchUsers.addEventListener('input', () => {
  const searchTerm = searchUsers.value.trim();

  if (searchTerm) {
    // Make an AJAX request to the server to search for users
    fetch(`/search_bar?displayName=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(users => {
        // Clear the search results
        search_Result_main.innerHTML = '';

        // Render the search results
        users.forEach(user => {
          search_Result_main.style.display = "flex";
          const userLink = document.createElement('a');
          const userText = document.createElement('p');
          userLink.href = "/profile/" + user._id; // Replace with your own URL format
          userText.textContent = user.displayName;

          if (user.profilePicture) {
            const primgSearch = document.createElement('img');
            primgSearch.src = user.profilePicture;
            userLink.appendChild(primgSearch);
          }
          else {
            const primgSearch = document.createElement('img');
            primgSearch.src = "/img/My_project1.png";
            userLink.appendChild(primgSearch);
          }           
          userLink.appendChild(userText);
          search_Result_main.appendChild(userLink);
        });                      
      })
      .catch(error => {
        console.error(error);
        search_Result_main.innerHTML = 'Error searching for users';
      });
  } else {
    // Clear the search results if search input is empty
    search_Result_main.innerHTML = '';
  }
});







const searchGpu = document.getElementById("search-product-gpu");
const productList = document.querySelector(".graphiscore-content");
let products = [];

async function getProducts() {
  try {
    const response = await fetch("/products");
    products = await response.json();
    renderProducts(products);
  } catch (err) {}
}

function renderProducts(productsToRender) {
  let productHTML = "";
  productsToRender.forEach(function(product) {
    productHTML += `
    <div class="graphiscore-card">
    <a href="/graphiscore/${product._id}">
    <div class="graphiscores_">
       <img src="${product.productImage}" alt="Graphiscore__" class="graphiscore-pic">
       <div class="graphiscore-stars">
          <div class="rating">
           <div class="rating-upper">
             <span>★</span>
             <span>★</span>
             <span>★</span>
             <span>★</span>
             <span>★</span>
           </div>
           <div class="rating-lower">
             <span>★</span>
             <span>★</span>
             <span>★</span>
             <span>★</span>
             <span>★</span>
           </div>
         </div>
           <p id="graphiscore_average" >${product.averageRating}</p>
        </div>
    </div>
   <div class="graphiscore-title">
       <h3>${product.productName}</h3>
       <div class="rev-rat">
           <p> ${product.numReviews} Reviews</p>
           <p> ${product.totalReview} Ratings</p>
       </div>
   </div>
  </a>
</div>`;
  });
  productList.innerHTML = productHTML;
  document.querySelectorAll(".graphiscore-stars").forEach((productRating) => {
    productRating.querySelector(".rating-upper").style.width =(parseFloat(
      productRating.querySelector("#graphiscore_average").textContent) === 5? 100: parseFloat
      (productRating.querySelector("#graphiscore_average").textContent) * 20) + "%";
  
      });
}


try {
  function filterProducts() {
    const searchQuery = searchGpu.value.trim().toLowerCase();
    let filteredProducts = [];
  
    if (searchQuery !== "") {
      filteredProducts = products.filter(function(product) {
        const productName = product.productName.toLowerCase();
        
        return productName.includes(searchQuery);
      });
    } else {
      filteredProducts = products;
    }
  
    if (filteredProducts.length > 0) {
      renderProducts(filteredProducts);
    } else {
      productList.innerHTML = "<p>No GPU'S found.😭😭</p>";
    }
  }
getProducts();
searchGpu.addEventListener("input", filterProducts);


} catch (error) {}
