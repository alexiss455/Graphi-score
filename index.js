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
const multer = require('multer');
// alert
const flash = require('connect-flash');

app.use(flash());
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10 // 10 days in milliseconds
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// databases
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://Alexiess:gagoka45@alexiess.9vhaijd.mongodb.net/Userdb", { useNewUrlParser: true });
// register_user_collection
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  displayName: String,
  bio: String,
  profilePicture: Buffer,
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
  description: String,
});
const Product = mongoose.model("Product", productSchema);

const items = new Product({
  productName: "GV-N4080GAMING-OC-16GD",
  productImage: fs.readFileSync(
    "public/GraphiscorePicture/GV-N4080GAMING-OC-16GD.png"
  ),
  description: "The GV-N4080GAMING-OC-16GD is a high-end graphics card made by Gigabyte, designed for demanding gaming and professional applications. It features NVIDIA's latest Ampere architecture with 16GB of GDDR6 memory and is equipped with Gigabyte's WINDFORCE 3X cooling system, which includes three unique blade fans and alternate spinning. The OC in the name indicates that the card is factory overclocked for higher performance out of the box. This graphics card also supports various advanced features such as Ray Tracing and DLSS for enhanced realism and image quality. Overall, the GV-N4080GAMING-OC-16GD is a powerful graphics card that delivers excellent performance for the most demanding applications."
});
// items.save(function(err){
//  if(!err){
//   console.log("success")
//  }else{
//   console.log(err)
//  }
// });


// review_rate collection
const review_rate = new mongoose.Schema({
  review: String,
  rating: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const ReviewRate = mongoose.model("ReviewRate", review_rate);

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.prof = true;
    res.locals.storeName = req.user.displayName;
    res.locals.profile = req.user.profilePicture
  } else {
    res.locals.prof = false;
  }
  next();
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
} 
function checkIfNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You need to log in first.'); // Add error flash message
    return res.redirect('/login');
  }
  next();
}

// home populate the products
app.get("/", function (req, res) {
  ReviewRate.aggregate([
    {
      $group: {
        _id: "$product",
        count: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
        average: { $avg: "$rating" },
        users: { $addToSet: "$userReview" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: "$product._id",
        productName: "$product.productName",
        description: "$product.description",
        productImage: "$product.productImage",
        average: 1,
        totalReviews: { $sum: "$count" },
        ratings: { $size: "$users" },
      },
    },
    {
      $sort: { ratings: -1, count: -1 },
    },
    {
      $limit: 5,
    },
  ]).exec(function (err, results) {
    if (err) {
      res.render("content");
    } else {
      results.forEach(function (product) {
        if (product.productImage) {
          product.productImage = product.productImage.toString("base64");
        }
        if (product.average) {
          product.average = parseFloat(product.average.toFixed(1));
        }
      });

      const success = req.flash("success") || [];
      res.render("content", { mostRated: results , success});

    }
  });
});

// review route
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
        ReviewRate.findOne(
          { product: foundProduct, userReview: user },
          (err, existingReview) => {
            if (err) {
              console.log(err);
            } else if (existingReview) {
              existingReview.rating = rate;
              existingReview.review = review_area;

              existingReview.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Review updated");
                  res.redirect("/graphiscore/" + foundProduct._id);
                }
              });
            } else {
              const rating_review_item = new ReviewRate({
                rating: rate,
                review: review_area,
                product: foundProduct,
                userReview: user,
              });
              rating_review_item.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Review saved");
                  res.redirect("/graphiscore/" + foundProduct._id);
                }
              });
            }
          }
        );
      }
    });
  }
});

app.get("/graphiscore", (req, res, next) => {
  res.render("graphiscore");
});

app.get("/login", checkAuthenticated, function (req, res) {
    const errors = req.flash("error") || [];
    res.render("login", { errors });
});

