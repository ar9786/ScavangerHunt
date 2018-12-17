const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/show_dashboard');
const bodyParser = require('body-parser');
//const urlencodedParser = bodyParser.urlencoded({extended:false});
const checkAuth = require('../api/middleware/check-auth');
router.use(express.json());

//const checkAuth = require('../middleware/check-auth');
router.get('/', (requestAnimationFrame,res)=>{
    res.redirect('/login');
});
router.get('/login', AdminController.login_page);
router.post('/login', AdminController.loginRedirect);

router.get('/dashboard', AdminController.dashboard);
router.get('/logout', AdminController.logout);

router.get('/qrcodegenerator', AdminController.qrcodegenerator);
router.post('/insert_qrcode',AdminController.insert_qrcode);

router.get('/listqrcode',AdminController.listqrcode);
router.get('/password_reset',AdminController.password_reset);
router.post('/password_match',AdminController.password_match);
// router.post('/',checkAuth,OrdersController.orders_create_order);
// router.get('/:orderId',checkAuth,OrdersController.orders_get_order);
// router.patch('/:orderId',checkAuth,OrdersController.update_order);
// router.delete('/:orderId',checkAuth,OrdersController.delete_order);
module.exports = router;