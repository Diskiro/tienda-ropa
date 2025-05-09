import '@testing-library/jest-dom';

describe('Autenticación', () => {
  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  test('debe validar formato de email', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });

  test('debe validar contraseña segura', () => {
    const validatePassword = (password) => {
      // Mínimo 8 caracteres, al menos una letra y un número
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      return passwordRegex.test(password);
    };

    expect(validatePassword('Password123')).toBe(true);
    expect(validatePassword('12345678')).toBe(false);
    expect(validatePassword('password')).toBe(false);
    expect(validatePassword('pass')).toBe(false);
  });

  test('debe manejar el estado de autenticación', () => {
    let authState = null;
    
    const setAuthState = (user) => {
      authState = user;
    };

    setAuthState(mockUser);
    expect(authState).toEqual(mockUser);
    
    setAuthState(null);
    expect(authState).toBeNull();
  });

  test('debe validar datos de usuario', () => {
    const validateUserData = (user) => {
      if (!user) return false;
      return typeof user.uid === 'string' && 
             typeof user.email === 'string' &&
             user.email.includes('@');
    };

    expect(validateUserData(mockUser)).toBe(true);
    expect(validateUserData({})).toBe(false);
    expect(validateUserData(null)).toBe(false);
  });
}); 