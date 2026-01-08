// Setup global pour les tests
jest.setTimeout(1000);

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
