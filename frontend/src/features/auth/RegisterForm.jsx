import { useState } from "react";
import { User, Mail, Lock, ArrowRight, AtSign } from "lucide-react";
import { toast } from 'react-toastify'
import { useTranslation } from "react-i18next";
import { SocialLogin } from "@/features/auth/components/SocialLogin";

import { Button, TabsContent, Label, Input, Separator } from "@/design-system";
import { Link } from "react-router-dom";


export function RegisterForm({ onSubmit }) {

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const { t } = useTranslation('auth');


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !name || !password) {
      toast.error(t('errors.fillAllFields'));
      setDisableButton(false);
      return;
    }

    if (!acceptTerms) {
      toast.warn(t('register.acceptTermsRequired'));
      return;
    }

    try {
      setDisableButton(true);
      await onSubmit({ name, username, email, password, acceptTerms });
    } finally {
      setDisableButton(false);
    }
  }


  return (
    <TabsContent value="signup">
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t('register.title')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="signup-name"

            >
              <User className="h-4 w-4" />
              {t('register.name')}
            </Label>
            <Input
              id="signup-name"
              type="text"
              placeholder={t('register.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-username"
          >
            <AtSign className="h-4 w-4" />
            {t('register.username')}
          </Label>
          <Input
            id="signup-username"
            type="text"
            placeholder={t('register.usernamePlaceholder')}
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
            {t('register.email')}
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder={t('register.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
          >
            <Lock className="h-4 w-4" />
            {t('register.password')}
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-start items-center gap-3">
          <div>
            <div className="flex items-center gap-3 ">
              <Input
                id="accept-terms"
                type="checkbox"
                className="max-w-4 max-h-4"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <Label
                htmlFor="accept-terms"
                className="h-6"
              >
                {t('register.acceptTerms')}
              </Label>

            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('register.termsNoticePrefix') + " "}
              <Link to="/legal/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {t('register.termsOfUse')}
              </Link>{" "}
              {t('register.termsNoticeMiddle')}{" "}
              <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {t('register.privacyPolicy')}
              </Link>
              .
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="full"
          disabled={disableButton}
          type="submit"
        >
          {t('register.button')}
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
            {t('register.or')}
          </span>
        </div>
        <SocialLogin buttonTitle={t('register.googleSignup')} />
      </form>
    </TabsContent>
  );
}
