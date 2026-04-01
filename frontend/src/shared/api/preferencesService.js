import api from "@/shared/api/httpClient";

export async function updateUserPreferences(payload) {
    const response = await api.put("/preferences", payload ,{
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.data;
}


export async function updateUserLanguage(payload) {
    const response = await api.patch("/preferences/language", payload,{
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.data;
}

export async function updateUserTheme(payload) {
    const response = await api.patch("/preferences/theme", payload,{
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.data;
}

export async function getUserPreferences() {
    const response = await api.get("/preferences");

    return response.data;
}