import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../data';
import ProductCard from './ProductCard';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    fetchProducts(),
                    fetchCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los productos');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div>Cargando productos...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="product-list">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductList; 