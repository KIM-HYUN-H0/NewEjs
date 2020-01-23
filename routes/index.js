var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Helpusiness', alert1:"" });
});


router.get('/visited/:roomnum', function(req,res,next) {
  var idx = req.params.roomnum;
    var sql = "select name from room where number=?";
    
    conn.query(sql,[idx], function(err,rows)
    {
        if(rows==""){ 
          console.log("에러발생");
          res.redirect('/');
        }

      var sql2 = "select content, date_format(writetime,'%m-%d %H:%i:%s') writetime from chat";
      conn.query(sql2, function (err, rows2) {
        res.render('main', {title:rows[0].name, name:rows[0].name, number:idx, rows2:rows2});
    });
});
});

router.post('/making', function(req,res,next) {
  var number = Math.floor(Math.random()*100000000) +1;
  var name = req.body.roomname;
  var datas = [number,name];

  var sql = "insert into room(number,name) values(?,?)";

  conn.query(sql,datas,  function (err, rows) {
      if (err) {
        console.log("err : " + err);
        res.render('index', {title:'Helpusiness', alert1:"중복된 이름입니다."});
      }
   
      else { console.log("room making success"); res.redirect('/visited/'+number); }
      
  });
});

router.post('/index/chat', function(req,res,next){
  var content = req.body.content;

  var sql = "insert into chat(content, writetime) values(?, now())";
  conn.query(sql,content, function (err, rows) {
      if (err) console.error("err : " + err);
  });
});


router.post('/visit', function(req,res,next){
  var name = req.body.roomname;
  var sql = "select number from room where name=?";
  conn.query(sql,name, function (err, rows) {
     if (rows==""){ 
       console.log("에러발생 에러발생");
       res.redirect('/');
     }
      else res.redirect('/visited/'+rows[0].number);
  });
});

router.get('/visited/:roomnum/notice', function(req,res,next) {
  var roomnum = req.params.roomnum;
  res.redirect('/visited/'+roomnum+'/notice/1');
});

router.get('/visited/:roomnum/notice/:page', function(req, res, next) {
  var roomnum=req.params.roomnum;
  var sql1 = "select name from room where number=?";
  conn.query(sql1,roomnum, function(err1,rows2) {
    if(err1) console.error("err : " + err1);
    rows1=(rows2);
  });

  var sql = "select idx, name, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, " +
      "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from board";
      var page = req.params.page;
  conn.query(sql, function (err, rows) {
      if (err) console.error("err : " + err);
      res.render('list', {title:rows1[0].name + " 공지사항", rows: rows, name:rows1[0].name, number:roomnum});
  });
});

router.get('/visited/:roomnum/checklist', function(req, res, next) {
  var roomnum=req.params.roomnum;
  var sql1 = "select name from room where number=?";
  conn.query(sql1,roomnum, function(err1,rows1) {
    if(err1) console.error("err : " + err1);
    res.render('checklist', {title: rows1[0].name + " 체크리스트", name:rows1[0].name, number:roomnum});
  });

});

router.get('/visited/:roomnum/maps', function(req, res, next) {
  var roomnum=req.params.roomnum;
  var sql1 = "select name from room where number=?";
  conn.query(sql1,roomnum, function(err1,rows1) {
    if(err1) console.error("err : " + err1);
    res.render('map', {title: rows1[0].name + " Map", name:rows1[0].name, number:roomnum});
  });

});


module.exports = router;
