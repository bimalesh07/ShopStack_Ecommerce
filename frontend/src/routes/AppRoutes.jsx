import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Components
import Login from '../features/Auth/Login';
import Signup from '../features/Auth/Signup';
import Dashboard from '../features/Dashboard/Dashboard';
import VendorDashboard from '../features/Vendors/VendorDashboard';
import AddProduct from '../features/Vendors/AddProduct';
import ProductList from '../features/Products/ProductList';
import ProductDetail from '../features/Products/ProductDetail';
import Cart from '../features/Cart/Cart';
import Checkout from '../features/Checkout/Checkout';
import Wishlist from '../features/Wishlist/Wishlist';
import Profile from '../features/Auth/Profile';
import EditProduct from '../features/Vendors/EditProduct';
import VendorOrders from '../features/Vendors/VendorOrders';
import OrderSuccess from '../features/Checkout/OrderSuccess';

import Home from '../features/Home/Home';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-9xl font-black text-slate-200">404</h1>
    <div className="relative -mt-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Lost in Space?</h2>
      <p className="text-xl text-slate-600 mb-8">The page you're looking for has drifted away.</p>
      <button className="btn-primary" onClick={() => window.history.back()}>Back to Safety</button>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute allowedRole="customer">
            <Cart />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="customer">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute allowedRole="customer">
            <Checkout />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/order-success/:id" 
        element={
          <ProtectedRoute allowedRole="customer">
            <OrderSuccess />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute allowedRole="customer">
            <Wishlist />
          </ProtectedRoute>
        } 
      />

      {/* Vendor Routes */}
      <Route 
        path="/vendor/dashboard" 
        element={
          <ProtectedRoute allowedRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/add-product" 
        element={
          <ProtectedRoute allowedRole="vendor">
            <AddProduct />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/edit-product/:id" 
        element={
          <ProtectedRoute allowedRole="vendor">
            <EditProduct />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/orders" 
        element={
          <ProtectedRoute allowedRole="vendor">
            <VendorOrders />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
