import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../providers/AuthProvider";
import { PrivateRoute } from "../PrivateRoute";

function PrivatePage() {
    return <h1>Private Page</h1>;
}

function Home() {

    return <h1>Home</h1>
}

describe ("PrivateRoute", () => {

    test("Redirects home when user is not authenticated", () => {
    
        render(
            <MemoryRouter initialEntries={["/feed"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
    
                        <Route path="/feed"
                                element={
                                    <PrivateRoute>
                                        <PrivatePage />
                                    </PrivateRoute>
                                }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        )
    
        expect(screen.getByText("Home")).toBeInTheDocument();
    
    });

    test("allows access when user is authenticated", async () => {

        localStorage.getItem.mockImplementation((key) => {
            if (key === "@trascendence:token")
                return "fake-jwt";
            if (key === "@trascendence:user")
                return JSON.stringify({ id: 1, name: "Test User" });
            return null;
        });

        render(
            <MemoryRouter initialEntries={["/feed"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                        path="/feed"
                        element={
                            <PrivateRoute>
                                <PrivatePage />
                            </PrivateRoute>
                        }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText("Private Page")).toBeInTheDocument();
    });

})
