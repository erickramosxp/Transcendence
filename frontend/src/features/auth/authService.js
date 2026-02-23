import api from "../../shared/api/httpClient";

const mockLogin = (credentials) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username === "teste@teste.com" && credentials.password === "123456") {

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


const apiLogin = async (credentials) => {

  try {
    const resp = await api.post("/auth/login", credentials);
    return resp;

  } catch (err) {
    const backendDown = !err.response || err.response.status >= 500;

    if (backendDown) {
      console.warn("Backend indisponível → usando mock");
      return mockLogin(credentials);
    }

    throw err;
  }
}


export const authService = {
    
  login: async (credentials) => {
    return apiLogin(credentials);
  },

  register: async (infoUserRegister) => {
    return api.post("/auth/register", infoUserRegister);
  },

  socialLogin: async (googleTokenResponse) => {
    return api.post("/auth/google", googleTokenResponse);
  }
};