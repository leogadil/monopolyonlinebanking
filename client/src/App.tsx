import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { createPlayerInformation, playerInformation } from './types';
import { TopBarComponent } from './components/TopBar';
import { CreatePlayerComponent } from './components/CreatePlayer';
import { RoomMenuComponent } from './components/RoomMenu';
import { RoomContext } from './context/roomContext';
import axios from 'axios';
import { RoomLobbyComponent } from './components/RoomLobby';
import { PlayerContext } from './context/playerContext';
import { GameContext } from './context/inGameContext';
import { GameDashboard } from './components/GameDashboard';

function App() {
	const [ isWebsocketConnected, setIsWebsocketConnected ] = useState<boolean>(socket.connected);
	const [ player, setPlayer ] = React.useState<playerInformation | null>(null);
	const [ room, setRoom ] = useState<any>(null);
	const [ game, setGame ] = useState<any>(null);


	const handleSetPlayer = (player: createPlayerInformation) => {
		localStorage.setItem("Player", JSON.stringify({
			_id: player._id,
			name: player.name,
		}))
		setPlayer({
			_id: player._id,
			name: player.name,
		});
	}

	const handleChangePlayer = () => {
		axios.post(`${process.env.REACT_APP_BACKEND_URL}/player/delete-player`, {
			playerId: player?._id
		})
		.then(() => {
			localStorage.removeItem("Player");
			setPlayer(null);
			socket.disconnect();
		})
		.catch((err) => {
			alert(err);
		})
	}

	useEffect(() => {
		socket.on("connect", () => {
			const player = localStorage.getItem("Player");
			const playerInformation = JSON.parse(player!);

			const game = localStorage.getItem("Game");
			const gameInformation = JSON.parse(game!);

			const room = localStorage.getItem("Room");
			const roomInformation = JSON.parse(room!);

			if(!player) {
				return;
			}

			socket.emit("link-player", playerInformation?._id);
			setIsWebsocketConnected(true);

			if(player) {
				axios.post(`${process.env.REACT_APP_BACKEND_URL}/player/get-player`, {
					playerId: playerInformation?._id
				})
				.then((response) => {
					if(response.data.error === "Player not found") {
						alert("Player not found");
						localStorage.removeItem("Player");
						localStorage.removeItem("Room");
						localStorage.removeItem("Game");
						setPlayer(null);
					} else {
						localStorage.setItem("Player", JSON.stringify(response.data));
						setPlayer(response.data);
					}
				})
				.catch((err) => {
					alert(err);
				})
			}

			if(game) {
				axios.post(`${process.env.REACT_APP_BACKEND_URL}/game/get-game`, {
					gameId: gameInformation._id
				})
				.then((response) => {
					console.log(response.data);
	
					socket.emit("join-game", {
						gameId: gameInformation._id,
						playerId: playerInformation?._id,
					});
					localStorage.setItem("Game", JSON.stringify(response.data));
					setGame(response.data);
				})
				.catch((err) => {
					alert(err);
				})
			}

			if(room) {
				axios.post(`${process.env.REACT_APP_BACKEND_URL}/room/get-room`, {
					roomId: roomInformation._id
				})
				.then((response) => {
					console.log(response.data);
	
					socket.emit("join-room", {
						roomId: roomInformation._id,
						playerId: playerInformation?._id,
					});
					localStorage.setItem("Room", JSON.stringify(response.data));
					setRoom(response.data);
				})
				.catch((err) => {
					alert(err);
				})
			}
		})
	}, [])

	useEffect(() => {
		const handleVisibilityChange = () => {
			if(!document.hidden) {
				if(socket.connected) return;
				
				socket.connect();
			}
		}

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		}
	}, [])

	useEffect(() => {
		const player = localStorage.getItem("Player");
		const playerInformation = JSON.parse(player!);

		if(!player) {
			return;
		}

		axios.post(`${process.env.REACT_APP_BACKEND_URL}/player/get-player`, {
			playerId: playerInformation?._id
		})
		.then((response) => {
			if(response.data.error === "Player not found") {
				alert("Player not found");
				localStorage.removeItem("Player");
				localStorage.removeItem("Room");
				localStorage.removeItem("Game");
				setPlayer(null);
			} else {
				socket.connect();
				setPlayer(response.data);
			}
		})
		.catch((err) => {
			alert(err);
		})
	}, [])

	return (
		<PlayerContext.Provider value={{ player, setPlayer }}>
			<RoomContext.Provider value={{ room, setRoom }}>
				<GameContext.Provider value={{ game, setGame }}>
					<div className="m-auto max-w-lg">
						{
							(!game || !player) && (
								<div className="m-auto w-64 py-5">
									<img className="drop-shadow-xl" src="monopolyLogo.png" alt="Monopoly" />
								</div>
							)
						}
						{
							!player ?
							<CreatePlayerComponent setPlayer={handleSetPlayer} /> :
							room ? game ? <GameDashboard /> : <RoomLobbyComponent /> :
							<>
								<TopBarComponent 
									player={player} 
									handleChangeButton={handleChangePlayer} 
									isWebsocketConnected={isWebsocketConnected} 
								/>
								<RoomMenuComponent />
							</>
						}
					</div>
				</GameContext.Provider>
			</RoomContext.Provider>
		</PlayerContext.Provider>
	);
}

export default App;
