import react from 'react';

export const MonopolyControls = () => {

	return (
		<div className="m-3 mt-2 grid grid-cols-2 gap-3 py-3">
			{/* <ControlButton text="WIRE TRANSFER" /> */}
			<ControlButton text="COLLECT YOUR SALARY" />
			{/* <ControlButton text="Build" />
			<ControlButton text="Mortgage" /> */}
		</div>
	)
}

interface ControlButtonProps {
	text: string;
	hexColor?: string;
}

export const ControlButton = (props: ControlButtonProps) => {

	const { text, hexColor = "#ab1b4b" } = props;

	const [ color, setColor ] = react.useState<string>(hexColor);

	return (
		<button 
			className={`flex-1 flex flex-col gap-2 items-center justify-center h-40 rounded-md inner-shadow`}
			style={{
				backgroundColor: color
			}}
		>
			<div className="w-full flex items-center justify-center">
				<h1 className="text-6xl text-center">🏦</h1>
			</div>
			<h1 className="text-xl uppercase font-bold px-4 text-textWhite">{text}</h1>
		</button>
	)
}