import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { GoogleIcon } from "./GoogleIcon";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/design-system";

export function SocialLogin({buttonTitle}) {

    const { socialLogin } = useAuth();
    const { t } = useTranslation('auth');

    const handleGoogleLogin = () => {

      if (!import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID) {
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
