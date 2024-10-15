const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const passport = require("passport");
const Localstrategy = require("passport-local");
const socket = require("socket.io");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const Post = require("./models/Post");
const User = require("./models/User");

const port = process.env.PORT || 3000;
const onlineChatUsers = {};

dotenv.config();

const userRoutes = require("./routes/users");
const app = express();

app.set("view engine", "ejs");

//미들웨어
app.use(cookieParser(process.env.SECRET))
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
})
);
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//DB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log("MongoDB Connected error:", err)
})

//Template 파일에 변수 전송
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.login = req.isAuthenticated();
    res.locals.error = req.flash('error');
    res.locals.success = req.flash("success");
    next();
})

//Routers
app.use("/", userRoutes);

const server = app.listen(port, () =>{
    console.log("app is running on port" + port);
})

//WebSocket
const io = socket(server);

const room = io.of("/chat");
room.on("connection", socket => { //클라이언트가 서버에 연결되었을 때
    console.log("new user : ", socket.id);

    room.emit("newUser", { socketID: socket.id }); //새 사용자가 연결되면 모든 클라이언트에게 정보를 보냄

    socket.on("newUser", data => {
        if (!(data.name in onlineChatUsers)) {
            onlineChatUsers[data.name] = data.socketID;
            socket.name = data.name;
            room.emit("updateUserList", Object.keys(onlineChatUsers));
            console.log("Online users: " + Object.keys(onlineChatUsers));
        }
    });

    socket.on("disconnect", () => {
        delete onlineChatUsers[socket.name];
        room.emit("updateUserList", Object.keys(onlineChatUsers));
        console.log(`user ${socket.name} disconnected`);
    });
    socket.on("chat", data => {
        console.log(data);
        if (data.to === "Global Chat") {
            room.emit("chat", data);
        } else if (data.to) {
            room.to(onlineChatUsers[data.name]).emit("chat", data);
            room.to(onlineChatUsers[data.to]).emit("chat", data);
        }
    });
});