<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-h6 q-mb-md">Filtros</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-4">
        <q-select
          :model-value="modelValue.categoryId"
          :options="categories"
          label="Categoría"
          clearable
          emit-value
          map-options
          outlined
          @update:model-value="updateFilter('categoryId', $event)"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          :model-value="modelValue.minPrice"
          type="number"
          label="Precio mínimo"
          :min="minPrice"
          :max="modelValue.maxPrice ?? maxPrice"
          outlined
          @update:model-value="updateFilter('minPrice', $event)"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          :model-value="modelValue.maxPrice"
          type="number"
          label="Precio máximo"
          :min="modelValue.minPrice ?? minPrice"
          :max="maxPrice"
          outlined
          @update:model-value="updateFilter('maxPrice', $event)"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup>
const props = defineProps({
  categories: { type: Array, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function updateFilter(key, value) {
  const parsedValue = value === '' || value === null ? null : Number(value)
  emit('update:modelValue', { ...props.modelValue, [key]: parsedValue })
}
</script>
