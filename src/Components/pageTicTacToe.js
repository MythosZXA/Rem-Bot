const { useState, useEffect } = React;

export default function PageTicTacToe() {
  const [board, setBoard] = useState((new Array(9)).fill('.'));
	const [markerEle, setMarkerEle] = useState();
	const [listening, setListening] = useState(false);

	useEffect(() => {
		if (!listening) {
			const events = new EventSource('/events');

			events.onmessage = event => {
				const parsedData = JSON.parse(event.data);
				setBoard(parsedData);
			};

			events.onerror = event => {
				console.log('Rem is down. Connection lost');
				events.close();
			};

			setListening(true);
		}
	}, []);

	function resetBoard() {
		fetch('/ttt-reset', {
			method: 'POST'
		});
	}

	function selectSquare(numSquare) {
		if (!markerEle) return;
		
		fetch('/ttt', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				clicked: numSquare,
				marker: markerEle.innerText
			})
		});
	}

	function selectMarker(event) {
		// unselected previous marker
		if (markerEle) {
			markerEle.classList.toggle('selected');
		}
		// select new marker
		event.target.classList.toggle('selected');
		// update state
		setMarkerEle(event.target);
	}

  return(
    <div class="page-container" id="containerTicTacToe">
			<div class="page-ttt">
				<button class="form-button" onClick={resetBoard}>Reset</button>
				<div class="ttt-section">
					<button class="ttt-marker X" onClick={selectMarker}>X</button>
					<div class="ttt-board">
						<span>
							<button onClick={() => selectSquare(0)}>{board[0]}</button>
							<button onClick={() => selectSquare(1)}>{board[1]}</button>
							<button onClick={() => selectSquare(2)}>{board[2]}</button>
						</span>
						<span>
							<button onClick={() => selectSquare(3)}>{board[3]}</button>
							<button onClick={() => selectSquare(4)}>{board[4]}</button>
							<button onClick={() => selectSquare(5)}>{board[5]}</button>
						</span>
						<span>
							<button onClick={() => selectSquare(6)}>{board[6]}</button>
							<button onClick={() => selectSquare(7)}>{board[7]}</button>
							<button onClick={() => selectSquare(8)}>{board[8]}</button>
						</span>
					</div>
					<button class="ttt-marker O" onClick={selectMarker}>O</button>
				</div>
			</div>
    </div>
  )
}