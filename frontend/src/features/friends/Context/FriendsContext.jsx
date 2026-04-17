import { createContext, useContext } from "react";

const FriendsContext = createContext(null);


export const FriendsProvider = ({ children, value }) => {

    return (
        <FriendsContext.Provider value={value}>
            {children}
        </FriendsContext.Provider>
    )
}

export const useFriendsContext = () => {

    const context = useContext(FriendsContext);

    if (!context) {
        throw new Error("useFriendsContext must be used inside FriendsProvider");
    }

    return context;
}