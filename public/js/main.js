function sendData(e) {
  const viewResult = document.getElementById("search-results-review");
  const h1_text = document.querySelector(".text_Name");
  const reviewPic = document.querySelector(".review-pic");
  const inputview = document.getElementById("search-product-review");
  const rating = document.querySelector(".ratings");
  const reviews = document.querySelector(".reviews");
  const avrg = document.querySelector(".arverage");
  fetch("search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: e.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      viewResult.innerHTML = "";
      let payload = data.payload;

      if (payload.length < 1) {
        viewResult.innerHTML = "<p>sorry not found</p>";
        return;
      }
      payload.forEach((item, index) => {
        let pElement = document.createElement("p");
        pElement.textContent = item.productName;
        pElement.addEventListener("click", () => {
          h1_text.innerHTML = item.productName;
          reviewPic.setAttribute("alt", item.productName);
          reviewPic.setAttribute(
            "src",
            `data:image/png;base64,${item.productImage}`
          );
          inputview.setAttribute("placeholder", item.productName);
          inputview.value = item.productName;
          viewResult.style.display = "none";

          fetch(`/usersWhoRated?prodReview=${item.productName}`)
            .then((response) => response.json())
            .then((data) => {
              rating.innerHTML = data.numberOfUsers + " Ratings";
              var sum = data.sumOfRatings;
              const sums = sum.reduce((acc, curr) => acc + curr, 0);
              const average = sums / sum.length;
              if (isNaN(average)) {
                avrg.innerHTML = "⭐0";
              } else {
                avrg.innerHTML = "⭐" + average.toFixed(1);
              }
            });
          fetch(`/usersWhoReviewed?prodReview=${item.productName}`)
            .then((response) => response.json())
            .then((data) => {
              reviews.innerHTML = data.usersWhoReviewed.length + " Reviews";
            });
        });
        viewResult.appendChild(pElement);
      });
    });
}
