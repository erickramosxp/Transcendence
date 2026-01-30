import { Link } from "react-router-dom"
import { Button } from "../shared/components/Button"

export function Home() {

    return (
        <div className="bg-[#faf7f6] h-screen">
            <header className="flex h-12 justify-around items-center">
                <div>
                    <p>
                        Logo
                    </p>
                </div>
                <div className="">
                    <ul className="flex gap-4">
                        <li>
                            <Button>
                                <Link to={"/login"}>Login</Link>
                            </Button>
                        </li>
                        <li>
                            <Button>
                                <Link to={"/register"}>Registrar</Link>
                            </Button>
                        </li>
                    </ul>
                </div>
            </header>
            <hr />
            <main className="container mt-8 mx-auto flex px-4 items-center justify-center">
                <h1 className="text-7xl">Home</h1>
            </main>
        </div>
    )
}