import Hud from "@/components/Hud";
import { getScene, listScenes } from "@/lib/scenes";
import { notFound } from "next/navigation";

export default function Play() {
  const scene = getScene("scene-001-terminal");
  if (!scene) notFound();
  return <Hud initialScene={scene} allScenes={listScenes()} />;
}
