const { useEffect } = React;
import io from 'socket.io-client'

export default function PageCard() {
	useEffect(() => {
		const socket = io();

		// socket.on()

		return () => {
			socket.disconnect();
			console.log('card page unmounted')
		}
	}, [])

	return(
		<div class="page-container active" id="containerCard">
			
		</div>
	)
}