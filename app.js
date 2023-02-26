//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// cookies and session
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const passport = require("passport");
// express
const app = express();
const fs = require("fs-extra");

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });
// register_user_collection 
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  displayName: String,
});
// passport_local_mongoose
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
// product_collection
const productSchema = new mongoose.Schema({
  productName: String,
  productImage: Buffer,
  description: String
});
const Product = mongoose.model("Product", productSchema);
const items = new Product({
  productName: "VCG408016TFXXPB1",
  productImage: fs.readFileSync(
    "public/GraphiscorePicture/VCG408016TFXXPB1.png"
  ),
  description: "TUF-RTX4080-O16G-GAMING is a high-end graphics card produced by ASUS, designed for use in gaming and other demanding applications. It is based on the NVIDIA Ampere architecture and features the NVIDIA GeForce RTX 4080 GPU, which is capable of delivering exceptional graphics performance."
});

// items.save(function(err){
//  if(!err){
//   console.log("success")
//  }else{
//   console.log(err)
//  }
// });

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.prof = true;
    res.locals.storeName = req.user.displayName;
  } else {
    res.locals.prof = false;
  }
  next();
});
app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});
app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register", { error: null });
  }
});
app.get("/review", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("review");
  } else {
    res.render("login");
  }
});

app.get("/graphiscore", (req, res, next) => {
  res.render("graphiscore");
});

app.post("/register", function (req, res) {
  const { username, password, display_name } = req.body;
  User.register(
    { username: username, displayName: display_name }, password, function (err, user) {
      if (err) {
        if (err.name === "UserExistsError") {
          // handle UserExistsError
          res.render("register", { error: "Entered username/email is already registered" });
        } else {
          console.log(err);
          res.render("register", { error: "Server error" });
        }
      } else {
        passport.authenticate("local", { failureRedirect: "/register" })(req,res,function () {
            res.redirect("/");
          }
        );
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", { failureRedirect: "/login" })(
        req,
        res,
        function () {
          req.session.prof = true;
          req.session.storeName = req.user.displayName;
          res.redirect("/");
        }
      );
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred while logging out.");
    }
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  });
});

app.post("/search", async (req, res) => {
  let payload = req.body.payload;
  let save = await Product.find({
    productName: { $regex: new RegExp("^" + payload + ".*", "i") },
  }).exec();
  // Convert the productImage to a Base64-encoded string
  save = save.map((foundProduct) => ({
    ...foundProduct.toObject(),
    productImage: foundProduct.productImage.toString("base64"),
  }));
  res.json({ payload: save });
});

// review and rate collection connection with productSchema and userSchema
const review_rate = new mongoose.Schema({
  rating: Number,
  review: String,
  date: Date,
  product: productSchema,
  userReview: userSchema,
});
const ReviewRate = mongoose.model("ReviewRate", review_rate);
app.get("/usersWhoRated", async (req, res) => {
  const prodReview = req.query.prodReview;
  try {
    // Retrieve distinct _id of users who have rated the product
    const usersWhoRated = await ReviewRate.distinct("userReview._id", { "product.productName": prodReview, rating: { $ne: "" }});
    // Query the database for each user and calculate the sum of their ratings
    const ratingsByUser = await Promise.all( usersWhoRated.map(async function(userId) {
      const userReviews = await ReviewRate.find({"userReview._id": userId, "product.productName": prodReview, rating: { $ne: "" }});
        const sumOfRatings = userReviews.reduce(
          (acc, { rating }) => acc + parseInt(rating),
          0
        );
        return { userId, sumOfRatings };
      })
    );
    const sumOfRatings = ratingsByUser.map(({ sumOfRatings }) => sumOfRatings);
    const numberOfUsers = usersWhoRated.length;
    res.json({ sumOfRatings, numberOfUsers });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/usersWhoReviewed", (req, res) => {
  const prodReview = req.query.prodReview;
  ReviewRate.distinct(
    "userReview._id",
    { "product.productName": prodReview, review: { $ne: "" } },
    function (err, usersWhoReviewed) {
      if (err) {
        console.error(err);
        return;
      }
      res.json({ usersWhoReviewed });
    }
  );
});

app.get('/graphiscore/:_id', (req, res) => {
  let getUrl = req.params._id;
  ReviewRate.aggregate()
  .match({ 'product._id': mongoose.Types.ObjectId(getUrl) })
  .group({
    _id: "$product._id",
    count: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
    average: { $avg: "$rating" },
    users: { $addToSet: "$userReview._id" },
    reviews: {

      $push: {
        displayName: "$userReview.displayName",
        rate: "$rating",
        review: "$review",
        date: "$date"
      }
    }

  })
  .lookup({
    from: "products",
    localField: "_id",
    foreignField: "_id",
    as: "product"
  })
  .unwind("$product")
  .project({
    _id: "$product._id",
    productName: "$product.productName",
    productDscrp: "$product.description",
    productImage: "$product.productImage",
    average: 1,
    totalReviews: { $sum: "$count" },
    ratings: { $size: "$users" },
    reviews: 1
  })
  .exec((err, productPrev) => {

    if (err) {
      console.error(err);
    } else {
      if (productPrev[0].productImage) {
        productPrev[0].productImage = productPrev[0].productImage.toString('base64');
      }
      res.render("product-view", { productPrev: productPrev });
    }
  });
});


app.get("/", function(req, res) {
  ReviewRate.aggregate()
  .group({
    _id: "$product._id",
    reviews: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
    average: { $avg: "$rating" },
    users: { $addToSet: "$userReview._id" }
  })
  .lookup({
    from: "products",
    localField: "_id",
    foreignField: "_id",
    as: "product"
  })
  .unwind("$product")
  .project({
    _id: "$product._id",
    productName: "$product.productName",
    productDscrp: "$product.description",
    productImage: "$product.productImage",
    average: 1,
    totalReviews: { $sum: "$reviews" },
    ratings: { $size: "$users" }
  })
  .limit(6)
  .exec(function (err, results) {
    if (err) {
       res.render("content");
    } else {
      results.forEach(function(product) {
        if (product.productImage) {
          product.productImage = product.productImage.toString( 'base64' );
        }
      });
      res.render('content', { mostRated: results });
    }
  });
});

app.post("/review", (req, res) => {
  const rate = req.body.rate;
  const review_area = req.body.review_area;
  const prodReview = req.body.review_prod_name;
  const user = req.user;
  if (prodReview === "") {
    console.log("no product selected");
    res.render("review");
  } else if (rate === undefined) {
    console.log("no selected rate");
    res.render("review");
  } else {
    Product.findOne({ productName: prodReview }, (err, foundProduct) => {
      if (err) {
        console.log(err);
      } else {
        ReviewRate.findOne( { product: foundProduct, userReview: user }, (err, existingReview) => {
            if (err) {
              console.log(err);
            } else if (existingReview) {
              existingReview.rating = rate;
              existingReview.review = review_area;
              existingReview.date = Date.now();
              existingReview.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Review updated");
                  res.render("review");
                }
              });
            } else {
              const rating_review_item = new ReviewRate({
                rating: rate,
                review: review_area,
                date: new Date(),
                product: foundProduct,
                userReview: user,
              });
              rating_review_item.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Review saved");
                  res.render("review");
                }
              });
            }
          }
        );
      }
    });
  }
});


app.listen(3000 || process.env.PORT, function () {
  console.log("Server started on port 3000");
});

