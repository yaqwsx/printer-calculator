import {
    HashRouter as Router,
    Routes,
    Route,
    useLocation,
    useLinkClickHandler,
} from "react-router-dom";
import "./index.css";
import {
    HiMenu,
} from "react-icons/hi";

import {
    faBook,
    faMinimize,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Sidebar, Navbar } from "flowbite-react";

import { NotFound } from "./pages/404";
import { Landing } from "./pages/landing";
import { Shrinkage } from "./pages/shrinkage";
import { useState } from "react";

function Footer() {
    return null;
}

function TopMenu() {
    return (
        <Navbar fluid={false} menuOpen={true} rounded={true} className="shadow-lg">
            <Navbar.Brand href="/">
                <img
                    src="/logo.png"
                    className="mr-3 h-6 sm:h-9"
                    alt="yaqwsx's logo"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-whit">
                    yaqwsx's resin printer calculators
                </span>
            </Navbar.Brand>
            <Navbar.Collapse>
                <Navbar.Link href="https://blog.honzamrazek.cz">
                    My blog
                </Navbar.Link>
                <Navbar.Link href="/https://honzamrazek.cz">
                    About me
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

function flowbiteFa(icon: IconDefinition) {
    return (props: any) => <FontAwesomeIcon icon={icon} {...props} />;
}

export interface AppSideBarLinkProps {
    to: string;
    text: string;
}

export function AppSideBarLink(props: any) {
    const location = useLocation();
    const clickHandler = useLinkClickHandler(props.href);

    return (
        <Sidebar.Item
            {...props}
            active={location.pathname === props.href}
            onClick={clickHandler}
        />
    );
}

function SideMenu() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="my-2 w-fit rounded shadow-lg">
            <Sidebar aria-label="Main menu" collapsed={collapsed}>
                <Sidebar.Items>
                    <Sidebar.ItemGroup>
                        <div className="lg:hidden">
                            <Sidebar.Item
                                icon={HiMenu}
                                onClick={() => setCollapsed(!collapsed)}
                            >
                                Collapse
                            </Sidebar.Item>
                        </div>
                        <AppSideBarLink href="/" icon={flowbiteFa(faBook)}>
                            Intro
                        </AppSideBarLink>
                        <AppSideBarLink
                            href="/shrinkage"
                            icon={flowbiteFa(faMinimize)}
                        >
                            Compensating shrinkage
                        </AppSideBarLink>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </div>
    );
}

function AppFrame(props: { children?: any }) {
    return (
        <div className="container mx-auto min-h-screen bg-gray-100 px-1 md:px-4 py-9">
            <TopMenu />
            <div className="flex w-full">
                <SideMenu />
                <div className="flex-1 p-4 pl-10">{props.children}</div>
            </div>
            <Footer/>
        </div>
    );
}

export default function App() {
    return (
        <Router basename="/">
            <AppFrame>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/shrinkage" element={<Shrinkage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppFrame>
        </Router>
    );
}
