import LHN from './Components/lhn'
import PageMessage from './Components/pageMessage'
import PageTicTacToe from './Components/pageTicTacToe'

ReactDOM.render(
	<React.Fragment>
		<LHN/>
		<PageMessage/>
		<PageTicTacToe/>
	</React.Fragment>,
	document.getElementById('root')
)