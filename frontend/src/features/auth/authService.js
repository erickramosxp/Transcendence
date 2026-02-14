
const mockLogin = (credentials) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === "teste@teste.com" && credentials.password === "123456") {

        resolve({
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            user: { id: 1, name: "User Mock", email: "teste@teste.com" }
          }
        });
      } else {
        reject({ response: { data: { message: "Credenciais inválidas" } } });
      }
    }, 800);
  });
};

export const authService = {
    
  login: async (credentials) => {
    return mockLogin(credentials);
  }
};