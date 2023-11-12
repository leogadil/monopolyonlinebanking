import react from 'react';

interface CollectYourSalaryPopUpProps {
	name: string;
}

export const CollectYourSalaryPopUp = (props: CollectYourSalaryPopUpProps) => {

	const { name } = props;

	return (
		<>
			<div className="overflow-hidden rounded-md border border-zinc-800 bg-anotherbackground absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
				<div className="text-center p-2 pb-2 bg-black">
					<h1 className="text-textWhite font-bold text-md">INVOICE</h1>
				</div>
				<div className="p-3 py-5 pt-3 border border-zinc-800 border-x-0 flex flex-col gap-2">
					<h1 className="text-textWhite opacity-75 text-sm text-left">
						From: <span className="font-bold">{name}</span>
					</h1>
					<h1 className="text-textWhite opacity-75 text-sm text-left indent-9">
						Dear <span className="text-bluer font-bold">BANKER</span>, I have passed GO. Please pay me <span className="text-yellowish font-bold">200k</span>.
					</h1>
				</div>
				<div className="flex gap-2 p-2">
					<button className="inner-shadow w-full h-10 rounded-md bg-greener text-textWhite font-bold text-md">
						<h1 className="text-center">ACCEPT</h1>
					</button>
					<button className="inner-shadow w-full h-10 rounded-md bg-redder text-textWhite font-bold text-md">
						<h1 className="text-center">DECLINE</h1>
					</button>
				</div>
			</div>
		</>
	)
}