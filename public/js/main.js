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
        reviewPic.setAttribute(
          "src",
          `data:image/png;base64,${product.productImage}`
        );
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

try {
  const fileInput = document.querySelector(".file-input");
  const previewImage = document.getElementById("preview-image");
  const hide = document.querySelector(".hide_file");

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      previewImage.setAttribute("src", reader.result);
      const srcLink = previewImage.getAttribute("src");
      hide.value = srcLink;
    });
    reader.readAsDataURL(file);
  });
} catch (error) {}
