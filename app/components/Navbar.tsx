import { Link } from "react-router"

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to={"/"}>
                <p className="text-2xl text-gradient font-bold">RESUMIND</p>
            </Link>
            <Link to={"/"} className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}

export default Navbar
