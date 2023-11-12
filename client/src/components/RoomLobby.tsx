import { useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import { RoomContext } from "../context/roomContext";
import { PlayerContext } from "../context/playerContext";
import { GameContext } from "../context/inGameContext";

export const icons: any = {
	'DOG': '🐶',
	'CAR': '🚘',
	'BOOT': '👢',
	'HAT': '🎩',
	'IRON': '🧳',
	'SHIP': '🚢',
	'HORSE': '🐴',
}

export const RoomLobbyComponent = () => {

	const [ isChangeAvatar, setIsChangeAvatar ] = useState<boolean>(false);
	const { room, setRoom } = useContext(RoomContext);
	const { player, setPlayer } = useContext(PlayerContext);
	const { setIsGameReady, game, setGame } = useContext(GameContext);
	const [ isReady, setIsReady ] = useState<boolean>(
		room.players.find((p: { _id: any; }) => p._id === player._id)?.ready || false
	);
	const [ canStart, setCanStart ] = useState<boolean>(false);

	const handleChangeAvatar = () => {
		setIsChangeAvatar(!isChangeAvatar);
	}

 	const LeaveRoom = (type = 1) => {
		// 1 = leave room, 2 = kicked from room, 3 = leave & delete room

		switch(type) {
			case 1:
				if(window.confirm("Leave the room?")) {
					socket.emit("leave-room", {
						roomId: room._id,
						playerId: player._id,
					});
				}
				break;
			case 2:
				socket.emit("leave-room", {
					roomId: room._id,
					playerId: player._id,
				});
				break;
			case 3:
				if(window.confirm("Leave and delete the room?")) {
					socket.emit("leave-room", {
						roomId: room._id,
						playerId: player._id,
					});
				}
				break;
		}
	}

	const KickAllPlayers = () => {
		// ask for confirmation first
		if(!window.confirm("Kick all players?")) return;

		socket.emit("kick-all-players", {
			roomId: room._id,
		});
	}

	const ToggleReady = () => {
		setIsReady(!isReady);
		socket.emit("toggle-ready", {
			roomId: room._id,
			playerId: player._id,
			isReady: !isReady,
		});
	}

	const StartGame = () => {
		socket.emit("start-game", {
			roomId: room._id,
		});
	}

	useEffect(() => {
		const handleVisibilityChange = () => {
			setIsReady(false);
		}

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		}
	}, [])

	useEffect(() => {
		if(room.players.length < 2) {
			setCanStart(false);
			return;
		}

		// check if all players are ready
		if(room.players.every((p: { ready: any; }) => p.ready)) {
			setCanStart(true);
		} else {
			setCanStart(false);
		}
	}, [room])

	useEffect(() => {
		socket.on("lobby-updated", (room: any) => {
			localStorage.setItem("Room", JSON.stringify(room));
			setRoom(room);
		})

		socket.on("avatar-changed", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		socket.on("room-left", (room: any) => {
			localStorage.removeItem("Room");
			setRoom(null);
		})

		socket.on("player-ready-toggled", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		socket.on("room-joined", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		socket.on("game-started", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				socket.emit("join-game", {
					roomId: room._id,
					playerId: player._id,
				});

				localStorage.setItem("isGameFirstStarted", "true");
				localStorage.setItem("Game", JSON.stringify(response))
				setGame(response)
			}
		})

		socket.on("kicked-from-room", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				console.log(response)
				LeaveRoom(response.type);
				alert("You have been kicked from the room")
			}
		})

		socket.on("kicked-all-players", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				alert("All players have been kicked from the room")
			}
		})

		socket.emit("room-deleted", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.removeItem("Room");
				setRoom(null);
				alert("Room has been deleted")
			}
		})

		return () => {
			socket.off("room-left");
			socket.off("lobby-updated");
			socket.off("avatar-changed");
			socket.off("player-ready-toggled");
			socket.off("room-joined");
			socket.off("game-started");
			socket.off("kicked-from-room");
			socket.off("kicked-all-players");
			socket.off("room-deleted");
		}
	}, [room])

	const RoomState = () => {

		switch(room.state) {
			case "IN LOBBY":
				return (
					<div className={`bg-textWhite p-3 py-0 rounded-md w-max flex items-center`}>
						<h1 className="text-sm font-bold text-blacks capitalize">IN LOBBY</h1>
					</div>
				)
			case "IN GAME":
				return (
					<div className={`bg-greener p-3 py-0 rounded-md w-max flex items-center`}>
						<h1 className="text-sm font-normal text-white capitalize">IN GAME</h1>
					</div>
				)
			case "ENDED":
				return (
					<div className={`bg-redish p-3 py-0 rounded-md w-max  flex items-center`}>
						<h1 className="text-sm font-normal text-white capitalize">ENDED</h1>
					</div>
				)
			default:
				return (
					<div className={`bg-textWhite p-3 py-0 rounded-md w-max  flex items-center`}>
						<h1 className="text-sm font-bold text-blacks capitalize">IN LOBBY</h1>
					</div>
				)
		}
	}

	if (isChangeAvatar) {
		return (
			<>
				<div className="p-4 px-10">
					<label htmlFor="playerAvatar" className="text-white text-md">Player Avatar</label>
					<AvatarSelector returnToRoomLobby={handleChangeAvatar} />
				</div>
			</>
		)
	}

	return (
		<div className="flex flex-col items-center">
			<div className="p-3 px-6 mx-8 mt-6 flex flex-col">
				<h1 className="text-white text-xl font-bold opacity-90 text-center">{room.name}</h1>
				<h1 className="text-white text-sm text-center opacity-60 mt-1 px-6">
					Do not leave the game, switch app or close this window or you might lose your progress.
				</h1>
				
			</div>
			<div className="flex flex-col items-center w-full p-3 px-10 mx-8">
				<div className="w-full">
					<div className="grid grid-cols-2 w-full">
						<div>
							<h1 className="font-bold text-white">Status</h1>
						</div>
						<div className="flex justify-end">
							{RoomState()}
						</div>
						<div>
							<h1 className="font-bold text-white">Players</h1>
						</div>
						<div className="text-right">
							<h1 className="font-normal text-white opacity-75">{room.players.length} / 7 Players</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="w-full px-10 py-3">
				<hr className="border-zinc-800" />
			</div>

			<div className="px-10 mx-8 flex flex-col gap-2 w-full">
				{
					room.players.map((_player: { _id: string; name: string; avatar: string; ready: boolean; playerState: string }) => {
						return (
							<div key={player._id} className="flex justify-between bg-anotherbackground p-3 px-4 rounded-md drop-shadow-xl border border-zinc-800">
								<div className="flex gap-2">
								<div className="flex items-center">
									<div className={`${ _player.playerState.toLowerCase() === "connected" ? "bg-green-500" : "bg-gray-500 opacity-50"} w-2 h-2 rounded-full drop-shadow-xl`} />
								</div>
									<div className="flex gap-1 items-center">
										<h1 className="text-white text-md">{ icons[_player.avatar] }</h1>
									</div>
									<div className="flex gap-1 items-center">
										<h1 className="text-white text-lg">{_player.name}</h1>
										{
											_player._id === room.owner &&
											<h1 className="text-white text-xs">👑</h1>
										}
										{
											_player._id === room.banker &&
											<h1 className="text-white text-xs">💰</h1>
										}
										{
											_player._id === player._id &&
											<h1 className="text-white text-xs opacity-25">(YOU)</h1>
										}
									</div>
								</div>
								<div className="flex gap-2">
									<div className={`${_player.ready ? "bg-greener" : "bg-redish"} p-2 py-0 rounded-md flex items-center`}>
										<h1 className="text-white text-xs">{_player.ready ? "READY" : "NOT READY"}</h1>
									</div>
								</div>
							</div>
						)
					})
				}
			</div>
			<div className="px-10 pt-3 mx-8 flex gap-2 w-full">
				<div className="flex gap-1">
					<h1 className="text-white text-xs">👑</h1>
					<h1 className="text-white text-xs opacity-50">HOST</h1>
				</div>
				<div className="flex gap-1">
					<h1 className="text-white text-xs">💰</h1>
					<h1 className="text-white text-xs opacity-50">BANKER</h1>
				</div>
			</div>

			<div className="w-full px-10 pt-3">
				<hr className="border-zinc-800" />
			</div>

			<div className="flex flex-col items-center w-full p-3 px-10 mx-8 gap-3 mt-3">
				<div className="flex gap-3 items-center w-full">
					<button className={`transition-all bg-oranger ${isReady && "grayscale opacity-50" } w-full p-3 rounded-md drop-shadow-xl`} onClick={() => ToggleReady()}>
						<h1 className="text-white text-md">
							{
								isReady ? "Unready" : "Ready"
							}
						</h1>
					</button>
					<button className="transition-all bg-bluemore w-full p-3 rounded-md drop-shadow-xl" onClick={() => handleChangeAvatar()}>
						<h1 className="text-white text-md">Change Avatar</h1>
					</button>
				</div>
				{
					room.owner === player._id && 
					<>
						<button disabled={!canStart} className={`${!canStart && "grayscale opacity-50"} transition-all bg-greener w-full p-3 rounded-md drop-shadow-xl`} onClick={() => StartGame()}>
							<h1 className="text-white text-md">
								{
									canStart ? "Start Game" : room.players.length < 2 ? "Waiting for 1 more player" : "Waiting for players to be ready"
								}
							</h1>
						</button>
					</>
					
				}
				{
					room.owner === player._id && 
					<>
						<button className="bg-redehh w-full p-3 mt-2 rounded-md drop-shadow-xl" onClick={KickAllPlayers}>
							<h1 className="text-white text-sm">Kick All Players</h1>
						</button>
					</>
				}
				<button className="bg-blacks w-full p-3 mt-2 rounded-md drop-shadow-xl border border-zinc-800" onClick={() => LeaveRoom(room.owner === player._id ? 3 : 1)}>
					<h1 className="text-white text-sm">
						{
							room.owner === player._id ? "Leave & Delete Room" : "Leave Room"
						}
					</h1>
				</button>
			</div>
		</div>
	)
}

