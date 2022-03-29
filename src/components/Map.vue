<template>
  <div>
    <div ref="map-root" style="width: 100%; height: 100vh"></div>
  </div>
</template>

<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";

// we’ll need these additional imports
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

// this is a simple triangle over the atlantic ocean
const data = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
  }
};

export default {
  name: "Map",
  components: {},
  props: {},
  mounted() {
    // a feature (geospatial object) is created from the GeoJSON
    const feature = new GeoJSON().readFeature(data, {
      // this is required since GeoJSON uses latitude/longitude,
      // but the map is rendered using “Web Mercator”
      featureProjection: "EPSG:3857"
    });

    // a new vector layer is created with the feature
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature]
      })
    });

    // this is where we create the OpenLayers map
    new Map({
      // the map will be created using the 'map-root' ref
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        // the vector layer is added above the tiled OSM layer
        vectorLayer
      ],

      // the map view will initially show the whole world
      view: new View({
        zoom: 0,
        center: [0, 0],
        constrainResolution: true
      })
    });
  }
};
</script>