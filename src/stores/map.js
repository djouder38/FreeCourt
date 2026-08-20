import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    center: [2.35, 48.86], // Paris par défaut
    zoom: 4,
    // 'browse' = navigation normale, 'pin' = mode placement d'un terrain
    mode: 'browse',
    pinLngLat: null,
  }),

  actions: {
    enterPinMode() {
      this.mode = 'pin'
      this.pinLngLat = null
    },
    exitPinMode() {
      this.mode = 'browse'
      this.pinLngLat = null
    },
    dropPin(lngLat) {
      this.pinLngLat = lngLat
    },
  },
})
