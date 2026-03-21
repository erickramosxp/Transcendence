import { useState } from "react";
import { Button } from "@/design-system/primitives/Button";
import { TabsContent } from "@/design-system/primitives/Tabs"
import { Label } from "@/design-system/primitives/Label";
import { Input } from "@/design-system/primitives//Input";
import { Separator } from "@/design-system/primitives/Separator";
import { User, Mail, Lock, ArrowRight, AtSign } from "lucide-react";
import { SocialLogin } from "@/features/auth/components/SocialLogin" 
import { toast } from 'react-toastify'


export function RegisterForm({ onSubmit }) {

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disableButton, setDisableButton] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();

        setDisableButton(true);
        if (!email || !username || !name || !password) {
            toast.error('Preencha todos os campos');
            setDisableButton(false);
            return;
        }

        onSubmit({name, username, email, password});
        setDisableButton(false);
    }


  return (
    <TabsContent value="signup">
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Crie sua conta
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Junte-se à nossa comunidade
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="signup-name"

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
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-username"
            className="text-slate-700 dark:text-slate-300 text-sm"
          >
            <AtSign className="h-4 w-4" />
            Username
          </Label>
          <Input
            id="signup-username"
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
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
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
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
          />
        </div>

        <Button
          variant="primary"
          size="full"
          disabled={disableButton}
          type="submit"
        >
          Criar Conta
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Separador */}
        <div className="relative my-5 sm:my-6">
          <Separator />
          <span className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            bg-card px-3 sm:px-4
            text-xs sm:text-sm text-muted-foreground"
          >
            ou
          </span>
        </div>
        <SocialLogin buttonTitle={"Cadastrar com Google"}/>
      </form>
    </TabsContent>
  );
}
