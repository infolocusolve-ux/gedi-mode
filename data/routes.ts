export type RouteIconKey = "landmark" | "building" | "wheat" | "route";

export interface Route {
  id: string;
  name: string;
  gurmukhiName: string;
  shortDescription: string;
  videoPath: string;
  icon: RouteIconKey;
}

export function getRouteById(routeId: string): Route | undefined {
  return routes.find((route) => route.id === routeId);
}

export const routes: Route[] = [
  {
    id: "chandigarh",
    name: "Chandigarh",
    gurmukhiName: "ਚੰਡੀਗੜ੍ਹ",
    shortDescription: "City lights. Clean roads. Late-night energy.",
    videoPath: "/scenes/route-chandigarh-night.mp4",
    icon: "landmark",
  },
  {
    id: "ludhiana",
    name: "Ludhiana",
    gurmukhiName: "ਲੁਧਿਆਣਾ",
    shortDescription: "Urban Punjab. Wide roads. Full gedi vibe.",
    videoPath: "/scenes/route-ludhiana-night.mp4",
    icon: "building",
  },
  {
    id: "pind",
    name: "Pind Route",
    gurmukhiName: "ਪਿੰਡ ਰੂਟ",
    shortDescription: "Fields. Dark roads. Pure Punjab nights.",
    videoPath: "/scenes/route-pind-night.mp4",
    icon: "wheat",
  },
  {
    id: "highway",
    name: "Highway",
    gurmukhiName: "ਹਾਈਵੇ",
    shortDescription: "Open road. Dhabas. Long-drive mode.",
    videoPath: "/scenes/route-highway-night.mp4",
    icon: "route",
  },
];
