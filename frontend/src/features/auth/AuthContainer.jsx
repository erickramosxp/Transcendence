import { useAuth } from "@/app/providers/AuthProvider";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

import { Card, CardContent } from "@/design-system/primitives/Card";
import { Tabs, TabsList, TabsTrigger } from "@/design-system/primitives/Tabs";
import { useTranslation } from "react-i18next";

export function AuthContainer() {

  const { login, register } = useAuth();
  const { t } = useTranslation('auth');

  const handleLogin = async (credentials) => {
    await login(credentials);
  };

  const handleRegister = async (infoUserRegister) => {
    await register(infoUserRegister);
  };

  return (
    <div className="flex items-center justify-center lg:min-h-screen lg:pt-16">
      <Card className="
        w-full max-w-md mt-16 lg:mt-0
        border-border bg-card/90 backdrop-blur-xl shadow-2xl
      ">
        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList variant="filled" className="grid w-full grid-cols-2 mb-6 sm:mb-8">
              <TabsTrigger value="login" className="text-sm sm:text-base">
                {t('tabs.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">
                {t('tabs.register')}
              </TabsTrigger>
            </TabsList>
            {/* Formulario Login */}
            <LoginForm onSubmit={handleLogin} />

            {/* Formulario Cadastro */}
            <RegisterForm onSubmit={handleRegister}/>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
