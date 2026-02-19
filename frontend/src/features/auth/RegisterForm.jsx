import { useState } from "react";
import { Button } from "@/design-system/primitives/Button";

import { TabsContent } from "@/design-system/primitives/Tabs"
import { Label } from "@/design-system/primitives/Label";
import { Input } from "@/design-system/primitives//Input";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { Separator } from "@/design-system/primitives/Separator";
import { SocialLogin } from "./SocialLogin" 

export function RegisterForm({ onSubmit }) {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({name, email, password});
    }


  return (
    <TabsContent value="signup">
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Crie sua conta
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Junte-se à nossa comunidade
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="signup-name"
              className="text-slate-700 dark:text-slate-300 text-sm"
            >
              <User className="h-4 w-4" />
              Nome
            </Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-slate-700 dark:text-slate-300 text-sm"
          >
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-slate-700 dark:text-slate-300 text-sm"
          >
            <Lock className="h-4 w-4" />
            Senha
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 sm:h-11"
          />
        </div>

        <Button
          className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091] hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d] shadow-lg shadow-[#4a78b5]/30 hover:shadow-xl transition-all"
        >
          Criar Conta
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="relative my-5 sm:my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm text-slate-500">
            ou
          </span>
        </div>
        <SocialLogin buttonTitle={"Cadastrar com Google"}/>
      </form>
    </TabsContent>
  );
}
