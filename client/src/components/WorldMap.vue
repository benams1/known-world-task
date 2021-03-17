<template>
  <div>
    <div class="map" :class="{'full-size': isFullSize}">
      <div class="full-size-btn" @click="isFullSize = !isFullSize">toggle full size</div>
      <img v-for="house in houses"
           v-bind:src="getImgUrl(house.flag)"
           v-bind:key="house.id"
           :alt="house.name"
           :style="{position: 'absolute', left: housePosition(house.position.x) + 'px' ,top: housePosition(house.position.y) + 'px' }"
      >
    </div>
  </div>
</template>

<script lang="ts">
	import {Component, Prop, Vue} from 'vue-property-decorator';
    import House from '../models/House';

	@Component({
		name: 'world-map'
    })
	export default class WorldMap extends Vue {
		@Prop() houses!: House[];
		isFullSize?: boolean = false;

		housePosition(positionInPx: number) {
			const ratio = this.isFullSize ? 2.5 : 1;
			return positionInPx * ratio;
		}

		getImgUrl(img: string) {
			return require('../assets/' + img)
		}
	}
</script>

<style scoped lang="scss">
  .map {
    position: relative;
    top: 0;
    right: 0;
    background-image: url('../assets/map.jpg');
    background-size: cover;
    width: calc(1280px * 1.115);
    height: calc(853px * 1.115);
    border-left: 2px solid #55442b;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.50);

    &.full-size {
      width: 3600px;
      height: 2400px;
    }

    .full-size-btn {
      position: absolute;
      top: 0;
      left: 0;
      color: #a58e64;
      background-color: #775f3c;
      padding: 3px;
    }
    img{
      height: 50px;
      width: 50px;
    }
  }
</style>
