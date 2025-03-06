import React from 'react'
import NavbarComp from './navbar'

export default function Layout({ children }) {
    return (
        <div>
            <NavbarComp />
            {children}
        </div>
    )
}
