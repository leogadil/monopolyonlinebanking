import { playerInformation } from "../types"

interface TopBarProps {
	player: playerInformation | null,
	handleChangeButton: () => void,
	isWebsocketConnected: boolean,
}

export const TopBarComponent = (props: TopBarProps) => {

	const { player, handleChangeButton, isWebsocketConnected } = props
	
	return (
		<div className="flex justify-between p-3 px-6 mx-4 rounded-md bg-anotherbackground drop-shadow-lg">
			<div className="flex gap-2">
				<h1 className="text-white text-xl font-bold drop-shadow-xl">
					Hello {player?.name}!
				</h1>
			</div>
			<div className="flex justify-center items-center">
				<button 
					className="opacity-70 text-textWhite text-sm drop-shadow-xl underline"
					onClick={handleChangeButton}
				>
					Change
				</button>
			</div>
		</div>
	)
}