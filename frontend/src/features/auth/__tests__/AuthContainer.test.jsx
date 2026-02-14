import { render, screen } from "@testing-library/react";
import { AuthContainer } from "../AuthContainer";
import { AuthProvider } from "../../../app/providers/AuthProvider";
import { MemoryRouter } from "react-router-dom";

test("renders auth container", () => {
    render(
        <MemoryRouter>
            <AuthProvider>
                <AuthContainer />
            </AuthProvider>
        </MemoryRouter>
    );
  expect(screen.getByText(/Entrar/i)).toBeInTheDocument();
});