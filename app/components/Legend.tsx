/*
 * Component: Legend
 * ----------------------------------------------------------------------------
 * Responsible: Zaiyang Yu
 *
 * Description:
 * A static informational component that explains the terminology and metrics
 * used throughout the application (e.g., EV, Scarcity, High Stock).
 *
 * Logic & Reasoning:
 * - We separated this into its own component to keep the main page clean.
 * - It uses a definition list (<dl>) structure for semantic correctness and accessibility.
 * - Styling is consistent with the app's green theme to maintain visual hierarchy.
 * ----------------------------------------------------------------------------
 */

// Legend.tsx
// Component for the legend content of our web app

export default function Legend(){
    return (
        <div className="mt-12 border-4 border-green-800 bg-white p-8 font-mono max-w-4xl mx-auto">
            <div className="text-center mb-6 border-b-4 border-green-800 pb-4">
                <h2 className="text-2xl font-bold text-green-800 uppercase">
                    Understanding the Metrics
                </h2>
            </div>

            <dl className="space-y-4">
                {/* Each item now uses green borders and backgrounds instead of pastel custom hex codes */}
                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Initial EV:</dt>
                    <dd className="text-green-900">
                        Total initial prize pool ÷ estimated total tickets
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Current EV:</dt>
                    <dd className="text-green-900">
                        Total remaining prize pool ÷ estimated remaining tickets
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> EV per Dollar:</dt>
                    <dd className="text-green-900">
                        Expected value per dollar spent (Current EV ÷ ticket price). Values closer to $1.00 are better. Most games range from $0.50-$0.70.
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Net Current EV:</dt>
                    <dd className="text-green-900">
                        Current EV minus ticket price (positive = better than break-even on average)
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Ticket Estimation:</dt>
                    <dd className="text-green-900">
                        Median of (odds × prizes) across all prize tiers
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Best Value:</dt>
                    <dd className="text-green-900">
                        Games with an Expected Value per Dollar greater than $1.00. These are statistically profitable plays.
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> Scarcity:</dt>
                    <dd className="text-green-900">
                        Games with 5 or fewer Top Prizes remaining. Sorted by Prize Amount (highest to lowest) then by remaining count (fewest to most).
                    </dd>
                </div>

                <div className="p-4 border-2 border-green-800 bg-green-50">
                    <dt className="font-bold mb-1 text-black underline decoration-green-400 decoration-4"> High Stock:</dt>
                    <dd className="text-green-900">
                        Games with a deep inventory (more than 80% estimated tickets remaining). These are widely available.
                    </dd>
                </div>

            </dl>

            {/* Warning box style updated to match the footer's high contrast style */}
            <p className="mt-6 text-center text-sm p-4 bg-green-800 text-white font-bold border-t-4 border-black">
                This calculator is for educational purposes. All lottery games have negative expected value on average. Play responsibly.
            </p>
        </div>
    )
}