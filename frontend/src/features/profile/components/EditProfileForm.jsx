
import { useEffect, useState } from "react";

import { Label } from "@/design-system/primitives/Label";
import { Input } from "@/design-system/primitives/Input";
import { Button } from "@/design-system/primitives/Button";
import { updateProfileInfo } from "@/features/profile/services/profileService";
import {toast} from 'react-toastify'

export function EditProfileForm({ onCancel, onSaved , userData, changeFields}) {

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: ""
  });

  // {
//   "id": 0,
//   "avatarUrl": "string",
//   "bannerImgUrl": "string",
//   "username": "string",
//   "name": "string",
//   "followers": 0,
//   "following": 0,
//   "registerDate": "2022-03-10T12:15:50-04:00"
// }

  useEffect(() => {
    setFormData({
      name: userData?.name || '',
      bio: userData?.bio || '',
      location: userData?.location || '',
      websiteUrl: userData?.websiteUrl || ''
    })
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.length < 3) {
      toast.error("Necessário pelo menos 3 letras no nome!");
      return;
    }
    if (formData.bio.length > 160) {
      toast.error("Bio só pode ter 160 caracteres!");
      return;
    }

    try {
      await updateProfileInfo(formData);
      changeFields(formData);
      toast.success("Perfil atualizado com sucesso");
    } catch(err) {
      console.log(err);
      toast.error("Falha ao atualizar perfil");
    }
    onSaved?.();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputs = [
    { id: "name", label: "Nome", type: "text", value: formData.name, placeholder: "Digite seu nome", onChange: e => updateField("name", e.target.value) },
    { id: "bio", label: "Biografia", type: "text", value: formData.bio, placeholder: "", onChange: e => updateField("bio", e.target.value), maxLength: 160 },
    { id: "location", label: "Localização", type: "text", value: formData.location, placeholder: "", onChange: e => updateField("location", e.target.value) },
    { id: "website", label: "Website", type: "url", value: formData.websiteUrl, placeholder: "https://exemplo.com", onChange: e => updateField("website", e.target.value) }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4">
        {inputs.map(({ id, label, type, value, placeholder, onChange, maxLength }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              maxLength={maxLength}
              autoComplete="off"
            />
            {id === "bio" && (
              <p className="text-xs text-muted-foreground">
                Máx. 160 caracteres
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm">
          Salvar
        </Button>
      </div>
    </form>
  );
}
