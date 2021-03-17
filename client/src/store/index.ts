import Vue from 'vue';
import Vuex from 'vuex';
import House from '../models/House';
import {IPoint} from '../models/IPoint';
import moment from 'moment';
import axios from 'axios';
import {IUpdate} from "../models/IUpdate";
import { io } from "socket.io-client";

let serverApiURL = '';
let serverBaseURL = '';

if (process.env.VUE_APP_GITPOD_WORKSPACE_URL && process.env.VUE_APP_SERVER_PORT) {
    const appendPort = process.env.VUE_APP_SERVER_PORT + '-';
    const base = process.env.VUE_APP_GITPOD_WORKSPACE_URL;
	serverBaseURL = [base.slice(0, 8), appendPort, base.slice(8)].join('');
	serverApiURL = serverBaseURL + '/api'
} else {
	serverBaseURL =  'http://localhost:3000/';
	serverApiURL = serverBaseURL + 'api/'
}
const socket = io(serverBaseURL);
console.log('socket', socket)

Vue.use(Vuex);

export interface IStore {
	kingsLandingPosition: IPoint;
	winner: House | undefined;
	houses: House[];
	updates: IUpdate[];
}

export default new Vuex.Store({
	state: {
		kingsLandingPosition: {x: 260, y: 470},
		winner: undefined,
		houses: [],
		updates: []
	} as IStore,
	getters: {
		updates: (state) => state.updates,
		latestUpdate: (state) => state.updates[state.updates.length - 1] || null,
		houses: (state) => state.houses,
		houseByName: (state) => (houseName: string) => state.houses.find(house => house.name === houseName),
		kingsLandingPosition: (state) => state.kingsLandingPosition,
		winner: (state) => state.winner
	},
	mutations: {
		setHouses(state, houses) {
			state.houses = houses;
		},
		seWinner(state, house) {
			state.winner = house;
			axios.post(`${serverApiURL}/stop/updates`,{})
			window.alert(`The house ${house.name} is won`);
		},
		updateHouse(state, house) {
			const i = state.houses.findIndex(item => item.id === house.id);
			if (i > -1) {
				Vue.set(state.houses, i, house);
			}
		},
		createNewUpdate(state, update) {
			if (state.winner) {
				return;
			}
			update.timestamp = moment(update.timestamp)
			state.updates.push(update);
		}
	},
	actions: {
		initUpdates({commit, state}) {
			socket.on( 'message',(message) => {
				commit('createNewUpdate', message);
			})

		},
		async getHouses(context) {
			try {
				const response = await axios.get(serverApiURL)
				const houses: House[] = response.data['houses'].map((house: object) => new House(house));
				context.commit('setHouses', houses);
				return houses;
			} catch (e) {
				console.log('error', e);
			}
		},
		updateHouse(context, house) {
			context.commit('updateHouse', house);
		},
		setWinner(context, house) {
			context.commit('seWinner', house);
		},
	},
	modules: {},
});
