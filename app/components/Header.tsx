/*
 * Component: Header
 * ----------------------------------------------------------------------------
 * Responsible: Alex Olson
 * Description: Created and styled header component / created logo image
 * ----------------------------------------------------------------------------
 */

// Header.tsx
// Component for the Header content of our app...

// imports for displaying our logo image...
import Image from "next/image";
import mm from "@/app/media/mass-money-logo.png";

// main header section function...
export default function Header(){
    return(
        <header className="bg-green-600 text-center p-2 flex flex-col items-center">
            <title> MA Lottery Scratcher EV Calc | CS391A </title>
            <Image src={mm} alt="Mass Money Logo" width={500} height={109} className="p-0" />
            <h1 className="text-4xl text-white font-bold font-mono pb-1"> MA Lottery Scratcher EV Calculator </h1>
            <p className="text-white font-mono p-1 italic">
            Find your next win using expected values across Massachusetts Lottery Scratcher games! </p>
        </header>
    )
}