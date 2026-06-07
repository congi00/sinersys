
// not-found.tsx (server component)
import NotFoundContent from "../components/NotFoundContent";
import { Providers } from "../providers";

export default function NotFound() {
  return (
    <Providers>
      <NotFoundContent/>
    </Providers>)
}