import LoginLHN from './Components/loginLHN'
import PageHome from './Components/pageHome'
import PagePalia from './Components/pagePalia'
import PageMessage from './Components/pageMessage'
import PageTicTacToe from './Components/pageTicTacToe'

ReactDOM.render(
	<React.Fragment>
		<LoginLHN/>
		<PageHome/>
		<PagePalia/>
		<PageMessage/>
		<PageTicTacToe/>
	</React.Fragment>,
	document.getElementById('root')
)