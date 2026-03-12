import { useState } from "react";
import { Button } from "../../components/ui/Button";

import { TabsContent } from "../../components/ui/Tabs";
import { Label } from "../../components/ui/Label";

import { Mail, Lock } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Separator } from "../../components/ui/Separator";
import { SocialLogin } from "./components/SocialLogin"

import { toast } from 'react-toastify'

export function LoginForm({onSubmit}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Preencha todos os campos');
            return;
        }
        
        onSubmit({username, password});
    }
    
    return (

        <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Entre na sua conta para continuar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-slate-700 dark:text-slate-300 text-sm"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Digite seu email"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-slate-700 dark:text-slate-300 text-sm"
                    >
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d] shadow-lg shadow-[#4a78b5]/30 hover:shadow-xl transition-all"
                  type="submit"
                >
                  Entrar
                </Button>

                <div className="relative my-5 sm:my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm text-slate-500">
                    ou
                  </span>
                </div>
                <SocialLogin buttonTitle={"Continuar com Google"}/>
              </form>
        </TabsContent>
    );
}