import { useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { TabsContent } from "@/design-system/primitives/Tabs";
import { Separator } from "@/design-system/primitives/Separator";
import { Label } from "@/design-system/primitives/Label";
import { Input } from "@/design-system/primitives/Input";

import { Mail, Lock, ArrowRight } from "lucide-react";
import { SocialLogin } from "./SocialLogin"


export function LoginForm({onSubmit}) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({email, password});
    }
    
    return (

        <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Entre na sua conta para continuar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
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
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="full"
                >
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {/* Separador */}
                <div className="relative my-5 sm:my-6">
                  <Separator />
                  <span className="
                    absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-card px-3 sm:px-4
                    text-xs sm:text-sm text-muted-foreground
                  ">
                    ou
                  </span>
                </div>
                <SocialLogin buttonTitle="Continuar com Google"/>
              </form>
        </TabsContent>
    );
}