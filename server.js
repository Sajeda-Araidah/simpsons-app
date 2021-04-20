'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}));
// Specify a directory for static resources
app.use(express.static('./public/'))
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine','ejs');

// Use app cors


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',indexHandler);
app.post('/',addFavHandler);
app.get('/data',myDataHandler);
app.get('detials/:quote_id',detailsHandler);
app.put('detials/:quote_id',detailsUpdateHandler);
app.delete('detials/:quote_id',detailsDeleteHandler);

// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);

function indexHandler(request ,response){
 let url ='https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
 superagent.get(url).set('User-Agent', '1.0').then(x =>{
     let data = x.body ;
    response.render('index' ,{ result:data})
 })
}

////////////////////////////////////////////////////
function addFavHandler(request,response){
    let quote=request.body.quote;
    let character =request.body.character;
    let img =request.body.img ;
    let characterDirection=request.body.characterDirection;
    let values =[quote,character,img, characterDirection];
    let SQL = `INSERT INTO quote (quote,character,img, characterDirection) VALUES ($1,$2,$3 ,$4) RETURNING *`
    client.query(SQL,values).then (y =>{
        response.redirect('/')
    })
}
////////////////////////////////////////////////////
function myDataHandler(request,response){
     
    let SQL =`SELECT * FROM quote `
    client.query(SQL).then (x =>{
        response.render('mydata', {collection :x.rows})
    })
}
////////////////////////////////////////////////////
 function detailsHandler(request,response){ 
let quote_id =request.params.quote_id;
    let SQL =`SELECT * FROM quote WHERE quote_id =$1 `
    client.query(SQL ,[quote_id]).then (y =>{
        response.redirect('mydata', {data :y.rows[0]})
    })
 }
/////////////////////////////////////////////////////
function detailsUpdateHandler(request,response){
    let quote=request.body.quote;
    let character =request.body.character;
    let img =request.body.img ;
    let characterDirection=request.body.characterDirection;
    let quote_id=request.body.quote_id;
    let values=[quote,character,img,characterDirection,quote_id];
    let SQL =`UPDATE quote (quote,character,img,characterDirection) SET (quote =$2,character=$2,img=$3,characterDirection=$4
   WHERE quote_id =$6`
   client.query(SQL ,values).then (y =>{
    response.redirect(`/details/${quote_id}`)
})

}
////////////////////////////////////////////////////
function detailsDeleteHandler(request,response){
    let quote_id=request.body.quote_id;
    let SQL=`DELETE FROM quote WHERE quote_id =$1`
    client.query(SQL).then (y =>{
        response.redirect('/')
    })

}

