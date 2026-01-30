import { twMerge } from "tailwind-merge";

export function Button({className, children, ...props}) {

    const defaultStyles = "px-4 py-2 rounded font-bold text-white bg-blue-500 hover:bg-blue-600";

    return (
        <button className={twMerge(defaultStyles, className)} {...props}>
            {children}
        </button>
    )
}