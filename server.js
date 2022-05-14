import express from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import querstring from 'querystring'
//import mongoose from 'mongoose'
//import Member from "./models/register.js";

const port = 3000;
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true})); 
app.use(express.static('./views'));
app.use(express.json())

//MongoDb
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('beerClub');
const memberCollection = db.collection('members');

//STARTPAGE
app.get('/', (req,res) =>{
    res.render('start')
})
app.get('/start', (req,res) =>{
    res.render('start')
})

//MEMBERS
app.get('/members', async (req,res) =>{
    console.log(req.query.deleted)
    // var passedVariable = req.query.valid;
    const members = await memberCollection.find({}).toArray();
    res.render('members', {members}, )
})

//MEMBER
app.get('/members/:id', async (req,res)=>{
    
    try {
        const member = await memberCollection.findOne({ _id: ObjectId(req.params.id) })
    res.render('member', {
        ...member
    })
    } catch (error) {
        res.json({message: error})
        console.log(error)
    }
    
})

//GO TO REGISTER
app.get('/register', (req,res)=>{
    res.render('register', {text: 'what'})
})

//REGISTER NEW MEMBER

app.post('/register', async (req,res) =>{
    console.log(req.body)
    req.body.date = new Date();
    try {
        await memberCollection.insertOne(req.body);
    } catch (error) {
        res.status(400).json({message: error})
    }
    res.redirect('/members') //redirectar tillbaka då det itne finns ngt att se på post-routen
    })

//DELETE
app.get('/members/delete/:id', getPost, async (req,res) =>{
    try {  
     memberCollection.deleteOne({_id: ObjectId( req.params.id)}, (err, result) => {
        if (err) return console.log(err)
        console.log(req.body)
        var deletedUser = encodeURIComponent(res.member.name);
        res.redirect('/members/?deleted=' + deletedUser)

      })
    } catch (error) {
        res.json({message: error})
    }
    
} )

async function getPost(req,res,next){
    let member
    try {
        member = await memberCollection.findOne({ _id: ObjectId(req.params.id) })
        if(member == null){
            return res.status(404).json({message: 'cannot find member'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.member = member;
    next()
}
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})