const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/listDB", {useUnifiedTopology: true});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Eating"
})
const item2 = new Item({
  name: "Coding"
})
const item3 = new Item({
  name: "Playing"
})

const defaultItems = [item1, item2, item3];

const listsSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("list", listsSchema);


app.get("/register", function(req, res){
  res.render("register");
});
app.get("/login", function(req, res){
  res.render("login");
});

app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully inserted the items");
        }
      })
      res.redirect("/");
    }else{
      res.render("main", {listTitle: "Today", newListItems:foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
      });
      }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if(!err){
            res.redirect("/" + listName);
          }
        });
  }

});


app.listen(3000, function(req, res){
  console.log("Server is running on port 3000");
})
