import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { SocialLogin } from "@/features/auth/components/SocialLogin"
import { toast } from 'react-toastify'

import { useTranslation } from "react-i18next";

import { Button, TabsContent, Separator, Label, Input } from "@/design-system";
import { isValidLoginIdentifier } from "@/shared/validation/validators";
import { LIMITS } from "@/shared/validation/limits";

export function LoginForm({onSubmit}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { t } = useTranslation('auth');

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedUsername = username.trim();

        if (!trimmedUsername || !password) {
            toast.error(t('errors.fillAllFields'));
            return;
        }

        if (!isValidLoginIdentifier(trimmedUsername)) {
            toast.error(t('errors.invalidLoginIdentifier'));
            return;
        }

        if (password.length > LIMITS.passwordMax) {
            toast.error(t('errors.passwordTooLong'));
            return;
        }

        try {
            onSubmit({ username: trimmedUsername, password });
        } catch (error) {
            console.error(error);
            toast.error(t('errors.loginFailed'));
        }
    }

    return (

        <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {t('login.title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('login.subtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                    >
                      <Mail className="h-4 w-4" />
                      {t('login.identifier')}
                    </Label>
                    <Input
                      id="login-email"
                      data-testid="auth-login-email"
                      type="text"
                      autoComplete="username"
                      placeholder={t('login.identifierPlaceholder')}
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                    >
                      <Lock className="h-4 w-4" />
                      {t('login.password')}
                    </Label>
                    <Input
                      id="login-password"
                      data-testid="auth-login-password"
                      type="password"
                      maxLength={LIMITS.passwordMax}
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="full"
                  data-testid="auth-login-submit"
                >
                  {t('login.button')}
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
                    {t('login.or')}
                  </span>
                </div>
                <SocialLogin buttonTitle={t('login.social')}/>
              </form>
        </TabsContent>
    );
}
