const { useState, useEffect } = React;

export default function PageTicTacToe() {
  const [board, setBoard] = useState((new Array(9)).fill('.'));
	const [listening, setListening] = useState(false);

	useEffect(() => {
		if (!listening) {
			const events = new EventSource('/events');

			events.onmessage = event => {
				const parsedData = JSON.parse(event.data);
				console.log(parsedData)
				setBoard(parsedData);
			};

			setListening(true);
		}
	}, []);

	async function selectSquare(numSquare) {
		const response = await fetch('/ttt', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({clicked: numSquare})
		});
	}

  return(
    <div class="page-container" id="containerTicTacToe">
			<div class="page-ttt">
				<span class="board-row">
					<button class="board-square" onClick={() => selectSquare(0)}>{board[0]}</button>
					<button class="board-square" onClick={() => selectSquare(1)}>{board[1]}</button>
					<button class="board-square" onClick={() => selectSquare(2)}>{board[2]}</button>
				</span>
				<span class="board-row">
					<button class="board-square" onClick={() => selectSquare(3)}>{board[3]}</button>
					<button class="board-square" onClick={() => selectSquare(4)}>{board[4]}</button>
					<button class="board-square" onClick={() => selectSquare(5)}>{board[5]}</button>
				</span>
				<span class="board-row">
					<button class="board-square" onClick={() => selectSquare(6)}>{board[6]}</button>
					<button class="board-square" onClick={() => selectSquare(7)}>{board[7]}</button>
					<button class="board-square" onClick={() => selectSquare(8)}>{board[8]}</button>
				</span>
				<span class="board-select-row">
					<button class="board-select"></button>
					<button class="board-select"></button>
				</span>
			</div>
    </div>
  )
}