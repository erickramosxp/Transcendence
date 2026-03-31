import React from "react";
import { Button } from "@/design-system/primitives/Button";
import { useAuth } from "@/app/providers/AuthProvider";
import { GoogleIcon } from "./GoogleIcon";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export function SocialLogin({buttonTitle}) {

    const { socialLogin } = useAuth();
    const { t } = useTranslation('auth');

    const handleGoogleLogin = () => {

      if (!import.meta.env.GOOGLE_WEB_CLIENT_ID) {
        toast.error(t('socialLogin.unavailable'));
        return ;
      }
      socialLogin();
    }

  return (
    <Button
      type="button"
      variant="secondary"
      size="full"
      onClick={handleGoogleLogin}
    >
      <GoogleIcon />
      <span className="truncate">{buttonTitle}</span>
    </Button>
  );
}
