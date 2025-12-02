import Image from "next/image";
import InstantAnalytics from '@/app/components/InstantAnalytics';
import Header from '@/app/components/Header';

export default function Home() {
  return (
      <div>
          <Header/>
          <InstantAnalytics/>
      </div>
  );
}
