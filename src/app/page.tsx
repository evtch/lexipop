import LexipopMiniApp from './miniapp/components/LexipopMiniApp';
import MiniAppLayoutWrapper from './layout-miniapp';

export default function Home() {
  return (
    <MiniAppLayoutWrapper>
      <LexipopMiniApp />
    </MiniAppLayoutWrapper>
  );
}
