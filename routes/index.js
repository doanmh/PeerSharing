var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload');
});

router.get('/:id', function(req, res, next) {
  if (req.params.id) {
    res.render('download', {sender: req.params.id});
  }
})

module.exports = router;
