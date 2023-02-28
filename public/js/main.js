const h1Text = document.querySelector(".text_Name");
const reviewPic = document.querySelector(".review-pic");
const rating = document.querySelector(".ratings");
const reviews = document.querySelector(".reviews");
const avrg = document.querySelector(".arverage");
const viewResult = document.getElementById("search-results-review");
const inputView = document.getElementById("search-product-review");


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
        reviewPic.setAttribute("src", `data:image/png;base64,${product.productImage}`);
        inputView.setAttribute("placeholder", product.productName);
        inputView.value = product.productName;
        viewResult.style.display = "none";

        const usersWhoRated = await fetch(`/usersWhoRated?prodReview=${product.productName}`);
        const ratingData = await usersWhoRated.json();
        const sum = ratingData.sumOfRatings;
        const sums = sum.reduce((acc, curr) => acc + curr, 0);
        const average = sums / sum.length;
        rating.innerHTML = `${ratingData.numberOfUsers} Ratings`;
        avrg.innerHTML = isNaN(average) ? "0" : average.toFixed(1);

        const usersWhoReviewed = await fetch(`/usersWhoReviewed?prodReview=${product.productName}`);
        const reviewData = await usersWhoReviewed.json();
        reviews.innerHTML = `${reviewData.usersWhoReviewed.length} Reviews`;
      });
      viewResult.appendChild(p);
    });
  } catch (err) {
    console.error(err);
  }
};


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