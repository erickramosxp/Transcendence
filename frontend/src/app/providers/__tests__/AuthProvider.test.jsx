
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../AuthProvider";

test("AuthProvider placeholder test", () => {

    render(
        <MemoryRouter>
            <AuthProvider>
                <div>Child</div>
            </AuthProvider>
        </MemoryRouter>
    )
    expect(true).toBe(true);
});