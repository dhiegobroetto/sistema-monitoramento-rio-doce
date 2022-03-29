<template>
  <v-card
    v-if="waterQualities.length > 0"
    class="mx-auto"
    elevation="0"
    outlined
    shaped
  >
    <v-container>
      <v-row>
        <v-col cols="12" class="waterQualities">
        <v-text-field
          label="Buscar parâmetro da qualidade da água"
          v-model="search"
          type="text"
        ></v-text-field>
        </v-col>
        <v-treeview
          selectable
          selected-color="primary"
          :items="waterQualities"
          :search="search"
          rounded
          hoverable
          dense
          open-on-click
          item-text="value"
          item-value="value"
          v-model="selectedWaterQualities"
          @input="changeWaterQuality"
        ></v-treeview>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { getWaterQualities } from "../../api";
export default {
  name: "WaterQualities",
  data() {
    return {
      waterQualities: [],
      selectedWaterQualities: [],
      search: '',
    };
  },

  async created() {
    await getWaterQualities().then(result => {
      this.waterQualities = this.listToTree(result.body.results.bindings);
    });
  },

  methods: {
    changeWaterQuality() {
      this.$emit("selectedWaterQualities", this.selectedWaterQualities);
    },

    cleanWaterQualities() {
      this.selectedWaterQualities = [];
    },

    listToTree(list) {
      var map = {},
        node,
        roots = [],
        i

      for (i = 0; i < list.length; i += 1) {
        // Inicializa o map
        map[list[i].subQuality.value] = i;

        // Inicializa o atributo children
        list[i].children = [];
        list[i].subQuality.id = i;
      }

      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.superQuality && node.superQuality.value != "http://purl.org/nemo/gufo#Quality") {
          node = {
            id: node.subQuality.value,
            value: node.label.value,
            superQuality: node.superQuality.value,
            children: node.children
          };
          list[map[node.superQuality]].children.push(node);
        } else {
          node = {
            id: node.subQuality.value,
            value: node.label.value,
            children: node.children
          };
          roots.push(node);
        }
      }
      return roots;
    }
  }
};
</script>