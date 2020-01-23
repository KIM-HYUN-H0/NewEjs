var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn');
var conn= mysql_odbc.init;


module.exports = router;