import LoginLHN from './Components/loginLHN'
import PageHome from './Components/pageHome'
import PageMessage from './Components/pageMessage'
import PageTicTacToe from './Components/pageTicTacToe'

ReactDOM.render(
	<React.Fragment>
		<LoginLHN/>
		<PageHome/>
		<PageMessage/>
		<PageTicTacToe/>
	</React.Fragment>,
	document.getElementById('root')
)