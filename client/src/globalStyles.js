import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    @media (max-width: 600px) {
      font-size: 14px;
    }
  }

  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Ajustes para dispositivos móviles */
  @media (max-width: 600px) {
    .hide-on-mobile {
      display: none !important;
    }
  }

  /* Ajustes para tablets */
  @media (min-width: 601px) and (max-width: 900px) {
    .hide-on-tablet {
      display: none !important;
    }
  }

  /* Ajustes para escritorio */
  @media (min-width: 901px) {
    .hide-on-desktop {
      display: none !important;
    }
  }

  /* Clases de utilidad para espaciado responsivo */
  .responsive-padding {
    padding: 1rem;
    @media (min-width: 600px) {
      padding: 1.5rem;
    }
    @media (min-width: 900px) {
      padding: 2rem;
    }
  }

  .responsive-margin {
    margin: 1rem;
    @media (min-width: 600px) {
      margin: 1.5rem;
    }
    @media (min-width: 900px) {
      margin: 2rem;
    }
  }

  /* Ajustes para imágenes de productos */
  .product-image {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    @media (min-width: 600px) {
      aspect-ratio: 4/5;
    }
  }

  /* Ajustes para tarjetas de productos */
  .product-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    &:hover {
      transform: translateY(-5px);
    }
  }

  /* Ajustes para el carrito */
  .cart-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    @media (max-width: 600px) {
      flex-direction: column;
      text-align: center;
    }
  }

  /* Ajustes para formularios */
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
    @media (min-width: 600px) {
      padding: 2rem;
    }
  }

  /* Ajustes para el footer */
  .footer-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    @media (min-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`;

export default GlobalStyles; 