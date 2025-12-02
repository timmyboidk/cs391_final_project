

export default function Header(){
    return(
        <header className="mb-12 text-center">
            <div className="inline-block mb-4 text-6xl">🎰✨</div>
            <h1 className="text-5xl font-bold mb-3" style={{
                background: 'linear-gradient(135deg, #fec5bb 0%, #fec89a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}> CA Lottery Scratcher EV Calculator </h1>
            <p className="text-lg" style={{ color: '#8b7b6b' }}>
            Compare expected values across California Lottery Scratcher games ✨
            </p>
        </header>
    )
    
}