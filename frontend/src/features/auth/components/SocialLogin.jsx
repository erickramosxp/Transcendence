import React from "react";
import { toast } from "react-toastify";
import { GoogleIcon } from "./GoogleIcon";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/design-system";

export function SocialLogin({buttonTitle}) {

    const { socialLogin } = useAuth();

    const handleGoogleLogin = () => {

      if (!import.meta.env.GOOGLE_WEB_CLIENT_ID) {
        toast.error('Login com Google indisponível');
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
