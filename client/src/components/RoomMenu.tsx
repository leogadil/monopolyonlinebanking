import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { BiRefresh } from 'react-icons/bi';
import { RoomContext } from '../context/roomContext';
import { socket } from '../socket';
import { PlayerContext } from '../context/playerContext';

export const RoomMenuComponent = () => {

	const [ isCreateRoom, setIsCreateRoom ] = React.useState<boolean>(false);
	const [ rooms, setRooms ] = React.useState<any[]>([]);

	const getLobbies = async () => {
		try {
			const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/room/get-rooms`)
			setRooms(response.data)
			console.log(response.data)
		} catch (error) {
			console.log(error)
		}
	}

	const returnToRoomMenu = () => {
		setIsCreateRoom(false)
		getLobbies()
	}

	const refreshLobbies = () => {
		setRooms([])
		getLobbies()
	}

	useEffect(() => {
		getLobbies()

		function handleListChanged() {
			console.log("Room created")
			getLobbies()
		}

		socket.on("room-updated" , handleListChanged)

		return () => {
			socket.off("room-updated" , handleListChanged)
		}
	}, [])

	if(isCreateRoom) {
		return (
			<RoomCreateComponent returnToRoomMenu={() => returnToRoomMenu()} />
		)
	}

	return (
		<div className="flex flex-col items-center">
			<div className="p-3 px-6 mx-8 mt-6">
				<h1 className="text-white text-xl font-bold opacity-90">Room</h1>
			</div>
			<div className="flex justify-between w-full py-4 p-3 px-8 mx-4">
				<div className="flex flex-col justify-center items-center">
					<h1 className="text-white text-sm opacity-70">
						{rooms.length} {rooms.length > 1 ? "Lobbies": "Room"} Found
					</h1>
				</div>
				<div className="flex gap-2">
					<button 
						className="py-2 px-4 rounded-md drop-shadow-xl flex justify-center items-center"
						onClick={() => refreshLobbies()}
					>
						<BiRefresh className="text-textWhite" size={25} />
					</button>
					<button 
						className="bg-oranger text-white text-sm py-2 px-4 rounded-md drop-shadow-xl"
						onClick={() => setIsCreateRoom(true)}
					>
						New Room
					</button>
				</div>
			</div>
			<div className="w-full p-8 mx-4">
				{
					rooms.map((room, index) => {
						return (
							<RoomItem 
								key={index}
								RoomId={room._id}
								RoomName={room.name}
								RoomStatus={room.state}
								RoomPlayers={`${room.players.length} / 7`}
							/>
						)
					})
				}
			</div>
		</div>
	)
}

interface RoomCreateProps {
	returnToRoomMenu: () => void
}

export const RoomCreateComponent = (props: RoomCreateProps) => {

	const { returnToRoomMenu } = props

	const [ RoomName, setRoomName ] = React.useState<string>("")

	const { player } = useContext(PlayerContext)
	const { room, setRoom } = React.useContext(RoomContext)

	const handleCreateRoom = () => {
		//get player information from local storage
		const player = localStorage.getItem("Player")

		if(player) {
			const playerInformation = JSON.parse(player)
			axios.post(`${process.env.REACT_APP_BACKEND_URL}/room/create-new`, {
				roomName: RoomName,
				roomOwnerId: playerInformation._id,
			})
			.then((response) => {
				socket.emit('join-room', {
					roomId: response.data._id,
					playerId: playerInformation._id,
				})
			})
			.catch((error) => {
				console.log(error)
			})
		}
	}

	useEffect(() => {
		socket.on("room-joined", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		return () => {
			socket.off("room-joined")
		}
	}, [])

	return (
		<div className="flex flex-col items-center">
			<div className="p-3 px-6 mx-8 mt-6 flex flex-col">
				<h1 className="text-white text-xl font-bold opacity-90 text-center">Create A New Room</h1>
			</div>
			<div className="w-full p-3 px-8 mx-8">
				<label htmlFor="playerNameInput" className="text-white text-md drop-shadow-xl">Room Name</label>
				<input 
					className="placeholder:opacity-90 p-4 py-2 mt-2 drop-shadow-xl rounded-md w-full bg-textWhite text-md" 
					type="text" 
					name="RoomName" 
					id="RoomNameInput" 
					placeholder={`${player.name}'s Room`}
					value={RoomName}
					maxLength={10}
					onChange={(e) => setRoomName(e.target.value)}
				/>
			</div>
			<div className="w-full p-3 px-8 mx-8 flex gap-2">
				<button 
					className={`transition-all bg-redish w-full p-3 rounded-md drop-shadow-xl`} 
					onClick={returnToRoomMenu}
				>
					<h1 className="text-white text-sm">Cancel</h1>
				</button>
				<button 
					className={`transition-all bg-greener w-full p-3 rounded-md drop-shadow-xl`} 
					onClick={handleCreateRoom}
				>
					<h1 className="text-white text-sm">Create</h1>
				</button>
			</div>
		</div>
	)
}


interface RoomItemProps {
	RoomId: string,
	RoomName: string,
	RoomStatus: string,
	RoomPlayers: string,
}

const RoomItem = (props: RoomItemProps) => {

	const { RoomId, RoomName, RoomStatus, RoomPlayers } = props

	const { setRoom } = useContext(RoomContext)
	const { player } = useContext(PlayerContext)

	const handleJoinRoom = () => {
		socket.emit('join-room', {
			roomId: RoomId,
			playerId: player._id,
		})
	}

	useEffect(() => {
		socket.on("room-joined", (response: any) => {
			if(response.error) {
				alert(response.error)
			} else {
				localStorage.setItem("Room", JSON.stringify(response))
				setRoom(response)
			}
		})

		return () => {
			socket.off("room-joined")
		}
	}, [])

	const RoomState = () => {

		switch(RoomStatus) {
			case "IN LOBBY":
				return (
					<div className={`bg-textWhite p-3 py-0 rounded-md w-max flex items-center`}>
						<h1 className="text-sm font-bold text-blacks capitalize">IN LOBBY</h1>
					</div>
				)
			case "IN GAME":
				return (
					<div className={`bg-greener p-3 py-0 rounded-md w-max flex items-center`}>
						<h1 className="text-sm font-normal text-white capitalize">IN LOBBY</h1>
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
					<div className={`bg-textWhite p-3 py-0 rounded-md w-max flex items-center`}>
						<h1 className="text-sm font-bold text-blacks capitalize">IN LOBBY</h1>
					</div>
				)
		}
	}

	return (
		<div className="bg-anotheronebackground drop-shadow-xl rounded-md mb-1">
			<div className="flex justify-between items-center p-3">
				<div className="flex-1">
					<h1 className="text-white text-md` text-left font-bold">
						{RoomName}
					</h1>
				</div>
				<div className="px-2">
					<h1 className="text-white text-sm text-left">
						{RoomState()}
					</h1>
				</div>
				<div className="px-4">
					<h1 className="text-white text-sm opacity-70 text-left">
						{RoomPlayers}
					</h1>
				</div>
				<div className="flex gap-2">
					<button 
						className="bg-greener text-white text-sm py-2 px-4 rounded-md drop-shadow-xl"
						onClick={() => handleJoinRoom()}
					>
						Join
					</button>
				</div>
			</div>
		</div>
	)
}