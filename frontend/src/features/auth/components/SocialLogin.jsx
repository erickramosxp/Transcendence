import React from "react";
import { Button } from "@/design-system/primitives/Button";
import { useAuth } from "@/app/providers/AuthProvider";
import { GoogleIcon } from "./GoogleIcon";
import { toast } from "react-toastify";

export function SocialLogin({buttonTitle}) {

    const { socialLogin } = useAuth();

    const handleGoogleLogin = () => {

      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
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
