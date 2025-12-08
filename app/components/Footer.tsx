/*
 * Component: Footer
 * ----------------------------------------------------------------------------
 * Responsible: Zachary Memoli 
 * Description: Static footer displaying copyright and team members.
 * ----------------------------------------------------------------------------
 */

// Footer.tsx
// Component for the footer content of our web app

// main footer section function...
export default function Footer(){
    return(
        <footer className="pt-4 pb-4 text-center border-b-4 border-t-4 border-green-800">
            <p className="text-sm text-black">
                All rights reserved by Natalie King, Alex Olson, Zachary Memoli, & Tim Zaiyang Yu © 2025
            </p>
            <p className="text-xs p-1 text-black">
                Final Project for CS391A Web Application Development
            </p>
        </footer>
    )
}