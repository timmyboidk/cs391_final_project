import Header from "./components/Header";
import Footer from "./components/Footer";
import Legend from "./components/Legend";
import Table from "./components/Table";
import InstantAnalytics from './components/InstantAnalytics';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-green-100">
            <Header />

            <main className="flex-1 p-4">
                <Legend />
                <Table />
                <InstantAnalytics/>
            </main>

            <Footer />
        </div>
    );
}
