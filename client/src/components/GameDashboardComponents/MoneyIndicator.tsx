import react, { useContext, useEffect, useState } from 'react';
import { GameContext } from '../../context/inGameContext';
import { PlayerContext } from '../../context/playerContext';



export const MoneyIndicator = () => {

	const [ showMoney, setShowMoney ] = useState<boolean>(false);
	const [ money, setMoney ] = useState<number>(0);
	const [ moneySymbol, setMoneySymbol ] = useState<string>("");
	const [ moneyText, setMoneyText ] = useState<string>("");
	const [ accurateMoneyText, setAccurateMoneyText ] = useState<string>("");

	const { game, setGame } = useContext(GameContext);
	const { player, setPlayer } = useContext(PlayerContext);

	const getMoney = () : number => {
		game.players.forEach((_player: any) => {
			if(_player._id === player._id) {
				setMoney(_player.money);
				getMoneyText();
				return _player.money;
			}
		})

		return 0;
	}

	const getAccurateMoneyText = () => {
		// add commas to money
		let moneyString = money.toString();
		let moneyArray = moneyString.split("");
		let commaIndex = moneyArray.length - 3;
		while(commaIndex > 0) {
			moneyArray.splice(commaIndex, 0, ",");
			commaIndex -= 3;
		}
		let formattedMoney = moneyArray.join("");
		setAccurateMoneyText(formattedMoney);
	}

	const getMoneyText = () => {
		// if money is less than 0, then return "You are bankrupt"
		// if money is 100,000 or more, then return 100k
		// if money is 1,000,000 or more, then return 1M
		// if money is 1,500,000 or more, then return 1.5M

		if(money < 0) {
			setMoneyText("You are bankrupt");
		} else if(money >= 1000000) {
			setMoneyText(` ${money / 1000000}`);
			setMoneySymbol("M");
		} else if(money >= 100000) {
			setMoneyText(` ${money / 1000}`);
			setMoneySymbol("k");
		} else {
			setMoneyText(` ${money}`);
		}
	}

	const getMoneySymbol = () => {
		if(money >= 1000000) {
			return (
				<div>
					<h1 className="rotate-180">₩</h1>
				</div>
			);
		} else if(money >= 100000) {
			return (
				<div>
					<h1>K</h1>
				</div>
			);
		} else {
			return "";
		}
	}

	const handleMoneyClick = () => {
		getAccurateMoneyText();
		setShowMoney(!showMoney);
	}

	useEffect(() => {
		getMoney();
	}, []);

	return (
		<div className="flex flex-col items-center flex-1">
			<button onClick={handleMoneyClick} className="w-full px-8 h-24 rounded-md drop-shadow-lg border border-zinc-800 bg-anotherbackground flex justify-start items-center">
				<h1 className="text-5xl font-bold text-yellowish flex">
					{
						showMoney ? (
							<h1 className="text-3xl">
								{accurateMoneyText}
							</ h1>
						) : <> {moneyText} {getMoneySymbol()} </>
					}
				</h1>
			</button>
		</div>
	)
}