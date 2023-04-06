const router = require('express').Router()
const {allProduct, singleProduct, createProduct, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteProductReviews} = require('../controller/allProductController')

const { registerUser, login, logout, forgotPassword, resetPassword, getUserDeatils, updatePassword, updateUserProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require('../controller/userController')

const { newOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteOrder } = require('../controller/orderController')

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

// product routes
router.get('/allproduct', allProduct)
router.get('/product/:id',singleProduct)
router.post('/admin/create-product', isAuthenticatedUser, authorizeRoles("admin"), createProduct)
router.put('/admin/update-product/:id', isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
router.delete('/admin/delete-product/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
router.put('/review', isAuthenticatedUser, createProductReview)
router.get('/reviews', getProductReviews)
router.delete('/reviews', isAuthenticatedUser, deleteProductReviews)

// user routes
router.post('/register', registerUser)
router.post('/login', login)
router.post('/password/forgot', forgotPassword)
router.put('/password/reset/:token', resetPassword)
router.get('/logout', logout)
router.get('/me', isAuthenticatedUser, getUserDeatils)
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.put('/me/update', isAuthenticatedUser, updateUserProfile)
// routes for admin user
router.get('/admin/users', isAuthenticatedUser, authorizeRoles("admin"), getAllUser)
router.get('/admin/user/:id', isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
router.put('/admin/user/:id', isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
router.delete('/admin/user/delete/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteUser)

// order route
router.post('/order/new', isAuthenticatedUser, newOrder)
router.get('/order/:id', isAuthenticatedUser, getSingleOrder)
router.get('/order-me', isAuthenticatedUser, myOrder)
router.get('/order-me', isAuthenticatedUser, myOrder)
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles("admin"), getAllOrders)
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteOrder)

module.exports = router;