import LexipopGame from '@/components/LexipopGame';
import NeynarProvider from './miniapp/components/NeynarProvider';

export default function Home() {
  return (
    <NeynarProvider>
      <LexipopGame />
    </NeynarProvider>
  );
}
