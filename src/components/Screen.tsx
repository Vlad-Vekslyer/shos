import { useEffect } from "react"

export default function Screen(): JSX.Element {
	const hi = 5;

	useEffect(() => {
		let t = hi + 5;
		return
	}, [])

	return (
		<canvas height={500} width={500} />
	)
}