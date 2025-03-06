import React, { useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    Avatar,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Button
} from "@heroui/react";

export default function NavbarComp() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { label: "ลงนามออนไลน์", url: "/contents/pdfsigner" },
        { label: "Docs", url: "/contents/docs" },
    ];

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                <Link href="/" color="foreground">
                    <NavbarBrand>
                        <p className="font-bold text-inherit">DIGITAL CMRU</p>
                    </NavbarBrand>
                </Link>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {menuItems.map((item, index) => (
                    <NavbarItem key={index}>
                        <Link color="foreground" href={item.url}>
                            {item.label}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent as="div" justify="end">
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Avatar
                            isBordered
                            as="button"
                            className="transition-transform"
                            color="secondary"
                            name="Avatar"
                            size="sm"
                            src={"https://i.pravatar.cc/150?u=a042581f4e29026704d"}
                        />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                        <DropdownItem key="profile" className="h-14 gap-2" href="/auth/profile">
                            <p className="font-semibold">Signed in as</p>
                            <p className="font-semibold">Test</p>
                        </DropdownItem>
                        <DropdownItem key="payment">Payment</DropdownItem>
                        <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                        <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
                            Log Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Button
                    radius="full"
                    className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                >
                    <Link href="/personal/login" color="foreground">
                        Please Login
                    </Link>
                </Button>
            </NavbarContent>

            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.label}-${index}`}>
                        <Link color="foreground" className="w-full" href={item.url}>
                            {item.label}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}