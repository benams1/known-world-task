<template>
  <div class="container">

    <div class="side-panel">
      <h1>Score Board</h1>
      <ul>
        <HouseView v-bind:house="house" v-for="house in houses" :key="house.id"/>
      </ul>

      <div class="mt-20">
        <h2>Updates</h2>
        <ul>
          <Update v-bind:update="update" v-for="update in updates" :key="`update-${update.timestamp.valueOf()}`"/>
        </ul>

      </div>
    </div>

    <world-map :houses="houses"></world-map>
  </div>
</template>

<script lang="ts">
	// @ is an alias to /src
	import WorldMap from '../components/WorldMap.vue';
	import {Component, Vue, Watch} from 'vue-property-decorator';
	import House from '../models/House';
	import {IPoint} from '../models/IPoint';
	import {IUpdate} from '../models/IUpdate';
    import Update from "../components/Update.vue";
    import HouseView from "../components/HouseView.vue";

    const LANNISTER = 'Lannister';

	@Component({
		name: 'Home',
		components: {
		  WorldMap: WorldMap,
          Update: Update,
          HouseView: HouseView,
        },
	})
	export default class Home extends Vue {

		created() {
			this.$store.dispatch('initUpdates');
			this.$store.dispatch('getHouses');
		}

		/**
     	* watch for updates
		* @param latestUpdate
		*/
		@Watch('latestUpdate')
		onNewUpdate(latestUpdate: IUpdate) {
          const house = this.getHouseByName(latestUpdate.house.name);
          if (latestUpdate.house.name === LANNISTER) {
            house.score += latestUpdate.score;
            this.updateHouse(house)
            return;
          }
          const { x: kingsLandingX , y: kingsLandingY } = this.kingsLandingPosition
          const { x: houseX , y: houseY } = house.position
          const newPoint = this.calcNewPosition(houseX, houseY, kingsLandingX, kingsLandingY, latestUpdate.steps)

          house.score += latestUpdate.score;
          house.position = { x: Math.round(newPoint.x), y: Math.round(newPoint.y) }
          this.updateHouse(house)
          if (this.isAtKingsLanding(house.position)) {
            const winner: House = this.calcWinner(house)
            if (winner.name !== LANNISTER) this.setWinner(winner)
          }
		}

		isAtKingsLanding ({ x, y }: { x: number; y: number }): boolean {
          const { x: kingsLandingX , y: kingsLandingY } = this.kingsLandingPosition
          return x === kingsLandingX && y === kingsLandingY
        }
	  	/**
		* @param x1 house x position
		* @param y1 house y position
		* @param x2 destination x position
		* @param y2 destination y position
		* @param length number of steps towards destination
		*/
		calcNewPosition(x1: number, y1: number, x2: number, y2: number, length: number): IPoint {
		  const distance = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
          if (distance <= length) {
            return { x: x2, y: y2 }; // if the walk more or exactly the distance to kingsLanding
          }
          const dY = y2 - y1;
          const dX = x2 - x1;
          const m = !dX
                  ? Number.MAX_SAFE_INTEGER // x2 == x1 => parallel to Y axis m == infinity
                  : dY / dX;

          if (m === 0) {
            // parallel to x axis
            return {
              x: x1 > x2 ? x1 - length : x1 + length,
              y: y1,
            };
          } else if (m === Number.MAX_SAFE_INTEGER) {
            // parallel to Y axis
            return {
              x: x1,
              y: y1 > y2 ? y1 - length : y1 + length,
            };
          }
          else {
            const deltaX = length / Math.sqrt(1 + Math.pow(m, 2));
            const deltaY = m * deltaX;
            const x = x1 > x2
                    ? x1 - deltaX
                    : x1 + deltaX;
            const y = y1 > y2
                    ? y1 - deltaY
                    : y1 + deltaY;
            return { x, y }
          }
		}

	  	/**
		* @param house the house fighting the Lannisters
		*/
	  	calcWinner(house: House): House {
	  	  const lannister = this.getHouseByName(LANNISTER);
          if (lannister.score <= house.score) {
            return house
          }
          return lannister;
		}
		 
		 /* ------ STORE GETTERS ------ */


		getHouseByName(name: string): House {
			return this.$store.getters.houseByName(name);
		}

		updateHouse(house: House) {
		  return this.$store.dispatch('updateHouse', house)
        }

        setWinner(house: House){
          return this.$store.dispatch('setWinner', house)
        }

	  	get houses(): House[] {
		  return this.$store.getters.houses.sort((a: House, b: House) => b.score - a.score );
		}

		get updates() {
			return this.$store.getters.updates.sort((a: IUpdate, b: IUpdate) => b.timestamp.unix() - a.timestamp.unix());
		}

		get latestUpdate() {
			return this.$store.getters.latestUpdate;
		}

		get kingsLandingPosition(): IPoint {
			return this.$store.getters.kingsLandingPosition;
		}
	}
</script>

<style lang="scss">
  $map-width: calc(1280px * 1.115);
  .container {
    display: flex;

    .side-panel {
      padding: 20px;
      min-width: 360px;
      width: calc(100% - #{$map-width} - 40px);
      text-align: left;

      ul {
        list-style: none;

        li {
          padding: 5px;
        }
      }

      ul.updates {

      }
    }
  }
</style>