type AvatarButtonProps = {
	avatar: string,
	handleAvatarClick: (avatar: string) => void
	isSelected: boolean
	isDisabled?: boolean
}

const AvatarButton = (props : AvatarButtonProps) => {
	const { avatar, handleAvatarClick, isSelected, isDisabled } = props

	return (
		<div className="w-full">
			<button disabled={isDisabled} className="w-full" onClick={() => handleAvatarClick(avatar)}>
				<div className={`w-full bg-anotherbackground ${isSelected ? "bg-oranger" : isDisabled && "opacity-25"} p-4 py-3 rounded-md flex gap-2 items-center justify-center`}>
					<h1 className={`text-2xl ${isSelected ? "font-bold" : "font-normal"} text-white`}>
						{ icons[avatar] }
					</h1>
					<h1 className={`text-md ${isSelected ? "font-bold" : "font-normal"} text-white`}>
						{ avatar }
					</h1>
				</div>
			</button>
		</div>
	);
}

interface AvatarSelectorProps {
	returnToRoomLobby: () => void	
}

const AvatarSelector = (props: AvatarSelectorProps) => {

	const { returnToRoomLobby } = props

	const { room, setRoom } = useContext(RoomContext)
	const { player } = useContext(PlayerContext)

	const [ avatarList, setAvatarList ] = useState<string[]>([
		'DOG',
		'CAR',
		'BOOT',
		'HAT',
		'IRON',
		'SHIP',
		'HORSE',
	])

	const [ selectedAvatar, setSelectedAvatar ] = useState<string | null>(player.avatar)
	const [ bufferAvatar, setBufferAvatar ] = useState<string | null>(null)
	const handleAvatarClick = (avatar: string) => {
		setBufferAvatar(avatar)
		socket.emit('change-avatar', {
			roomId: room._id,
			playerId: player._id,
			avatar: avatar,
		})
	}

	useEffect(() => {
		socket.on("avatar-changed", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				setSelectedAvatar(bufferAvatar)
				setBufferAvatar(null)
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		return () => {
			socket.off("avatar-changed")
		}
	}, [room])

	return (
		<>
			<div className="grid grid-cols-2 gap-2 mt-2">
				{
					avatarList.map((avatar, index) => {
						return (
							<AvatarButton 
								key={index}
								avatar={avatar}
								handleAvatarClick={handleAvatarClick}
								isSelected={room.players.find((p: { _id: any; }) => p._id === player._id)?.avatar === avatar}
								isDisabled={room.avaliableAvatars.indexOf(avatar) === -1}
							/>
						)
					})
				}
			</div>
			<div className="mt-6">
				<button className="bg-bluemore w-full p-3 mt-2 rounded-md drop-shadow-xl" onClick={returnToRoomLobby}>
					<h1 className="text-white text-sm">Okay</h1>
				</button>
			</div>
		</>
	)
}