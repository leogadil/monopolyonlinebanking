import React, { useContext, useEffect, useState } from "react"
import { createPlayerInformation } from "../types"
import axios from "axios"
import { socket } from "../socket"
import { PlayerContext } from "../context/playerContext"

interface CreatePlayerProps {
	setPlayer: (player: createPlayerInformation) => void
}

export const CreatePlayerComponent = (props: CreatePlayerProps) => {

	const { setPlayer } = props

	const { player } = useContext(PlayerContext)

	const [ playerName, setPlayerName ] = useState<string>("")

	const handleCreatePlayer = () => {
		axios.post(`${process.env.REACT_APP_BACKEND_URL}/player/create-new`, {
			playerName: playerName,
		})
		.then((response) => {
			socket.connect()
			socket.emit("link-player", response.data._id)
			setPlayer(response.data)
		})
		.catch((err) => {
			alert(err)
		})
	}
	
	return (
		<div>
			<div className="mt-10 flex flex-col gap-2">
				<div className="px-10">
					<label htmlFor="playerNameInput" className="text-white text-sm drop-shadow-xl">Player Name</label>
					<input 
						className="placeholder:opacity-50 p-4 py-2 mt-2 drop-shadow-xl rounded-md w-full bg-textWhite text-md" 
						type="text" 
						name="playerName" 
						id="playerNameInput" 
						placeholder="Enter your name"
						value={playerName}
						maxLength={10}
						onChange={(e) => setPlayerName(e.target.value)}
					/>
				</div>
				<div className="p-4 px-10">
					<button 
						className={`transition-all bg-bluer w-full p-3 rounded-md drop-shadow-xl ${playerName.length > 0 ? "cursor-pointer": "cursor-not-allowed grayscale"}`} 
						disabled={playerName.length === 0}
						onClick={handleCreatePlayer}
					>
						<h1 className="text-white text-sm">Enter</h1>
					</button>
				</div>
			</div>
		</div>
	)
}