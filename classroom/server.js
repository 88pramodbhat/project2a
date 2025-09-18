const express = require("express");
const app = express();

const posts = require("./routes/post.js");
const users = require("./routes/user.js");

const cookieParser=require("cookie-parser");
app.use(cookieParser("seccretcode"));

app.get("/getcookies",(req,res)=>
{
    res.cookie("greet","hello",{signed:true});
    res.send("signedcookie is set");
})


app.get("/verify",(req,res)=>
{
    console.log(req.signedCookies);
})


app.get("/greet",(req,res)=>
{
    const {name="ananymous"}=req.cookies;
    res.send(`hello ${name}`);
})



app.get("/",(req,res)=>
{
console.dir(req.cookies);
res.send("home page");
})

// mount routers
app.use("/posts", posts);
app.use("/users", users);

app.listen(8080, () => {
    console.log("server started at port 8080");
});
