
// footer section of main page
export default function Footer(){
    return(
        <footer className="mt-16 pt-8 pb-4 text-center border-t-2" style={{ borderColor: '#fcd5ce' }}>
            <p className="text-sm" style={{ color: '#8b7b6b' }}>
            © {new Date().getFullYear()} Natalie King & CS391 Team. All rights reserved.
            </p>
            <p className="text-xs mt-2" style={{ color: '#ababab' }}>
            Made with 💖 and pastel colors
            </p>
        </footer>
    )
    
}