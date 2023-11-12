import { useEffect, useState, useContext } from "react";
import { socket } from "../socket";
import { GameContext } from "../context/inGameContext";
import { BiLoaderCircle } from "react-icons/bi";
import { TopBarComponent } from "./GameDashboardComponents/TopBar";
import { PlayerContext } from "../context/playerContext";
import { AvatarIcon } from "./GameDashboardComponents/AvatarIcon";
import { MoneyIndicator } from "./GameDashboardComponents/MoneyIndicator";
import { MonopolyControls } from "./GameDashboardComponents/MonopolyControls";
import { CollectYourSalaryPopUp } from "./GameDashboardComponents/CollectYourSalary";

const loadingTexts = [
	"registering your bank account...",
	"loading your bank...",
	"testing your security...",
	"checking your account...",
	"adding illegal money...",
	"making you rich...",
	"making you poor...",
	"scamming you...",
	"stealing your money...",
	"making you bankrupt...",
	"bill gates is your father...",
	"elon musk is asking for money...",
]

export const GameDashboard = () => {

	const [ inGamePopUps, setInGamePopUps ] = useState<any[]>([]);
	const [ isLoading, setIsLoading ] = useState(true);
	const [ loadingText, setLoadingText ] = useState(loadingTexts[0]);

	const { game, setGame } = useContext(GameContext);
	const { player, setPlayer } = useContext(PlayerContext);

	useEffect(() => {
		socket.on("game-updated", (response: any) => {
			if(response.error) {
				console.log(response.error);
				return;
			} else {
				setGame(response);
			}
		});
	}, []);

	useEffect(() => {
		const isGameStarted = localStorage.getItem("isGameFirstStarted");

		let tout: any;
		let iout: any;

		// change loading text every .5 seconds
		if(isGameStarted === "true") {
			iout = setInterval(() => {
				setLoadingText(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
			}, 1000);
		}

		if(isGameStarted === "true") {
			tout = setTimeout(() => {
				localStorage.removeItem("isGameFirstStarted");
				setIsLoading(false);
			}, 5000);
		} else {
			setIsLoading(false);
		}

		return () => {
			clearTimeout(tout);
			clearInterval(iout);
		}
	}, []);

	if(isLoading) {
		return (
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 items-center">
				<BiLoaderCircle size={30} className="text-white animate-spin" />
				<h1 className="text-md text-center text-white">
					{loadingText}
				</h1>
			</div>
		)
	}

	return (
		<div>
			<TopBarComponent player={player} />
			<div className="flex m-3 mt-2 mb-2 gap-2">
				<MoneyIndicator />
				<AvatarIcon />
			</div>
			<MonopolyControls />

			{/* <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full h-full bg-black opacity-50"></div>
			<CollectYourSalaryPopUp name="Leo"/> */}
		</div>
	)
}