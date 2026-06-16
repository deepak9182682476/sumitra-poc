import { useContext, useEffect } from "react";
import MapContext from "../mapcontext";
import OLTileLayer from "ol/layer/Tile";
import { OSM, TileArcGISRest } from "ol/source";

const TileLayer = ({ themeUrl }) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    let tileLayer = new OLTileLayer({
      id: "tileLayer",
      source: new OSM({
        // url: themeUrl,
        // url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png	",
      }),
      /*new TileArcGISRest({
      url: themeUrl,
    }),*/
    });

    map.addLayer(tileLayer);

    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map, themeUrl]);

  return null;
};

export default TileLayer;
