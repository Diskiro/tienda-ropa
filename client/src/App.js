import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import CatalogPage from './pages/Catalog/Catalog';
import ProductPage from './pages/Product/Product';
import CartPage from './pages/Cart/Cart';
// import CheckoutPage from './pages/Checkout/Checkout';
// import ConfirmationPage from './pages/Confirmation/Confirmation';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 128px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;