// Función para normalizar el nombre de la categoría
export const normalizeCategoryName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Función para desnormalizar el nombre de la categoría (usado en URLs)
export const denormalizeCategoryName = (name) => {
    if (!name) return '';
    return name.toLowerCase();
};

// Función para comparar nombres de categoría
export const compareCategoryNames = (name1, name2) => {
    return normalizeCategoryName(name1) === normalizeCategoryName(name2);
}; 