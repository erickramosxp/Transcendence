
import { useEffect, useState } from "react";
import { updateProfileInfo } from "@/features/profile/services/profileService";
import {toast} from 'react-toastify'
import { useTranslation } from "react-i18next";
import { LIMITS } from '@/shared/validation/limits';
import { Button, Input, Label } from "@/design-system";
import { validateProfile } from "@/shared/validation/validators";
import { dispatchProfileAuthorNameUpdated } from "@/shared/profile/profileAuthorSync";

export function EditProfileForm({ onCancel, onSaved , userData, changeFields}) {

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    websiteUrl: ""
  });
  const { t } = useTranslation('profile');

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
  }, [userData]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const result = validateProfile(formData, t);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    const payload = { ...formData, ...result.data };

    try {
      await updateProfileInfo(payload);
      changeFields(payload);

      if (userData?.username && payload.name) {
        dispatchProfileAuthorNameUpdated({
          username: userData.username,
          name: payload.name,
        });
      }

      toast.success(t('header.editProfileModal.success'));
      onSaved?.();
    } catch (err) {
      console.log(err);
      toast.error(t('header.editProfileModal.error'));
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputs = [
    { id: "name", label: t('header.editProfileModal.name'), type: "text", value: formData.name, placeholder: t('header.editProfileModal.namePlaceholder'), onChange: e => updateField("name", e.target.value), maxLength: LIMITS.profileNameMax },
    { id: "bio", label: t('header.editProfileModal.bio'), type: "text", value: formData.bio, placeholder: t('header.editProfileModal.bioPlaceholder'), onChange: e => updateField("bio", e.target.value), maxLength: LIMITS.profileBioMax },
    { id: "location", label: t('header.editProfileModal.location'), type: "text", value: formData.location, placeholder: t('header.editProfileModal.locationPlaceholder'), onChange: e => updateField("location", e.target.value), maxLength: LIMITS.profileLocationMax },
    { id: "websiteUrl", label: t('header.editProfileModal.website'), type: "text", value: formData.websiteUrl, placeholder: t('header.editProfileModal.websitePlaceholder'), onChange: e => updateField("websiteUrl", e.target.value), maxLength: LIMITS.profileWebsiteMax }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-2">
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
                {t('header.editProfileModal.bioMaxLength')}
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
          {t('header.editProfileModal.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm">
          {t('header.editProfileModal.save')}
        </Button>
      </div>
    </form>
  );
}