app.post("/login", function (req, res, next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      next(err);
    } else {

      passport.authenticate("local", { failureRedirect: "/login", failureFlash: true })(req, res, function () {
          req.session.prof = true;
          req.session.storeName = req.user.displayName;
          req.flash("success", "You have successfully logged in!");
          res.redirect("/");
        });

    }
  }, function (err) { // Add error flash message
    req.flash("error", "Invalid username or password!");
    res.redirect("/login");
  });
});

app.get("/register", checkAuthenticated , function (req, res) {

    const errors = req.flash("error") || [];
    res.render("register", { errors });

});

app.post("/register", function (req, res) {
  const { username, password, display_name } = req.body;
  User.register({ username: username, displayName: display_name }, password, function (err, user) {
      if (err) {
          var msg = err.message
          msg = "Email is already registered"
          req.flash("error", msg);
          res.redirect("/register");
      } else {
        passport.authenticate("local", { failureRedirect: "/register", failureFlash: true})(req, res, function () {
          req.flash("success", "You have successfully logged in!");  
          res.redirect("/");
          });
      }
    }
  );
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
  try {
    const payload = req.body.payload;
    const products = await Product.find({
      productName: { $regex: new RegExp("^" + payload + ".*", "i") },
    });
    // Convert the productImage to a Base64-encoded string for each product
    const productsWithBase64Images = products.map((product) => ({
      ...product.toObject(),
      productImage: product.productImage.toString("base64"),
    }));
    res.status(200).json({ products: productsWithBase64Images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/usersWhoRated", async (req, res) => {
  const productId = req.query.prodReview;
  const result = await ReviewRate.aggregate([
  { $match: { 'product': mongoose.Types.ObjectId(productId) } },
  {
    $group: {
      _id: '$user',
      hasReview: { $sum: { $cond: [{ $ne: ['$review', ''] }, 1, 0] } },
      hasRating: { $sum: { $cond: [{ $ne: ['$rating', ''] }, 1, 0] } },
      avgRating: { $avg: '$rating' },
    }
  },
  {
    $group: {
      _id: null,
      reviewCount: { $sum: '$hasReview' },
      rateCount: { $sum: '$hasRating' },
      avgRating: { $avg: '$avgRating' },
    }
  }
  ]).exec();
  console.log(result)
  if (result[0] && result[0].avgRating) {
    result[0].avgRating = parseFloat(result[0].avgRating.toFixed(1));
  }
  const resultObj = result[0] || { reviewCount: 0, rateCount: 0, avgRating: 0 };

  res.json(resultObj);

});


app.get("/review",checkIfNotAuthenticated, (req, res) => {
  var productDprev = [
    {
      productName: "",
      productImage: "",
      average: "",
      ratings: "",
      totalReviews: "",
    },
  ];
    res.render("review", { productPrev: productDprev });
});


app.get("/review/:_id", checkIfNotAuthenticated, function (req, res) {

  const getUrl = req.params._id;
  ReviewRate.aggregate([
    {
      $match: { product: mongoose.Types.ObjectId(getUrl) }
    },
    {
      $group: {
        _id: "$product",
        count: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
        average: { $avg: "$rating" },
        users: { $addToSet: "$userReview" },
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $project: {
        _id: "$product._id",
        productName: "$product.productName",
        productImage: "$product.productImage",
        average: { $round: ["$average", 1] },
        totalReviews: { $sum: "$count" },
        ratings: { $size: "$users" },
        reviews: 1
      }
    }
  ])
  .exec((err, productPrev) => {
    if (err) {
      console.error(err);
    } else {
      if (productPrev[0].productImage) {
        productPrev[0].productImage = productPrev[0].productImage.toString('base64');
      }
      res.render("review", { productPrev: productPrev });
    }
  });

});


app.get("/graphiscore/:_id", (req, res) => {
  let getUrl = req.params._id;
  Product.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(getUrl) } },
    {
      $lookup: {
        from: 'reviewrates',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$product', '$$productId'] },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userReview',
              foreignField: '_id',
              as: 'userObj',
            },
          },
          {
            $unwind: '$userObj',
          },  
          {
            $project: {
              _id: '$userReview',
              displayName: '$userObj.displayName',
              profilePicture: '$userObj.profilePicture',
              rate: '$rating',
              review: '$review',
              date: '$date',
            },
          },
        ],
        as: 'reviewrates',
      },
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        productImage: 1,
        description: 1,
        average: {
          $avg: '$reviewrates.rate',
        },
        totalReviews: {
          $size: {
          $filter: {
          input: "$reviewrates",
          as: "review",
          cond: { $ne: ["$$review.review", ""] }
           }
          }
        },
        ratings: {
          $size: {
            $setUnion: ['$reviewrates._id'],
          },
        },
        reviewrates: 1,
      },
    },
  ]).exec((err, productPrev) => {

      if (productPrev.length === 0) {
        res.render("error", { message: "Product not found" });
      } else {
        if (productPrev[0].productImage) {
          productPrev[0].productImage =
            productPrev[0].productImage.toString("base64");
        }
        productPrev[0].reviewrates.forEach((element) => {
          if (element.date) {
            element.date = element.date.toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });
          }
        });
        res.render("product-view", { productPrev: productPrev });
      }
    });
});


