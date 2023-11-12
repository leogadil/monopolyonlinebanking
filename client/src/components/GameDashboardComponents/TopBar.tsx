
import React, { useContext } from 'react';
import { GameContext } from '../../context/inGameContext';

interface TopBarProps {
	player: any;
}

export const TopBarComponent = (props: TopBarProps) => {

	const { player } = props;

	const { game } = useContext(GameContext);

	return (
		<div className="p-3 px-9 m-3 mb-1.5 drop-shadow-lg rounded-md flex justify-between bg-anotherbackground border border-zinc-800">
			<div className="w-20 py-5 ">
				<img className="drop-shadow-xl" src="monopolyLogo.png" alt="Monopoly" />
			</div>
			<div className="flex flex-col justify-center items-end">
				<h1 className="text-textWhite text-md font-normal">
					Welcome <span className="text-redder font-bold">{player?.name}</span>
				</h1>
				<h1>
					{
						game.banker === player?._id ? (
							<h1 className="text-textWhite text-md font-normal opacity-50">
								(Banker)
							</h1>
						) : ""
					}
				</h1>
			</div>
		</div>
	)
}