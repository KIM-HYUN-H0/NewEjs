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
      var sql2 = "select content, date_format(writetime,'%m-%d %H:%i:%s') writetime from chat where roomnum=?";
      conn.query(sql2,idx, function (err, rows2) {
        res.render('main', {title:rows[0].name, name:rows[0].name, number:idx, rows2:rows2});
    });
});
});

router.post('/making', function(req,res,next) {
  var number = Math.floor(Math.random()*100000000) +1;
  var name = req.body.roomname+"";
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

router.post('/visited/:roomnum/chatmaking', function(req,res,next){
  var roomnum = req.params.roomnum;
  var content = req.body.content;
  var datas = [content, roomnum];
  var sql = "insert into chat(content, writetime, roomnum) values(?, now(), ?);";
  conn.query(sql,datas, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum);
});
//chat 

router.post('/visit', function(req,res,next){
  var name = req.body.roomname;
  var sql = "select number from room where name=?";
  conn.query(sql,name, function (err, rows) {
     if (rows==""){ 
       console.log("에러발생 에러발생");
       res.render('index', {title:'Helpusiness', alert1:"없는 이름입니다."});
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
      "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from board where roomnum = ?";
      var page = req.params.page;
  conn.query(sql,roomnum, function (err, rows) {
      if (err) console.error("err : " + err);
      res.render('list', {title:rows1[0].name + " 공지사항", rows: rows, name:rows1[0].name, number:roomnum});
  });
});


router.get('/visited/:roomnum/write', function(req,res,next) {
    var roomnum=req.params.roomnum;
    res.render('write',{title : "게시판 글 쓰기", number:roomnum});
});

router.post('/visited/:roomnum/write', function(req,res,next){
    var roomnum = req.params.roomnum;
    var name = req.body.name;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [name,title,content,passwd,roomnum];
 
 
    var sql = "insert into board(name, title, content, regdate, modidate, passwd,hit, roomnum) values(?,?,?,now(),now(),?,0,?)";
    conn.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/visited/'+roomnum+'/notice/1');
    });
});


/*
router.get('/visited/:roomnum/checklist', function(req, res, next) {
  var roomnum=req.params.roomnum;
  var sql1 = "select name from room where number=?";
  conn.query(sql1,roomnum, function(err1,rows1) {
    if(err1) console.error("err : " + err1);
    res.render('checklist', {title: rows1[0].name + " 체크리스트", name:rows1[0].name, number:roomnum});
  });

});*/


// MAP 부분
router.get('/visited/:roomnum/maps', function(req, res, next) {
  var roomnum=req.params.roomnum;
  var sql1 = "select name, xl, yl from room where number=?";
  var sql2 = "select number, xl, yl, content from marker where roomnum=?"
  conn.query(sql2,roomnum, function(err2,rows){
    if(err2) console.error("err : " + err2);
    rows2=(rows);
  });

  conn.query(sql1,roomnum, function(err1,rows1) {
    console.log(rows2);
    if(err1) console.error("err : " + err1);
    if (rows1[0].xl == null) res.render('map', {rows : rows2, title: rows1[0].name + " Map", name:rows1[0].name, number:roomnum, xl:"37.579319", yl:"126.977046"});
    else {
      res.render('map', {rows : rows2, title: rows1[0].name + " Map", name:rows1[0].name, number:roomnum, xl:rows1[0].xl, yl:rows1[0].yl});
    }
  });

});

router.post('/visited/:roomnum/mapcenter', function(req,res,next){
  var roomnum = req.params.roomnum;
  var xl = (req.body.xl);
  var yl = (req.body.yl);
  var datas = [xl.slice(0,10),yl.slice(0,10),roomnum];
  var sql = "update room set xl = ?,yl = ? where number = ?;";
  conn.query(sql,datas, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum + '/maps/');
});

router.post('/visited/:roomnum/savemarker', function(req,res,next){
  var roomnum = req.params.roomnum;
  var xl = (req.body.xl);
  var yl = (req.body.yl);
  var datas = [xl.slice(0,10),yl.slice(0,10),roomnum];
 // console.log(datas);
  var sql = "insert into marker(xl,yl,roomnum) values(?,?,?)";
  conn.query(sql,datas, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum + '/maps/');
});

router.post('/visited/:roomnum/deletemarker', function(req,res,next){
  var roomnum = req.params.roomnum;
  var number = (req.body.number);
  var datas = [number,roomnum];
  var sql = "delete from marker where number = ? && roomnum = ?;";
  conn.query(sql,datas, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum + '/maps/');
});

router.post('/visited/:roomnum/savecontent', function(req,res,next){
  var roomnum = req.params.roomnum;
  var content = req.body.content;
  var number = req.body.number2;
  var datas = [content, number];
  var sql = "update marker set content = ? where number = ?;";
  conn.query(sql,datas, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum + '/maps/');
});

router.post('/visited/:roomnum/deletecontent', function(req,res,next){
  var roomnum = req.params.roomnum;
  var number = (req.body.number2);
  var sql = "update marker set content = null where number = ?";
  conn.query(sql,number, function (err, rows) {
      if (err) console.error("err : " + err);
  });
  res.redirect('/visited/' + roomnum + '/maps/');
});



module.exports = router;
