import type { Route } from "./+types/home";
import {FileSystemPage} from '~/FilesystemPage/FileSystemPage'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AnchorLess File system" },
    { name: "description", content: "Uploadez vos fichiers pour votre demande de visa" },
  ];
}

export default function Home() {
  return <FileSystemPage />;
}
