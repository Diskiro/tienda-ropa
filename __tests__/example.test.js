describe('Pruebas básicas', () => {
  test('suma de números', () => {
    expect(1 + 1).toBe(2);
  });

  test('verificar string', () => {
    const mensaje = 'Hola Mundo';
    expect(mensaje).toBe('Hola Mundo');
  });
}); 