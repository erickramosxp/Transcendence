import React from "react";
import { Button } from "@/design-system/primitives/Button";
import { useAuth } from "@/app/providers/AuthProvider";
import { GoogleIcon } from "./components/GoogleIcon";
export function SocialLogin({buttonTitle}) {

    const { socialLogin } = useAuth();
    
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={socialLogin}
      className="w-full h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
    >
      <GoogleIcon />
      <span className="truncate">{buttonTitle}</span>
    </Button>
  );
}
