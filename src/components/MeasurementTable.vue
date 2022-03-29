<template>
  <v-card>
    <v-card-title
      class="my-3"
    >
      Dados das Medições
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Pesquisar"
        single-line
        hide-details
        class="mt-0 pt-0"
      ></v-text-field>
      <vue-json-to-csv
        :json-data="filteredItems"
        :csv-title="fileName()"
        class="d-flex justify-end ml-3"
      >
        <v-tooltip bottom color="primary">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mx-2"
              fab
              small
              color="primary"
              v-bind="attrs"
              v-on="on"
              :disabled="filteredItems.length == 0"
            >
              <v-icon dark>
                mdi-download
              </v-icon>
            </v-btn>
          </template>
          <span>Exportar para CSV</span>
        </v-tooltip>
      </vue-json-to-csv>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :loading="load"
      loading-text="Carregando..."
      no-data-text="Nenhum dado apresentado. Utilize os filtros para buscar por dados."
      :footer-props="{itemsPerPageText: 'Nº de linhas'}"
      @current-items="getFiltered"
    >
      <template v-slot:item.measurementDate="{ item }">
        <span>{{ new Date(item.measurementDate).toLocaleDateString('pt-BR') }}</span>
      </template>
      <template v-slot:item.measurementTime="{ item }">
        <span>
          {{ new Date(item.measurementTime).toLocaleTimeString(
              ['pt-BR'], {hour: '2-digit', minute:'2-digit'}
            ) 
          }}
        </span>
      </template>
      <template v-slot:item.geoLabel="{ item }">
        <span>
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on, attrs }">
              <a
                @click="geoPointClick(item.latitude, item.longitude, item.geoLabel)"
                v-bind="attrs"
                v-on="on"
              >
                {{ item.geoLabel }}
              </a>
            </template>
            <span>Encontrar ponto no mapa</span>
          </v-tooltip>
        </span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import VueJsonToCsv from 'vue-json-to-csv'

export default {
  name: 'MeasurementTable',
 
  components: {
    VueJsonToCsv,
  },

  data() {
    return {
      search: "",
      headers: [
        {
          text: "Parâmetro da Qualidade da Água",
          align: "start",
          value: "qualityKind" },
        { text: "Valor da Qualidade", value: "qualityValue" },
        { text: "Unidade", value: "unit" },
        { text: "Data da Medição", value: "measurementDate"},
        { text: "Horário da Medição", value: "measurementTime" },
        { text: "Ponto Geográfico", value: "geoLabel" },
        { text: "Latitude", value: "latitude" },
        { text: "Longitude", value: "longitude" },
        { text: "Responsável", value: "agent" }
      ],
      items: [],
      filteredItems: [],
    };
  },

  props: {
    measurements: Array,
    load: Boolean
  },

  watch: {
    measurements(measurementList) {
      this.items = [];
      measurementList.forEach(measurement => {
        let dateTimeValue = new Date(measurement.initialDate.value);
        this.items.push({
          measurement: this.getURIName(measurement.measurement.value),
          qualityKind: measurement.qualityKindLabel.value,
          qualityValue: measurement.qualityValue.value,
          unit: this.getUnitName(measurement.unit.value),
          measurementDate: dateTimeValue,
          measurementTime: dateTimeValue,
          geoLabel: measurement.geoLabel.value,
          latitude: measurement.latitude.value,
          longitude: measurement.longitude.value,
          agent: this.getURIName(measurement.agent.value)
        });
      });
    }
  },

  methods: {
    geoPointClick(lat, long, geoLabel) {
      this.$emit('openPopupMap', [long, lat, geoLabel]);
    },

    getURIName(value) {
      return value.split("#")[1];
    },

    getUnitName(value) {
      return value.split("unit/")[1];
    },

    fileName() {
      var today = new Date();
      var date = today.getDate() + '-' + (today.getMonth()+1)+'-'+ today.getFullYear() + '-' + today.getTime();
      return 'datatable-' + date;
    },

    getFiltered(items) {
      this.filteredItems = items;
    }
  },
};
</script>

<style>
</style>