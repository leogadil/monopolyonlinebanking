import { useContext, useEffect, useState } from "react";
import { icons } from "../RoomLobby";
import { GameContext } from "../../context/inGameContext";
import { PlayerContext } from "../../context/playerContext";

export const AvatarIcon = () => {

	const [ avatar, setAvatar ] = useState<string>("none");

	const { game, setGame } = useContext(GameContext);
	const { player, setPlayer } = useContext(PlayerContext);

	const getAvatar = () : string => {
		game.players.forEach((_player: any) => {
			if(_player._id === player._id) {
				setAvatar(icons[_player.avatar]);
				return icons[_player.avatar];
			}
		})

		return "none";
	}

	useEffect(() => {
		getAvatar();
	}, []);



	return (
		<div className="flex flex-col items-center">
			<div className="w-24 h-24 rounded-md drop-shadow-lg border border-zinc-800 bg-anotherbackground flex justify-center items-center">
				<h1 className="text-4xl flex items-center justify-center">
					{avatar}
				</h1>
			</div>
		</div>
	)
}