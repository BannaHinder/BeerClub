import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const port = 3000;
const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./views"));
app.use(express.json());

//MongoDb
const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("beerClub");
const memberCollection = db.collection("members");

//STARTPAGE
app.get("/", (req, res) => {
  res.render("start");
});
app.get("/start", (req, res) => {
  res.render("start");
});

//MEMBERS
app.get("/members", async (req, res) => {
  try {
      if(req.query.sort==='desc'){
        const members = await memberCollection.find({}).sort({name:-1}).toArray();
        res.render("members", { members });
      } else if(req.query.sort==='asc'){
        const members = await memberCollection.find({}).sort({name:1}).toArray();
        res.render("members", { members });
      }else{
        const members = await memberCollection.find({}).toArray();
        res.render("members", { members });
      }
  } catch (error) {
      
  }
  
});

//MEMBER
app.get("/members/:id", async (req, res) => {
  try {
    const member = await memberCollection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.render("member", {
      ...member,
    });
  } catch (error) {
    res.json({ message: error });
  }
});

//GO TO REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

//REGISTER NEW MEMBER
app.post("/register", async (req, res) => {
  req.body.date = new Date();
  try {
    await memberCollection.insertOne(req.body);
  } catch (error) {
    res.status(400).json({ message: error });
  }
  const addedMember = encodeURIComponent(req.body.name);
  res.redirect("/members?registered=" + addedMember); //redirectar tillbaka då det itne finns ngt att se på post-routen
});

//DELETE
app.get("/members/delete/:id", getMember, async (req, res) => {
  try {
    memberCollection.deleteOne(
      { _id: ObjectId(req.params.id) },
      (err, result) => {
        if (err) return console.log(err);
        var deletedUser = encodeURIComponent(res.member.name);
        res.redirect("/members?deleted=" + deletedUser);
      }
    );
  } catch (error) {
    res.json({ message: error });
  }
});

//Update member
app.post("/api/members/:id/update", getMember, async (req, res) => {
    try {
    memberCollection.updateOne({_id: ObjectId(req.params.id)},{$set:(req.body)},
    (err,result)=>{
        if (err) return err;
    var updatedUser = encodeURIComponent(res.member.name);
    res.redirect("/members?updated=" + updatedUser);
    });
  } catch (error) {
    res.json({ message: error });
  }
});

async function getMember(req, res, next) {
  let member;
  try {
    member = await memberCollection.findOne({ _id: ObjectId(req.params.id) });
    if (member == null) {
      return res.status(404).json({ message: "cannot find member" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.member = member;
  next();
}
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
