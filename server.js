const express = require('express');
const app = express();
var irc = require('irc');
var ircf = require('irc-formatting');
const env = require('dotenv').config();
const mongoose = require('mongoose');


const port = process.env.PORT;
const database_uri = process.env.MONGODB_URI;
mongoose.connect(database_uri)

const Pre = mongoose.model("pre", {
    rls: { type: String },
    cat: { type: String },
    grp: { type: String }

});
var client = new irc.Client('irc.corrupt-net.org', 'pre5999', {
    channels: ['#Pre'],
    port: 6667
});


client.addListener('message', function(from, to, message) {
    let msg_arr = ircf.parse(message);
    if (msg_arr[0].text == "PRE:") {
        let cat = msg_arr[2].text.replace(/\n/g, ' ').replace(' ', '');
        let rls = msg_arr[3].text.replace(/\n/g, ' ').replace(']', '').replace(' ', '');
        let rlsarr = rls.split("-");
        let grp = rlsarr[rlsarr.length -1];
        let pre = new Pre({
            rls: rls,
            cat: cat,
            grp: grp
        });
        pre.save(function(err, pre) {
            if (err) return console.error(err);
            console.log(err, pre);
        });
    } else {
        console.log("Nuke");
    }
});
app.get('/api/releases', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const filter = {};
    let page = req.query.p;
    let limit = req.query.l;
    const all = Pre.find(filter, function(err, filter) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const currentPage = filter.slice(startIndex, endIndex);
        res.json(currentPage);
    }).sort({ _id: -1 });
});

app.get("/api/search", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let q = req.query.q;
    let page = req.query.p;
    let limit = req.query.l;
    search = Pre.find({ rls: { "$regex": q, "$options": "i" } }, function(err, q) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const currentPage = q.slice(startIndex, endIndex);
        res.json(currentPage);
    }).sort({ _id: -1 });
});


app.get("/api/cat", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let q = req.query.q;
    let page = req.query.p;
    let limit = req.query.l;
    search = Pre.find({ cat: { "$regex": q, "$options": "i" } }, function(err, q) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const currentPage = q.slice(startIndex, endIndex);
        res.json(currentPage);
    }).sort({ _id: -1 });
});
app.get("/api/grp", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let q = req.query.q;
    let page = req.query.p;
    let limit = req.query.l;
    search = Pre.find({ grp: { "$regex": q, "$options": "i" } }, function(err, q) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const currentPage = q.slice(startIndex, endIndex);
        res.json(currentPage);
    }).sort({ _id: -1 });
});
app.get("/api/rls/:id", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let id = req.params.id;
    search = Pre.findById(id, function(err, id) {
        return res.send(id);
    });
});

app.get("/api/getDate/:id", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let id = req.params.id;
    search = Pre.findById(id, function(err, id) {
        return res.json({ date: new mongoose.Types.ObjectId(id).getTimestamp().toLocaleString() });
    });
});
app.get("/api/length", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let length = Pre.count({}, function(err, count) {
        return res.json({ length: count });
    });
});
app.listen(port, () => console.log(` listening on port ${port}!`));