async function account(id) {
  try {
    const user = await User.findById(id)
    const reviews = await ReviewRate.find({ userReview: id })
      .populate("product", "productName productImage")
      .select("rating review date")
      .lean();

    // format date and base64 encode product image
    reviews.forEach((review) => {
      if (review.product.productImage) {
        review.product.productImage = review.product.productImage.toString("base64");
      }
      if (review.date) {
        review.date = review.date.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
      }
    });
    const reviewCount = await ReviewRate.countDocuments({ userReview: id, review: { $exists: true, $ne: "" } })
    const rateCount = await ReviewRate.countDocuments({ userReview: id, rating: { $exists: true } })
    return {
      user: {
        displayName: user.displayName,
        bio: user.bio,
        profilePicture: user.profilePicture
      },
      reviewCount,
      rateCount,
      reviews
    }
  } catch (err) {
    console.error(err)
  }
}

app.get("/profile", checkIfNotAuthenticated, (req, res) => {
    const userId = req.user._id;
    console.log(userId)
    account(userId).then((currentUser) => {
      res.render('profile', { currentUser: currentUser, hideButtons: false });
    }).catch((err) => {
      console.log(err);
      res.redirect('/');
    });

});


app.get("/profile/:_id", function(req, res) {
  let getUrl = req.params._id;
  console.log(getUrl)
  User.findById(getUrl, function(err, foundId) {

    account(foundId._id).then((result) => {
    res.render("profile", { currentUser: result, hideButtons: true });
  }).catch((error) => {
    console.log(error);
    res.render("error");
  });
  });
});

app.get("/account-settings", checkIfNotAuthenticated, (req, res) => {
 
    let getUrl = req.user._id;
    console.log(getUrl);
    account(getUrl)
    .then((result) => {
       res.render("account-settings", { currentUser: result });
    })
    .catch((error) => {
      console.log(error);
      res.render("error");
    });
});

app.post('/account-settings', (req, res) => {
  var displayName = req.body.displayName;
  var displayBio = req.body.displayBio;
  var userId = req.user._id;
  var upload_img = req.body.upload_image;

  // Create or update the user in the database
  User.findOneAndUpdate({ _id: userId }, { displayName: displayName, bio: displayBio, profilePicture: upload_img}, { upsert: true })
    .then((updatedUser) => {
      console.log('User updated:');
      res.redirect('/profile');
    })
    .catch((error) => {
      console.error('Error updating user:', error);
      res.redirect('/error');
    });

}); 

app.listen(3000 || process.env.PORT, function () {
  console.log("Server started on port 3000");
});
