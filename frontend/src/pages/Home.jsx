import { AuthContainer } from "../features/auth/AuthContainer"

export function Home() {

    return (
        <div className="bg-[#faf7f6] h-screen">
            <header className="flex h-12 justify-around items-center">
                <div>
                    <p>
                        Logo
                    </p>
                </div>
            </header>
            <hr />
            <main className="container mt-8 mx-auto flex px-4 items-center justify-center">
                <AuthContainer />
            </main>
        </div>
    )
}