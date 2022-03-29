<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <filters
          @filters="applyFilters"
          @closeSelectedPopup="closeSelectedPopup"
          @updateMap="updateMap = $event"
          :loading="loading"
          :selectedPoint="point"
          :hasCoordinates="hasCoordinates"
        ></filters>
      </v-col>
      <v-col cols="12" md="9" class="py-0">
        <v-col cols="12">
          <v-card width="100%" class="mx-auto d-flex">
            <map-container
              v-if="hasCoordinates"
              ref="mapContainer"
              :geojson="geojson"
              :popupCoordinates="popupCoordinates"
              :loading="loading"
              @geoPoint="point = $event"
              @rebootMap="getData()"
            ></map-container>
            <div
              v-if="(loading || !hasCoordinates) && updateMap"
              class="loading"
            >
              <v-progress-circular
                indeterminate
                :size="70"
                :width="7"
                color="primary"
                class="mx-auto my-auto"
              >
              </v-progress-circular>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <measurement-table
            v-if="hasCoordinates"
            :measurements="dataMeasurements"
            :load="loading"
            @openPopupMap="popupCoordinates = $event"
          ></measurement-table>
        </v-col>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      top
      text
      width="100%"
      color="error"
      :timeout="timeout"
    >
      Nenhum dado encontrado.

      <template v-slot:action="{ attrs }">
        <v-btn color="error" text v-bind="attrs" @click="snackbar = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { getMeasurementsWithFilters, getPoints } from "../api";
import MapContainer from "../components/MapContainer.vue";
import Filters from "../components/Filters/Filters.vue";
import MeasurementTable from "../components/MeasurementTable.vue";

export default {
  name: "Home",

  components: {
    MapContainer,
    Filters,
    MeasurementTable
  },

  data() {
    return {
      points: null,
      hasCoordinates: false,
      hasMeasurementsTable: false,
      snackbar: false,
      loading: false,
      timeout: 3000,
      point: undefined,
      popupCoordinates: undefined,
      selectedPopup: undefined,
      updateMap: true,
      geoLocation: {
        type: "FeatureCollection",
        crs: {
          type: "name",
          properties: {
            name: "EPSG:3857"
          }
        },
        features: [],
      },
      dataMeasurements: []
    };
  },

  computed: {
    geojson: {
      get() {
        return this.geoLocation;
      },
      set(value) {
        return value;
      }
    },
  },

  async created() {
    await this.getData();
  },

  methods: {
    async getData() {
      this.loading = true;
      await getPoints().then(resultPoints => {
        this.points = resultPoints.body.results.bindings;
        this.geoLocation.features = this.points.map(point => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [point.longitude.value, point.latitude.value]
            },
            properties: {
              name: point.label.value,
              comment: point.comment.value,
              point: point.point.value
            },
          };
        });
        this.loading = false;
        this.hasCoordinates = true;
      });
    },

    async applyFilters(filters, updateMap, updateTable = true) {
      this.hasMeasurementsTable = true;
      this.loading = true;
      this.dataMeasurements = [];
      try {
        await getMeasurementsWithFilters(filters).then(resultPoints => {
          this.points = this.formatMeasurementObject(
            resultPoints.body.results.bindings
          );
          if (this.points.size > 0) {
            if(updateMap) {
              this.geoLocation.features = [];
            }
            for (let point of this.points) {
              if(updateMap) {
                this.geoLocation.features.push({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [point[1].measurement[0].longitude.value, point[1].measurement[0].latitude.value],
                  },
                  properties: {
                    name: point[1].measurement[0].geoLabel.value,
                    comment: point[1].measurement[0].geoComment.value,
                    point: point[1].measurement[0].geoPoint.value
                  },
                });
              }

              if(updateTable) {
                this.dataMeasurements.push(...point[1].measurement);
              }
            }
          } else {
            this.snackbar = true;
          }
          this.loading = false;
        });
      } catch (error) {
        this.snackbar = true;
        this.loading = false;
      }
    },

    formatMeasurementObject(measurements) {
      let pointsMap = new Map();
      measurements.map(measurement => {
        if (pointsMap.size == 0) {
          pointsMap.set(measurement.geoPoint.value, {
            geoPoint: measurement.geoPoint,
            measurement: [measurement]
          });
        } else {
          if (pointsMap.has(measurement.geoPoint.value)) {
            pointsMap
              .get(measurement.geoPoint.value)
              .measurement.push(measurement);
          } else {
            pointsMap.set(measurement.geoPoint.value, {
              geoPoint: measurement.geoPoint,
              measurement: [measurement]
            });
          }
        }
      });
      return pointsMap;
    },

    closeSelectedPopup() {
      this.$refs.mapContainer.closeSelectedPopup();
    }
  }
};
</script>


<style lang="scss" scoped>
.loading {
  position: absolute;
  width: 100%;
  height: 50vh;
  display: flex;
  opacity: 0.7;
  background: #f5f5f5;
}
</style>