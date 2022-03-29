<template>
  <v-container>
    <v-row>
      <v-select
        v-model="selectedAgents"
        :items="agents"
        item-text="value"
        item-value="id"
        attach
        chips
        label="Responsável pela medição"
        multiple
        @change="changeAgent"
      ></v-select>
    </v-row>
  </v-container>
</template>

<script>
import { getAgents } from "../../api";
export default {
  name: "Agents",

  data() {
    return {
      agents: [],
      selectedAgents: []
    };
  },

  async created() {
    await getAgents().then(result => {
      if (result.body.results.bindings) {
        this.agents = result.body.results.bindings.map(agent => {
          return {
            id: agent.agent.value,
            value: agent.agent.value.split("#")[1],
          }
        });
      }
    });
  },

  methods: {
    changeAgent() {
      this.$emit("selectedAgents", this.selectedAgents);
    },

    cleanAgents() {
      this.selectedAgents = [];
    }
  }
};
</script>