<template>
  <div ref="map-root" style="width: 100%; height: 50vh">
    <div id="popup" class="ol-popup">
      <div id="popup-content"></div>
    </div>
    <div id="popup-selected" class="ol-popup ol-popup-selected">
      <button id="popup-closer" class="ol-popup-closer" @click="closeSelectedPopup"></button>
      <div id="popup-selected-content"></div>
    </div>
    <v-tooltip bottom color="primary">
      <template v-slot:activator="{ on, attrs }">
        <div
          class="reboot-map"
        >
          <v-btn
            fab
            small
            color="primary"
            v-bind="attrs"
            v-on="on"
            :loading="loading"
            @click="$emit('rebootMap')"
          >
            <v-icon
              large
              color="darken-2 green"
            >
              mdi-restart
            </v-icon>
          </v-btn>
        </div>
      </template>
      <span>Reiniciar Mapa</span>
    </v-tooltip>
  </div>
</template>

<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Overlay from "ol/Overlay";
import FullScreen from "ol/control/FullScreen";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {transform} from 'ol/proj';

// ----- Style ----- //
import "ol/ol.css";

export default {
  name: "MapContainer",
  components: {},
  props: {
    geojson: Object,
    popupCoordinates: Array,
    loading: Boolean
  },
  data: () => ({
    map: null,
    vectorLayer: null,
    overlay: null,
    view: null
  }),
  mounted() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [] // VectorLayer criado como vazio.
      })
    });

    // Popup para o ponto que aparece ao mover o mouse por cima.
    var popupDefault = document.getElementById("popup"),
      popupDefaultContent = document.getElementById("popup-content");
    
    // Popup para o ponto selecionado.
    var popupSelected = document.getElementById("popup-selected"),
      popupSelectedContent = document.getElementById("popup-selected-content");

    this.overlay = new Overlay({
      element: popupDefault,
      offset: [0, -10]
    });

    this.overlaySelected = new Overlay({
      element: popupSelected,
      offset: [0, -10]
    });

    this.view = new View({
      zoom: 0,
      center: [0, 0],
      constrainResolution: true
    })

    // ----- Construção do Mapa ----- //
    this.map = new Map({
      target: this.$refs["map-root"],
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: this.view,
    });

    this.map.addOverlay(this.overlay);
    this.map.addOverlay(this.overlaySelected);

    var fullscreen = new FullScreen();
    this.map.addControl(fullscreen);

    this.map.on("click", ev => {
      const clickedPoint = this.map.forEachFeatureAtPixel(
        ev.pixel,
        feature => feature
      );

      if (clickedPoint) {
        var geometry = clickedPoint.getGeometry();
        var coord = geometry.getCoordinates();
        var content = "<h3>" + clickedPoint.get("name") + "</h3>";
        // content += "<h5>" + clickedPoint.get("comment") + "</h5>";

        popupSelectedContent.innerHTML = content;
        this.overlaySelected.setPosition(coord);
        this.overlay.setPosition(undefined);

        // Anima a centralização do mapa para o popup
        this.view.animate({
          center: coord,
          duration: 500,
        });

        // Chama atualização da tabela ao clicar.
        this.$emit("geoPoint", clickedPoint);
      }
    });

    // Detecta o ponto do mapa sob o mouse.
    this.map.on("pointermove", event => {
      const hoveredPoint = this.map.forEachFeatureAtPixel(
        event.pixel,
        feature => feature
      );

      if (hoveredPoint) {
        var geometry = hoveredPoint.getGeometry();
        var coord = geometry.getCoordinates();
        var content = "<h3>" + hoveredPoint.get("name") + "</h3>";
        // content += "<h5>" + hoveredPoint.get("comment") + "</h5>";

        popupDefaultContent.innerHTML = content;
        this.overlay.setPosition(coord);
      } else {
        this.overlay.setPosition(undefined);
      }

      if (event.dragging) return;

      var pixel = this.map.getEventPixel(event.originalEvent);
      var hit = this.map.hasFeatureAtPixel(pixel);

      this.map.getTarget().style.cursor = hit ? "pointer" : "";

      this.map.getViewport().style.cursor = hoveredPoint ? "pointer" : "";
    });

    this.updateSource(this.geojson);
  },

  watch: {
    geojson: {
      handler: function(value, oldvalue) {
        // Atualiza o mapa ao alterar algum ponto.
        if (value.features) {
          this.updateSource(value);
        }
      },
      deep: true
    },

    // Quando selecionado um ponto na tabela
    popupCoordinates: {
      handler: function(point) {
        var coord = [point[0], point[1]];

        // Conversão de coordenadas padrão para coordenadas flat.
        var flatCoord = transform(coord, 'EPSG:4326', 'EPSG:3857');

        var popupSelectedContent = document.getElementById("popup-selected-content");
        popupSelectedContent.html = '';
        popupSelectedContent.innerHTML = "<h3>" + point[2]; + "</h3>";
        this.overlaySelected.setPosition(flatCoord);

        // Encontra o ponto no vetor de Features.
        const selectedPoint = this.vectorLayer.getSource().getFeaturesAtCoordinate(flatCoord)[0];

        this.$emit("geoPoint", selectedPoint);

        // Anima a centralização do mapa para o popup
        this.view.animate({
          center: flatCoord,
          duration: 500,
        });
      },
      deep: true
    }
  },

  methods: {
    updateSource(geojson) {
      const view = this.map.getView();
      const source = this.vectorLayer.getSource();
      const features = new GeoJSON({
        featureProjection: "EPSG:3857"
      }).readFeatures(geojson);

      source.clear();
      source.addFeatures(features);

      if(features.length > 5) {
        view.fit(source.getExtent());
      }
      // Reposiciona a visualização de acordo com os pontos.
    },

    closeSelectedPopup() {
      this.overlaySelected.setPosition(undefined);
      this.$emit("geoPoint", undefined);
    },

    updateOverlayPosition(coord) {
      this.overlay.setPosition(coord);
    }
  }
};
</script>

<style lang="scss" scoped>
html, body, #map {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#map {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
}

.reboot-map {
  position: absolute;
  z-index: 2;
  left: 0.5rem;
  bottom: 0.5rem;
}

.ol-popup {
  position: absolute;
  min-width: 180px;
  background-color: white;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  bottom: 12px;
  left: -50px;

  &:after, &:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  &:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
  }

  &:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
  }

  &-selected {
    border: 1px solid teal;

    &:after {
      border-top-color: white;
      border-width: 10px;
      left: 48px;
      margin-left: -10px;
    }

    &:before {
      border-top-color: #cccccc;
      border-width: 11px;
      left: 48px;
      margin-left: -11px;
    }
  }

  &-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
    color: teal;
    font-size: 18px;
    font-weight: bold;

    &::after {
      content: "\2713";
    }

    &:hover::after {
      content: "✖";
    }
  }
}
</style>