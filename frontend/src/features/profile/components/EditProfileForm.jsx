
import { useState } from "react";
import './EditProfileForm.css'

export function EditProfileForm({ onCancel, onSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: ""
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    // TODO: integra com profileService.js
    // await updateProfile(formData);
    onSaved?.();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputs = [
    { id: "name", label: "Nome", type: "text", value: formData.name, placeholder: "Digite seu nome", onChange: e => updateField("name", e.target.value) },
    { id: "bio", label: "Biografia", type: "text", value: formData.bio, placeholder: "Apaixonado por tecnologia inovadora", onChange: e => updateField("bio", e.target.value), maxLength: 160 },
    { id: "location", label: "Localização", type: "text", value: formData.location, placeholder: "São Paulo, Brasil", onChange: e => updateField("location", e.target.value) },
    { id: "website", label: "Website", type: "url", value: formData.website, placeholder: "https://exemplo.com", onChange: e => updateField("website", e.target.value) }
  ];

  return (
    <form onSubmit={onSubmit} className="edit-profile-form">
      <div className="form-grid">
        {inputs.map(({ id, label, type, value, placeholder, onChange, maxLength }) => (
          <div key={id} className="input-group">
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              maxLength={maxLength}
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
