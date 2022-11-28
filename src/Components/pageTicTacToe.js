const { useState } = React;

export default function PageTicTacToe() {
  const [board, setBoard] = useState((new Array(9)).fill(null));

  return(
    <div class="page" id="pageTicTacToe">
      <span class="board-row">
        <button class="board-square"></button>
        <button class="board-square"></button>
        <button class="board-square"></button>
      </span>
      <span class="board-row">
        <button class="board-square"></button>
        <button class="board-square"></button>
        <button class="board-square"></button>
      </span>
      <span class="board-row">
        <button class="board-square"></button>
        <button class="board-square"></button>
        <button class="board-square"></button>
      </span>
    </div>
  )
}