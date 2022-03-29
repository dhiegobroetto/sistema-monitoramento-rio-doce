<template>
  <v-card width="100%" class="mx-auto">
    <v-card-title class="header">
      Filtros
      <v-switch
        v-model="updateMap"
        inset
        primary
        label="Atualizar Mapa"
        @click="$emit('updateMap', updateMap)"
      ></v-switch>
    </v-card-title>
    <v-divider></v-divider>
    <v-form v-model="valid" ref="form">
      <v-container>
        <v-row>
          <v-col cols="12" xl="6">
            <v-text-field
              label="Data Inicial"
              v-model="filters.initialDate"
              type="date"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" xl="6">
            <v-text-field
              label="Data Final"
              v-model="filters.finalDate"
              type="date"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <agents
          @selectedAgents="getSelectedAgents"
          ref="agents"
        />
        <water-qualities
          v-if="hasCoordinates"
          @selectedWaterQualities="getSelectedWaterQualities"
          ref="waterQualities"
        />
        <div
          v-else
          class="d-flex mx-auto"
        >
          <v-progress-circular
            indeterminate
            :size="50"
            :width="4"
            color="primary"
            class="mx-auto my-auto"
          >
          </v-progress-circular>
        </div>
        <v-card
          v-if="point"
          class="my-5 rounded-lg point-card"
          elevation="0"
          
          outlined>
          <v-container>
            <v-row>
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <h4>Ponto selecionado</h4>
                <v-btn
                  icon
                  @click="deletePoint"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>

              <v-col cols="12">
                {{ point.get('point') }}
              </v-col>
              <v-col cols="12">
                {{ point.get('name') }}
              </v-col>
              <v-col cols="12">
                {{ point.get('comment') }}
              </v-col>
            </v-row>
          </v-container>
        </v-card>
        <v-divider class="my-4"></v-divider>
        <v-card-actions>
          <v-btn
            :loading="loading"
            color="secondary"
            @click="cleanFilters"
          >
            <v-icon left>
              mdi-filter-off
            </v-icon>
            Limpar
          </v-btn>
          <v-btn
            :loading="loading"
            @click="applyFilters"
            color="primary"
            class="ml-auto mr-0"
          >
            <v-icon left>
              mdi-filter
            </v-icon>
            Filtrar
          </v-btn>
        </v-card-actions>
      </v-container>
    </v-form>
  </v-card>
</template>

<script>
import Agents from "./Agents.vue";
import WaterQualities from "./WaterQualities.vue";

export default {
  name: "Filters",
  components: { WaterQualities, Agents },

  data() {
    return {
      valid: false,
      filters: {
        initialDate: '',
        finalDate: '',
        agents: [],
        waterQualities: [],
        geoPoint: ''
      },
      updateMap: true,
      point: undefined,
    };
  },

  props: {
    loading: Boolean,
    selectedPoint: Object,
    hasCoordinates: Boolean,
  },

  watch: {
    selectedPoint(value) {
      this.point = value;
    }
  },

  methods: {
    applyFilters() {
      if(this.$refs.form.validate()) {
        if(this.point) {
          this.filters.geoPoint = this.point.get('point');
        } else {
          this.filters.geoPoint = "";
        }
        this.$emit("filters", { ...this.filters }, this.updateMap);
      } else {
        this.valid = false;
      }
    },

    cleanFilters() {
      this.filters.initialDate = '';
      this.filters.finalDate = '';
      this.filters.agents = [];
      this.filters.waterQualities = [];
      this.deletePoint();
      this.$refs.agents.cleanAgents();
      this.$refs.waterQualities.cleanWaterQualities();
    },

    getSelectedAgents(selectedAgents) {
      this.filters.agents = selectedAgents;
    },

    getSelectedWaterQualities(selectedWaterQualities) {
      this.filters.waterQualities = selectedWaterQualities;
    },

    deletePoint() {
      this.point = undefined;
      this.$emit('closeSelectedPopup');
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  .header {
    padding: 1rem 1rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .point-card {
    border: 2px solid teal;
  }
}
</style>