const express = require('express');
const router = express.Router();
const RedshiftController = require('../controllers/redshift');


router.get('/import',RedshiftController.import_data);


module.exports = router;